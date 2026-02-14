import React from 'react';
import { ExternalLink } from 'lucide-react';

interface NewsItem {
  id: number;
  source: string;
  title: string;
  time: string;
  category: string;
  image: string;
}

export const NewsFeed: React.FC<{ news: NewsItem[] }> = ({ news }) => {
  return (
    <div className="flex flex-col gap-4 flex-1 overflow-y-auto">
      {news.map((item) => (
        <div 
          key={item.id} 
          className="flex gap-4 p-3 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-blue-50/50 hover:border-blue-100 transition-all group cursor-pointer"
        >
          <img 
            src={item.image} 
            alt="News" 
            className="w-16 h-16 rounded-xl object-cover border border-slate-200"
          />
          <div className="flex-1 flex flex-col justify-center">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-black text-blue-600 uppercase tracking-wider mb-1">
                {item.category}
              </span>
              <ExternalLink size={12} className="text-slate-300 group-hover:text-blue-400" />
            </div>
            <h4 className="text-sm font-bold text-slate-800 leading-tight line-clamp-2">
              {item.title}
            </h4>
            <div className="flex gap-2 mt-2 text-[10px] text-slate-400 font-medium">
              <span>{item.source}</span>
              <span>•</span>
              <span>{item.time}</span>
            </div>
          </div>
        </div>
      ))}
      
      <button className="mt-auto py-3 w-full text-xs font-bold text-slate-500 hover:text-blue-600 hover:bg-slate-50 rounded-xl transition-colors">
        View All Market Updates
      </button>
    </div>
  );
};