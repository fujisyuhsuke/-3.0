<template>
  <div class="flex flex-col h-full bg-white overflow-hidden relative">
    <!-- Top Header -->
    <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white z-10">
      <div class="flex items-center gap-4">
        <button 
          @click="$emit('back')" 
          class="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
          title="返回起飞点选址"
        >
          <ArrowLeft :size="20" />
        </button>
        <div>
          <h2 class="text-lg font-bold text-gray-800">无人机飞行活动申请</h2>
          <div class="flex items-center gap-2 mt-0.5">
            <span class="text-[10px] px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded font-bold uppercase">第二步：信息填报</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="flex-1 overflow-y-auto p-6 scrollbar-thin">
      <div class="max-w-3xl mx-auto space-y-8">
        <!-- Basic Info Section -->
        <section>
          <h3 class="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">基本信息</h3>
          <div class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold text-gray-700 mb-1">申请类型</label>
                <select 
                  v-model="formData.applicationType" 
                  class="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="general">一般飞行活动</option>
                  <option v-if="userType === 'enterprise'" value="emergency">紧急飞行活动</option>
                  <option v-if="userType === 'enterprise'" value="longTerm">长期飞行活动</option>
                  <option v-if="userType === 'enterprise'" value="indoor">场内飞行活动</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-bold text-gray-700 mb-1">飞行日期</label>
                <input 
                  type="date" 
                  v-model="formData.flightDate" 
                  :class="['w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500', errors.flightDate ? 'border-red-500 bg-red-50' : 'border-gray-200']"
                />
                <p v-if="errors.flightDate" class="text-[10px] text-red-500 mt-1">{{ errors.flightDate }}</p>
              </div>
            </div>
            
            <div>
              <label class="block text-xs font-bold text-gray-700 mb-1">飞行目的</label>
              <input 
                type="text" 
                v-model="formData.flightPurpose" 
                class="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="例如：电力巡检、航拍、测绘等"
              />
            </div>
          </div>
        </section>

        <!-- Flight Info Section -->
        <section>
          <h3 class="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">飞行信息</h3>
          <div class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold text-gray-700 mb-1">预计起飞时间</label>
                <input 
                  type="time" 
                  v-model="formData.takeoffTime" 
                  class="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label class="block text-xs font-bold text-gray-700 mb-1">预计飞行时长（分钟）</label>
                <input 
                  type="number" 
                  v-model="formData.flightDuration" 
                  class="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold text-gray-700 mb-1">飞行高度（米）</label>
                <input 
                  type="number" 
                  v-model="formData.flightHeight" 
                  :class="['w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500', errors.flightHeight ? 'border-red-500 bg-red-50' : 'border-gray-200']"
                />
                <p v-if="errors.flightHeight" class="text-[10px] text-red-500 mt-1">{{ errors.flightHeight }}</p>
              </div>
              <div>
                <label class="block text-xs font-bold text-gray-700 mb-1">飞行半径（米）</label>
                <input 
                  type="number" 
                  v-model="formData.flightRadius" 
                  class="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            <div>
              <label class="block text-xs font-bold text-gray-700 mb-1">飞行空域描述</label>
              <textarea 
                v-model="formData.airspaceDescription" 
                rows="2" 
                class="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="请描述飞行空域范围"
              ></textarea>
            </div>
          </div>
        </section>

        <!-- Pilot & UAV Section (Library Sync) -->
        <section class="space-y-6">
          <!-- Pilot Info -->
          <div>
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-sm font-bold text-gray-400 uppercase tracking-widest">飞手信息</h3>
              <button 
                v-if="userType === 'enterprise'"
                @click="showPilotSelector = true"
                class="text-xs text-blue-600 font-bold flex items-center gap-1 hover:text-blue-700"
              >
                <ShieldCheck :size="14" />
                从资质库选择
              </button>
              <div v-else class="flex items-center gap-1 text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-1 rounded-lg">
                <Lock :size="10" />
                个人实名信息已锁定
              </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold text-gray-700 mb-1">飞手姓名</label>
                <div class="relative">
                  <input 
                    type="text" 
                    v-model="formData.pilotName" 
                    :disabled="userType === 'individual'"
                    :class="['w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500', userType === 'individual' ? 'bg-gray-50 border-gray-100 text-gray-500 cursor-not-allowed' : 'border-gray-200']"
                  />
                  <Lock v-if="userType === 'individual'" :size="12" class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300" />
                </div>
              </div>
              <div>
                <label class="block text-xs font-bold text-gray-700 mb-1">联系电话</label>
                <div class="relative">
                  <input 
                    type="text" 
                    v-model="formData.pilotPhone" 
                    :disabled="userType === 'individual'"
                    :class="['w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500', userType === 'individual' ? 'bg-gray-50 border-gray-100 text-gray-500 cursor-not-allowed' : 'border-gray-200']"
                  />
                  <Lock v-if="userType === 'individual'" :size="12" class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300" />
                </div>
              </div>
            </div>
          </div>

          <!-- UAV Info -->
          <div>
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-sm font-bold text-gray-400 uppercase tracking-widest">无人机信息</h3>
              <button 
                @click="showUavSelector = true"
                class="text-xs text-blue-600 font-bold flex items-center gap-1 hover:text-blue-700"
              >
                <ShieldCheck :size="14" />
                从资质库选择
              </button>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold text-gray-700 mb-1">无人机型号</label>
                <input 
                  type="text" 
                  v-model="formData.uavModel" 
                  class="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label class="block text-xs font-bold text-gray-700 mb-1">注册编号/序列号</label>
                <input 
                  type="text" 
                  v-model="formData.uavNumber" 
                  class="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          <!-- Contact Info -->
          <div>
            <h3 class="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">联系人信息</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold text-gray-700 mb-1">联系人姓名</label>
                <input 
                  type="text" 
                  v-model="formData.contactName" 
                  class="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="请输入联系人姓名"
                />
              </div>
              <div>
                <label class="block text-xs font-bold text-gray-700 mb-1">联系电话</label>
                <input 
                  type="text" 
                  v-model="formData.contactPhone" 
                  class="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="请输入联系电话"
                />
              </div>
            </div>
          </div>
        </section>

        <!-- Selected Location Summary -->
        <section class="p-4 bg-blue-50 rounded-2xl border border-blue-100">
          <h3 class="text-sm font-bold text-blue-800 mb-2 flex items-center gap-2">
            <MapPin :size="14" class="text-blue-600" />
            起飞点确认
          </h3>
          <p class="text-sm font-medium text-gray-800">{{ locationInfo.address }}</p>
          <div class="mt-2 text-[10px] text-blue-600 font-medium">
            所属飞服站：{{ locationInfo.fss.name }} ({{ locationInfo.fss.type === 'provincial' ? '省直管' : '市级管辖' }})
          </div>
        </section>

        <!-- Action Buttons -->
        <div class="pt-8 pb-12">
          <button 
            @click="handleSubmit"
            :disabled="!isFormValid"
            :class="['w-full py-4 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg', 
              isFormValid ? 'bg-blue-700 text-white hover:bg-blue-800 shadow-blue-100' : 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none']"
          >
            <span>提交飞行申请</span>
            <ArrowRight :size="18" />
          </button>
        </div>
      </div>
    </div>

    <!-- Pilot Selection Modal -->
    <div v-if="showPilotSelector" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div class="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
        <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 class="font-bold text-gray-800">选择已认证飞手</h3>
          <button @click="showPilotSelector = false" class="p-1 hover:bg-gray-100 rounded-full"><X :size="20" /></button>
        </div>
        <div class="p-4 max-h-[400px] overflow-y-auto space-y-3">
          <div v-if="pilotInstances.length === 0" class="py-10 text-center text-gray-400 text-sm">
            暂无已通过审核的飞手资质
          </div>
          <div 
            v-for="pilot in pilotInstances" 
            :key="pilot.id"
            @click="selectPilot(pilot)"
            class="p-4 border border-gray-100 rounded-2xl hover:border-blue-500 hover:bg-blue-50 cursor-pointer transition-all group"
          >
            <div class="flex items-center justify-between">
              <div>
                <div class="font-bold text-gray-800 group-hover:text-blue-700">{{ pilot.data.name }}</div>
                <div class="text-xs text-gray-500 mt-1">证件号：{{ pilot.data.idCard }}</div>
              </div>
              <Check v-if="formData.pilotId === pilot.id" class="text-blue-600" :size="20" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- UAV Selection Modal -->
    <div v-if="showUavSelector" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div class="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
        <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 class="font-bold text-gray-800">选择已认证无人机</h3>
          <button @click="showUavSelector = false" class="p-1 hover:bg-gray-100 rounded-full"><X :size="20" /></button>
        </div>
        <div class="p-4 max-h-[400px] overflow-y-auto space-y-3">
          <div v-if="uavInstances.length === 0" class="py-10 text-center text-gray-400 text-sm">
            暂无已通过审核的无人机资质
          </div>
          <div 
            v-for="uav in uavInstances" 
            :key="uav.id"
            @click="selectUav(uav)"
            class="p-4 border border-gray-100 rounded-2xl hover:border-blue-500 hover:bg-blue-50 cursor-pointer transition-all group"
          >
            <div class="flex items-center justify-between">
              <div>
                <div class="font-bold text-gray-800 group-hover:text-blue-700">{{ uav.data.model }}</div>
                <div class="text-xs text-gray-500 mt-1">注册号：{{ uav.data.regNumber || uav.data.sn }}</div>
              </div>
              <Check v-if="formData.uavId === uav.id" class="text-blue-600" :size="20" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { ArrowLeft, MapPin, ArrowRight, ShieldCheck, Check, X, Lock } from 'lucide-vue-next';
