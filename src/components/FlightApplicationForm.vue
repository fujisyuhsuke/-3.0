<template>
  <div class="flex flex-col h-full bg-white overflow-hidden">
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
    <div class="flex-1 overflow-y-auto p-6">
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
                  class="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            <div>
              <label class="block text-xs font-bold text-gray-700 mb-1">飞行任务描述</label>
              <textarea 
                v-model="formData.taskDescription" 
                rows="3" 
                class="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="请简要描述飞行任务内容"
              ></textarea>
            </div>
          </div>
        </section>

        <!-- Flight Info Section -->
        <section>
          <h3 class="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">飞行信息</h3>
          <div class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold text-gray-700 mb-1">起飞时间</label>
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
                  min="1" 
                  max="360" 
                  class="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="60"
                />
              </div>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold text-gray-700 mb-1">飞行高度（米）</label>
                <input 
                  type="number" 
                  v-model="formData.flightHeight" 
                  min="0" 
                  max="120" 
                  class="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="120"
                />
                <p v-if="errors.flightHeight" class="text-[10px] text-red-500 mt-1">{{ errors.flightHeight }}</p>
              </div>
              <div>
                <label class="block text-xs font-bold text-gray-700 mb-1">飞行半径（米）</label>
                <input 
                  type="number" 
                  v-model="formData.flightRadius" 
                  min="0" 
                  max="5000" 
                  class="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="1000"
                />
                <p v-if="errors.flightRadius" class="text-[10px] text-red-500 mt-1">{{ errors.flightRadius }}</p>
              </div>
            </div>
            
            <div>
              <label class="block text-xs font-bold text-gray-700 mb-1">飞行空域描述</label>
              <textarea 
                v-model="formData.airspaceDescription" 
                rows="3" 
                class="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="请详细描述飞行空域范围，包括边界坐标、高度范围等"
              ></textarea>
            </div>
            
            <div>
              <label class="block text-xs font-bold text-gray-700 mb-1">降落点信息</label>
              <input 
                type="text" 
                v-model="formData.landingPoint" 
                class="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="例如：与起飞点相同 或 具体降落位置"
              />
            </div>
          </div>
        </section>

        <!-- UAV Info Section -->
        <section>
          <h3 class="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">无人机信息</h3>
          <div class="space-y-4">
            <div class="flex justify-end">
              <button 
                @click="syncCertifiedInfo"
                class="text-xs text-blue-600 font-bold hover:underline flex items-center gap-1"
              >
                <ShieldCheck :size="14" />
                使用已认证信息
              </button>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold text-gray-700 mb-1">无人机型号</label>
                <input 
                  type="text" 
                  v-model="formData.uavModel" 
                  class="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="例如：DJI Mavic 3"
                />
              </div>
              <div>
                <label class="block text-xs font-bold text-gray-700 mb-1">无人机编号</label>
                <input 
                  type="text" 
                  v-model="formData.uavNumber" 
                  class="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="例如：UAV-2024-0001"
                />
              </div>
            </div>
            
            <div>
              <label class="block text-xs font-bold text-gray-700 mb-1">无人机重量（千克）</label>
              <input 
                type="number" 
                v-model="formData.uavWeight" 
                min="0" 
                step="0.1" 
                class="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="例如：2.5"
              />
              <p v-if="errors.uavWeight" class="text-[10px] text-red-500 mt-1">{{ errors.uavWeight }}</p>
            </div>
          </div>
        </section>

        <!-- Contact Info Section -->
        <section>
          <h3 class="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">联系方式</h3>
          <div class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold text-gray-700 mb-1">联系人姓名</label>
                <input 
                  type="text" 
                  v-model="formData.contactName" 
                  class="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label class="block text-xs font-bold text-gray-700 mb-1">联系电话</label>
                <input 
                  type="tel" 
                  v-model="formData.contactPhone" 
                  class="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="例如：138****8888"
                />
              </div>
            </div>
          </div>
        </section>

        <!-- Selected Location Info -->
        <section class="p-4 bg-blue-50 rounded-2xl border border-blue-100">
          <h3 class="text-sm font-bold text-blue-800 mb-2 flex items-center gap-2">
            <MapPin :size="14" class="text-blue-600" />
            已选起飞点
          </h3>
          <p class="text-sm font-medium text-gray-800 leading-relaxed">{{ locationInfo.address }}</p>
          <div class="mt-3 pt-3 border-t border-blue-100 flex justify-between items-center">
            <span class="text-[10px] text-blue-600 font-mono">{{ locationInfo.coordinate.lng.toFixed(6) }}, {{ locationInfo.coordinate.lat.toFixed(6) }}</span>
            <span class="text-[10px] text-blue-800 font-bold">{{ locationInfo.fss.name }}</span>
          </div>
        </section>

        <!-- Action Buttons -->
        <div class="pt-8 space-y-4">
          <button 
            @click="handleSubmit"
            :disabled="!isFormValid"
            :class="['w-full py-4 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg', 
              isFormValid ? 'bg-blue-700 text-white hover:bg-blue-800 shadow-blue-100' : 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none']"
          >
            <span>提交申请</span>
            <ArrowRight :size="18" />
          </button>
          <p class="text-[10px] text-gray-400 text-center leading-relaxed">
            提交申请后，系统将自动进行初步审核，并根据所属飞服站的要求进行处理。
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { ArrowLeft, MapPin, ArrowRight, ShieldCheck } from 'lucide-vue-next';
import { LocationSelection } from '../types';

