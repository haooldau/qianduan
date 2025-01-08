import React, { useState, useEffect } from 'react';
import { BarChart3, PieChart, Calendar, Users, MapPin, X } from 'lucide-react';
import axios from 'axios';
import API_BASE_URL from '../../config/api';
import PerformanceCalendar from '../performances/PerformanceCalendar';
import { AnimatePresence, motion } from 'framer-motion';

const StatisticsView = () => {
  const [statistics, setStatistics] = useState({
    totalPerformances: 0,
    totalArtists: 0,
    totalVenues: 0,
    performancesByMonth: {},
    performancesByProvince: {},
    topArtists: [],
    topVenues: [],
    performances: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showMonthlyDetails, setShowMonthlyDetails] = useState(false);
  const [showArtistDetails, setShowArtistDetails] = useState(false);
  const [showProvinceDetails, setShowProvinceDetails] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [selectedProvince, setSelectedProvince] = useState(null);

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL.MAIN_API}/api/performances`);
        if (response.data.success) {
          const performances = response.data.data;
          processStatistics(performances);
        }
      } catch (error) {
        console.error('获取统计数据失败:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();
  }, []);

  const processStatistics = (performances) => {
    // 统计基础数据
    const artists = new Set(performances.filter(p => p.artist).map(p => p.artist));
    const venues = new Set(performances.filter(p => p.venue).map(p => p.venue));

    // 按月份统计
    const byMonth = performances.reduce((acc, perf) => {
      if (!perf.date) {
        acc['未知'] = (acc['未知'] || 0) + 1;
        return acc;
      }
      const month = new Date(perf.date).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' });
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {});

    // 按省份统计
    const byProvince = performances.reduce((acc, perf) => {
      if (!perf.province) {
        acc['未知'] = (acc['未知'] || 0) + 1;
        return acc;
      }
      const province = perf.province.replace(/省|自治区|维吾尔|回族|壮族|特别行政区|市/g, '').trim();
      acc[province] = (acc[province] || 0) + 1;
      return acc;
    }, {});

    // 艺人演出次数排名
    const artistPerformances = performances.reduce((acc, perf) => {
      if (!perf.artist) return acc;
      acc[perf.artist] = (acc[perf.artist] || 0) + 1;
      return acc;
    }, {});

    const topArtists = Object.entries(artistPerformances)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);

    // 场馆使用次数排名
    const venuePerformances = performances.reduce((acc, perf) => {
      if (!perf.venue) return acc;
      acc[perf.venue] = (acc[perf.venue] || 0) + 1;
      return acc;
    }, {});

    const topVenues = Object.entries(venuePerformances)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);

    // 处理演出数据，确保日期格式正确
    const processedPerformances = performances.map(perf => {
      const processedPerf = {
        ...perf,
        date: perf.date ? new Date(perf.date).toISOString() : null,
        artist: perf.artist?.trim() || '未知艺人',
        province: perf.province ? perf.province.replace(/省|自治区|维吾尔|回族|壮族|特别行政区|市/g, '').trim() : '未知',
        city: perf.city?.trim() || '未知城市',
        venue: perf.venue?.trim() || '未知场馆',
        type: perf.tag?.trim() || '未知类型'
      };
      return processedPerf;
    });

    setStatistics({
      totalPerformances: performances.length,
      totalArtists: artists.size,
      totalVenues: venues.size,
      performancesByMonth: byMonth,
      performancesByProvince: byProvince,
      topArtists,
      topVenues,
      performances: processedPerformances
    });
  };

  // 修改卡片基础样式
  const cardBaseStyle = "bg-[#1a1b1e]/50 backdrop-blur-md rounded-2xl border border-white/5 p-6 relative h-[400px] flex flex-col";

  // 月度演出统计卡片
  const MonthlyStats = () => {
    const handleMonthClick = (month) => {
      console.log('Clicked month:', month);
      setSelectedMonth(month);
      setShowMonthlyDetails(true);
      
      // 打印过滤后的演出数据
      const monthPerformances = statistics.performances.filter(perf => {
        const perfMonth = new Date(perf.date).toLocaleDateString('zh-CN', { 
          year: 'numeric', 
          month: 'long' 
        });
        return perfMonth === month;
      });
      console.log('Found performances for month:', monthPerformances);
    };

    const getMonthPerformances = (month) => {
      return statistics.performances
        .filter(perf => {
          const perfDate = new Date(perf.date);
          const perfMonth = perfDate.toLocaleDateString('zh-CN', { 
            year: 'numeric', 
            month: 'long' 
          });
          return perfMonth === month;
        })
        .sort((a, b) => new Date(a.date) - new Date(b.date));
    };

    // 获取最近12个月的数据
    const getLast12Months = () => {
      const months = Object.entries(statistics.performancesByMonth);
      const sortedMonths = months.sort((a, b) => {
        const dateA = new Date(a[0].replace('年', '/').replace('月', ''));
        const dateB = new Date(b[0].replace('年', '/').replace('月', ''));
        return dateB - dateA;
      });
      return sortedMonths.slice(0, 12);
    };

    return (
      <div className={cardBaseStyle}>
        <AnimatePresence mode="wait">
          {!showMonthlyDetails ? (
            <motion.div className="flex flex-col h-full">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2 flex-shrink-0">
                <BarChart3 className="w-5 h-5" />
                月度演出统计
              </h2>
              <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                <div className="space-y-3">
                  {getLast12Months().map(([month, count]) => (
                    <div 
                      key={month} 
                      className="flex items-center gap-4 cursor-pointer hover:bg-white/5 p-2 rounded-lg transition-colors"
                      onClick={() => handleMonthClick(month)}
                    >
                      <div className="w-24 text-sm text-white/60">{month}</div>
                      <div className="flex-1 h-2 bg-black/20 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#db2626] rounded-full transition-all duration-1000"
                          style={{
                            width: `${(count / Math.max(...Object.values(statistics.performancesByMonth))) * 100}%`
                          }}
                        />
                      </div>
                      <div className="w-12 text-right text-sm text-white">{count}</div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col h-full"
            >
              <div className="flex items-center justify-between mb-4 flex-shrink-0">
                <h3 className="text-xl font-semibold text-white">{selectedMonth} 演出列表</h3>
                <button
                  onClick={() => setShowMonthlyDetails(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-white/60" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                {selectedMonth && statistics.performances ? (
                  <div className="space-y-3">
                    {getMonthPerformances(selectedMonth).length > 0 ? (
                      getMonthPerformances(selectedMonth).map((perf, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="bg-black/20 rounded-lg p-4 border border-white/5"
                        >
                          <div className="flex items-center justify-between">
                            <div className="text-white font-medium">{perf.artist}</div>
                            <div className="text-sm text-white/40">
                              {new Date(perf.date).toLocaleDateString('zh-CN')}
                            </div>
                          </div>
                          <div className="text-sm text-white/60 mt-2 flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            <span>
                              {perf.province} {perf.city}
                              {perf.venue && ` - ${perf.venue}`}
                            </span>
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <div className="text-white/40 text-center py-4">
                        暂无演出数据
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-white/40 text-center py-4">
                    加载中...
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  // 热门艺人排行卡片
  const ArtistStats = () => {
    const handleArtistClick = (artist) => {
      console.log('Clicked artist:', artist);
      setSelectedArtist(artist);
      setShowArtistDetails(true);
      
      // 打印过滤后的演出数据
      const artistPerformances = statistics.performances.filter(perf => 
        perf.artist.trim() === artist.trim()
      );
      console.log('Found performances for artist:', artistPerformances);
    };

    const getArtistPerformances = (artist) => {
      return statistics.performances
        .filter(perf => perf.artist.trim() === artist.trim())
        .sort((a, b) => new Date(a.date) - new Date(b.date));
    };

    // 将艺人列表分成多列
    const getArtistColumns = () => {
      const artists = statistics.topArtists.slice(0, 25); // 限制最多25名
      const columns = [];
      for (let i = 0; i < artists.length; i += 5) {
        columns.push(artists.slice(i, i + 5));
      }
      return columns;
    };

    return (
      <div className={cardBaseStyle}>
        <AnimatePresence mode="wait">
          {!showArtistDetails ? (
            <motion.div className="flex flex-col h-full">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2 flex-shrink-0">
                <PieChart className="w-5 h-5" />
                热门艺人排行
              </h2>
              <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                <div className="grid grid-cols-3 gap-4">
                  {getArtistColumns().map((column, colIndex) => (
                    <div key={colIndex} className="space-y-3">
                      {column.map(([artist, count], index) => (
                        <div 
                          key={artist} 
                          className="flex items-center gap-4 cursor-pointer hover:bg-white/5 p-2 rounded-lg transition-colors"
                          onClick={() => handleArtistClick(artist)}
                        >
                          <div className="w-8 h-8 rounded-full bg-[#db2626]/10 flex items-center justify-center text-[#db2626] font-medium">
                            {colIndex * 5 + index + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-white font-medium truncate">{artist}</div>
                            <div className="text-sm text-white/60">{count} 场演出</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col h-full"
            >
              <div className="flex items-center justify-between mb-4 flex-shrink-0">
                <h3 className="text-xl font-semibold text-white">{selectedArtist} 演出列表</h3>
                <button
                  onClick={() => setShowArtistDetails(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-white/60" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                <div className="space-y-3">
                  {getArtistPerformances(selectedArtist).map((perf, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-black/20 rounded-lg p-4 border border-white/5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="text-white font-medium">
                          {perf.tag || '演出'}
                        </div>
                        <div className="text-sm text-white/40">
                          {new Date(perf.date).toLocaleDateString('zh-CN')}
                        </div>
                      </div>
                      <div className="text-sm text-white/60 mt-2 flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span>
                          {perf.province} {perf.city}
                          {perf.venue && ` - ${perf.venue}`}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  // 省份分布统计卡片
  const ProvinceStats = () => {
    const handleProvinceClick = (province) => {
      console.log('Clicked province:', province);
      setSelectedProvince(province);
      setShowProvinceDetails(true);
      
      // 打印过滤后的演出数据
      const provincePerformances = statistics.performances.filter(perf => {
        if (!perf.province) return false;
        const perfProvince = perf.province.replace(/省|自治区|维吾尔|回族|壮族|特别行政区|市/g, '').trim();
        return perfProvince === province;
      });
      console.log('Found performances for province:', provincePerformances);
    };

    const getProvincePerformances = (province) => {
      return statistics.performances
        .filter(perf => {
          if (!perf.province) return false;
          const perfProvince = perf.province.replace(/省|自治区|维吾尔|回族|壮族|特别行政区|市/g, '').trim();
          return perfProvince === province;
        })
        .sort((a, b) => {
          if (!a.date) return 1;
          if (!b.date) return -1;
          return new Date(a.date) - new Date(b.date);
        });
    };

    return (
      <div className={cardBaseStyle}>
        <AnimatePresence mode="wait">
          {!showProvinceDetails ? (
            <motion.div className="flex flex-col h-full">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2 flex-shrink-0">
                <BarChart3 className="w-5 h-5" />
                省份分布统计
              </h2>
              <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                <div className="space-y-3">
                  {Object.entries(statistics.performancesByProvince)
                    .sort(([,a], [,b]) => b - a)
                    .map(([province, count]) => (
                      <div 
                        key={province} 
                        className="flex items-center gap-3 py-1 cursor-pointer hover:bg-white/5 rounded-lg transition-colors"
                        onClick={() => handleProvinceClick(province)}
                      >
                        <div className="min-w-[60px] text-sm text-white/60">{province}</div>
                        <div className="flex-1 h-3 bg-black/20 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#db2626] rounded-full transition-all duration-1000"
                            style={{
                              width: `${(count / Math.max(...Object.values(statistics.performancesByProvince))) * 100}%`
                            }}
                          />
                        </div>
                        <div className="min-w-[30px] text-right text-sm text-white">{count}</div>
                      </div>
                    ))}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col h-full"
            >
              <div className="flex items-center justify-between mb-4 flex-shrink-0">
                <h3 className="text-xl font-semibold text-white">{selectedProvince} 演出列表</h3>
                <button
                  onClick={() => setShowProvinceDetails(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-white/60" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                <div className="space-y-3">
                  {getProvincePerformances(selectedProvince).map((perf, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-black/20 rounded-lg p-4 border border-white/5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="text-white font-medium">{perf.artist}</div>
                        <div className="text-sm text-white/40">
                          {new Date(perf.date).toLocaleDateString('zh-CN')}
                        </div>
                      </div>
                      <div className="text-sm text-white/60 mt-2 flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span>
                          {perf.city}
                          {perf.venue && ` - ${perf.venue}`}
                        </span>
                      </div>
                      {perf.name && (
                        <div className="mt-2 text-sm text-white/40">
                          演出名称：{perf.name}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f1115] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-[#db2626] border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0f1115] flex items-center justify-center">
        <div className="bg-[#db2626]/10 border border-[#db2626]/20 rounded-lg p-6 max-w-md">
          <h3 className="text-[#db2626] font-semibold mb-2">数据加载失败</h3>
          <p className="text-white/60">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black overflow-hidden">
      {/* 背景装饰 */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#db2626]/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-[#db2626]/3 rounded-full blur-[120px]" />
      </div>

      {/* 主要内容 */}
      <div className="relative z-10 max-w-7xl mx-auto p-6">
        {/* 添加标题区 */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
            艺人市场评估
          </h1>
          <p className="mt-2 text-white/60">
            评估艺人在目标城市的市场价值和新鲜度
          </p>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="总演出次数"
            value={statistics.totalPerformances}
            icon={Calendar}
            trend={10}
          />
          <StatCard
            title="艺人数量"
            value={statistics.totalArtists}
            icon={Users}
            trend={5}
          />
          <StatCard
            title="演出场馆"
            value={statistics.totalVenues}
            icon={MapPin}
            trend={8}
          />
          <StatCard
            title="覆盖城市"
            value={Object.keys(statistics.performancesByProvince).length}
            icon={BarChart3}
            trend={3}
          />
        </div>

        {/* 其他统计内容 */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <MonthlyStats />
          <ArtistStats />
          <ProvinceStats />
          {/* 演出日历 */}
          <div className="h-full">
            {console.log('Rendering calendar with performances:', statistics.performances)}
            <PerformanceCalendar 
              performances={statistics.performances || []}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// StatCard 组件
const StatCard = ({ title, value, icon: Icon, trend }) => {
  return (
    <div className="bg-black/40 backdrop-blur-sm rounded-xl border border-white/10 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-white/60 text-sm">{title}</h3>
          <p className="text-3xl font-semibold text-white mt-1">{value}</p>
        </div>
        <div className="w-12 h-12 bg-[#db2626]/10 rounded-xl flex items-center justify-center">
          <Icon className="w-6 h-6 text-[#db2626]" />
        </div>
      </div>
      {trend && (
        <div className="mt-4 text-sm">
          <span className={`${trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
            {trend > 0 ? '+' : ''}{trend}%
          </span>
          <span className="text-white/40 ml-2">较上月</span>
        </div>
      )}
    </div>
  );
};

export default StatisticsView; 