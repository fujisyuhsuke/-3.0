<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
    <div class="bg-white rounded-3xl w-full max-w-5xl h-[80vh] overflow-hidden shadow-2xl flex flex-col md:flex-row">
      <!-- Left: Map Selection -->
      <div class="flex-1 relative bg-gray-50 border-r border-gray-100">
        <!-- Map Header -->
        <div class="absolute top-6 left-6 z-10">
          <div class="bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-white/50 max-w-xs">
            <h3 class="font-bold text-gray-800 flex items-center gap-2">
              <MapPin :size="18" class="text-blue-600" />
              选择起飞地
            </h3>
            <p class="text-[10px] text-gray-500 mt-1 leading-relaxed">
              请在地图上点击蓝色标记点，选择您已获批的飞行活动申请进行起飞确认。
            </p>
          </div>
        </div>

        <!-- Simulated Map -->
        <div class="w-full h-full relative overflow-hidden bg-[#f8fafc] cursor-crosshair" @click="handleMapClick">
          <!-- Map Grid/Background -->
          <svg width="100%" height="100%" class="absolute inset-0">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e2e8f0" stroke-width="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
            
            <!-- Restricted Areas (Simplified) -->
            <circle cx="200" cy="200" r="80" fill="#fee2e2" fill-opacity="0.4" stroke="#fca5a5" stroke-width="1" stroke-dasharray="4" />
            <text x="160" y="200" fill="#ef4444" font-size="10" font-weight="bold" class="pointer-events-none">机场禁飞区</text>
          </svg>

          <!-- Approved Application Markers -->
          <div 
            v-for="app in filteredApps" 
            :key="app.id"
            class="absolute transition-all duration-300"
            :style="{ left: `${app.locationInfo.coordinate.lng}px`, top: `${app.locationInfo.coordinate.lat}px` }"
          >
            <button 
              @click.stop="selectApp(app)"
              :class="['relative -translate-x-1/2 -translate-y-full p-2 transition-all hover:scale-110', 
                selectedApp?.id === app.id ? 'z-30' : 'z-20']"
            >
              <div :class="['p-2 rounded-full shadow-lg border-2 transition-all', 
                selectedApp?.id === app.id ? 'bg-blue-600 border-white scale-125' : 'bg-white border-blue-500']">
                <Navigation :size="20" :class="selectedApp?.id === app.id ? 'text-white' : 'text-blue-600'" />
              </div>
              <!-- Pulse Effect for selected -->
              <div v-if="selectedApp?.id === app.id" class="absolute inset-0 bg-blue-400 rounded-full animate-ping opacity-20"></div>
            </button>
          </div>
        </div>

        <!-- Map Controls -->
        <div class="absolute bottom-6 left-6 flex flex-col gap-2">
          <button class="p-2 bg-white rounded-xl shadow-lg hover:bg-gray-50 text-gray-600"><Plus :size="20" /></button>
          <button class="p-2 bg-white rounded-xl shadow-lg hover:bg-gray-50 text-gray-600"><Minus :size="20" /></button>
        </div>
      </div>

      <!-- Right: Application Details & Confirmation -->
      <div class="w-full md:w-80 flex flex-col bg-white">
        <div class="p-6 border-b border-gray-100 flex items-center justify-between">
          <h3 class="font-bold text-gray-800">关联申请详情</h3>
          <button @click="$emit('close')" class="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors">
            <X :size="20" />
          </button>
        </div>

        <div class="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
          <div v-if="!selectedApp" class="h-full flex flex-col items-center justify-center text-center py-12">
            <div class="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-blue-200 mb-4">
              <Navigation :size="32" />
            </div>
            <p class="text-sm font-bold text-gray-400">请在地图上选择<br/>已获批的飞行活动</p>
          </div>

          <div v-else class="animate-in slide-in-from-right-4 duration-300">
            <!-- App Badge -->
            <div class="flex items-center gap-2 mb-4">
              <span class="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded uppercase">已获批</span>
              <span class="text-[10px] text-gray-400 font-mono">ID: {{ selectedApp.id }}</span>
            </div>

            <h4 class="text-lg font-bold text-gray-800 mb-1">{{ selectedApp.formData.flightPurpose }}</h4>
            <p class="text-xs text-gray-500 mb-6">{{ selectedApp.locationInfo.address }}</p>

            <div class="space-y-4">
              <div class="flex items-start gap-3">
                <div class="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400 shrink-0">
                  <Clock :size="16" />
                </div>
                <div>
                  <p class="text-[10px] font-bold text-gray-400 uppercase">计划飞行时间</p>
                  <p class="text-sm font-bold text-gray-800">{{ selectedApp.formData.flightDate }} {{ selectedApp.formData.takeoffTime }}</p>
                </div>
              </div>

              <div class="flex items-start gap-3">
                <div class="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400 shrink-0">
                  <User :size="16" />
                </div>
                <div>
                  <p class="text-[10px] font-bold text-gray-400 uppercase">责任飞手</p>
                  <p class="text-sm font-bold text-gray-800">{{ selectedApp.formData.pilotName }}</p>
                </div>
              </div>

              <div class="flex items-start gap-3">
                <div class="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400 shrink-0">
                  <Smartphone :size="16" />
                </div>
                <div>
                  <p class="text-[10px] font-bold text-gray-400 uppercase">无人机型号</p>
                  <p class="text-sm font-bold text-gray-800">{{ selectedApp.formData.uavModel }}</p>
                </div>
              </div>

              <div class="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                <div class="flex items-center gap-2 text-blue-800 font-bold text-xs mb-1">
                  <ShieldCheck :size="14" />
                  所属飞服站
                </div>
                <p class="text-xs text-blue-600">{{ selectedApp.locationInfo.fss.name }} ({{ selectedApp.locationInfo.fss.type === 'provincial' ? '省直管' : '市级管辖' }})</p>
              </div>
            </div>
          </div>
        </div>

        <div class="p-6 border-t border-gray-100">
          <button 
            @click="confirmSelection"
            :disabled="!selectedApp"
            :class="['w-full py-4 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg', 
              selectedApp ? 'bg-blue-700 text-white hover:bg-blue-800 shadow-blue-100' : 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none']"
          >
            <span>确认关联并继续</span>
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
  X, MapPin, Navigation, Clock, User, Smartphone, 
  ShieldCheck, ArrowRight, Plus, Minus 
} from 'lucide-vue-next';
import { FlightApplication, UserType } from '../types';

const props = defineProps<{
  applications: FlightApplication[];
  userType: UserType;
}>();

const emit = defineEmits(['close', 'confirm']);

const selectedApp = ref<FlightApplication | null>(null);

// Filter applications based on business logic:
// 1. Status must be 'approved'
// 2. Business type must be 'uav-apply'
// 3. Individual users only see 'general' applications
const filteredApps = computed(() => {
  return props.applications.filter(app => {
    const isApproved = app.status === 'approved';
    const isApply = app.businessType === 'uav-apply';
    const isCorrectUserType = props.userType === 'enterprise' || app.formData.applicationType === 'general';
    return isApproved && isApply && isCorrectUserType;
  });
});

const selectApp = (app: FlightApplication) => {
  selectedApp.value = app;
};

const handleMapClick = () => {
  // Deselect if clicking on empty map area
  // In a real map, this would be handled differently
};

const confirmSelection = () => {
  if (selectedApp.value) {
    emit('confirm', selectedApp.value);
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
