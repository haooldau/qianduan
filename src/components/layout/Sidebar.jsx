import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Map, Calendar, Users, Search, BarChart2, RefreshCw } from 'lucide-react';

const Sidebar = ({ collapsed }) => {
  const navItems = [
    { path: '/', icon: Home, label: '主页' },
    { path: '/performance-map', icon: Map, label: '演出分布' },
    { path: '/recent-performances', icon: Calendar, label: '近期演出' },
    { path: '/artists', icon: Users, label: '艺人列表' },
    { path: '/artist-check', icon: Search, label: '艺人查询' },
    { path: '/statistics', icon: BarChart2, label: '数据统计' },
    { path: '/update', icon: RefreshCw, label: '更新数据' },
  ];

  return (
    <div className={`h-full bg-black/40 backdrop-blur-sm border-r border-white/5 
      transition-all duration-300 flex flex-col ${collapsed ? 'w-16' : 'w-64'}`}>
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <nav className="py-4">
          {navItems.map(({ path, icon: Icon, label }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 transition-colors whitespace-nowrap
                ${isActive
                  ? 'bg-[#ff2d2d]/10 text-[#ff2d2d] border-r-2 border-[#ff2d2d]'
                  : 'text-white/60 hover:bg-white/5 hover:text-white'
                } ${collapsed ? 'justify-center' : ''}`
              }
              title={collapsed ? label : undefined}
            >
              <Icon className={`flex-shrink-0 ${collapsed ? 'w-6 h-6' : 'w-5 h-5'}`} />
              {!collapsed && <span className="truncate">{label}</span>}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className={`h-12 border-t border-white/5 bg-black/20 flex items-center justify-center flex-shrink-0
        ${collapsed ? 'px-2' : ''}`}>
        <div className="text-xs text-white/40">
          {collapsed ? '© 2024' : 'SparkleLive © 2024'}
        </div>
      </div>
    </div>
  );
};

export default Sidebar; 