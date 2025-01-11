// API基础URL配置
const BASE_URL = "https://art-back.hkg1.zeabur.app";

// API端点
export const AUTH_ENDPOINTS = {
  LOGIN: `${BASE_URL}/api/auth/login`,
  REGISTER: `${BASE_URL}/api/auth/register`
};

// 文件上传
export const UPLOAD_URL = `${BASE_URL}/api/upload`;

// 其他API配置
export const API_CONFIG = {
  MAIN_API: `${BASE_URL}/api`,
  CRAWLER_API: "https://pa-m.zeabur.app",
  SHOWSTART_API: "https://art-ss.hkg1.zeabur.app"
};

export default API_CONFIG;