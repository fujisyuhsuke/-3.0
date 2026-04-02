import { Coordinate, FSSInfo, FlightApplication, UserType } from '../types';

/**
 * 飞服站判断逻辑 (FSS Judge & Router)
 * 
 * 逻辑定义：输入起飞点的经纬度坐标。
 * 判断规则：
 * - 如果坐标落在“广州、深圳、珠海”定义的地理围栏内 -> 路由至 “广深珠飞服站”。
 * - 如果落在广东省其他区域 -> 路由至 “广东省飞服站”。
 */
export const judgeFSS = (coord: Coordinate): FSSInfo => {
  // 模拟地理围栏判断 (广深珠区域)
  // 广州中心: 113.26, 23.13
  // 深圳中心: 114.05, 22.54
  // 珠海中心: 113.57, 22.27
  
  // 调整地理围栏边界，确保城市间不重叠，省级区域有明确判定空间
  const isGuangzhou = coord.lng > 113.0 && coord.lng < 113.8 && coord.lat > 22.8 && coord.lat < 23.8;
  const isShenzhen = coord.lng > 113.8 && coord.lng < 114.6 && coord.lat > 22.4 && coord.lat < 22.9;
  const isZhuhai = coord.lng > 113.0 && coord.lng < 113.8 && coord.lat > 21.8 && coord.lat < 22.4;

  if (isGuangzhou) {
    return {
      id: 'fss-gz',
      name: '广州飞行服务站',
      type: 'city',
      description: '由广州市飞服站负责审批与管理'
    };
  }

  if (isShenzhen) {
    return {
      id: 'fss-sz',
      name: '深圳飞行服务站',
      type: 'city',
      description: '由深圳市飞服站负责审批与管理'
    };
  }

  if (isZhuhai) {
    return {
      id: 'fss-zh',
      name: '珠海飞行服务站',
      type: 'city',
      description: '由珠海市飞服站负责审批与管理'
    };
  }

  return {
    id: 'fss-gd',
    name: '广东省飞行服务站',
    type: 'provincial',
    description: '由广东省飞服站直管区域'
  };
};

/**
 * 禁飞区判定逻辑 (Restricted Area Judge)
 */
export const checkRestrictedArea = (coord: Coordinate) => {
  // 模拟禁飞区 (机场周边、政府核心区等)
  const restrictedZones = [
    { name: '广州白云机场禁飞区', lng: 113.30, lat: 23.39, radius: 0.15 },
    { name: '深圳宝安机场禁飞区', lng: 113.81, lat: 22.62, radius: 0.12 },
    { name: '珠海金湾机场禁飞区', lng: 113.37, lat: 22.01, radius: 0.10 },
    { name: '省政府核心敏感区', lng: 113.26, lat: 23.13, radius: 0.05 }
  ];

  for (const zone of restrictedZones) {
    const distance = Math.sqrt(
      Math.pow(coord.lng - zone.lng, 2) + Math.pow(coord.lat - zone.lat, 2)
    );
    if (distance < zone.radius) {
      return {
        isRestricted: true,
        reason: zone.name,
        type: 'no-fly'
      };
    }
  }

  return { isRestricted: false };
};

/**
 * 进度同步器 (Progress Synchronizer)
 * 
 * 处理外部系统（广深珠）返回后的状态更新。
 */
export const syncExternalStatus = async (applicationId: string) => {
  console.log(`正在同步外部系统状态: ${applicationId}`);
  // 模拟异步请求
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        status: 'approved',
        syncTime: new Date().toISOString(),
        externalRef: `EXT-${Math.floor(Math.random() * 10000)}`
      });
    }, 1500);
  });
};

/**
 * 资质数据预填充器 (Data Pre-filler)
 */
export const getPreFilledData = (userType: 'individual' | 'enterprise') => {
  if (userType === 'individual') {
    return {
      pilotName: '张三',
      idCard: '4401**********1234',
      uavSn: 'UAV-2024-0001'
    };
  }
  return {
    enterpriseName: '广东某航测技术有限公司',
    orgCode: '91440101MA59XXXXXX',
    gaLicense: 'GA-2024-088'
  };
};

/**
 * 获取待提交降落报告的飞行活动 (Awaiting Landing Report Fetcher)
 */
export const getFlightsAwaitingLandingReport = (
  applications: FlightApplication[],
  userType: UserType
) => {
  // 1. 查找当前用户类型下所有处于“飞行中”状态的起飞记录
  const activeTakeoffs = applications.filter(
    app => app.businessType === 'uav-takeoff' && app.status === 'active' && app.userType === userType
  );

  // 2. 过滤掉已经提交过降落报告的记录
  const awaitingFlights = activeTakeoffs.filter(takeoff => {
    const hasLandingReport = applications.some(
      app => app.businessType === 'uav-landing' && app.relatedTakeoffId === takeoff.id
    );
    return !hasLandingReport;
  }).map(takeoff => {
    // 3. 关联原始飞行活动申请
    const originalApp = applications.find(app => app.id === takeoff.relatedApplyId);
    
    return {
      takeoff_confirm_id: takeoff.id,
      takeoff_time: takeoff.submittedAt,
      actual_takeoff_point: `${takeoff.locationInfo.coordinate.lng.toFixed(6)}, ${takeoff.locationInfo.coordinate.lat.toFixed(6)}`,
      flight_application_id: originalApp?.id || 'N/A',
      flight_purpose: originalApp?.formData.flightPurpose || 'N/A',
      airspace: originalApp?.formData.airspaceDescription || takeoff.locationInfo.address,
      planned_landing_point: originalApp?.formData.landingPoint || 'N/A',
      flight_duration_plan: `${originalApp?.formData.flightDuration || 0}分钟`,
      status: "已起飞待降落报告",
      // 用于超时计算的额外信息
      planned_duration_minutes: originalApp?.formData.flightDuration || 0,
      originalApp: originalApp,
      takeoffRecord: takeoff
    };
  });

  return { awaiting_flights: awaitingFlights };
};