const props = defineProps<{
  locationInfo: LocationSelection;
  userType: 'individual' | 'enterprise';
}>();

const emit = defineEmits(['back', 'submit']);

const formData = ref({
  applicationType: 'general',
  flightDate: '',
  takeoffTime: '',
  flightDuration: '',
  flightHeight: '',
  flightRadius: '',
  airspaceDescription: '',
  landingPoint: '',
  taskDescription: '',
  uavModel: '',
  uavNumber: '',
  uavWeight: '',
  contactName: '',
  contactPhone: ''
});

const errors = ref({
  flightHeight: '',
  flightRadius: '',
  uavWeight: ''
});

// 监听表单字段变化，实时进行合规性校验
watch(() => formData.value.flightHeight, (newValue) => {
  if (newValue) {
    const height = parseFloat(newValue);
    if (height > 120) {
      errors.value.flightHeight = '飞行高度不得超过120米';
    } else if (height < 0) {
      errors.value.flightHeight = '飞行高度不能为负数';
    } else {
      errors.value.flightHeight = '';
    }
  } else {
    errors.value.flightHeight = '';
  }
});

watch(() => formData.value.flightRadius, (newValue) => {
  if (newValue) {
    const radius = parseFloat(newValue);
    if (radius > 5000) {
      errors.value.flightRadius = '飞行半径不得超过5000米';
    } else if (radius < 0) {
      errors.value.flightRadius = '飞行半径不能为负数';
    } else {
      errors.value.flightRadius = '';
    }
  } else {
    errors.value.flightRadius = '';
  }
});

watch(() => formData.value.uavWeight, (newValue) => {
  if (newValue) {
    const weight = parseFloat(newValue);
    if (weight > 25) {
      errors.value.uavWeight = '无人机重量不得超过25千克';
    } else if (weight < 0) {
      errors.value.uavWeight = '无人机重量不能为负数';
    } else {
      errors.value.uavWeight = '';
    }
  } else {
    errors.value.uavWeight = '';
  }
});

const isFormValid = computed(() => {
  // 检查所有必填字段
  const requiredFields = [
    'flightDate', 'takeoffTime', 'flightDuration', 'flightHeight', 
    'flightRadius', 'airspaceDescription', 'landingPoint', 'taskDescription', 
    'uavModel', 'uavNumber', 'uavWeight', 'contactName', 'contactPhone'
  ];
  
  const allFieldsFilled = requiredFields.every(field => formData.value[field as keyof typeof formData.value]);
  
  // 检查是否有错误
  const noErrors = Object.values(errors.value).every(error => !error);
  
  return allFieldsFilled && noErrors;
});

// 自动同步已认证的飞手和无人机信息
const syncCertifiedInfo = () => {
  // 模拟从认证系统获取数据
  if (props.userType === 'individual') {
    // 个人用户认证信息
    formData.value.uavModel = 'DJI Mavic 3';
    formData.value.uavNumber = 'UAV-2024-0001';
    formData.value.uavWeight = '2.5';
    formData.value.contactName = '张三';
    formData.value.contactPhone = '138****8888';
  } else {
    // 企业用户认证信息
    formData.value.uavModel = 'DJI Phantom 4 Pro';
    formData.value.uavNumber = 'UAV-ENT-0001';
    formData.value.uavWeight = '1.5';
    formData.value.contactName = '李四';
    formData.value.contactPhone = '139****9999';
  }
  
  // 显示同步成功提示
  alert('已成功同步认证信息');
};

const handleSubmit = () => {
  if (isFormValid.value) {
    emit('submit', {
      locationInfo: props.locationInfo,
      formData: formData.value
    });
  } else {
    // 显示错误提示
    alert('请检查表单信息，确保所有必填字段都已填写且符合要求');
  }
};
</script>