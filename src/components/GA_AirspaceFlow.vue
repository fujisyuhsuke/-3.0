<template>
  <div class="flex flex-col h-full bg-white overflow-hidden relative">
    <!-- Top Header -->
    <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white z-10">
      <div class="flex items-center gap-4">
        <button 
          @click="handleBack" 
          class="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
        >
          <ArrowLeft :size="20" />
        </button>
        <div>
          <h2 class="text-lg font-bold text-gray-800">通航空域申请</h2>
          <div class="flex items-center gap-2 mt-0.5">
            <span class="text-[10px] px-1.5 py-0.5 bg-indigo-100 text-indigo-700 rounded font-bold uppercase">
              步骤 {{ currentStep }}/3：{{ stepTitles[currentStep-1] }}
            </span>
          </div>
        </div>
      </div>
      
      <!-- Step Progress -->
      <div class="hidden md:flex items-center gap-8">
        <div v-for="(title, index) in stepTitles" :key="index" class="flex items-center gap-2">
          <div :class="['w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all', currentStep > index + 1 ? 'bg-emerald-500 text-white' : currentStep === index + 1 ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-400']">
            <Check v-if="currentStep > index + 1" :size="14" />
            <span v-else>{{ index + 1 }}</span>
          </div>
          <span :class="['text-xs font-medium', currentStep === index + 1 ? 'text-indigo-600' : 'text-gray-400']">{{ title }}</span>
          <div v-if="index < stepTitles.length - 1" class="w-8 h-px bg-gray-100 ml-2"></div>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <div class="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-bold border border-indigo-100 flex items-center gap-1">
          <ShieldCheck :size="14" />
          GA 资质已同步
        </div>
      </div>
    </div>

    <!-- Content Area -->
    <div :class="['flex-1 relative', currentStep !== 2 ? 'overflow-y-auto bg-gray-50/50 scrollbar-thin' : 'overflow-hidden bg-gray-100']">
      <!-- Step 1 & 3: Centered Form Layout -->
      <div v-if="currentStep !== 2" class="max-w-5xl mx-auto p-8">
        
        <!-- Step 1: Qualification Confirmation -->
        <div v-if="currentStep === 1" class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div class="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
            <div class="flex items-center justify-between mb-8">
              <div>
                <h3 class="text-xl font-bold text-gray-800">资质信息确认</h3>
                <p class="text-sm text-gray-500 mt-1">系统已自动同步您的 GA 通航企业及相关人员、设备资质，请核对。</p>
              </div>
              <button @click="currentStep = 2" class="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center gap-2">
                确认无误，下一步
                <ArrowRight :size="16" />
              </button>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <!-- Enterprise Info -->
              <div class="p-6 bg-indigo-50/50 rounded-2xl border border-indigo-100">
                <div class="flex items-center gap-2 mb-4 text-indigo-600">
                  <Building2 :size="18" />
                  <span class="text-xs font-bold uppercase tracking-wider">申请单位信息</span>
                </div>
                <div v-if="gaEnterprise" class="space-y-3">
                  <p class="text-sm font-bold text-gray-800">{{ gaEnterprise.data.companyName }}</p>
                  <div class="space-y-1">
                    <p class="text-[10px] text-gray-400">经营许可编号</p>
                    <p class="text-xs text-gray-600 font-mono">{{ gaEnterprise.data.opQualification }}</p>
                  </div>
                  <div class="pt-2">
                    <span class="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded">资质有效</span>
                  </div>
                </div>
                <div v-else class="py-4 text-center">
                  <p class="text-xs text-amber-600">未检测到有效的通航企业认证</p>
                </div>
              </div>

              <!-- Aircrafts Info -->
              <div class="p-6 bg-violet-50/50 rounded-2xl border border-violet-100">
                <div class="flex items-center gap-2 mb-4 text-violet-600">
                  <Plane :size="18" />
                  <span class="text-xs font-bold uppercase tracking-wider">可用飞行器 ({{ gaAircrafts.length }})</span>
                </div>
                <div v-if="gaAircrafts.length > 0" class="space-y-3">
                  <div v-for="ac in gaAircrafts.slice(0, 2)" :key="ac.id" class="flex items-center justify-between">
                    <div>
                      <p class="text-xs font-bold text-gray-700">{{ ac.data.aircraftType }}</p>
                      <p class="text-[10px] text-gray-400 font-mono">{{ ac.data.regNumber }}</p>
                    </div>
                    <CheckCircle :size="14" class="text-emerald-500" />
                  </div>
                  <p v-if="gaAircrafts.length > 2" class="text-[10px] text-violet-600 font-bold">+ 更多 {{ gaAircrafts.length - 2 }} 架已同步</p>
                </div>
                <div v-else class="py-4 text-center">
                  <p class="text-xs text-amber-600">未检测到通航飞行器认证</p>
                </div>
              </div>

              <!-- Pilots Info -->
              <div class="p-6 bg-blue-50/50 rounded-2xl border border-blue-100">
                <div class="flex items-center gap-2 mb-4 text-blue-600">
                  <Users :size="18" />
                  <span class="text-xs font-bold uppercase tracking-wider">在册飞行员 ({{ gaPilots.length }})</span>
                </div>
                <div v-if="gaPilots.length > 0" class="space-y-3">
                  <div v-for="p in gaPilots.slice(0, 2)" :key="p.id" class="flex items-center justify-between">
                    <div>
                      <p class="text-xs font-bold text-gray-700">{{ p.data.name }}</p>
                      <p class="text-[10px] text-gray-400 font-mono">{{ p.data.licenseId }}</p>
                    </div>
                    <CheckCircle :size="14" class="text-emerald-500" />
                  </div>
                  <p v-if="gaPilots.length > 2" class="text-[10px] text-blue-600 font-bold">+ 更多 {{ gaPilots.length - 2 }} 名已同步</p>
                </div>
                <div v-else class="py-4 text-center">
                  <p class="text-xs text-amber-600">未检测到通航飞行员认证</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Tip -->
          <div class="p-6 bg-amber-50 rounded-2xl border border-amber-100 flex gap-4">
            <div class="w-10 h-10 bg-white rounded-full flex items-center justify-center text-amber-500 shrink-0">
              <Info :size="20" />
            </div>
            <div>
              <h4 class="text-sm font-bold text-amber-800 mb-1">资质同步说明</h4>
              <p class="text-xs text-amber-700 leading-relaxed">
                系统已根据您的企业身份自动拉取“通航飞行企业认证”、“通航飞行器认证”及“通航飞行员认证”信息。
                若信息有误或需新增，请前往“资质认证”模块进行更新。通航空域申请需确保所有资质均在有效期内。
              </p>
            </div>
          </div>
        </div>

        <!-- Step 3: Security Plan & Validation -->
        <div v-else-if="currentStep === 3" class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div class="max-w-3xl mx-auto space-y-8">
            <div class="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-8">
              <div>
                <h3 class="text-xl font-bold text-gray-800">飞行保障方案</h3>
                <p class="text-sm text-gray-500 mt-1">请详细描述本次飞行活动的通讯保障、气象保障及应急处置方案。</p>
              </div>

              <div class="space-y-6">
                <div class="space-y-2">
                  <label class="text-xs font-bold text-gray-700">保障方案详述 <span class="text-red-500">*</span></label>
                  <textarea 
                    v-model="formData.securityPlan"
                    rows="8" 
                    class="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    placeholder="请包括以下内容：
