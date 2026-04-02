<template>
  <div class="space-y-8">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-2xl font-bold text-gray-800">申请记录</h2>
        <p class="text-sm text-gray-500 mt-1">查看和管理您的无人机飞行活动申请记录</p>
      </div>
    </div>

    <!-- Application List -->
    <div class="space-y-4">
      <div v-if="applications.length === 0" class="p-8 border-2 border-dashed border-gray-100 rounded-2xl flex flex-col items-center justify-center text-center">
        <div class="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-4">
          <FileText :size="32" />
        </div>
        <p class="text-sm font-medium text-gray-500 mb-2">暂无申请记录</p>
        <p class="text-xs text-gray-400 leading-relaxed max-w-md">
          您还没有提交过无人机飞行活动申请，请先提交申请。
        </p>
      </div>

      <div 
        v-for="app in applications" 
        :key="app.id"
        class="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all"
      >
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <div class="flex items-center gap-2 mb-1">
              <span class="text-sm font-bold text-gray-800">{{ getApplicationTypeText(app.formData.applicationType) }}</span>
              <span 
                :class="[
                  'text-xs font-bold px-2 py-1 rounded-full',
                  app.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  app.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                  app.status === 'approved' ? 'bg-green-100 text-green-800' :
                  'bg-red-100 text-red-800'
                ]"
              >
                {{ getStatusText(app.status) }}
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
            <button 
              @click="copyApplication(app)"
              class="px-4 py-2 bg-gray-50 text-gray-600 rounded-lg text-xs font-bold hover:bg-gray-100 transition-colors"
            >
              复制申请
            </button>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div class="p-3 bg-gray-50 rounded-xl">
            <p class="text-xs font-medium text-gray-500 mb-1">起飞点</p>
            <p class="text-sm font-bold text-gray-800">{{ app.locationInfo.address }}</p>
            <p class="text-[10px] text-gray-500 mt-1">{{ app.locationInfo.fss.name }}</p>
          </div>
          <div class="p-3 bg-gray-50 rounded-xl">
            <p class="text-xs font-medium text-gray-500 mb-1">飞行时间</p>
            <p class="text-sm font-bold text-gray-800">{{ app.formData.flightDate }} {{ app.formData.takeoffTime }}</p>
            <p class="text-[10px] text-gray-500 mt-1">预计时长：{{ app.formData.flightDuration }}分钟</p>
          </div>
          <div class="p-3 bg-gray-50 rounded-xl">
            <p class="text-xs font-medium text-gray-500 mb-1">无人机信息</p>
            <p class="text-sm font-bold text-gray-800">{{ app.formData.uavModel }}</p>
            <p class="text-[10px] text-gray-500 mt-1">编号：{{ app.formData.uavNumber }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="applications.length > 0" class="flex items-center justify-center mt-8">
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
import { FileText, ChevronLeft, ChevronRight } from 'lucide-vue-next';

interface FlightApplication {
  id: string;
  locationInfo: any;
  formData: any;
  status: 'pending' | 'processing' | 'approved' | 'rejected';
  submittedAt: string;
  userType: 'individual' | 'enterprise';
}

const props = defineProps<{
  applications: FlightApplication[];
  userType: 'individual' | 'enterprise';
}>();

const emit = defineEmits(['view-application', 'copy-application']);

const getApplicationTypeText = (type: string) => {
  const typeMap: Record<string, string> = {
    general: '一般飞行活动',
    emergency: '紧急飞行活动',
    longTerm: '长期飞行活动',
    indoor: '场内飞行活动'
  };
  return typeMap[type] || type;
};

const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    pending: '待处理',
    processing: '处理中',
    approved: '已批准',
    rejected: '已拒绝'
  };
  return statusMap[status] || status;
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