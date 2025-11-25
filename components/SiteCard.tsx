import React from 'react';
import { ExternalLink, Globe } from 'lucide-react';
import { Site } from '../types';

interface SiteCardProps {
  site: Site;
}

export const SiteCard: React.FC<SiteCardProps> = ({ site }) => {
  const handleCardClick = () => {
    const targetUrl = site.url.startsWith('http') ? site.url : `https://${site.url}`;
    window.open(targetUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div 
      onClick={handleCardClick}
      className="group relative flex flex-col justify-between h-48 p-5 bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl cursor-pointer hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300 overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none group-hover:bg-blue-500/10 transition-colors" />

      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2 text-slate-400">
            <Globe size={14} />
            <span className="text-xs font-medium tracking-wide uppercase opacity-70 truncate max-w-[150px]">
              {site.name}
            </span>
          </div>
          <ExternalLink size={16} className="text-slate-600 group-hover:text-blue-400 transition-colors" />
        </div>

        <h3 className="text-lg font-bold text-slate-100 mb-2 leading-tight line-clamp-1 group-hover:text-blue-100 transition-colors">
          {site.title}
        </h3>

        <p className="text-sm text-slate-400 leading-relaxed line-clamp-3">
          {site.description}
        </p>
      </div>
    </div>
  );
};
