import React, { useState } from 'react';

type ViewType = 'national' | 'provincial' | 'aging' | 'intervention' | 'disease' | 'infrastructure';

interface IntroPresentationProps {
  language: 'en' | 'ar';
  darkMode: boolean;
  onComplete: (targetView?: ViewType) => void;
  onDismiss: () => void;
}

// Translations for the intro presentation
const introTranslations = {
  en: {
    skip: 'Skip',
    back: 'Back',
    next: 'Next',
    getStarted: 'Get Started',
    jumpToLab: 'Jump to Intervention Lab',
    slides: [
      {
        title: 'KSA National Health Intelligence Dashboard',
        subtitle: 'Powered by Nuraxi AI • Aligned with Vision 2030',
        features: [
          { icon: '📍', title: 'Real-time Health Mapping', desc: 'Provincial health metrics at your fingertips' },
          { icon: '📈', title: 'Predictive Analytics', desc: 'NCD trajectories and risk projections' },
          { icon: '🎯', title: 'Policy Simulation Lab', desc: 'Model interventions with economic impact' },
        ],
      },
      {
        title: 'Built For Decision Makers',
        audiences: [
          { icon: '🏛️', title: 'Ministry of Health', desc: 'National policy planning & resource allocation' },
          { icon: '🏥', title: 'Regional Directors', desc: 'Provincial intervention priorities' },
          { icon: '📊', title: 'Health Economists', desc: 'Cost-effectiveness & budget modeling' },
          { icon: '🔬', title: 'Researchers', desc: 'Epidemiological trends & population data' },
          { icon: '🌍', title: 'Vision 2030 Planners', desc: 'Progress tracking toward health KPIs' },
        ],
      },
      {
        title: 'What You Can Do',
        capabilities: [
          { icon: '🗺️', title: 'Geographic Intelligence', desc: 'Provincial health mapping with real-time metrics' },
          { icon: '📈', title: 'Trend Analysis', desc: 'NCD trajectories, aging patterns, risk projections' },
          { icon: '🎯', title: 'Intervention Lab', desc: 'Policy simulation with economic impact modeling' },
          { icon: '👤', title: 'Individual Stories', desc: 'See how policies affect real people' },
          { icon: '💰', title: 'Economic Analysis', desc: 'Cost per QALY, ROI projections, budget optimization' },
        ],
      },
      {
        title: 'Explore Key Scenarios',
        scenarios: [
          { question: 'Where should we focus NCD screening?', answer: 'Provincial Analysis → Disease Deep-Dive → Identify high-burden regions' },
          { question: "What's the ROI of a sugar tax?", answer: 'Intervention Lab → Policy Studio → Fiscal policies → View economic impact' },
          { question: 'How can we become a super-ager nation?', answer: 'Aging & Longevity → Compare population vs optimal aging trajectory' },
          { question: 'Which province needs the most hospital beds?', answer: 'Healthcare Infrastructure → Capacity gap analysis by province' },
        ],
      },
      {
        title: 'How to Navigate',
        navItems: [
          { icon: '🏛️', name: 'National Overview', desc: 'Start here for the big picture' },
          { icon: '🗺️', name: 'Regional Analysis', desc: 'Drill into provincial data' },
          { icon: '🧬', name: 'Aging & Longevity', desc: 'Super-ager trajectory analysis' },
          { icon: '🩺', name: 'Disease Deep-Dive', desc: 'NCD-specific insights' },
          { icon: '🏥', name: 'Healthcare Infrastructure', desc: 'Capacity & workforce' },
          { icon: '🎯', name: 'Intervention Lab (ALPHA)', desc: 'Policy simulation playground' },
        ],
      },
      {
        title: 'Ready to Explore?',
        cta: true,
      },
    ],
  },
  ar: {
    skip: 'تخطي',
    back: 'السابق',
    next: 'التالي',
    getStarted: 'ابدأ الآن',
    jumpToLab: 'انتقل إلى مختبر التدخل',
    slides: [
      {
        title: 'لوحة معلومات الصحة الوطنية السعودية',
        subtitle: 'مدعوم بالذكاء الاصطناعي من نوراكسي • متوافق مع رؤية 2030',
        features: [
          { icon: '📍', title: 'خرائط صحية فورية', desc: 'مقاييس صحية إقليمية في متناول يدك' },
          { icon: '📈', title: 'تحليلات تنبؤية', desc: 'مسارات الأمراض غير المعدية وتوقعات المخاطر' },
          { icon: '🎯', title: 'مختبر محاكاة السياسات', desc: 'نمذجة التدخلات مع التأثير الاقتصادي' },
        ],
      },
      {
        title: 'مصمم لصناع القرار',
        audiences: [
          { icon: '🏛️', title: 'وزارة الصحة', desc: 'التخطيط الوطني للسياسات وتخصيص الموارد' },
          { icon: '🏥', title: 'المديرين الإقليميين', desc: 'أولويات التدخل الإقليمي' },
          { icon: '📊', title: 'اقتصاديي الصحة', desc: 'فعالية التكلفة ونمذجة الميزانية' },
          { icon: '🔬', title: 'الباحثين', desc: 'الاتجاهات الوبائية وبيانات السكان' },
          { icon: '🌍', title: 'مخططي رؤية 2030', desc: 'تتبع التقدم نحو مؤشرات الأداء الصحية' },
        ],
      },
      {
        title: 'ما يمكنك فعله',
        capabilities: [
          { icon: '🗺️', title: 'الذكاء الجغرافي', desc: 'خرائط صحية إقليمية مع مقاييس فورية' },
          { icon: '📈', title: 'تحليل الاتجاهات', desc: 'مسارات الأمراض، أنماط الشيخوخة، توقعات المخاطر' },
          { icon: '🎯', title: 'مختبر التدخل', desc: 'محاكاة السياسات مع نمذجة التأثير الاقتصادي' },
          { icon: '👤', title: 'قصص فردية', desc: 'شاهد كيف تؤثر السياسات على الأشخاص الحقيقيين' },
          { icon: '💰', title: 'التحليل الاقتصادي', desc: 'تكلفة لكل سنة حياة، توقعات العائد، تحسين الميزانية' },
        ],
      },
      {
        title: 'استكشف السيناريوهات الرئيسية',
        scenarios: [
          { question: 'أين يجب أن نركز فحص الأمراض غير المعدية؟', answer: 'التحليل الإقليمي ← تعمق في الأمراض ← تحديد المناطق ذات العبء العالي' },
          { question: 'ما هو العائد على الاستثمار لضريبة السكر؟', answer: 'مختبر التدخل ← استوديو السياسات ← السياسات المالية ← عرض التأثير الاقتصادي' },
          { question: 'كيف نصبح أمة معمرين صحيين؟', answer: 'الشيخوخة وطول العمر ← مقارنة السكان مقابل مسار الشيخوخة الأمثل' },
          { question: 'أي منطقة تحتاج أكثر أسرة المستشفيات؟', answer: 'البنية التحتية الصحية ← تحليل فجوة السعة حسب المنطقة' },
        ],
      },
      {
        title: 'كيفية التنقل',
        navItems: [
          { icon: '🏛️', name: 'نظرة عامة وطنية', desc: 'ابدأ هنا للصورة الكبيرة' },
          { icon: '🗺️', name: 'التحليل الإقليمي', desc: 'تعمق في البيانات الإقليمية' },
          { icon: '🧬', name: 'الشيخوخة وطول العمر', desc: 'تحليل مسار المعمرين الصحيين' },
          { icon: '🩺', name: 'تعمق في الأمراض', desc: 'رؤى خاصة بالأمراض غير المعدية' },
          { icon: '🏥', name: 'البنية التحتية الصحية', desc: 'السعة والقوى العاملة' },
          { icon: '🎯', name: 'مختبر التدخل (ألفا)', desc: 'ملعب محاكاة السياسات' },
        ],
      },
      {
        title: 'هل أنت مستعد للاستكشاف؟',
        cta: true,
      },
    ],
  },
};

