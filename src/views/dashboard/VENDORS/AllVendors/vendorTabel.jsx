import React from 'react';
import { Table, Input, Space, Avatar, Button, Badge, Switch, Tooltip, Tag } from 'antd';
import { EditOutlined, DeleteOutlined, EyeOutlined, SearchOutlined, ShopOutlined, CheckCircleOutlined, StopOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import useVendors from './hooks/useVendors';
import { convertTimeRange, formatPhone } from '../../../../services/utils/gen_utility';

export default function VendorTable() {
  const navigate = useNavigate();
  const {
    vendors,
    loading,
    search,
    page,
    pageSize,
    total,
    onSearch,
    onPageChange,
    handleToggleStatus,
  } = useVendors();

  const totalActive = vendors.filter(v => v.status === 1).length;
  const totalInactive = vendors.filter(v => v.status !== 1).length;

  const columns = [
    {
      title: '#',
      key: 'srno',
      width: 60,
      render: (text, record, index) => <span style={{ fontWeight: 600, color: '#64748b' }}>#{(page - 1) * pageSize + index + 1}</span>,
      align: 'center',
    },
    {
      title: 'Store',
      dataIndex: 'store_image',
      key: 'storeImage',
      render: (img, record) => (
        <Avatar
          size={44}
          src={img}
          alt="store"
          style={{ border: '2px solid #e2e8f0', boxShadow: '0 2px 6px rgba(0,0,0,0.06)' }}
        >
          {record.store_name ? record.store_name.charAt(0).toUpperCase() : 'S'}
        </Avatar>
      ),
      width: 65,
    },
    {
      title: 'Store Details',
      dataIndex: 'store_name',
      key: 'storeName',
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '14px' }}>
            {text ? text.charAt(0).toUpperCase() + text.slice(1) : 'Unnamed Store'}
          </div>
          <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
            📍 {record.store_address || 'Address not available'}
          </div>
        </div>
      ),
    },
    {
      title: 'Customer ID',
      dataIndex: 'custom_id',
      key: 'customId',
      width: 130,
      render: (text) => <Tag color="blue" style={{ borderRadius: '6px' }}>{text || '-'}</Tag>,
    },
    {
      title: 'Operating Hours',
      dataIndex: 'vendor_timing',
      key: 'timing',
      width: 160,
      render: (timing, row) => (
        <span style={{ fontSize: 13, color: '#334155', fontWeight: 500 }}>
          ⏱️ {(row?.vendor_start_time && row.vendor_close_time && convertTimeRange(row.vendor_start_time, row.vendor_close_time)) || 'N/A'}
        </span>
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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <Switch
            checked={record.status === 1}
            checkedChildren="Active"
            unCheckedChildren="Inactive"
            onChange={checked => handleToggleStatus(record.vendor_id, checked ? 1 : 0)}
          />
        </div>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      align: 'center',
      width: 100,
      render: (_, record) => (
        <Tooltip title="View Vendor Dashboard">
          <Button
            type="primary"
            size="small"
            icon={<EyeOutlined />}
            style={{ borderRadius: '6px', background: '#088b46', border: 'none' }}
            onClick={() => navigate(`/vendors/${record.vendor_id}`)}
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
          <h2>Vendor Directory</h2>
          <p>Manage all registered vendors, operating schedules, store statuses, and detailed performance profiles.</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="page-stats-grid">
        <div className="page-stat-card">
          <div className="stat-meta">
            <div className="stat-label">Total Vendors</div>
            <div className="stat-number">{total || vendors.length}</div>
          </div>
          <div className="stat-icon" style={{ background: '#e0f2fe', color: '#0284c7' }}>
            <ShopOutlined />
          </div>
        </div>

        <div className="page-stat-card">
          <div className="stat-meta">
            <div className="stat-label">Active Vendors</div>
            <div className="stat-number">{totalActive}</div>
          </div>
          <div className="stat-icon" style={{ background: '#dcfce7', color: '#088b46' }}>
            <CheckCircleOutlined />
          </div>
        </div>

        <div className="page-stat-card">
          <div className="stat-meta">
            <div className="stat-label">Inactive Vendors</div>
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
            placeholder="Search by Store Name..."
            value={search.storeName}
            onChange={e => onSearch('storeName', e.target.value)}
            allowClear
            style={{ width: 220, borderRadius: 8 }}
          />
          <Input
            prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
            placeholder="Search by Customer ID..."
            value={search.customId}
            onChange={e => onSearch('customId', e.target.value)}
            allowClear
            style={{ width: 220, borderRadius: 8 }}
          />
        </Space>

        <Table
          columns={columns}
          dataSource={vendors}
          loading={loading}
          rowKey="vendor_id"
          pagination={{
            current: page,
            pageSize,
            total,
            showSizeChanger: true,
            onChange: onPageChange,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} vendors`,
          }}
          scroll={{ x: 'max-content' }}
        />
      </div>
    </div>
  );
}
