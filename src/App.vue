<template>
  <div class="min-h-screen bg-gray-50 font-sans selection:bg-orange-100 selection:text-orange-900">
    <!-- Logged In View -->
    <div v-if="isLoggedIn" class="min-h-screen bg-gray-50 flex flex-col">
      <!-- Top Utility Bar -->
      <div class="bg-[#f8f8f8] border-b border-gray-200 py-1.5 px-8 flex justify-between items-center text-[11px] text-gray-500">
        <div class="flex items-center gap-6">
          <div class="flex items-center gap-1 cursor-pointer hover:text-blue-600">
            <MapPin :size="12" class="text-blue-600" />
            <span class="font-medium text-gray-700">广东省</span>
            <ChevronDown :size="10" />
          </div>
          <div class="flex items-center gap-4">
            <span class="text-gray-400">广东省低空飞行综合管理平台</span>
          </div>
        </div>
        <div class="flex items-center gap-4">
          <div class="flex items-center gap-3">
            <NotificationCenter 
              :notifications="notifications"
              @read="(id) => notifications.find(n => n.id === id)!.read = true"
              @mark-all-read="notifications.forEach(n => n.read = true)"
              @click-note="(note) => { if (note.relatedId) { currentNav = '飞行业务申报' } }"
            />
            <div class="flex items-center gap-1 cursor-pointer group">
              <div class="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 overflow-hidden">
                <User :size="12" />
              </div>
              <span class="text-gray-700 group-hover:text-blue-600 font-medium">
                {{ userType === 'enterprise' ? '广东某航测技术有限公司' : '张三' }} ({{ userType === 'enterprise' ? '企业用户' : '个人用户' }})
              </span>
              <ChevronDown :size="10" />
            </div>
            <button 
              @click="handleLogout"
              class="flex items-center gap-1 text-gray-400 hover:text-red-500 transition-colors ml-2"
              title="退出登录"
            >
              <LogOut :size="12" />
              <span>退出</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Main Header with Logo -->
      <header class="bg-white py-4 px-8 flex items-center border-b border-gray-100">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-blue-700 rounded-full flex items-center justify-center text-white font-bold italic overflow-hidden">
            <img src="https://picsum.photos/seed/guangdong-uav/100/100" alt="Logo" class="w-full h-full object-cover" referrerPolicy="no-referrer" />
          </div>
          <div>
            <h1 class="text-xl font-bold text-gray-800 tracking-tight">广东省低空飞行综合管理平台</h1>
            <p class="text-[10px] text-gray-400 uppercase tracking-widest">Guangdong Low-altitude Flight Management Platform</p>
          </div>
        </div>
      </header>

      <!-- Top Navigation Tabs -->
      <nav class="bg-white border-b border-gray-200 px-8 flex items-center sticky top-0 z-40">
        <button 
          v-for="item in navItems"
          :key="item.label" 
          @click="() => { 
            currentNav = item.label; 
            if (item.label === '飞行业务申报') declarationView = 'grid';
          }"
          :class="['px-6 py-4 text-[15px] font-medium transition-all relative flex items-center gap-2', currentNav === item.label ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600']"
        >
          <component :is="item.icon" :size="16" />
          {{ item.label }}
          <div v-if="currentNav === item.label" class="absolute bottom-0 left-4 right-4 h-0.5 bg-blue-600 rounded-full"></div>
        </button>
      </nav>

      <!-- Platform Content Area -->
      <main class="flex-1 bg-gray-50 overflow-hidden">
        <!-- 全屏显示模式（飞行申请办理 & 起飞确认办理） -->
        <div v-if="currentNav === '飞行申请办理' || currentNav === '起飞确认办理'" class="h-full">
          <!-- 飞行申请流程 -->
          <template v-if="currentNav === '飞行申请办理'">
            <!-- 地图选择步骤 -->
            <FlightApplicationFlow
              v-if="applicationStep === 'map'"
              :userType="userType"
              @back="currentNav = '飞行业务申报'"
              @next="handleFlowNext"
            />
            
            <!-- 表单填报步骤 -->
            <FlightApplicationForm
              v-else-if="applicationStep === 'form' && selectedLocation"
              :locationInfo="selectedLocation"
              :userType="userType"
              :certInstances="certInstances"
              @back="handleFormBack"
              @submit="handleFormSubmit"
            />
          </template>

          <!-- 起飞确认流程 -->
          <TakeoffConfirmationFlow
            v-else-if="currentNav === '起飞确认办理'"
            :applications="flightApplications"
            :userType="userType"
            @back="currentNav = '飞行业务申报'"
            @submit="handleTakeoffFlowSubmit"
            @redirect="handleTakeoffFlowRedirect"
          />
        </div>
        
        <!-- 普通内容模式（其他页面） -->
        <div v-else class="py-8 px-8 h-full overflow-y-auto">
          <div class="max-w-6xl mx-auto">
            <Dashboard 
              v-if="currentNav === '首页'"
              :userType="userType"
              @request-flight="handleRequestFlight"
            />

            <CertificationCenter 
              v-else-if="currentNav === '资质认证'"
              :userType="userType" 
              :view="certView"
              :selectedCategory="selectedCategory"
              :selectedInstanceId="selectedInstanceId"
              :instances="certInstances"
              @viewChange="handleCertViewChange"
              @addInstance="handleAddInstance"
              @updateInstance="handleUpdateInstance"
              @deleteInstance="handleDeleteInstance"
            />

            <FlightBusinessDeclaration 
              v-else-if="currentNav === '飞行业务申报'"
              :userType="userType"
              :applications="flightApplications"
              :show-records="declarationView === 'records'"
              :default-business-type="recordBusinessType"
              @request-uav-apply="handleOpenFlightFlow"
              @view-application="handleViewApplication"
              @copy-application="handleCopyApplication"
              @request-takeoff="handleRequestTakeoff"
              @request-landing="handleRequestLanding"
              @toggle-view="(view) => declarationView = view"
            />

            <AccountManagement 
              v-else-if="currentNav === '账号管理'"
              :userType="userType"
            />
            
            <div v-else class="flex flex-col items-center justify-center py-20 text-gray-400">
              <component :is="navItems.find(n => n.label === currentNav)?.icon" :size="48" class="mb-4 opacity-20" />
              <p class="text-lg font-medium">{{ currentNav }} 模块正在建设中...</p>
            </div>
          </div>
        </div>

        <!-- Takeoff Application Selector Modal -->
        <TakeoffApplicationSelector 
          v-if="showTakeoffSelector"
          :applications="flightApplications"
          :userType="userType"
          @close="showTakeoffSelector = false"
          @confirm="handleTakeoffConfirm"
        />

        <!-- Application Details Modal -->
        <FlightApplicationDetails
          v-if="showDetailsModal && selectedAppForDetails"
          :application="selectedAppForDetails"
          @close="showDetailsModal = false"
          @request-takeoff="(app) => { showDetailsModal = false; handleRequestTakeoff(app); }"
        />
      </main>
    </div>

    <!-- Login View -->
    <Login v-else @login-success="handleLoginSuccess" />

    <FooterSection v-if="!isLoggedIn" />

    <!-- Redirection Overlay -->
    <div v-if="isRedirecting" class="fixed inset-0 z-[100] bg-white/80 backdrop-blur-md flex flex-col items-center justify-center animate-in fade-in duration-500">
      <div class="w-20 h-20 relative mb-6">
        <div class="absolute inset-0 border-4 border-blue-100 rounded-full"></div>
        <div class="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
        <div class="absolute inset-0 flex items-center justify-center text-blue-600">
          <ExternalLink :size="32" />
        </div>
      </div>
      <h2 class="text-xl font-bold text-gray-800 mb-2">正在重定向至市级系统</h2>
      <p class="text-gray-500">即将进入 {{ redirectTarget }} 飞行服务站办理...</p>
      <div class="mt-8 flex gap-2">
        <div class="w-2 h-2 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
        <div class="w-2 h-2 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
        <div class="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { 
  ShieldCheck, User, MapPin, ChevronDown, Bell, LogOut, FileText, Clock, 
  Smartphone, MessageSquare, ThumbsUp, HelpCircle, Home, ExternalLink
} from 'lucide-vue-next';
import FooterSection from './components/FooterSection.vue';
import FlightApplicationFlow from './components/FlightApplicationFlow.vue';
import CertificationCenter from './components/CertificationCenter.vue';
import FlightBusinessDeclaration from './components/FlightBusinessDeclaration.vue';
import FlightApplicationForm from './components/FlightApplicationForm.vue';
import AccountManagement from './components/AccountManagement.vue';
import Login from './components/Login.vue';
import Dashboard from './components/Dashboard.vue';
import NotificationCenter, { Notification } from './components/NotificationCenter.vue';
import TakeoffConfirmationFlow from './components/TakeoffConfirmationFlow.vue';
import FlightApplicationDetails from './components/FlightApplicationDetails.vue';
import { CertView, CertInstance, LocationSelection, FlightApplication, ApplicationStatus, BusinessType } from './types';

