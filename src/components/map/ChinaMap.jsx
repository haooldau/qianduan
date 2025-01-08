import React, { useState, useRef, useEffect } from 'react';
import { ZoomIn, ZoomOut } from 'lucide-react';
import '../../styles/map.css';

const ChinaMap = ({ 
  mapData, 
  performanceData, 
  selectedProvince, 
  selectedArtist,
  onProvinceClick 
}) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const svgRef = useRef(null);

  // 缩放控制
  const handleZoom = (direction) => {
    setScale(prev => {
      const newScale = direction === 'in' ? prev * 1.2 : prev / 1.2;
      return Math.min(Math.max(newScale, 0.5), 3); // 限制缩放范围
    });
  };

  // 拖动控制
  const handleMouseDown = (e) => {
    if (e.button === 0) { // 只响应左键
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  // 辅助函数 - 计算边界
  const getBounds = (features) => {
    let bounds = {
      minX: Number.POSITIVE_INFINITY,
      minY: Number.POSITIVE_INFINITY,
      maxX: Number.NEGATIVE_INFINITY,
      maxY: Number.NEGATIVE_INFINITY
    };

    features.forEach(feature => {
      if (feature.geometry.type === 'MultiPolygon') {
        feature.geometry.coordinates.forEach(polygon => {
          polygon[0].forEach(coord => {
            bounds.minX = Math.min(bounds.minX, coord[0]);
            bounds.minY = Math.min(bounds.minY, coord[1]);
            bounds.maxX = Math.max(bounds.maxX, coord[0]);
            bounds.maxY = Math.max(bounds.maxY, coord[1]);
          });
        });
      } else if (feature.geometry.type === 'Polygon') {
        feature.geometry.coordinates[0].forEach(coord => {
          bounds.minX = Math.min(bounds.minX, coord[0]);
          bounds.minY = Math.min(bounds.minY, coord[1]);
          bounds.maxX = Math.max(bounds.maxX, coord[0]);
          bounds.maxY = Math.max(bounds.maxY, coord[1]);
        });
      }
    });

    return bounds;
  };

  // 辅助函数 - 投影坐标
  const projectPoint = (coord, bounds) => {
    const width = 800;
    const height = 600;
    const padding = 40;
    
    const scaleX = (width - padding * 2) / (bounds.maxX - bounds.minX);
    const scaleY = (height - padding * 2) / (bounds.maxY - bounds.minY);
    const scale = Math.min(scaleX, scaleY);

    const x = padding + (coord[0] - bounds.minX) * scale;
    const y = height - (padding + (coord[1] - bounds.minY) * scale);
    
    return [x, y];
  };

  // 辅助函数 - 生成SVG路径
  const generatePath = (geometry, bounds) => {
    try {
      let pathData = '';

      if (geometry.type === 'MultiPolygon') {
        geometry.coordinates.forEach(polygon => {
          pathData += polygon[0].map((coord, index) => {
            const [x, y] = projectPoint(coord, bounds);
            return `${index === 0 ? 'M' : 'L'}${x},${y}`;
          }).join(' ');
          pathData += 'Z ';
        });
      } else if (geometry.type === 'Polygon') {
        pathData = geometry.coordinates[0].map((coord, index) => {
          const [x, y] = projectPoint(coord, bounds);
          return `${index === 0 ? 'M' : 'L'}${x},${y}`;
        }).join(' ') + 'Z';
      }

      return pathData.trim();
    } catch (error) {
      console.error('生成路径错误:', error);
      return '';
    }
  };

  // 检查省份是否有选中艺人的演出
  const hasArtistPerformance = (provinceName) => {
    if (!selectedArtist) return false;
    return performanceData[provinceName]?.some(p => p.artist === selectedArtist);
  };

  // 修改热力值计算函数
  const calculateHeatColor = (performances = []) => {
    if (!performances.length) return '#1f2938';
    
    // 计算热力值 (0-1)
    const maxPerformances = 30; // 调整最大演出数量阈值
    const heatValue = Math.min(performances.length / maxPerformances, 1);
    
    // 生成热力颜色 (从深蓝到红色的渐变)
    const r = Math.round(31 + (191 * heatValue)); // 从 31 到 222
    const g = Math.round(41 + (15 * heatValue));  // 从 41 到 56
    const b = Math.round(56 - (21 * heatValue));  // 从 56 到 35
    
    return `rgb(${r}, ${g}, ${b})`;
  };

  const bounds = getBounds(mapData.features);

  return (
    <div className="relative w-full h-full">
      {/* 缩放控制按钮 */}
      <div className="fixed top-24 right-8 flex flex-col gap-2 z-50">
        <button
          onClick={() => handleZoom('in')}
          className="p-3 bg-black/80 backdrop-blur-sm rounded-lg text-white/80 hover:text-white 
            transition-colors border border-white/10 hover:bg-black/90"
        >
          <ZoomIn className="w-5 h-5" />
        </button>
        <button
          onClick={() => handleZoom('out')}
          className="p-3 bg-black/80 backdrop-blur-sm rounded-lg text-white/80 hover:text-white 
            transition-colors border border-white/10 hover:bg-black/90"
        >
          <ZoomOut className="w-5 h-5" />
        </button>
      </div>

      {/* 地图容器 */}
      <div
        className="w-full h-full overflow-hidden cursor-grab"
        onMouseDown={handleMouseDown}
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      >
        <svg
          ref={svgRef}
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transformOrigin: 'center',
            transition: isDragging ? 'none' : 'transform 0.3s ease'
          }}
          viewBox="0 0 800 600"
          className="map-container"
        >
          {mapData.features.map((feature, index) => {
            const provinceName = feature.properties.name
              .replace(/省|自治区|维吾尔|回族|壮族|特别行政区/g, '')
              .trim();
            
            const provincePerformances = performanceData[provinceName] || [];
            const isArtistProvince = hasArtistPerformance(provinceName);
            const isSelected = selectedProvince?.properties?.name === feature.properties.name;

            return (
              <path
                key={index}
                d={generatePath(feature.geometry, bounds)}
                className={`
                  province-path
                  ${isSelected ? 'selected' : ''}
                  ${provincePerformances.length ? 'has-performances' : ''}
                  ${isArtistProvince ? 'artist-performance' : ''}
                `}
                fill={
                  isSelected || isArtistProvince
                    ? '#bf3737'
                    : calculateHeatColor(provincePerformances)
                }
                onClick={() => onProvinceClick(feature)}
              >
                <title>
                  {feature.properties.name}
                  {provincePerformances.length ? ` (${provincePerformances.length}场演出)` : ''}
                </title>
              </path>
            );
          })}
        </svg>
      </div>
    </div>
  );
};

export default ChinaMap; 