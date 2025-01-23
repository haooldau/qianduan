const API_BASE_URL = {
  MAIN_API: "https://art-back.hkg1.zeabur.app",
  CRAWLER_API: "https://pa-m.zeabur.app",
  SHOWSTART_API: "https://art-ss.hkg1.zeabur.app"
};

export const AUTH_ENDPOINTS = {
  LOGIN: `${API_BASE_URL.MAIN_API}/api/auth/login`,
  REGISTER: `${API_BASE_URL.MAIN_API}/api/auth/register`
};

export const UPLOAD_URL = `${API_BASE_URL.MAIN_API}/api/upload`;

export default API_BASE_URL;
