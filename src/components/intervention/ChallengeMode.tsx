// Challenge Mode - Gamified budget challenges with achievements
// Making policy simulation engaging and goal-oriented

import React, { useState, useMemo } from 'react';
import type { SimulationResult } from '../../utils/simulationEngine';

interface ChallengeModeProps {
  language: 'en' | 'ar';
  darkMode: boolean;
  simulationResult: SimulationResult;
  budget: number;
  timeHorizon: number;
}

type Difficulty = 'beginner' | 'intermediate' | 'expert' | 'master';

interface Challenge {
  id: string;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  difficulty: Difficulty;
  targetMetric: string;
  targetValue: number;
  budgetLimit: number;
  timeLimit: number;
  icon: string;
  rewards: Achievement[];
}

interface Achievement {
  id: string;
  name: string;
  nameAr: string;
  icon: string;
  description: string;
  descriptionAr: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'special';
  points: number;
}

const challenges: Challenge[] = [
  {
    id: 'quickWin',
    title: 'Quick Win',
    titleAr: 'فوز سريع',
    description: 'Reduce diabetes prevalence by 2 percentage points within 5 years',
    descriptionAr: 'تقليل انتشار السكري بنقطتين مئويتين خلال 5 سنوات',
    difficulty: 'beginner',
    targetMetric: 'diabetes',
    targetValue: -2,
    budgetLimit: 50,
    timeLimit: 5,
    icon: '🎯',
    rewards: [
      { id: 'firstStep', name: 'First Step', nameAr: 'الخطوة الأولى', icon: '🥉', description: 'Complete your first challenge', descriptionAr: 'أكمل تحديك الأول', tier: 'bronze', points: 100 },
    ],
  },
  {
    id: 'vision2030',
    title: 'Vision 2030 Aligned',
    titleAr: 'متوافق مع رؤية 2030',
    description: 'Meet 3 or more Vision 2030 health KPIs within budget',
    descriptionAr: 'تحقيق 3 أو أكثر من مؤشرات رؤية 2030 الصحية ضمن الميزانية',
    difficulty: 'intermediate',
    targetMetric: 'kpis',
    targetValue: 3,
    budgetLimit: 15,
    timeLimit: 5,
    icon: '🏆',
    rewards: [
      { id: 'visionChampion', name: 'Vision Champion', nameAr: 'بطل الرؤية', icon: '🥈', description: 'Align policies with Vision 2030', descriptionAr: 'مواءمة السياسات مع رؤية 2030', tier: 'silver', points: 300 },
    ],
  },
  {
    id: 'efficiencyMaster',
    title: 'Efficiency Master',
    titleAr: 'سيد الكفاءة',
    description: 'Increase life expectancy by 5% with only 8B SAR/year budget',
    descriptionAr: 'زيادة متوسط العمر بنسبة 5٪ بميزانية 8 مليار ريال/سنة فقط',
    difficulty: 'expert',
    targetMetric: 'lifeExpectancy',
    targetValue: 5,
    budgetLimit: 8,
    timeLimit: 15,
    icon: '💎',
    rewards: [
      { id: 'efficiencyKing', name: 'Efficiency King', nameAr: 'ملك الكفاءة', icon: '🥇', description: 'Achieve maximum impact with minimum budget', descriptionAr: 'تحقيق أقصى تأثير بأقل ميزانية', tier: 'gold', points: 500 },
    ],
  },
  {
    id: 'equityChampion',
    title: 'Equity Champion',
    titleAr: 'بطل العدالة',
    description: 'Reduce provincial health outcome variance by 50%',
    descriptionAr: 'تقليل تباين النتائج الصحية بين المناطق بنسبة 50٪',
    difficulty: 'expert',
    targetMetric: 'equity',
    targetValue: -50,
    budgetLimit: 12,
    timeLimit: 15,
    icon: '⚖️',
    rewards: [
      { id: 'equalityFirst', name: 'Equality First', nameAr: 'المساواة أولاً', icon: '🌟', description: 'Prioritize health equity across provinces', descriptionAr: 'إعطاء الأولوية للعدالة الصحية عبر المناطق', tier: 'gold', points: 500 },
    ],
  },
  {
    id: 'superAgerNation',
    title: 'Super Ager Nation',
    titleAr: 'أمة المعمرين',
    description: 'Close 50% of the gap to super-ager trajectories',
    descriptionAr: 'سد 50٪ من الفجوة للوصول لمسارات المعمرين',
    difficulty: 'master',
    targetMetric: 'superAgerGap',
    targetValue: 50,
    budgetLimit: 20,
    timeLimit: 25,
    icon: '🦸',
    rewards: [
      { id: 'longevityLegend', name: 'Longevity Legend', nameAr: 'أسطورة طول العمر', icon: '💫', description: 'Transform Saudi Arabia into a longevity leader', descriptionAr: 'تحويل المملكة إلى رائدة في طول العمر', tier: 'platinum', points: 1000 },
    ],
  },
];

