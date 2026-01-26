// Policy Studio - All 24 policy levers by category
// Category sidebar, policy cards, dependencies, synergies

import React, { useState } from 'react';
import {
  interventions,
  interventionCategories,
  type InterventionCategory,
  type PolicyIntervention,
} from '../../data/interventionData';
import type { SimulationResult } from '../../utils/simulationEngine';

interface PolicyStudioProps {
  language: 'en' | 'ar';
  darkMode: boolean;
  interventionValues: Record<string, number>;
  provincialOverrides: Record<string, Record<string, number>>;
  simulationResult: SimulationResult;
  onInterventionChange: (id: string, value: number) => void;
  onProvincialOverride: (provinceId: string, interventionId: string, value: number) => void;
}

// Province list for overrides
const provinces = [
  { id: 'riyadh', name: 'Riyadh', nameAr: 'الرياض' },
  { id: 'makkah', name: 'Makkah', nameAr: 'مكة المكرمة' },
  { id: 'eastern', name: 'Eastern', nameAr: 'الشرقية' },
  { id: 'madinah', name: 'Madinah', nameAr: 'المدينة المنورة' },
  { id: 'asir', name: 'Asir', nameAr: 'عسير' },
  { id: 'jazan', name: 'Jazan', nameAr: 'جازان' },
  { id: 'qassim', name: 'Qassim', nameAr: 'القصيم' },
  { id: 'tabuk', name: 'Tabuk', nameAr: 'تبوك' },
  { id: 'hail', name: 'Hail', nameAr: 'حائل' },
  { id: 'najran', name: 'Najran', nameAr: 'نجران' },
  { id: 'aljawf', name: 'Al-Jawf', nameAr: 'الجوف' },
  { id: 'northernBorders', name: 'Northern Borders', nameAr: 'الحدود الشمالية' },
  { id: 'albahah', name: 'Al-Bahah', nameAr: 'الباحة' },
];

