// Stories - Individual archetypes, journey timelines, generational views
// Making health data personal and relatable

import React, { useState } from 'react';
import { interventions } from '../../data/interventionData';
import type { SimulationResult } from '../../utils/simulationEngine';

interface StoriesProps {
  language: 'en' | 'ar';
  darkMode: boolean;
  interventionValues: Record<string, number>;
  simulationResult: SimulationResult;
  timeHorizon: number;
}

type StoryMode = 'individual' | 'generational' | 'ministry';
type MinistryView = 'health' | 'finance';

// Archetype definitions
interface Archetype {
  id: string;
  name: string;
  nameAr: string;
  age: number;
  province: string;
  provinceAr: string;
  portrait: string;
  bio: string;
  bioAr: string;
  currentRisks: string[];
  currentRisksAr: string[];
  relevantInterventions: string[];
  baselineOutcome: string;
  baselineOutcomeAr: string;
  interventionOutcome: string;
  interventionOutcomeAr: string;
  journeyMilestones: {
    year: number;
    event: string;
    eventAr: string;
    status: 'healthy' | 'at-risk' | 'diagnosed' | 'managed' | 'improved';
    interventionId?: string;
  }[];
}

const archetypes: Archetype[] = [
  {
    id: 'fatima',
    name: 'Fatima Al-Rashid',
    nameAr: 'فاطمة الراشد',
    age: 52,
    province: 'Riyadh',
    provinceAr: 'الرياض',
    portrait: '👩',
    bio: 'A school administrator and mother of three. Recently noticed fatigue and increased thirst but hasn\'t had time for a checkup in years.',
    bioAr: 'مديرة مدرسة وأم لثلاثة أطفال. لاحظت مؤخرًا الإرهاق وزيادة العطش لكنها لم تجد وقتًا للفحص منذ سنوات.',
    currentRisks: ['Pre-diabetes', 'Overweight', 'Sedentary lifestyle'],
    currentRisksAr: ['ما قبل السكري', 'زيادة الوزن', 'نمط حياة خامل'],
    relevantInterventions: ['ncdScreening', 'primaryCare', 'digitalHealthTwin', 'physicalActivity'],
    baselineOutcome: 'Without intervention: 65% chance of Type 2 diabetes within 5 years, complications by age 65',
    baselineOutcomeAr: 'بدون تدخل: 65٪ احتمال للإصابة بالسكري من النوع 2 خلال 5 سنوات، ومضاعفات بحلول سن 65',
    interventionOutcome: 'With screening + lifestyle programs: Diabetes risk reduced to 25%, maintaining health into 70s',
    interventionOutcomeAr: 'مع الفحص + برامج نمط الحياة: ينخفض خطر السكري إلى 25٪، والحفاظ على الصحة حتى السبعينات',
    journeyMilestones: [
      { year: 2025, event: 'Routine screening catches elevated HbA1c', eventAr: 'الفحص الروتيني يكشف ارتفاع HbA1c', status: 'at-risk', interventionId: 'ncdScreening' },
      { year: 2026, event: 'Enrolled in diabetes prevention program', eventAr: 'التسجيل في برنامج الوقاية من السكري', status: 'at-risk', interventionId: 'primaryCare' },
      { year: 2027, event: 'Personal health AI recommends dietary changes', eventAr: 'الذكاء الاصطناعي يوصي بتغييرات غذائية', status: 'at-risk', interventionId: 'digitalHealthTwin' },
      { year: 2028, event: 'HbA1c returns to normal range', eventAr: 'HbA1c يعود للمعدل الطبيعي', status: 'improved' },
      { year: 2030, event: 'Celebrating 5 years diabetes-free', eventAr: 'الاحتفال بـ5 سنوات بدون سكري', status: 'healthy' },
      { year: 2035, event: 'Active grandmother, enjoying retirement', eventAr: 'جدة نشطة تستمتع بالتقاعد', status: 'healthy' },
    ],
  },
  {
    id: 'ahmed',
    name: 'Ahmed Hassan',
    nameAr: 'أحمد حسن',
    age: 35,
    province: 'Eastern Province',
    provinceAr: 'المنطقة الشرقية',
    portrait: '👨',
    bio: 'Software engineer at an oil company. Long hours at desk, frequent takeout meals, BMI of 32.',
    bioAr: 'مهندس برمجيات في شركة نفط. ساعات طويلة على المكتب، وجبات سريعة متكررة، مؤشر كتلة الجسم 32.',
    currentRisks: ['Obesity', 'High blood pressure', 'Poor diet'],
    currentRisksAr: ['السمنة', 'ارتفاع ضغط الدم', 'نظام غذائي سيء'],
    relevantInterventions: ['sugarTax', 'nutritionEducation', 'physicalActivity', 'foodLabeling'],
    baselineOutcome: 'Without intervention: Type 2 diabetes by 45, heart disease by 55',
    baselineOutcomeAr: 'بدون تدخل: سكري النوع 2 بحلول 45، أمراض القلب بحلول 55',
    interventionOutcome: 'With sugar tax + education: Weight management, healthy cardiovascular system',
    interventionOutcomeAr: 'مع ضريبة السكر + التعليم: إدارة الوزن، نظام قلبي وعائي صحي',
    journeyMilestones: [
      { year: 2025, event: 'Sugar tax makes sugary drinks more expensive', eventAr: 'ضريبة السكر ترفع أسعار المشروبات السكرية', status: 'at-risk', interventionId: 'sugarTax' },
      { year: 2026, event: 'Company wellness program provides nutrition counseling', eventAr: 'برنامج صحة الشركة يوفر استشارات تغذية', status: 'at-risk', interventionId: 'nutritionEducation' },
      { year: 2027, event: 'Joins workplace walking group', eventAr: 'ينضم لمجموعة المشي في العمل', status: 'at-risk', interventionId: 'physicalActivity' },
      { year: 2028, event: 'BMI drops to 27, blood pressure normalizes', eventAr: 'مؤشر كتلة الجسم ينخفض إلى 27، ضغط الدم يعود طبيعي', status: 'improved' },
      { year: 2032, event: 'Maintains healthy weight, runs 5K events', eventAr: 'يحافظ على وزن صحي، يشارك في سباقات 5 كيلو', status: 'healthy' },
      { year: 2040, event: 'Heart healthy at 50, no medications needed', eventAr: 'قلب سليم في الـ50، لا حاجة لأدوية', status: 'healthy' },
    ],
  },
  {
    id: 'khalid',
    name: 'Khalid Al-Mutairi',
    nameAr: 'خالد المطيري',
    age: 68,
    province: 'Makkah',
    provinceAr: 'مكة المكرمة',
    portrait: '👴',
    bio: 'Retired teacher with a history of heart disease. Takes 5 medications daily, struggles with coordination between specialists.',
    bioAr: 'معلم متقاعد لديه تاريخ مع أمراض القلب. يتناول 5 أدوية يوميًا، يعاني من صعوبة التنسيق بين الأطباء.',
    currentRisks: ['CVD history', 'Polypharmacy', 'Limited mobility'],
    currentRisksAr: ['تاريخ أمراض القلب', 'تعدد الأدوية', 'محدودية الحركة'],
    relevantInterventions: ['chronicDiseaseManagement', 'medicationAccess', 'telemedicine', 'specialistCare'],
    baselineOutcome: 'Without intervention: Frequent hospitalizations, declining quality of life',
    baselineOutcomeAr: 'بدون تدخل: دخول متكرر للمستشفى، تدهور جودة الحياة',
    interventionOutcome: 'With chronic care + telemedicine: Stable condition, independent living',
    interventionOutcomeAr: 'مع الرعاية المزمنة + الطب عن بعد: حالة مستقرة، حياة مستقلة',
    journeyMilestones: [
      { year: 2025, event: 'Enrolled in chronic disease management program', eventAr: 'التسجيل في برنامج إدارة الأمراض المزمنة', status: 'diagnosed', interventionId: 'chronicDiseaseManagement' },
      { year: 2026, event: 'Medications consolidated, costs reduced', eventAr: 'توحيد الأدوية وتخفيض التكاليف', status: 'managed', interventionId: 'medicationAccess' },
      { year: 2027, event: 'Monthly virtual check-ins with cardiologist', eventAr: 'متابعة شهرية افتراضية مع طبيب القلب', status: 'managed', interventionId: 'telemedicine' },
      { year: 2028, event: 'Zero hospitalizations this year', eventAr: 'صفر دخول للمستشفى هذا العام', status: 'improved' },
      { year: 2030, event: 'Volunteering at local mosque, active community member', eventAr: 'يتطوع في المسجد، عضو مجتمع نشط', status: 'healthy' },
      { year: 2035, event: 'Celebrating 80th birthday in good health', eventAr: 'يحتفل بعيد ميلاده الـ80 بصحة جيدة', status: 'healthy' },
    ],
  },
  {
    id: 'noura',
    name: 'Noura Saleh',
    nameAr: 'نورة صالح',
    age: 12,
    province: 'Jazan',
    provinceAr: 'جازان',
    portrait: '👧',
    bio: 'Elementary school student in a rural area. Limited access to healthy food options, high screen time, already showing weight concerns.',
    bioAr: 'طالبة ابتدائية في منطقة ريفية. وصول محدود للخيارات الغذائية الصحية، وقت شاشة مرتفع، تظهر بالفعل مخاوف بشأن الوزن.',
    currentRisks: ['Childhood obesity risk', 'Limited healthy food access', 'Sedentary habits'],
    currentRisksAr: ['خطر السمنة في الطفولة', 'وصول محدود للطعام الصحي', 'عادات خاملة'],
    relevantInterventions: ['schoolNutrition', 'physicalActivity', 'foodLabeling', 'communityHealthWorkers'],
    baselineOutcome: 'Without intervention: Obesity by 18, diabetes risk by 30',
    baselineOutcomeAr: 'بدون تدخل: السمنة بحلول 18، خطر السكري بحلول 30',
    interventionOutcome: 'With school programs: Healthy habits, normal weight trajectory',
    interventionOutcomeAr: 'مع البرامج المدرسية: عادات صحية، مسار وزن طبيعي',
    journeyMilestones: [
      { year: 2025, event: 'School introduces healthy meal program', eventAr: 'المدرسة تقدم برنامج الوجبات الصحية', status: 'at-risk', interventionId: 'schoolNutrition' },
      { year: 2026, event: 'Daily PE class becomes mandatory', eventAr: 'حصة التربية البدنية اليومية تصبح إلزامية', status: 'at-risk', interventionId: 'physicalActivity' },
      { year: 2027, event: 'Community health worker visits family', eventAr: 'عامل صحة المجتمع يزور العائلة', status: 'at-risk', interventionId: 'communityHealthWorkers' },
      { year: 2028, event: 'BMI normalized, joins school sports team', eventAr: 'مؤشر كتلة الجسم طبيعي، تنضم لفريق المدرسة الرياضي', status: 'improved' },
      { year: 2035, event: 'University student, maintains healthy lifestyle', eventAr: 'طالبة جامعية، تحافظ على نمط حياة صحي', status: 'healthy' },
      { year: 2045, event: 'Teaching her own children healthy habits', eventAr: 'تعلم أطفالها العادات الصحية', status: 'healthy' },
    ],
  },
];

