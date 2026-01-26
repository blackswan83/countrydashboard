// Intervention Lab - Main container with 6-tab navigation
// "Country Agentic Health Twin" - Policy simulation experience

import React, { useState, useMemo, useCallback } from 'react';
import { interventions } from '../../data/interventionData';
import { runSimulation, type SimulationState, type SimulationResult } from '../../utils/simulationEngine';
import CommandCenter from './CommandCenter';
import PolicyStudio from './PolicyStudio';
import ImpactAnalysis from './ImpactAnalysis';
import Stories from './Stories';
import ChallengeMode from './ChallengeMode';
import Analytics from './Analytics';

// Types
type TabId = 'command' | 'policy' | 'impact' | 'stories' | 'challenge' | 'analytics';

interface Tab {
  id: TabId;
  name: string;
  nameAr: string;
  icon: string;
}

interface InterventionLabProps {
  language: 'en' | 'ar';
  darkMode: boolean;
}

// Tab definitions
const tabs: Tab[] = [
  { id: 'command', name: 'Command Center', nameAr: 'مركز القيادة', icon: '🎯' },
  { id: 'policy', name: 'Policy Studio', nameAr: 'استوديو السياسات', icon: '🎛️' },
  { id: 'impact', name: 'Impact Analysis', nameAr: 'تحليل الأثر', icon: '📊' },
  { id: 'stories', name: 'Stories', nameAr: 'قصص', icon: '👤' },
  { id: 'challenge', name: 'Challenge Mode', nameAr: 'وضع التحدي', icon: '🏆' },
  { id: 'analytics', name: 'Analytics', nameAr: 'التحليلات', icon: '🔬' },
];

// Preset scenarios
const presetScenarios = {
  baseline: {} as Record<string, number>,
  conservative: {
    sugarTax: 15,
    ncdScreening: 55,
    physicalActivity: 40,
    primaryCare: 1,
    digitalHealthTwin: 35,
    schoolNutrition: 50,
    nutritionEducation: 35,
    tobaccoTax: 65,
  },
  moderate: {
    sugarTax: 25,
    ncdScreening: 70,
    physicalActivity: 55,
    primaryCare: 2,
    digitalHealthTwin: 55,
    schoolNutrition: 70,
    nutritionEducation: 50,
    foodLabeling: 60,
    chronicDiseaseManagement: 50,
    telemedicine: 45,
    tobaccoTax: 80,
    communityHealthWorkers: 30,
  },
  aggressive: {
    sugarTax: 40,
    ncdScreening: 90,
    physicalActivity: 75,
    primaryCare: 4,
    digitalHealthTwin: 85,
    schoolNutrition: 95,
    nutritionEducation: 70,
    foodLabeling: 90,
    chronicDiseaseManagement: 80,
    telemedicine: 70,
    tobaccoTax: 100,
    communityHealthWorkers: 60,
    transFatBan: 100,
    ehrIntegration: 90,
    medicationAccess: 90,
  },
  vision2030: {
    sugarTax: 20,
    ncdScreening: 75,
    physicalActivity: 65,
    primaryCare: 2.5,
    digitalHealthTwin: 70,
    schoolNutrition: 80,
    nutritionEducation: 55,
    foodLabeling: 70,
    chronicDiseaseManagement: 60,
    telemedicine: 55,
    ehrIntegration: 80,
    physicianTraining: 50,
    nurseExpansion: 50,
  },
};

// Initialize baseline values
const getBaselineValues = (): Record<string, number> => {
  const values: Record<string, number> = {};
  interventions.forEach(i => {
    values[i.id] = i.baseline;
  });
  return values;
};

