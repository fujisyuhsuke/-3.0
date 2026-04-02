<template>
  <div class="flex flex-col h-full bg-white overflow-hidden relative">
    <!-- Top Header -->
    <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white z-10">
      <div class="flex items-center gap-4">
        <button 
          @click="handleBack" 
          class="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
        >
          <ArrowLeft :size="20" />
        </button>
        <div>
          <h2 class="text-lg font-bold text-gray-800">无人机降落报告</h2>
          <div class="flex items-center gap-2 mt-0.5">
            <span class="text-[10px] px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded font-bold uppercase">
              步骤 {{ currentStep }}/2：{{ stepTitles[currentStep-1] }}
            </span>
          </div>
        </div>
      </div>
      <div v-if="selectedTakeoff" class="flex items-center gap-2 px-3 py-1 bg-gray-50 rounded-full border border-gray-100">
        <span class="text-[10px] text-gray-400 font-mono">关联起飞单: {{ selectedTakeoff.id }}</span>
      </div>
    </div>

    <!-- Step 1: Takeoff Record Selection -->
    <div v-if="currentStep === 1" class="flex-1 overflow-y-auto p-8 scrollbar-thin bg-gray-50/50">
      <div class="max-w-4xl mx-auto">
        <div class="mb-8">
          <h3 class="text-xl font-bold text-gray-800">请选择要提交降落报告的飞行活动</h3>
          <p class="text-sm text-gray-500 mt-1">降落报告必须关联已完成的起飞确认申请，系统将自动同步飞行计划及空域信息。</p>
        </div>

        <!-- Empty State -->
        <div v-if="awaitingFlights.length === 0" class="py-20 text-center bg-white rounded-3xl border-2 border-dashed border-gray-100">
          <div class="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mx-auto mb-4">
            <Navigation :size="32" class="opacity-20" />
          </div>
          <p class="text-gray-500 font-medium">暂无待报告的飞行活动</p>
          <p class="text-xs text-gray-400 mt-2">所有飞行活动已完成报告或尚未起飞。请先完成起飞确认后再进行降落报告。</p>
        </div>

        <!-- Flight List -->
        <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div 
            v-for="flight in awaitingFlights" 
            :key="flight.takeoff_confirm_id"
            @click="selectTakeoff(flight)"
            class="group bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-emerald-500 cursor-pointer transition-all relative overflow-hidden"
          >
            <!-- Timeout Badge -->
            <div v-if="isTimeout(flight)" class="absolute top-0 right-0 px-3 py-1 bg-red-50 text-red-600 text-[10px] font-bold rounded-bl-xl border-l border-b border-red-100">
              已超计划降落时间
            </div>

            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center gap-2">
                <div class="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600">
                  <PlaneTakeoff :size="18" />
                </div>
                <span class="text-[10px] font-mono text-gray-400">{{ flight.takeoff_confirm_id }}</span>
              </div>
              <span class="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] font-bold rounded uppercase">已起飞</span>
            </div>

            <h4 class="text-lg font-bold text-gray-800 mb-1 group-hover:text-emerald-600 transition-colors">{{ flight.flight_purpose }}</h4>
            <div class="space-y-2 mt-4">
              <div class="flex items-center gap-2 text-xs text-gray-500">
                <MapPin :size="14" class="text-gray-300" />
                <span class="truncate">{{ flight.airspace }}</span>
              </div>
              <div class="flex items-center gap-2 text-xs text-gray-500">
                <Clock :size="14" class="text-gray-300" />
                {{ formatTime(flight.takeoff_time) }}
              </div>
            </div>

            <div class="mt-6 pt-4 border-t border-gray-50 flex items-center justify-between">
              <span class="text-[10px] text-emerald-600 font-bold">计划时长: {{ flight.flight_duration_plan }}</span>
              <div class="flex items-center text-xs font-bold text-emerald-600 opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0">
                选择此记录 <ArrowRight :size="14" class="ml-1" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Step 2: Landing Report Form -->
    <div v-else-if="currentStep === 2 && selectedTakeoff" class="flex-1 overflow-y-auto p-8 scrollbar-thin">
      <div class="max-w-3xl mx-auto space-y-10">
        <!-- Sync Info Summary (Read-only) -->
        <section>
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-sm font-bold text-gray-400 uppercase tracking-widest">飞行信息摘要 (同步自起飞确认)</h3>
            <div class="text-[10px] text-amber-600 flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg font-bold">
              <Lock :size="10" />
              同步自前置单据，不可修改
            </div>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <p class="text-[10px] font-bold text-gray-400 uppercase mb-1">实际起飞时间</p>
              <p class="text-sm font-bold text-gray-700">{{ formatTime(selectedTakeoff.takeoff_time) }}</p>
            </div>
            <div class="p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <p class="text-[10px] font-bold text-gray-400 uppercase mb-1">获批空域</p>
              <p class="text-sm font-bold text-gray-700 truncate">{{ selectedTakeoff.airspace }}</p>
            </div>
            <div class="p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <p class="text-[10px] font-bold text-gray-400 uppercase mb-1">责任飞手</p>
              <p class="text-sm font-bold text-gray-700">{{ selectedTakeoff.takeoffRecord.formData.actualPilot || selectedTakeoff.takeoffRecord.formData.pilotName }}</p>
            </div>
            <div class="p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <p class="text-[10px] font-bold text-gray-400 uppercase mb-1">无人机型号</p>
              <p class="text-sm font-bold text-gray-700">{{ selectedTakeoff.takeoffRecord.formData.uavModel }}</p>
            </div>
          </div>
        </section>

        <!-- Landing Details Form -->
        <section class="space-y-6">
          <h3 class="text-sm font-bold text-gray-400 uppercase tracking-widest">降落填报事项</h3>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-2">
              <label class="block text-xs font-bold text-gray-700 flex items-center gap-1">
                <Clock :size="14" class="text-emerald-600" />
                实际降落时间 <span class="text-red-500">*</span>
              </label>
              <input 
                type="datetime-local" 
                v-model="formData.actualLandingTime"
                class="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
              />
            </div>

            <div class="space-y-2">
              <label class="block text-xs font-bold text-gray-700 flex items-center gap-1">
                <Target :size="14" class="text-emerald-600" />
                任务完成情况 <span class="text-red-500">*</span>
              </label>
              <select 
                v-model="formData.missionStatus"
                class="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all appearance-none"
              >
                <option value="completed">按计划圆满完成</option>
                <option value="partially-completed">部分完成任务</option>
                <option value="aborted">任务中止/未完成</option>
              </select>
            </div>

            <div class="col-span-2 space-y-2">
              <label class="block text-xs font-bold text-gray-700 flex items-center gap-1">
                <AlertTriangle :size="14" class="text-amber-500" />
                飞行过程异常事项
              </label>
              <textarea 
                v-model="formData.abnormalEvents"
                rows="3"
                class="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                placeholder="如无异常请填写“无”。若有链路丢失、电量异常、空域侵入等请如实记录。"
              ></textarea>
            </div>
          </div>
        </section>

        <!-- Safety Declaration -->
        <div class="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex gap-3">
          <div class="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-emerald-600 shrink-0">
            <ShieldCheck :size="18" />
          </div>
          <p class="text-[10px] text-emerald-700 leading-relaxed">
            <strong>诚信填报声明：</strong> 本人承诺以上填报内容真实有效。系统将记录本次飞行轨迹及高度数据，若发现违规飞行或虚假填报，将影响后续飞行申请信用评级。
          </p>
        </div>

        <div class="pt-4 pb-12">
          <button 
            @click="handleSubmit"
            :disabled="!isFormValid"
            :class="['w-full py-4 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg', 
              isFormValid ? 'bg-emerald-700 text-white hover:bg-emerald-800 shadow-emerald-100' : 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none']"
          >
            <span>提交降落报告</span>
            <CheckCircle :size="18" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { 
  ArrowLeft, ArrowRight, Navigation, PlaneTakeoff, MapPin, 
  Clock, Target, AlertTriangle, CheckCircle, ShieldCheck, Lock 
} from 'lucide-vue-next';
import { FlightApplication, UserType } from '../types';
import { getFlightsAwaitingLandingReport } from '../services/flightTools';

