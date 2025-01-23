import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import HomePage from './components/home/HomePage';
import PerformanceMap from './components/map/PerformanceMap';
import RecentPerformances from './components/performances/RecentPerformances';
import ArtistList from './components/artists/ArtistList';
import StatisticsView from './components/statistics/StatisticsView';
import UpdateForm from './components/update/UpdateForm';
import ArtistCheck from './components/artists/ArtistCheck';
import Login from './pages/Login';
import Register from './pages/Register';
import PrivateRoute from './components/PrivateRoute';

const App = () => {
  return (
    <Router>
      <Routes>
        {/* 公开路由 */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* 需要认证的路由 */}
        <Route path="/" element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }>
          <Route index element={<HomePage />} />
          <Route path="artist-check" element={<ArtistCheck />} />
          <Route path="performance-map" element={<PerformanceMap />} />
          <Route path="recent-performances" element={<RecentPerformances />} />
          <Route path="artists" element={<ArtistList />} />
          <Route path="statistics" element={<StatisticsView />} />
          <Route path="update" element={<UpdateForm />} />
        </Route>

        {/* 重定向未知路由到首页 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App; 