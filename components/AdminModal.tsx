import React, { useState, useEffect } from 'react';
import { X, Trash2, Plus, Sparkles, Lock, Loader2 } from 'lucide-react';
import { ADMIN_PASSWORD } from '../constants';
import { Site, SiteFormData } from '../types';
import { addSite, deleteSite } from '../services/firebaseService';
import { generateSiteDescription } from '../services/geminiService';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  sites: Site[];
}

export const AdminModal: React.FC<AdminModalProps> = ({ isOpen, onClose, sites }) => {
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [error, setError] = useState('');
  
  // Form State
  const [formData, setFormData] = useState<SiteFormData>({ url: '', title: '', description: '' });
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset state on close
  useEffect(() => {
    if (!isOpen) {
      setPasswordInput('');
      setError('');
      // We keep authentication state during the session for convenience, 
      // or we could reset it here: setIsAdminUnlocked(false);
    }
  }, [isOpen]);

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === ADMIN_PASSWORD) {
      setIsAdminUnlocked(true);
      setError('');
    } else {
      setError('비밀번호가 올바르지 않습니다.');
    }
  };

  const handleGenerateAI = async () => {
    if (!formData.url || !formData.title) {
      alert('URL과 제목을 먼저 입력해주세요.');
      return;
    }
    
    setIsGenerating(true);
    try {
      const description = await generateSiteDescription(formData.title, formData.url);
      setFormData(prev => ({ ...prev, description }));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.url || !formData.title) return;

    setIsSubmitting(true);
    try {
      await addSite(formData);
      setFormData({ url: '', title: '', description: '' }); // Reset form
    } catch (err) {
      console.error(err);
      alert('사이트 추가 실패');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      await deleteSite(id);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-900/50 backdrop-blur">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            {isAdminUnlocked ? '사이트 관리 (Admin)' : '관리자 접근'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {!isAdminUnlocked ? (
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
              <div className="p-4 bg-slate-800 rounded-full mb-2">
                <Lock size={32} className="text-blue-500" />
              </div>
              <p className="text-slate-400">관리자 비밀번호를 입력하세요.</p>
              <form onSubmit={handleAuth} className="w-full max-w-xs space-y-2">
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="Password"
                  autoFocus
                />
                {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                <button
                  type="submit"
                  className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition-colors"
                >
                  잠금 해제
                </button>
              </form>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
              {/* Left Column: List */}
              <div className="flex flex-col h-full min-h-[400px]">
                <h3 className="text-slate-400 font-medium mb-4">등록된 사이트 ({sites.length})</h3>
                <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                  {sites.length === 0 && (
                    <div className="text-center py-10 text-slate-600">등록된 사이트가 없습니다.</div>
                  )}
                  {sites.map(site => (
                    <div key={site.id} className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl border border-slate-700/50 hover:border-slate-600 transition-colors group">
                      <div className="flex-1 min-w-0 mr-4">
                        <div className="font-medium text-slate-200 truncate">{site.title}</div>
                        <div className="text-xs text-slate-500 truncate">{site.url}</div>
                      </div>
                      <button 
                        onClick={() => handleDelete(site.id)}
                        className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Add Form */}
              <div className="bg-slate-950/50 p-6 rounded-xl border border-slate-800 h-fit">
                <h3 className="text-slate-200 font-medium mb-6 flex items-center gap-2">
                  <Plus size={18} className="text-blue-500" /> 새 사이트 추가
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">URL</label>
                    <input
                      type="text"
                      value={formData.url}
                      onChange={(e) => setFormData({...formData, url: e.target.value})}
                      placeholder="example.com"
                      className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">사이트 제목</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      placeholder="My Awesome Site"
                      className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-xs font-medium text-slate-500">설명</label>
                      <button
                        type="button"
                        onClick={handleGenerateAI}
                        disabled={isGenerating || !formData.url || !formData.title}
                        className="text-xs flex items-center gap-1 text-blue-400 hover:text-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {isGenerating ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                        AI 자동 생성
                      </button>
                    </div>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      placeholder="Gemini가 설명을 작성해줍니다..."
                      rows={3}
                      className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors resize-none"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 mt-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    {isSubmitting && <Loader2 size={18} className="animate-spin" />}
                    추가하기
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
