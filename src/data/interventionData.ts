// Intervention Lab - Policy Definitions
// 24 health policy interventions across 8 categories

export type InterventionCategory =
  | 'prevention'
  | 'screening'
  | 'treatment'
  | 'infrastructure'
  | 'workforce'
  | 'digital'
  | 'behavioral'
  | 'fiscal';

export type HealthOutcome =
  | 'diabetes'
  | 'obesity'
  | 'cvd'
  | 'hypertension'
  | 'lifeExpectancy'
  | 'healthyLifeYears'
  | 'healthcareCosts'
  | 'productivity';

export interface DemographicModifier {
  ageGroup: string;
  urbanRural: 'urban' | 'rural' | 'both';
  multiplier: number;
}

export interface SynergyEffect {
  withIntervention: string;
  multiplier: number;
  description: string;
  descriptionAr: string;
}

export interface ImpactCoefficient {
  outcome: HealthOutcome;
  baseEffect: number;
  diminishingThreshold: number;
  demographicWeights: Record<string, number>;
}

export interface PolicyIntervention {
  id: string;
  name: string;
  nameAr: string;
  category: InterventionCategory;
  subcategory: string;
  description: string;
  descriptionAr: string;
  icon: string;

  // Value constraints
  min: number;
  max: number;
  baseline: number;
  unit: string;
  unitAr: string;
  step: number;

  // Cost modeling
  costPerUnit: number; // SAR Billions - negative means revenue
  scalingFunction: 'linear' | 'logarithmic' | 'sigmoid';

  // Dependencies
  prerequisites: string[];
  synergies: SynergyEffect[];
  conflicts: string[];

  // Time dynamics
  implementationDelay: number; // years before effect begins
  rampUpPeriod: number; // years to full effect

  // Impact coefficients
  impacts: ImpactCoefficient[];
}

export const interventionCategories: Record<InterventionCategory, { name: string; nameAr: string; icon: string; color: string }> = {
  prevention: { name: 'Prevention', nameAr: 'الوقاية', icon: '🛡️', color: '#4A7C59' },
  screening: { name: 'Screening', nameAr: 'الفحص', icon: '🔬', color: '#00A0B0' },
  treatment: { name: 'Treatment', nameAr: 'العلاج', icon: '💊', color: '#8B7355' },
  infrastructure: { name: 'Infrastructure', nameAr: 'البنية التحتية', icon: '🏥', color: '#6366F1' },
  workforce: { name: 'Workforce', nameAr: 'القوى العاملة', icon: '👨‍⚕️', color: '#EC4899' },
  digital: { name: 'Digital Health', nameAr: 'الصحة الرقمية', icon: '📱', color: '#10B981' },
  behavioral: { name: 'Behavioral', nameAr: 'السلوكية', icon: '🏃', color: '#F59E0B' },
  fiscal: { name: 'Fiscal Policy', nameAr: 'السياسة المالية', icon: '💰', color: '#EF4444' },
};

