<template>
  <div class="space-y-8">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-2xl font-bold text-gray-800">审核工作台</h2>
        <p class="text-sm text-gray-500 mt-1">处理待审核的飞行活动申请、空域申请及资质认证</p>
      </div>
      <div class="flex items-center gap-3">
        <div class="px-4 py-2 bg-orange-50 text-orange-600 rounded-lg text-xs font-bold flex items-center gap-2 border border-orange-100">
          <ShieldAlert :size="16" />
          审核员模式
        </div>
      </div>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div v-for="stat in stats" :key="stat.label" class="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div :class="['w-10 h-10 rounded-xl flex items-center justify-center mb-4', stat.colorClass]">
          <component :is="stat.icon" :size="20" />
        </div>
        <p class="text-xs font-medium text-gray-500 mb-1">{{ stat.label }}</p>
        <h4 class="text-2xl font-bold text-gray-800">{{ stat.value }}</h4>
      </div>
    </div>

    <!-- Pending List -->
    <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
        <h3 class="font-bold text-gray-800">待处理申请 ({{ pendingApplications.length }})</h3>
        <div class="flex items-center gap-2">
          <button class="p-2 text-gray-400 hover:text-blue-600 transition-colors">
            <Filter :size="18" />
          </button>
          <button class="p-2 text-gray-400 hover:text-blue-600 transition-colors">
            <Search :size="18" />
          </button>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-gray-50/50">
              <th class="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">申请信息</th>
              <th class="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">申请人</th>
              <th class="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">飞行计划</th>
              <th class="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">提交时间</th>
              <th class="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr v-if="pendingApplications.length === 0">
              <td colspan="5" class="px-6 py-12 text-center text-gray-400">
                <div class="flex flex-col items-center">
                  <CheckCircle :size="48" class="mb-4 opacity-20" />
                  <p>暂无待处理申请</p>
                </div>
              </td>
            </tr>
            <tr v-for="app in pendingApplications" :key="app.id" class="hover:bg-gray-50/50 transition-colors">
              <td class="px-6 py-4">
                <div class="flex flex-col">
                  <span class="text-sm font-bold text-gray-800">{{ app.id }}</span>
                  <span class="text-[10px] text-gray-400">{{ getBusinessTypeTitle(app.businessType) }}</span>
                </div>
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center gap-2">
                  <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xs font-bold">
                    {{ app.formData.contactName?.[0] || 'U' }}
                  </div>
                  <div class="flex flex-col">
                    <span class="text-sm font-medium text-gray-700">{{ app.formData.contactName }}</span>
                    <span class="text-[10px] text-gray-400">{{ app.userType === 'enterprise' ? '企业' : '个人' }}</span>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4">
                <div class="flex flex-col">
                  <span class="text-sm text-gray-700">{{ app.formData.flightDate }} {{ app.formData.takeoffTime }}</span>
                  <span class="text-[10px] text-gray-400 truncate max-w-[200px]">{{ app.locationInfo.address }}</span>
                </div>
              </td>
              <td class="px-6 py-4 text-sm text-gray-500">
                {{ formatDate(app.submittedAt) }}
              </td>
              <td class="px-6 py-4 text-right">
                <div class="flex items-center justify-end gap-2">
                  <button 
                    @click="handleApprove(app)"
                    class="px-3 py-1.5 bg-green-50 text-green-600 rounded-lg text-xs font-bold hover:bg-green-100 transition-colors flex items-center gap-1"
                  >
                    <Check :size="14" />
                    通过
                  </button>
                  <button 
                    @click="handleReject(app)"
                    class="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-bold hover:bg-red-100 transition-colors flex items-center gap-1"
                  >
                    <X :size="14" />
                    驳回
                  </button>
                  <button 
                    @click="$emit('view-details', app)"
                    class="p-1.5 text-gray-400 hover:text-blue-600 transition-colors"
                  >
                    <Eye :size="16" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Audit Modal -->
    <div v-if="showAuditModal" class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div class="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-300">
        <div class="px-8 py-6 border-b border-gray-100 flex items-center justify-between">
          <h3 class="text-xl font-bold text-gray-800">{{ auditAction === 'approve' ? '批准申请' : '驳回申请' }}</h3>
          <button @click="showAuditModal = false" class="p-2 text-gray-400 hover:text-gray-600 transition-colors">
            <X :size="20" />
          </button>
        </div>
        
        <div class="p-8 space-y-6">
          <div v-if="selectedApp" class="p-4 bg-gray-50 rounded-2xl border border-gray-100">
            <p class="text-xs text-gray-400 mb-1">正在处理申请</p>
            <p class="text-sm font-bold text-gray-800">{{ selectedApp.id }}</p>
            <p class="text-xs text-gray-500 mt-1">{{ selectedApp.locationInfo.address }}</p>
          </div>

          <div class="space-y-2">
            <label class="text-sm font-bold text-gray-700">审核意见</label>
            <textarea 
              v-model="auditComment"
              rows="4"
              class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
              :placeholder="auditAction === 'approve' ? '请输入批准意见（可选）' : '请说明驳回原因（必填）'"
            ></textarea>
          </div>

          <div class="flex gap-3 pt-2">
            <button 
              @click="showAuditModal = false"
              class="flex-1 px-6 py-3 bg-gray-100 text-gray-600 rounded-xl text-sm font-bold hover:bg-gray-200 transition-colors"
            >
              取消
            </button>
            <button 
              @click="confirmAudit"
              :disabled="auditAction === 'reject' && !auditComment"
              :class="['flex-1 px-6 py-3 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-opacity-20', 
                auditAction === 'approve' ? 'bg-green-600 hover:bg-green-700 shadow-green-200' : 'bg-red-600 hover:bg-red-700 shadow-red-200 disabled:opacity-50 disabled:shadow-none']"
            >
              确认{{ auditAction === 'approve' ? '批准' : '驳回' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { 
  ShieldAlert, Clock, CheckCircle, XCircle, Filter, Search, 
  Check, X, Eye, FileText, AlertCircle 
} from 'lucide-vue-next';
import { FlightApplication, BusinessType, ApplicationStatus } from '../types';

const props = defineProps<{
  applications: FlightApplication[];
}>();

const emit = defineEmits(['audit-complete', 'view-details']);

const pendingApplications = computed(() => {
  return props.applications.filter(app => app.status === 'pending' || app.status === 'processing');
});

const stats = computed(() => [
  { label: '待审核', value: pendingApplications.value.length, icon: Clock, colorClass: 'bg-orange-50 text-orange-600' },
  { label: '今日已办', value: 12, icon: CheckCircle, colorClass: 'bg-green-50 text-green-600' },
  { label: '驳回率', value: '8.5%', icon: XCircle, colorClass: 'bg-red-50 text-red-600' },
  { label: '平均时效', value: '1.2h', icon: AlertCircle, colorClass: 'bg-blue-50 text-blue-600' },
]);

const showAuditModal = ref(false);
const auditAction = ref<'approve' | 'reject'>('approve');
const selectedApp = ref<FlightApplication | null>(null);
const auditComment = ref('');

const handleApprove = (app: FlightApplication) => {
  selectedApp.value = app;
  auditAction.value = 'approve';
  auditComment.value = '符合飞行安全要求，准予飞行。';
  showAuditModal.value = true;
};

const handleReject = (app: FlightApplication) => {
  selectedApp.value = app;
  auditAction.value = 'reject';
  auditComment.value = '';
  showAuditModal.value = true;
};

const confirmAudit = () => {
  if (!selectedApp.value) return;
  
  emit('audit-complete', {
    id: selectedApp.value.id,
    status: auditAction.value === 'approve' ? 'approved' : 'rejected',
    comment: auditComment.value
  });
  
  showAuditModal.value = false;
  selectedApp.value = null;
  auditComment.value = '';
};

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

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};
</script>
