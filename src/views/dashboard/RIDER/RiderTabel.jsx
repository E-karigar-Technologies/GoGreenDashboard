import React, { useState } from 'react';
import {
  Table,
  Input,
  Space,
  Avatar,
  Button,
  Switch,
  Tooltip,
  Tag,
  Row,
  Col,
  Select,
  DatePicker,
  Modal,
  message,
  Alert,
} from 'antd';
import {
  EyeOutlined,
  SearchOutlined,
  CarOutlined,
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
  SafetyCertificateOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import useRider from './hooks/useRider';
import { convertTimeRange, formatPhone } from '../../../services/utils/gen_utility';

export default function RiderTable() {
  const navigate = useNavigate();
  const {
    riders,
    allRiders,
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
    deactivateStatus,
    setDeactivateStatus,
    sort,
    setSort,
    resetFilters,
  } = useRider();

  // Block Modal States
  const [blockModalVisible, setBlockModalVisible] = useState(false);
  const [selectedRiderForBlock, setSelectedRiderForBlock] = useState(null);
  const [blockReason, setBlockReason] = useState('Policy Violation');
  const [blockRemarks, setBlockRemarks] = useState('');
  const [blockLoading, setBlockLoading] = useState(false);

  // Unblock Modal States
  const [unblockModalVisible, setUnblockModalVisible] = useState(false);
  const [selectedRiderForUnblock, setSelectedRiderForUnblock] = useState(null);
  const [unblockLoading, setUnblockLoading] = useState(false);

  const openBlockModal = (record) => {
    setSelectedRiderForBlock(record);
    setBlockReason('Policy Violation');
    setBlockRemarks('');
    setBlockModalVisible(true);
  };

  const handleConfirmBlock = async () => {
    if (!selectedRiderForBlock) return;
    setBlockLoading(true);
    const targetId = selectedRiderForBlock.user_id || selectedRiderForBlock.rider_id || selectedRiderForBlock.id;
    const riderName = `${selectedRiderForBlock.firstname || ''} ${selectedRiderForBlock.lastname || ''}`.trim() || targetId;

    const finalRemark =
      blockReason === 'Other' && blockRemarks.trim()
        ? blockRemarks.trim()
        : [blockReason, blockRemarks.trim()].filter(Boolean).join(' - ');

    const res = await handleToggleDeactivateStatus(targetId, 1, finalRemark);

    setBlockLoading(false);
    if (res?.success) {
      message.success(`Rider "${riderName}" has been blocked successfully.`);
      setBlockModalVisible(false);
      setSelectedRiderForBlock(null);
    } else {
      message.error(res?.error || 'Failed to block rider');
    }
  };

  const openUnblockModal = (record) => {
    setSelectedRiderForUnblock(record);
    setUnblockModalVisible(true);
  };

  const handleConfirmUnblock = async () => {
    if (!selectedRiderForUnblock) return;
    setUnblockLoading(true);
    const targetId = selectedRiderForUnblock.user_id || selectedRiderForUnblock.rider_id || selectedRiderForUnblock.id;
    const riderName = `${selectedRiderForUnblock.firstname || ''} ${selectedRiderForUnblock.lastname || ''}`.trim() || targetId;

    const res = await handleToggleDeactivateStatus(targetId, 0, 'Reactivated by Admin');

    setUnblockLoading(false);
    if (res?.success) {
      message.success(`Rider "${riderName}" has been unblocked and reactivated.`);
      setUnblockModalVisible(false);
      setSelectedRiderForUnblock(null);
    } else {
      message.error(res?.error || 'Failed to unblock rider');
    }
  };

  const totalActive = (allRiders || []).filter((r) => r.status === 1).length;
  const totalInactive = (allRiders || []).filter((r) => r.status !== 1).length;
  const totalBlocked = (allRiders || []).filter((r) => r.deactivate_status === 1).length;

  // Render expanded row with all details for tablet / mobile or deeper inspection
  const renderExpandedRow = (record) => {
    const fullName = `${record.firstname || ''} ${record.lastname || ''}`.trim() || 'Unnamed Rider';
    const timing =
      (record?.rider_start_time &&
        record?.rider_close_time &&
        convertTimeRange(record.rider_start_time, record.rider_close_time)) ||
      'Flexible Hours';
    const phone = formatPhone(record.phonenumber, record.prefix);
    const targetId = record.user_id || record.rider_id || record.id;
    const isDeactivated = record.deactivate_status === 1;

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
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: '#64748b',
                textTransform: 'uppercase',
                marginBottom: 4,
                display: 'flex',
                alignItems: 'center',
                gap: 5,
              }}
            >
              <IdcardOutlined style={{ color: '#088b46' }} /> Identification
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              <Tag color="blue" style={{ fontWeight: 600, margin: 0, borderRadius: 6 }}>
                {record.custom_id || `RID#${record.rider_id || record.user_id}`}
              </Tag>
              <Tag color={record.status === 1 ? 'green' : 'default'} style={{ margin: 0, borderRadius: 4 }}>
                {record.status === 1 ? 'Online' : 'Offline'}
              </Tag>
              {isDeactivated && (
                <Tag color="error" style={{ margin: 0, borderRadius: 4, fontWeight: 700 }}>
                  Blocked
                </Tag>
              )}
            </div>
            {isDeactivated && (record.deactivate_remark || record.remark) && (
              <div style={{ fontSize: 11.5, color: '#dc2626', marginTop: 4 }}>
                <strong>Remark:</strong> {record.deactivate_remark || record.remark}
              </div>
            )}
          </Col>

          {/* Rider Name & Username */}
          <Col xs={24} sm={12} md={8}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: '#64748b',
                textTransform: 'uppercase',
                marginBottom: 4,
                display: 'flex',
                alignItems: 'center',
                gap: 5,
              }}
            >
              <UserOutlined style={{ color: '#088b46' }} /> Rider Account
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>
              {fullName}
              {record.username && (
                <Tag color="cyan" style={{ fontSize: 10.5, marginLeft: 6, borderRadius: 4 }}>
                  @{record.username}
                </Tag>
              )}
            </div>
          </Col>

          {/* Phone */}
          <Col xs={24} sm={12} md={8}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: '#64748b',
                textTransform: 'uppercase',
                marginBottom: 4,
                display: 'flex',
                alignItems: 'center',
                gap: 5,
              }}
            >
              <PhoneOutlined style={{ color: '#088b46' }} /> Phone Number
            </div>
            {record.phonenumber ? (
              <a
                href={`tel:${record.phonenumber}`}
                style={{ fontSize: 13, fontWeight: 600, color: '#088b46', textDecoration: 'none' }}
              >
                {phone}
              </a>
            ) : (
              <span style={{ fontSize: 13, color: '#94a3b8' }}>-</span>
            )}
          </Col>

          {/* Email */}
          <Col xs={24} sm={12} md={8}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: '#64748b',
                textTransform: 'uppercase',
                marginBottom: 4,
                display: 'flex',
                alignItems: 'center',
                gap: 5,
              }}
            >
              <MailOutlined style={{ color: '#088b46' }} /> Email Address
            </div>
            {record.email ? (
              <a
                href={`mailto:${record.email}`}
                style={{ fontSize: 13, fontWeight: 500, color: '#0284c7', textDecoration: 'none', wordBreak: 'break-all' }}
              >
                {record.email}
              </a>
            ) : (
              <span style={{ fontSize: 13, color: '#94a3b8' }}>-</span>
            )}
          </Col>

          {/* Vehicle Information */}
          <Col xs={24} sm={12} md={8}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: '#64748b',
                textTransform: 'uppercase',
                marginBottom: 4,
                display: 'flex',
                alignItems: 'center',
                gap: 5,
              }}
            >
              <CarOutlined style={{ color: '#088b46' }} /> Vehicle Details
            </div>
            <div style={{ fontSize: 13, fontWeight: 500, color: '#334155' }}>
              <strong>Plate:</strong> {record.vehicle_registration_number || 'N/A'}{' '}
              {record.vehicle_type && <Tag color="geekblue" style={{ fontSize: 11, marginLeft: 4 }}>{record.vehicle_type}</Tag>}
            </div>
            {record.vehicle_owner_name && (
              <div style={{ fontSize: 11.5, color: '#64748b', marginTop: 2 }}>
                Owner: {record.vehicle_owner_name}
              </div>
            )}
          </Col>

          {/* Driver License */}
          <Col xs={24} sm={12} md={8}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: '#64748b',
                textTransform: 'uppercase',
                marginBottom: 4,
                display: 'flex',
                alignItems: 'center',
                gap: 5,
              }}
            >
              <SafetyCertificateOutlined style={{ color: '#088b46' }} /> Driver License
            </div>
            <div style={{ fontSize: 13, fontWeight: 500, color: '#334155' }}>
              <strong>License:</strong> {record.license_number || 'N/A'}
            </div>
            {record.license_expiry_date && (
              <div style={{ fontSize: 11.5, color: '#64748b', marginTop: 2 }}>
                Exp: {record.license_expiry_date}
              </div>
            )}
          </Col>

          {/* Operating Hours */}
          <Col xs={24} sm={12} md={8}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: '#64748b',
                textTransform: 'uppercase',
                marginBottom: 4,
                display: 'flex',
                alignItems: 'center',
                gap: 5,
              }}
            >
              <ClockCircleOutlined style={{ color: '#088b46' }} /> Shift / Hours
            </div>
            <div style={{ fontSize: 13, fontWeight: 500, color: '#334155' }}>{timing}</div>
          </Col>

          {/* Address */}
          <Col xs={24} sm={12} md={8}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: '#64748b',
                textTransform: 'uppercase',
                marginBottom: 4,
                display: 'flex',
                alignItems: 'center',
                gap: 5,
              }}
            >
              <EnvironmentOutlined style={{ color: '#088b46' }} /> Address / Region
            </div>
            <div style={{ fontSize: 12.5, color: '#475569', lineHeight: 1.4 }}>
              {record.address || 'Address not registered'}
            </div>
          </Col>
        </Row>

        {/* Footer Action */}
        <div
          style={{
            marginTop: 14,
            paddingTop: 10,
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <Button
            size="small"
            danger={!isDeactivated}
            icon={isDeactivated ? <CheckCircleOutlined /> : <StopOutlined />}
            style={{
              borderRadius: 6,
              fontWeight: 600,
              backgroundColor: isDeactivated ? '#16a34a' : undefined,
              color: isDeactivated ? '#ffffff' : undefined,
              borderColor: isDeactivated ? '#16a34a' : undefined,
            }}
            onClick={() => (isDeactivated ? openUnblockModal(record) : openBlockModal(record))}
          >
            {isDeactivated ? 'Unblock Rider' : 'Block Rider'}
          </Button>
          <Button
            size="small"
            type="primary"
            icon={<EyeOutlined />}
            style={{ background: '#088b46', border: 'none', borderRadius: 6, fontWeight: 600 }}
            onClick={() => navigate(`/riders/${targetId}`)}
          >
            Open Full Rider Profile
          </Button>
        </div>
      </div>
    );
  };

  const columns = [
    {
      title: 'STORE & DETAILS', // Matches vendor column title visual header
      dataIndex: 'name',
      key: 'riderDetails',
      render: (_, record) => {
        const fullName = `${record.firstname || ''} ${record.lastname || ''}`.trim() || 'Unnamed Rider';
        const targetId = record.user_id || record.rider_id || record.id;
        const isDeactivated = record.deactivate_status === 1;

        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Avatar
              size={42}
              src={record.profile_pic}
              alt="rider"
              style={{
                border: '1px solid #e2e8f0',
                boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                flexShrink: 0,
                backgroundColor: '#088b46',
              }}
            >
              {record.firstname ? record.firstname.charAt(0).toUpperCase() : 'R'}
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
                onClick={() => navigate(`/riders/${targetId}`)}
              >
                <span>{fullName}</span>
                {isDeactivated && (
                  <Tag color="error" style={{ fontSize: 10, padding: '0 5px', borderRadius: 4, fontWeight: 700 }}>
                    Blocked
                  </Tag>
                )}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: '#475569',
                  marginTop: 1,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                👤 {record.username ? `@${record.username}` : (record.vehicle_registration_number || 'Delivery Partner')}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      title: 'CUSTOM ID',
      dataIndex: 'custom_id',
      key: 'customId',
      width: 170,
      responsive: ['xl'],
      render: (text, record) => (
        <Tag color="blue" style={{ borderRadius: '6px', fontWeight: 600 }}>
          {text || record.custom_id || (record.rider_id ? `RID#${record.rider_id}` : '-')}
        </Tag>
      ),
    },
    {
      title: 'OPERATING HOURS',
      dataIndex: 'rider_timing',
      key: 'timing',
      width: 160,
      responsive: ['xl'],
      render: (_, row) => (
        <span style={{ fontSize: 12.5, color: '#334155', fontWeight: 500 }}>
          ⏱️{' '}
          {(row?.rider_start_time &&
            row?.rider_close_time &&
            convertTimeRange(row.rider_start_time, row.rider_close_time)) ||
            (row?.vehicle_registration_number ? `Plate: ${row.vehicle_registration_number}` : '08:00 AM - 11:30 PM')}
        </span>
      ),
    },
    {
      title: 'PHONE',
      dataIndex: 'phonenumber',
      key: 'Phone',
      width: 140,
      responsive: ['lg'],
      render: (number, record) => (
        <span style={{ fontWeight: 500, color: '#0f172a', fontSize: 13 }}>
          {formatPhone(number, record.prefix)}
        </span>
      ),
    },
    {
      title: 'EMAIL',
      dataIndex: 'email',
      key: 'Email',
      width: 180,
      responsive: ['xxl'],
      render: (text) => <span style={{ color: '#475569', fontSize: 13 }}>{text || '-'}</span>,
    },
    {
      title: 'STATUS',
      dataIndex: 'status',
      key: 'Status',
      align: 'center',
      width: 100,
      render: (_, record) => {
        const targetId = record.rider_id || record.user_id || record.id;
        return (
          <Switch
            size="small"
            checked={record.status === 1}
            checkedChildren="Active"
            unCheckedChildren="Inactive"
            onChange={(checked) => handleToggleStatus(targetId, checked ? 1 : 0)}
          />
        );
      },
    },
    {
      title: 'ACTIONS',
      key: 'action',
      align: 'center',
      width: 150,
      render: (_, record) => {
        const targetId = record.user_id || record.rider_id || record.id;
        const isDeactivated = record.deactivate_status === 1;
        return (
          <Space size={6}>
            <Tooltip title="View Rider Profile">
              <Button
                type="primary"
                size="small"
                icon={<EyeOutlined />}
                style={{ borderRadius: '6px', background: '#088b46', border: 'none', fontWeight: 600 }}
                onClick={() => navigate(`/riders/${targetId}`)}
              >
                View
              </Button>
            </Tooltip>
            <Tooltip title={isDeactivated ? 'Unblock Rider' : 'Block Rider'}>
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
          <h2>Delivery Riders Directory</h2>
          <p>Manage all registered delivery personnel, vehicle registrations, online/offline status, and block controls.</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="page-stats-grid">
        <div className="page-stat-card">
          <div className="stat-meta">
            <div className="stat-label">Total Riders</div>
            <div className="stat-number">{total || (allRiders || []).length}</div>
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

        <div className="page-stat-card">
          <div className="stat-meta">
            <div className="stat-label">Blocked Riders</div>
            <div className="stat-number">{totalBlocked}</div>
          </div>
          <div className="stat-icon" style={{ background: '#fee2e2', color: '#ef4444' }}>
            <WarningOutlined />
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="page-content-card">
        {/* Modern Filter Toolbar (Matches Vendor Page Toolbar) */}
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
                  { label: 'Rider Name', value: 'name' },
                  { label: 'Email', value: 'email' },
                  { label: 'Phone', value: 'phone' },
                  { label: 'Vehicle Plate', value: 'vehicle_number' },
                  { label: 'License Number', value: 'license' },
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
          {(searchInput ||
            (dateType && dateType !== 'all') ||
            (status && status !== 'all') ||
            (deactivateStatus && deactivateStatus !== 'all') ||
            (sort && sort !== 'newest')) && (
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
                  Date:{' '}
                  {dateType === 'range' && rangeDates?.[0] && rangeDates?.[1]
                    ? `${rangeDates[0].format('YYYY-MM-DD')} to ${rangeDates[1].format('YYYY-MM-DD')}`
                    : dateType}
                </Tag>
              )}
              {status && status !== 'all' && (
                <Tag
                  closable
                  onClose={() => setStatus('all')}
                  color={status === '1' ? 'green' : 'orange'}
                  style={{ borderRadius: 6, fontWeight: 500 }}
                >
                  Status: {status === '1' ? 'Online / Active' : 'Offline / Inactive'}
                </Tag>
              )}
              {deactivateStatus && deactivateStatus !== 'all' && (
                <Tag
                  closable
                  onClose={() => setDeactivateStatus('all')}
                  color={deactivateStatus === '1' ? 'red' : 'green'}
                  style={{ borderRadius: 6, fontWeight: 500 }}
                >
                  Account: {deactivateStatus === '1' ? 'Blocked' : 'Active'}
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

        {/* Riders Table */}
        <Table
          columns={columns}
          dataSource={riders}
          loading={loading}
          rowKey={(record) => record.rider_id || record.user_id || record.id || record.custom_id}
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
            showTotal: (totalCount, range) => `${range[0]}-${range[1]} of ${totalCount} riders`,
          }}
          scroll={{ x: 'max-content' }}
        />
      </div>

      {/* Block Rider Modal Form */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#dc2626' }}>
            <StopOutlined style={{ fontSize: 18 }} />
            <span>Block Delivery Rider</span>
          </div>
        }
        open={blockModalVisible}
        onCancel={() => {
          if (!blockLoading) {
            setBlockModalVisible(false);
            setSelectedRiderForBlock(null);
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
            Confirm & Block Rider
          </Button>,
        ]}
        destroyOnClose
      >
        {selectedRiderForBlock && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ padding: '10px 14px', background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
              <div style={{ fontWeight: 600, color: '#0f172a', fontSize: 14 }}>
                {`${selectedRiderForBlock.firstname || ''} ${selectedRiderForBlock.lastname || ''}`.trim() || 'Unnamed Rider'}
              </div>
              <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                Custom ID: <strong>{selectedRiderForBlock.custom_id || `RID#${selectedRiderForBlock.rider_id || selectedRiderForBlock.user_id}`}</strong>
                {' • '}Plate: <strong>{selectedRiderForBlock.vehicle_registration_number || 'N/A'}</strong>
              </div>
            </div>

            <Alert
              type="warning"
              showIcon
              message="Rider will be blocked from platform"
              description="Blocking this rider will immediately suspend their account, log them out, prevent them from going online, and stop dispatching any new orders to them."
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
                  { label: 'Policy Violation (Breach of Platform Delivery Terms)', value: 'Policy Violation' },
                  { label: 'Dangerous / Reckless Driving Complaints', value: 'Reckless Driving' },
                  { label: 'Expired Driving License or Vehicle Registration', value: 'Documentation Expired' },
                  { label: 'Multiple Customer Complaints / Low Ratings', value: 'Customer Complaints' },
                  { label: 'Cash on Delivery (COD) Discrepancy / Unsettled Cash', value: 'Cash Discrepancy' },
                  { label: 'Repeated Order Rejections or Delivery Delays', value: 'Repeated Delays' },
                  { label: 'Suspicious Activity / Fraudulent Location Spoofing', value: 'Fraud/Suspicious Activity' },
                  { label: 'Rider Requested Temporary Block', value: 'Rider Requested' },
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
                placeholder="Enter details about why this rider is being blocked..."
                value={blockRemarks}
                onChange={(e) => setBlockRemarks(e.target.value)}
              />
            </div>
          </div>
        )}
      </Modal>

      {/* Unblock Rider Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#16a34a' }}>
            <CheckCircleOutlined style={{ fontSize: 18 }} />
            <span>Unblock & Reactivate Rider</span>
          </div>
        }
        open={unblockModalVisible}
        onCancel={() => {
          if (!unblockLoading) {
            setUnblockModalVisible(false);
            setSelectedRiderForUnblock(null);
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
            Reactivate Rider
          </Button>,
        ]}
      >
        {selectedRiderForUnblock && (
          <p style={{ margin: 0, fontSize: 13.5 }}>
            Are you sure you want to unblock and reactivate{' '}
            <strong>
              {`${selectedRiderForUnblock.firstname || ''} ${selectedRiderForUnblock.lastname || ''}`.trim() || 'this rider'}
            </strong>
            ? Their account will be reactivated and they will be able to log in, go online, and accept delivery orders immediately.
          </p>
        )}
      </Modal>
    </div>
  );
}
