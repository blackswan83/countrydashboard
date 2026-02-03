// Stories - Individual archetypes, journey timelines, generational views
// Making health data personal and relatable

import React, { useState } from 'react';
import { interventions } from '../../data/interventionData';
import type { SimulationResult } from '../../utils/simulationEngine';
import { getStatusColor as getThemeStatusColor, getThemeColors } from '../../utils/themeColors';

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
    id: 'grace',
    name: 'Grace Mwamba',
    nameAr: 'Grace Mwamba',
    age: 38,
    province: 'Lusaka',
    provinceAr: 'Lusaka',
    portrait: '👩',
    bio: 'A nurse and mother of four. Living with HIV, on ART treatment but struggles with medication adherence due to work demands.',
    bioAr: 'A nurse and mother of four. Living with HIV, on ART treatment but struggles with medication adherence due to work demands.',
    currentRisks: ['HIV positive', 'ART adherence issues', 'Work stress'],
    currentRisksAr: ['HIV positive', 'ART adherence issues', 'Work stress'],
    relevantInterventions: ['ncdScreening', 'primaryCare', 'digitalHealthTwin', 'chronicDiseaseManagement'],
    baselineOutcome: 'Without intervention: Viral load increases, opportunistic infections, reduced life expectancy',
    baselineOutcomeAr: 'Without intervention: Viral load increases, opportunistic infections, reduced life expectancy',
    interventionOutcome: 'With digital health + community support: Viral suppression, healthy and productive life',
    interventionOutcomeAr: 'With digital health + community support: Viral suppression, healthy and productive life',
    journeyMilestones: [
      { year: 2025, event: 'Enrolled in digital health reminder program', eventAr: 'Enrolled in digital health reminder program', status: 'at-risk', interventionId: 'digitalHealthTwin' },
      { year: 2026, event: 'Community health worker provides home support', eventAr: 'Community health worker provides home support', status: 'at-risk', interventionId: 'primaryCare' },
      { year: 2027, event: 'Achieves viral suppression consistently', eventAr: 'Achieves viral suppression consistently', status: 'improved', interventionId: 'chronicDiseaseManagement' },
      { year: 2028, event: 'Promoted to head nurse at clinic', eventAr: 'Promoted to head nurse at clinic', status: 'healthy' },
      { year: 2030, event: 'Mentoring other HIV patients in the community', eventAr: 'Mentoring other HIV patients in the community', status: 'healthy' },
      { year: 2035, event: 'Living fully, watching children graduate', eventAr: 'Living fully, watching children graduate', status: 'healthy' },
    ],
  },
  {
    id: 'joseph',
    name: 'Joseph Banda',
    nameAr: 'Joseph Banda',
    age: 45,
    province: 'Copperbelt',
    provinceAr: 'Copperbelt',
    portrait: '👨',
    bio: 'Mine worker in Kitwe. Exposure to occupational hazards, high malaria risk, developing hypertension from diet high in salt.',
    bioAr: 'Mine worker in Kitwe. Exposure to occupational hazards, high malaria risk, developing hypertension from diet high in salt.',
    currentRisks: ['Hypertension', 'Malaria exposure', 'Occupational health risks'],
    currentRisksAr: ['Hypertension', 'Malaria exposure', 'Occupational health risks'],
    relevantInterventions: ['ncdScreening', 'nutritionEducation', 'physicalActivity', 'primaryCare'],
    baselineOutcome: 'Without intervention: Stroke by 55, frequent malaria episodes, reduced work capacity',
    baselineOutcomeAr: 'Without intervention: Stroke by 55, frequent malaria episodes, reduced work capacity',
    interventionOutcome: 'With screening + ITN coverage: Controlled BP, malaria-free, productive career',
    interventionOutcomeAr: 'With screening + ITN coverage: Controlled BP, malaria-free, productive career',
    journeyMilestones: [
      { year: 2025, event: 'Workplace screening detects high BP', eventAr: 'Workplace screening detects high BP', status: 'at-risk', interventionId: 'ncdScreening' },
      { year: 2026, event: 'Receives ITN and malaria prevention education', eventAr: 'Receives ITN and malaria prevention education', status: 'at-risk', interventionId: 'primaryCare' },
      { year: 2027, event: 'Enrolled in hypertension management program', eventAr: 'Enrolled in hypertension management program', status: 'managed', interventionId: 'chronicDiseaseManagement' },
      { year: 2028, event: 'BP controlled, no malaria episodes this year', eventAr: 'BP controlled, no malaria episodes this year', status: 'improved' },
      { year: 2032, event: 'Promoted to supervisor, health maintained', eventAr: 'Promoted to supervisor, health maintained', status: 'healthy' },
      { year: 2040, event: 'Healthy retirement, active with grandchildren', eventAr: 'Healthy retirement, active with grandchildren', status: 'healthy' },
    ],
  },
  {
    id: 'david',
    name: 'David Phiri',
    nameAr: 'David Phiri',
    age: 62,
    province: 'Southern',
    provinceAr: 'Southern',
    portrait: '👴',
    bio: 'Retired farmer near Livingstone with diabetes complications. Limited access to specialist care, relies on traditional healers.',
    bioAr: 'Retired farmer near Livingstone with diabetes complications. Limited access to specialist care, relies on traditional healers.',
    currentRisks: ['Diabetes complications', 'Limited healthcare access', 'Traditional medicine reliance'],
    currentRisksAr: ['Diabetes complications', 'Limited healthcare access', 'Traditional medicine reliance'],
    relevantInterventions: ['chronicDiseaseManagement', 'medicationAccess', 'telemedicine', 'communityHealthWorkers'],
    baselineOutcome: 'Without intervention: Diabetic foot amputation risk, blindness, kidney failure',
    baselineOutcomeAr: 'Without intervention: Diabetic foot amputation risk, blindness, kidney failure',
    interventionOutcome: 'With telemedicine + CHW visits: Controlled diabetes, preserved mobility and vision',
    interventionOutcomeAr: 'With telemedicine + CHW visits: Controlled diabetes, preserved mobility and vision',
    journeyMilestones: [
      { year: 2025, event: 'CHW identifies uncontrolled diabetes', eventAr: 'CHW identifies uncontrolled diabetes', status: 'diagnosed', interventionId: 'communityHealthWorkers' },
      { year: 2026, event: 'Telemedicine consultation with endocrinologist', eventAr: 'Telemedicine consultation with endocrinologist', status: 'managed', interventionId: 'telemedicine' },
      { year: 2027, event: 'Affordable insulin access secured', eventAr: 'Affordable insulin access secured', status: 'managed', interventionId: 'medicationAccess' },
      { year: 2028, event: 'HbA1c improved, foot ulcer healed', eventAr: 'HbA1c improved, foot ulcer healed', status: 'improved' },
      { year: 2030, event: 'Active in community garden project', eventAr: 'Active in community garden project', status: 'healthy' },
      { year: 2035, event: 'Celebrating 75 with family, managing well', eventAr: 'Celebrating 75 with family, managing well', status: 'healthy' },
    ],
  },
  {
    id: 'mary',
    name: 'Mary Tembo',
    nameAr: 'Mary Tembo',
    age: 8,
    province: 'Luapula',
    provinceAr: 'Luapula',
    portrait: '👧',
    bio: 'Primary school student in Mansa. Frequent malaria episodes, nutritional deficiencies, limited access to clean water.',
    bioAr: 'Primary school student in Mansa. Frequent malaria episodes, nutritional deficiencies, limited access to clean water.',
    currentRisks: ['Malaria vulnerability', 'Malnutrition', 'Stunting risk'],
    currentRisksAr: ['Malaria vulnerability', 'Malnutrition', 'Stunting risk'],
    relevantInterventions: ['schoolNutrition', 'physicalActivity', 'communityHealthWorkers', 'primaryCare'],
    baselineOutcome: 'Without intervention: Chronic malaria, stunted growth, poor school performance',
    baselineOutcomeAr: 'Without intervention: Chronic malaria, stunted growth, poor school performance',
    interventionOutcome: 'With school feeding + ITN: Healthy growth, malaria-free, thriving student',
    interventionOutcomeAr: 'With school feeding + ITN: Healthy growth, malaria-free, thriving student',
    journeyMilestones: [
      { year: 2025, event: 'School feeding program provides balanced meals', eventAr: 'School feeding program provides balanced meals', status: 'at-risk', interventionId: 'schoolNutrition' },
      { year: 2026, event: 'Family receives ITN and malaria prevention', eventAr: 'Family receives ITN and malaria prevention', status: 'at-risk', interventionId: 'primaryCare' },
      { year: 2027, event: 'CHW provides nutrition supplements', eventAr: 'CHW provides nutrition supplements', status: 'at-risk', interventionId: 'communityHealthWorkers' },
      { year: 2028, event: 'Height and weight reach normal range', eventAr: 'Height and weight reach normal range', status: 'improved' },
      { year: 2035, event: 'Top student, preparing for university', eventAr: 'Top student, preparing for university', status: 'healthy' },
      { year: 2045, event: 'Doctor serving her home community', eventAr: 'Doctor serving her home community', status: 'healthy' },
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
  darkMode: boolean;
}> = ({ archetype, interventionValues, language, timeHorizon, darkMode }) => {
  const currentYear = 2025;
  const endYear = currentYear + timeHorizon;
  const colors = getThemeColors(darkMode);

  // Filter milestones within time horizon
  const visibleMilestones = archetype.journeyMilestones.filter(m => m.year <= endYear);

  const getStatusColor = (status: string) => getThemeStatusColor(status, darkMode);

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
                style={{ backgroundColor: active ? getStatusColor(milestone.status) : colors.textMuted }}
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
  darkMode,
  interventionValues,
  simulationResult,
  timeHorizon,
}) => {
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
            darkMode={darkMode}
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
