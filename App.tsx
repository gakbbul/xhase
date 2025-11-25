import React, { useState, useEffect } from 'react';
import { Search, Lock, Settings } from 'lucide-react';
import { APP_PASSWORD } from './constants';
import { Site } from './types';
import { subscribeToSites } from './services/firebaseService';
import { SiteCard } from './components/SiteCard';
import { AdminModal } from './components/AdminModal';

// Lock Screen Component
const LockScreen = ({ onUnlock }: { onUnlock: () => void }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === APP_PASSWORD) {
      onUnlock();
    } else {
      setError('접근 권한이 없습니다.');
      setPassword('');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900/50 border border-slate-800 p-8 rounded-2xl shadow-2xl backdrop-blur-md">
        <div className="flex flex-col items-center mb-8">
          <div className="p-4 bg-slate-800 rounded-full mb-4 ring-1 ring-slate-700">
            <Lock size={40} className="text-blue-500" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-wider">RESTRICTED ACCESS</h1>
          <p className="text-slate-400 mt-2 text-sm">보안 비밀번호를 입력해주세요.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-lg text-center text-white text-lg tracking-widest focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-slate-600"
            placeholder="••••••"
            autoFocus
          />
          {error && <p className="text-red-500 text-sm text-center font-medium animate-pulse">{error}</p>}
          <button
            type="submit"
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-all transform hover:scale-[1.02] active:scale-[0.98]"
          >
            ENTER SYSTEM
          </button>
        </form>
      </div>
    </div>
  );
};

// Main Dashboard Component
const App: React.FC = () => {
  const [isAppUnlocked, setIsAppUnlocked] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);

  // Initial Auth Check (Optional: could verify session storage here)
  useEffect(() => {
    const unlocked = sessionStorage.getItem('gakbbul_unlocked');
    if (unlocked === 'true') {
      setIsAppUnlocked(true);
    }
    setLoading(false);
  }, []);

  // Data Subscription
  useEffect(() => {
    if (!isAppUnlocked) return;

    const unsubscribe = subscribeToSites((updatedSites) => {
      setSites(updatedSites);
    });

    return () => unsubscribe();
  }, [isAppUnlocked]);

  const handleUnlock = () => {
    setIsAppUnlocked(true);
    sessionStorage.setItem('gakbbul_unlocked', 'true');
  };

  const filteredSites = sites.filter(site => 
    site.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    site.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    site.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return null;

  if (!isAppUnlocked) {
    return <LockScreen onUnlock={handleUnlock} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-blue-500/30">
      {/* Sticky Header */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-800/50 bg-slate-950/80 backdrop-blur-md supports-[backdrop-filter]:bg-slate-950/60">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between gap-4">
          <div className="flex-shrink-0">
            <h1 className="text-2xl md:text-3xl font-black tracking-tighter text-white bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              GAKBBUL
            </h1>
          </div>

          <div className="flex-1 max-w-xl relative">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={18} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="검색어를 입력하세요..."
                className="w-full bg-slate-900/50 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-200 focus:outline-none focus:border-blue-500/50 focus:bg-slate-900 transition-all"
              />
            </div>
          </div>

          <button 
            onClick={() => setIsAdminModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <Settings size={18} />
            <span className="hidden sm:inline">사이트 관리</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {filteredSites.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500">
            <Search size={48} className="mb-4 opacity-20" />
            <p className="text-lg">검색 결과가 없습니다.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSites.map(site => (
              <SiteCard key={site.id} site={site} />
            ))}
          </div>
        )}
      </main>

      {/* Modals */}
      <AdminModal 
        isOpen={isAdminModalOpen} 
        onClose={() => setIsAdminModalOpen(false)} 
        sites={sites}
      />
    </div>
  );
};

export default App;
