import React from 'react';
import { Layout as AntLayout } from 'antd';
import { Outlet } from 'react-router-dom';

const { Content } = AntLayout;

const Layout = () => {
  return (
    <AntLayout>
      <Content>
        <Outlet />
      </Content>
    </AntLayout>
  );
};

export default Layout; 