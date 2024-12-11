const API_BASE_URL = {
  MAIN_API: process.env.REACT_APP_BACKEND_API_URL || "http://localhost:3001",     // 主后端API
  CRAWLER_API: process.env.REACT_APP_DAMAI_API_URL || "http://localhost:8000"    // 爬虫API
};

export default API_BASE_URL;