const InterventionLab: React.FC<InterventionLabProps> = ({ language, darkMode }) => {
  // State
  const [activeTab, setActiveTab] = useState<TabId>('command');
  const [interventionValues, setInterventionValues] = useState<Record<string, number>>(getBaselineValues());
  const [provincialOverrides, setProvincialOverrides] = useState<Record<string, Record<string, number>>>({});
  const [timeHorizon, setTimeHorizon] = useState(15);
  const [activeScenario, setActiveScenario] = useState<string>('custom');
  const [budget, setBudget] = useState(25); // SAR Billions per year

  const isRTL = language === 'ar';

  // Run simulation
  const simulationState: SimulationState = useMemo(() => ({
    interventions: interventionValues,
    provincialOverrides,
    timeHorizon,
    budget,
  }), [interventionValues, provincialOverrides, timeHorizon, budget]);

  const simulationResult: SimulationResult = useMemo(() => {
    return runSimulation(simulationState);
  }, [simulationState]);

  // Handlers
  const handleInterventionChange = useCallback((id: string, value: number) => {
    setInterventionValues(prev => ({ ...prev, [id]: value }));
    setActiveScenario('custom');
  }, []);

  const handleProvincialOverride = useCallback((provinceId: string, interventionId: string, value: number) => {
    setProvincialOverrides(prev => ({
      ...prev,
      [provinceId]: {
        ...(prev[provinceId] || {}),
        [interventionId]: value,
      },
    }));
    setActiveScenario('custom');
  }, []);

  const handleScenarioSelect = useCallback((scenarioId: string) => {
    const baselineVals = getBaselineValues();
    const scenarioVals = presetScenarios[scenarioId as keyof typeof presetScenarios] || {};
    setInterventionValues({ ...baselineVals, ...scenarioVals });
    setActiveScenario(scenarioId);
  }, []);

  // Reset function available for future use
  const _handleReset = useCallback(() => {
    setInterventionValues(getBaselineValues());
    setProvincialOverrides({});
    setActiveScenario('baseline');
  }, []);
  void _handleReset; // Suppress unused warning

  // Calculate budget usage
  const budgetUsage = useMemo(() => {
    return simulationResult.economicImpact.totalCost;
  }, [simulationResult]);

  const budgetPercent = Math.min(100, (budgetUsage / budget) * 100);

  // Translations
  const t = {
    title: language === 'ar' ? 'مختبر التدخل' : 'Intervention Lab',
    subtitle: language === 'ar' ? 'التوأم الصحي القُطري الوكيل' : 'Country Agentic Health Twin',
    scenario: language === 'ar' ? 'السيناريو' : 'Scenario',
    baseline: language === 'ar' ? 'خط الأساس' : 'Baseline',
    conservative: language === 'ar' ? 'محافظ' : 'Conservative',
    moderate: language === 'ar' ? 'معتدل' : 'Moderate',
    aggressive: language === 'ar' ? 'طموح' : 'Aggressive',
    vision2030: language === 'ar' ? 'رؤية 2030' : 'Vision 2030',
    custom: language === 'ar' ? 'مخصص' : 'Custom',
    timeHorizon: language === 'ar' ? 'الأفق الزمني' : 'Time Horizon',
    years: language === 'ar' ? 'سنوات' : 'years',
    budget: language === 'ar' ? 'الميزانية السنوية' : 'Annual Budget',
    billion: language === 'ar' ? 'مليار ريال' : 'SAR Bn',
    budgetUsed: language === 'ar' ? 'الميزانية المستخدمة' : 'Budget Used',
    overBudget: language === 'ar' ? 'تجاوز الميزانية' : 'Over Budget',
    synergiesActive: language === 'ar' ? 'تآزرات نشطة' : 'Active Synergies',
  };

  // Render tab content
  const renderTabContent = () => {
    const commonProps = {
      language,
      darkMode,
      interventionValues,
      provincialOverrides,
      simulationResult,
      timeHorizon,
      budget,
      budgetUsage,
      onInterventionChange: handleInterventionChange,
      onProvincialOverride: handleProvincialOverride,
    };

    switch (activeTab) {
      case 'command':
        return <CommandCenter {...commonProps} />;
      case 'policy':
        return <PolicyStudio {...commonProps} />;
      case 'impact':
        return <ImpactAnalysis {...commonProps} />;
      case 'stories':
        return <Stories {...commonProps} />;
      case 'challenge':
        return <ChallengeMode {...commonProps} budget={budget} />;
      case 'analytics':
        return <Analytics {...commonProps} />;
      default:
        return null;
    }
  };

  return (
    <div className="intervention-lab" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="lab-header">
        <div className="lab-title-section">
          <h1 className="lab-title">
            <span className="lab-icon">🧬</span>
            {t.title}
          </h1>
          <p className="lab-subtitle">{t.subtitle}</p>
        </div>

        <div className="lab-controls">
          {/* Scenario Selector */}
          <div className="control-group">
            <label>{t.scenario}</label>
            <div className="scenario-buttons">
              {(['baseline', 'conservative', 'moderate', 'aggressive', 'vision2030'] as const).map(scenario => (
                <button
                  key={scenario}
                  className={`scenario-btn ${activeScenario === scenario ? 'active' : ''}`}
                  onClick={() => handleScenarioSelect(scenario)}
                >
                  {t[scenario]}
                </button>
              ))}
              {activeScenario === 'custom' && (
                <span className="custom-badge">{t.custom}</span>
              )}
            </div>
          </div>

          {/* Time Horizon */}
          <div className="control-group compact">
            <label>{t.timeHorizon}</label>
            <select
              value={timeHorizon}
              onChange={e => setTimeHorizon(Number(e.target.value))}
              className="horizon-select"
            >
              <option value={5}>5 {t.years}</option>
              <option value={10}>10 {t.years}</option>
              <option value={15}>15 {t.years}</option>
              <option value={25}>25 {t.years}</option>
            </select>
          </div>

          {/* Budget */}
          <div className="control-group compact">
            <label>{t.budget}</label>
            <select
              value={budget}
              onChange={e => setBudget(Number(e.target.value))}
              className="budget-select"
            >
              <option value={10}>10 {t.billion}</option>
              <option value={15}>15 {t.billion}</option>
              <option value={20}>20 {t.billion}</option>
              <option value={25}>25 {t.billion}</option>
              <option value={35}>35 {t.billion}</option>
              <option value={50}>50 {t.billion}</option>
            </select>
          </div>

          {/* Budget Indicator */}
          <div className="budget-indicator">
            <div className="budget-label">
              {t.budgetUsed}: <strong>{budgetUsage.toFixed(1)} {t.billion}</strong>
            </div>
            <div className="budget-bar">
              <div
                className={`budget-fill ${budgetPercent > 100 ? 'over' : budgetPercent > 85 ? 'warning' : ''}`}
                style={{ width: `${Math.min(100, budgetPercent)}%` }}
              />
              {budgetPercent > 100 && (
                <span className="over-budget-label">{t.overBudget}!</span>
              )}
            </div>
          </div>

          {/* Active Synergies */}
          {simulationResult.activeSynergies.length > 0 && (
            <div className="synergies-badge">
              <span className="synergy-icon">✨</span>
              {simulationResult.activeSynergies.length} {t.synergiesActive}
            </div>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="lab-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`lab-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-name">{isRTL ? tab.nameAr : tab.name}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="lab-content">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default InterventionLab;