import { LocationSelection, CertInstance, UserType } from '../types';
import { getPreFilledData } from '../services/flightTools';

const props = defineProps<{
  locationInfo: LocationSelection;
  userType: UserType;
  certInstances: CertInstance[];
}>();

const emit = defineEmits(['back', 'submit']);

const formData = ref({
  applicationType: 'general' as 'general' | 'emergency' | 'longTerm' | 'indoor',
  flightPurpose: '',
  flightDate: '',
  takeoffTime: '',
  flightDuration: 60,
  flightHeight: 120,
  flightRadius: 1000,
  airspaceDescription: '',
  landingPoint: '',
  taskDescription: '',
  pilotId: '',
  pilotName: '',
  pilotPhone: '',
  uavId: '',
  uavModel: '',
  uavNumber: '',
  uavWeight: 0,
  contactName: '',
  contactPhone: ''
});

// Auto-fill for individual users
onMounted(() => {
  if (props.userType === 'individual') {
    const preFilled = getPreFilledData('individual') as any;
    formData.value.pilotName = preFilled.pilotName;
    formData.value.contactName = preFilled.pilotName;
    // Mock phone for individual
    formData.value.pilotPhone = '138****8888';
    formData.value.contactPhone = '138****8888';
  }
});

const errors = ref({
  flightHeight: '',
  flightRadius: '',
  uavWeight: '',
  flightDate: ''
});