1. 通讯链路保障措施
2. 气象条件监控方式
3. 突发情况应急处置流程（如失去链路、误入禁区等）
4. 地面保障人员配置"
                  ></textarea>
                </div>

                <div class="space-y-2">
                  <label class="text-xs font-bold text-gray-700">附件上传 (可选)</label>
                  <div class="border-2 border-dashed border-gray-100 rounded-2xl p-8 text-center hover:border-indigo-200 transition-colors cursor-pointer group">
                    <div class="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 mx-auto mb-3 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all">
                      <Upload :size="20" />
                    </div>
                    <p class="text-xs text-gray-500">点击或拖拽上传详细保障方案 PDF/DOC</p>
                    <p class="text-[10px] text-gray-400 mt-1">文件大小不超过 20MB</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Final Compliance Check -->
            <div class="bg-indigo-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
              <div class="absolute -right-10 -bottom-10 opacity-10">
                <ShieldCheck :size="200" />
              </div>
              
              <div class="relative z-10">
                <div class="flex items-center gap-3 mb-6">
                  <div class="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                    <Zap :size="20" class="text-amber-400" />
                  </div>
                  <h4 class="text-lg font-bold">合规性最终预校验</h4>
                </div>

                <div class="space-y-4 mb-8">
                  <div v-for="(check, i) in complianceChecks" :key="i" class="flex items-center justify-between py-3 border-b border-white/10">
                    <div class="flex items-center gap-3">
                      <div :class="['w-5 h-5 rounded-full flex items-center justify-center', check.passed ? 'bg-emerald-500' : 'bg-amber-500']">
                        <Check v-if="check.passed" :size="12" />
                        <AlertTriangle v-else :size="12" />
                      </div>
                      <span class="text-sm font-medium">{{ check.label }}</span>
                    </div>
                    <span :class="['text-[10px] font-bold px-2 py-0.5 rounded uppercase', check.passed ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300']">
                      {{ check.passed ? '通过' : '待修正' }}
                    </span>
                  </div>
                </div>

                <button 
                  @click="handleSubmit"
                  :disabled="!isCompliancePassed"
                  :class="['w-full py-4 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-2xl', 
                    isCompliancePassed ? 'bg-white text-indigo-900 hover:bg-indigo-50' : 'bg-white/10 text-white/30 cursor-not-allowed shadow-none']"
                >
                  <span>提交申请至省低空数据融合中心</span>
                  <Send :size="18" />
                </button>
                <p class="text-center text-[10px] text-white/40 mt-4">
                  提交后，申请将同步至 4 个飞行服务站及相关军民航系统进行并行审批
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Step 2: Airspace Planning (Full Screen Map Style) -->
      <div v-else class="h-full relative animate-in fade-in duration-500 overflow-hidden">
        <!-- Map Background -->
        <div class="absolute inset-0 bg-gray-100">
          <div class="absolute inset-0 bg-[url('https://picsum.photos/seed/ga-map/1200/800')] bg-cover bg-center opacity-80"></div>
          <div class="absolute inset-0 bg-indigo-900/10 pointer-events-none"></div>
          
          <!-- Mock Polygon -->
          <svg class="absolute inset-0 w-full h-full pointer-events-none">
            <polygon points="400,250 750,220 800,500 450,550" fill="rgba(79, 70, 229, 0.2)" stroke="rgba(79, 70, 229, 0.8)" stroke-width="2" stroke-dasharray="4" />
            <circle cx="400" cy="250" r="4" fill="white" stroke="#4f46e9" stroke-width="2" />
            <circle cx="750" cy="220" r="4" fill="white" stroke="#4f46e9" stroke-width="2" />
            <circle cx="800" cy="500" r="4" fill="white" stroke="#4f46e9" stroke-width="2" />
            <circle cx="450" cy="550" r="4" fill="white" stroke="#4f46e9" stroke-width="2" />
          </svg>
        </div>

        <!-- Left Tool Panel -->
        <div class="absolute top-6 left-6 w-72 space-y-4">
          <div class="bg-white/90 backdrop-blur-md p-6 rounded-3xl shadow-2xl border border-white/50">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-sm font-bold text-gray-800">绘制工具</h3>
              <div class="flex gap-1">
                <button class="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors">
                  <Square :size="16" />
                </button>
                <button class="p-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
                  <Trash2 :size="16" />
                </button>
              </div>
            </div>
            <p class="text-[10px] text-gray-500 leading-relaxed">
              请在地图上点击绘制空域边界点，闭合路径以完成空域范围规划。
            </p>
          </div>

          <div class="bg-white/90 backdrop-blur-md p-6 rounded-3xl shadow-2xl border border-white/50">
            <p class="text-[10px] font-bold text-gray-400 uppercase mb-3 tracking-wider">坐标点集 (WGS84)</p>
            <div class="space-y-2 max-h-48 overflow-y-auto scrollbar-thin pr-2">
              <div v-for="i in 4" :key="i" class="flex items-center justify-between p-2 bg-gray-50/50 rounded-lg text-[10px] font-mono text-gray-600">
                <span class="font-bold text-indigo-600">P{{ i }}</span>
                <span>113.{{ 2345 + i * 12 }}, 23.{{ 1234 + i * 8 }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Parameter Panel -->
        <div class="absolute top-6 right-6 w-80 space-y-4">
          <div class="bg-white/90 backdrop-blur-md p-6 rounded-3xl shadow-2xl border border-white/50 space-y-6">
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
                <Settings2 :size="16" />
              </div>
              <h4 class="text-sm font-bold text-gray-800">空域参数设置</h4>
            </div>

            <div class="space-y-4">
              <div class="space-y-1.5">
                <label class="text-[10px] font-bold text-gray-400 uppercase tracking-wider">空域使用用途</label>
                <select v-model="formData.airspaceUsage" class="w-full px-4 py-2 bg-gray-50/50 border border-gray-100 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all">
                  <option value="training">飞行训练</option>
                  <option value="survey">航空摄影/测绘</option>
                  <option value="agriculture">农林喷洒</option>
                  <option value="emergency">应急救援</option>
                  <option value="scientific">科学实验</option>
                </select>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div class="space-y-1.5">
                  <label class="text-[10px] font-bold text-gray-400 uppercase tracking-wider">高度 (真高)</label>
                  <div class="relative">
                    <input type="number" v-model="formData.flightHeightAGL" class="w-full pl-3 pr-8 py-2 bg-gray-50/50 border border-gray-100 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
                    <span class="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-bold text-gray-400">m</span>
                  </div>
                </div>
                <div class="space-y-1.5">
                  <label class="text-[10px] font-bold text-gray-400 uppercase tracking-wider">高度 (海拔)</label>
                  <div class="relative">
                    <input type="number" v-model="formData.flightHeightMSL" class="w-full pl-3 pr-8 py-2 bg-gray-50/50 border border-gray-100 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
                    <span class="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-bold text-gray-400">m</span>
                  </div>
                </div>
              </div>

              <div class="space-y-1.5">
                <label class="text-[10px] font-bold text-gray-400 uppercase tracking-wider">使用时间范围</label>
                <div class="space-y-2">
                  <input type="datetime-local" v-model="formData.startTime" class="w-full px-4 py-2 bg-gray-50/50 border border-gray-100 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
                  <input type="datetime-local" v-model="formData.endTime" class="w-full px-4 py-2 bg-gray-50/50 border border-gray-100 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
                </div>
              </div>
            </div>

            <!-- Compliance Status -->
            <div class="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100">
              <div class="flex items-center justify-between mb-2">
                <span class="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">合规性预校核</span>
                <ShieldCheck :size="14" class="text-emerald-500" />
              </div>
              <div class="space-y-1.5">
                <div class="flex items-center gap-2 text-[10px] text-indigo-700">
                  <div class="w-1 h-1 bg-emerald-500 rounded-full"></div>
                  高度符合 GA 标准
                </div>
                <div class="flex items-center gap-2 text-[10px] text-indigo-700">
                  <div class="w-1 h-1 bg-emerald-500 rounded-full"></div>
                  时间提前量符合要求
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Bottom Right Controls -->
        <div class="absolute bottom-8 right-8 flex flex-col items-end gap-4">
          <!-- Map Zoom -->
          <div class="flex flex-col bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-white/50 overflow-hidden">
            <button class="p-3 hover:bg-gray-100 text-gray-600 transition-colors border-b border-gray-100">
              <Plus :size="18" />
            </button>
            <button class="p-3 hover:bg-gray-100 text-gray-600 transition-colors">
              <Minus :size="18" />
            </button>
          </div>

          <!-- Next Button -->
          <button 
            @click="currentStep = 3"
            class="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold text-sm hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-200 flex items-center gap-3 group"
          >
            下一步：保障方案
            <ArrowRight :size="20" class="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { 
  ArrowLeft, ArrowRight, Check, ShieldCheck, Building2, Plane, Users, 
  CheckCircle, Info, MapPin, Square, Trash2, Plus, Minus, Settings2, 
  ChevronDown, Upload, Zap, AlertTriangle, Send 
} from 'lucide-vue-next';
import { FlightApplication, UserType, CertInstance, Coordinate } from '../types';

