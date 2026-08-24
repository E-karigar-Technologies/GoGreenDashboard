import React from 'react';
import { Table, Input, Space, Avatar, Button, Switch, Tooltip, Tag } from 'antd';
import { EyeOutlined, SearchOutlined, CarOutlined, CheckCircleOutlined, StopOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { formatPhone } from '../../../services/utils/gen_utility';
import useRider from './hooks/useRider';

export default function RiderTable() {
  const navigate = useNavigate();
  const {
    vendors: riders,
    loading,
    search,
    page,
    pageSize,
    total,
    onSearch,
    onPageChange,
    handleToggleStatus,
  } = useRider();

  const totalActive = (riders || []).filter(r => r.status === 1).length;
  const totalInactive = (riders || []).filter(r => r.status !== 1).length;

  const columns = [
    {
      title: '#',
      key: 'srno',
      width: 60,
      render: (text, record, index) => <span style={{ fontWeight: 600, color: '#64748b' }}>#{(page - 1) * pageSize + index + 1}</span>,
      align: 'center',
    },
    {
      title: 'Rider Profile',
      dataIndex: 'profile_pic',
      key: 'profile_pic',
      render: (img, record) => (
        <Avatar
          size={44}
          src={img}
          alt="rider"
          style={{ border: '2px solid #e2e8f0', boxShadow: '0 2px 6px rgba(0,0,0,0.06)' }}
        >
          {record.firstname ? record.firstname.charAt(0).toUpperCase() : 'R'}
        </Avatar>
      ),
      width: 70,
    },
    {
      title: 'Rider Details',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => {
        const fullName = `${record.firstname || ''} ${record.lastname || ''}`.trim() || 'Unnamed Rider';
        return (
          <div>
            <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '14px' }}>
              {fullName.charAt(0).toUpperCase() + fullName.slice(1)}
            </div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
              @{record.username || 'rider'}
            </div>
          </div>
        );
      },
    },
    {
      title: 'Rider ID',
      dataIndex: 'custom_id',
      key: 'customId',
      width: 130,
      render: (text) => <Tag color="blue" style={{ borderRadius: '6px' }}>{text || '-'}</Tag>,
    },
    {
      title: 'Vehicle Registration',
      dataIndex: 'vehicle_registration_number',
      key: 'vehicle_registration_number',
      width: 160,
      render: (veh) => (
        <Tag color="cyan" style={{ fontWeight: 600, borderRadius: '6px' }}>
          🛵 {veh || 'Not Registered'}
        </Tag>
      ),
    },
    {
      title: 'Phone',
      dataIndex: 'phonenumber',
      key: 'Phone',
      width: 150,
      render: (number, record) => (
        <span style={{ fontWeight: 500, color: '#0f172a' }}>{formatPhone(number, record.prefix)}</span>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'Email',
      width: 180,
      render: (text) => <span style={{ color: '#475569', fontSize: 13 }}>{text || '-'}</span>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'Status',
      align: 'center',
      width: 140,
      render: (_, record) => (
        <Switch
          checked={record.status === 1}
          checkedChildren="Active"
          unCheckedChildren="Inactive"
          onChange={checked => handleToggleStatus(record.rider_id, checked ? 1 : 0)}
        />
      ),
    },
    {
      title: 'Action',
      key: 'action',
      align: 'center',
      width: 100,
      render: (_, record) => (
        <Tooltip title="View Rider Details">
          <Button
            type="primary"
            size="small"
            icon={<EyeOutlined />}
            style={{ borderRadius: '6px', background: '#088b46', border: 'none' }}
            onClick={() => navigate(`/riders/${record.rider_id}`)}
          >
            View
          </Button>
        </Tooltip>
      ),
    },
  ];

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header-card">
        <div className="header-title-block">
          <h2>Delivery Riders Directory</h2>
          <p>Manage all active delivery personnel, vehicle registrations, status toggles, and performance details.</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="page-stats-grid">
        <div className="page-stat-card">
          <div className="stat-meta">
            <div className="stat-label">Total Riders</div>
            <div className="stat-number">{total || (riders || []).length}</div>
          </div>
          <div className="stat-icon" style={{ background: '#e0f2fe', color: '#0284c7' }}>
            <CarOutlined />
          </div>
        </div>

        <div className="page-stat-card">
          <div className="stat-meta">
            <div className="stat-label">Active Riders</div>
            <div className="stat-number">{totalActive}</div>
          </div>
          <div className="stat-icon" style={{ background: '#dcfce7', color: '#088b46' }}>
            <CheckCircleOutlined />
          </div>
        </div>

        <div className="page-stat-card">
          <div className="stat-meta">
            <div className="stat-label">Inactive Riders</div>
            <div className="stat-number">{totalInactive}</div>
          </div>
          <div className="stat-icon" style={{ background: '#f1f5f9', color: '#64748b' }}>
            <StopOutlined />
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="page-content-card">
        <Space style={{ marginBottom: 20, flexWrap: 'wrap' }}>
          <Input
            prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
            placeholder="Search by Rider Name..."
            value={search.storeName}
            onChange={e => onSearch('storeName', e.target.value)}
            allowClear
            style={{ width: 220, borderRadius: 8 }}
          />
          <Input
            prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
            placeholder="Search by Rider ID..."
            value={search.customId}
            onChange={e => onSearch('customId', e.target.value)}
            allowClear
            style={{ width: 220, borderRadius: 8 }}
          />
        </Space>

        <Table
          columns={columns}
          dataSource={riders || []}
          loading={loading}
          rowKey="rider_id"
          pagination={{
            current: page,
            pageSize,
            total,
            showSizeChanger: true,
            onChange: onPageChange,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} riders`,
          }}
          scroll={{ x: 'max-content' }}
        />
      </div>
    </div>
  );
}
