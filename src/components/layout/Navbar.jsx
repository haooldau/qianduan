import React, { useState } from 'react';
import { Bell, Settings, Search, User, Menu } from 'lucide-react';
import { motion } from 'framer-motion';

const Navbar = ({ sidebarCollapsed, onToggleSidebar }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="h-16 border-b border-white/5 bg-black/20 backdrop-blur-lg fixed top-0 left-0 right-0 z-50">
      <div className="max-w-[2000px] mx-auto h-full px-6 flex items-center justify-between">
        {/* Logo 区域 */}
        <div className="flex items-center gap-6">
          {/* 侧边栏切换按钮 - 改为空心圆环设计 */}
          <motion.button
            onClick={onToggleSidebar}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-6 h-6 rounded-full flex items-center justify-center
              relative group border-[1.5px] border-[#ff2d2d] hover:bg-[#ff2d2d]/10 transition-all duration-300"
          >
            {/* 外圈动画效果 */}
            <motion.div
              initial={false}
              animate={{ 
                rotate: sidebarCollapsed ? 0 : 180,
                scale: sidebarCollapsed ? 1 : 0.9,
                borderColor: sidebarCollapsed ? 'rgba(255, 45, 45, 0.8)' : 'rgba(255, 45, 45, 0.4)'
              }}
              transition={{ 
                duration: 0.3,
                ease: [0.4, 0, 0.2, 1]
              }}
              className="absolute inset-0 rounded-full border-[1.5px]
                opacity-0 group-hover:opacity-100 transition-opacity"
            />
          </motion.button>

          {/* Logo */}
          <div className="flex items-center gap-2">
            <img src="/logo192.png" alt="Logo" className="w-8 h-8" />
            <span className="text-xl font-semibold text-white">SparkleLive</span>
          </div>
        </div>

        {/* 搜索栏 */}
        <div className="flex-1 max-w-xl mx-auto relative">
          <motion.div
            animate={{
              scale: isFocused ? 1.02 : 1,
              boxShadow: isFocused ? '0 0 20px rgba(255, 45, 45, 0.1)' : 'none'
            }}
            transition={{ duration: 0.2 }}
            className="relative flex items-center"
          >
            <Search className={`absolute left-3 w-5 h-5 transition-colors duration-200 
              ${isFocused ? 'text-[#ff2d2d]' : 'text-white/40'}`} />
            <input
              type="text"
              placeholder="搜索艺人、演出、场馆..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              className="w-full bg-white/5 border border-white/10 rounded-full pl-10 pr-4 py-2 
                text-white placeholder-white/40 focus:outline-none focus:border-[#ff2d2d]/30
                focus:bg-white/10 transition-all duration-300"
            />
          </motion.div>
        </div>

        {/* 右侧按钮组 */}
        <div className="flex items-center gap-4">
          <button className="p-2 rounded-lg hover:bg-white/5 text-white/60 hover:text-white transition-colors">
            <Bell className="w-5 h-5" />
          </button>
          <button className="p-2 rounded-lg hover:bg-white/5 text-white/60 hover:text-white transition-colors">
            <Settings className="w-5 h-5" />
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#ff2d2d] 
            hover:bg-[#ff2d2d]/90 text-white transition-colors">
            <User className="w-5 h-5" />
            <span>登录</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Navbar; 