// Auth State
const isLoggedIn = ref(false);
const userType = ref<'individual' | 'enterprise'>('individual');

// Notifications State
const notifications = ref<Notification[]>([]);

const addNotification = (note: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
  notifications.value.unshift({
    ...note,
    id: `note-${Date.now()}`,
    timestamp: new Date().toISOString(),
    read: false
  });
};

// Navigation State
const currentNav = ref('首页');
const navItems = computed(() => {
  return [
    { label: '首页', icon: Home },
    { label: '资质认证', icon: ShieldCheck },
    { label: '飞行业务申报', icon: FileText },
    { label: '账号管理', icon: User }
  ];
});

// Flight Application State
const showFlightMap = ref(false);
const applicationStep = ref<'map' | 'form' | 'external'>('map');
const selectedLocation = ref<LocationSelection | null>(null);
const flightFormData = ref<any>(null);
const isRedirecting = ref(false);
const redirectTarget = ref('');
const declarationView = ref<'grid' | 'records'>('grid');
const recordBusinessType = ref<BusinessType>('uav-apply');

// Details Modal State
const showDetailsModal = ref(false);
const selectedAppForDetails = ref<FlightApplication | null>(null);

// Flight Applications State
const flightApplications = ref<FlightApplication[]>([
  {
    id: 'APP-20260402-001',
    businessType: 'uav-apply',
    status: 'approved',
    submittedAt: new Date(Date.now() - 86400000).toISOString(),
    userType: 'individual',
    locationInfo: {
      coordinate: { lat: 150, lng: 250 },
      address: '广州市天河区珠江新城花城广场',
      fss: { id: 'fss-gz', name: '广州飞行服务站', type: 'city', description: '市级管辖' }
    },
    formData: {
      applicationType: 'general',
      flightPurpose: '航拍巡检',
      flightDate: '2026-04-02',
      takeoffTime: '14:00',
      flightDuration: 60,
      flightHeight: 120,
      flightRadius: 500,
      airspaceDescription: '花城广场周边空域',
      landingPoint: '同起飞点',
      taskDescription: '例行航拍',
      pilotName: '张三',
      pilotPhone: '138****8888',
      uavModel: 'DJI Mavic 3',
      uavNumber: 'UAV-M3-998',
      uavWeight: 0.9,
      contactName: '张三',
      contactPhone: '138****8888'
    }
  },
  {
    id: 'APP-20260402-002',
    businessType: 'uav-apply',
    status: 'approved',
    submittedAt: new Date(Date.now() - 172800000).toISOString(),
    userType: 'enterprise',
    locationInfo: {
      coordinate: { lat: 300, lng: 450 },
      address: '清远市清城区凤城街道',
      fss: { id: 'fss-gd', name: '广东省飞行服务站', type: 'provincial', description: '省直管' }
    },
    formData: {
      applicationType: 'emergency',
      flightPurpose: '电力巡检',
      flightDate: '2026-04-03',
      takeoffTime: '09:00',
      flightDuration: 120,
      flightHeight: 150,
      flightRadius: 2000,
      airspaceDescription: '清远变电站周边',
      landingPoint: '变电站内',
      taskDescription: '紧急线路排查',
      pilotName: '李四',
      pilotPhone: '139****7777',
      uavModel: 'DJI M300 RTK',
      uavNumber: 'UAV-M300-001',
      uavWeight: 6.3,
      contactName: '王经理',
      contactPhone: '139****7777'
    }
  }
]);

