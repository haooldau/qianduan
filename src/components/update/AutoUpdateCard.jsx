import React, { useState, useEffect } from 'react';
import { Bot, Search, Users, Check, Loader2, ChevronDown, Calendar, MapPin, Clock, User2, Plus, Minus, CheckSquare, X, SortAsc } from 'lucide-react';
import axios from 'axios';
import API_BASE_URL from '../../config/api';

// 从localStorage获取常用艺人，如果没有则使用默认列表
const getStoredArtists = () => {
  const stored = localStorage.getItem('commonArtists');
  return stored ? JSON.parse(stored) : [
    { id: 1, name: "陈楚生" },
    { id: 2, name: "周杰伦" },
    { id: 3, name: "林俊杰" },
    { id: 4, name: "薛之谦" },
    { id: 5, name: "张学友" },
    { id: 6, name: "刘德华" },
  ];
};

const AutoUpdateCard = () => {
  const [artistInput, setArtistInput] = useState('');
  const [selectedArtists, setSelectedArtists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updateResult, setUpdateResult] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showRecentUpdates, setShowRecentUpdates] = useState(false);
  const [recentUpdates, setRecentUpdates] = useState([]);
  const [commonArtists, setCommonArtists] = useState(getStoredArtists());
  const [isEditing, setIsEditing] = useState(false);
  const [newArtistName, setNewArtistName] = useState('');
  const [updateController, setUpdateController] = useState(null);
  const [sortBy, setSortBy] = useState('date'); // 'date' 或 'artist'

  // 保存常用艺人到localStorage
  useEffect(() => {
    localStorage.setItem('commonArtists', JSON.stringify(commonArtists));
  }, [commonArtists]);

  // 添加新艺人
  const handleAddArtist = () => {
    if (newArtistName.trim()) {
      const newId = Math.max(...commonArtists.map(a => a.id), 0) + 1;
      setCommonArtists([...commonArtists, { id: newId, name: newArtistName.trim() }]);
      setNewArtistName('');
    }
  };

  // 删除艺人
  const handleRemoveArtist = (id) => {
    setCommonArtists(commonArtists.filter(artist => artist.id !== id));
    setSelectedArtists(selectedArtists.filter(artist => artist.id !== id));
  };

  // 全选/取消全选
  const handleSelectAll = () => {
    if (selectedArtists.length === commonArtists.length) {
      setSelectedArtists([]);
    } else {
      setSelectedArtists([...commonArtists]);
    }
  };

  // 提交更新请求
  const handleSubmit = async () => {
    if (!artistInput.trim()) return;

    const controller = new AbortController();
    setUpdateController(controller);
    setLoading(true);
    setUpdateResult(null);

    try {
      const artistList = artistInput.split('、').map(name => name.trim()).filter(name => name);
      
      try {
        // 并行调用两个爬虫
        const [damaiResponse, showstartResponse] = await Promise.allSettled([
          // 大麦爬虫
          axios.post(
            `${API_BASE_URL.CRAWLER_API}/update`,
            { artists: artistList },
            { 
              signal: controller.signal,
              headers: {
                'Content-Type': 'application/json'
              }
            }
          ),
          // 秀动爬虫
          axios.post(
            `${API_BASE_URL.SHOWSTART_API}/update`,
            { artists: artistList },
            { 
              signal: controller.signal,
              headers: {
                'Content-Type': 'application/json'
              }
            }
          )
        ]);

        // 处理爬虫响应
        const results = {
          success: true,
          message: '更新完成',
          data: {
            updates: [],
            performances: []
          }
        };

        // 处理大麦爬虫结果
        if (damaiResponse.status === 'fulfilled') {
          results.data.updates.push(...(damaiResponse.value.data.data.updates || []));
          results.data.performances.push(...(damaiResponse.value.data.data.performances || []));
        } else {
          console.error('大麦爬虫更新失败:', damaiResponse.reason);
          results.message += ' [大麦爬虫更新失败]';
        }

        // 处理秀动爬虫结果
        if (showstartResponse.status === 'fulfilled') {
          results.data.updates.push(...(showstartResponse.value.data.data.updates || []));
          results.data.performances.push(...(showstartResponse.value.data.data.performances || []));
        } else {
          console.error('秀动爬虫更新失败:', showstartResponse.reason);
          results.message += ' [秀动爬虫更新失败]';
        }

        // 如果两个爬虫都失败了，则标记整体失败
        if (damaiResponse.status === 'rejected' && showstartResponse.status === 'rejected') {
          results.success = false;
          results.message = '更新失败：两个爬虫服务都无法连接';
        }

        setUpdateResult(results);

      } catch (error) {
        if (error.name === 'AbortError') {
          console.log('更新请求已取消');
          return;
        }
        setUpdateResult({
          success: false,
          message: '更新失败：' + (error.response?.data?.message || error.message)
        });
      } finally {
        setLoading(false);
        setUpdateController(null);
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('更新请求已取消');
        return;
      }
      setUpdateResult({
        success: false,
        message: '更新失败：' + (error.response?.data?.message || error.message)
      });
    } finally {
      setLoading(false);
      setUpdateController(null);
    }
  };

  // 组件卸载时取消请求
  useEffect(() => {
    return () => {
      if (updateController) {
        updateController.abort();
      }
    };
  }, [updateController]);

  // 处理艺人选择
  const toggleArtist = (artist) => {
    setSelectedArtists(prev => {
      const isSelected = prev.find(a => a.id === artist.id);
      if (isSelected) {
        return prev.filter(a => a.id !== artist.id);
      } else {
        return [...prev, artist];
      }
    });
  };

  // 一键填入选中的艺人
  const fillSelectedArtists = () => {
    const artistNames = selectedArtists.map(artist => artist.name).join('、');
    setArtistInput(artistNames);
  };

  // 获取最近更新的数据
  useEffect(() => {
    if (showRecentUpdates) {
      fetchRecentUpdates();
    }
  }, [showRecentUpdates]);

  const fetchRecentUpdates = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL.MAIN_API}/api/performances/all-shows`, {
        params: {
          limit: 20,
          sort: 'date',
          order: 'DESC'
        }
      });
      
      if (response.data.success) {
        const shows = response.data.data;
        
        // 根据排序方式组织数据
        if (sortBy === 'artist') {
          // 按艺人分组
          const groupedByArtist = shows.reduce((groups, show) => {
            const artist = show.artist || '未知艺人';
            if (!groups[artist]) {
              groups[artist] = {};
            }
            const date = new Date(show.date).toLocaleDateString('zh-CN');
            if (!groups[artist][date]) {
              groups[artist][date] = [];
            }
            groups[artist][date].push(show);
            return groups;
          }, {});
          setRecentUpdates(groupedByArtist);
        } else {
          // 按日期分组
          const groupedByDate = shows.reduce((groups, show) => {
            const date = new Date(show.date).toLocaleDateString('zh-CN');
            if (!groups[date]) {
              groups[date] = {};
            }
            const artist = show.artist || '未知艺人';
            if (!groups[date][artist]) {
              groups[date][artist] = [];
            }
            groups[date][artist].push(show);
            return groups;
          }, {});
          setRecentUpdates(groupedByDate);
        }
      }
    } catch (error) {
      console.error('获取最近更新失败:', error);
    }
  };

  // 格式化时间
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 格式化日期
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // 按艺人分组演出数据
  const groupPerformancesByArtist = (performances) => {
    return performances.reduce((groups, performance) => {
      const artist = performance.artist;
      if (!groups[artist]) {
        groups[artist] = [];
      }
      groups[artist].push(performance);
      return groups;
    }, {});
  };

  return (
    <div className="bg-[#111111] rounded-xl p-8 space-y-6 relative">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <button
            onClick={() => setShowRecentUpdates(!showRecentUpdates)}
            className="text-[#ff2d2d] hover:text-[#ff2d2d]/80 transition-colors"
          >
            <Bot className="w-6 h-6" />
          </button>
          <div>
            <h2 className="text-xl font-medium">自动更新</h2>
            <p className="text-sm text-gray-500 mt-1">
              输入艺人名称，自动爬取最新演出信息
            </p>
          </div>
        </div>
      </div>

      {/* 最近更新弹出卡片 */}
      {showRecentUpdates && (
        <div className="absolute left-0 top-24 w-full bg-[#1A1A1A] rounded-xl border border-gray-800 shadow-2xl z-50">
          <div className="flex items-center justify-between p-4 border-b border-gray-800">
            <div className="flex items-center gap-4">
              <h3 className="text-lg font-medium text-white">最近更新记录</h3>
              <button
                onClick={() => {
                  setSortBy(sortBy === 'date' ? 'artist' : 'date');
                  fetchRecentUpdates();
                }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/20 text-sm text-gray-400 hover:text-white transition-colors"
              >
                <SortAsc className="w-4 h-4" />
                {sortBy === 'date' ? '按日期排序' : '按艺人排序'}
              </button>
            </div>
            <button
              onClick={() => setShowRecentUpdates(false)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="max-h-[600px] overflow-y-auto">
            {Object.entries(recentUpdates).length > 0 ? (
              Object.entries(recentUpdates).map(([primaryKey, secondaryGroups]) => (
                <div key={primaryKey} className="border-b border-gray-800 last:border-b-0">
                  <div className="px-4 py-3 bg-black/40 flex items-center gap-2">
                    {sortBy === 'artist' ? (
                      <>
                        <User2 className="w-4 h-4 text-[#ff2d2d]" />
                        <span className="text-white">{primaryKey}</span>
                      </>
                    ) : (
                      <>
                        <Calendar className="w-4 h-4 text-[#ff2d2d]" />
                        <span className="text-white">{primaryKey}</span>
                      </>
                    )}
                  </div>
                  
                  {Object.entries(secondaryGroups).map(([secondaryKey, shows]) => (
                    <div key={secondaryKey} className="border-b border-gray-800/50 last:border-b-0">
                      <div className="px-4 py-2 bg-black/20 flex items-center gap-2">
                        {sortBy === 'artist' ? (
                          <>
                            <Calendar className="w-4 h-4 text-[#ff2d2d]" />
                            <span className="text-gray-400">{secondaryKey}</span>
                          </>
                        ) : (
                          <>
                            <User2 className="w-4 h-4 text-[#ff2d2d]" />
                            <span className="text-gray-400">{secondaryKey}</span>
                          </>
                        )}
                        <span className="text-sm text-gray-500">({shows.length}条)</span>
                      </div>
                      
                      <div className="divide-y divide-gray-800/50">
                        {shows.map((show) => (
                          <div key={show.id} className="p-4 hover:bg-white/5">
                            <div className="flex items-start gap-4">
                              {show.poster && (
                                <img
                                  src={show.poster}
                                  alt="演出海报"
                                  className="w-16 h-16 object-cover rounded-lg"
                                />
                              )}
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <User2 className="w-4 h-4 text-[#ff2d2d]" />
                                    <span className="text-white font-medium">{show.artist}</span>
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-[#ff2d2d]/10 text-[#ff2d2d] border border-[#ff2d2d]/20">
                                      {show.type}
                                    </span>
                                  </div>
                                  <span className="text-sm text-gray-400">{formatTime(show.created_at)}</span>
                                </div>
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2 text-sm text-gray-400">
                                    <Calendar className="w-4 h-4" />
                                    <span>{formatDate(show.date)}</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-sm text-gray-400">
                                    <MapPin className="w-4 h-4" />
                                    <span>{show.province} {show.city} · {show.venue}</span>
                                  </div>
                                  {show.lineup && (
                                    <div className="text-sm text-gray-400">
                                      阵容：{show.lineup}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-400">
                暂无更新记录
              </div>
            )}
          </div>
        </div>
      )}

      {/* 输入区域 */}
      <div className="space-y-4">
        <div className="relative">
          <input
            type="text"
            value={artistInput}
            onChange={(e) => setArtistInput(e.target.value)}
            placeholder="输入艺人名称，多个艺人用、分隔"
            className="w-full bg-[#0A0A0A] border border-gray-800 rounded-lg px-4 py-3 pr-24 focus:outline-none focus:border-[#ff2d2d] text-white"
          />
          <button
            onClick={handleSubmit}
            disabled={loading || !artistInput.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-[#ff2d2d] text-white rounded-lg hover:bg-[#ff2d2d]/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                更新中
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                更新
              </>
            )}
          </button>
        </div>

        {/* 常用艺人选择 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Users className="w-4 h-4" />
                常用艺人
              </div>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="text-sm text-[#ff2d2d] hover:text-[#ff2d2d]/80"
              >
                {isEditing ? '完成编辑' : '编辑'}
              </button>
              <button
                onClick={handleSelectAll}
                className="text-sm text-[#ff2d2d] hover:text-[#ff2d2d]/80 flex items-center gap-1"
              >
                <CheckSquare className="w-4 h-4" />
                {selectedArtists.length === commonArtists.length ? '取消全选' : '全选'}
              </button>
            </div>
            <button
              onClick={fillSelectedArtists}
              disabled={selectedArtists.length === 0}
              className="text-sm text-[#ff2d2d] hover:text-[#ff2d2d]/80 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              一键填入选中艺人
            </button>
          </div>

          {/* 编辑式下的添加艺人输入框 */}
          {isEditing && (
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newArtistName}
                onChange={(e) => setNewArtistName(e.target.value)}
                placeholder="输入新艺人名称"
                className="flex-1 bg-black/20 border border-gray-700 rounded px-3 py-1.5 text-sm text-white focus:outline-none focus:border-[#ff2d2d]"
              />
              <button
                onClick={handleAddArtist}
                disabled={!newArtistName.trim()}
                className="px-3 py-1.5 bg-[#ff2d2d]/10 text-[#ff2d2d] rounded hover:bg-[#ff2d2d]/20 disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                添加
              </button>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {commonArtists.map((artist) => {
              const isSelected = selectedArtists.find(a => a.id === artist.id);
              return (
                <div
                  key={artist.id}
                  className="flex items-center"
                >
                  <button
                    onClick={() => toggleArtist(artist)}
                    className={`px-3 py-1.5 rounded-full text-sm flex items-center gap-2 transition-all ${
                      isSelected
                        ? 'bg-[#ff2d2d]/10 text-[#ff2d2d] border border-[#ff2d2d]/30'
                        : 'bg-[#1A1A1A] text-gray-400 border border-gray-800 hover:border-[#ff2d2d]/30'
                    }`}
                  >
                    {artist.name}
                    {isSelected && <Check className="w-3 h-3" />}
                  </button>
                  {isEditing && (
                    <button
                      onClick={() => handleRemoveArtist(artist.id)}
                      className="ml-1 p-1 text-gray-400 hover:text-[#ff2d2d] transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 更新结果提示框 */}
      {updateResult && (
        <div className="space-y-4">
          <div className={`p-4 rounded-lg ${
            updateResult.success ? 'bg-green-500/10 border border-green-500/20' : 'bg-red-500/10 border border-red-500/20'
          }`}>
            <div className="flex items-center justify-between">
              <div className={`text-sm ${updateResult.success ? 'text-green-500' : 'text-red-500'}`}>
                {updateResult.message}
              </div>
              {updateResult.success && updateResult.performances?.length > 0 && (
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="flex items-center gap-1 text-sm text-gray-400 hover:text-white transition-colors"
                >
                  查看详情
                  <ChevronDown className={`w-4 h-4 transition-transform ${showDetails ? 'rotate-180' : ''}`} />
                </button>
              )}
            </div>
          </div>

          {/* 更详情展示 */}
          {showDetails && updateResult.performances && (
            <div className="bg-black/20 rounded-lg border border-gray-800 overflow-hidden">
              {Object.entries(groupPerformancesByArtist(updateResult.performances)).map(([artist, performances]) => (
                <div key={artist} className="border-b border-gray-800 last:border-b-0">
                  <div className="px-4 py-3 bg-black/40 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <User2 className="w-4 h-4 text-[#ff2d2d]" />
                      <span className="font-medium text-white">{artist}</span>
                    </div>
                    <div className="text-sm text-gray-400">{performances.length} 场演出</div>
                  </div>
                  <div className="divide-y divide-gray-800/50">
                    {performances.map((performance, index) => (
                      <div key={index} className="p-4 hover:bg-white/5">
                        <div className="flex items-start gap-4">
                          {performance.poster && (
                            <img
                              src={performance.poster}
                              alt="演出海报"
                              className="w-20 h-20 object-cover rounded-lg"
                            />
                          )}
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs px-2 py-0.5 rounded-full bg-[#ff2d2d]/10 text-[#ff2d2d] border border-[#ff2d2d]/20">
                                {performance.type}
                              </span>
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-sm">
                                <Calendar className="w-4 h-4 text-[#ff2d2d]" />
                                <span className="text-white">{formatDate(performance.date)}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-400">
                                <MapPin className="w-4 h-4" />
                                <span>{performance.province} {performance.city} · {performance.venue}</span>
                              </div>
                              {performance.lineup && (
                                <div className="text-sm text-gray-400">
                                  阵容：{performance.lineup}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AutoUpdateCard; 