export const interventions: PolicyIntervention[] = [
  // ========== PREVENTION (4) ==========
  {
    id: 'sugarTax',
    name: 'Sugar-Sweetened Beverage Tax',
    nameAr: 'ضريبة المشروبات السكرية',
    category: 'prevention',
    subcategory: 'fiscal',
    description: 'Tax on sugary beverages to reduce consumption and generate health revenue',
    descriptionAr: 'ضريبة على المشروبات السكرية لتقليل الاستهلاك وتوليد إيرادات صحية',
    icon: '🥤',
    min: 0,
    max: 50,
    baseline: 0,
    unit: '%',
    unitAr: '٪',
    step: 5,
    costPerUnit: -0.2,
    scalingFunction: 'linear',
    prerequisites: [],
    synergies: [
      { withIntervention: 'nutritionEducation', multiplier: 1.4, description: 'Education amplifies tax effect', descriptionAr: 'التعليم يضاعف تأثير الضريبة' },
      { withIntervention: 'foodLabeling', multiplier: 1.2, description: 'Labels help informed choices', descriptionAr: 'الملصقات تساعد في الاختيارات المدروسة' },
    ],
    conflicts: [],
    implementationDelay: 1,
    rampUpPeriod: 2,
    impacts: [
      { outcome: 'obesity', baseEffect: -0.12, diminishingThreshold: 30, demographicWeights: { '10-19': 1.5, '20-29': 1.3, '30-39': 1.0, '40+': 0.8 } },
      { outcome: 'diabetes', baseEffect: -0.08, diminishingThreshold: 30, demographicWeights: { '40-49': 1.2, '50-59': 1.3, '60+': 1.0 } },
      { outcome: 'cvd', baseEffect: -0.05, diminishingThreshold: 35, demographicWeights: { '50+': 1.2 } },
    ],
  },
  {
    id: 'tobaccoTax',
    name: 'Tobacco Tax Increase',
    nameAr: 'زيادة ضريبة التبغ',
    category: 'prevention',
    subcategory: 'fiscal',
    description: 'Increase tobacco taxation to reduce smoking prevalence',
    descriptionAr: 'زيادة الضرائب على التبغ للحد من انتشار التدخين',
    icon: '🚬',
    min: 0,
    max: 100,
    baseline: 50,
    unit: '%',
    unitAr: '٪',
    step: 10,
    costPerUnit: -0.3,
    scalingFunction: 'logarithmic',
    prerequisites: [],
    synergies: [
      { withIntervention: 'smokingCessation', multiplier: 1.5, description: 'Cessation programs boost quit rates', descriptionAr: 'برامج الإقلاع تعزز معدلات التوقف' },
    ],
    conflicts: [],
    implementationDelay: 0.5,
    rampUpPeriod: 1,
    impacts: [
      { outcome: 'cvd', baseEffect: -0.10, diminishingThreshold: 80, demographicWeights: { '30-49': 1.3, '50+': 1.1 } },
      { outcome: 'lifeExpectancy', baseEffect: 0.02, diminishingThreshold: 80, demographicWeights: {} },
    ],
  },
  {
    id: 'transFatBan',
    name: 'Trans-Fat Ban',
    nameAr: 'حظر الدهون المتحولة',
    category: 'prevention',
    subcategory: 'regulatory',
    description: 'Ban industrial trans-fats in food products',
    descriptionAr: 'حظر الدهون المتحولة الصناعية في المنتجات الغذائية',
    icon: '🍟',
    min: 0,
    max: 100,
    baseline: 0,
    unit: '% compliance',
    unitAr: '٪ امتثال',
    step: 10,
    costPerUnit: 0.05,
    scalingFunction: 'sigmoid',
    prerequisites: ['foodLabeling'],
    synergies: [],
    conflicts: [],
    implementationDelay: 2,
    rampUpPeriod: 3,
    impacts: [
      { outcome: 'cvd', baseEffect: -0.08, diminishingThreshold: 80, demographicWeights: { '40+': 1.3 } },
      { outcome: 'obesity', baseEffect: -0.05, diminishingThreshold: 80, demographicWeights: {} },
    ],
  },
  {
    id: 'foodLabeling',
    name: 'Mandatory Nutrition Labels',
    nameAr: 'ملصقات التغذية الإلزامية',
    category: 'prevention',
    subcategory: 'regulatory',
    description: 'Front-of-pack warning labels on unhealthy foods',
    descriptionAr: 'ملصقات تحذيرية على واجهة المنتجات غير الصحية',
    icon: '🏷️',
    min: 0,
    max: 100,
    baseline: 20,
    unit: '% coverage',
    unitAr: '٪ تغطية',
    step: 10,
    costPerUnit: 0.08,
    scalingFunction: 'linear',
    prerequisites: [],
    synergies: [
      { withIntervention: 'sugarTax', multiplier: 1.2, description: 'Combined effect on purchasing', descriptionAr: 'تأثير مشترك على الشراء' },
      { withIntervention: 'nutritionEducation', multiplier: 1.3, description: 'Educated consumers use labels', descriptionAr: 'المستهلكون المتعلمون يستخدمون الملصقات' },
    ],
    conflicts: [],
    implementationDelay: 1,
    rampUpPeriod: 2,
    impacts: [
      { outcome: 'obesity', baseEffect: -0.06, diminishingThreshold: 70, demographicWeights: { '20-39': 1.3 } },
      { outcome: 'diabetes', baseEffect: -0.04, diminishingThreshold: 70, demographicWeights: {} },
    ],
  },

  // ========== SCREENING (4) ==========
  {
    id: 'ncdScreening',
    name: 'NCD Screening Coverage',
    nameAr: 'تغطية فحص الأمراض غير المعدية',
    category: 'screening',
    subcategory: 'population',
    description: 'Population-wide screening for diabetes, hypertension, and CVD risk',
    descriptionAr: 'فحص شامل للسكان للسكري وارتفاع ضغط الدم ومخاطر أمراض القلب',
    icon: '🩺',
    min: 20,
    max: 95,
    baseline: 42,
    unit: '% coverage',
    unitAr: '٪ تغطية',
    step: 5,
    costPerUnit: 0.15,
    scalingFunction: 'linear',
    prerequisites: [],
    synergies: [
      { withIntervention: 'primaryCare', multiplier: 1.35, description: 'Better follow-up care', descriptionAr: 'متابعة رعاية أفضل' },
      { withIntervention: 'digitalHealthTwin', multiplier: 1.25, description: 'AI-driven risk stratification', descriptionAr: 'تصنيف المخاطر بالذكاء الاصطناعي' },
    ],
    conflicts: [],
    implementationDelay: 1,
    rampUpPeriod: 3,
    impacts: [
      { outcome: 'diabetes', baseEffect: -0.15, diminishingThreshold: 75, demographicWeights: { '40-59': 1.4, '60+': 1.2 } },
      { outcome: 'cvd', baseEffect: -0.12, diminishingThreshold: 75, demographicWeights: { '50+': 1.3 } },
      { outcome: 'hypertension', baseEffect: -0.10, diminishingThreshold: 75, demographicWeights: { '40+': 1.2 } },
      { outcome: 'lifeExpectancy', baseEffect: 0.025, diminishingThreshold: 80, demographicWeights: {} },
    ],
  },
  {
    id: 'cancerScreening',
    name: 'Cancer Screening Programs',
    nameAr: 'برامج فحص السرطان',
    category: 'screening',
    subcategory: 'targeted',
    description: 'Breast, colorectal, and cervical cancer screening programs',
    descriptionAr: 'برامج فحص سرطان الثدي والقولون وعنق الرحم',
    icon: '🎗️',
    min: 10,
    max: 80,
    baseline: 25,
    unit: '% eligible',
    unitAr: '٪ مؤهل',
    step: 5,
    costPerUnit: 0.25,
    scalingFunction: 'linear',
    prerequisites: [],
    synergies: [
      { withIntervention: 'primaryCare', multiplier: 1.2, description: 'PHC referral pathway', descriptionAr: 'مسار الإحالة للرعاية الأولية' },
    ],
    conflicts: [],
    implementationDelay: 2,
    rampUpPeriod: 4,
    impacts: [
      { outcome: 'lifeExpectancy', baseEffect: 0.015, diminishingThreshold: 60, demographicWeights: { '50+': 1.5 } },
      { outcome: 'healthcareCosts', baseEffect: -0.03, diminishingThreshold: 60, demographicWeights: {} },
    ],
  },
  {
    id: 'mentalHealthScreening',
    name: 'Mental Health Screening',
    nameAr: 'فحص الصحة النفسية',
    category: 'screening',
    subcategory: 'targeted',
    description: 'Depression and anxiety screening in primary care settings',
    descriptionAr: 'فحص الاكتئاب والقلق في مراكز الرعاية الأولية',
    icon: '🧠',
    min: 5,
    max: 70,
    baseline: 10,
    unit: '% coverage',
    unitAr: '٪ تغطية',
    step: 5,
    costPerUnit: 0.12,
    scalingFunction: 'linear',
    prerequisites: ['primaryCare'],
    synergies: [
      { withIntervention: 'digitalHealthTwin', multiplier: 1.3, description: 'AI early detection', descriptionAr: 'الكشف المبكر بالذكاء الاصطناعي' },
    ],
    conflicts: [],
    implementationDelay: 2,
    rampUpPeriod: 3,
    impacts: [
      { outcome: 'productivity', baseEffect: 0.05, diminishingThreshold: 50, demographicWeights: { '20-49': 1.4 } },
      { outcome: 'healthyLifeYears', baseEffect: 0.03, diminishingThreshold: 50, demographicWeights: {} },
    ],
  },
  {
    id: 'maternalChildHealth',
    name: 'Maternal & Child Health Checks',
    nameAr: 'فحوصات صحة الأم والطفل',
    category: 'screening',
    subcategory: 'lifecycle',
    description: 'Comprehensive maternal and early childhood health monitoring',
    descriptionAr: 'مراقبة شاملة لصحة الأم والطفولة المبكرة',
    icon: '👶',
    min: 40,
    max: 98,
    baseline: 65,
    unit: '% coverage',
    unitAr: '٪ تغطية',
    step: 5,
    costPerUnit: 0.18,
    scalingFunction: 'linear',
    prerequisites: [],
    synergies: [
      { withIntervention: 'communityHealthWorkers', multiplier: 1.4, description: 'Community outreach', descriptionAr: 'التواصل المجتمعي' },
    ],
    conflicts: [],
    implementationDelay: 1,
    rampUpPeriod: 2,
    impacts: [
      { outcome: 'lifeExpectancy', baseEffect: 0.02, diminishingThreshold: 85, demographicWeights: { '0-9': 2.0 } },
      { outcome: 'healthyLifeYears', baseEffect: 0.04, diminishingThreshold: 85, demographicWeights: { '0-9': 2.0 } },
    ],
  },

  // ========== TREATMENT (4) ==========
  {
    id: 'primaryCare',
    name: 'Primary Care Expansion',
    nameAr: 'توسيع الرعاية الأولية',
    category: 'treatment',
    subcategory: 'access',
    description: 'New primary healthcare centers per 100K population',
    descriptionAr: 'مراكز رعاية صحية أولية جديدة لكل 100 ألف نسمة',
    icon: '🏥',
    min: 0,
    max: 5,
    baseline: 0,
    unit: 'centers/100K',
    unitAr: 'مركز/100 ألف',
    step: 0.5,
    costPerUnit: 2.5,
    scalingFunction: 'linear',
    prerequisites: [],
    synergies: [
      { withIntervention: 'ncdScreening', multiplier: 1.35, description: 'Screening + follow-up', descriptionAr: 'الفحص + المتابعة' },
      { withIntervention: 'chronicDiseaseManagement', multiplier: 1.4, description: 'Integrated care', descriptionAr: 'الرعاية المتكاملة' },
    ],
    conflicts: [],
    implementationDelay: 3,
    rampUpPeriod: 5,
    impacts: [
      { outcome: 'lifeExpectancy', baseEffect: 0.035, diminishingThreshold: 3, demographicWeights: {} },
      { outcome: 'cvd', baseEffect: -0.10, diminishingThreshold: 3, demographicWeights: { '50+': 1.3 } },
      { outcome: 'diabetes', baseEffect: -0.06, diminishingThreshold: 3, demographicWeights: {} },
    ],
  },
  {
    id: 'specialistCare',
    name: 'Specialist Care Access',
    nameAr: 'الوصول للرعاية التخصصية',
    category: 'treatment',
    subcategory: 'access',
    description: 'Reduce wait times and increase specialist availability',
    descriptionAr: 'تقليل أوقات الانتظار وزيادة توفر الأطباء المتخصصين',
    icon: '👨‍⚕️',
    min: 0,
    max: 100,
    baseline: 40,
    unit: '% improvement',
    unitAr: '٪ تحسين',
    step: 10,
    costPerUnit: 1.8,
    scalingFunction: 'logarithmic',
    prerequisites: ['primaryCare'],
    synergies: [
      { withIntervention: 'telemedicine', multiplier: 1.3, description: 'Virtual consultations', descriptionAr: 'الاستشارات الافتراضية' },
    ],
    conflicts: [],
    implementationDelay: 2,
    rampUpPeriod: 4,
    impacts: [
      { outcome: 'cvd', baseEffect: -0.08, diminishingThreshold: 70, demographicWeights: { '50+': 1.4 } },
      { outcome: 'lifeExpectancy', baseEffect: 0.02, diminishingThreshold: 70, demographicWeights: {} },
    ],
  },
  {
    id: 'chronicDiseaseManagement',
    name: 'Chronic Disease Programs',
    nameAr: 'برامج الأمراض المزمنة',
    category: 'treatment',
    subcategory: 'management',
    description: 'Integrated care programs for diabetes, CVD, and hypertension',
    descriptionAr: 'برامج رعاية متكاملة للسكري وأمراض القلب وارتفاع ضغط الدم',
    icon: '📋',
    min: 10,
    max: 90,
    baseline: 25,
    unit: '% enrolled',
    unitAr: '٪ مسجل',
    step: 5,
    costPerUnit: 0.8,
    scalingFunction: 'linear',
    prerequisites: ['primaryCare'],
    synergies: [
      { withIntervention: 'digitalHealthTwin', multiplier: 1.5, description: 'AI-powered personalization', descriptionAr: 'تخصيص بالذكاء الاصطناعي' },
      { withIntervention: 'medicationAccess', multiplier: 1.3, description: 'Treatment adherence', descriptionAr: 'الالتزام بالعلاج' },
    ],
    conflicts: [],
    implementationDelay: 2,
    rampUpPeriod: 3,
    impacts: [
      { outcome: 'diabetes', baseEffect: -0.12, diminishingThreshold: 70, demographicWeights: { '40+': 1.3 } },
      { outcome: 'cvd', baseEffect: -0.10, diminishingThreshold: 70, demographicWeights: {} },
      { outcome: 'healthcareCosts', baseEffect: -0.08, diminishingThreshold: 70, demographicWeights: {} },
    ],
  },
  {
    id: 'medicationAccess',
    name: 'Medication Subsidies',
    nameAr: 'دعم الأدوية',
    category: 'treatment',
    subcategory: 'affordability',
    description: 'Subsidized essential medications for chronic conditions',
    descriptionAr: 'أدوية أساسية مدعومة للحالات المزمنة',
    icon: '💊',
    min: 30,
    max: 100,
    baseline: 55,
    unit: '% coverage',
    unitAr: '٪ تغطية',
    step: 5,
    costPerUnit: 1.2,
    scalingFunction: 'linear',
    prerequisites: [],
    synergies: [
      { withIntervention: 'chronicDiseaseManagement', multiplier: 1.3, description: 'Complete care pathway', descriptionAr: 'مسار الرعاية الكامل' },
    ],
    conflicts: [],
    implementationDelay: 1,
    rampUpPeriod: 2,
    impacts: [
      { outcome: 'hypertension', baseEffect: -0.08, diminishingThreshold: 80, demographicWeights: {} },
      { outcome: 'diabetes', baseEffect: -0.06, diminishingThreshold: 80, demographicWeights: {} },
      { outcome: 'lifeExpectancy', baseEffect: 0.015, diminishingThreshold: 80, demographicWeights: {} },
    ],
  },

  // ========== INFRASTRUCTURE (3) ==========
  {
    id: 'hospitalBeds',
    name: 'Hospital Bed Expansion',
    nameAr: 'توسيع أسرة المستشفيات',
    category: 'infrastructure',
    subcategory: 'capacity',
    description: 'Increase hospital beds per 10,000 population',
    descriptionAr: 'زيادة أسرة المستشفيات لكل 10,000 نسمة',
    icon: '🛏️',
    min: 0,
    max: 10,
    baseline: 0,
    unit: 'beds/10K',
    unitAr: 'سرير/10 آلاف',
    step: 1,
    costPerUnit: 3.5,
    scalingFunction: 'linear',
    prerequisites: [],
    synergies: [
      { withIntervention: 'nurseExpansion', multiplier: 1.25, description: 'Staffed capacity', descriptionAr: 'القدرة الاستيعابية' },
    ],
    conflicts: [],
    implementationDelay: 5,
    rampUpPeriod: 7,
    impacts: [
      { outcome: 'lifeExpectancy', baseEffect: 0.01, diminishingThreshold: 5, demographicWeights: {} },
      { outcome: 'cvd', baseEffect: -0.05, diminishingThreshold: 5, demographicWeights: { '60+': 1.4 } },
    ],
  },
  {
    id: 'clinicNetwork',
    name: 'Clinic Network Growth',
    nameAr: 'نمو شبكة العيادات',
    category: 'infrastructure',
    subcategory: 'access',
    description: 'Expand community clinic coverage especially in rural areas',
    descriptionAr: 'توسيع تغطية العيادات المجتمعية خاصة في المناطق الريفية',
    icon: '🏪',
    min: 0,
    max: 50,
    baseline: 10,
    unit: '% expansion',
    unitAr: '٪ توسع',
    step: 5,
    costPerUnit: 1.5,
    scalingFunction: 'logarithmic',
    prerequisites: [],
    synergies: [
      { withIntervention: 'communityHealthWorkers', multiplier: 1.35, description: 'Community integration', descriptionAr: 'التكامل المجتمعي' },
    ],
    conflicts: [],
    implementationDelay: 3,
    rampUpPeriod: 5,
    impacts: [
      { outcome: 'lifeExpectancy', baseEffect: 0.02, diminishingThreshold: 35, demographicWeights: {} },
      { outcome: 'healthcareCosts', baseEffect: -0.04, diminishingThreshold: 35, demographicWeights: {} },
    ],
  },
  {
    id: 'emergencyResponse',
    name: 'Emergency Response Upgrade',
    nameAr: 'تطوير الاستجابة للطوارئ',
    category: 'infrastructure',
    subcategory: 'emergency',
    description: 'Improve ambulance coverage and emergency room capacity',
    descriptionAr: 'تحسين تغطية الإسعاف وقدرة غرف الطوارئ',
    icon: '🚑',
    min: 0,
    max: 100,
    baseline: 30,
    unit: '% improvement',
    unitAr: '٪ تحسين',
    step: 10,
    costPerUnit: 0.9,
    scalingFunction: 'logarithmic',
    prerequisites: [],
    synergies: [],
    conflicts: [],
    implementationDelay: 2,
    rampUpPeriod: 3,
    impacts: [
      { outcome: 'cvd', baseEffect: -0.06, diminishingThreshold: 70, demographicWeights: { '50+': 1.5 } },
      { outcome: 'lifeExpectancy', baseEffect: 0.01, diminishingThreshold: 70, demographicWeights: {} },
    ],
  },

  // ========== WORKFORCE (3) ==========
  {
    id: 'physicianTraining',
    name: 'Physician Training Pipeline',
    nameAr: 'خط تدريب الأطباء',
    category: 'workforce',
    subcategory: 'education',
    description: 'Medical school expansion and residency programs',
    descriptionAr: 'توسيع كليات الطب وبرامج الإقامة',
    icon: '🎓',
    min: 0,
    max: 100,
    baseline: 20,
    unit: '% increase',
    unitAr: '٪ زيادة',
    step: 10,
    costPerUnit: 2.2,
    scalingFunction: 'linear',
    prerequisites: [],
    synergies: [
      { withIntervention: 'specialistCare', multiplier: 1.3, description: 'More specialists available', descriptionAr: 'توفر المزيد من المتخصصين' },
    ],
    conflicts: [],
    implementationDelay: 7,
    rampUpPeriod: 10,
    impacts: [
      { outcome: 'lifeExpectancy', baseEffect: 0.025, diminishingThreshold: 60, demographicWeights: {} },
      { outcome: 'cvd', baseEffect: -0.05, diminishingThreshold: 60, demographicWeights: {} },
    ],
  },
  {
    id: 'nurseExpansion',
    name: 'Nurse & Allied Health',
    nameAr: 'التمريض والصحة المساندة',
    category: 'workforce',
    subcategory: 'training',
    description: 'Train and recruit nurses and allied health professionals',
    descriptionAr: 'تدريب وتوظيف الممرضين ومهنيي الصحة المساندة',
    icon: '👩‍⚕️',
    min: 0,
    max: 100,
    baseline: 30,
    unit: '% increase',
    unitAr: '٪ زيادة',
    step: 10,
    costPerUnit: 1.4,
    scalingFunction: 'linear',
    prerequisites: [],
    synergies: [
      { withIntervention: 'hospitalBeds', multiplier: 1.25, description: 'Staffed beds', descriptionAr: 'أسرة مجهزة بالكادر' },
      { withIntervention: 'primaryCare', multiplier: 1.2, description: 'PHC staffing', descriptionAr: 'تزويد الرعاية الأولية بالكادر' },
    ],
    conflicts: [],
    implementationDelay: 4,
    rampUpPeriod: 6,
    impacts: [
      { outcome: 'lifeExpectancy', baseEffect: 0.015, diminishingThreshold: 70, demographicWeights: {} },
      { outcome: 'healthcareCosts', baseEffect: -0.03, diminishingThreshold: 70, demographicWeights: {} },
    ],
  },
  {
    id: 'communityHealthWorkers',
    name: 'Community Health Workers',
    nameAr: 'عمال صحة المجتمع',
    category: 'workforce',
    subcategory: 'community',
    description: 'Train community health workers for prevention and education',
    descriptionAr: 'تدريب عمال صحة المجتمع للوقاية والتعليم',
    icon: '🤝',
    min: 0,
    max: 100,
    baseline: 5,
    unit: '% coverage',
    unitAr: '٪ تغطية',
    step: 5,
    costPerUnit: 0.6,
    scalingFunction: 'linear',
    prerequisites: [],
    synergies: [
      { withIntervention: 'maternalChildHealth', multiplier: 1.4, description: 'Home visits', descriptionAr: 'الزيارات المنزلية' },
      { withIntervention: 'clinicNetwork', multiplier: 1.35, description: 'Community link', descriptionAr: 'الربط المجتمعي' },
    ],
    conflicts: [],
    implementationDelay: 2,
    rampUpPeriod: 4,
    impacts: [
      { outcome: 'diabetes', baseEffect: -0.05, diminishingThreshold: 60, demographicWeights: { '40+': 1.2 } },
      { outcome: 'obesity', baseEffect: -0.06, diminishingThreshold: 60, demographicWeights: {} },
      { outcome: 'lifeExpectancy', baseEffect: 0.01, diminishingThreshold: 60, demographicWeights: {} },
    ],
  },

  // ========== DIGITAL (3) ==========
  {
    id: 'digitalHealthTwin',
    name: 'Personal Health AI',
    nameAr: 'الذكاء الاصطناعي للصحة الشخصية',
    category: 'digital',
    subcategory: 'ai',
    description: 'AI-powered personal health assistant and digital twin',
    descriptionAr: 'مساعد صحي شخصي وتوأم رقمي مدعوم بالذكاء الاصطناعي',
    icon: '🤖',
    min: 5,
    max: 100,
    baseline: 15,
    unit: '% adoption',
    unitAr: '٪ تبني',
    step: 5,
    costPerUnit: 0.12,
    scalingFunction: 'sigmoid',
    prerequisites: ['ehrIntegration'],
    synergies: [
      { withIntervention: 'chronicDiseaseManagement', multiplier: 1.5, description: 'Personalized care', descriptionAr: 'الرعاية المخصصة' },
      { withIntervention: 'ncdScreening', multiplier: 1.25, description: 'Risk prediction', descriptionAr: 'التنبؤ بالمخاطر' },
      { withIntervention: 'mentalHealthScreening', multiplier: 1.3, description: 'Mental health monitoring', descriptionAr: 'مراقبة الصحة النفسية' },
    ],
    conflicts: [],
    implementationDelay: 2,
    rampUpPeriod: 4,
    impacts: [
      { outcome: 'diabetes', baseEffect: -0.12, diminishingThreshold: 70, demographicWeights: { '30-59': 1.3 } },
      { outcome: 'obesity', baseEffect: -0.08, diminishingThreshold: 70, demographicWeights: { '20-49': 1.2 } },
      { outcome: 'cvd', baseEffect: -0.10, diminishingThreshold: 70, demographicWeights: {} },
      { outcome: 'lifeExpectancy', baseEffect: 0.03, diminishingThreshold: 80, demographicWeights: {} },
    ],
  },
  {
    id: 'telemedicine',
    name: 'Telemedicine Platforms',
    nameAr: 'منصات التطبيب عن بعد',
    category: 'digital',
    subcategory: 'access',
    description: 'Virtual consultations and remote monitoring',
    descriptionAr: 'الاستشارات الافتراضية والمراقبة عن بعد',
    icon: '📹',
    min: 10,
    max: 80,
    baseline: 20,
    unit: '% visits',
    unitAr: '٪ زيارات',
    step: 5,
    costPerUnit: 0.3,
    scalingFunction: 'logarithmic',
    prerequisites: [],
    synergies: [
      { withIntervention: 'specialistCare', multiplier: 1.3, description: 'Remote specialists', descriptionAr: 'متخصصون عن بعد' },
      { withIntervention: 'mentalHealthScreening', multiplier: 1.35, description: 'Mental health access', descriptionAr: 'الوصول للصحة النفسية' },
    ],
    conflicts: [],
    implementationDelay: 1,
    rampUpPeriod: 2,
    impacts: [
      { outcome: 'healthcareCosts', baseEffect: -0.06, diminishingThreshold: 60, demographicWeights: {} },
      { outcome: 'lifeExpectancy', baseEffect: 0.01, diminishingThreshold: 60, demographicWeights: {} },
    ],
  },
  {
    id: 'ehrIntegration',
    name: 'Health Data Integration',
    nameAr: 'تكامل البيانات الصحية',
    category: 'digital',
    subcategory: 'infrastructure',
    description: 'National electronic health records integration',
    descriptionAr: 'تكامل السجلات الصحية الإلكترونية الوطنية',
    icon: '🔗',
    min: 20,
    max: 100,
    baseline: 40,
    unit: '% integration',
    unitAr: '٪ تكامل',
    step: 10,
    costPerUnit: 0.5,
    scalingFunction: 'sigmoid',
    prerequisites: [],
    synergies: [
      { withIntervention: 'digitalHealthTwin', multiplier: 1.4, description: 'Data foundation', descriptionAr: 'أساس البيانات' },
    ],
    conflicts: [],
    implementationDelay: 3,
    rampUpPeriod: 5,
    impacts: [
      { outcome: 'healthcareCosts', baseEffect: -0.05, diminishingThreshold: 80, demographicWeights: {} },
      { outcome: 'lifeExpectancy', baseEffect: 0.01, diminishingThreshold: 80, demographicWeights: {} },
    ],
  },

  // ========== BEHAVIORAL (3) ==========
  {
    id: 'physicalActivity',
    name: 'Activity Campaigns',
    nameAr: 'حملات النشاط البدني',
    category: 'behavioral',
    subcategory: 'lifestyle',
    description: 'National physical activity promotion and infrastructure',
    descriptionAr: 'تعزيز النشاط البدني الوطني والبنية التحتية',
    icon: '🏃',
    min: 10,
    max: 80,
    baseline: 25,
    unit: '% reach',
    unitAr: '٪ وصول',
    step: 5,
    costPerUnit: 0.08,
    scalingFunction: 'linear',
    prerequisites: [],
    synergies: [
      { withIntervention: 'schoolNutrition', multiplier: 1.3, description: 'Youth habits', descriptionAr: 'عادات الشباب' },
      { withIntervention: 'digitalHealthTwin', multiplier: 1.25, description: 'Activity tracking', descriptionAr: 'تتبع النشاط' },
    ],
    conflicts: [],
    implementationDelay: 1,
    rampUpPeriod: 3,
    impacts: [
      { outcome: 'obesity', baseEffect: -0.18, diminishingThreshold: 60, demographicWeights: { '20-49': 1.3 } },
      { outcome: 'cvd', baseEffect: -0.08, diminishingThreshold: 60, demographicWeights: {} },
      { outcome: 'diabetes', baseEffect: -0.10, diminishingThreshold: 60, demographicWeights: {} },
      { outcome: 'lifeExpectancy', baseEffect: 0.02, diminishingThreshold: 65, demographicWeights: {} },
    ],
  },
  {
    id: 'nutritionEducation',
    name: 'Nutrition Programs',
    nameAr: 'برامج التغذية',
    category: 'behavioral',
    subcategory: 'education',
    description: 'Public nutrition education and healthy eating initiatives',
    descriptionAr: 'تعليم التغذية العامة ومبادرات الأكل الصحي',
    icon: '🥗',
    min: 10,
    max: 80,
    baseline: 20,
    unit: '% reach',
    unitAr: '٪ وصول',
    step: 5,
    costPerUnit: 0.1,
    scalingFunction: 'linear',
    prerequisites: [],
    synergies: [
      { withIntervention: 'sugarTax', multiplier: 1.4, description: 'Tax + education combo', descriptionAr: 'مزيج الضريبة والتعليم' },
      { withIntervention: 'foodLabeling', multiplier: 1.3, description: 'Label comprehension', descriptionAr: 'فهم الملصقات' },
    ],
    conflicts: [],
    implementationDelay: 1,
    rampUpPeriod: 3,
    impacts: [
      { outcome: 'obesity', baseEffect: -0.10, diminishingThreshold: 60, demographicWeights: { '20-39': 1.3 } },
      { outcome: 'diabetes', baseEffect: -0.06, diminishingThreshold: 60, demographicWeights: {} },
    ],
  },
  {
    id: 'schoolNutrition',
    name: 'School Nutrition',
    nameAr: 'التغذية المدرسية',
    category: 'behavioral',
    subcategory: 'youth',
    description: 'Healthy school meal programs and nutrition education',
    descriptionAr: 'برامج الوجبات المدرسية الصحية وتعليم التغذية',
    icon: '🍎',
    min: 10,
    max: 100,
    baseline: 35,
    unit: '% schools',
    unitAr: '٪ مدارس',
    step: 5,
    costPerUnit: 0.18,
    scalingFunction: 'linear',
    prerequisites: [],
    synergies: [
      { withIntervention: 'physicalActivity', multiplier: 1.3, description: 'Comprehensive youth health', descriptionAr: 'صحة الشباب الشاملة' },
    ],
    conflicts: [],
    implementationDelay: 1,
    rampUpPeriod: 3,
    impacts: [
      { outcome: 'obesity', baseEffect: -0.15, diminishingThreshold: 80, demographicWeights: { '10-19': 2.0, '0-9': 1.5 } },
      { outcome: 'diabetes', baseEffect: -0.05, diminishingThreshold: 80, demographicWeights: { '10-19': 1.5 } },
      { outcome: 'lifeExpectancy', baseEffect: 0.01, diminishingThreshold: 85, demographicWeights: {} },
    ],
  },

  // ========== FISCAL (1) ==========
  {
    id: 'priceControls',
    name: 'Healthcare Price Controls',
    nameAr: 'ضوابط أسعار الرعاية الصحية',
    category: 'fiscal',
    subcategory: 'regulation',
    description: 'Regulate healthcare service and pharmaceutical pricing',
    descriptionAr: 'تنظيم أسعار الخدمات الصحية والأدوية',
    icon: '📊',
    min: 0,
    max: 50,
    baseline: 10,
    unit: '% reduction',
    unitAr: '٪ تخفيض',
    step: 5,
    costPerUnit: 0.2,
    scalingFunction: 'logarithmic',
    prerequisites: [],
    synergies: [
      { withIntervention: 'medicationAccess', multiplier: 1.2, description: 'Affordable meds', descriptionAr: 'أدوية ميسورة' },
    ],
    conflicts: [],
    implementationDelay: 2,
    rampUpPeriod: 3,
    impacts: [
      { outcome: 'healthcareCosts', baseEffect: -0.08, diminishingThreshold: 35, demographicWeights: {} },
    ],
  },
];