const allAchievements: Achievement[] = [
  // Bronze tier
  { id: 'firstStep', name: 'First Step', nameAr: 'الخطوة الأولى', icon: '🥉', description: 'Complete your first challenge', descriptionAr: 'أكمل تحديك الأول', tier: 'bronze', points: 100 },
  { id: 'explorer', name: 'Explorer', nameAr: 'مستكشف', icon: '🔍', description: 'Try all intervention categories', descriptionAr: 'جرب جميع فئات التدخل', tier: 'bronze', points: 100 },

  // Silver tier
  { id: 'visionChampion', name: 'Vision Champion', nameAr: 'بطل الرؤية', icon: '🥈', description: 'Align with Vision 2030', descriptionAr: 'التوافق مع رؤية 2030', tier: 'silver', points: 300 },
  { id: 'synergySeeker', name: 'Synergy Seeker', nameAr: 'باحث التآزر', icon: '✨', description: 'Activate 3+ synergies', descriptionAr: 'تفعيل 3+ تآزرات', tier: 'silver', points: 300 },

  // Gold tier
  { id: 'efficiencyKing', name: 'Efficiency King', nameAr: 'ملك الكفاءة', icon: '🥇', description: 'High impact, low budget', descriptionAr: 'تأثير عالي، ميزانية منخفضة', tier: 'gold', points: 500 },
  { id: 'equalityFirst', name: 'Equality First', nameAr: 'المساواة أولاً', icon: '⚖️', description: 'Reduce provincial variance', descriptionAr: 'تقليل تباين المناطق', tier: 'gold', points: 500 },

  // Platinum tier
  { id: 'longevityLegend', name: 'Longevity Legend', nameAr: 'أسطورة طول العمر', icon: '💫', description: 'Master all challenges', descriptionAr: 'إتقان جميع التحديات', tier: 'platinum', points: 1000 },

  // Special tier
  { id: 'synergyMaster', name: 'Synergy Master', nameAr: 'سيد التآزر', icon: '🌈', description: 'Activate 5+ synergies at once', descriptionAr: 'تفعيل 5+ تآزرات في وقت واحد', tier: 'special', points: 750 },
  { id: 'budgetSurplus', name: 'Budget Surplus', nameAr: 'فائض الميزانية', icon: '💰', description: 'Complete any challenge with 20%+ budget remaining', descriptionAr: 'إكمال أي تحدي مع بقاء 20٪+ من الميزانية', tier: 'special', points: 500 },
];

// Challenge Card Component
const ChallengeCard: React.FC<{
  challenge: Challenge;
  isActive: boolean;
  progress: number;
  onStart: () => void;
  language: 'en' | 'ar';
}> = ({ challenge, isActive, progress, onStart, language }) => {
  const difficultyColors: Record<Difficulty, string> = {
    beginner: '#4A7C59',
    intermediate: '#F59E0B',
    expert: '#EF4444',
    master: '#8B5CF6',
  };

  const difficultyLabels: Record<Difficulty, { en: string; ar: string }> = {
    beginner: { en: 'Beginner', ar: 'مبتدئ' },
    intermediate: { en: 'Intermediate', ar: 'متوسط' },
    expert: { en: 'Expert', ar: 'خبير' },
    master: { en: 'Master', ar: 'متقدم' },
  };

  const isCompleted = progress >= 100;

  return (
    <div className={`challenge-card ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}>
      <div className="challenge-header">
        <span className="challenge-icon">{challenge.icon}</span>
        <div className="challenge-title">
          <h4>{language === 'ar' ? challenge.titleAr : challenge.title}</h4>
          <span
            className="difficulty-badge"
            style={{ backgroundColor: difficultyColors[challenge.difficulty] }}
          >
            {language === 'ar' ? difficultyLabels[challenge.difficulty].ar : difficultyLabels[challenge.difficulty].en}
          </span>
        </div>
      </div>

      <p className="challenge-description">
        {language === 'ar' ? challenge.descriptionAr : challenge.description}
      </p>

      <div className="challenge-constraints">
        <span className="constraint">
          💰 {challenge.budgetLimit}B SAR/{language === 'ar' ? 'سنة' : 'yr'}
        </span>
        <span className="constraint">
          ⏱️ {challenge.timeLimit} {language === 'ar' ? 'سنوات' : 'years'}
        </span>
      </div>

      <div className="challenge-progress">
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${Math.min(100, progress)}%` }}
          />
        </div>
        <span className="progress-text">
          {Math.round(progress)}% {language === 'ar' ? 'مكتمل' : 'complete'}
        </span>
      </div>

      <div className="challenge-rewards">
        {challenge.rewards.map(reward => (
          <span key={reward.id} className={`reward-badge ${isCompleted ? 'earned' : ''}`}>
            {reward.icon}
          </span>
        ))}
      </div>

      {!isCompleted && (
        <button
          className={`start-btn ${isActive ? 'active' : ''}`}
          onClick={onStart}
        >
          {isActive
            ? (language === 'ar' ? 'نشط' : 'Active')
            : (language === 'ar' ? 'ابدأ التحدي' : 'Start Challenge')}
        </button>
      )}

      {isCompleted && (
        <div className="completed-badge">
          ✅ {language === 'ar' ? 'مكتمل' : 'Completed'}
        </div>
      )}
    </div>
  );
};

