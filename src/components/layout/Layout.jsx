import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import PageTransition from '../common/PageTransition';

const Layout = () => {
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleToggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col">
      {/* 顶部导航栏 */}
      <Navbar 
        sidebarCollapsed={sidebarCollapsed}
        onToggleSidebar={handleToggleSidebar}
      />

      {/* 主要内容区域 - 添加顶部边距 */}
      <div className="flex-1 flex relative mt-16">
        {/* 左侧导航栏 */}
        <div 
          className={`fixed top-16 left-0 h-[calc(100vh-4rem)] transition-all duration-300 z-40
            ${sidebarCollapsed ? 'w-16' : 'w-64'}`}
        >
          <Sidebar collapsed={sidebarCollapsed} />
        </div>

        {/* 内容区域 */}
        <div 
          className="flex-1 min-h-[calc(100vh-4rem)] transition-all duration-300 relative"
          style={{ 
            marginLeft: sidebarCollapsed ? '4rem' : '16rem'
          }}
        >
          <AnimatePresence mode="wait" initial={false}>
            <PageTransition key={location.pathname}>
              <div className="min-h-full w-full">
                <Outlet />
              </div>
            </PageTransition>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Layout; 