const props = defineProps<{
  applications: FlightApplication[];
  userType: UserType;
  certInstances: CertInstance[];
}>();

const emit = defineEmits(['back', 'submit']);

const currentStep = ref(1);
const stepTitles = ['资质确认', '空域规划', '保障方案'];

const formData = ref({
  airspaceUsage: 'survey',
  flightHeightAGL: 300,
  flightHeightMSL: 450,
  startTime: '',
  endTime: '',
  securityPlan: '',
  coordinates: [] as Coordinate[]
});

// Mock GA Certs
const gaEnterprise = computed(() => props.certInstances.find(i => i.category === '通航飞行企业认证' && i.status === 'approved'));
const gaAircrafts = computed(() => props.certInstances.filter(i => i.category === '通航飞行器认证' && i.status === 'approved'));
const gaPilots = computed(() => props.certInstances.filter(i => i.category === '通航飞行员认证' && i.status === 'approved'));

const complianceChecks = computed(() => [
  { label: '企业资质有效性校验', passed: !!gaEnterprise.value },
  { label: '飞行高度合规性校验 (GA标准)', passed: formData.value.flightHeightAGL <= 1000 },
  { label: '保障方案完整性校验', passed: formData.value.securityPlan.length > 20 },
  { label: '空域范围重叠度校验', passed: true }
]);

const isCompliancePassed = computed(() => complianceChecks.value.every(c => c.passed));

onMounted(() => {
  // Set default times
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(9, 0, 0, 0);
  
  const dayAfter = new Date(tomorrow);
  dayAfter.setHours(18, 0, 0, 0);

  const format = (d: Date) => {
    const offset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - offset).toISOString().slice(0, 16);
  };

  formData.value.startTime = format(tomorrow);
  formData.value.endTime = format(dayAfter);
});

const handleBack = () => {
  if (currentStep.value > 1) {
    currentStep.value--;
  } else {
    emit('back');
  }
};

const handleSubmit = () => {
  if (isCompliancePassed.value) {
    emit('submit', {
      formData: {
        ...formData.value,
        applicantUnit: gaEnterprise.value?.data.companyName || '未知 GA 企业',
        airspaceDescription: `GA 申请空域 (${formData.value.airspaceUsage})`,
        applicationType: 'general'
      },
      businessType: 'ga-airspace'
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
