import React, { useState } from 'react';
import { Form, Input, Button, message, Card, Upload } from 'antd';
import { UserOutlined, LockOutlined, UploadOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AUTH_ENDPOINTS, UPLOAD_URL } from '../config/api';

const Register = () => {
  const [loading, setLoading] = useState(false);
  const [avatar, setAvatar] = useState(null);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    if (values.password !== values.confirmPassword) {
      message.error('两次输入的密码不一致');
      return;
    }

    setLoading(true);
    try {
      // 如果有头像，先上传头像
      let avatarUrl = '';
      if (avatar) {
        const formData = new FormData();
        formData.append('file', avatar);
        const uploadRes = await axios.post(UPLOAD_URL, formData);
        avatarUrl = uploadRes.data.url;
      }

      // 注册用户
      const response = await axios.post(AUTH_ENDPOINTS.REGISTER, {
        username: values.username,
        password: values.password,
        realName: values.realName,
        avatar: avatarUrl,
        slogan: values.slogan || ''
      });

      message.success('注册成功');
      navigate('/login');
    } catch (error) {
      message.error(error.response?.data?.message || '注册失败');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = (info) => {
    if (info.file.status === 'done') {
      setAvatar(info.file.originFileObj);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Card className="w-96 shadow-lg">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">注册</h1>
        </div>
        <Form
          name="register"
          onFinish={onFinish}
          autoComplete="off"
          layout="vertical"
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="用户名"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="realName"
            rules={[{ required: true, message: '请输入真实姓名' }]}
          >
            <Input
              placeholder="真实姓名"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="密码"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            rules={[{ required: true, message: '请确认密码' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="确认密码"
              size="large"
            />
          </Form.Item>

          <Form.Item label="头像">
            <Upload
              accept="image/*"
              listType="picture"
              maxCount={1}
              onChange={handleAvatarChange}
              beforeUpload={() => false}
              showUploadList={true}
            >
              <Button icon={<UploadOutlined />}>上传头像</Button>
            </Upload>
          </Form.Item>

          <Form.Item name="slogan">
            <Input.TextArea
              placeholder="个性签名（选填）"
              rows={3}
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="w-full"
              size="large"
              loading={loading}
            >
              注册
            </Button>
          </Form.Item>

          <div className="text-center">
            <Button type="link" onClick={() => navigate('/login')}>
              已有账号？立即登录
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default Register; 