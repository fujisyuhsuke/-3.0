<template>
  <div class="space-y-8">
    <!-- Welcome & Stats Section -->
    <div class="flex justify-between items-end mb-8">
      <div>
        <h2 class="text-2xl font-bold text-gray-800">
          欢迎回来，{{ userType === 'enterprise' ? '广东某航测技术有限公司' : '张三' }}
        </h2>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <div v-for="(stat, i) in stats" :key="i" class="p-6 rounded-xl border border-gray-100 shadow-sm bg-white flex justify-between items-start">
        <div>
          <p class="text-sm text-gray-500 font-medium">{{ stat.label }}</p>
          <p :class="['text-3xl font-bold mt-2', stat.color]">{{ stat.value }}</p>
        </div>
        <div class="p-2 bg-gray-50 rounded-lg">
          <component :is="stat.icon" :size="20" :class="stat.iconColor" />
        </div>
      </div>
    </div>

    <!-- Main Dashboard Grid -->
    <div class="space-y-8">
      <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h3 class="font-bold text-gray-800 flex items-center gap-2">
            <FileText :size="18" class="text-blue-600" />
            最近飞行申请记录
          </h3>
          <button class="text-sm text-blue-600 hover:underline">查看全部</button>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm">
            <thead>
              <tr class="bg-gray-50 text-gray-500 font-medium">
                <th class="px-6 py-3">申请编号</th>
                <th class="px-6 py-3">飞行类型</th>
                <th class="px-6 py-3">申请时间</th>
                <th class="px-6 py-3">状态</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="(row, i) in recentRecords" :key="i" class="hover:bg-gray-50 transition-colors">
                <td class="px-6 py-4 font-mono text-xs text-blue-600">{{ row.id }}</td>
                <td class="px-6 py-4 font-medium">{{ row.type }}</td>
                <td class="px-6 py-4 text-gray-500">{{ row.time }}</td>
                <td :class="['px-6 py-4 font-bold', row.statusColor]">{{ row.status }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { 
  Users, Plane, Activity, AlertTriangle, Bell, CheckCircle2, Clock, 
  AlertCircle, FileText, Smartphone, UserPlus, MapPin, ShieldCheck
} from 'lucide-vue-next';

const props = defineProps<{
  userType: 'individual' | 'enterprise'
}>();

defineEmits(['request-flight']);

const stats = computed(() => {
  if (props.userType === 'enterprise') {
    return [
      { label: '在册飞手', value: '24', color: 'text-blue-600', icon: Users, iconColor: 'text-blue-200' },
      { label: '机队规模', value: '12', color: 'text-indigo-600', icon: Plane, iconColor: 'text-indigo-200' },
      { label: '本月飞行', value: '156', color: 'text-green-600', icon: Activity, iconColor: 'text-green-200' },
      { label: '安全预警', value: '1', color: 'text-red-600', icon: AlertTriangle, iconColor: 'text-red-200' },
    ];
  }
  return [
    { label: '待审批申请', value: '2', color: 'text-orange-600', icon: Bell, iconColor: 'text-orange-200' },
    { label: '已通过申请', value: '15', color: 'text-green-600', icon: CheckCircle2, iconColor: 'text-green-200' },
    { label: '飞行时长', value: '42h', color: 'text-blue-600', icon: Clock, iconColor: 'text-blue-200' },
    { label: '违规记录', value: '0', color: 'text-gray-600', icon: AlertCircle, iconColor: 'text-gray-200' },
  ];
});

const recentRecords = [
  { id: 'FL-20260331-001', type: '航拍作业', time: '2026-03-31 10:30', status: '待审批', statusColor: 'text-orange-600' },
  { id: 'FL-20260325-042', type: '基础设施巡检', time: '2026-03-25 14:20', status: '已通过', statusColor: 'text-green-600' },
  { id: 'FL-20260320-015', type: '农林植保', time: '2026-03-20 09:15', status: '已通过', statusColor: 'text-green-600' },
];

const quickActions = computed(() => {
  return [];
});
</script>
