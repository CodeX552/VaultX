import React, { useEffect, useState } from 'react';
import { getSessions, revokeSession, Session } from '../services/session';
import { ComputerDesktopIcon as DesktopComputerIcon, MapPinIcon as LocationMarkerIcon, GlobeAltIcon, TrashIcon } from '@heroicons/react/24/outline';

const SessionsPage: React.FC = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const data = await getSessions();
      setSessions(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleRevoke = async (id: string) => {
    if (!window.confirm('Are you sure you want to revoke this session?')) return;
    try {
      await revokeSession(id);
      fetchSessions();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to revoke session');
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-400">Loading sessions...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Active Sessions</h1>
        <p className="text-gray-400">
          Manage your active logins across different devices. You can revoke any suspicious sessions.
        </p>
        {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}
      </div>

      <div className="grid gap-4">
        {sessions.map((session, index) => (
          <div key={session.id} className="bg-gray-800 border border-gray-700 rounded-lg p-5 flex flex-col md:flex-row justify-between items-start md:items-center">
            <div className="flex items-start gap-4">
              <div className="bg-blue-900/30 p-3 rounded-full text-blue-400">
                <DesktopComputerIcon className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-white flex items-center gap-2">
                  {session.os || 'Unknown OS'} - {session.browser || 'Unknown Browser'}
                  {index === 0 && (
                    <span className="bg-green-500/20 text-green-400 text-xs px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold">
                      Current
                    </span>
                  )}
                </h3>
                
                <div className="flex flex-col gap-1 mt-2 text-sm text-gray-400">
                  <div className="flex items-center gap-2">
                    <LocationMarkerIcon className="w-4 h-4 text-gray-500" />
                    <span>IP: {session.ip || 'Unknown'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <GlobeAltIcon className="w-4 h-4 text-gray-500" />
                    <span>Country: {session.country || 'Unknown'}</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Last active: {new Date(session.updatedAt).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
            
            <button
              onClick={() => handleRevoke(session.id)}
              className="mt-4 md:mt-0 flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors text-sm font-medium border border-red-500/20"
            >
              <TrashIcon className="w-4 h-4" />
              Revoke Session
            </button>
          </div>
        ))}

        {sessions.length === 0 && (
          <div className="text-center p-8 bg-gray-800/50 rounded-lg border border-gray-700/50 text-gray-400">
            No active sessions found.
          </div>
        )}
      </div>
    </div>
  );
};

export default SessionsPage;
