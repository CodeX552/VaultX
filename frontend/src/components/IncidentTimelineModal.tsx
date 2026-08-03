import React, { useEffect, useState } from 'react';
import { Modal } from './Modal';
import { getIncidentTimeline, analyzeThreatWithAI, AIAnalysisResult } from '../services/threat';
import { SecurityAlert, AuditLogEntry } from '../types/vault';
import { SparklesIcon } from '@heroicons/react/24/outline';

interface Props {
  ip: string;
  onClose: () => void;
}

export const IncidentTimelineModal: React.FC<Props> = ({ ip, onClose }) => {
  const [timeline, setTimeline] = useState<(SecurityAlert | AuditLogEntry)[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [aiResult, setAiResult] = useState<AIAnalysisResult | null>(null);

  useEffect(() => {
    const fetchTimeline = async () => {
      try {
        const data = await getIncidentTimeline(ip);
        setTimeline(data);
      } catch (err) {
        console.error('Failed to load timeline', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTimeline();
  }, [ip]);

  return (
    <Modal title={`Incident Timeline: ${ip}`} onClose={onClose}>
      <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
        {aiResult && (
          <div className="bg-blue-900/20 border border-blue-500/30 p-4 rounded-xl mb-4">
            <h3 className="text-blue-400 font-bold flex items-center gap-2 mb-2">
              <SparklesIcon className="w-5 h-5" />
              AI Security Analysis
            </h3>
            <p className="text-sm text-slate-300 mb-2">{aiResult.analysis}</p>
            <div className="text-xs text-slate-400 mb-2">Confidence: {aiResult.confidence}</div>
            <div className="text-sm font-semibold text-white mb-1">Recommendation:</div>
            <p className="text-sm text-slate-300 mb-3">{aiResult.recommendation}</p>
            <div className="text-sm font-semibold text-white mb-1">Remediation Steps:</div>
            <ul className="list-disc list-inside text-sm text-slate-300">
              {aiResult.remediation.map((step, idx) => (
                <li key={idx}>{step}</li>
              ))}
            </ul>
            <button 
              onClick={() => setAiResult(null)}
              className="mt-4 text-xs text-blue-400 hover:text-blue-300 underline"
            >
              Dismiss Analysis
            </button>
          </div>
        )}

        {loading ? (
          <p className="text-slate-400 text-center">Loading timeline...</p>
        ) : timeline.length > 0 ? (
          timeline.map((event) => {
            const isAlert = 'attackType' in event;
            return (
              <div
                key={event.id}
                className={`rounded-2xl border p-4 ${
                  isAlert
                    ? 'border-red-500/30 bg-red-500/10'
                    : 'border-white/10 bg-slate-900/40'
                }`}
              >
                <div className="flex justify-between items-start">
                  <span className={`font-semibold ${isAlert ? 'text-red-400' : 'text-slate-200'}`}>
                    {isAlert ? (event as SecurityAlert).attackType : (event as AuditLogEntry).action}
                  </span>
                  <span className="text-xs text-slate-500">
                    {new Date(event.createdAt).toLocaleTimeString()}
                  </span>
                </div>
                
                {isAlert && (
                  <div className="mt-3 flex justify-between items-center">
                    <div className="text-sm text-slate-300">
                      <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-xs mr-2 border border-slate-700">
                        {(event as SecurityAlert).mitreId}
                      </span>
                      {(event as SecurityAlert).severity} Severity
                    </div>
                    
                    <button
                      onClick={async () => {
                        setAnalyzingId(event.id);
                        try {
                          const res = await analyzeThreatWithAI(event.id);
                          setAiResult(res);
                        } catch (err) {
                          alert('Failed to analyze threat');
                        } finally {
                          setAnalyzingId(null);
                        }
                      }}
                      disabled={analyzingId === event.id}
                      className="px-3 py-1 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 text-xs font-semibold rounded-lg border border-purple-500/30 flex items-center gap-1 transition-colors disabled:opacity-50"
                    >
                      <SparklesIcon className="w-3 h-3" />
                      {analyzingId === event.id ? 'Analyzing...' : 'Analyze with AI'}
                    </button>
                  </div>
                )}
                
                <p className="mt-3 text-xs font-mono text-slate-400 bg-black/30 p-2 rounded break-all">
                  {isAlert ? (event as SecurityAlert).payload || (event as SecurityAlert).url : (event as AuditLogEntry).entity}
                </p>
              </div>
            );
          })
        ) : (
          <p className="text-slate-400 text-center">No timeline events found.</p>
        )}
      </div>
    </Modal>
  );
};
