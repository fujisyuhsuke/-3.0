export interface Coordinate {
  lat: number;
  lng: number;
}

export interface FSSInfo {
  id: string;
  name: string;
  type: 'provincial' | 'city';
  description: string;
}

export interface LocationSelection {
  coordinate: Coordinate;
  address: string;
  fss: FSSInfo;
}

export type LoginTab = 'qrcode' | 'account';
export type RegisterStep = 'type' | 'info' | 'verify' | 'sign' | 'complete';
export type RegisterType = 'individual' | 'enterprise';
export type UserType = RegisterType;

export type BusinessType = 
  | 'uav-apply'    // 无人机飞行活动申请
  | 'uav-takeoff'  // 无人机起飞确认
  | 'uav-landing'  // 无人机降落报告
  | 'ga-airspace'   // 通航空域申请
  | 'ga-apply';     // 通航飞行计划

export type ApplicationStatus = 
  | 'pending'    // 待处理
  | 'processing' // 审核中
  | 'approved'   // 已批准
  | 'rejected'   // 已拒绝
  | 'active'     // 飞行中 (起飞确认后)
  | 'completed';  // 已结束 (降落报告后)

export interface FlightFormData {
  applicationType: 'general' | 'emergency' | 'longTerm' | 'indoor';
  flightPurpose: string;      // 飞行目的
  flightDate: string;         // 飞行日期
  takeoffTime: string;        // 预计起飞时间
  flightDuration: number;     // 预计时长(分钟)
  flightHeight: number;       // 飞行高度(米)
  flightRadius: number;       // 飞行半径(米)
  airspaceDescription: string; // 飞行空域描述
  landingPoint: string;       // 降落点
  taskDescription: string;    // 任务说明
  
  // 资质同步字段
  pilotId?: string;           // 关联的飞手资质ID
  pilotName: string;
  pilotPhone: string;
  uavId?: string;             // 关联 of the UAV qualification ID
  uavModel: string;
  uavNumber: string;          // Serial number/registration code
  uavWeight: number;          // Weight (kg)
  
  // 起飞确认/降落报告额外字段
  actualTakeoffTime?: string;
  actualLandingTime?: string;
  missionStatus?: string;
  abnormalEvents?: string;

  // 通航空域申请额外字段
  applicantUnit?: string;      // 申请单位
  airspaceUsage?: string;      // 空域使用用途
  startTime?: string;          // 开始时间
  endTime?: string;            // 结束时间
  flightHeightAGL?: number;    // 飞行高度 (真高)
  flightHeightMSL?: number;    // 飞行高度 (海拔)
  securityPlan?: string;       // 保障方案
  coordinates?: Coordinate[];  // 坐标点集合
}

export interface GA_ApprovalNode {
  name: string;               // 节点名称 (如: 飞行服务站A)
  status: 'pending' | 'approved' | 'rejected' | 'none';
  time?: string;
  comment?: string;
}

export interface FlightApplication {
  id: string;
  businessType: BusinessType;
  status: ApplicationStatus;
  submittedAt: string;
  userType: UserType;
  locationInfo: LocationSelection;
  formData: FlightFormData;
  // 关联字段
  relatedApplyId?: string;   // 起飞确认关联的申请ID
  relatedTakeoffId?: string; // 降落报告关联的起飞ID
  // 通航审批节点
  approvalNodes?: GA_ApprovalNode[];
}

export type CertView = 'categories' | 'instances' | 'detail' | 'form';

export interface CertInstance {
  id: string;
  category: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  approvedAt?: string;
  data: Record<string, any>;
}

export interface FormField {
  id: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'textarea' | 'datetime-local' | 'date';
  placeholder?: string;
  options?: string[];
  colSpan?: number;
  pattern?: string;
}

export interface FormConfig {
  fields: FormField[];
}

export interface CertCategory {
  id: string;
  title: string;
  desc: string;
  icon: string;
  allowedFor: RegisterType[];
  isSingleInstance?: boolean;
  titleField: string; // Field ID used for card title
}
