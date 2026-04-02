<template>
  <div class="flex flex-col h-full bg-white overflow-hidden relative">
    <!-- Top Header -->
    <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white z-10">
      <div class="flex items-center gap-4">
        <button 
          @click="$emit('back')" 
          class="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
        >
          <ArrowLeft :size="20" />
        </button>
        <div>
          <h2 class="text-lg font-bold text-gray-800">无人机起飞确认</h2>
          <div class="flex items-center gap-2 mt-0.5">
            <span class="text-[10px] px-1.5 py-0.5 bg-indigo-100 text-indigo-700 rounded font-bold uppercase">
              步骤 {{ currentStep }}/3：{{ stepTitles[currentStep-1] }}
            </span>
          </div>
        </div>
      </div>
      <div v-if="selectedApp" class="flex items-center gap-2 px-3 py-1 bg-gray-50 rounded-full border border-gray-100">
        <span class="text-[10px] text-gray-400 font-mono">关联申请: {{ selectedApp.id }}</span>
      </div>
    </div>

    <!-- Step 1: Application Selection -->
    <div v-if="currentStep === 1" class="flex-1 overflow-y-auto p-8 scrollbar-thin bg-gray-50/50">
      <div class="max-w-4xl mx-auto">
        <div class="mb-8">
          <h3 class="text-xl font-bold text-gray-800">请选择要确认的飞行活动申请</h3>
          <p class="text-sm text-gray-500 mt-1">起飞确认必须依附于已获批的申请，系统将自动同步获批信息。</p>
        </div>

        <div v-if="approvedApps.length === 0" class="py-20 text-center bg-white rounded-3xl border-2 border-dashed border-gray-100">
          <div class="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mx-auto mb-4">
            <FileText :size="32" />
          </div>
          <p class="text-gray-500 font-medium">您暂无已获批的飞行活动申请</p>
          <button @click="$emit('request-apply')" class="mt-4 text-blue-600 font-bold text-sm hover:underline">立即去申请飞行活动</button>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div 
            v-for="app in approvedApps" 
            :key="app.id"
            @click="selectApplication(app)"
            class="group bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-blue-500 cursor-pointer transition-all relative overflow-hidden"
          >
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center gap-2">
                <div class="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                  <ClipboardCheck :size="18" />
                </div>
                <span class="text-[10px] font-mono text-gray-400">{{ app.id }}</span>
              </div>
              <span class="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded uppercase">已获批</span>
            </div>

            <h4 class="text-lg font-bold text-gray-800 mb-1 group-hover:text-blue-600 transition-colors">{{ app.formData.flightPurpose }}</h4>
            <div class="space-y-2 mt-4">
              <div class="flex items-center gap-2 text-xs text-gray-500">
                <MapPin :size="14" class="text-gray-300" />
                {{ app.locationInfo.address }}
              </div>
              <div class="flex items-center gap-2 text-xs text-gray-500">
                <Clock :size="14" class="text-gray-300" />
                {{ app.formData.flightDate }} {{ app.formData.takeoffTime }}
              </div>
            </div>

            <div class="mt-6 pt-4 border-t border-gray-50 flex items-center justify-between">
              <span class="text-[10px] text-blue-600 font-bold">{{ app.locationInfo.fss.name }}</span>
              <div class="flex items-center text-xs font-bold text-blue-600 opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0">
                选择此申请 <ArrowRight :size="14" class="ml-1" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Step 2: Sync Info & Form Filling -->
    <div v-else-if="currentStep === 2 && selectedApp" class="flex-1 overflow-y-auto p-8 scrollbar-thin">
      <div class="max-w-3xl mx-auto space-y-10">
        <!-- Sync Info (Read-only) -->
        <section>
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-sm font-bold text-gray-400 uppercase tracking-widest">获批方案摘要 (只读)</h3>
            <div class="text-[10px] text-amber-600 flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg font-bold">
              <Lock :size="10" />
              同步自获批计划，不可修改
            </div>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <p class="text-[10px] font-bold text-gray-400 uppercase mb-1">飞行空域</p>
              <p class="text-sm font-bold text-gray-700">{{ selectedApp.formData.airspaceDescription || '获批指定空域' }}</p>
              <p class="text-[10px] text-gray-500 mt-1">高度: {{ selectedApp.formData.flightHeight }}m | 半径: {{ selectedApp.formData.flightRadius }}m</p>
            </div>
            <div class="p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <p class="text-[10px] font-bold text-gray-400 uppercase mb-1">计划时间</p>
              <p class="text-sm font-bold text-gray-700">{{ selectedApp.formData.flightDate }} {{ selectedApp.formData.takeoffTime }}</p>
              <p class="text-[10px] text-gray-500 mt-1">预计时长: {{ selectedApp.formData.flightDuration }}分钟</p>
            </div>
            <div class="p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <p class="text-[10px] font-bold text-gray-400 uppercase mb-1">责任飞手</p>
              <p class="text-sm font-bold text-gray-700">{{ selectedApp.formData.pilotName }}</p>
              <p class="text-[10px] text-gray-500 mt-1">电话: {{ selectedApp.formData.pilotPhone }}</p>
            </div>
            <div class="p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <p class="text-[10px] font-bold text-gray-400 uppercase mb-1">无人机信息</p>
              <p class="text-sm font-bold text-gray-700">{{ selectedApp.formData.uavModel }}</p>
              <p class="text-[10px] text-gray-500 mt-1">编号: {{ selectedApp.formData.uavNumber }}</p>
            </div>
          </div>
        </section>

        <!-- Confirmation Form (User Input) -->
        <section class="space-y-6">
          <h3 class="text-sm font-bold text-gray-400 uppercase tracking-widest">起飞前确认事项</h3>
          
          <div class="space-y-4">
            <div class="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl hover:border-blue-200 transition-all">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                  <ShieldCheck :size="20" />
                </div>
                <div>
                  <p class="text-sm font-bold text-gray-800">设备核验</p>
                  <p class="text-[10px] text-gray-500">确认电池、桨叶、链路等状态正常</p>
                </div>
              </div>
              <button 
                @click="confirmData.equipmentChecked = !confirmData.equipmentChecked"
                :class="['w-12 h-6 rounded-full relative transition-all duration-300', confirmData.equipmentChecked ? 'bg-emerald-500' : 'bg-gray-200']"
              >
                <div :class="['absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300', confirmData.equipmentChecked ? 'left-7' : 'left-1']"></div>
              </button>
            </div>

            <div class="p-4 bg-white border border-gray-100 rounded-2xl">
              <label class="block text-xs font-bold text-gray-700 mb-2">机组人员确认</label>
              <div class="flex items-center gap-3">
                <input 
                  type="text" 
                  v-model="confirmData.actualPilot" 
                  class="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="请输入实际执飞人员姓名"
                />
                <button 
                  @click="confirmData.actualPilot = selectedApp.formData.pilotName"
                  class="text-[10px] text-blue-600 font-bold hover:underline"
                >
                  同申请飞手
                </button>
              </div>
            </div>

            <div class="p-4 bg-white border border-gray-100 rounded-2xl">
              <label class="block text-xs font-bold text-gray-700 mb-2">现场环境确认</label>
              <textarea 
                v-model="confirmData.environmentNote" 
                rows="2" 
                class="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="请描述现场天气、场地及周边障碍物情况"
              ></textarea>
            </div>
          </div>
        </section>

        <div class="pt-4 pb-12">
          <button 
            @click="currentStep = 3"
            :disabled="!isFormValid"
            :class="['w-full py-4 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg', 
              isFormValid ? 'bg-blue-700 text-white hover:bg-blue-800 shadow-blue-100' : 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none']"
          >
            <span>下一步：确认实际起飞位置</span>
            <ArrowRight :size="18" />
          </button>
        </div>
      </div>
    </div>

    <!-- Step 3: Map Selection & Routing -->
    <div v-else-if="currentStep === 3 && selectedApp" class="flex-1 flex flex-col md:flex-row overflow-hidden">
      <!-- Map Area -->
      <div class="flex-1 relative bg-gray-50 border-r border-gray-100">
        <div class="absolute top-6 left-6 z-10 space-y-3">
          <div class="bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-white/50 max-w-xs">
            <h3 class="font-bold text-gray-800 flex items-center gap-2">
              <MapPin :size="18" class="text-blue-600" />
              标记实际起飞坐标
            </h3>
            <p class="text-[10px] text-gray-500 mt-1 leading-relaxed">
              请在地图上点击您的实际起飞位置。系统将实时校验该点位是否在获批空域范围内。
            </p>
          </div>

          <!-- Validation Alert -->
          <div v-if="actualLocation" :class="['p-3 rounded-xl shadow-lg border animate-in slide-in-from-left-4', locationStatus === 'valid' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-red-50 border-red-100 text-red-700']">
            <div class="flex items-center gap-2 font-bold text-xs">
              <component :is="locationStatus === 'valid' ? CheckCircle : AlertTriangle" :size="14" />
              {{ locationStatus === 'valid' ? '起飞点校验通过' : '实际起飞点超出获批空域' }}
            </div>
            <p class="text-[10px] mt-1 opacity-80">
              {{ locationStatus === 'valid' ? '点位符合获批空域要求，可继续提交。' : '请重新选择点位，或先申请空域变更。' }}
            </p>
          </div>
        </div>

        <!-- Simulated Map -->
        <div class="w-full h-full relative overflow-hidden bg-[#f8fafc] cursor-crosshair" @click="handleMapClick">
          <svg width="100%" height="100%" class="absolute inset-0">
            <defs>
              <pattern id="grid-takeoff" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e2e8f0" stroke-width="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid-takeoff)" />
            
            <!-- Approved Area (The Fence) -->
            <circle 
              :cx="selectedApp.locationInfo.coordinate.lng" 
              :cy="selectedApp.locationInfo.coordinate.lat" 
              :r="selectedApp.formData.flightRadius / 5" 
              fill="#3b82f6" 
              fill-opacity="0.1" 
              stroke="#3b82f6" 
              stroke-width="1" 
              stroke-dasharray="4" 
            />
            <text 
              :x="selectedApp.locationInfo.coordinate.lng - 40" 
              :y="selectedApp.locationInfo.coordinate.lat - (selectedApp.formData.flightRadius / 5) - 10" 
              fill="#3b82f6" 
              font-size="10" 
              font-weight="bold" 
              class="pointer-events-none"
            >获批空域范围</text>
          </svg>

          <!-- Original Planned Point -->
          <div 
            class="absolute -translate-x-1/2 -translate-y-1/2 opacity-40"
            :style="{ left: `${selectedApp.locationInfo.coordinate.lng}px`, top: `${selectedApp.locationInfo.coordinate.lat}px` }"
          >
            <div class="w-4 h-4 bg-gray-400 rounded-full border-2 border-white shadow-sm"></div>
            <span class="absolute top-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[8px] font-bold text-gray-400">计划起飞点</span>
          </div>

          <!-- Actual Selection Marker -->
          <div 
            v-if="actualLocation"
            class="absolute -translate-x-1/2 -translate-y-full transition-all duration-300 z-20"
            :style="{ left: `${actualLocation.lng}px`, top: `${actualLocation.lat}px` }"
          >
            <div :class="['p-2 rounded-full shadow-xl border-2 animate-bounce', locationStatus === 'valid' ? 'bg-blue-600 border-white' : 'bg-red-600 border-white']">
              <Navigation :size="20" class="text-white" />
            </div>
            <div class="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-2 h-2 bg-white rotate-45 border-r border-b border-gray-200"></div>
          </div>
        </div>
      </div>

      <!-- Right Panel: Final Review & Routing -->
      <div class="w-full md:w-80 flex flex-col bg-white">
        <div class="p-6 border-b border-gray-100">
          <h3 class="font-bold text-gray-800">路由判定与提交</h3>
        </div>

        <div class="flex-1 p-6 space-y-6 overflow-y-auto scrollbar-thin">
          <div v-if="!actualLocation" class="h-full flex flex-col items-center justify-center text-center py-12">
            <div class="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-4">
              <Map :size="32" />
            </div>
            <p class="text-sm font-bold text-gray-400">请在地图上标记<br/>实际起飞坐标</p>
          </div>

          <div v-else class="space-y-6 animate-in fade-in duration-500">
            <!-- Routing Result -->
            <div class="p-4 rounded-2xl bg-gray-50 border border-gray-100">
              <p class="text-[10px] font-bold text-gray-400 uppercase mb-3">系统路由判定</p>
              
              <div class="flex items-center gap-3">
                <div :class="['w-10 h-10 rounded-xl flex items-center justify-center', targetFSS?.type === 'city' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600']">
                  <component :is="targetFSS?.type === 'city' ? ExternalLink : CheckCircle" :size="20" />
                </div>
                <div>
                  <p class="text-sm font-bold text-gray-800">{{ targetFSS?.name }}</p>
                  <p class="text-[10px] text-gray-500">{{ targetFSS?.type === 'city' ? '市级飞服站系统' : '省直管飞服系统' }}</p>
                </div>
              </div>

              <div v-if="targetFSS?.type === 'city'" class="mt-4 p-3 bg-amber-100/50 rounded-xl text-[10px] text-amber-800 leading-relaxed">
                <strong>注意：</strong> 检测到起飞坐标属于市级管辖区，点击提交后将跳转至对应市级系统完成最终确认。
              </div>
              <div v-else class="mt-4 p-3 bg-blue-100/50 rounded-xl text-[10px] text-blue-800 leading-relaxed">
                <strong>提示：</strong> 该区域由省飞服站直管，您可以在本门户内直接完成起飞确认。
              </div>
            </div>

            <!-- Summary -->
            <div class="space-y-3">
              <div class="flex justify-between text-xs">
                <span class="text-gray-500">设备核验</span>
                <span class="font-bold text-emerald-600">已通过</span>
              </div>
              <div class="flex justify-between text-xs">
                <span class="text-gray-500">执飞人员</span>
                <span class="font-bold text-gray-800">{{ confirmData.actualPilot }}</span>
              </div>
              <div class="flex justify-between text-xs">
                <span class="text-gray-500">坐标合规性</span>
                <span :class="['font-bold', locationStatus === 'valid' ? 'text-emerald-600' : 'text-red-600']">
                  {{ locationStatus === 'valid' ? '符合' : '不符合' }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div class="p-6 border-t border-gray-100">
          <button 
            @click="handleFinalSubmit"
            :disabled="!actualLocation || locationStatus === 'invalid'"
            :class="['w-full py-4 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg', 
              actualLocation && locationStatus === 'valid' ? 'bg-blue-700 text-white hover:bg-blue-800 shadow-blue-100' : 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none']"
          >
            <span v-if="targetFSS?.type === 'city'">跳转并提交</span>
            <span v-else>确认起飞</span>
            <ArrowRight :size="18" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { 
  ArrowLeft, ArrowRight, FileText, ClipboardCheck, MapPin, Clock, 
  ShieldCheck, Lock, CheckCircle, AlertTriangle, Navigation, Map, 
  ExternalLink, User, Smartphone 
} from 'lucide-vue-next';
import { FlightApplication, UserType, LocationSelection, Coordinate, FSSInfo } from '../types';

const props = defineProps<{
  applications: FlightApplication[];
  userType: UserType;
}>();

const emit = defineEmits(['back', 'submit', 'request-apply', 'redirect']);

const currentStep = ref(1);
const stepTitles = ['关联获批申请', '填报确认信息', '确认起飞位置'];

const selectedApp = ref<FlightApplication | null>(null);
const actualLocation = ref<Coordinate | null>(null);
const targetFSS = ref<FSSInfo | null>(null);

const confirmData = ref({
  equipmentChecked: false,
  actualPilot: '',
  environmentNote: ''
});

// Filter approved apps
const approvedApps = computed(() => {
  return props.applications.filter(app => {
    const isApproved = app.status === 'approved';
    const isApply = app.businessType === 'uav-apply';
    // Remove strict userType/applicationType check to unify logic
    return isApproved && isApply;
  });
});

const isFormValid = computed(() => {
  return confirmData.value.equipmentChecked && !!confirmData.value.actualPilot;
});

const locationStatus = computed(() => {
  if (!actualLocation.value || !selectedApp.value) return 'none';
  
  const planned = selectedApp.value.locationInfo.coordinate;
  const actual = actualLocation.value;
  const radius = selectedApp.value.formData.flightRadius / 5; // Simplified scale for mock map
  
  const dist = Math.sqrt(Math.pow(actual.lng - planned.lng, 2) + Math.pow(actual.lat - planned.lat, 2));
  return dist <= radius ? 'valid' : 'invalid';
});

const selectApplication = (app: FlightApplication) => {
  selectedApp.value = app;
  targetFSS.value = app.locationInfo.fss;
  confirmData.value.actualPilot = app.formData.pilotName;
  currentStep.value = 2;
};

const handleMapClick = (e: MouseEvent) => {
  if (currentStep.value !== 3) return;
  
  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
  const lng = e.clientX - rect.left;
  const lat = e.clientY - rect.top;
  
  actualLocation.value = { lat, lng };
  
  // Simulate FSS Routing Logic
  // In a real app, this would use a spatial query or API
  if (lng < 300) {
    targetFSS.value = { id: 'fss-gz', name: '广州飞行服务站', type: 'city', description: '市级管辖' };
  } else {
    targetFSS.value = { id: 'fss-gd', name: '广东省飞行服务站', type: 'provincial', description: '省直管' };
  }
};

const handleFinalSubmit = () => {
  if (!selectedApp.value || !actualLocation.value || !targetFSS.value) return;
  
  const submissionData = {
    relatedApplyId: selectedApp.value.id,
    actualLocation: actualLocation.value,
    targetFSS: targetFSS.value,
    confirmData: { ...confirmData.value },
    originalApp: selectedApp.value
  };

  if (targetFSS.value.type === 'city') {
    emit('redirect', submissionData);
  } else {
    emit('submit', submissionData);
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