// Achievement Grid Component
const AchievementGrid: React.FC<{
  achievements: Achievement[];
  earnedIds: Set<string>;
  language: 'en' | 'ar';
}> = ({ achievements, earnedIds, language }) => {
  const tierOrder: Record<string, number> = {
    platinum: 0,
    gold: 1,
    silver: 2,
    bronze: 3,
    special: 4,
  };

  const sortedAchievements = [...achievements].sort(
    (a, b) => tierOrder[a.tier] - tierOrder[b.tier]
  );

  return (
    <div className="achievement-grid">
      {sortedAchievements.map(achievement => {
        const earned = earnedIds.has(achievement.id);
        return (
          <div
            key={achievement.id}
            className={`achievement ${earned ? 'earned' : 'locked'} ${achievement.tier}`}
          >
            <span className="achievement-icon">{achievement.icon}</span>
            <div className="achievement-info">
              <span className="achievement-name">
                {language === 'ar' ? achievement.nameAr : achievement.name}
              </span>
              <span className="achievement-desc">
                {language === 'ar' ? achievement.descriptionAr : achievement.description}
              </span>
            </div>
            <span className="achievement-points">+{achievement.points}</span>
          </div>
        );
      })}
    </div>
  );
};

// Score Card Component
const ScoreCard: React.FC<{
  simulationResult: SimulationResult;
  budget: number;
  budgetUsage: number;
  language: 'en' | 'ar';
}> = ({ simulationResult, budget: _budget, language }) => {
  void _budget; // Available for budget comparison features
  const { economicImpact, outcomeDeltas, activeSynergies } = simulationResult;

  // Calculate score based on multiple factors
  const healthScore = Math.abs(outcomeDeltas.diabetes) + Math.abs(outcomeDeltas.obesity) + outcomeDeltas.lifeExpectancy;
  const efficiencyScore = economicImpact.roi > 0 ? Math.min(50, economicImpact.roi / 2) : 0;
  const synergyScore = activeSynergies.length * 5;
  const totalScore = Math.round(healthScore + efficiencyScore + synergyScore);

  const getGrade = (score: number): { letter: string; color: string } => {
    if (score >= 80) return { letter: 'A+', color: '#4A7C59' };
    if (score >= 70) return { letter: 'A', color: '#4A7C59' };
    if (score >= 60) return { letter: 'B', color: '#10B981' };
    if (score >= 50) return { letter: 'C', color: '#F59E0B' };
    if (score >= 40) return { letter: 'D', color: '#EF4444' };
    return { letter: 'F', color: '#991B1B' };
  };

  const grade = getGrade(totalScore);

  return (
    <div className="score-card">
      <div className="score-header">
        <h4>{language === 'ar' ? 'تقرير الأداء' : 'Performance Report'}</h4>
      </div>

      <div className="score-grade" style={{ backgroundColor: grade.color }}>
        {grade.letter}
      </div>

      <div className="score-breakdown">
        <div className="score-item">
          <span className="item-label">{language === 'ar' ? 'تأثير صحي' : 'Health Impact'}</span>
          <div className="item-bar">
            <div className="item-fill" style={{ width: `${Math.min(100, healthScore)}%`, backgroundColor: '#4A7C59' }} />
          </div>
          <span className="item-value">{healthScore.toFixed(0)}</span>
        </div>

        <div className="score-item">
          <span className="item-label">{language === 'ar' ? 'كفاءة الميزانية' : 'Budget Efficiency'}</span>
          <div className="item-bar">
            <div className="item-fill" style={{ width: `${Math.min(100, efficiencyScore * 2)}%`, backgroundColor: '#00A0B0' }} />
          </div>
          <span className="item-value">{efficiencyScore.toFixed(0)}</span>
        </div>

        <div className="score-item">
          <span className="item-label">{language === 'ar' ? 'تآزرات نشطة' : 'Synergies Active'}</span>
          <div className="item-bar">
            <div className="item-fill" style={{ width: `${Math.min(100, synergyScore * 4)}%`, backgroundColor: '#8B5CF6' }} />
          </div>
          <span className="item-value">{synergyScore}</span>
        </div>
      </div>

      <div className="total-score">
        <span className="total-label">{language === 'ar' ? 'المجموع' : 'Total Score'}</span>
        <span className="total-value">{totalScore}</span>
      </div>
    </div>
  );
};

