import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { X, Calendar, MapPin, ArrowLeft } from 'lucide-react';
import PerformanceInfo from '../performances/PerformanceInfo';
import '../../styles/card.css';
import API_BASE_URL from '../../config/api';
import ChinaMap from './ChinaMap';
import PerformanceDetailCard from '../performances/PerformanceDetailCard';

const CHINA_MAP_API = '/data/china.json';

// 添加城市到省份的映射关系
const cityToProvince = {
  '北京': '北京',
  '上海': '上海',
  '天津': '天津',
  '重庆': '重庆',
  '广州': '广东',
  '深圳': '广东',
  '珠海': '广东',
  '佛山': '广东',
  '东莞': '广东',
  '杭州': '浙江',
  '宁波': '浙江',
  '温州': '浙江',
  '成都': '四川',
  '武汉': '湖北',
  '西安': '陕西',
  '南京': '江苏',
  '苏州': '江苏',
  '无锡': '江苏',
  '长沙': '湖南',
  '郑州': '河南',
  '青岛': '山东',
  '济南': '山东',
  '大连': '辽宁',
  '沈阳': '辽宁',
  '哈尔滨': '黑龙江',
  '长春': '吉林',
  '福州': '福建',
  '厦门': '福建',
  '合肥': '安徽',
  '南昌': '江西',
  '昆明': '云南',
  '贵阳': '贵州',
  '南宁': '广西',
  '海口': '海南',
  '石家庄': '河北',
  '太原': '山西',
  '呼和浩特': '内蒙古',
  '乌鲁木齐': '新疆',
  '拉萨': '西藏',
  '西宁': '青海',
  '兰州': '甘肃',
  '银川': '宁夏',
  '香港': '香港',
  '澳门': '澳门',
  '台北': '台湾'
};