// Policy Card Component
const PolicyCard: React.FC<{
  intervention: PolicyIntervention;
  value: number;
  onChange: (value: number) => void;
  activeSynergies: string[];
  isLocked: boolean;
  lockReason?: string;
  language: 'en' | 'ar';
  showProvincial: boolean;
  onToggleProvincial: () => void;
  provincialValues: Record<string, number>;
  onProvincialChange: (provinceId: string, value: number) => void;
}> = ({
  intervention,
  value,
  onChange,
  activeSynergies,
  isLocked,
  lockReason,
  language,
  showProvincial,
  onToggleProvincial,
  provincialValues,
  onProvincialChange,
}) => {
  const isChanged = value !== intervention.baseline;
  const hasSynergy = activeSynergies.length > 0;
  const costTotal = ((value - intervention.baseline) / (intervention.max - intervention.min)) * intervention.costPerUnit * 10;
  const isRevenue = costTotal < 0;

  return (
    <div className={`policy-card ${isChanged ? 'changed' : ''} ${isLocked ? 'locked' : ''} ${hasSynergy ? 'has-synergy' : ''}`}>
      {/* Header */}
      <div className="policy-header">
        <span className="policy-icon">{intervention.icon}</span>
        <div className="policy-title">
          <h4>{language === 'ar' ? intervention.nameAr : intervention.name}</h4>
          <span className="policy-category">{interventionCategories[intervention.category].name}</span>
        </div>
        {isLocked && <span className="lock-icon" title={lockReason}>🔒</span>}
      </div>

      {/* Description */}
      <p className="policy-description">
        {language === 'ar' ? intervention.descriptionAr : intervention.description}
      </p>

      {/* Value Display */}
      <div className="policy-value-display">
        <span className="value-current" style={{ color: isChanged ? '#4A7C59' : 'var(--text-primary)' }}>
          {value}{intervention.unit}
        </span>
        <span className="value-baseline">
          {language === 'ar' ? 'خط الأساس:' : 'Baseline:'} {intervention.baseline}{intervention.unit}
        </span>
      </div>

      {/* Slider */}
      <div className="policy-slider-container">
        <input
          type="range"
          min={intervention.min}
          max={intervention.max}
          step={intervention.step}
          value={value}
          onChange={e => onChange(Number(e.target.value))}
          disabled={isLocked}
          className="policy-slider"
        />
        <div className="slider-labels">
          <span>{intervention.min}{intervention.unit}</span>
          <span>{intervention.max}{intervention.unit}</span>
        </div>
      </div>

      {/* Cost / Revenue */}
      <div className={`policy-cost ${isRevenue ? 'revenue' : ''}`}>
        <span className="cost-label">{isRevenue ? (language === 'ar' ? 'الإيرادات' : 'Revenue') : (language === 'ar' ? 'التكلفة' : 'Cost')}</span>
        <span className="cost-value">
          {isRevenue ? '+' : ''}{Math.abs(costTotal).toFixed(2)} {language === 'ar' ? 'مليار ريال/سنة' : 'SAR Bn/yr'}
        </span>
      </div>

      {/* Synergies */}
      {intervention.synergies.length > 0 && (
        <div className="policy-synergies">
          <div className="synergy-label">
            {language === 'ar' ? 'التآزرات:' : 'Synergies:'}
          </div>
          {intervention.synergies.map((syn, i) => {
            const isActive = activeSynergies.includes(syn.withIntervention);
            const partner = interventions.find(x => x.id === syn.withIntervention);
            return (
              <div key={i} className={`synergy-badge ${isActive ? 'active' : ''}`}>
                {partner?.icon} {isActive ? `+${Math.round((syn.multiplier - 1) * 100)}%` : partner?.name}
              </div>
            );
          })}
        </div>
      )}

      {/* Prerequisites */}
      {intervention.prerequisites.length > 0 && (
        <div className="policy-prerequisites">
          <span className="prereq-label">{language === 'ar' ? 'المتطلبات:' : 'Requires:'}</span>
          {intervention.prerequisites.map(prereqId => {
            const prereq = interventions.find(x => x.id === prereqId);
            return (
              <span key={prereqId} className="prereq-badge">
                {prereq?.icon} {language === 'ar' ? prereq?.nameAr : prereq?.name}
              </span>
            );
          })}
        </div>
      )}

      {/* Provincial Expansion */}
      <button className="provincial-toggle" onClick={onToggleProvincial}>
        {showProvincial ? '▼' : '▶'} {language === 'ar' ? 'التحكم بالمناطق' : 'Provincial Control'}
      </button>

      {showProvincial && (
        <div className="provincial-panel">
          {provinces.map(province => (
            <div key={province.id} className="provincial-slider">
              <span className="provincial-name">{language === 'ar' ? province.nameAr : province.name}</span>
              <input
                type="range"
                min={intervention.min}
                max={intervention.max}
                step={intervention.step}
                value={provincialValues[province.id] ?? value}
                onChange={e => onProvincialChange(province.id, Number(e.target.value))}
                className="mini-slider"
              />
              <span className="provincial-value">
                {provincialValues[province.id] ?? value}{intervention.unit}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Time Dynamics */}
      <div className="policy-timing">
        <span className="timing-item">
          ⏱️ {intervention.implementationDelay}yr {language === 'ar' ? 'تأخير' : 'delay'}
        </span>
        <span className="timing-item">
          📈 {intervention.rampUpPeriod}yr {language === 'ar' ? 'تصاعد' : 'ramp-up'}
        </span>
      </div>
    </div>
  );
};

const PolicyStudio: React.FC<PolicyStudioProps> = ({
  language,
  darkMode: _darkMode,
  interventionValues,
  provincialOverrides,
  simulationResult,
  onInterventionChange,
  onProvincialOverride,
}) => {
  void _darkMode; // Available for dark mode specific styling
  const [selectedCategory, setSelectedCategory] = useState<InterventionCategory | 'all'>('all');
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');

  const categories = Object.entries(interventionCategories) as [InterventionCategory, typeof interventionCategories[InterventionCategory]][];

  // Filter interventions
  const filteredInterventions = interventions.filter(intervention => {
    const matchesCategory = selectedCategory === 'all' || intervention.category === selectedCategory;
    const matchesSearch = searchTerm === '' ||
      intervention.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      intervention.nameAr.includes(searchTerm);
    return matchesCategory && matchesSearch;
  });

  // Check if intervention is locked
  const isInterventionLocked = (intervention: PolicyIntervention): { locked: boolean; reason?: string } => {
    for (const prereqId of intervention.prerequisites) {
      const prereq = interventions.find(i => i.id === prereqId);
      if (prereq) {
        const prereqValue = interventionValues[prereqId] ?? prereq.baseline;
        if (prereqValue <= prereq.baseline) {
          return {
            locked: true,
            reason: `Requires ${prereq.name} to be active first`,
          };
        }
      }
    }
    return { locked: false };
  };

  // Get active synergies for an intervention
  const getActiveSynergiesFor = (interventionId: string): string[] => {
    return simulationResult.activeSynergies
      .filter(syn => syn.interventions.includes(interventionId))
      .flatMap(syn => syn.interventions.filter(id => id !== interventionId));
  };

  const toggleProvincial = (interventionId: string) => {
    setExpandedCards(prev => {
      const next = new Set(prev);
      if (next.has(interventionId)) {
        next.delete(interventionId);
      } else {
        next.add(interventionId);
      }
      return next;
    });
  };

  const t = {
    title: language === 'ar' ? 'استوديو السياسات' : 'Policy Studio',
    subtitle: language === 'ar' ? '24 تدخل عبر 8 فئات' : '24 interventions across 8 categories',
    all: language === 'ar' ? 'الكل' : 'All',
    search: language === 'ar' ? 'بحث...' : 'Search...',
    showing: language === 'ar' ? 'عرض' : 'Showing',
    interventions: language === 'ar' ? 'تدخلات' : 'interventions',
    totalCost: language === 'ar' ? 'إجمالي التكلفة' : 'Total Cost',
    totalSynergies: language === 'ar' ? 'إجمالي التآزرات' : 'Total Synergies',
  };

  return (
    <div className="policy-studio">
      {/* Header */}
      <div className="studio-header">
        <div className="studio-title">
          <h2>{t.title}</h2>
          <p>{t.subtitle}</p>
        </div>
        <div className="studio-stats">
          <div className="studio-stat">
            <span className="stat-value">{simulationResult.economicImpact.totalCost.toFixed(1)}</span>
            <span className="stat-label">{t.totalCost} (Bn)</span>
          </div>
          <div className="studio-stat">
            <span className="stat-value">{simulationResult.activeSynergies.length}</span>
            <span className="stat-label">{t.totalSynergies}</span>
          </div>
        </div>
      </div>

      <div className="studio-content">
        {/* Sidebar */}
        <div className="category-sidebar">
          <button
            className={`category-btn ${selectedCategory === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('all')}
          >
            <span className="cat-icon">📋</span>
            <span className="cat-name">{t.all}</span>
            <span className="cat-count">{interventions.length}</span>
          </button>
          {categories.map(([catId, cat]) => {
            const count = interventions.filter(i => i.category === catId).length;
            return (
              <button
                key={catId}
                className={`category-btn ${selectedCategory === catId ? 'active' : ''}`}
                onClick={() => setSelectedCategory(catId)}
                style={{ '--cat-color': cat.color } as React.CSSProperties}
              >
                <span className="cat-icon">{cat.icon}</span>
                <span className="cat-name">{language === 'ar' ? cat.nameAr : cat.name}</span>
                <span className="cat-count">{count}</span>
              </button>
            );
          })}
        </div>

        {/* Main Content */}
        <div className="policies-main">
          {/* Search */}
          <div className="policies-toolbar">
            <input
              type="text"
              placeholder={t.search}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <span className="result-count">
              {t.showing} {filteredInterventions.length} {t.interventions}
            </span>
          </div>

          {/* Policy Cards Grid */}
          <div className="policies-grid">
            {filteredInterventions.map(intervention => {
              const { locked, reason } = isInterventionLocked(intervention);
              const activeSynergies = getActiveSynergiesFor(intervention.id);
              const provincialVals = provincialOverrides[intervention.id] || {};

              return (
                <PolicyCard
                  key={intervention.id}
                  intervention={intervention}
                  value={interventionValues[intervention.id] ?? intervention.baseline}
                  onChange={value => onInterventionChange(intervention.id, value)}
                  activeSynergies={activeSynergies}
                  isLocked={locked}
                  lockReason={reason}
                  language={language}
                  showProvincial={expandedCards.has(intervention.id)}
                  onToggleProvincial={() => toggleProvincial(intervention.id)}
                  provincialValues={provincialVals}
                  onProvincialChange={(provinceId, value) =>
                    onProvincialOverride(provinceId, intervention.id, value)
                  }
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PolicyStudio;
