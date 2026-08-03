import React, { useEffect, useState } from 'react';
import { getThreats, resolveThreat, getExportThreatsUrl, ThreatStats } from '../services/threat';
import { SecurityAlert } from '../types/vault';
import { ShieldExclamationIcon, CheckCircleIcon, ClockIcon } from '@heroicons/react/24/outline';
import { IncidentTimelineModal } from '../components/IncidentTimelineModal';

const ThreatDashboardPage: React.FC = () => {
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [stats, setStats] = useState<ThreatStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedIp, setSelectedIp] = useState<string | null>(null);

  const fetchThreats = async () => {
    try {
      setLoading(true);
      const data = await getThreats();
      setAlerts(data.alerts);
      setStats(data.stats);
    } catch (err) {
      console.error('Failed to load threats', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchThreats();
  }, []);

  const handleResolve = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await resolveThreat(id);
      fetchThreats();
    } catch (err) {
      console.error('Failed to resolve threat', err);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-400">Loading threat intelligence...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8">
      <div className="mb-8 flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-red-500 mb-2 flex items-center gap-3">
            <ShieldExclamationIcon className="w-8 h-8" />
            Threat Hunting Dashboard
          </h1>
          <p className="text-gray-400">
            Monitor and investigate blocked attacks intercepted by the Web Application Firewall.
          </p>
        </div>
        
        <button
          onClick={() => {
            const url = getExportThreatsUrl();
            // Since we need auth cookie, normally we fetch it or open in same window depending on setup
            // For a simple GET endpoint, window.open works if cookies are passed (same-origin).
            window.location.href = url;
          }}
          className="px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 rounded-lg text-sm font-semibold transition-colors shrink-0"
        >
          Export for SIEM (JSON)
        </button>
      </div>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-6">
            <h3 className="text-slate-400 text-sm uppercase tracking-wider mb-2">Total Attacks Blocked</h3>
            <p className="text-4xl font-bold text-white">{stats.totalAttacks}</p>
          </div>
          <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-6">
            <h3 className="text-red-400 text-sm uppercase tracking-wider mb-2">High/Critical Severity</h3>
            <p className="text-4xl font-bold text-red-500">{stats.highSeverityCount}</p>
          </div>
        </div>
      )}

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <h2 className="text-lg font-semibold text-white">Recent Security Alerts</h2>
        </div>
        
        <div className="divide-y divide-slate-800">
          {alerts.length > 0 ? (
            alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-6 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between cursor-pointer transition-colors hover:bg-slate-800/50 ${alert.resolved ? 'opacity-50' : ''}`}
                onClick={() => alert.ip && setSelectedIp(alert.ip)}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="bg-slate-800 text-slate-300 px-2 py-1 rounded text-xs font-mono border border-slate-700">
                      {alert.mitreId}
                    </span>
                    <h3 className="text-lg font-medium text-white">{alert.attackType}</h3>
                    {alert.severity === 'CRITICAL' || alert.severity === 'HIGH' ? (
                      <span className="bg-red-500/20 text-red-400 text-xs px-2 py-0.5 rounded-full font-semibold">
                        {alert.severity}
                      </span>
                    ) : (
                      <span className="bg-orange-500/20 text-orange-400 text-xs px-2 py-0.5 rounded-full font-semibold">
                        {alert.severity}
                      </span>
                    )}
                  </div>
                  
                  <div className="text-sm text-slate-400 mt-2 flex flex-wrap items-center gap-4">
                    <span className="flex items-center gap-1">
                      <ClockIcon className="w-4 h-4" />
                      {new Date(alert.createdAt).toLocaleString()}
                    </span>
                    <span>IP: <span className="font-mono text-slate-300">{alert.ip}</span></span>
                    <span>Target: <span className="font-mono text-slate-300">{alert.url}</span></span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {!alert.resolved ? (
                    <button
                      onClick={(e) => handleResolve(alert.id, e)}
                      className="px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg text-sm font-medium transition-colors border border-emerald-500/20 flex items-center gap-2"
                    >
                      <CheckCircleIcon className="w-4 h-4" />
                      Resolve
                    </button>
                  ) : (
                    <span className="text-emerald-500 text-sm flex items-center gap-1">
                      <CheckCircleIcon className="w-4 h-4" />
                      Resolved
                    </span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-slate-500">
              No security alerts found. Your system is quiet.
            </div>
          )}
        </div>
      </div>

      {selectedIp && (
        <IncidentTimelineModal ip={selectedIp} onClose={() => setSelectedIp(null)} />
      )}
    </div>
  );
};

export default ThreatDashboardPage;