const PerformanceMap = () => {
  const [mapData, setMapData] = useState(null);
  const [performanceData, setPerformanceData] = useState({});
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [artistPerformances, setArtistPerformances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cardPosition, setCardPosition] = useState({ x: 100, y: 100 });
  const [isFlipped, setIsFlipped] = useState(false);
  const isDragging = useRef(false);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const cardRef = useRef(null);
  const dragOffset = useRef({ x: 0, y: 0 });
  const [selectedPerformance, setSelectedPerformance] = useState(null);
  const [dragStartTime, setDragStartTime] = useState(0);
  const [hasMoved, setHasMoved] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // 获取地图数据
        const mapResponse = await fetch(CHINA_MAP_API);
        if (!mapResponse.ok) throw new Error('获取地图数据失败');
        const mapJson = await mapResponse.json();
        setMapData(mapJson);

        // 获取演出数据
        const response = await fetch(`${API_BASE_URL.MAIN_API}/api/performances`, {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('API Response:', data);
        
        if (data.success && Array.isArray(data.data)) {
          // 处理数据并按省份分组
          const dataByProvince = {};
          data.data.forEach(performance => {
            if (!performance.city) {
              console.warn('Performance missing city:', performance);
              return;
            }
            
            // 根据城市获取省份
            const city = performance.city.replace(/市|区|县/g, '').trim();
            const province = cityToProvince[city];
            
            if (!province) {
              console.warn(`Unknown city: ${city}`);
              return;
            }
            
            if (!dataByProvince[province]) {
              dataByProvince[province] = [];
            }
            
            dataByProvince[province].push({
              ...performance,
              province, // 添加省份信息
              date: performance.date ? new Date(performance.date) : null,
              created_at: performance.created_at ? new Date(performance.created_at) : null
            });
          });
          
          setPerformanceData(dataByProvince);
        } else {
          throw new Error('Invalid data format');
        }
      } catch (error) {
        console.error('获取数据失败:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleMapClick = (event) => {
    if (event.target.tagName === 'svg' || event.target.tagName === 'rect') {
      setSelectedArtist(null);
      setArtistPerformances([]);
    }
  };

  const handleProvinceClick = (feature) => {
    const provinceName = feature.properties.name
      .replace(/省|自治区|维吾尔|回族|壮族|特别行政区/g, '')
      .trim();
    
    if (isFlipped) {
      setSelectedArtist(null);
      setArtistPerformances([]);
      setIsFlipped(false);
    }
    
    setSelectedProvince({
      properties: feature.properties,
      performances: performanceData[provinceName] || []
    });
  };

  const handleDragStart = (e) => {
    // 检查点击的具体元素
    const target = e.target;
    
    // 如果点击的是按钮、图标或文本，不触发拖动
    if (
      target.tagName === 'BUTTON' || 
      target.closest('button') || 
      target.tagName === 'svg' || 
      target.tagName === 'path' ||
      target.tagName === 'SPAN' ||
      target.tagName === 'H3'
    ) {
      return;
    }

    // 确保只有点击拖动手柄区域的背景才能拖动
    const isDragHandle = target.closest('.drag-handle');
    if (!isDragHandle || !cardRef.current) return;

    e.preventDefault(); // 防止文本选择

    isDragging.current = true;
    setDragStartTime(Date.now());
    setHasMoved(false);

    // 记录初始位置
    dragStartPos.current = {
      x: cardPosition.x,
      y: cardPosition.y
    };
    
    // 记录鼠标初始位置
    dragOffset.current = {
      x: e.clientX - cardPosition.x,
      y: e.clientY - cardPosition.y
    };
    
    document.addEventListener('mousemove', handleDragMove);
    document.addEventListener('mouseup', handleDragEnd);
  };

  const handleDragMove = (e) => {
    if (!isDragging.current) return;
    
    setHasMoved(true);
    
    // 计算新位置
    const newX = e.clientX - dragOffset.current.x;
    const newY = e.clientY - dragOffset.current.y;
    
    // 限制在窗口范围内
    const boundedX = Math.max(0, Math.min(newX, window.innerWidth - 384));
    const boundedY = Math.max(0, Math.min(newY, window.innerHeight - 600));
    
    setCardPosition({ x: boundedX, y: boundedY });
  };

  const handleDragEnd = () => {
    const dragDuration = Date.now() - dragStartTime;
    
    // 如果是短时间的点击（小于200ms）且没有移动，则认为是点击而不是拖动
    if (dragDuration < 200 && !hasMoved) {
      isDragging.current = false;
      document.removeEventListener('mousemove', handleDragMove);
      document.removeEventListener('mouseup', handleDragEnd);
      return;
    }
    
    isDragging.current = false;
    setHasMoved(false);
    document.removeEventListener('mousemove', handleDragMove);
    document.removeEventListener('mouseup', handleDragEnd);
  };

  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleDragMove);
      document.removeEventListener('mouseup', handleDragEnd);
    };
  }, []);

  const handleArtistClick = (artist) => {
    setSelectedArtist(artist);
    const artistPerformances = Object.values(performanceData)
      .flat()
      .filter(perf => perf.artist === artist)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
    
    setArtistPerformances(artistPerformances);
  };

  const handleVenueClick = (performance) => {
    setSelectedPerformance(performance);
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
        <p className="mt-4 text-gray-400">正在加载演出数据...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6 max-w-md">
        <h3 className="text-red-500 font-semibold mb-2">数据加载失败</h3>
        <p className="text-gray-400">{error}</p>
        <div className="mt-4 flex gap-4">
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-red-500"
          >
            重试
          </button>
          <button 
            onClick={() => setError(null)}
            className="px-4 py-2 bg-gray-500/20 hover:bg-gray-500/30 rounded-lg text-gray-400"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );

  if (!mapData || !mapData.features) return null;

  return (
    <div className="relative w-full h-full bg-black overflow-hidden">
      {/* 背景装饰效果 */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,#1a1a1a,transparent_50%)]" />
      <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-red-500/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[800px] h-[800px] bg-red-500/3 rounded-full blur-[120px] pointer-events-none" />
      
      {/* 顶部固定区域 */}
      <div className="fixed top-20 left-[calc(4rem+24px)] z-50">
        <div className="bg-black/80 backdrop-blur-sm rounded-lg p-4 border border-white/10">
          <h2 className="text-2xl font-bold text-white">演出分布</h2>
          <p className="text-gray-400 mt-1">全国演出数据可视化地图</p>
        </div>
      </div>

      {/* 热力图图例 */}
      <div className="fixed right-8 top-[60%] z-50 bg-black/80 backdrop-blur-sm rounded-lg p-4 border border-white/10">
        <div className="text-white text-sm mb-2">演出热力</div>
        <div className="flex items-center gap-4">
          <div className="w-32 h-4 rounded-sm" style={{
            background: 'linear-gradient(to right, rgb(31, 41, 56), rgb(222, 56, 35))'
          }} />
          <div className="flex justify-between w-16 text-xs text-gray-400">
            <span>低</span>
            <span>高</span>
          </div>
        </div>
        <div className="mt-2 text-xs text-gray-500">
          基于演出场次统计
        </div>
      </div>

      {/* 地图容器 */}
      <div className="w-full h-full">
        {mapData && (
          <ChinaMap
            mapData={mapData}
            performanceData={performanceData}
            selectedProvince={selectedProvince}
            selectedArtist={selectedArtist}
            onProvinceClick={handleProvinceClick}
          />
        )}
      </div>

      {/* 其他内容 */}
      <div className="px-6 pb-6">
        {/* 可拖拽的省份信息卡片 */}
        {selectedProvince && (
          <div 
            ref={cardRef}
            className="fixed w-96 h-[600px] perspective-1000 z-50"
            style={{
              left: `${cardPosition.x}px`,
              top: `${cardPosition.y}px`,
              userSelect: 'none'
            }}
          >
            <div className={`relative w-full h-full duration-500 preserve-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
              {/* 正面 - 省份信息 */}
              <div className="absolute w-full h-full backface-hidden bg-black/90 backdrop-blur-md rounded-2xl shadow-2xl border border-white/10">
                {/* 标题栏 */}
                <div 
                  className="card-header sticky top-0 z-10 p-4 border-b border-white/10 flex justify-between items-center bg-black/50 drag-handle relative"
                  onMouseDown={handleDragStart}
                  style={{ cursor: 'move' }}
                >
                  {/* 添加一个透明的拖动区域 */}
                  <div className="absolute inset-0 drag-area" />
                  
                  <div className="relative z-10 flex items-center gap-2">
                    <h3 className="text-xl font-semibold text-white">
                      {selectedProvince.properties.name}演出信息
                      <span className="ml-2 text-sm font-normal text-gray-400">
                        (共{selectedProvince.performances.length}场演出)
                      </span>
                    </h3>
                  </div>
                  
                  <button
                    className="relative z-10 text-gray-400 hover:text-white focus:outline-none cursor-pointer"
                    onClick={() => setSelectedProvince(null)}
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* 内容区域 - 简化结构 */}
                <div className="overflow-y-auto h-[536px] custom-scrollbar" onClick={(e) => e.stopPropagation()}>
                  <div className="p-4">
                    <PerformanceInfo
                      performances={selectedProvince.performances}
                      onArtistClick={(artist) => {
                        handleArtistClick(artist);
                        setIsFlipped(true);
                      }}
                      onVenueClick={handleVenueClick}
                    />
                  </div>
                </div>
              </div>

              {/* 背面 - 艺人信息 */}
              <div className="absolute w-full h-full backface-hidden bg-black/90 backdrop-blur-md rounded-2xl shadow-2xl border border-white/10 rotate-y-180">
                {/* 标题栏 */}
                <div 
                  className="card-header sticky top-0 z-10 p-4 border-b border-white/10 flex justify-between items-center bg-black/50 drag-handle relative"
                  onMouseDown={handleDragStart}
                  style={{ cursor: 'move' }}
                >
                  {/* 添加一个透明的拖动区域 */}
                  <div className="absolute inset-0 drag-area" />
                  
                  <div className="relative z-10 flex items-center gap-2">
                    <button
                      className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-white/10"
                      onClick={() => {
                        setIsFlipped(false);
                        setSelectedArtist(null);
                      }}
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h3 className="text-xl font-semibold text-white">
                      {selectedArtist}的演出信息
                    </h3>
                  </div>
                </div>

                {/* 内容区域 - 简化结构 */}
                <div className="overflow-y-auto h-[536px] custom-scrollbar">
                  <div className="p-4 space-y-4">
                    {artistPerformances.map((performance, index) => (
                      <div key={index} className="bg-white/5 backdrop-blur-md rounded-lg p-4 border border-white/10">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-gray-300">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(performance.date).toLocaleDateString('zh-CN')}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-300">
                            <MapPin className="w-4 h-4" />
                            <span>
                              {performance.province} {performance.city}
                              {performance.venue && ` - ${performance.venue}`}
                            </span>
                          </div>
                          {performance.notes && (
                            <div className="text-sm text-gray-400 mt-2">
                              备注: {performance.notes}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 演出详情卡片 */}
      {selectedPerformance && (
        <PerformanceDetailCard
          performance={selectedPerformance}
          allPerformances={Object.values(performanceData).flat()}
          currentProvince={selectedProvince.properties.name}
          onClose={() => setSelectedPerformance(null)}
        />
      )}

      <style jsx>{`
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(255, 255, 255, 0.2);
          border-radius: 2px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: rgba(255, 255, 255, 0.3);
        }
      `}</style>
    </div>
  );
};

export default PerformanceMap; 