'use client';

import { supabaseClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { ArrowLeft, Bug, Droplet, Thermometer, Activity, Droplets, Zap, PlusCircle, CheckCircle2, Globe, Mic, MapPin, ChevronRight } from 'lucide-react';
import { useAppStore } from '@/lib/stores/appStore';
import { translations } from '@/lib/i18n/translations';

const diseases = [
  { id: 'dengue', emoji: '🦟', labelKey: 'dengue' },
  { id: 'malaria', emoji: '🌡️', labelKey: 'malaria' },
  { id: 'cholera', emoji: '💧', labelKey: 'cholera' },
  { id: 'typhoid', emoji: '⚙️', labelKey: 'typhoid' },
  { id: 'viralFever', emoji: '🤒', labelKey: 'viralFever' },
  { id: 'chikungunya', emoji: '🦵', labelKey: 'chikungunya' },
];

const symptoms = [
  { id: 'wateryDiarrhoea', emoji: '💧', labelKey: 'wateryDiarrhoea' },
  { id: 'vomiting', emoji: '🤢', labelKey: 'vomiting' },
  { id: 'dehydration', emoji: '🫗', labelKey: 'dehydration' },
  { id: 'cramps', emoji: '⚡', labelKey: 'cramps' },
  { id: 'other', emoji: '➕', labelKey: 'other' },
];

const severities = [
  { id: 'mild', emoji: '🙂', labelKey: 'mild', borderColor: 'border-transparent', selectedBorder: 'border-pwa-primary' },
  { id: 'moderate', emoji: '😐', labelKey: 'moderate', borderColor: 'border-transparent', selectedBorder: 'border-yellow-500' },
  { id: 'severe', emoji: '😟', labelKey: 'severe', borderColor: 'border-transparent', selectedBorder: 'border-orange-500' },
  { id: 'emergency', emoji: '🆘', labelKey: 'emergency', borderColor: 'border-transparent', selectedBorder: 'border-red-500' },
];

export default function ReportFlowPage() {
  const router = useRouter();
  const { language, role, displayName, ward, userId } = useAppStore();
  const t = translations[language] as any;
  const tKn = translations['kn'] as any;

  const [step, setStep] = useState(1);
  const [selectedDisease, setSelectedDisease] = useState<string | null>(null);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [severity, setSeverity] = useState<string | null>(null);
  const [peopleCount, setPeopleCount] = useState(3);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!selectedDisease || !severity) return;
    setIsSubmitting(true);
    const { data, error } = await supabaseClient
      .from('health_reports')
      .insert([
        {
          disease: selectedDisease,
          symptoms: selectedSymptoms,
          severity,
          people_count: peopleCount,
          location: '12.9716° N, 77.5946° E',
          user_id: userId || null,
          reporter_type: role === 'ASHA Worker' ? 'asha' : role === 'Resident' ? 'resident' : 'anon',
          username: displayName,
          ward,
        },
      ]);
    setIsSubmitting(false);
    if (error) {
      console.error('Supabase insert error:', error);
      alert(`Failed to submit report. Error: ${error.message || JSON.stringify(error)}`);
      return;
    }
    alert('Report submitted successfully!');
    router.push('/history');
  };

  const handleNext = () => setStep(s => Math.min(s + 1, 3));
  const handlePrev = () => {
    if (step === 1) router.back();
    else setStep(s => s - 1);
  };

  const toggleSymptom = (id: string) => {
    setSelectedSymptoms(prev => 
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const stepTitles = ['selectDisease', 'symptoms', 'severityAndSubmit'];
  const stepNativeTitle = language === 'en' ? tKn[stepTitles[step - 1]] : null;

  return (
    <div className="flex flex-col h-full bg-pwa-bg">
      
      {/* Header */}
      <div className="px-5 pt-5 pb-3 flex items-center border-b border-pwa-border/30">
        <button onClick={handlePrev} className="w-9 h-9 rounded-full bg-pwa-surface flex items-center justify-center text-white mr-4 shrink-0">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex-1 flex flex-col items-center">
          <span className="text-white text-sm font-semibold mb-2">Health Assessment</span>
          <div className="flex gap-1.5 w-full max-w-[180px]">
            {[1, 2, 3].map(i => (
              <div 
                key={i} 
                className={`h-[3px] flex-1 rounded-full transition-all ${i <= step ? 'bg-pwa-primary' : 'bg-pwa-surface'}`}
              />
            ))}
          </div>
        </div>
        <div className="w-9 h-9 rounded-full bg-pwa-surface flex items-center justify-center text-white ml-4 shrink-0">
          <Globe className="w-4 h-4" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 pt-6 pb-48">
        
        {step === 1 && (
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">{t.selectDisease}</h1>
            {language === 'en' && <h2 className="text-xl font-bold text-pwa-primary mb-3">{tKn.selectDisease}</h2>}
            <p className="text-sm text-pwa-muted mb-6">{t.whichDisease}</p>
            
            <div className="grid grid-cols-2 gap-4">
              {diseases.map(d => {
                const isSelected = selectedDisease === d.id;
                return (
                  <button
                    key={d.id}
                    onClick={() => setSelectedDisease(d.id)}
                    className={`flex flex-col items-center justify-center p-5 rounded-[20px] border-2 transition-all ${
                      isSelected 
                        ? 'bg-pwa-surface border-pwa-primary/60' 
                        : 'bg-pwa-surface border-transparent'
                    }`}
                  >
                    <span className="text-4xl mb-3">{d.emoji}</span>
                    <span className="font-bold text-sm text-center text-white">{t[d.labelKey]}</span>
                    {language === 'en' && <span className="text-[10px] text-pwa-muted text-center mt-0.5">{tKn[d.labelKey]}</span>}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">{t.symptoms}</h1>
            {language === 'en' && <h2 className="text-xl font-bold text-pwa-primary mb-3">{tKn.symptoms}</h2>}
            <p className="text-sm text-pwa-muted mb-6">{t.selectSymptoms}</p>
            
            <div className="grid grid-cols-2 gap-4">
              {symptoms.map(s => {
                const isSelected = selectedSymptoms.includes(s.id);
                return (
                  <button
                    key={s.id}
                    onClick={() => toggleSymptom(s.id)}
                    className={`relative flex flex-col items-center justify-center p-5 rounded-[20px] border-2 transition-all ${
                      isSelected 
                        ? 'bg-pwa-surface border-pwa-primary/60' 
                        : 'bg-pwa-surface border-transparent'
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-pwa-primary flex items-center justify-center">
                        <svg className="w-3 h-3 text-pwa-bg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                    <span className="text-4xl mb-3">{s.emoji}</span>
                    <span className="font-bold text-sm text-center text-white">{t[s.labelKey]}</span>
                    {language === 'en' && <span className="text-[10px] text-pwa-muted text-center mt-0.5">{tKn[s.labelKey]}</span>}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">{t.severityAndSubmit}</h1>
            {language === 'en' && <h2 className="text-xl font-bold text-pwa-primary mb-5">{tKn.severityAndSubmit}</h2>}
            
            {/* Assess Severity */}
            <p className="text-sm font-bold text-white mb-3">{t.assessSeverity}</p>
            <div className="space-y-2 mb-8">
              {severities.map(s => {
                const isSelected = severity === s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => setSeverity(s.id)}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${
                      isSelected ? `bg-pwa-surface ${s.selectedBorder}` : 'bg-pwa-surface border-transparent'
                    }`}
                  >
                    <span className="text-2xl">{s.emoji}</span>
                    <div className="text-left">
                      <div className="font-bold text-sm text-white">{t[s.labelKey]}</div>
                      {language === 'en' && <div className="text-[11px] text-pwa-muted mt-0.5">{tKn[s.labelKey]}</div>}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* People Count */}
            <p className="text-sm font-bold text-white mb-3">{t.peopleCount}</p>
            <div className="bg-pwa-surface rounded-2xl p-5 mb-4">
              <div className="flex items-center justify-center gap-8 mb-4">
                <button 
                  onClick={() => setPeopleCount(Math.max(1, peopleCount - 1))}
                  className="w-11 h-11 rounded-xl bg-pwa-surfaceLight flex items-center justify-center text-white text-xl font-bold"
                >
                  −
                </button>
                <div className="flex flex-col items-center">
                  <span className="text-4xl font-bold text-pwa-primary">{peopleCount}</span>
                  <svg className="w-4 h-4 text-pwa-muted mt-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
                <button 
                  onClick={() => setPeopleCount(peopleCount + 1)}
                  className="w-11 h-11 rounded-xl bg-pwa-surfaceLight flex items-center justify-center text-white text-xl font-bold"
                >
                  +
                </button>
              </div>
              <div className="flex gap-3 justify-center">
                <button onClick={() => setPeopleCount(p => p + 5)} className="flex-1 py-2.5 rounded-xl bg-pwa-surfaceLight text-xs font-bold text-white flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                  +5
                </button>
                <button onClick={() => setPeopleCount(p => p + 10)} className="flex-1 py-2.5 rounded-xl bg-pwa-surfaceLight text-xs font-bold text-white flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                  +10
                </button>
              </div>
            </div>

            {/* Voice Note */}
            <button className="w-full bg-pwa-surface rounded-2xl p-4 flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-pwa-surfaceLight flex items-center justify-center text-pwa-muted">
                  <Mic className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="text-sm font-semibold text-white">Add Voice Note</div>
                  <div className="text-[10px] text-pwa-muted">Optional / ಐಚ್ಛಿಕ</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-pwa-muted" />
            </button>

            {/* Location */}
            <div className="w-full bg-pwa-surfaceLight border border-pwa-primary/30 rounded-2xl p-4 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-pwa-primary/20 flex items-center justify-center text-pwa-primary">
                <MapPin className="w-4 h-4" />
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-pwa-primary">Location Detected</div>
                <div className="text-sm text-white font-mono">12.9716° N, 77.5946° E</div>
                <div className="text-[10px] text-pwa-muted">ಸ್ಥಳ ಪತ್ತೆಯಾಗಿದೆ</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="absolute bottom-0 left-0 right-0 px-5 pt-6 pb-8 bg-gradient-to-t from-pwa-bg via-pwa-bg/95 to-transparent z-10">
          {step < 3 ? (
            <div className="flex gap-4">
              <button 
                onClick={handlePrev}
                className="flex-1 py-4 rounded-2xl bg-pwa-surface text-white font-bold text-sm tracking-widest uppercase"
              >
                {t.previous}
              </button>
              <button 
                onClick={handleNext}
                disabled={step === 1 && !selectedDisease}
                className="flex-1 py-4 rounded-2xl bg-pwa-accent text-white font-bold text-sm tracking-widest uppercase shadow-lg shadow-pwa-accent/20 disabled:opacity-50"
              >
                {t.next}
              </button>
            </div>
          ) : (
            <button 
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full py-4 rounded-2xl bg-pwa-primary text-pwa-bg font-bold text-base shadow-lg shadow-pwa-primary/20 flex flex-col items-center disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting...' : t.submitReport}
              {language === 'en' && <span className="text-xs font-medium opacity-80 mt-0.5">{tKn.submitReport}</span>}
            </button>
          )}
      </div>
    </div>
  );
}