const ChallengeMode: React.FC<ChallengeModeProps> = ({
  language,
  darkMode: _darkMode,
  simulationResult,
  budget,
  timeHorizon,
}) => {
  void _darkMode; // Available for dark mode specific styling
  const [activeChallenge, setActiveChallenge] = useState<string | null>(null);
  const [earnedAchievements] = useState<Set<string>>(new Set(['explorer'])); // Mock some earned

  const { economicImpact, outcomeDeltas, activeSynergies } = simulationResult;

  // Calculate progress for each challenge
  const getProgress = (challenge: Challenge): number => {
    const budgetOK = economicImpact.totalCost <= challenge.budgetLimit;
    const timeOK = timeHorizon <= challenge.timeLimit;

    if (!budgetOK || !timeOK) return 0;

    switch (challenge.targetMetric) {
      case 'diabetes':
        return Math.min(100, (Math.abs(outcomeDeltas.diabetes) / Math.abs(challenge.targetValue)) * 100);
      case 'lifeExpectancy':
        return Math.min(100, (outcomeDeltas.lifeExpectancy / challenge.targetValue) * 100);
      case 'kpis':
        // Count KPIs met (simplified)
        const kpisMet = [
          outcomeDeltas.lifeExpectancy > 2,
          outcomeDeltas.diabetes < -5,
          outcomeDeltas.obesity < -5,
        ].filter(Boolean).length;
        return Math.min(100, (kpisMet / challenge.targetValue) * 100);
      case 'equity':
        // Simplified equity calculation
        return Math.min(100, activeSynergies.length * 20);
      case 'superAgerGap':
        const gapProgress = (outcomeDeltas.lifeExpectancy + Math.abs(outcomeDeltas.diabetes)) / 2;
        return Math.min(100, (gapProgress / challenge.targetValue) * 100);
      default:
        return 0;
    }
  };

  const t = {
    title: language === 'ar' ? 'وضع التحدي' : 'Challenge Mode',
    subtitle: language === 'ar' ? 'اختبر مهاراتك في صنع السياسات' : 'Test Your Policy-Making Skills',
    activeChallenges: language === 'ar' ? 'التحديات' : 'Challenges',
    achievements: language === 'ar' ? 'الإنجازات' : 'Achievements',
    score: language === 'ar' ? 'النتيجة' : 'Score',
    totalPoints: language === 'ar' ? 'مجموع النقاط' : 'Total Points',
  };

  const totalPoints = useMemo(() => {
    return allAchievements
      .filter(a => earnedAchievements.has(a.id))
      .reduce((sum, a) => sum + a.points, 0);
  }, [earnedAchievements]);

  return (
    <div className="challenge-mode">
      {/* Header */}
      <div className="challenge-header">
        <div className="header-content">
          <h2>{t.title}</h2>
          <p>{t.subtitle}</p>
        </div>
        <div className="points-display">
          <span className="points-icon">⭐</span>
          <span className="points-value">{totalPoints}</span>
          <span className="points-label">{t.totalPoints}</span>
        </div>
      </div>

      <div className="challenge-content">
        {/* Challenges Grid */}
        <div className="challenges-section">
          <h3>{t.activeChallenges}</h3>
          <div className="challenges-grid">
            {challenges.map(challenge => (
              <ChallengeCard
                key={challenge.id}
                challenge={challenge}
                isActive={activeChallenge === challenge.id}
                progress={getProgress(challenge)}
                onStart={() => setActiveChallenge(challenge.id)}
                language={language}
              />
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="challenge-sidebar">
          {/* Score Card */}
          <ScoreCard
            simulationResult={simulationResult}
            budget={budget}
            budgetUsage={economicImpact.totalCost}
            language={language}
          />

          {/* Achievements */}
          <div className="achievements-section">
            <h3>{t.achievements}</h3>
            <AchievementGrid
              achievements={allAchievements}
              earnedIds={earnedAchievements}
              language={language}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChallengeMode;
