import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar, MapPin, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PerformanceCalendar = ({ performances }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedPerformances, setSelectedPerformances] = useState([]);
  const [showDetails, setShowDetails] = useState(false);

  // 添加调试日志
  console.log('Calendar received performances:', performances);

  // 生成日历数据
  useEffect(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const firstDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // 添加上月剩余天数
    for (let i = 0; i < firstDayOfWeek; i++) {
      const date = new Date(year, month, -firstDayOfWeek + i + 1);
      days.push({
        date,
        isCurrentMonth: false,
        performances: getPerformancesForDate(date)
      });
    }
    
    // 添加当月天数
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const date = new Date(year, month, i);
      days.push({
        date,
        isCurrentMonth: true,
        performances: getPerformancesForDate(date)
      });
    }
    
    // 补充下月天数，确保总是显示6行
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      const date = new Date(year, month + 1, i);
      days.push({
        date,
        isCurrentMonth: false,
        performances: getPerformancesForDate(date)
      });
    }
    
    setCalendarDays(days);
  }, [currentMonth, performances]);

  const getPerformancesForDate = (date) => {
    return performances.filter(perf => {
      // 将日期字符串转换为日期对象
      const perfDate = new Date(perf.date);
      // 只比较年月日，忽略时分秒
      return perfDate.getFullYear() === date.getFullYear() &&
             perfDate.getMonth() === date.getMonth() &&
             perfDate.getDate() === date.getDate();
    });
  };

  const handleDateClick = (date, performances) => {
    if (performances.length > 0) {
      // 按时间排序
      const sortedPerformances = [...performances].sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateA - dateB;
      });
      
      setSelectedDate(date);
      setSelectedPerformances(sortedPerformances);
      setShowDetails(true);
    }
  };

  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

  return (
    <div className="bg-[#1a1b1e]/50 backdrop-blur-md rounded-2xl border border-white/5 h-full">
      <AnimatePresence mode="wait">
        {!showDetails ? (
          // 日历视图
          <motion.div
            key="calendar"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-6 h-full flex flex-col"
          >
            {/* 标题和月份切换 */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                演出日历
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentMonth(prev => {
                    const newDate = new Date(prev);
                    newDate.setMonth(prev.getMonth() - 1);
                    return newDate;
                  })}
                  className="p-1 hover:bg-white/5 rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-white/60" />
                </button>
                <span className="text-white/80">
                  {currentMonth.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' })}
                </span>
                <button
                  onClick={() => setCurrentMonth(prev => {
                    const newDate = new Date(prev);
                    newDate.setMonth(prev.getMonth() + 1);
                    return newDate;
                  })}
                  className="p-1 hover:bg-white/5 rounded-lg transition-colors"
                >
                  <ChevronRight className="w-5 h-5 text-white/60" />
                </button>
              </div>
            </div>

            {/* 日历网格 */}
            <div className="flex-1">
              <div className="grid grid-cols-7 gap-1">
                {weekDays.map(day => (
                  <div key={day} className="text-center text-sm text-white/40 py-1">
                    {day}
                  </div>
                ))}
                {calendarDays.map(({ date, isCurrentMonth, performances }, index) => (
                  <div
                    key={index}
                    onClick={() => handleDateClick(date, performances)}
                    className={`
                      p-1 relative cursor-pointer
                      ${isCurrentMonth ? 'text-white' : 'text-white/20'}
                      ${performances.length > 0 ? 'hover:bg-[#db2626]/20' : ''}
                      rounded-lg transition-colors
                    `}
                  >
                    <div className="h-8 flex flex-col items-center justify-center">
                      <span className="text-sm">{date.getDate()}</span>
                      {performances.length > 0 && (
                        <div className="text-xs text-[#db2626] mt-0.5">
                          {performances.length}场
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        ) : (
          // 演出详情视图
          <motion.div
            key="details"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ type: 'tween', duration: 0.2 }}
            className="h-[400px] flex flex-col bg-[#1a1b1e]/80 backdrop-blur-md rounded-2xl border border-white/10"
          >
            {/* 标题栏 */}
            <div className="p-4 border-b border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowDetails(false)}
                    className="p-1.5 hover:bg-white/5 rounded-lg transition-colors text-white/60 hover:text-white"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <h3 className="text-xl font-semibold text-white">
                    {selectedDate?.toLocaleDateString('zh-CN')} 演出安排
                  </h3>
                </div>
                <div className="text-sm text-white/40">
                  共 {selectedPerformances.length} 场演出
                </div>
              </div>
            </div>

            {/* 演出列表 - 添加自定义滚动条样式 */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <div className="p-4 space-y-3">
                {selectedPerformances.map((perf, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-black/20 rounded-lg p-4 border border-white/5 hover:bg-white/5 transition-colors"
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
                    {perf.notes && (
                      <div className="mt-2 text-sm text-white/40 pl-6">
                        {perf.notes}
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

export default PerformanceCalendar; 