// Modal states
const showPilotSelector = ref(false);
const showUavSelector = ref(false);

// Filtered instances from library
const pilotInstances = computed(() => 
  props.certInstances.filter(i => i.category === 'pilot-license' && i.status === 'approved')
);

const uavInstances = computed(() => 
  props.certInstances.filter(i => i.category === 'uav-reg' && i.status === 'approved')
);

// Selection methods
const selectPilot = (pilot: CertInstance) => {
  formData.value.pilotId = pilot.id;
  formData.value.pilotName = pilot.data.name;
  formData.value.pilotPhone = pilot.data.phone;
  if (!formData.value.contactName) formData.value.contactName = pilot.data.name;
  if (!formData.value.contactPhone) formData.value.contactPhone = pilot.data.phone;
  showPilotSelector.value = false;
};

const selectUav = (uav: CertInstance) => {
  formData.value.uavId = uav.id;
  formData.value.uavModel = uav.data.model;
  formData.value.uavNumber = uav.data.sn || uav.data.regNumber;
  formData.value.uavWeight = parseFloat(uav.data.weight) || 0;
  showUavSelector.value = false;
};

// Real-time validation
watch(() => formData.value.flightHeight, (val) => {
  if (val > 120) errors.value.flightHeight = '飞行高度不得超过120米（G类空域上限）';
  else if (val <= 0) errors.value.flightHeight = '飞行高度必须大于0';
  else errors.value.flightHeight = '';
});

watch(() => formData.value.flightDate, (val) => {
  const today = new Date().toISOString().split('T')[0];
  if (val && val < today) errors.value.flightDate = '飞行日期不能早于今天';
  else errors.value.flightDate = '';
});

const isFormValid = computed(() => {
  const required = ['flightPurpose', 'flightDate', 'takeoffTime', 'pilotName', 'uavModel', 'uavNumber', 'contactName', 'contactPhone'];
  const hasRequired = required.every(key => !!formData.value[key as keyof typeof formData.value]);
  const noErrors = Object.values(errors.value).every(e => !e);
  return hasRequired && noErrors;
});

const handleSubmit = () => {
  if (isFormValid.value) {
    emit('submit', {
      locationInfo: props.locationInfo,
      formData: { ...formData.value }
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