// Archetype Card Component
const ArchetypeCard: React.FC<{
  archetype: Archetype;
  isSelected: boolean;
  onSelect: () => void;
  interventionValues: Record<string, number>;
  language: 'en' | 'ar';
}> = ({ archetype, isSelected, onSelect, interventionValues, language }) => {
  // Calculate how many relevant interventions are active
  const activeCount = archetype.relevantInterventions.filter(id => {
    const intervention = interventions.find(i => i.id === id);
    if (!intervention) return false;
    return interventionValues[id] > intervention.baseline;
  }).length;

  const totalRelevant = archetype.relevantInterventions.length;
  const coverage = (activeCount / totalRelevant) * 100;

  return (
    <div
      className={`archetype-card ${isSelected ? 'selected' : ''}`}
      onClick={onSelect}
    >
      <div className="archetype-portrait">{archetype.portrait}</div>
      <div className="archetype-info">
        <h4>{language === 'ar' ? archetype.nameAr : archetype.name}</h4>
        <p className="archetype-meta">
          {archetype.age} {language === 'ar' ? 'سنة' : 'years'} • {language === 'ar' ? archetype.provinceAr : archetype.province}
        </p>
        <div className="coverage-bar">
          <div className="coverage-fill" style={{ width: `${coverage}%` }} />
        </div>
        <p className="coverage-label">
          {activeCount}/{totalRelevant} {language === 'ar' ? 'تدخلات نشطة' : 'interventions active'}
        </p>
      </div>
    </div>
  );
};

