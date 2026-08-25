import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Input, Button, Form, Alert } from "antd";
import {
  MailOutlined,
  LockOutlined,
  ArrowRightOutlined
} from "@ant-design/icons";
import logoDark from 'assets/images/logo1.svg';
import { jwtDecode } from "jwt-decode";
import useAuth from '../../store/useAuth';

const API_URL = import.meta.env.VITE_API_URL;

export default function SignIn1() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const login = useAuth((state) => state.login);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/dashboard");
    }
  }, [navigate]);

  const handleSubmit = async () => {
    setError("");
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/users/adminlogin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();

      if (response.ok) {
        const token = data.token;
        if (token) {
          localStorage.setItem("token", data.token);
          const decoded = jwtDecode(token);
          login(token, decoded);
          localStorage.setItem("role_id", decoded.role_id);
          localStorage.setItem("role", decoded.role);
          localStorage.setItem("username", decoded.username);
        }
        navigate("/dashboard");
        window.location.reload();
      } else {
        setError(data.message || "Invalid email or password");
      }
    } catch (err) {
      setError("Unable to connect to server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100%',
      background: 'linear-gradient(135deg, #043d1f 0%, #088b46 50%, #022412 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    }}>
      {/* Soft Glow Orbs */}
      <div style={{
        position: 'absolute',
        top: '-20%',
        left: '-15%',
        width: '550px',
        height: '550px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(16, 185, 129, 0.2) 0%, rgba(0,0,0,0) 70%)',
        filter: 'blur(50px)',
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-20%',
        right: '-15%',
        width: '650px',
        height: '650px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(8, 139, 70, 0.25) 0%, rgba(0,0,0,0) 70%)',
        filter: 'blur(60px)',
        pointerEvents: 'none'
      }} />

      {/* Centered Executive Card */}
      <div style={{
        width: '100%',
        maxWidth: '460px',
        background: '#ffffff',
        borderRadius: '20px',
        boxShadow: '0 25px 70px rgba(0, 0, 0, 0.3)',
        padding: '44px 36px',
        zIndex: 10,
        border: '1px solid rgba(255, 255, 255, 0.4)'
      }}>
        {/* Header Logo & Title */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '12px 24px',
            borderRadius: '16px',
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            marginBottom: '20px',
            boxShadow: '0 4px 14px rgba(8, 139, 70, 0.08)'
          }}>
            <img src={logoDark} alt="GoGreen Logo" style={{ height: '40px', objectFit: 'contain' }} />
          </div>

          <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0', letterSpacing: '-0.3px' }}>
            GoGreen Admin Portal
          </h2>
          <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
            Sign in to access your dashboard
          </p>
        </div>

        {error && (
          <Alert
            message={error}
            type="error"
            showIcon
            style={{ marginBottom: '24px', borderRadius: '10px' }}
          />
        )}

        <Form layout="vertical" onFinish={handleSubmit} autoComplete="off">
          <Form.Item
            label={<span style={{ fontWeight: 600, color: '#334155', fontSize: '13.5px' }}>Email Address</span>}
            name="email"
            rules={[
              { required: true, message: 'Please enter your email' },
              { type: 'email', message: 'Please enter a valid email' }
            ]}
            style={{ marginBottom: '20px' }}
          >
            <Input
              prefix={<MailOutlined style={{ color: '#088b46', fontSize: '16px' }} />}
              placeholder="Enter email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ height: '48px', borderRadius: '10px', fontSize: '14.5px' }}
            />
          </Form.Item>

          <Form.Item
            label={<span style={{ fontWeight: 600, color: '#334155', fontSize: '13.5px' }}>Password</span>}
            name="password"
            rules={[{ required: true, message: 'Please enter your password' }]}
            style={{ marginBottom: '28px' }}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: '#088b46', fontSize: '16px' }} />}
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ height: '48px', borderRadius: '10px', fontSize: '14.5px' }}
            />
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            block
            style={{
              height: '48px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #088b46 0%, #066e37 100%)',
              border: 'none',
              fontWeight: 700,
              fontSize: '15px',
              boxShadow: '0 6px 20px rgba(8, 139, 70, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <span>Sign In to Dashboard</span>
            <ArrowRightOutlined />
          </Button>
        </Form>
      </div>
    </div>
  );
}
