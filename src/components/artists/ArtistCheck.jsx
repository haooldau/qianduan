import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Search, Calendar, MapPin, Plus, Minus, AlertCircle, Settings, X, Save } from 'lucide-react';
import API_BASE_URL from '../../config/api';
import * as echarts from 'echarts';
import CityPerformanceStats from '../statistics/CityPerformanceStats';
// 导入 xlsx
import * as XLSX from 'xlsx';

// 重要城市坐标数据
const cityCoordinates = {
  // 直辖市
  '北京': [116.405285, 39.904989],
  '上海': [121.472644, 31.231706],
  '天津': [117.190182, 39.125596],
  '重庆': [106.504962, 29.533155],
  
  // 省会城市
  '广州': [113.280637, 23.125178],
  '成都': [104.065735, 30.659462],
  '杭州': [120.153576, 30.287459],
  '武汉': [114.298572, 30.584355],
  '西安': [108.948024, 34.263161],
  '南京': [118.767413, 32.041544],
  '长沙': [112.982279, 28.19409],
  '沈阳': [123.429096, 41.796767],
  '哈尔滨': [126.642464, 45.756967],
  '济南': [117.000923, 36.675807],
  '郑州': [113.665412, 34.757975],
  '福州': [119.306239, 26.075302],
  '南昌': [115.892151, 28.676493],
  '合肥': [117.283042, 31.86119],
  '昆明': [102.712251, 25.040609],
  '南宁': [108.320004, 22.815478],
  '太原': [112.549248, 37.857014],
  '石家庄': [114.502461, 38.045474],
  '长春': [125.3245, 43.886841],
  '兰州': [103.823557, 36.058039],
  '西宁': [101.778916, 36.623178],
  '呼和浩特': [111.670801, 40.818311],
  '银川': [106.278179, 38.46637],
  '乌鲁木齐': [87.617733, 43.792818],
  
  // 经济重点城市
  '深圳': [114.085947, 22.547],
  '苏州': [120.619585, 31.299379],
  '青岛': [120.355173, 36.082982],
  '大连': [121.618622, 38.914589],
  '宁波': [121.549792, 29.868388],
  '厦门': [118.11022, 24.490474],
  '无锡': [120.301663, 31.574729],
  '佛山': [113.122717, 23.028762],
  '东莞': [113.746262, 23.046237],
  '烟台': [121.391382, 37.539297],
  '威海': [122.116394, 37.509691],
  
  // 特大城市
  '温州': [120.672111, 28.000575],
  '珠海': [113.552724, 22.255899],
  '中山': [113.382391, 22.521113],
  '泉州': [118.589421, 24.908853],
  '包头': [109.840405, 40.658168],
  '汕头': [116.708463, 23.37102],
  '贵阳': [106.713478, 26.578343],
  '海口': [110.33119, 20.031971],
  '唐山': [118.175393, 39.635113],
  '徐州': [117.184811, 34.261792],
  '洛阳': [112.434468, 34.663041],
  '秦皇岛': [119.586579, 39.942531],
  '株洲': [113.151737, 27.835806],
  '镇江': [119.452753, 32.204402],
  '常州': [119.946973, 31.772752],
  '盐城': [120.139998, 33.377631],
  '襄阳': [112.144146, 32.042426],
  '金华': [119.649506, 29.089524],
  '岳阳': [113.132855, 29.37029],
  '惠州': [114.416196, 23.111847],
  '澳门': [113.54909, 22.198951],
  '香港': [114.173355, 22.320048],
  '台北': [121.520076, 25.030724]
};

// 颜色配置
const colors = {
  pastPerformance: '#1e3799',   // 过去演出（深蓝）
  futurePerformance: '#c23616', // 未来演出（深红）
  targetCity: '#e84118',        // 目标城市（亮红）
  normalCity: '#666666',        // 普通城市（灰色）
  distanceCircle: 'rgba(232, 65, 24, 0.15)', // 距离圈
  cityLabel: '#ffffff',         // 城市标签
  provinceBorder: '#2f3640'     // 省份边界
};

// 省份数据
const provinceMap = {
  '北京': '北京市',
  '上海': '上海市',
  '天津': '天津市',
  '重庆': '重庆市',
  '广州': '广东省',
  '深圳': '广东省',
  '成都': '四川省',
  // ... 添加更多城市到省份的映射
};

// 修改提取城市数据的函数
const extractCityData = (features) => {
  const cityData = {};
  
  // 基础重要城市数据
  const baseImportantCities = {
    '北京': [116.405285, 39.904989],
    '上海': [121.472644, 31.231706],
    '广州': [113.280637, 23.125178],
    '深圳': [114.085947, 22.547],
    '��都': [104.065735, 30.659462],
    '杭州': [120.153576, 30.287459],
    '武汉': [114.298572, 30.584355],
    '西安': [108.948024, 34.263161],
    '南京': [118.767413, 32.041544],
    '长沙': [112.982279, 28.19409],
    '重庆': [106.504962, 29.533155],
    '天津': [117.190182, 39.125596],
    '青岛': [120.355173, 36.082982],
    '大连': [121.618622, 38.914589],
    '厦门': [118.11022, 24.490474],
    '沈阳': [123.429096, 41.796767],
    '济南': [117.000923, 36.675807],
    '哈尔滨': [126.642464, 45.756967],
    '长春': [125.3245, 43.886841],
    '南昌': [115.892151, 28.676493],
    '福州': [119.306239, 26.075302],
    '石家庄': [114.502461, 38.045474],
    '太原': [112.549248, 37.857014],
    '合肥': [117.283042, 31.86119],
    '郑州': [113.665412, 34.757975],
    '南宁': [108.320004, 22.815478],
    '贵阳': [106.713478, 26.578343],
    '昆明': [102.712251, 25.040609],
    '兰州': [103.823557, 36.058039],
    '西宁': [101.778916, 36.623178],
    '呼和浩特': [111.670801, 40.818311],
    '乌鲁木齐': [87.617733, 43.792818],
    '拉萨': [91.132212, 29.660361],
    '银川': [106.278179, 38.46637],
    '海口': [110.33119, 20.031971],
    '三亚': [109.508268, 18.247872],
    '香港': [114.173355, 22.320048],
    '澳门': [113.54909, 22.198951],
    '台北': [121.520076, 25.030724]
  };

  // 首先添加基础重要城市数据
  Object.assign(cityData, baseImportantCities);

  // 然后处理地图数据中的城市
  features.forEach(feature => {
    const { name, center } = feature.properties;
    if (center && Array.isArray(center) && center.length === 2) {
      // 移除行政区划后缀
      const cleanName = name.replace(
        /(省|自治区|维吾尔|回族|壮族|特别行政区|市|区|县|自治州)$/g, 
        ''
      );
      // 如果不是重要城市才添加，避免覆盖重要城市的坐标
      if (!baseImportantCities[cleanName]) {
        cityData[cleanName] = center;
      }
    }
  });

  return cityData;
};

// 修改重要城市列表，确保与基础数据一致
const importantCities = [
  '北京', '上海', '广州', '深圳', '成都', 
  '重庆', '天津', '南京', '杭州', '武汉',
  '西安', '长沙', '青岛', '大连', '厦门',
  '沈阳', '哈尔滨', '长春', '济南', '郑州',
  '福州', '合肥', '南昌', '昆明', '贵阳',
  '海口', '三亚', '兰州', '西宁', '银川',
  '呼和浩特', '乌鲁木齐', '拉萨', '南宁',
  '香港', '澳门', '台北'
];

