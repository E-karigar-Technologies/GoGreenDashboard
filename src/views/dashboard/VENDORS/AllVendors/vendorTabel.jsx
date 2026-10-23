import React, { useState } from 'react';
import { Table, Input, Space, Avatar, Button, Switch, Tooltip, Tag, Row, Col, Select, DatePicker, Modal, message, Alert } from 'antd';
import {
  EyeOutlined,
  SearchOutlined,
  ShopOutlined,
  CheckCircleOutlined,
  StopOutlined,
  PlusOutlined,
  MinusOutlined,
  PhoneOutlined,
  MailOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  UserOutlined,
  IdcardOutlined,
  ReloadOutlined,
  FilterOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import useVendors from './hooks/useVendors';
import { convertTimeRange, formatPhone } from '../../../../services/utils/gen_utility';

export default function VendorTable() {
  const navigate = useNavigate();
  const {
    vendors,
    allVendors,
    loading,
    error,
    total,
    page,
    pageSize,
    onPageChange,
    handleToggleStatus,
    handleToggleDeactivateStatus,
    refetch,
    // Filters
    searchInput,
    setSearchInput,
    searchType,
    setSearchType,
    dateType,
    setDateType,
    rangeDates,
    setRangeDates,
    status,
    setStatus,
    sort,
    setSort,
    resetFilters,
  } = useVendors();

  // Block Modal States
  const [blockModalVisible, setBlockModalVisible] = useState(false);
  const [selectedVendorForBlock, setSelectedVendorForBlock] = useState(null);
  const [blockReason, setBlockReason] = useState('Policy Violation');
  const [blockRemarks, setBlockRemarks] = useState('');
  const [blockLoading, setBlockLoading] = useState(false);

  // Unblock Modal States
  const [unblockModalVisible, setUnblockModalVisible] = useState(false);
  const [selectedVendorForUnblock, setSelectedVendorForUnblock] = useState(null);
  const [unblockLoading, setUnblockLoading] = useState(false);

  const openBlockModal = (record) => {
    setSelectedVendorForBlock(record);
    setBlockReason('Policy Violation');
    setBlockRemarks('');
    setBlockModalVisible(true);
  };

  const handleConfirmBlock = async () => {
    if (!selectedVendorForBlock) return;
    setBlockLoading(true);
    const targetId = selectedVendorForBlock.user_id || selectedVendorForBlock.vendor_id;
    const finalRemark = blockReason === 'Other' && blockRemarks.trim()
      ? blockRemarks.trim()
      : [blockReason, blockRemarks.trim()].filter(Boolean).join(' - ');

    const res = await handleToggleDeactivateStatus(targetId, 1, finalRemark);

    setBlockLoading(false);
    if (res?.success) {
      message.success(`Vendor "${selectedVendorForBlock.store_name || targetId}" has been blocked successfully.`);
      setBlockModalVisible(false);
      setSelectedVendorForBlock(null);
    } else {
      message.error(res?.error || 'Failed to block vendor');
    }
  };

  const openUnblockModal = (record) => {
    setSelectedVendorForUnblock(record);
    setUnblockModalVisible(true);
  };

  const handleConfirmUnblock = async () => {
    if (!selectedVendorForUnblock) return;
    setUnblockLoading(true);
    const targetId = selectedVendorForUnblock.user_id || selectedVendorForUnblock.vendor_id;

    const res = await handleToggleDeactivateStatus(targetId, 0, 'Reactivated by Admin');

    setUnblockLoading(false);
    if (res?.success) {
      message.success(`Vendor "${selectedVendorForUnblock.store_name || targetId}" has been unblocked and reactivated.`);
      setUnblockModalVisible(false);
      setSelectedVendorForUnblock(null);
    } else {
      message.error(res?.error || 'Failed to unblock vendor');
    }
  };

  const totalActive = allVendors.filter(v => v.status === 1).length;
  const totalInactive = allVendors.filter(v => v.status !== 1).length;

  // Render expanded row with all details for tablet / mobile or deeper inspection
  const renderExpandedRow = (record) => {
    const ownerName = [record.firstname, record.lastname].filter(Boolean).join(' ');
    const timing = (record?.vendor_start_time && record.vendor_close_time && convertTimeRange(record.vendor_start_time, record.vendor_close_time)) || 'N/A';
    const phone = formatPhone(record.phonenumber, record.prefix);
    const targetId = record.user_id || record.vendor_id;

    return (
      <div
        style={{
          padding: '16px 20px',
          background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
          borderRadius: 10,
          border: '1px solid #e2e8f0',
          boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.02)',
        }}
      >
        <Row gutter={[16, 16]}>
          {/* Custom ID & Status */}
          <Col xs={24} sm={12} md={8}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 5 }}>
              <IdcardOutlined style={{ color: '#088b46' }} /> Identification
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              <Tag color="blue" style={{ fontWeight: 600, margin: 0, borderRadius: 6 }}>
                {record.custom_id || `VEN#${record.vendor_id}`}
              </Tag>
              <Tag color={record.status === 1 ? 'green' : 'default'} style={{ margin: 0, borderRadius: 4 }}>
                {record.status === 1 ? 'Active' : 'Inactive'}
              </Tag>
              {record.deactivate_status === 1 && (
                <Tag color="error" style={{ margin: 0, borderRadius: 4, fontWeight: 700 }}>
                  Blocked
                </Tag>
              )}
            </div>
            {record.deactivate_status === 1 && record.remark && (
              <div style={{ fontSize: 11.5, color: '#dc2626', marginTop: 4 }}>
                <strong>Remark:</strong> {record.remark}
              </div>
            )}
          </Col>

          {/* Store Owner & Username */}
          <Col xs={24} sm={12} md={8}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 5 }}>
              <UserOutlined style={{ color: '#088b46' }} /> Store Owner
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>
              {ownerName || 'Not specified'}
              {record.username && (
                <Tag color="cyan" style={{ fontSize: 10.5, marginLeft: 6, borderRadius: 4 }}>
                  @{record.username}
                </Tag>
              )}
            </div>
          </Col>

          {/* Phone */}
          <Col xs={24} sm={12} md={8}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 5 }}>
              <PhoneOutlined style={{ color: '#088b46' }} /> Phone Number
            </div>
            {record.phonenumber ? (
              <a href={`tel:${record.phonenumber}`} style={{ fontSize: 13, fontWeight: 600, color: '#088b46', textDecoration: 'none' }}>
                {phone}
              </a>
            ) : (
              <span style={{ fontSize: 13, color: '#94a3b8' }}>-</span>
            )}
          </Col>

          {/* Email */}
          <Col xs={24} sm={12} md={8}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 5 }}>
              <MailOutlined style={{ color: '#088b46' }} /> Email Address
            </div>
            {record.email ? (
              <a href={`mailto:${record.email}`} style={{ fontSize: 13, fontWeight: 500, color: '#0284c7', textDecoration: 'none', wordBreak: 'break-all' }}>
                {record.email}
              </a>
            ) : (
              <span style={{ fontSize: 13, color: '#94a3b8' }}>-</span>
            )}
          </Col>

          {/* Operating Hours */}
          <Col xs={24} sm={12} md={8}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 5 }}>
              <ClockCircleOutlined style={{ color: '#088b46' }} /> Operating Hours
            </div>
            <div style={{ fontSize: 13, fontWeight: 500, color: '#334155' }}>
              {timing}
            </div>
          </Col>

          {/* Store Address */}
          <Col xs={24} sm={12} md={8}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 5 }}>
              <EnvironmentOutlined style={{ color: '#088b46' }} /> Store Address
            </div>
            <div style={{ fontSize: 12.5, color: '#475569', lineHeight: 1.4 }}>
              {record.store_address || 'Address not available'}
            </div>
          </Col>
        </Row>

        {/* Footer Action */}
        <div style={{ marginTop: 14, paddingTop: 10, borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 10 }}>
          <Button
            size="small"
            danger={record.deactivate_status !== 1}
            icon={record.deactivate_status === 1 ? <CheckCircleOutlined /> : <StopOutlined />}
            style={{
              borderRadius: 6,
              fontWeight: 600,
              backgroundColor: record.deactivate_status === 1 ? '#16a34a' : undefined,
              color: record.deactivate_status === 1 ? '#ffffff' : undefined,
              borderColor: record.deactivate_status === 1 ? '#16a34a' : undefined,
            }}
            onClick={() => (record.deactivate_status === 1 ? openUnblockModal(record) : openBlockModal(record))}
          >
            {record.deactivate_status === 1 ? 'Unblock Vendor' : 'Block Vendor'}
          </Button>
          <Button
            size="small"
            type="primary"
            icon={<EyeOutlined />}
            style={{ background: '#088b46', border: 'none', borderRadius: 6, fontWeight: 600 }}
            onClick={() => navigate(`/vendors/${targetId}`)}
          >
            Open Full Vendor Profile
          </Button>
        </div>
      </div>
    );
  };

  const columns = [
    {
      title: 'Store & Details',
      dataIndex: 'store_name',
      key: 'storeName',
      render: (text, record) => {
        const ownerName = [record.firstname, record.lastname].filter(Boolean).join(' ');
        const imgSrc = record.store_image || record.profile_pic;
        const targetId = record.user_id || record.vendor_id;

        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Avatar
              size={42}
              src={imgSrc}
              alt="store"
              style={{
                border: '1px solid #e2e8f0',
                boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                flexShrink: 0,
                backgroundColor: '#088b46',
              }}
            >
              {record.store_name ? record.store_name.charAt(0).toUpperCase() : 'S'}
            </Avatar>
            <div style={{ minWidth: 0, overflow: 'hidden' }}>
              <div
                style={{
                  fontWeight: 600,
                  color: '#0f172a',
                  fontSize: '14px',
                  cursor: 'pointer',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
                onClick={() => navigate(`/vendors/${targetId}`)}
              >
                <span>{text ? text.charAt(0).toUpperCase() + text.slice(1) : 'Unnamed Store'}</span>
                {record.deactivate_status === 1 && (
                  <Tag color="error" style={{ fontSize: 10, padding: '0 5px', borderRadius: 4, fontWeight: 700 }}>
                    Blocked
                  </Tag>
                )}
              </div>
              {ownerName && (
                <div style={{ fontSize: 12, color: '#475569', marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  👤 {ownerName}
                </div>
              )}
            </div>
          </div>
        );
      },
    },
    {
      title: 'Custom ID',
      dataIndex: 'custom_id',
      key: 'customId',
      width: 170,
      responsive: ['xl'],
      render: (text) => <Tag color="blue" style={{ borderRadius: '6px', fontWeight: 600 }}>{text || '-'}</Tag>,
    },
    {
      title: 'Operating Hours',
      dataIndex: 'vendor_timing',
      key: 'timing',
      width: 160,
      responsive: ['xl'],
      render: (timing, row) => (
        <span style={{ fontSize: 12.5, color: '#334155', fontWeight: 500 }}>
          ⏱️ {(row?.vendor_start_time && row.vendor_close_time && convertTimeRange(row.vendor_start_time, row.vendor_close_time)) || 'N/A'}
        </span>
      ),
    },
    {
      title: 'Phone',
      dataIndex: 'phonenumber',
      key: 'Phone',
      width: 140,
      responsive: ['lg'],
      render: (number, record) => (
        <span style={{ fontWeight: 500, color: '#0f172a', fontSize: 13 }}>{formatPhone(number, record.prefix)}</span>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'Email',
      width: 180,
      responsive: ['xxl'],
      render: (text) => <span style={{ color: '#475569', fontSize: 13 }}>{text || '-'}</span>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'Status',
      align: 'center',
      width: 100,
      render: (_, record) => (
        <Switch
          size="small"
          checked={record.status === 1}
          checkedChildren="Active"
          unCheckedChildren="Inactive"
          onChange={checked => handleToggleStatus(record.vendor_id, checked ? 1 : 0)}
        />
      ),
    },
    {
      title: 'Actions',
      key: 'action',
      align: 'center',
      width: 150,
      render: (_, record) => {
        const targetId = record.user_id || record.vendor_id;
        const isDeactivated = record.deactivate_status === 1;
        return (
          <Space size={6}>
            <Tooltip title="View Vendor Profile">
              <Button
                type="primary"
                size="small"
                icon={<EyeOutlined />}
                style={{ borderRadius: '6px', background: '#088b46', border: 'none', fontWeight: 600 }}
                onClick={() => navigate(`/vendors/${targetId}`)}
              >
                View
              </Button>
            </Tooltip>
            <Tooltip title={isDeactivated ? 'Unblock Vendor' : 'Block Vendor'}>
              <Button
                size="small"
                danger={!isDeactivated}
                icon={isDeactivated ? <CheckCircleOutlined /> : <StopOutlined />}
                style={{
                  borderRadius: '6px',
                  fontWeight: 600,
                  backgroundColor: isDeactivated ? '#16a34a' : undefined,
                  color: isDeactivated ? '#ffffff' : undefined,
                  borderColor: isDeactivated ? '#16a34a' : undefined,
                }}
                onClick={() => (isDeactivated ? openUnblockModal(record) : openBlockModal(record))}
              >
                {isDeactivated ? 'Unblock' : 'Block'}
              </Button>
            </Tooltip>
          </Space>
        );
      },
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
        {/* Modern Filter Toolbar */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: 12,
            border: '1px solid #e2e8f0',
            padding: '16px',
            marginBottom: 20,
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}
        >
          {/* Top Filter Controls */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 12,
              alignItems: 'center',
            }}
          >
            {/* Search Input with Field Type Select */}
            <div style={{ display: 'flex', flex: '1 1 300px', minWidth: 260 }}>
              <Select
                value={searchType}
                onChange={setSearchType}
                style={{ width: 140 }}
                options={[
                  { label: 'All Fields', value: 'search' },
                  { label: 'Store Name', value: 'store_name' },
                  { label: 'Email', value: 'email' },
                  { label: 'Phone', value: 'phone' },
                ]}
              />
              <Input
                prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
                placeholder={`Search ${searchType === 'search' ? 'by name, email, phone...' : searchType.replace('_', ' ')}`}
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                allowClear
                style={{ flex: 1, borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
              />
            </div>

            {/* Date Preset Filter */}
            <Select
              value={dateType}
              onChange={(val) => {
                setDateType(val);
                if (val !== 'range') setRangeDates(null);
              }}
              style={{ width: 155 }}
              placeholder="Filter by Date"
              options={[
                { label: '📅 All Dates', value: 'all' },
                { label: 'Today', value: 'today' },
                { label: 'Yesterday', value: 'yesterday' },
                { label: 'This Week', value: 'this_week' },
                { label: 'This Month', value: 'this_month' },
                { label: 'Custom Range', value: 'range' },
              ]}
            />

            {/* Custom Date Range Picker */}
            {dateType === 'range' && (
              <DatePicker.RangePicker
                value={rangeDates}
                onChange={setRangeDates}
                format="YYYY-MM-DD"
                placeholder={['Start Date', 'End Date']}
                style={{ borderRadius: 8 }}
              />
            )}

            {/* Status Filter */}
            <Select
              value={status}
              onChange={setStatus}
              style={{ width: 150 }}
              placeholder="Status"
              options={[
                { label: '⚡ All Statuses', value: 'all' },
                { label: 'Active Only', value: '1' },
                { label: 'Inactive Only', value: '0' },
              ]}
            />

            {/* Sort Filter */}
            <Select
              value={sort}
              onChange={setSort}
              style={{ width: 175 }}
              placeholder="Sort By"
              options={[
                { label: '✨ Newest First', value: 'newest' },
                { label: '🔤 Alphabetical (A-Z)', value: 'a-z' },
                { label: '🔤 Alphabetical (Z-A)', value: 'z-a' },
                { label: '⏱️ Oldest First', value: 'oldest' },
              ]}
            />

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: 8, marginLeft: 'auto' }}>
              <Button
                icon={<ReloadOutlined spin={loading} />}
                onClick={refetch}
                style={{ borderRadius: 8, fontWeight: 500 }}
              >
                Refresh
              </Button>
              <Button
                onClick={resetFilters}
                style={{ borderRadius: 8, fontWeight: 500 }}
              >
                Reset
              </Button>
            </div>
          </div>

          {/* Active Filter Badges */}
          {(searchInput || (dateType && dateType !== 'all') || (status && status !== 'all') || (sort && sort !== 'newest')) && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                flexWrap: 'wrap',
                paddingTop: 8,
                borderTop: '1px dashed #e2e8f0',
                fontSize: 12,
              }}
            >
              <span style={{ color: '#64748b', fontWeight: 600 }}>Active Filters:</span>
              {searchInput && (
                <Tag
                  closable
                  onClose={() => setSearchInput('')}
                  color="blue"
                  style={{ borderRadius: 6, fontWeight: 500 }}
                >
                  {searchType}: &quot;{searchInput}&quot;
                </Tag>
              )}
              {dateType && dateType !== 'all' && (
                <Tag
                  closable
                  onClose={() => {
                    setDateType('all');
                    setRangeDates(null);
                  }}
                  color="purple"
                  style={{ borderRadius: 6, fontWeight: 500 }}
                >
                  Date: {dateType === 'range' && rangeDates?.[0] && rangeDates?.[1] ? `${rangeDates[0].format('YYYY-MM-DD')} to ${rangeDates[1].format('YYYY-MM-DD')}` : dateType}
                </Tag>
              )}
              {status && status !== 'all' && (
                <Tag
                  closable
                  onClose={() => setStatus('all')}
                  color={status === '1' ? 'green' : 'orange'}
                  style={{ borderRadius: 6, fontWeight: 500 }}
                >
                  Status: {status === '1' ? 'Active' : 'Inactive'}
                </Tag>
              )}
              {sort && sort !== 'newest' && (
                <Tag
                  closable
                  onClose={() => setSort('newest')}
                  color="cyan"
                  style={{ borderRadius: 6, fontWeight: 500 }}
                >
                  Sort: {sort}
                </Tag>
              )}
              <Button
                type="link"
                size="small"
                onClick={resetFilters}
                style={{ padding: 0, fontSize: 12, color: '#ef4444' }}
              >
                Clear All
              </Button>
            </div>
          )}
        </div>

        <Table
          columns={columns}
          dataSource={vendors}
          loading={loading}
          rowKey={(record) => record.vendor_id || record.id || record.custom_id}
          expandable={{
            expandedRowRender: renderExpandedRow,
            rowExpandable: () => true,
            expandIcon: ({ expanded, onExpand, record }) => (
              <Button
                size="small"
                type="default"
                onClick={(e) => {
                  e.stopPropagation();
                  onExpand(record, e);
                }}
                style={{
                  width: 24,
                  height: 24,
                  minWidth: 24,
                  padding: 0,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '50%',
                  backgroundColor: expanded ? '#088b46' : '#f0fdf4',
                  borderColor: expanded ? '#088b46' : '#86efac',
                  color: expanded ? '#ffffff' : '#088b46',
                  fontWeight: 'bold',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                  transition: 'all 0.2s',
                  cursor: 'pointer',
                }}
              >
                {expanded ? (
                  <MinusOutlined style={{ fontSize: 10 }} />
                ) : (
                  <PlusOutlined style={{ fontSize: 10 }} />
                )}
              </Button>
            ),
          }}
          pagination={{
            current: page,
            pageSize,
            total,
            showSizeChanger: true,
            onChange: onPageChange,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} vendors`,
          }}
        />
      </div>

      {/* Block Vendor Modal Form */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#dc2626' }}>
            <StopOutlined style={{ fontSize: 18 }} />
            <span>Block Vendor</span>
          </div>
        }
        open={blockModalVisible}
        onCancel={() => {
          if (!blockLoading) {
            setBlockModalVisible(false);
            setSelectedVendorForBlock(null);
          }
        }}
        footer={[
          <Button key="cancel" onClick={() => setBlockModalVisible(false)} disabled={blockLoading}>
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            danger
            loading={blockLoading}
            onClick={handleConfirmBlock}
            icon={<StopOutlined />}
            style={{ fontWeight: 600 }}
          >
            Confirm & Block Vendor
          </Button>,
        ]}
        destroyOnClose
      >
        {selectedVendorForBlock && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ padding: '10px 14px', background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
              <div style={{ fontWeight: 600, color: '#0f172a', fontSize: 14 }}>
                {selectedVendorForBlock.store_name || 'Unnamed Store'}
              </div>
              <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                Owner: <strong>{[selectedVendorForBlock.firstname, selectedVendorForBlock.lastname].filter(Boolean).join(' ') || 'N/A'}</strong>
                {' • '}ID: <strong>{selectedVendorForBlock.custom_id || `VEN#${selectedVendorForBlock.vendor_id}`}</strong>
              </div>
            </div>

            <Alert
              type="warning"
              showIcon
              message="Vendor store will be blocked"
              description="Blocking this vendor will deactivate their store and hide products from customer ordering."
              style={{ fontSize: 12.5 }}
            />

            <div>
              <label style={{ display: 'block', fontWeight: 600, fontSize: 13, marginBottom: 6 }}>
                Reason for Blocking: <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <Select
                value={blockReason}
                onChange={setBlockReason}
                style={{ width: '100%' }}
                options={[
                  { label: 'Policy Violation (Breach of Platform Terms)', value: 'Policy Violation' },
                  { label: 'Fraudulent Activity / Suspicious Transactions', value: 'Fraudulent Activity' },
                  { label: 'High Order Cancellation Rate', value: 'High Order Cancellation Rate' },
                  { label: 'Customer Complaints & Low Ratings', value: 'Customer Complaints' },
                  { label: 'Quality / Food Hygiene Issues', value: 'Quality/Hygiene Issues' },
                  { label: 'Unsettled Fees / Payment Disputes', value: 'Payment Dispute' },
                  { label: 'Vendor Requested Temporary Block', value: 'Vendor Requested' },
                  { label: 'Other', value: 'Other' },
                ]}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 600, fontSize: 13, marginBottom: 6 }}>
                Additional Remarks / Details:
              </label>
              <Input.TextArea
                rows={3}
                placeholder="Enter details about why this vendor is being blocked..."
                value={blockRemarks}
                onChange={(e) => setBlockRemarks(e.target.value)}
              />
            </div>
          </div>
        )}
      </Modal>

      {/* Unblock Vendor Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#16a34a' }}>
            <CheckCircleOutlined style={{ fontSize: 18 }} />
            <span>Unblock & Reactivate Vendor</span>
          </div>
        }
        open={unblockModalVisible}
        onCancel={() => {
          if (!unblockLoading) {
            setUnblockModalVisible(false);
            setSelectedVendorForUnblock(null);
          }
        }}
        footer={[
          <Button key="cancel" onClick={() => setUnblockModalVisible(false)} disabled={unblockLoading}>
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={unblockLoading}
            onClick={handleConfirmUnblock}
            icon={<CheckCircleOutlined />}
            style={{ backgroundColor: '#16a34a', borderColor: '#16a34a', fontWeight: 600 }}
          >
            Reactivate Vendor
          </Button>,
        ]}
      >
        {selectedVendorForUnblock && (
          <p style={{ margin: 0, fontSize: 13.5 }}>
            Are you sure you want to unblock and reactivate <strong>{selectedVendorForUnblock.store_name}</strong>?
            Their store will be marked active and their products will be visible to customers again.
          </p>
        )}
      </Modal>
    </div>
  );
}
