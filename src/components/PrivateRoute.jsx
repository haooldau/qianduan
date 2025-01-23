import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
  const location = useLocation();
  const token = localStorage.getItem('token');

  useEffect(() => {
    console.log('PrivateRoute - 当前路径:', location.pathname);
    console.log('PrivateRoute - token状态:', !!token);
  }, [location, token]);

  if (!token) {
    console.log('PrivateRoute - 未检测到token，重定向到登录页');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  console.log('PrivateRoute - token有效，渲染受保护的组件');
  return children;
};

export default PrivateRoute; 