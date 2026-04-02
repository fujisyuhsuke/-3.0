<template>
  <div class="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
    <div class="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300">
      <!-- Header -->
      <div class="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
        <div>
          <div class="flex items-center gap-3 mb-1">
            <h3 class="text-xl font-bold text-gray-800">申请详情</h3>
            <span 
              :class="[
                'text-xs font-bold px-2 py-1 rounded-full',
                getStatusClass(application.status)
              ]"
            >
              {{ getStatusText(application.status) }}
            </span>
          </div>
          <p class="text-xs text-gray-400">申请编号：{{ application.id }}</p>
        </div>
        <button 
          @click="$emit('close')"
          class="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 transition-colors"
        >
          <X :size="20" />
        </button>
      </div>

      <!-- Content -->
      <div class="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-thin">
        <!-- Basic Info Section -->
        <section>
          <div class="flex items-center gap-2 mb-4">
            <div class="w-1 h-4 bg-blue-600 rounded-full"></div>
            <h4 class="text-sm font-bold text-gray-800">基本信息</h4>
          </div>
          <div class="grid grid-cols-2 gap-6">
            <div class="space-y-1">
              <p class="text-[10px] uppercase tracking-wider text-gray-400 font-bold">业务类型</p>
              <p class="text-sm font-medium text-gray-700">{{ getBusinessTypeTitle(application.businessType) }}</p>
            </div>
            <div class="space-y-1">
              <p class="text-[10px] uppercase tracking-wider text-gray-400 font-bold">提交时间</p>
              <p class="text-sm font-medium text-gray-700">{{ formatDate(application.submittedAt) }}</p>
            </div>
            <div class="space-y-1">
              <p class="text-[10px] uppercase tracking-wider text-gray-400 font-bold">申请人类型</p>
              <p class="text-sm font-medium text-gray-700">{{ application.userType === 'enterprise' ? '企业用户' : '个人用户' }}</p>
            </div>
            <div class="space-y-1">
              <p class="text-[10px] uppercase tracking-wider text-gray-400 font-bold">飞行类型</p>
              <p class="text-sm font-medium text-gray-700">{{ getApplicationTypeText(application.formData.applicationType) }}</p>
            </div>
          </div>
        </section>

        <!-- Location Section -->
        <section>
          <div class="flex items-center gap-2 mb-4">
            <div class="w-1 h-4 bg-indigo-600 rounded-full"></div>
            <h4 class="text-sm font-bold text-gray-800">起降及空域信息</h4>
          </div>
          <div class="bg-gray-50 rounded-2xl p-5 space-y-4">
            <div class="flex items-start gap-3">
              <div class="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-indigo-600 shadow-sm shrink-0">
                <MapPin :size="16" />
              </div>
              <div>
                <p class="text-[10px] font-bold text-gray-400 mb-0.5">起飞地点</p>
                <p class="text-sm font-bold text-gray-800">{{ application.locationInfo.address }}</p>
                <p class="text-[10px] text-gray-500 mt-1">所属飞服站：{{ application.locationInfo.fss.name }} ({{ application.locationInfo.fss.description }})</p>
              </div>
            </div>
            <div class="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200/50">
              <div>
                <p class="text-[10px] font-bold text-gray-400 mb-0.5">飞行高度</p>
                <p class="text-sm font-bold text-gray-800">{{ application.formData.flightHeight }}m</p>
              </div>
              <div>
                <p class="text-[10px] font-bold text-gray-400 mb-0.5">飞行半径</p>
                <p class="text-sm font-bold text-gray-800">{{ application.formData.flightRadius }}m</p>
              </div>
              <div>
                <p class="text-[10px] font-bold text-gray-400 mb-0.5">预计时长</p>
                <p class="text-sm font-bold text-gray-800">{{ application.formData.flightDuration }}min</p>
              </div>
            </div>
          </div>
        </section>

        <!-- UAV & Pilot Section -->
        <section>
          <div class="flex items-center gap-2 mb-4">
            <div class="w-1 h-4 bg-emerald-600 rounded-full"></div>
            <h4 class="text-sm font-bold text-gray-800">设备及人员</h4>
          </div>
          <div class="grid grid-cols-2 gap-6">
            <div class="p-4 border border-gray-100 rounded-2xl flex items-center gap-4">
              <div class="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                <Smartphone :size="20" />
              </div>
              <div>
                <p class="text-[10px] font-bold text-gray-400 mb-0.5">无人机型号</p>
                <p class="text-sm font-bold text-gray-800">{{ application.formData.uavModel }}</p>
                <p class="text-[10px] text-gray-500">编号：{{ application.formData.uavNumber }}</p>
              </div>
            </div>
            <div class="p-4 border border-gray-100 rounded-2xl flex items-center gap-4">
              <div class="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                <User :size="20" />
              </div>
              <div>
                <p class="text-[10px] font-bold text-gray-400 mb-0.5">操控员</p>
                <p class="text-sm font-bold text-gray-800">{{ application.formData.pilotName }}</p>
                <p class="text-[10px] text-gray-500">{{ application.formData.pilotPhone }}</p>
              </div>
            </div>
          </div>
        </section>

        <!-- Additional Info -->
        <section v-if="application.formData.flightPurpose || application.formData.taskDescription">
          <div class="flex items-center gap-2 mb-4">
            <div class="w-1 h-4 bg-orange-600 rounded-full"></div>
            <h4 class="text-sm font-bold text-gray-800">任务说明</h4>
          </div>
          <div class="bg-orange-50/30 rounded-2xl p-5 border border-orange-100/50">
            <div v-if="application.formData.flightPurpose" class="mb-3">
              <p class="text-[10px] font-bold text-orange-600/70 mb-1 uppercase tracking-wider">飞行目的</p>
              <p class="text-sm text-gray-700 leading-relaxed">{{ application.formData.flightPurpose }}</p>
            </div>
            <div v-if="application.formData.taskDescription">
              <p class="text-[10px] font-bold text-orange-600/70 mb-1 uppercase tracking-wider">任务描述</p>
              <p class="text-sm text-gray-700 leading-relaxed">{{ application.formData.taskDescription }}</p>
            </div>
          </div>
        </section>
      </div>

      <!-- Footer -->
      <div class="px-8 py-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
        <button 
          @click="$emit('close')"
          class="px-6 py-2.5 bg-white border border-gray-200 text-gray-600 rounded-xl text-sm font-bold hover:bg-gray-50 transition-colors"
        >
          关闭
        </button>
        <button 
          v-if="application.status === 'approved'"
          @click="$emit('request-takeoff', application)"
          class="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-shadow hover:shadow-lg hover:shadow-blue-200 flex items-center gap-2"
        >
          <Navigation :size="16" />
          立即起飞确认
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { X, MapPin, Smartphone, User, Navigation } from 'lucide-vue-next';
import { FlightApplication, ApplicationStatus, BusinessType } from '../types';

