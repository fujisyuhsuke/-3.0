<template>
  <div class="relative">
    <!-- Bell Icon with Badge -->
    <button 
      @click="showDropdown = !showDropdown"
      class="relative p-2 text-gray-500 hover:text-blue-600 transition-colors"
    >
      <Bell :size="18" />
      <span v-if="unreadCount > 0" class="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
        {{ unreadCount }}
      </span>
    </button>

    <!-- Dropdown -->
    <div v-if="showDropdown" class="absolute right-0 mt-4 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 z-[100] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
      <div class="px-6 py-4 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
        <h3 class="font-bold text-gray-800">消息通知</h3>
        <button @click="markAllAsRead" class="text-[10px] text-blue-600 font-bold hover:underline">全部已读</button>
      </div>

      <div class="max-h-[400px] overflow-y-auto scrollbar-thin">
        <div v-if="notifications.length === 0" class="p-12 text-center text-gray-400">
          <div class="flex flex-col items-center">
            <BellOff :size="32" class="mb-2 opacity-20" />
            <p class="text-xs">暂无新消息</p>
          </div>
        </div>

        <div 
          v-for="note in sortedNotifications" 
          :key="note.id"
          @click="handleNoteClick(note)"
          :class="['px-6 py-4 border-b border-gray-50 cursor-pointer transition-colors hover:bg-gray-50', !note.read ? 'bg-blue-50/30' : '']"
        >
          <div class="flex gap-3">
            <div :class="['w-8 h-8 rounded-full flex items-center justify-center shrink-0', getNoteColor(note.type)]">
              <component :is="getNoteIcon(note.type)" :size="14" />
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between mb-1">
                <span class="text-xs font-bold text-gray-800">{{ note.title }}</span>
                <span class="text-[10px] text-gray-400">{{ formatTime(note.timestamp) }}</span>
              </div>
              <p class="text-[11px] text-gray-500 leading-relaxed line-clamp-2">{{ note.content }}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="px-6 py-3 border-t border-gray-50 text-center">
        <button class="text-[11px] text-gray-400 font-medium hover:text-blue-600 transition-colors">查看全部通知</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { 
  Bell, BellOff, CheckCircle, XCircle, AlertCircle, Info, 
  ShieldCheck, Navigation, Check 
} from 'lucide-vue-next';

export interface Notification {
  id: string;
  title: string;
  content: string;
  type: 'success' | 'error' | 'warning' | 'info' | 'audit';
  timestamp: string;
  read: boolean;
  relatedId?: string;
}

const props = defineProps<{
  notifications: Notification[];
}>();

const emit = defineEmits(['read', 'mark-all-read', 'click-note']);

const showDropdown = ref(false);

const unreadCount = computed(() => props.notifications.filter(n => !n.read).length);

const sortedNotifications = computed(() => {
  return [...props.notifications].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
});

const markAllAsRead = () => {
  emit('mark-all-read');
};

const handleNoteClick = (note: Notification) => {
  if (!note.read) {
    emit('read', note.id);
  }
  emit('click-note', note);
  showDropdown.value = false;
};

const getNoteIcon = (type: string) => {
  switch (type) {
    case 'success': return CheckCircle;
    case 'error': return XCircle;
    case 'warning': return AlertCircle;
    case 'audit': return ShieldCheck;
    default: return Info;
  }
};

const getNoteColor = (type: string) => {
  switch (type) {
    case 'success': return 'bg-green-100 text-green-600';
    case 'error': return 'bg-red-100 text-red-600';
    case 'warning': return 'bg-orange-100 text-orange-600';
    case 'audit': return 'bg-blue-100 text-blue-600';
    default: return 'bg-gray-100 text-gray-500';
  }
};

const formatTime = (timestamp: string) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  if (diff < 60000) return '刚刚';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`;
  
  return `${date.getMonth() + 1}-${date.getDate()}`;
};
</script>
