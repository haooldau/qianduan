import React, { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const PageTransition = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const accumulatedDeltaRef = useRef(0);
  const lastWheelTime = useRef(0);
  
  const routes = ['/', '/performance-map', '/recent-performances', '/artists', '/artist-check', '/statistics', '/update'];
  
  const getCurrentIndex = () => {
    return routes.indexOf(location.pathname);
  };

  // 添加页面切换动画配置
  const pageVariants = {
    initial: (direction) => ({
      opacity: 0,
      y: direction > 0 ? 20 : -20
    }),
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: [0.25, 0.1, 0.25, 1]
      }
    },
    exit: (direction) => ({
      opacity: 0,
      y: direction > 0 ? -20 : 20,
      transition: {
        duration: 0.3,
        ease: [0.25, 0.1, 0.25, 1]
      }
    })
  };

  // 获取切换方向
  const getDirection = () => {
    const currentIndex = getCurrentIndex();
    const prevIndex = routes.indexOf(location.pathname);
    return currentIndex > prevIndex ? 1 : -1;
  };

  useEffect(() => {
    let lastScrollTime = 0;
    const scrollThreshold = 800; // 增加切换冷却时间
    let isScrolling = false;
    const requiredDelta = 250; // 需要累积的滚动距离
    const wheelTimeout = 250; // 滚动超时时间

    const handleWheel = (e) => {
      // 检查事件源是否来自可滚动容器
      const scrollableParent = e.target.closest('.custom-scrollbar');
      if (scrollableParent) {
        const { scrollTop, scrollHeight, clientHeight } = scrollableParent;
        
        // 如果内容可以滚动且不在边界，允许正常滚动
        if (scrollHeight > clientHeight) {
          // 在顶部但向下滚动，或在底部但向上滚动时，允许正常滚动
          if ((scrollTop === 0 && e.deltaY > 0) || 
              (scrollTop + clientHeight >= scrollHeight && e.deltaY < 0)) {
            return;
          }
          
          // 不在边界时，允许正常滚动
          if (scrollTop > 0 && scrollTop + clientHeight < scrollHeight) {
            return;
          }
        }

        // 在边界时切换页面
        if (scrollTop <= 0 && e.deltaY < 0) {
          // 向上切换
          handlePageTransition(e, -1);
        } else if (scrollTop + clientHeight >= scrollHeight && e.deltaY > 0) {
          // 向下切换
          handlePageTransition(e, 1);
        }
        return;
      }

      // 如果不是来自可滚动容器，处理普通的页面切换
      handlePageTransition(e, Math.sign(e.deltaY));
    };

    // 抽取页面切换逻辑到单独的函数
    const handlePageTransition = (e, direction) => {
      if (isScrolling) return;

      const currentTime = Date.now();
      if (currentTime - lastScrollTime < scrollThreshold) return;

      // 累积滚动距离
      const timeSinceLastWheel = currentTime - lastWheelTime.current;
      if (timeSinceLastWheel > wheelTimeout) {
        accumulatedDeltaRef.current = 0;
      }
      lastWheelTime.current = currentTime;
      
      // 使用阻尼系数
      accumulatedDeltaRef.current += Math.abs(e.deltaY) * 0.15;

      // 只有累积足够的滚动距离才触发切换
      if (accumulatedDeltaRef.current < requiredDelta) {
        return;
      }

      e.preventDefault();
      const currentIndex = getCurrentIndex();

      if (direction > 0 && currentIndex < routes.length - 1) {
        isScrolling = true;
        navigate(routes[currentIndex + 1]);
        lastScrollTime = currentTime;
        accumulatedDeltaRef.current = 0;
      } else if (direction < 0 && currentIndex > 0) {
        isScrolling = true;
        navigate(routes[currentIndex - 1]);
        lastScrollTime = currentTime;
        accumulatedDeltaRef.current = 0;
      }

      setTimeout(() => {
        isScrolling = false;
      }, 800);
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    
    return () => {
      window.removeEventListener('wheel', handleWheel);
    };
  }, [location.pathname, navigate]);

  return (
    <AnimatePresence mode="wait" custom={getDirection()}>
      <motion.div
        key={location.pathname}
        custom={getDirection()}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        style={{ 
          width: '100%', 
          height: '100%', 
          position: 'relative',
          willChange: 'transform, opacity'
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

export default PageTransition; 