// Journey Timeline Component
const JourneyTimeline: React.FC<{
  archetype: Archetype;
  interventionValues: Record<string, number>;
  language: 'en' | 'ar';
  timeHorizon: number;
}> = ({ archetype, interventionValues, language, timeHorizon }) => {
  const currentYear = 2025;
  const endYear = currentYear + timeHorizon;

  // Filter milestones within time horizon
  const visibleMilestones = archetype.journeyMilestones.filter(m => m.year <= endYear);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return '#4A7C59';
      case 'improved': return '#10B981';
      case 'managed': return '#00A0B0';
      case 'at-risk': return '#F59E0B';
      case 'diagnosed': return '#EF4444';
      default: return '#8B8B8B';
    }
  };

  const isInterventionActive = (interventionId?: string) => {
    if (!interventionId) return true;
    const intervention = interventions.find(i => i.id === interventionId);
    if (!intervention) return false;
    return interventionValues[interventionId] > intervention.baseline;
  };

  return (
    <div className="journey-timeline">
      <div className="timeline-header">
        <h4>{language === 'ar' ? 'رحلة' : 'Journey of'} {language === 'ar' ? archetype.nameAr : archetype.name}</h4>
      </div>

      {/* Bio and risks */}
      <div className="timeline-bio">
        <p>{language === 'ar' ? archetype.bioAr : archetype.bio}</p>
        <div className="risk-tags">
          {(language === 'ar' ? archetype.currentRisksAr : archetype.currentRisks).map((risk, i) => (
            <span key={i} className="risk-tag">{risk}</span>
          ))}
        </div>
      </div>

      {/* Outcomes comparison */}
      <div className="outcomes-comparison">
        <div className="outcome baseline">
          <span className="outcome-icon">⚠️</span>
          <div>
            <strong>{language === 'ar' ? 'بدون تدخل' : 'Without Intervention'}</strong>
            <p>{language === 'ar' ? archetype.baselineOutcomeAr : archetype.baselineOutcome}</p>
          </div>
        </div>
        <div className="outcome intervention">
          <span className="outcome-icon">✨</span>
          <div>
            <strong>{language === 'ar' ? 'مع التدخلات' : 'With Interventions'}</strong>
            <p>{language === 'ar' ? archetype.interventionOutcomeAr : archetype.interventionOutcome}</p>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="timeline-track">
        {visibleMilestones.map((milestone, i) => {
          const active = isInterventionActive(milestone.interventionId);
          const intervention = milestone.interventionId ? interventions.find(int => int.id === milestone.interventionId) : null;

          return (
            <div
              key={i}
              className={`milestone ${active ? 'active' : 'inactive'}`}
            >
              <div className="milestone-year">{milestone.year}</div>
              <div
                className="milestone-dot"
                style={{ backgroundColor: active ? getStatusColor(milestone.status) : '#9CA3AF' }}
              />
              <div className="milestone-content">
                <p className="milestone-event">
                  {language === 'ar' ? milestone.eventAr : milestone.event}
                </p>
                {intervention && (
                  <span className={`intervention-tag ${active ? 'active' : ''}`}>
                    {intervention.icon} {language === 'ar' ? intervention.nameAr : intervention.name}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Generational View Component
const GenerationalView: React.FC<{
  simulationResult: SimulationResult;
  language: 'en' | 'ar';
}> = ({ simulationResult, language }) => {
  const { outcomeDeltas } = simulationResult;

  const generations = [
    {
      name: language === 'ar' ? 'الجيل الحالي' : 'Current Generation',
      years: '2025-2040',
      icon: '👨‍👩‍👧‍👦',
      impact: Math.abs(outcomeDeltas.diabetes) + Math.abs(outcomeDeltas.cvd),
    },
    {
      name: language === 'ar' ? 'الأطفال' : 'Children',
      years: '2040-2060',
      icon: '👶',
      impact: (Math.abs(outcomeDeltas.diabetes) + Math.abs(outcomeDeltas.obesity)) * 1.3,
    },
    {
      name: language === 'ar' ? 'الأحفاد' : 'Grandchildren',
      years: '2060-2080',
      icon: '🌱',
      impact: (Math.abs(outcomeDeltas.diabetes) + Math.abs(outcomeDeltas.obesity)) * 1.6,
    },
  ];

  return (
    <div className="generational-view">
      <h4>{language === 'ar' ? 'الأثر عبر الأجيال' : 'Impact Across Generations'}</h4>
      <p className="generational-subtitle">
        {language === 'ar'
          ? 'قراراتك السياسية اليوم ستؤثر على 3 أجيال'
          : 'Your policy decisions today will affect 3 generations'}
      </p>

      <div className="generations-track">
        {generations.map((gen, i) => (
          <div key={i} className="generation-card">
            <div className="gen-icon">{gen.icon}</div>
            <div className="gen-name">{gen.name}</div>
            <div className="gen-years">{gen.years}</div>
            <div className="gen-impact">
              <div className="impact-bar" style={{ width: `${Math.min(100, gen.impact * 2)}%` }} />
              <span className="impact-value">{gen.impact.toFixed(0)}%</span>
            </div>
            <div className="gen-description">
              {i === 0 && (language === 'ar' ? 'التأثير المباشر' : 'Direct impact')}
              {i === 1 && (language === 'ar' ? 'عادات صحية موروثة' : 'Inherited healthy habits')}
              {i === 2 && (language === 'ar' ? 'تغيير ثقافي دائم' : 'Lasting cultural change')}
            </div>
          </div>
        ))}
      </div>

      <div className="compound-effect">
        <span className="compound-icon">📈</span>
        <span className="compound-text">
          {language === 'ar'
            ? 'التأثير المركب يتضاعف بنسبة 60٪ كل جيل'
            : 'Compound effect multiplies by 60% each generation'}
        </span>
      </div>
    </div>
  );
};

// Ministry Perspective Component
const MinistryPerspective: React.FC<{
  view: MinistryView;
  simulationResult: SimulationResult;
  language: 'en' | 'ar';
}> = ({ view, simulationResult, language }) => {
  const { economicImpact, outcomeDeltas } = simulationResult;

  if (view === 'health') {
    return (
      <div className="ministry-view health">
        <div className="ministry-header">
          <span className="ministry-icon">🏥</span>
          <h4>{language === 'ar' ? 'منظور وزارة الصحة' : 'Ministry of Health Perspective'}</h4>
        </div>
        <div className="ministry-metrics">
          <div className="metric">
            <span className="metric-label">{language === 'ar' ? 'انخفاض السكري' : 'Diabetes Reduction'}</span>
            <span className="metric-value">{outcomeDeltas.diabetes.toFixed(1)}%</span>
          </div>
          <div className="metric">
            <span className="metric-label">{language === 'ar' ? 'زيادة العمر المتوقع' : 'Life Expectancy Gain'}</span>
            <span className="metric-value">+{outcomeDeltas.lifeExpectancy.toFixed(1)}%</span>
          </div>
          <div className="metric">
            <span className="metric-label">{language === 'ar' ? 'سنوات الحياة المعدلة' : 'QALYs Gained'}</span>
            <span className="metric-value">{(economicImpact.qalyGained / 1000000).toFixed(2)}M</span>
          </div>
        </div>
        <div className="ministry-focus">
          <strong>{language === 'ar' ? 'الأولوية:' : 'Priority:'}</strong>
          {language === 'ar' ? ' تحسين صحة السكان وتقليل عبء المرض' : ' Improve population health and reduce disease burden'}
        </div>
      </div>
    );
  }

  return (
    <div className="ministry-view finance">
      <div className="ministry-header">
        <span className="ministry-icon">💰</span>
        <h4>{language === 'ar' ? 'منظور وزارة المالية' : 'Ministry of Finance Perspective'}</h4>
      </div>
      <div className="ministry-metrics">
        <div className="metric">
          <span className="metric-label">{language === 'ar' ? 'الاستثمار المطلوب' : 'Investment Required'}</span>
          <span className="metric-value">{economicImpact.totalCost.toFixed(1)} Bn</span>
        </div>
        <div className="metric">
          <span className="metric-label">{language === 'ar' ? 'وفورات الرعاية الصحية' : 'Healthcare Savings'}</span>
          <span className="metric-value">+{economicImpact.healthcareSavings.toFixed(1)} Bn</span>
        </div>
        <div className="metric">
          <span className="metric-label">{language === 'ar' ? 'العائد على الاستثمار' : 'ROI'}</span>
          <span className="metric-value">{economicImpact.roi}%</span>
        </div>
      </div>
      <div className="ministry-focus">
        <strong>{language === 'ar' ? 'الأولوية:' : 'Priority:'}</strong>
        {language === 'ar' ? ' تعظيم العائد الاقتصادي وترشيد الإنفاق الصحي' : ' Maximize economic return and optimize health spending'}
      </div>
    </div>
  );
};

const Stories: React.FC<StoriesProps> = ({
  language,
  darkMode: _darkMode,
  interventionValues,
  simulationResult,
  timeHorizon,
}) => {
  void _darkMode; // Available for dark mode specific styling
  const [storyMode, setStoryMode] = useState<StoryMode>('individual');
  const [selectedArchetype, setSelectedArchetype] = useState<string>('fatima');
  const [ministryView, setMinistryView] = useState<MinistryView>('health');

  const currentArchetype = archetypes.find(a => a.id === selectedArchetype) || archetypes[0];

  const t = {
    title: language === 'ar' ? 'القصص' : 'Stories',
    subtitle: language === 'ar' ? 'اجعل البيانات شخصية' : 'Making Data Personal',
    individual: language === 'ar' ? 'قصص فردية' : 'Individual',
    generational: language === 'ar' ? 'عبر الأجيال' : 'Generational',
    ministry: language === 'ar' ? 'منظور الوزارة' : 'Ministry View',
    selectPerson: language === 'ar' ? 'اختر شخصًا' : 'Select a Person',
    health: language === 'ar' ? 'الصحة' : 'Health',
    finance: language === 'ar' ? 'المالية' : 'Finance',
  };

  return (
    <div className="stories-tab">
      {/* Header */}
      <div className="stories-header">
        <h2>{t.title}</h2>
        <p>{t.subtitle}</p>
        <div className="mode-toggles">
          {(['individual', 'generational', 'ministry'] as StoryMode[]).map(mode => (
            <button
              key={mode}
              className={`mode-btn ${storyMode === mode ? 'active' : ''}`}
              onClick={() => setStoryMode(mode)}
            >
              {mode === 'individual' && '👤'}
              {mode === 'generational' && '👨‍👩‍👧‍👦'}
              {mode === 'ministry' && '🏛️'}
              <span>{t[mode]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Individual Mode */}
      {storyMode === 'individual' && (
        <div className="individual-mode">
          <div className="archetype-selector">
            <h4>{t.selectPerson}</h4>
            <div className="archetype-cards">
              {archetypes.map(archetype => (
                <ArchetypeCard
                  key={archetype.id}
                  archetype={archetype}
                  isSelected={selectedArchetype === archetype.id}
                  onSelect={() => setSelectedArchetype(archetype.id)}
                  interventionValues={interventionValues}
                  language={language}
                />
              ))}
            </div>
          </div>
          <JourneyTimeline
            archetype={currentArchetype}
            interventionValues={interventionValues}
            language={language}
            timeHorizon={timeHorizon}
          />
        </div>
      )}

      {/* Generational Mode */}
      {storyMode === 'generational' && (
        <GenerationalView simulationResult={simulationResult} language={language} />
      )}

      {/* Ministry Mode */}
      {storyMode === 'ministry' && (
        <div className="ministry-mode">
          <div className="ministry-toggles">
            <button
              className={`ministry-btn ${ministryView === 'health' ? 'active' : ''}`}
              onClick={() => setMinistryView('health')}
            >
              🏥 {t.health}
            </button>
            <button
              className={`ministry-btn ${ministryView === 'finance' ? 'active' : ''}`}
              onClick={() => setMinistryView('finance')}
            >
              💰 {t.finance}
            </button>
          </div>
          <MinistryPerspective
            view={ministryView}
            simulationResult={simulationResult}
            language={language}
          />
        </div>
      )}
    </div>
  );
};

export default Stories;