export const IntroPresentation: React.FC<IntroPresentationProps> = ({
  language,
  darkMode,
  onComplete,
  onDismiss,
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const isRTL = language === 'ar';
  const t = introTranslations[language];
  const slides = t.slides;
  const totalSlides = slides.length;

  const handleNext = () => {
    if (currentSlide < totalSlides - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const handleBack = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const slide = slides[currentSlide] as any;

  // Theme colors
  const colors = {
    primary: darkMode ? '#C4A77D' : '#8B7355',
    gold: darkMode ? '#D4B896' : '#C4A77D',
    success: darkMode ? '#5B9A6E' : '#4A7C59',
    textPrimary: darkMode ? '#E8E6E3' : '#3D3D3D',
    textSecondary: darkMode ? '#9CA3AF' : '#6B6B6B',
    textMuted: darkMode ? '#6B7280' : '#8B8B8B',
    bgCard: darkMode ? '#182230' : '#FFFFFF',
    bgTertiary: darkMode ? '#1E2A3A' : '#F5F0EB',
    border: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(139, 115, 85, 0.2)',
  };

  return (
    <div
      className="intro-overlay"
      dir={isRTL ? 'rtl' : 'ltr'}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        animation: 'fadeIn 0.3s ease',
      }}
    >
      <div
        className="intro-modal"
        style={{
          background: colors.bgCard,
          borderRadius: 24,
          width: '90%',
          maxWidth: 820,
          maxHeight: '85vh',
          overflow: 'hidden',
          boxShadow: '0 24px 48px rgba(0, 0, 0, 0.3)',
          display: 'flex',
          flexDirection: 'column',
          animation: 'slideUp 0.4s ease',
        }}
      >
        {/* Progress dots */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 8,
            padding: '20px 20px 10px',
          }}
        >
          {slides.map((_, i) => (
            <div
              key={i}
              onClick={() => setCurrentSlide(i)}
              style={{
                width: i === currentSlide ? 28 : 10,
                height: 10,
                borderRadius: 5,
                background: i === currentSlide ? colors.primary : colors.border,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
            />
          ))}
        </div>

        {/* Slide content */}
        <div
          style={{
            flex: 1,
            padding: '10px 40px 30px',
            overflowY: 'auto',
          }}
        >
          {/* Slide 1: Welcome */}
          {currentSlide === 0 && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🇸🇦</div>
              <h2 style={{ fontSize: 28, fontWeight: 700, color: colors.primary, marginBottom: 12 }}>
                {slide.title}
              </h2>
              <p style={{ fontSize: 16, color: colors.textSecondary, marginBottom: 36 }}>
                {slide.subtitle}
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
                {slide.features?.map((f: any, i: number) => (
                  <div
                    key={i}
                    style={{
                      background: colors.bgTertiary,
                      borderRadius: 16,
                      padding: 24,
                      border: `1px solid ${colors.border}`,
                    }}
                  >
                    <div style={{ fontSize: 32, marginBottom: 12 }}>{f.icon}</div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: colors.textPrimary, marginBottom: 6 }}>
                      {f.title}
                    </div>
                    <div style={{ fontSize: 13, color: colors.textSecondary }}>{f.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Slide 2: Audience */}
          {currentSlide === 1 && (
            <div>
              <h2 style={{ fontSize: 26, fontWeight: 700, color: colors.primary, marginBottom: 8, textAlign: 'center' }}>
                {slide.title}
              </h2>
              <p style={{ fontSize: 14, color: colors.textSecondary, marginBottom: 28, textAlign: 'center' }}>
                {language === 'en' ? 'Designed for health leaders across the Kingdom' : 'مصمم لقادة الصحة في جميع أنحاء المملكة'}
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
                {slide.audiences?.map((a: any, i: number) => (
                  <div
                    key={i}
                    style={{
                      background: colors.bgTertiary,
                      borderRadius: 14,
                      padding: '18px 20px',
                      borderLeft: `4px solid ${colors.gold}`,
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 14,
                    }}
                  >
                    <div style={{ fontSize: 28 }}>{a.icon}</div>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 600, color: colors.textPrimary, marginBottom: 4 }}>
                        {a.title}
                      </div>
                      <div style={{ fontSize: 13, color: colors.textSecondary }}>{a.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Slide 3: Capabilities */}
          {currentSlide === 2 && (
            <div>
              <h2 style={{ fontSize: 26, fontWeight: 700, color: colors.primary, marginBottom: 28, textAlign: 'center' }}>
                {slide.title}
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
                {slide.capabilities?.map((c: any, i: number) => (
                  <div
                    key={i}
                    style={{
                      background: colors.bgTertiary,
                      borderRadius: 12,
                      padding: '16px 18px',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 14,
                      border: `1px solid ${colors.border}`,
                    }}
                  >
                    <div style={{
                      fontSize: 24,
                      width: 44,
                      height: 44,
                      borderRadius: 10,
                      background: darkMode ? 'rgba(196, 167, 125, 0.15)' : 'rgba(139, 115, 85, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      {c.icon}
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: colors.textPrimary, marginBottom: 4 }}>
                        {c.title}
                      </div>
                      <div style={{ fontSize: 12, color: colors.textSecondary, lineHeight: 1.5 }}>{c.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Slide 4: Scenarios */}
          {currentSlide === 3 && (
            <div>
              <h2 style={{ fontSize: 26, fontWeight: 700, color: colors.primary, marginBottom: 28, textAlign: 'center' }}>
                {slide.title}
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {slide.scenarios?.map((s: any, i: number) => (
                  <div
                    key={i}
                    style={{
                      background: colors.bgTertiary,
                      borderRadius: 12,
                      padding: '16px 20px',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 16,
                      border: `1px solid ${colors.border}`,
                    }}
                  >
                    <div style={{
                      width: 32,
                      height: 32,
                      borderRadius: 16,
                      background: colors.success,
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 14,
                      fontWeight: 700,
                      flexShrink: 0,
                    }}>
                      {i + 1}
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: colors.textPrimary, marginBottom: 6 }}>
                        "{s.question}"
                      </div>
                      <div style={{ fontSize: 12, color: colors.textSecondary, lineHeight: 1.5 }}>
                        → {s.answer}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Slide 5: Navigation */}
          {currentSlide === 4 && (
            <div>
              <h2 style={{ fontSize: 26, fontWeight: 700, color: colors.primary, marginBottom: 28, textAlign: 'center' }}>
                {slide.title}
              </h2>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 12,
              }}>
                {slide.navItems?.map((n: any, i: number) => (
                  <div
                    key={i}
                    style={{
                      background: colors.bgTertiary,
                      borderRadius: 12,
                      padding: '16px 14px',
                      textAlign: 'center',
                      border: `1px solid ${colors.border}`,
                      position: 'relative',
                    }}
                  >
                    {i === 5 && (
                      <div style={{
                        position: 'absolute',
                        top: 8,
                        right: isRTL ? 'auto' : 8,
                        left: isRTL ? 8 : 'auto',
                        background: '#F59E0B',
                        color: '#FFFFFF',
                        fontSize: 8,
                        padding: '2px 6px',
                        borderRadius: 4,
                        fontWeight: 700,
                      }}>
                        ALPHA
                      </div>
                    )}
                    <div style={{ fontSize: 26, marginBottom: 8 }}>{n.icon}</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: colors.textPrimary, marginBottom: 4 }}>
                      {n.name}
                    </div>
                    <div style={{ fontSize: 11, color: colors.textSecondary }}>{n.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Slide 6: CTA */}
          {currentSlide === 5 && (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ fontSize: 56, marginBottom: 20 }}>🚀</div>
              <h2 style={{ fontSize: 30, fontWeight: 700, color: colors.primary, marginBottom: 16 }}>
                {slide.title}
              </h2>
              <p style={{ fontSize: 16, color: colors.textSecondary, marginBottom: 40, maxWidth: 500, margin: '0 auto 40px' }}>
                {language === 'en'
                  ? 'Explore the dashboard to discover insights that can transform health outcomes for millions of Saudis.'
                  : 'استكشف لوحة المعلومات لاكتشاف رؤى يمكن أن تغير النتائج الصحية لملايين السعوديين.'}
              </p>
              <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
                <button
                  onClick={() => onComplete('national')}
                  style={{
                    padding: '16px 32px',
                    background: colors.primary,
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: 12,
                    fontSize: 15,
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  {t.getStarted}
                </button>
                <button
                  onClick={() => onComplete('intervention')}
                  style={{
                    padding: '16px 32px',
                    background: 'transparent',
                    color: colors.success,
                    border: `2px solid ${colors.success}`,
                    borderRadius: 12,
                    fontSize: 15,
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  {t.jumpToLab}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px 40px',
            borderTop: `1px solid ${colors.border}`,
            background: colors.bgTertiary,
          }}
        >
          <button
            onClick={handleBack}
            style={{
              padding: '10px 20px',
              background: 'transparent',
              color: currentSlide === 0 ? colors.textMuted : colors.textSecondary,
              border: 'none',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 500,
              cursor: currentSlide === 0 ? 'default' : 'pointer',
              opacity: currentSlide === 0 ? 0.5 : 1,
              transition: 'all 0.2s',
            }}
            disabled={currentSlide === 0}
          >
            {isRTL ? '→' : '←'} {t.back}
          </button>

          <button
            onClick={onDismiss}
            style={{
              padding: '10px 20px',
              background: 'transparent',
              color: colors.textMuted,
              border: 'none',
              borderRadius: 8,
              fontSize: 14,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {t.skip}
          </button>

          {currentSlide < totalSlides - 1 ? (
            <button
              onClick={handleNext}
              style={{
                padding: '10px 24px',
                background: colors.primary,
                color: '#FFFFFF',
                border: 'none',
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {t.next} {isRTL ? '←' : '→'}
            </button>
          ) : (
            <button
              onClick={() => onComplete('national')}
              style={{
                padding: '10px 24px',
                background: colors.primary,
                color: '#FFFFFF',
                border: 'none',
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {t.getStarted}
            </button>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default IntroPresentation;
