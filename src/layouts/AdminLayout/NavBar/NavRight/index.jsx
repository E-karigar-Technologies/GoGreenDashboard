import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ListGroup, Dropdown } from 'react-bootstrap';
import { Avatar, Badge } from 'antd';
import { UserOutlined, LogoutOutlined } from '@ant-design/icons';
import avatar2 from 'assets/images/user/avatar-2.svg';

export default function NavRight() {
  const navigate = useNavigate();
  const username = localStorage.getItem("username") || "Admin User";
  const userRole = localStorage.getItem("role") || "Administrator";

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="d-flex align-items-center">
      <Dropdown className="drp-user">
        <Dropdown.Toggle
          as="div"
          style={{ cursor: 'pointer' }}
          className="d-flex align-items-center gap-2 px-3 py-1 rounded-pill bg-light border border-slate-200"
        >
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Avatar
              src={avatar2}
              icon={<UserOutlined />}
              size={36}
              style={{ border: '2px solid #088b46', background: '#e6f4ed' }}
            />
            <span
              style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: '#10b981',
                border: '2px solid #ffffff'
              }}
            />
          </div>

          <div className="d-none d-md-block text-start" style={{ lineHeight: 1.2 }}>
            <div style={{ fontWeight: 700, fontSize: '13.5px', color: '#0f172a' }}>
              {username}
            </div>
            <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 500 }}>
              {userRole}
            </div>
          </div>
        </Dropdown.Toggle>

        <Dropdown.Menu className="dropdown-menu-end shadow-lg border-0" style={{ borderRadius: '12px', minWidth: 200, padding: '8px' }}>
          <div className="px-3 py-2 border-bottom mb-2">
            <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '14px' }}>{username}</div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>Connected Admin</div>
          </div>
          <Dropdown.Item
            onClick={handleLogout}
            className="d-flex align-items-center gap-2 text-danger fw-semibold py-2 rounded-2"
          >
            <LogoutOutlined style={{ fontSize: 16 }} />
            <span>Logout</span>
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
    </div>
  );
}