const props = defineProps<{
  applications: FlightApplication[];
  userType: UserType;
  initialTakeoffRecord?: FlightApplication;
}>();

const emit = defineEmits(['back', 'submit']);

const currentStep = ref(1);
const stepTitles = ['关联起飞记录', '填写降落报告'];
const selectedTakeoff = ref<any>(null);

const formData = ref({
  actualLandingTime: '',
  missionStatus: 'completed',
  abnormalEvents: '无'
});

const awaitingFlights = computed(() => {
  return getFlightsAwaitingLandingReport(props.applications, props.userType).awaiting_flights;
});

onMounted(() => {
  // Set default landing time to now
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;
  const localISOTime = new Date(now.getTime() - offset).toISOString().slice(0, 16);
  formData.value.actualLandingTime = localISOTime;

  // If initial record provided (from records list), auto-select it
  if (props.initialTakeoffRecord) {
    const flight = awaitingFlights.value.find(f => f.takeoff_confirm_id === props.initialTakeoffRecord?.id);
    if (flight) {
      selectTakeoff(flight);
    }
  }
});

const isFormValid = computed(() => {
  return !!formData.value.actualLandingTime && !!formData.value.missionStatus;
});

const isTimeout = (flight: any) => {
  const takeoffTime = new Date(flight.takeoff_time).getTime();
  const plannedDurationMs = flight.planned_duration_minutes * 60 * 1000;
  const expectedLandingTime = takeoffTime + plannedDurationMs;
  return Date.now() > expectedLandingTime;
};

const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const selectTakeoff = (flight: any) => {
  selectedTakeoff.value = flight;
  currentStep.value = 2;
};

const handleBack = () => {
  if (currentStep.value === 2 && !props.initialTakeoffRecord) {
    currentStep.value = 1;
    selectedTakeoff.value = null;
  } else {
    emit('back');
  }
};

const handleSubmit = () => {
  if (isFormValid.value && selectedTakeoff.value) {
    emit('submit', {
      ...formData.value,
      takeoffRecord: selectedTakeoff.value.takeoffRecord,
      originalApp: selectedTakeoff.value.originalApp
    });
  }
};
</script>

<style scoped>
.scrollbar-thin::-webkit-scrollbar {
  width: 4px;
}
.scrollbar-thin::-webkit-scrollbar-track {
  background: transparent;
}
.scrollbar-thin::-webkit-scrollbar-thumb {
  background: #e5e7eb;
  border-radius: 10px;
}
</style>
