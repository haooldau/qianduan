const API_BASE_URL = {
  MAIN_API: process.env.REACT_APP_BACKEND_API_URL || "https://art-back.hkg1.zeabur.app/api",     // 主后端API
  CRAWLER_API: process.env.REACT_APP_DAMAI_API_URL || "https://pa-m.zeabur.app",    // 大麦爬虫API
  SHOWSTART_API: process.env.REACT_APP_SHOWSTART_API_URL || "https://art-ss.hkg1.zeabur.app"    // 秀动爬虫API
};

// 认证相关的API端点
export const AUTH_ENDPOINTS = {
  LOGIN: `${API_BASE_URL.MAIN_API}/auth/login`,
  REGISTER: `${API_BASE_URL.MAIN_API}/auth/register`
};

// 文件上传
export const UPLOAD_URL = `${API_BASE_URL.MAIN_API}/upload`;

export default API_BASE_URL;