// Baseline national health statistics
export const baselineStats = {
  diabetesPrevalence: 16.4,
  obesityRate: 30.5,
  cvdPrevalence: 8.2,
  hypertensionPrevalence: 15.2,
  lifeExpectancy: 78.8,
  healthyLifeExpectancy: 65,
  healthcareCostsBn: 125,
  productivityLossBn: 45,
  population: 35.3,
};

// Provincial intervention effectiveness multipliers
export const provincialMultipliers: Record<string, Record<string, number>> = {
  riyadh: { urban: 1.1, digital: 1.2, screening: 1.0 },
  makkah: { urban: 1.0, digital: 1.1, screening: 0.95 },
  eastern: { urban: 1.05, digital: 1.15, screening: 1.0 },
  madinah: { urban: 0.95, digital: 1.0, screening: 1.0 },
  asir: { urban: 0.85, digital: 0.9, screening: 1.1 },
  jazan: { urban: 0.75, digital: 0.8, screening: 1.2 },
  qassim: { urban: 0.9, digital: 0.95, screening: 1.05 },
  tabuk: { urban: 0.8, digital: 0.85, screening: 1.1 },
  hail: { urban: 0.85, digital: 0.9, screening: 1.1 },
  najran: { urban: 0.75, digital: 0.8, screening: 1.15 },
  aljawf: { urban: 0.8, digital: 0.85, screening: 1.1 },
  northernBorders: { urban: 0.7, digital: 0.75, screening: 1.2 },
  albahah: { urban: 0.8, digital: 0.85, screening: 1.1 },
};

// Get intervention by ID
export const getInterventionById = (id: string): PolicyIntervention | undefined => {
  return interventions.find(i => i.id === id);
};

// Get interventions by category
export const getInterventionsByCategory = (category: InterventionCategory): PolicyIntervention[] => {
  return interventions.filter(i => i.category === category);
};

// Calculate total cost for a set of interventions
export const calculateTotalCost = (values: Record<string, number>): number => {
  return interventions.reduce((total, intervention) => {
    const value = values[intervention.id] ?? intervention.baseline;
    const change = value - intervention.baseline;
    const normalizedChange = change / (intervention.max - intervention.min);
    return total + (normalizedChange * intervention.costPerUnit * 10); // Scale to reasonable budget
  }, 0);
};