const ArtistCheck = () => {
  const [selectedArtists, setSelectedArtists] = useState([]);
  const [inputArtist, setInputArtist] = useState('');
  const [selectedCity, setSelectedCity] = useState(null);
  const [cityInput, setCityInput] = useState('');
  const [cityStats, setCityStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [rememberSettings, setRememberSettings] = useState(false);
  const [totalPrice, setTotalPrice] = useState(0);
  
  // 地图相关状态和引用
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const [mapError, setMapError] = useState(null);
  const [mapData, setMapData] = useState(null);

  // 初始化
  useEffect(() => {
    const fetchMapData = async () => {
      try {
        // 使用本地市级地图数据文件
        const response = await fetch('/data/china_city.json');
        if (!response.ok) throw new Error('获取地图数据失败');
        const mapData = await response.json();
        setMapData(mapData);
        
        // 注册地图数据
        echarts.registerMap('china', mapData);
        
        // 初始化地图
        initMap();
      } catch (error) {
        console.error('地图数据加载失败:', error);
        setMapError('地图数据加载失败');
      }
    };

    fetchMapData();

    // 清理函数
    return () => {
      if (mapInstance.current) {
        mapInstance.current.dispose();
      }
    };
  }, []);

  // 添加记住设置状态
  const [targetCity, setTargetCity] = useState(() => {
    return rememberSettings ? localStorage.getItem('targetCity') || '' : '';
  });
  const [targetDate, setTargetDate] = useState(() => {
    return rememberSettings ? localStorage.getItem('targetDate') || '' : '';
  });
  const [artistInput, setArtistInput] = useState('');
  
  // 评分标准状态
  const [criteria, setCriteria] = useState(() => {
    const saved = localStorage.getItem('criteria');
    return saved ? JSON.parse(saved) : {
      distance1: 300,  // 第一个距离阈值（公里）
      distance2: 600,  // 第二个距离阈值（公里）
      time1: 3,       // 第一个时间阈值（月）
      time2: 6,       // 第二个时间阈值（月）
      time3: 12,      // 第三个时间阈值（月）
      timeRange: 6,   // 演出显示时间范围（月），默认改为6个月
      scores: {
        d1t1: 0, d1t2: 1, d1t3: 2, d1t4: 3,
        d2t1: 1, d2t2: 2, d2t3: 3, d2t4: 4,
        d3t1: 2, d3t2: 3, d3t3: 4, d3t4: 5
      }
    };
  });

  // 添加临时设置状态用于编辑
  const [tempCriteria, setTempCriteria] = useState(criteria);

  // 显示设置面板
  const [showSettings, setShowSettings] = useState(false);

  // 添加新的状态
  const [selectedArtistTimeline, setSelectedArtistTimeline] = useState(null);
  const [hoveredCity, setHoveredCity] = useState(null);
  const [cityPerformances, setCityPerformances] = useState(null);
  
  const [allCities, setAllCities] = useState({});
  const [filteredCities, setFilteredCities] = useState([]);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [cityPerformanceStats, setCityPerformanceStats] = useState(null);
  const [showCityStats, setShowCityStats] = useState(false);
  const [showPriceInput, setShowPriceInput] = useState(false);
  const [priceInput, setPriceInput] = useState('');
  const [currentArtist, setCurrentArtist] = useState(null);

  // 添加分数设置的描述映射
  const getScoreDescriptions = (criteria) => ({
    d1t1: `市内${criteria.time1}个月内`,
    d1t2: `市内${criteria.time1}-${criteria.time2}个月`,
    d1t3: `市内${criteria.time2}-${criteria.time3}个月`,
    d1t4: `市内${criteria.time3}个月外`,
    d2t1: `周边${criteria.time1}个月内`,
    d2t2: `周边${criteria.time1}-${criteria.time2}个月`,
    d2t3: `周边${criteria.time2}-${criteria.time3}个月`,
    d2t4: `周边${criteria.time3}个月外`,
    d3t1: `远区${criteria.time1}个月内`,
    d3t2: `远区${criteria.time1}-${criteria.time2}个月`,
    d3t3: `远区${criteria.time2}-${criteria.time3}个月`,
    d3t4: `远区${criteria.time3}个月外`
  });

  // 修改数据恢复函数
  const restoreArtistData = async (artists) => {
    if (!targetCity || !targetDate) {
      console.log('目标城市或日期未设置，暂不恢复评分');
      return setSelectedArtists(artists);
    }

    const updatedArtists = await Promise.all(artists.map(async (artist) => {
      try {
        // 获取演出数据
        const shows = artist.shows || await fetchArtistData(artist.name);
        
        // 获取报价和数据库状态
        const { price, inDatabase } = await fetchArtistPrice(artist.name);
        
        // 如果艺人在数据库中，重新计算评分
        const score = inDatabase ? calculateScore(shows) : '未在库中';
        
        return {
          ...artist,
          shows,
          price: price || artist.price, // 保留原有报价，如果获取失败
          inDatabase,
          score
        };
      } catch (error) {
        console.error(`恢复艺人 ${artist.name} 数据失败:`, error);
        return artist;
      }
    }));

    setSelectedArtists(updatedArtists);
    
    // 更新总报价
    const total = updatedArtists.reduce((sum, artist) => {
      const priceNum = parseInt(artist.price);
      return sum + (isNaN(priceNum) ? 0 : priceNum);
    }, 0);
    setTotalPrice(total);
  };

  // 添加数据恢复的 useEffect
  useEffect(() => {
    if (rememberSettings) {
      const saved = localStorage.getItem('selectedArtists');
      if (saved) {
        const savedArtists = JSON.parse(saved);
        if (savedArtists.length > 0) {
          restoreArtistData(savedArtists);
        }
      }
    }
  }, [rememberSettings]); // 只在 rememberSettings 改变时执行

  // 修改获取城市数据的 useEffect
  useEffect(() => {
    const fetchCityData = async () => {
      try {
        // 使用本地的 china_cities.json 文件
        const response = await fetch('/data/china_cities.json');
        const data = await response.json();
        
        // 提取所有城市数据
        const cities = extractCityData(data.features);
        setAllCities(cities);
        
        console.log('加载城市数据:', Object.keys(cities).length, '个城市');
      } catch (error) {
        console.error('加载城市数据失败:', error);
      }
    };
    
    fetchCityData();
  }, []);

  // 修改搜索逻辑，优化搜索体验
  const handleCityInput = (e) => {
    const value = e.target.value;
    setTargetCity(value);
    
    if (value.trim()) {
      const searchValue = value.trim().toLowerCase();
      const matched = Object.keys(allCities)
        .filter(city => {
          const cityName = city.toLowerCase();
          return cityName.includes(searchValue);
        })
        .sort((a, b) => {
          // 优先显示完全匹配的结果
          const aExact = a.toLowerCase() === searchValue;
          const bExact = b.toLowerCase() === searchValue;
          if (aExact && !bExact) return -1;
          if (!aExact && bExact) return 1;
          // 其次是开头匹配的结果
          const aStarts = a.toLowerCase().startsWith(searchValue);
          const bStarts = b.toLowerCase().startsWith(searchValue);
          if (aStarts && !bStarts) return -1;
          if (!aStarts && bStarts) return 1;
          // 最后按字母顺序排序
          return a.localeCompare(b);
        })
        .slice(0, 15);

      setFilteredCities(matched);
      setShowCityDropdown(true);
    } else {
      setFilteredCities([]);
      setShowCityDropdown(false);
    }
  };

  // 修改计算城市统计的函数
  const calculateCityStats = async (city) => {
    if (!city || !allCities[city]) return null;
    
    try {
      // 修改 API 路径，使用正确的端点
      const response = await axios.get(`${API_BASE_URL.MAIN_API}/api/performances/shows`, {
        params: {
          city: city,
          distance: criteria.distance2,
          limit: 100
        }
      });
      
      // 检查响应数据
      if (response.data.success && Array.isArray(response.data.data)) {
        const performances = response.data.data;
        const now = new Date();
        
        // 按距离分组统计
        const stats = {
          inCity: { total: 0, upcoming: 0, performances: [] },
          nearby: { total: 0, upcoming: 0, performances: [] },
          wider: { total: 0, upcoming: 0, performances: [] }
        };

        // 处理每个演出
        performances.forEach(perf => {
          if (!perf.city) return;
          
          const distance = calculateDistance(city, perf.city);
          const isUpcoming = new Date(perf.date) > now;
          const perfData = {
            ...perf,
            distance: distance || 0,
            isUpcoming
          };

          // 根据距离分类演出
          if (perf.city === city) {
            stats.inCity.total++;
            if (isUpcoming) stats.inCity.upcoming++;
            stats.inCity.performances.push(perfData);
          } else if (distance && distance <= criteria.distance1) {
            stats.nearby.total++;
            if (isUpcoming) stats.nearby.upcoming++;
            stats.nearby.performances.push(perfData);
          } else if (distance && distance <= criteria.distance2) {
            stats.wider.total++;
            if (isUpcoming) stats.wider.upcoming++;
            stats.wider.performances.push(perfData);
          }
        });

        // 对每个分类中的演出按日期排序
        ['inCity', 'nearby', 'wider'].forEach(category => {
          stats[category].performances.sort((a, b) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            return dateB - dateA; // 按日期降序排序（最新的在前）
          });
        });

        console.log(`${city} 城市统计数据:`, stats);
        return stats;
      } else {
        console.warn('API返回的数据格式不正确:', response.data);
        return {
          inCity: { total: 0, upcoming: 0, performances: [] },
          nearby: { total: 0, upcoming: 0, performances: [] },
          wider: { total: 0, upcoming: 0, performances: [] }
        };
      }
    } catch (error) {
      console.error('获取城市演出统计失败:', error);
      console.error('错误详情:', error.response?.data || error.message);
      return {
        inCity: { total: 0, upcoming: 0, performances: [] },
        nearby: { total: 0, upcoming: 0, performances: [] },
        wider: { total: 0, upcoming: 0, performances: [] }
      };
    }
  };

  // 修改选择城市的函数，添加加载状态
  const selectCity = async (city) => {
    try {
      setTargetCity(city);
      setShowCityDropdown(false);
      
      // 计算城市统计
      const stats = await calculateCityStats(city);
      if (stats) {
        setCityPerformanceStats(stats);
        console.log(`已更新 ${city} 的演出统计数据`);
      } else {
        console.log(`${city} 暂无演出数据`);
        // 设置空的统计数据
        setCityPerformanceStats({
          inCity: { total: 0, upcoming: 0, performances: [] },
          nearby: { total: 0, upcoming: 0, performances: [] },
          wider: { total: 0, upcoming: 0, performances: [] }
        });
      }
      
      // 更新地图视图
      if (mapInstance && allCities[city]) {
        const coords = allCities[city];
        mapInstance.setOption({
          geo: {
            center: coords,
            zoom: 5
          }
        });
      }
    } catch (error) {
      console.error('选择城市失败:', error);
    }
  };

  // 修改获取艺人数据的函数
  const fetchArtistData = async (artistName) => {
    try {
      console.log('正在获取艺人数据:', artistName);
      // 修改 API 路径，确保使用正确的端点
      const response = await axios.get(`${API_BASE_URL.MAIN_API}/api/performances/shows`, {
        params: {
          artist: encodeURIComponent(artistName),
          limit: 100,
          sort: 'date',
          order: 'DESC'
        }
      });
      
      console.log('API响应:', response.data);
      
      if (response.data.success && Array.isArray(response.data.data)) {
        const shows = response.data.data;
        console.log('获取到的演出数据:', shows);
        return shows;
      }
      console.warn('API返回的数据格式不正确:', response.data);
      return [];
    } catch (error) {
      console.error('获取艺人数据失败:', error);
      return [];
    }
  };

  // 修改时线数据处理函数
  const getTimelineData = (shows, artistName) => {
    if (!shows || !Array.isArray(shows)) {
      console.log('无效的演出数据:', shows);
      return [];
    }

    console.log('原始演出数据:', shows);

    const now = new Date();
    const oneYearAgo = new Date(now);
    oneYearAgo.setFullYear(now.getFullYear() - 1);
    
    const oneYearLater = new Date(now);
    oneYearLater.setFullYear(now.getFullYear() + 1);
    
    console.log('时间范围:', { 
      oneYearAgo: oneYearAgo.toISOString(), 
      oneYearLater: oneYearLater.toISOString() 
    });

    const filteredShows = shows
      .filter(show => {
        const showDate = new Date(show.date);
        const isValidDate = !isNaN(showDate) && showDate >= oneYearAgo && showDate <= oneYearLater;
        console.log('过滤演出:', { 
          showName: show.name,
          date: show.date, 
          showDate: showDate.toISOString(), 
          isValid: isValidDate 
        });
        return isValidDate;
      })
      .map(show => ({
        ...show,
        date: new Date(show.date),
        type: show.tag || '演出',
        city: show.city || '',
        venue: show.venue || '',
        lineup: show.lineup || ''
      }))
      .sort((a, b) => a.date - b.date);

    console.log('过滤后的演出数据:', filteredShows);
    return filteredShows;
  };

  // 监听记住设置的变化
  useEffect(() => {
    localStorage.setItem('rememberSettings', rememberSettings);
    if (!rememberSettings) {
      // 如果关闭记住设置，清除所有保存的数据
      localStorage.removeItem('targetCity');
      localStorage.removeItem('targetDate');
      localStorage.removeItem('selectedArtists');
    }
  }, [rememberSettings]);

  // 保存数据到 localStorage
  useEffect(() => {
    if (rememberSettings) {
      localStorage.setItem('targetCity', targetCity);
      localStorage.setItem('targetDate', targetDate);
      // 只保存必要的数据到 localStorage
      const artistsToSave = selectedArtists.map(artist => ({
        name: artist.name,
        shows: artist.shows,
        price: artist.price,
        inDatabase: artist.inDatabase,
        score: artist.score
      }));
      localStorage.setItem('selectedArtists', JSON.stringify(artistsToSave));
    }
  }, [rememberSettings, targetCity, targetDate, selectedArtists]);

  // 监听日期和城市变化，更新评分
  useEffect(() => {
    if (targetCity && targetDate) {
      const updateScores = async () => {
        const updatedArtists = await Promise.all(
          selectedArtists.map(async (artist) => {
            const score = calculateScore(artist.shows);
            return { ...artist, score };
          })
        );
        setSelectedArtists(updatedArtists);
      };
      updateScores();
    }
  }, [targetCity, targetDate]);

  // 初始化地图
  useEffect(() => {
    const initMap = () => {
      if (!mapRef.current) return;

      // 初始化地图实例
      const chart = echarts.init(mapRef.current);
      mapInstance.current = chart;

      // 基础配置
      const option = {
        backgroundColor: 'transparent',
        tooltip: {
          trigger: 'item',
          formatter: '{b}'
        },
        geo: {
          map: 'china',
          roam: true,
          zoom: 1.2,
          center: [105, 35],
          scaleLimit: {
            min: 1,
            max: 3
          },
          itemStyle: {
            areaColor: '#1a1a1a',
            borderColor: '#333',
            borderWidth: 1
          },
          emphasis: {
            itemStyle: {
              areaColor: '#252525',
              borderColor: '#444',
              borderWidth: 1
            }
          },
          select: {
            itemStyle: {
              areaColor: '#2a2a2a'
            }
          }
        },
        series: []
      };

      chart.setOption(option);
      
      // 监听地图点击事件
      chart.on('click', (params) => {
        if (params.componentType === 'geo') {
          const cityName = params.name;
          if (cityCoordinates[cityName]) {
            selectCity(cityName);
          }
        }
      });

      // 自适应大小
      window.addEventListener('resize', () => {
        chart.resize();
      });
    };

    initMap();

    // 清理函数
    return () => {
      if (mapInstance) {
        console.log('清理地图实例');
        mapInstance.dispose();
      }
    };
  }, []);

  // 计算两城市之间的距离（使用球面距离公式）
  const calculateDistance = (city1, city2) => {
    const coords1 = allCities[city1];
    const coords2 = allCities[city2];
    
    if (!coords1 || !coords2) return null;

    const [lon1, lat1] = coords1;
    const [lon2, lat2] = coords2;
    
    const R = 6371; // 地球半径（公里）
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return Math.round(R * c);
  };

  // 获取演出时间段的颜色
  const getTimeColor = (date) => {
    const monthsDiff = Math.abs(
      (new Date().getFullYear() - new Date(date).getFullYear()) * 12 +
      (new Date().getMonth() - new Date(date).getMonth())
    );
    
    if (monthsDiff <= 3) return timeColors.recent;
    if (monthsDiff <= 6) return timeColors.medium;
    if (monthsDiff <= 12) return timeColors.old;
    return timeColors.inactive;
  };

  // 获取地图数据
  useEffect(() => {
    const fetchMapData = async () => {
      try {
        // 使用本地地图数据文件
        const response = await fetch('/data/china.json');
        if (!response.ok) throw new Error('获取地图数据失败');
        const mapData = await response.json();
        
        // 注册地图数据
        echarts.registerMap('china', mapData);
        
        // 初始化地图
        initMap();
      } catch (error) {
        console.error('地图数据加载失败:', error);
        setError('地图数据加载失败');
      }
    };

    fetchMapData();

    // 清理函数
    return () => {
      if (mapInstance.current) {
        mapInstance.current.dispose();
      }
    };
  }, []);

  // 修改地图数据更新的 useEffect
  useEffect(() => {
    if (!mapInstance || !mapData || !selectedArtists.length || !allCities || !targetDate) return;

    try {
      const performanceCities = new Map();
      const performanceProvinces = new Set();
      const now = new Date();
      
      // 使用计划时间作为中心点
      const planDate = new Date(targetDate);
      const timeRangeMs = criteria.timeRange * 30 * 24 * 60 * 60 * 1000; // 转换为毫秒
      const minDate = new Date(planDate.getTime() - timeRangeMs);
      const maxDate = new Date(planDate.getTime() + timeRangeMs);

      console.log('时间范围:', {
        planDate: planDate.toISOString(),
        minDate: minDate.toISOString(),
        maxDate: maxDate.toISOString(),
        timeRange: criteria.timeRange
      });

      // 收集所有演出信息，添加时间过滤
      selectedArtists.forEach(artist => {
        artist.shows.forEach(show => {
          const showDate = new Date(show.date);
          // 只处理在计划时间范围内的演出
          if (show.city && showDate >= minDate && showDate <= maxDate) {
            const performanceInfo = {
              date: showDate,
              isFuture: showDate > now,
              artist: artist.name
            };
            
            performanceCities.set(show.city, performanceInfo);
            
            // 添加省份
            const province = provinceMap[show.city];
            if (province) {
              performanceProvinces.add(province);
            }
          }
        });
      });

      // 设置地图配置
      const option = {
        backgroundColor: '#0A0A0A',
        geo: {
          map: 'china',
          roam: true,
          label: {
            show: false
          },
          itemStyle: {
            areaColor: '#1a1a1a',
            borderColor: colors.provinceBorder,
            borderWidth: 1
          },
          emphasis: {
            itemStyle: {
              areaColor: '#252525'
            }
          }
        },
        tooltip: {
          trigger: 'item',
          formatter: (params) => {
            if (params.componentSubType === 'scatter') {
              const cityName = params.name;
              const performanceInfo = performanceCities.get(cityName);
              const distance = targetCity ? calculateDistance(targetCity, cityName) : null;
              
              // 获取该城市的所有演出信息
              const cityShows = selectedArtists.reduce((shows, artist) => {
                const artistShows = artist.shows.filter(show => show.city === cityName);
                return [...shows, ...artistShows.map(show => ({...show, artist: artist.name}))];
              }, []);

              let tooltip = `<div class="p-2">`;
              tooltip += `<div class="text-lg font-bold mb-2">${cityName}</div>`;

              if (cityShows.length > 0) {
                // 按艺人分组显示演出
                const showsByArtist = cityShows.reduce((groups, show) => {
                  if (!groups[show.artist]) groups[show.artist] = [];
                  groups[show.artist].push(show);
                  return groups;
                }, {});

                Object.entries(showsByArtist).forEach(([artist, shows]) => {
                  tooltip += `<div class="mb-2">`;
                  tooltip += `<div class="text-[#ff2d2d] font-medium">${artist}</div>`;
                  shows.forEach(show => {
                    tooltip += `<div class="text-white/80 text-sm mt-1">`;
                    tooltip += `${new Date(show.date).toLocaleDateString('zh-CN')}`;
                    if (show.venue) {
                      tooltip += ` · ${show.venue}`;
                    }
                    tooltip += `</div>`;
                  });
                  tooltip += `</div>`;
                });
              } else {
                tooltip += `<div class="text-gray-400">暂无演出记录</div>`;
              }

              if (distance) {
                tooltip += `<div class="mt-2 text-sm text-gray-400">距离目标城市: ${distance}km</div>`;
              }

              tooltip += `</div>`;
              return tooltip;
            }
            return '';
          },
          backgroundColor: 'rgba(0,0,0,0.85)',
          borderWidth: 0,
          shadowBlur: 10,
          shadowColor: 'rgba(0,0,0,0.5)',
          shadowOffsetX: 0,
          shadowOffsetY: 0,
          padding: [10, 15],
          textStyle: {
            color: '#fff',
            fontSize: 12
          },
          extraCssText: 'border-radius: 8px; backdrop-filter: blur(4px);'
        },
        series: [
          // 省份高亮
          {
            type: 'map',
            map: 'china',
            geoIndex: 0,
            data: Array.from(performanceProvinces).map(province => ({
              name: province,
              value: 1,
              itemStyle: {
                areaColor: colors.pastPerformance,
                opacity: 0.3
              }
            }))
          },
          // 距离圈
          ...(targetCity && allCities[targetCity] ? [
            {
              type: 'custom',
              coordinateSystem: 'geo',
              renderItem: (params, api) => {
                const coords = allCities[targetCity];
                const point = api.coord(coords);
                
                return {
                  type: 'circle',
                  shape: {
                    cx: point[0],
                    cy: point[1],
                    // 使用实际的距离阈值来计算圆圈大小
                    r: api.size([1, 1])[0] * criteria.distance1 / 100
                  },
                  style: {
                    stroke: colors.distanceCircle,
                    fill: colors.distanceCircle,
                    lineWidth: 1,
                    opacity: 0.2
                  }
                };
              },
              data: [0]
            },
            {
              type: 'custom',
              coordinateSystem: 'geo',
              renderItem: (params, api) => {
                const coords = allCities[targetCity];
                const point = api.coord(coords);
                
                return {
                  type: 'circle',
                  shape: {
                    cx: point[0],
                    cy: point[1],
                    // 使用第二个距离阈值
                    r: api.size([1, 1])[0] * criteria.distance2 / 100
                  },
                  style: {
                    stroke: colors.distanceCircle,
                    fill: colors.distanceCircle,
                    lineWidth: 1,
                    opacity: 0.15
                  }
                };
              },
              data: [0]
            }
          ] : []),
          // 城市标记（只显示在时间范围内的城市）
          {
            type: 'scatter',
            coordinateSystem: 'geo',
            data: Object.entries(allCities)
              .filter(([name]) => {
                const performanceInfo = performanceCities.get(name);
                const isImportant = importantCities.includes(name);
                const isSelected = name === targetCity;
                return isImportant || isSelected || performanceInfo;
              })
              .map(([name, coords]) => {
                const performanceInfo = performanceCities.get(name);
                const isSelected = name === targetCity;
                
                return {
                  name,
                  value: [...coords, 1],
                  itemStyle: {
                    color: performanceInfo
                      ? (performanceInfo.isFuture ? colors.futurePerformance : colors.pastPerformance)
                      : isSelected
                        ? colors.targetCity
                        : colors.normalCity
                  },
                  label: {
                    show: true,
                    position: 'right',
                    formatter: name,
                    fontSize: isSelected ? 10 : 8,
                    color: isSelected 
                      ? colors.targetCity 
                      : performanceInfo
                        ? (performanceInfo.isFuture ? colors.futurePerformance : colors.pastPerformance)
                        : colors.cityLabel
                  },
                  symbolSize: isSelected ? 8 : (performanceInfo ? 6 : 4)
                };
              })
          },
          // 连线动
          {
            type: 'lines',
            coordinateSystem: 'geo',
            data: targetCity ? Array.from(performanceCities.entries())
              .filter(([cityName]) => {
                return cityName !== targetCity && 
                       allCities[cityName] && 
                       allCities[targetCity];
              })
              .map(([cityName, info]) => ({
                coords: [
                  allCities[cityName],
                  allCities[targetCity]
                ],
                lineStyle: {
                  color: info.isFuture ? colors.futurePerformance : colors.pastPerformance,
                  width: 1,
                  opacity: 0.3,
                  curveness: 0.2
                }
              })) : [],
            effect: {
              show: true,
              period: 4,
              trailLength: 0.1,
              symbol: 'arrow',
              symbolSize: 4,
              color: colors.futurePerformance,
              constantSpeed: 50 // 添加固定速度
            },
            lineStyle: {
              width: 1,
              opacity: 0.3,
              curveness: 0.2
            },
            zlevel: 2,
            // 添加动画配置
            animation: true,
            animationDuration: 1000,
            animationEasing: 'cubicInOut'
          }
        ]
      };

      mapInstance.current.setOption(option, {
        replaceMerge: ['series'],
        transition: ['all'],
        animationDurationUpdate: 1000,
        animationEasingUpdate: 'cubicInOut'
      });

    } catch (error) {
      console.error('更新地图数据失败:', error);
      setMapError(error.message);
    }
  }, [mapInstance, mapData, selectedArtists, allCities, targetCity, criteria.timeRange, targetDate]);

  // 在窗口大小改变时调整图大小
  useEffect(() => {
    const handleResize = () => {
      if (mapInstance) {
        mapInstance.resize();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [mapInstance]);

  // 获取艺人报价
  const fetchArtistPrice = async (artistName) => {
    try {
      const response = await axios.get(`${API_BASE_URL.MAIN_API}/api/art/${encodeURIComponent(artistName)}`);
      
      if (response.data.success) {
        return {
          price: response.data.num,
          inDatabase: response.data.inDatabase
        };
      } else {
        return {
          price: '暂无报价',
          inDatabase: false
        };
      }
    } catch (error) {
      console.error('获取艺人报价失败:', error);
      return {
        price: '暂无报价',
        inDatabase: false
      };
    }
  };

  // 计算艺人得分
  const calculateScore = (shows) => {
    if (!shows || shows.length === 0) return 5; // 如果没有演出记录，返回最高分

    let minScore = 5;
    const targetDateObj = new Date(targetDate);

    shows.forEach(show => {
      const showDate = new Date(show.date);
      const monthsDiff = Math.abs(
        (targetDateObj.getFullYear() - showDate.getFullYear()) * 12 +
        (targetDateObj.getMonth() - showDate.getMonth())
      );
      
      const distance = calculateDistance(targetCity, show.city);
      
      let score = 5;
      
      if (distance <= criteria.distance1) {
        if (monthsDiff <= criteria.time1) score = criteria.scores.d1t1;
        else if (monthsDiff <= criteria.time2) score = criteria.scores.d1t2;
        else if (monthsDiff <= criteria.time3) score = criteria.scores.d1t3;
        else score = criteria.scores.d1t4;
      } else if (distance <= criteria.distance2) {
        if (monthsDiff <= criteria.time1) score = criteria.scores.d2t1;
        else if (monthsDiff <= criteria.time2) score = criteria.scores.d2t2;
        else if (monthsDiff <= criteria.time3) score = criteria.scores.d2t3;
        else score = criteria.scores.d2t4;
      } else {
        if (monthsDiff <= criteria.time1) score = criteria.scores.d3t1;
        else if (monthsDiff <= criteria.time2) score = criteria.scores.d3t2;
        else if (monthsDiff <= criteria.time3) score = criteria.scores.d3t3;
        else score = criteria.scores.d3t4;
      }

      if (score < minScore) minScore = score;
    });

    return minScore;
  };

  // 添加设置报���的函数
  const setArtistPrice = async (artist, price) => {
    try {
      const response = await axios.post(`${API_BASE_URL.MAIN_API}/api/art/price`, {
        artist,
        price
      });
      
      if (response.data.success) {
        // 更新艺人列表中的报价
        setSelectedArtists(prev => prev.map(a => 
          a.name === artist 
            ? { ...a, price, inDatabase: true }
            : a
        ));
        return true;
      }
      return false;
    } catch (error) {
      console.error('设置报价失败:', error);
      return false;
    }
  };

  // 修改添加艺人的函数
  const addArtist = async () => {
    if (!artistInput.trim() || !targetCity || !targetDate) return;

    try {
      const artistName = artistInput.trim();
      const shows = await fetchArtistData(artistName);
      const { price, inDatabase } = await fetchArtistPrice(artistName);
      
      const artistData = {
        name: artistName,
        score: inDatabase ? calculateScore(shows) : '未在库中',
        shows: shows,
        price: price,
        inDatabase: inDatabase
      };

      setSelectedArtists(prev => {
        const newArtists = [...prev, artistData];
        const total = newArtists.reduce((sum, artist) => {
          const priceNum = parseInt(artist.price);
          return sum + (isNaN(priceNum) ? 0 : priceNum);
        }, 0);
        setTotalPrice(total);
        return newArtists;
      });
      
      setArtistInput('');
    } catch (error) {
      console.error('添加艺人失败:', error);
    }
  };

  // 移除艺人
  const removeArtist = (artistName) => {
    setSelectedArtists(prev => {
      const newArtists = prev.filter(artist => artist.name !== artistName);
      
      // 更新总报价
      const total = newArtists.reduce((sum, artist) => {
        const priceNum = parseInt(artist.price);
        return sum + (isNaN(priceNum) ? 0 : priceNum);
      }, 0);
      setTotalPrice(total);
      
      return newArtists;
    });
  };

  // 获取评分标识颜色
  const getScoreColor = (score) => {
    if (score <= 1) return 'text-red-500';
    if (score <= 3) return 'text-yellow-500';
    return 'text-green-500';
  };

  // 取评分描述
  const getScoreDescription = (score) => {
    if (score <= 1) return '不推荐';
    if (score <= 3) return '需谨慎';
    return '值得考虑';
  };

  // ���改时间线点击处理函数
  const handleTimelineClick = async (artist) => {
    console.log('点击艺人时间线:', artist);
    
    // 重新获取最新的演出数据
    const shows = await fetchArtistData(artist.name);
    console.log('获取到的最新演出数据:', shows);
    
    // 即使没有演出数据也显示弹窗，但显示"暂无演出数"
    setSelectedArtistTimeline({
      ...artist,
      shows: shows || [] // 保 shows 是数组
    });
  };

  // 保存设置
  const saveCriteria = () => {
    setCriteria(tempCriteria);
    localStorage.setItem('criteria', JSON.stringify(tempCriteria));
    // 立即重新计算所有艺人的评分
    setSelectedArtists(prev => prev.map(artist => ({
      ...artist,
      score: artist.inDatabase ? calculateScore(artist.shows) : '未在库中'
    })));
    setShowSettings(false);
  };

  // 还原默认设置
  const restoreCriteria = () => {
    const defaultCriteria = {
      distance1: 300,
      distance2: 600,
      time1: 3,
      time2: 6,
      time3: 12,
      timeRange: 72,
      scores: {
        d1t1: 0, d1t2: 1, d1t3: 2, d1t4: 3,
        d2t1: 1, d2t2: 2, d2t3: 3, d2t4: 4,
        d3t1: 2, d3t2: 3, d3t3: 4, d3t4: 5
      }
    };
    setTempCriteria(defaultCriteria);
    setCriteria(defaultCriteria);
    localStorage.setItem('criteria', JSON.stringify(defaultCriteria));
    // 立即重新计算所有艺人的评分
    setSelectedArtists(prev => prev.map(artist => ({
      ...artist,
      score: artist.inDatabase ? calculateScore(artist.shows) : '未在库中'
    })));
  };

  // 添加导出函数
  const exportToExcel = () => {
    // 创建工作簿
    const wb = XLSX.utils.book_new();
    
    // 准备数据
    const data = [
      ['艺人名单报价表'], // 标题行
      [], // 空行
      ['目标城市', targetCity],
      ['计划时间', targetDate],
      [], // 空���
      ['艺人', '评分', '报价'], // 表头
      ...selectedArtists.map(artist => [
        artist.name,
        artist.inDatabase ? `${artist.score} - ${getScoreDescription(artist.score)}` : '未在库中',
        artist.price
      ]),
      [], // 空行
      ['总报价', totalPrice.toLocaleString()]
    ];

    // 创建工作表
    const ws = XLSX.utils.aoa_to_sheet(data);

    // 设���单元格样式
    const range = XLSX.utils.decode_range(ws['!ref']);
    
    // 设置列宽
    ws['!cols'] = [
      { wch: 20 }, // 第一列宽度
      { wch: 30 }, // 第二列宽度
      { wch: 15 }  // 第三列宽度
    ];

    // 合并标题单元格
    ws['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 2 } } // 合并第一行的三列
    ];

    // 将工作表添加到工作簿
    XLSX.utils.book_append_sheet(wb, ws, '艺人报价');

    // 生成文件名
    const fileName = `艺人报价表_${targetCity}_${targetDate}.xlsx`;

    // 导出文件
    XLSX.writeFile(wb, fileName);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-medium mb-2">
              艺人市场评估 <span className="text-[#ff2d2d] font-normal">Market Assessment</span>
            </h1>
            <p className="text-gray-500">评估艺人在目标城市的市场价值和新鲜度</p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setRememberSettings(!rememberSettings)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                rememberSettings 
                  ? 'bg-[#ff2d2d]/10 text-[#ff2d2d] border border-[#ff2d2d]/20' 
                  : 'bg-black/20 text-gray-400 border border-gray-800'
              }`}
            >
              <Save className="w-4 h-4" />
              {rememberSettings ? '已开启记住设置' : '记住设置'}
            </button>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 text-gray-400 hover:text-white transition-colors"
            >
              <Settings className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-8">
          {/* 左侧面板 */}
          <div className="col-span-1 space-y-6">
            {/* 基本信息输入 */}
            <div className="bg-[#111111] rounded-xl p-6 border border-gray-800">
              <h3 className="text-lg font-medium mb-4">基本信息</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">目标城市</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={targetCity}
                      onChange={handleCityInput}
                      onFocus={() => targetCity.trim() && setShowCityDropdown(true)}
                      className="w-full bg-black border border-gray-800 rounded-lg px-4 py-2 focus:outline-none focus:border-[#ff2d2d]"
                      placeholder="输入城市名称"
                    />
                    
                    {/* 城市搜索下拉框 */}
                    {showCityDropdown && filteredCities.length > 0 && (
                      <div className="absolute z-50 w-full mt-1 bg-black/90 backdrop-blur-md border border-gray-800 rounded-lg shadow-lg max-h-60 overflow-y-auto custom-scrollbar">
                        {filteredCities.map((city) => (
                          <div
                            key={city}
                            className="px-4 py-2 hover:bg-[#ff2d2d]/10 cursor-pointer text-white/80 hover:text-white transition-colors flex items-center justify-between"
                            onClick={() => selectCity(city)}
                          >
                            <span>{city}</span>
                            {allCities[city] && (
                              <span className="text-xs text-gray-500">
                                {allCities[city][0].toFixed(2)}, {allCities[city][1].toFixed(2)}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* 在这里添加城市演出统计信息 */}
                  {cityPerformanceStats && (
                    <div 
                      className="mt-2 text-sm text-gray-400 hover:text-[#ff2d2d] cursor-pointer transition-colors"
                      onClick={() => setShowCityStats(true)}
                    >
                      该城市共有 {cityPerformanceStats.inCity.total + cityPerformanceStats.nearby.total + cityPerformanceStats.wider.total} 场演出
                      {cityPerformanceStats.inCity.upcoming + cityPerformanceStats.nearby.upcoming + cityPerformanceStats.wider.upcoming > 0 && 
                        `，其中 ${cityPerformanceStats.inCity.upcoming + cityPerformanceStats.nearby.upcoming + cityPerformanceStats.wider.upcoming} 场即将举行`
                      }，点击查看详情
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">计划时间</label>
                  <input
                    type="date"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="w-full bg-black border border-gray-800 rounded-lg px-4 py-2 focus:outline-none focus:border-[#ff2d2d]"
                  />
                </div>
              </div>
            </div>

            {/* 艺人添加 */}
            <div className="bg-[#111111] rounded-xl p-6 border border-gray-800">
              <h3 className="text-lg font-medium mb-4">添加艺人</h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={artistInput}
                  onChange={(e) => setArtistInput(e.target.value)}
                  className="flex-1 bg-black border border-gray-800 rounded-lg px-4 py-2 focus:outline-none focus:border-[#ff2d2d]"
                  placeholder="输入艺人名称"
                />
                <button
                  onClick={addArtist}
                  disabled={!artistInput.trim() || !targetCity || !targetDate}
                  className="px-4 py-2 bg-[#ff2d2d] text-white rounded-lg hover:bg-[#ff2d2d]/80 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  添加
                </button>
              </div>
            </div>

            {/* 备选艺人池 */}
            <div className="bg-[#111111] rounded-xl p-6 border border-gray-800">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <h3 className="text-lg font-medium">备选艺人</h3>
                  <button
                    onClick={exportToExcel}
                    disabled={selectedArtists.length === 0}
                    className="px-3 py-1 text-sm bg-[#ff2d2d] text-white rounded-lg hover:bg-[#ff2d2d]/80 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    导出表格
                  </button>
                </div>
                <div className="text-sm text-gray-400">
                  总报价：<span className="text-[#ff2d2d] font-medium">{totalPrice.toLocaleString()}</span>
                </div>
              </div>
              <div className="space-y-3">
                {selectedArtists.map((artist) => (
                  <div
                    key={artist.name}
                    className="bg-[#111111] rounded-xl p-6 border border-gray-800"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="text-lg font-medium">{artist.name}</h4>
                        <div className={`text-sm ${artist.inDatabase ? getScoreColor(artist.score) : 'text-gray-500'} mt-1`}>
                          {artist.inDatabase ? `评分: ${artist.score} - ${getScoreDescription(artist.score)}` : '未在库中'}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div 
                          className="text-gray-400 hover:text-white cursor-pointer"
                          onClick={() => {
                            setCurrentArtist(artist.name);
                            setPriceInput(artist.price === '暂无报价' ? '' : artist.price);
                            setShowPriceInput(true);
                          }}
                        >
                          报价: {artist.price}
                        </div>
                        <button
                          onClick={() => removeArtist(artist.name)}
                          className="text-gray-400 hover:text-white"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                    {/* ... 其他艺人信息显示 ... */}
                  </div>
                ))}
                {selectedArtists.length === 0 && (
                  <div className="text-center text-gray-500 py-4">
                    暂无备选艺人
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 右侧内容 */}
          <div className="col-span-2 space-y-6">
            {/* 地图组件 */}
            <div className="bg-[#111111] rounded-xl p-6 border border-gray-800">
              <h3 className="text-lg font-medium mb-4">演出分布地图</h3>
              <div 
                ref={mapRef} 
                style={{ width: '100%', height: '500px' }}
                className="rounded-lg overflow-hidden"
              />
              {mapError && (
                <div className="mt-4 text-red-500 text-sm">
                  地图加载错误: {mapError}
                </div>
              )}
            </div>

            {/* 评分详情 */}
            <div className="bg-[#111111] rounded-xl p-6 border border-gray-800">
              <h3 className="text-lg font-medium mb-4">评分详情</h3>
              {selectedArtists.map((artist) => (
                <div
                  key={artist.name}
                  className="mb-6 p-4 bg-black rounded-lg border border-gray-800"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="text-lg font-medium">{artist.name}</h4>
                      <div className={`text-sm ${artist.inDatabase ? getScoreColor(artist.score) : 'text-gray-500'} mt-1`}>
                        {artist.inDatabase ? `评分: ${artist.score} - ${getScoreDescription(artist.score)}` : '未在库中'}
                      </div>
                    </div>
                  </div>
                  
                  {/* 演出史 */}
                  <div className="space-y-2">
                    {artist.shows.map((show) => (
                      <div
                        key={show.id}
                        className="flex items-center justify-between text-sm p-2 bg-[#111111] rounded-lg"
                      >
                        <div className="flex items-center gap-4">
                          <span className="text-gray-400">
                            {new Date(show.date).toLocaleDateString()}
                          </span>
                          <span>{show.city}</span>
                          <span className="text-gray-400">{show.venue}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-gray-400">{show.type}</span>
                          <span className="text-gray-400">
                            距离: {Math.round(calculateDistance(targetCity, show.city))}km
                          </span>
                        </div>
                      </div>
                    ))}
                    {artist.shows.length === 0 && (
                      <div className="text-center text-gray-500 py-4">
                        暂无演出记录
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {selectedArtists.length === 0 && (
                <div className="text-center text-gray-500 py-8">
                  请加艺人查看评分详情
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 设置面板 */}
        {showSettings && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
            <div className="bg-[#111111] rounded-xl p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-medium">评分设置</h3>
                <div className="flex gap-4">
                  <button
                    onClick={restoreCriteria}
                    className="px-4 py-2 bg-gray-800 rounded-lg hover:bg-gray-700"
                  >
                    还原默认
                  </button>
                  <button
                    onClick={saveCriteria}
                    className="px-4 py-2 bg-[#ff2d2d] rounded-lg hover:bg-[#ff2d2d]/80"
                  >
                    保存设置
                  </button>
                  <button
                    onClick={() => setShowSettings(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="space-y-6">
                {/* 距离设置 */}
                <div>
                  <h4 className="text-lg mb-4">距离阈值（公里）</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">第一阈值</label>
                      <input
                        type="number"
                        value={tempCriteria.distance1}
                        onChange={(e) => setTempCriteria(prev => ({
                          ...prev,
                          distance1: parseInt(e.target.value)
                        }))}
                        className="w-full bg-black border border-gray-800 rounded-lg px-4 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">第二阈值</label>
                      <input
                        type="number"
                        value={tempCriteria.distance2}
                        onChange={(e) => setTempCriteria(prev => ({
                          ...prev,
                          distance2: parseInt(e.target.value)
                        }))}
                        className="w-full bg-black border border-gray-800 rounded-lg px-4 py-2"
                      />
                    </div>
                  </div>
                </div>

                {/* 时间设置 */}
                <div>
                  <h4 className="text-lg mb-4">时间设置（月）</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">第一阈值</label>
                      <input
                        type="number"
                        value={tempCriteria.time1}
                        onChange={(e) => setTempCriteria(prev => ({
                          ...prev,
                          time1: parseInt(e.target.value)
                        }))}
                        className="w-full bg-black border border-gray-800 rounded-lg px-4 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">第二阈值</label>
                      <input
                        type="number"
                        value={tempCriteria.time2}
                        onChange={(e) => setTempCriteria(prev => ({
                          ...prev,
                          time2: parseInt(e.target.value)
                        }))}
                        className="w-full bg-black border border-gray-800 rounded-lg px-4 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">第三阈值</label>
                      <input
                        type="number"
                        value={tempCriteria.time3}
                        onChange={(e) => setTempCriteria(prev => ({
                          ...prev,
                          time3: parseInt(e.target.value)
                        }))}
                        className="w-full bg-black border border-gray-800 rounded-lg px-4 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">演出显示范围</label>
                      <input
                        type="number"
                        value={tempCriteria.timeRange}
                        onChange={(e) => setTempCriteria(prev => ({
                          ...prev,
                          timeRange: parseInt(e.target.value)
                        }))}
                        className="w-full bg-black border border-gray-800 rounded-lg px-4 py-2"
                      />
                    </div>
                  </div>
                </div>

                {/* 分数设置 */}
                <div>
                  <h4 className="text-lg mb-4">分数设置</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(tempCriteria.scores).map(([key, value]) => (
                      <div key={key}>
                        <label className="block text-sm text-gray-400 mb-2">
                          {getScoreDescriptions(tempCriteria)[key]}
                          <span className="text-xs text-gray-500 ml-2">({key})</span>
                        </label>
                        <input
                          type="number"
                          value={value}
                          onChange={(e) => setTempCriteria(prev => ({
                            ...prev,
                            scores: {
                              ...prev.scores,
                              [key]: parseInt(e.target.value)
                            }
                          }))}
                          className="w-full bg-black border border-gray-800 rounded-lg px-4 py-2"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 时间线弹出层 */}
        {selectedArtistTimeline && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
            <div className="bg-[#111111] rounded-xl p-8 max-w-4xl w-full max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-medium">
                  {selectedArtistTimeline.name} 的演出间线
                  <span className="text-sm text-gray-400 ml-2">
                    (共 {selectedArtistTimeline.shows?.length || 0} 场演出)
                  </span>
                </h3>
                <button
                  onClick={() => setSelectedArtistTimeline(null)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* 时间线内容 */}
              <div className="relative">
                {selectedArtistTimeline.shows?.length > 0 ? (
                  <>
                    <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gray-800" />
                    <div className="space-y-6">
                      {selectedArtistTimeline.shows.map((show, index) => {
                        const showDate = new Date(show.date);
                        const isPast = showDate < new Date();
                        
                        return (
                          <div
                            key={index}
                            className={`flex items-center gap-4 ${
                              index % 2 === 0 ? 'flex-row-reverse' : ''
                            }`}
                          >
                            {/* 日期标记 */}
                            <div className={`w-1/2 ${index % 2 === 0 ? 'text-left' : 'text-right'}`}>
                              <div className="text-sm text-gray-400">
                                {showDate.toLocaleDateString('zh-CN', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </div>
                            </div>

                            {/* 时间线节点 */}
                            <div className="relative">
                              <div className={`w-3 h-3 rounded-full ${
                                isPast ? 'bg-[#1e3799]' : 'bg-[#c23616]'
                              } absolute top-1/2 -translate-y-1/2 ${
                                index % 2 === 0 ? '-translate-x-1/2' : 'translate-x-1/2'
                              }`} />
                            </div>

                            {/* 演出信息 */}
                            <div className={`w-1/2 ${
                              index % 2 === 0 ? 'text-right' : 'text-left'
                            }`}>
                              <div className="bg-black/20 p-4 rounded-lg border border-gray-800">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="text-xs px-2 py-0.5 rounded-full bg-[#ff2d2d]/10 text-[#ff2d2d] border border-[#ff2d2d]/20">
                                    {show.tag || '演出'}
                                  </span>
                                </div>
                                <div className="text-sm font-medium mb-2">
                                  {show.name}
                                </div>
                                <div className="space-y-1 text-sm">
                                  <div className="flex items-center gap-2 text-gray-400">
                                    <MapPin className="w-4 h-4" />
                                    <span>{show.city} · {show.venue}</span>
                                  </div>
                                  {show.lineup && (
                                    <div className="text-gray-400">
                                      阵容：{show.lineup}
                                    </div>
                                  )}
                                  {show.price && (
                                    <div className="text-gray-400">
                                      票价：{show.price}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    暂无��出数据
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 演出详情弹窗 */}
        {showCityStats && cityPerformanceStats && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
            <div className="bg-[#111111] rounded-xl p-8 max-w-4xl w-full max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-medium">
                  {targetCity} 演出统计
                </h3>
                <button
                  onClick={() => setShowCityStats(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                {[
                  { title: '市内演出', data: cityPerformanceStats.inCity },
                  { title: '周边演出', data: cityPerformanceStats.nearby },
                  { title: '区域演出', data: cityPerformanceStats.wider }
                ].map(({ title, data }) => (
                  <div key={title} className="space-y-4">
                    <h4 className="text-lg font-medium border-b border-gray-800 pb-2">
                      {title}
                      <span className="text-sm text-gray-400 ml-2">
                        (共 {data.total} 场)
                      </span>
                    </h4>
                    <div className="space-y-2">
                      {data.performances.map((perf, index) => (
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
                                <span className="mx-2">·</span>
                                <span className="text-white/80">{perf.city}</span>
                                {perf.venue && (
                                  <>
                                    <span className="mx-2">·</span>
                                    <span className="text-gray-400">{perf.venue}</span>
                                  </>
                                )}
                              </div>
                              {perf.city !== targetCity && (
                                <div className="text-xs text-gray-500 mt-1">
                                  距离: {perf.distance}km
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              {perf.isUpcoming && (
                                <div className="px-2 py-1 rounded-full bg-[#ff2d2d]/10 text-[#ff2d2d] text-xs">
                                  即将举行
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 报价输入弹窗 */}
        {showPriceInput && currentArtist && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
            <div className="bg-[#111111] rounded-xl p-6 w-96">
              <h3 className="text-lg font-medium mb-4">设置报价</h3>
              <input
                type="text"
                value={priceInput}
                onChange={(e) => setPriceInput(e.target.value)}
                className="w-full bg-black border border-gray-800 rounded-lg px-4 py-2 mb-4"
                placeholder="输入报价"
              />
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => {
                    setShowPriceInput(false);
                    setPriceInput('');
                    setCurrentArtist(null);
                  }}
                  className="px-4 py-2 text-gray-400 hover:text-white"
                >
                  取消
                </button>
                <button
                  onClick={async () => {
                    if (await setArtistPrice(currentArtist, priceInput)) {
                      setShowPriceInput(false);
                      setPriceInput('');
                      setCurrentArtist(null);
                    }
                  }}
                  className="px-4 py-2 bg-[#ff2d2d] rounded-lg"
                >
                  确定
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArtistCheck; 