defineProps<{
  application: FlightApplication;
}>();

defineEmits(['close', 'request-takeoff']);

const getBusinessTypeTitle = (type: BusinessType) => {
  const typeMap: Record<BusinessType, string> = {
    'uav-apply': '飞行活动申请',
    'uav-takeoff': '起飞确认',
    'uav-landing': '降落报告',
    'ga-airspace': '通航空域申请',
    'ga-apply': '通航飞行计划'
  };
  return typeMap[type] || type;
};

const getApplicationTypeText = (type: string) => {
  const typeMap: Record<string, string> = {
    general: '一般飞行活动',
    emergency: '紧急飞行活动',
    longTerm: '长期飞行活动',
    indoor: '场内飞行活动'
  };
  return typeMap[type] || type;
};

const getStatusText = (status: ApplicationStatus) => {
  const statusMap: Record<ApplicationStatus, string> = {
    pending: '待处理',
    processing: '处理中',
    approved: '已批准',
    rejected: '已拒绝',
    active: '飞行中',
    completed: '已结束'
  };
  return statusMap[status] || status;
};

const getStatusClass = (status: ApplicationStatus) => {
  switch (status) {
    case 'pending': return 'bg-yellow-100 text-yellow-800';
    case 'processing': return 'bg-blue-100 text-blue-800';
    case 'approved': return 'bg-green-100 text-green-800';
    case 'active': return 'bg-indigo-100 text-indigo-800';
    case 'completed': return 'bg-gray-100 text-gray-800';
    case 'rejected': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};
</script>

<style scoped>
.scrollbar-thin::-webkit-scrollbar {
  width: 6px;
}
.scrollbar-thin::-webkit-scrollbar-track {
  background: transparent;
}
.scrollbar-thin::-webkit-scrollbar-thumb {
  background: #e5e7eb;
  border-radius: 10px;
}
</style>
