import React, { useState } from 'react';
import { Form, Input, Button, message, Card } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AUTH_ENDPOINTS } from '../config/api';

const Login = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    try {
      setLoading(true);
      console.log('开始登录请求...');
      const response = await axios.post(AUTH_ENDPOINTS.LOGIN, values);
      console.log('登录响应:', response.data);
      
      if (response.data.success) {
        // 确保正确存储 token
        const token = response.data.data.token;
        const user = response.data.data.user;
        
        // 先清除旧数据
        localStorage.clear();
        
        // 存储新的 token 和用户信息
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        console.log('已保存 token:', localStorage.getItem('token'));
        console.log('已保存 user:', localStorage.getItem('user'));
        
        message.success('登录成功！');
        
        // 使用 navigate 进行路由跳转
        navigate('/', { replace: true });
      } else {
        message.error(response.data.message || '登录失败，请重试');
      }
    } catch (error) {
      console.error('登录失败:', error.response || error);
      message.error(error.response?.data?.message || '登录失败，请检查网络连接');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '40px auto', padding: '0 20px' }}>
      <Card title="用户登录" bordered={false}>
        <Form
          form={form}
          name="login"
          onFinish={onFinish}
          autoComplete="off"
          layout="vertical"
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="用户名" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="密码" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              登录
            </Button>
          </Form.Item>

          <div style={{ textAlign: 'center' }}>
            还没有账号？ <a onClick={() => navigate('/register')}>立即注册</a>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default Login; 