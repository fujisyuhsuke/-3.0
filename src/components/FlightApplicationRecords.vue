<template>
  <div class="space-y-8">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-2xl font-bold text-gray-800">{{ getBusinessTypeTitle(selectedBusinessType) }}记录</h2>
        <p class="text-sm text-gray-500 mt-1">查看和管理您的{{ getBusinessTypeTitle(selectedBusinessType) }}记录</p>
      </div>
      <button 
        @click="$emit('back')"
        class="px-4 py-2 bg-gray-50 text-gray-600 rounded-lg text-sm font-bold hover:bg-gray-100 transition-colors flex items-center gap-2"
      >
        <ArrowLeft :size="16" />
        返回业务申报
      </button>
    </div>

    <!-- Business Type Filter -->
    <div class="flex flex-wrap gap-2">
      <button 
        v-for="type in businessTypes" 
        :key="type.value"
        @click="selectedBusinessType = type.value"
        :class="[
          'px-4 py-2 rounded-lg text-sm font-bold transition-colors',
          selectedBusinessType === type.value ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        ]"
      >
        {{ type.label }}
      </button>
    </div>

    <!-- Application List -->
    <div class="space-y-4">
      <div v-if="filteredApplications.length === 0" class="p-8 border-2 border-dashed border-gray-100 rounded-2xl flex flex-col items-center justify-center text-center">
        <div class="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-4">
          <FileText :size="32" />
        </div>
        <p class="text-sm font-medium text-gray-500 mb-2">暂无{{ getBusinessTypeTitle(selectedBusinessType) }}记录</p>
        <p class="text-xs text-gray-400 leading-relaxed max-w-md">
          您还没有提交过{{ getBusinessTypeTitle(selectedBusinessType) }}，请先提交申请。
        </p>
      </div>

      <div 
        v-for="app in filteredApplications" 
        :key="app.id"
        class="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all"
      >
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <div class="flex items-center gap-2 mb-1">
              <span :class="['px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider', getStatusClass(app.status)]">
                {{ getStatusText(app.status) }}
              </span>
              <span v-if="app.formData.applicationType" class="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] font-bold uppercase tracking-wider">
                {{ getApplicationTypeText(app.formData.applicationType) }}
              </span>
            </div>
            <p class="text-xs text-gray-500">
              申请编号：{{ app.id }} | 提交时间：{{ formatDate(app.submittedAt) }}
            </p>
          </div>
          <div class="flex items-center gap-2">
            <button 
              @click="viewApplication(app)"
              class="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-100 transition-colors"
            >
              查看详情
            </button>
            <!-- Lifecycle Actions -->
            <button 
              v-if="app.businessType === 'uav-apply' && app.status === 'approved'"
              @click="$emit('request-takeoff', app)"
              class="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition-colors flex items-center gap-1"
            >
              <Navigation :size="14" />
              起飞确认
            </button>
            <button 
              v-if="app.businessType === 'uav-takeoff' && app.status === 'active'"
              @click="$emit('request-landing', app)"
              class="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 transition-colors flex items-center gap-1"
            >
              <CheckCircle :size="14" />
              降落报告
            </button>
          </div>
        </div>

        <!-- GA Approval Nodes Timeline -->
        <div v-if="app.businessType === 'ga-airspace' && app.approvalNodes" class="mb-6 p-4 bg-indigo-50/30 rounded-2xl border border-indigo-100/50">
          <div class="flex items-center gap-2 mb-4">
            <Clock :size="14" class="text-indigo-600" />
            <span class="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">多方并行审批进度</span>
          </div>
          <div class="flex flex-wrap gap-y-4 gap-x-2">
            <div v-for="(node, idx) in app.approvalNodes" :key="idx" class="flex items-center gap-2">
              <div class="flex flex-col items-center">
                <div :class="['w-6 h-6 rounded-full flex items-center justify-center transition-all', 
                  node.status === 'approved' ? 'bg-emerald-500 text-white' : 
                  node.status === 'processing' ? 'bg-indigo-600 text-white animate-pulse' : 
                  node.status === 'rejected' ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-400']">
                  <Check v-if="node.status === 'approved'" :size="12" />
                  <Clock v-else-if="node.status === 'processing'" :size="12" />
                  <AlertCircle v-else-if="node.status === 'rejected'" :size="12" />
                  <span v-else class="text-[10px] font-bold">{{ idx + 1 }}</span>
                </div>
              </div>
              <div class="flex flex-col">
                <span :class="['text-[10px] font-bold', node.status === 'pending' ? 'text-gray-400' : 'text-gray-700']">{{ node.name }}</span>
                <span v-if="node.time" class="text-[8px] text-gray-400">{{ formatDate(node.time) }}</span>
              </div>
              <div v-if="idx < app.approvalNodes.length - 1" class="w-4 h-px bg-gray-200 mx-1"></div>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div class="p-3 bg-gray-50 rounded-xl">
            <p class="text-xs font-medium text-gray-500 mb-1">
              {{ app.businessType === 'ga-airspace' ? '申请单位' : '起飞点' }}
            </p>
            <div class="flex items-center gap-2">
              <Building2 v-if="app.businessType === 'ga-airspace'" :size="14" class="text-indigo-600" />
              <MapPin v-else :size="14" class="text-blue-600" />
              <p class="text-sm font-bold text-gray-800">{{ app.businessType === 'ga-airspace' ? app.formData.applicantUnit : app.locationInfo.address }}</p>
            </div>
            <p class="text-[10px] text-gray-500 mt-1">{{ app.locationInfo.fss.name }}</p>
          </div>
          <div class="p-3 bg-gray-50 rounded-xl">
            <p class="text-xs font-medium text-gray-500 mb-1">飞行时间</p>
            <p class="text-sm font-bold text-gray-800">
              {{ app.businessType === 'ga-airspace' ? formatDate(app.formData.startTime) : (app.formData.flightDate + ' ' + app.formData.takeoffTime) }}
            </p>
            <p class="text-[10px] text-gray-500 mt-1">
              {{ app.businessType === 'ga-airspace' ? '结束：' + formatDate(app.formData.endTime) : '预计时长：' + app.formData.flightDuration + '分钟' }}
            </p>
          </div>
          <div class="p-3 bg-gray-50 rounded-xl">
            <p class="text-xs font-medium text-gray-500 mb-1">
              {{ app.businessType === 'ga-airspace' ? '空域用途' : '无人机信息' }}
            </p>
            <div class="flex items-center gap-2">
              <Plane v-if="app.businessType === 'ga-airspace'" :size="14" class="text-indigo-600" />
              <p class="text-sm font-bold text-gray-800">
                {{ app.businessType === 'ga-airspace' ? getAirspaceUsageText(app.formData.airspaceUsage) : app.formData.uavModel }}
              </p>
            </div>
            <p class="text-[10px] text-gray-500 mt-1">
              {{ app.businessType === 'ga-airspace' ? '高度：' + app.formData.flightHeightAGL + 'm (AGL)' : '编号：' + app.formData.uavNumber }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="filteredApplications.length > 0" class="flex items-center justify-center mt-8">
      <div class="flex items-center gap-2">
        <button class="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors">
          <ChevronLeft :size="16" />
        </button>
        <button class="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-600 text-white">1</button>
        <button class="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors">
          <ChevronRight :size="16" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { FileText, ChevronLeft, ChevronRight, ArrowLeft, Navigation, CheckCircle, Check, Clock, AlertCircle, Building2, Plane, MapPin } from 'lucide-vue-next';
import { FlightApplication, UserType, BusinessType, ApplicationStatus } from '../types';

const props = defineProps<{
  applications: FlightApplication[];
  businessType: BusinessType;
  userType: UserType;
}>();

const emit = defineEmits(['back', 'view-application', 'copy-application', 'request-takeoff', 'request-landing']);

const selectedBusinessType = ref<BusinessType>(props.businessType);

// Update selectedBusinessType when prop changes
watch(() => props.businessType, (newVal) => {
  selectedBusinessType.value = newVal;
});

const businessTypes = computed(() => {
  const types: { value: BusinessType; label: string }[] = [
    { value: 'uav-apply', label: '飞行活动申请' },
    { value: 'uav-takeoff', label: '起飞确认' },
    { value: 'uav-landing', label: '降落报告' }
  ];

  if (props.userType === 'enterprise') {
    types.push(
      { value: 'ga-airspace', label: '通航空域申请' },
      { value: 'ga-apply', label: '通航飞行活动申请' }
    );
  }

  return types;
});

const filteredApplications = computed(() => {
  return props.applications.filter(app => app.businessType === selectedBusinessType.value);
});

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

const getAirspaceUsageText = (usage: string) => {
  const usageMap: Record<string, string> = {
    training: '飞行训练',
    survey: '航空摄影/测绘',
    agriculture: '农林喷洒',
    emergency: '应急救援',
    scientific: '科学实验'
  };
  return usageMap[usage] || usage;
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

const viewApplication = (app: FlightApplication) => {
  emit('view-application', app);
};

const copyApplication = (app: FlightApplication) => {
  emit('copy-application', app);
};
</script>
