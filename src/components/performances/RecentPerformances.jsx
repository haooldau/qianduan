import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin } from 'lucide-react';
import API_BASE_URL from '../../config/api';

const RecentPerformances = () => {
  const [performances, setPerformances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 获取演出数据
  useEffect(() => {
    const fetchPerformances = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL.MAIN_API}/api/performances`);
        const data = await response.json();
        
        if (data.success && Array.isArray(data.data)) {
          // 按日期排序，最新的在前
          const sortedPerformances = data.data
            .map(perf => ({
              ...perf,
              date: new Date(perf.date)
            }))
            .sort((a, b) => b.date - a.date);
          
          setPerformances(sortedPerformances);
        } else {
          throw new Error('Invalid data format');
        }
      } catch (error) {
        console.error('Failed to fetch performances:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPerformances();
  }, []);

  // 过滤并排序演出数据，只显示今日及以后的演出
  const getFuturePerformances = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // 设置为今天的开始时间

    return performances
      .filter(perf => {
        const perfDate = new Date(perf.date);
        perfDate.setHours(0, 0, 0, 0);
        return perfDate >= today;
      })
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
          <p className="mt-4 text-gray-400">正在加载演出数据...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6 max-w-md">
          <h3 className="text-red-500 font-semibold mb-2">数据加载失败</h3>
          <p className="text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* 背景装饰 */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top_right,#1a1a1a,transparent_50%)]" />
      <div className="fixed top-[-10%] right-[-5%] w-[600px] h-[600px] bg-red-500/5 rounded-full blur-[100px]" />
      <div className="fixed bottom-[-20%] left-[-10%] w-[800px] h-[800px] bg-red-500/3 rounded-full blur-[120px]" />

      {/* 主要内容 */}
      <div className="relative max-w-6xl mx-auto px-6">
        {/* 标题区域 */}
        <div className="pt-4">
          <h1 className="text-3xl font-bold text-white">近期演出</h1>
          <p className="text-gray-400 mt-2">即将开始的演出信息</p>
        </div>

        {/* 演出列表 */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {getFuturePerformances().map((perf, index) => (
            <motion.div
              key={perf.id || index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-black/40 backdrop-blur-sm rounded-xl border border-white/10 p-4 hover:bg-white/5 transition-colors"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-lg font-semibold text-white">{perf.artist}</div>
                  <div className="flex items-center gap-2 text-sm text-white/60">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(perf.date).toLocaleDateString('zh-CN')}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-white/80">
                  <MapPin className="w-4 h-4" />
                  <span>{perf.venue}</span>
                </div>
                <div className="text-sm text-white/60">
                  {perf.province} {perf.city}
                </div>
                {perf.type && (
                  <div className="text-sm text-white/40">
                    演出类型：{perf.type}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* 如果没有未来演出，显示提示信息 */}
        {getFuturePerformances().length === 0 && (
          <div className="mt-8 text-center">
            <div className="text-white/40 text-lg">
              暂无近期演出安排
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentPerformances; 