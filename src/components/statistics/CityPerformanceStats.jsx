import React from 'react';
import { X } from 'lucide-react';

const CityPerformanceStats = ({ 
  city, 
  stats, 
  onClose, 
  onClick, 
  showDetails = false 
}) => {
  if (!stats) return null;

  // 统计卡片组件
  const StatsCard = ({ title, total, upcoming }) => (
    <div className="text-center">
      <div className="text-2xl font-medium text-[#ff2d2d]">
        {total}
      </div>
      <div className="text-xs text-gray-400 mt-1">{title}</div>
      {upcoming > 0 && (
        <div className="text-xs text-[#ff2d2d]/80 mt-1">
          即将 {upcoming}
        </div>
      )}
    </div>
  );

  // 演出列表组件
  const PerformanceList = ({ title, performances }) => (
    <div className="space-y-4">
      <h4 className="text-lg font-medium border-b border-gray-800 pb-2">
        {title}
        <span className="text-sm text-gray-400 ml-2">
          (共 {performances.length} 场)
        </span>
      </h4>
      <div className="space-y-2">
        {performances.map((perf, index) => (
          <div 
            key={index}
            className="p-4 bg-black/20 rounded-lg border border-gray-800"
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="text-[#ff2d2d] font-medium">
                  {perf.artist}
                </div>
                <div className="text-sm text-gray-400 mt-1">
                  {new Date(perf.date).toLocaleDateString('zh-CN')}
                  {perf.venue && ` · ${perf.venue}`}
                </div>
                {perf.city !== city && (
                  <div className="text-xs text-gray-500 mt-1">
                    距离: {perf.distance}km
                  </div>
                )}
              </div>
              {perf.isUpcoming && (
                <div className="px-2 py-1 rounded-full bg-[#ff2d2d]/10 text-[#ff2d2d] text-xs">
                  即将演出
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // 统计概览
  if (!showDetails) {
    return (
      <div 
        className="mt-2 p-4 bg-black/20 rounded-lg border border-gray-800 cursor-pointer hover:border-[#ff2d2d]/20 transition-colors"
        onClick={onClick}
      >
        <div className="grid grid-cols-3 gap-4">
          <StatsCard 
            title="市内演出" 
            total={stats.inCity.total} 
            upcoming={stats.inCity.upcoming} 
          />
          <StatsCard 
            title="周边演出" 
            total={stats.nearby.total} 
            upcoming={stats.nearby.upcoming} 
          />
          <StatsCard 
            title="区域演出" 
            total={stats.wider.total} 
            upcoming={stats.wider.upcoming} 
          />
        </div>
      </div>
    );
  }

  // 详细统计弹窗
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-[#111111] rounded-xl p-8 max-w-4xl w-full max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-medium">
            {city} 演出统计
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-6">
          <PerformanceList 
            title="市内演出" 
            performances={stats.inCity.performances} 
          />
          <PerformanceList 
            title="周边演出" 
            performances={stats.nearby.performances} 
          />
          <PerformanceList 
            title="区域演出" 
            performances={stats.wider.performances} 
          />
        </div>
      </div>
    </div>
  );
};

export default CityPerformanceStats; 