// Takeoff Confirmation State
const showTakeoffSelector = ref(false);
const selectedApprovedApp = ref<FlightApplication | null>(null);

// Certification State
const certView = ref<CertView>('categories');
const selectedCategory = ref<string | null>(null);
const selectedInstanceId = ref<string | null>(null);
const certInstances = ref<CertInstance[]>([]);

// Methods
const handleLoginSuccess = (type: 'individual' | 'enterprise') => {
  userType.value = type;
  isLoggedIn.value = true;
  currentNav.value = '首页';
};

const handleRequestFlight = () => {
  handleOpenFlightFlow();
};

const handleOpenFlightFlow = () => {
  currentNav.value = '飞行申请办理';
  applicationStep.value = 'map';
  declarationView.value = 'grid'; // Ensure we return to grid after flow
};

const handleFlowNext = (location: LocationSelection) => {
  selectedLocation.value = location;
  // Handle next steps (form or external)
  if (location.fss.type === 'city') {
    // Create application record for city FSS
    const newApplication: FlightApplication = {
      id: `APP-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      locationInfo: location,
      formData: {
        applicationType: 'general',
        flightPurpose: '市级系统办理',
        flightDate: '',
        takeoffTime: '',
        flightDuration: 0,
        flightHeight: 0,
        flightRadius: 0,
        airspaceDescription: '跳转至市级飞服系统办理',
        landingPoint: '',
        taskDescription: '',
        pilotName: userType.value === 'individual' ? '张三' : '企业飞手',
        pilotPhone: '138****8888',
        uavModel: '待市级系统填报',
        uavNumber: '待填报',
        uavWeight: 0,
        contactName: userType.value === 'individual' ? '张三' : '企业联系人',
        contactPhone: '138****8888'
      },
      status: 'approved',
      submittedAt: new Date().toISOString(),
      userType: userType.value,
      businessType: 'uav-apply'
    };
    
    // Add to applications list
    flightApplications.value.unshift(newApplication);
    
    // Show redirection overlay
    redirectTarget.value = location.fss.name;
    isRedirecting.value = true;
    
    // Simulate external jump after 2 seconds
    setTimeout(() => {
      const externalUrls = {
        'fss-gz': 'https://www.baidu.com?city=guangzhou',
        'fss-sz': 'https://www.baidu.com?city=shenzhen',
        'fss-zh': 'https://www.baidu.com?city=zhuhai'
      };
      const url = externalUrls[location.fss.id as keyof typeof externalUrls] || 'https://www.baidu.com';
      window.open(url, '_blank');
      
      isRedirecting.value = false;
      currentNav.value = '飞行业务申报';
      recordBusinessType.value = 'uav-apply'; // Set default record filter
      declarationView.value = 'records'; // Redirect to records list
      
      addNotification({
        title: '已跳转至市级系统',
        content: `您已成功跳转至 ${location.fss.name} 进行办理，请在外部页面完成填报。`,
        type: 'info'
      });
    }, 2000);
  } else {
    // Go to internal form step
    applicationStep.value = 'form';
  }
};

const handleLogout = () => {
  isLoggedIn.value = false;
  currentNav.value = '首页';
};

const handleCertViewChange = (view: CertView, category?: string | null, instanceId?: string | null) => {
  certView.value = view;
  if (category !== undefined) selectedCategory.value = category;
  selectedInstanceId.value = instanceId !== undefined ? instanceId : null;
};

const handleAddInstance = (instance: CertInstance) => {
  certInstances.value.push(instance);
};

const handleUpdateInstance = (instance: CertInstance) => {
  const index = certInstances.value.findIndex(i => i.id === instance.id);
  if (index !== -1) certInstances.value[index] = instance;
};

const handleDeleteInstance = (id: string) => {
  certInstances.value = certInstances.value.filter(i => i.id !== id);
};

const handleFormSubmit = (data: any) => {
  flightFormData.value = data;
  
  // Create new application record
  const newApplication: FlightApplication = {
    id: `APP-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    locationInfo: data.locationInfo,
    formData: data.formData,
    status: 'approved',
    submittedAt: new Date().toISOString(),
    userType: userType.value,
    businessType: 'uav-apply'
  };
  
  // Add to applications list
  flightApplications.value.unshift(newApplication);
  
  alert('申请已提交，正在处理中...');
  
  setTimeout(() => {
    applicationStep.value = 'map';
    selectedLocation.value = null;
    currentNav.value = '飞行业务申报';
    declarationView.value = 'records'; // Redirect to records list
  }, 1000);
};

const handleRequestTakeoff = () => {
  currentNav.value = '起飞确认办理';
  declarationView.value = 'grid'; // Ensure we return to grid after flow
};

const handleTakeoffFlowSubmit = (data: any) => {
  const app = data.originalApp;
  
  // 1. Update original application status to active
  const index = flightApplications.value.findIndex(a => a.id === app.id);
  if (index !== -1) {
    flightApplications.value[index].status = 'active';
  }
  
  // 2. Create a takeoff record
  const takeoffRecord: FlightApplication = {
    id: `TKF-${Date.now()}`,
    locationInfo: {
      ...app.locationInfo,
      coordinate: data.actualLocation
    },
    formData: { 
      ...app.formData,
      actualPilot: data.confirmData.actualPilot,
      environmentNote: data.confirmData.environmentNote
    },
    status: 'active',
    submittedAt: new Date().toISOString(),
    userType: userType.value,
    businessType: 'uav-takeoff',
    relatedApplyId: app.id
  };
  flightApplications.value.unshift(takeoffRecord);
  
  currentNav.value = '飞行业务申报';
  recordBusinessType.value = 'uav-takeoff'; // Set default record filter to takeoff
  declarationView.value = 'records'; // Redirect to records list
  
  addNotification({
    title: '起飞确认成功',
    content: `您的飞行活动 ${app.id} 已进入飞行中状态。`,
    type: 'success'
  });
  
  alert('起飞确认成功，飞行状态已激活。');
};

const handleTakeoffFlowRedirect = (data: any) => {
  const app = data.originalApp;
  redirectTarget.value = data.targetFSS.name;
  isRedirecting.value = true;
  
  // 1. Create a takeoff record for the external system
  const takeoffRecord: FlightApplication = {
    id: `TKF-EXT-${Date.now()}`,
    locationInfo: {
      ...app.locationInfo,
      coordinate: data.actualLocation,
      fss: data.targetFSS
    },
    formData: { 
      ...app.formData,
      actualPilot: data.confirmData.actualPilot,
      environmentNote: data.confirmData.environmentNote
    },
    status: 'active', // Mock as active for external system
    submittedAt: new Date().toISOString(),
    userType: userType.value,
    businessType: 'uav-takeoff',
    relatedApplyId: app.id
  };
  flightApplications.value.unshift(takeoffRecord);

  setTimeout(() => {
    // Simulate redirection with context
    const url = `https://www.baidu.com?action=takeoff&apply_id=${app.id}&lat=${data.actualLocation.lat}&lng=${data.actualLocation.lng}`;
    window.open(url, '_blank');
    
    isRedirecting.value = false;
    currentNav.value = '飞行业务申报';
    recordBusinessType.value = 'uav-takeoff'; // Set default record filter to takeoff
    declarationView.value = 'records'; // Redirect to records list
    
    addNotification({
      title: '已跳转至市级系统进行起飞确认',
      content: `您已跳转至 ${data.targetFSS.name} 办理申请 ${app.id} 的起飞确认。`,
      type: 'info'
    });
  }, 2000);
};

const handleRequestLanding = (takeoffRecord?: FlightApplication) => {
  if (!takeoffRecord) {
    // If called from grid, redirect to records and show tip
    declarationView.value = 'records';
    alert('请在申请记录中选择正在进行的飞行活动（飞行中状态）进行降落报告。');
    return;
  }

  if (confirm(`是否对飞行记录 ${takeoffRecord.id} 进行降落报告？`)) {
    // 1. Update takeoff record to completed
    const tkfIndex = flightApplications.value.findIndex(a => a.id === takeoffRecord.id);
    if (tkfIndex !== -1) {
      flightApplications.value[tkfIndex].status = 'completed';
    }
    
    // 2. Update original application to completed
    const relatedId = takeoffRecord.relatedApplyId || takeoffRecord.relatedId;
    if (relatedId) {
      const appIndex = flightApplications.value.findIndex(a => a.id === relatedId);
      if (appIndex !== -1) {
        flightApplications.value[appIndex].status = 'completed';
      }
    }
    
    // 3. Create landing record
    const landingRecord: FlightApplication = {
      id: `LDG-${Date.now()}`,
      locationInfo: takeoffRecord.locationInfo,
      formData: { ...takeoffRecord.formData, landingReportedAt: new Date().toISOString() },
      status: 'completed',
      submittedAt: new Date().toISOString(),
      userType: userType.value,
      businessType: 'uav-landing',
      relatedId: takeoffRecord.id
    };
    flightApplications.value.unshift(landingRecord);
    
    alert('降落报告已提交，本次飞行任务已结束。');
  }
};

const handleFormBack = () => {
  applicationStep.value = 'map';
};

const handleViewApplication = (app: FlightApplication) => {
  selectedAppForDetails.value = app;
  showDetailsModal.value = true;
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

const handleCopyApplication = (app: FlightApplication) => {
  alert(`已复制申请内容，可基于此创建新申请。`);
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

<style>
@keyframes pulse-slow {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-15px); }
}
.animate-pulse-slow {
  animation: pulse-slow 4s ease-in-out infinite;
}
.scrollbar-thin::-webkit-scrollbar {
  width: 6px;
}
.scrollbar-thin::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}
.scrollbar-thin::-webkit-scrollbar-thumb {
  background: #ddd;
  border-radius: 10px;
}
.scrollbar-thin::-webkit-scrollbar-thumb:hover {
  background: #ccc;
}
</style>
