const API_BASE_URL = {
  MAIN_API: process.env.REACT_APP_BACKEND_API_URL || "https://art-back.hkg1.zeabur.app",     // 主后端API
  CRAWLER_API: process.env.REACT_APP_DAMAI_API_URL || "https://art-m.hkg1.zeabur.app",    // 大麦爬虫API
  SHOWSTART_API: process.env.REACT_APP_SHOWSTART_API_URL || "https://art-ss.hkg1.zeabur.app/crawler"    // 秀动爬虫API
};

export default API_BASE_URL;