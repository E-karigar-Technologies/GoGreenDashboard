import React from 'react';
import { Table, Input, Space, Avatar, Button, Switch, Tooltip, Tag, Card, Row, Col } from 'antd';
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
      title: 'Rider ID',
      dataIndex: 'custom_id',
      key: 'customId',
      width: 190,
      render: (text, record) => (
        <Tag color="blue" style={{ borderRadius: '6px', fontWeight: 600, padding: '2px 8px' }}>
          {record.custom_id || record.rider_id || '-'}
        </Tag>
      ),
    },
    {
      title: 'Rider Details',
      key: 'riderDetails',
      render: (_, record) => {
        const fullName = `${record.firstname || ''} ${record.lastname || ''}`.trim() || 'Unnamed Rider';
        const phone = formatPhone(record.phonenumber, record.prefix);
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Avatar
              size={48}
              src={record.profile_pic}
              alt="rider"
              style={{
                border: '2px solid #e2e8f0',
                boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
                backgroundColor: '#088b46',
                flexShrink: 0,
              }}
            >
              {record.firstname ? record.firstname.charAt(0).toUpperCase() : 'R'}
            </Avatar>
            <div>
              <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '14px' }}>
                {fullName}
              </div>
              <div style={{ fontSize: 12, color: '#64748b', marginTop: 2, display: 'flex', alignItems: 'center', gap: 10 }}>
                {phone && <span>📞 {phone}</span>}
                {record.email && <span>✉️ {record.email}</span>}
              </div>
            </div>
          </div>
        );
      },
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
          onChange={checked => handleToggleStatus(record.rider_id || record.id, checked ? 1 : 0)}
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
            onClick={() => navigate(`/riders/${record.rider_id || record.id}`)}
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
          <p>Manage all active delivery personnel, vehicle registrations, status toggles, and delivery history.</p>
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
            placeholder="Search by Rider Custom ID..."
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
          rowKey={(record) => record.rider_id || record.id || record.custom_id}
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
