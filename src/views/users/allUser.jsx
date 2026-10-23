import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Table,
  Tag,
  Input,
  Select,
  Button,
  DatePicker,
  Alert,
  Card,
  Badge,
  Tooltip,
  Drawer,
  Avatar,
  Space,
} from 'antd';
import {
  UserOutlined,
  SearchOutlined,
  ReloadOutlined,
  ShopOutlined,
  CalendarOutlined,
  FilterOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  StopOutlined,
  PhoneOutlined,
  MailOutlined,
  ClearOutlined,
  TeamOutlined,
  SortAscendingOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { fetchUsersList, getAllVendors } from '../../services/apiService';
import { getOrderStatus, calculateOrderFinancials } from '../dashboard/ORDERS/hooks/useOrder';
import useDebounce from '../../hooks/useDebounce';

const UserList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Read initial filter values from URL query parameters
  const initSearch = searchParams.get('search') || '';
  const initVendorId = searchParams.get('vendor_id') ? Number(searchParams.get('vendor_id')) : undefined;
  const initStatusStr = searchParams.get('status');
  const initStatus = initStatusStr !== null && initStatusStr !== '' ? Number(initStatusStr) : undefined;
  const initSort = searchParams.get('sort') || '';
  const initRoleId = searchParams.get('role_id') || undefined;
  const initPage = parseInt(searchParams.get('page') || '1', 10);
  const initLimit = parseInt(searchParams.get('limit') || '10', 10);

  // Date parsing from URL
  const urlDate = searchParams.get('date');
  const urlStartDate = searchParams.get('startDate');
  const urlEndDate = searchParams.get('endDate');

  let initDateType = 'all';
  let initSingleDate = null;
  let initRangeDates = null;

  if (urlStartDate && urlEndDate) {
    initDateType = 'range';
    initRangeDates = [dayjs(urlStartDate), dayjs(urlEndDate)];
  } else if (urlDate) {
    if (['today', 'yesterday', 'week', 'month', 'all'].includes(urlDate)) {
      initDateType = urlDate;
    } else {
      initDateType = 'single';
      initSingleDate = dayjs(urlDate);
    }
  }

  // Data & loading states
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Pagination states
  const [page, setPage] = useState(initPage > 0 ? initPage : 1);
  const [limit, setLimit] = useState(initLimit > 0 ? initLimit : 10);
  const [totalUsers, setTotalUsers] = useState(0);

  // Filter states
  const [searchInput, setSearchInput] = useState(initSearch);
  const debouncedSearch = useDebounce(searchInput, 400);

  const [vendorId, setVendorId] = useState(initVendorId);
  const [status, setStatus] = useState(initStatus);
  const [sort, setSort] = useState(initSort);
  const [roleId, setRoleId] = useState(initRoleId);

  // Date Filter States
  const [dateType, setDateType] = useState(initDateType);
  const [singleDate, setSingleDate] = useState(initSingleDate);
  const [rangeDates, setRangeDates] = useState(initRangeDates);

  // Vendors list for vendor_id filter
  const [vendorsList, setVendorsList] = useState([]);
  const [vendorsLoading, setVendorsLoading] = useState(false);



  // Load vendors list for dropdown
  useEffect(() => {
    const loadVendors = async () => {
      setVendorsLoading(true);
      try {
        const res = await getAllVendors(true);
        if (res && res.success && Array.isArray(res.data)) {
          setVendorsList(res.data.map((v) => ({ id: v.vendor_id || v.id, name: v.store_name || v.name })));
        } else if (Array.isArray(res)) {
          setVendorsList(res.map((v) => ({ id: v.vendor_id || v.id, name: v.store_name || v.name })));
        }
      } catch (err) {
        console.error('Failed loading vendors for filter:', err);
      } finally {
        setVendorsLoading(false);
      }
    };
    loadVendors();
  }, []);

  // Sync state with URL search params
  const updateUrlParams = useCallback(
    (newParams) => {
      const p = new URLSearchParams();
      if (newParams.search) p.set('search', newParams.search);
      if (newParams.dateType === 'range' && newParams.rangeDates?.[0] && newParams.rangeDates?.[1]) {
        p.set('startDate', dayjs(newParams.rangeDates[0]).format('YYYY-MM-DD'));
        p.set('endDate', dayjs(newParams.rangeDates[1]).format('YYYY-MM-DD'));
      } else if (newParams.dateType === 'single' && newParams.singleDate) {
        p.set('date', dayjs(newParams.singleDate).format('YYYY-MM-DD'));
      } else if (['today', 'yesterday', 'week', 'month'].includes(newParams.dateType)) {
        p.set('date', newParams.dateType);
      }
      if (newParams.status !== undefined && newParams.status !== null && newParams.status !== '') {
        p.set('status', newParams.status);
      }
      if (newParams.vendorId) p.set('vendor_id', newParams.vendorId);
      if (newParams.sort) p.set('sort', newParams.sort);
      if (newParams.roleId) p.set('role_id', newParams.roleId);
      if (newParams.page > 1) p.set('page', newParams.page);
      if (newParams.limit !== 10) p.set('limit', newParams.limit);

      setSearchParams(p, { replace: true });
    },
    [setSearchParams]
  );

  // Fetch users with dynamic query parameters
  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page,
        limit,
      };

      if (debouncedSearch && debouncedSearch.trim()) {
        params.search = debouncedSearch.trim();
      }

      if (vendorId !== undefined && vendorId !== null && vendorId !== '') {
        params.vendor_id = vendorId;
      }

      if (status !== undefined && status !== null && status !== '') {
        params.status = status;
      }

      if (sort) {
        params.sort = sort;
      }

      if (roleId !== undefined && roleId !== null && roleId !== '') {
        params.role_id = roleId;
      }

      // Date filtering logic matching API specification
      if (['today', 'yesterday', 'week', 'month'].includes(dateType)) {
        params.date = dateType;
      } else if (dateType === 'single' && singleDate) {
        params.date = dayjs(singleDate).format('YYYY-MM-DD');
      } else if (dateType === 'range' && rangeDates?.[0] && rangeDates?.[1]) {
        params.startDate = dayjs(rangeDates[0]).format('YYYY-MM-DD');
        params.endDate = dayjs(rangeDates[1]).format('YYYY-MM-DD');
      }

      const res = await fetchUsersList(params);

      if (res.success) {
        const rawUsers = res.data || [];
        // Only apply client-side date/id sorting if server sort (e.g. a-z) is NOT requested
        if (!sort) {
          rawUsers.sort((a, b) => {
            const dateA = new Date(a.created_at || a.createdAt || 0).getTime();
            const dateB = new Date(b.created_at || b.createdAt || 0).getTime();
            if (dateA && dateB && !isNaN(dateA) && !isNaN(dateB) && dateA !== dateB) {
              return dateB - dateA;
            }
            const idA = Number(a.id || a.user_id || 0);
            const idB = Number(b.id || b.user_id || 0);
            return idB - idA;
          });
        }

        setUsers(rawUsers);
        setTotalUsers(res.total ?? res.pagination?.totalUsers ?? rawUsers.length);
      } else {
        setUsers([]);
        setError(res.error || 'Failed to fetch users list');
        setTotalUsers(0);
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
      setError(err.message || String(err));
      setUsers([]);
      setTotalUsers(0);
    } finally {
      setLoading(false);
    }
  }, [page, limit, debouncedSearch, vendorId, status, sort, roleId, dateType, singleDate, rangeDates]);

  useEffect(() => {
    loadUsers();
    updateUrlParams({
      search: debouncedSearch,
      dateType,
      singleDate,
      rangeDates,
      status,
      vendorId,
      sort,
      roleId,
      page,
      limit,
    });
  }, [loadUsers, updateUrlParams]);

  // Reset page to 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, vendorId, status, sort, roleId, dateType, singleDate, rangeDates]);

  const resetAllFilters = () => {
    setSearchInput('');
    setVendorId(undefined);
    setStatus(undefined);
    setSort('');
    setRoleId(undefined);
    setDateType('all');
    setSingleDate(null);
    setRangeDates(null);
    setPage(1);
  };

  // Active filter count
  let activeFilterCount = 0;
  if (searchInput) activeFilterCount++;
  if (dateType && dateType !== 'all') activeFilterCount++;
  if (status !== undefined && status !== null && status !== '') activeFilterCount++;
  if (vendorId !== undefined && vendorId !== null && vendorId !== '') activeFilterCount++;
  if (sort) activeFilterCount++;
  if (roleId !== undefined && roleId !== null && roleId !== '') activeFilterCount++;

  // Stat Counters
  const activeCount = users.filter((u) => u.status === 1 || u.is_verified === 1 || u.active === 1).length;
  const inactiveCount = Math.max(0, users.length - activeCount);

  const selectedVendor = vendorsList.find((v) => String(v.id) === String(vendorId));

  const columns = [
    {
      title: 'User ID',
      key: 'userId',
      width: 110,
      render: (_, record) => (
        <Tag color="blue" style={{ borderRadius: '6px', fontWeight: 600, padding: '2px 8px' }}>
          #{record.id || record.user_id || '-'}
        </Tag>
      ),
    },
    {
      title: 'User Details',
      key: 'user',
      render: (_, record) => {
        const fullName =
          [record.firstname || record.first_name, record.lastname || record.last_name]
            .filter(Boolean)
            .join(' ') || record.name || record.username || 'Unnamed User';
        const initial = fullName ? fullName.charAt(0).toUpperCase() : 'U';

        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Avatar
              size={40}
              src={record.profile_pic || record.avatar}
              alt="user"
              style={{
                border: '2px solid #e2e8f0',
                boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
                backgroundColor: '#0284c7',
                flexShrink: 0,
              }}
            >
              {initial}
            </Avatar>
            <div>
              <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '13.5px' }}>{fullName}</div>
              {record.username && (
                <div style={{ fontSize: 11.5, color: '#64748b' }}>@{record.username}</div>
              )}
            </div>
          </div>
        );
      },
    },
    {
      title: 'Contact Info',
      key: 'contact',
      render: (_, record) => {
        const phone = [record.prefix, record.phonenumber || record.phone].filter(Boolean).join(' ');
        const email = record.email;

        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2, fontSize: '12px' }}>
            {phone && (
              <span style={{ fontWeight: 500, color: '#0f172a' }}>
                <PhoneOutlined style={{ color: '#0284c7', marginRight: 4 }} />
                {phone}
              </span>
            )}
            {email && (
              <span style={{ color: '#64748b', wordBreak: 'break-all' }}>
                <MailOutlined style={{ color: '#088b46', marginRight: 4 }} />
                {email}
              </span>
            )}
          </div>
        );
      },
    },
    {
      title: 'Role',
      key: 'role',
      width: 130,
      render: (_, record) => {
        const rName =
          record.role_name ||
          (record.role_id === 1
            ? 'Super Admin'
            : record.role_id === 2
            ? 'Manager'
            : record.role_id === 3
            ? 'Vendor'
            : record.role_id === 4
            ? 'Delivery Partner'
            : 'Customer');
        const color =
          record.role_id === 1
            ? 'red'
            : record.role_id === 2
            ? 'purple'
            : record.role_id === 3
            ? 'gold'
            : record.role_id === 4
            ? 'cyan'
            : 'blue';

        return (
          <Tag color={color} style={{ fontWeight: 700, borderRadius: 10, padding: '2px 8px', fontSize: '11px' }}>
            {rName}
          </Tag>
        );
      },
    },
    {
      title: 'Orders',
      key: 'orders',
      align: 'center',
      width: 85,
      render: (_, record) => {
        const ordersList = record.orders || [];
        return (
          <Badge
            count={ordersList.length}
            showZero
            style={{ backgroundColor: ordersList.length > 0 ? '#088b46' : '#94a3b8', fontWeight: 700 }}
          />
        );
      },
    },
    {
      title: 'Status',
      key: 'status',
      width: 95,
      align: 'center',
      render: (_, record) => {
        const isVer = record.status === 1 || record.is_verified === 1 || record.active === 1;
        return (
          <Tag color={isVer ? 'green' : 'volcano'} style={{ fontWeight: 700, borderRadius: 10, padding: '2px 8px', fontSize: '11px' }}>
            {isVer ? 'Active' : 'Inactive'}
          </Tag>
        );
      },
    },
    {
      title: 'Action',
      key: 'action',
      width: 80,
      align: 'center',
      render: (_, record) => (
        <Tooltip title="View Customer Profile, Total Spend & Orders">
          <Button
            type="primary"
            size="small"
            icon={<EyeOutlined />}
            style={{ background: '#088b46', border: 'none', borderRadius: 6, fontWeight: 600, fontSize: '11.5px' }}
            onClick={() => {
              navigate(`/users/${record.id || record.user_id}`, {
                state: { user: record },
              });
            }}
          >
            View
          </Button>
        </Tooltip>
      ),
    },
  ];

  return (
    <div className="page-container">
      {/* Page Header */}
      <div className="page-header-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div className="header-title-block">
          <h2>Users Management</h2>
          <p>Search, filter by vendor, date, order status, role, and manage user accounts and order histories.</p>
        </div>
        <Button
          icon={<ReloadOutlined spin={loading} />}
          onClick={loadUsers}
          type="primary"
          style={{ background: '#088b46', border: 'none', borderRadius: 8, fontWeight: 600 }}
        >
          Refresh Users
        </Button>
      </div>

      {/* KPI Stats Grid */}
      <div className="page-stats-grid">
        <div className="page-stat-card">
          <div className="stat-meta">
            <div className="stat-label">Total Users</div>
            <div className="stat-number">{totalUsers || users.length}</div>
          </div>
          <div className="stat-icon" style={{ background: '#e0f2fe', color: '#0284c7' }}>
            <TeamOutlined />
          </div>
        </div>

        <div className="page-stat-card">
          <div className="stat-meta">
            <div className="stat-label">Active Users</div>
            <div className="stat-number" style={{ color: '#16a34a' }}>{activeCount}</div>
          </div>
          <div className="stat-icon" style={{ background: '#dcfce7', color: '#16a34a' }}>
            <CheckCircleOutlined />
          </div>
        </div>

        <div className="page-stat-card">
          <div className="stat-meta">
            <div className="stat-label">Inactive Users</div>
            <div className="stat-number" style={{ color: '#dc2626' }}>{inactiveCount}</div>
          </div>
          <div className="stat-icon" style={{ background: '#fef2f2', color: '#dc2626' }}>
            <StopOutlined />
          </div>
        </div>

        <div className="page-stat-card">
          <div className="stat-meta">
            <div className="stat-label">Page Count</div>
            <div className="stat-number">{users.length}</div>
          </div>
          <div className="stat-icon" style={{ background: '#f3e8ff', color: '#9333ea' }}>
            <UserOutlined />
          </div>
        </div>
      </div>

      {/* Filter Bar Card */}
      <div className="page-content-card">
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: 12,
            padding: 16,
            marginBottom: 20,
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}
        >
          {/* Row 1: Search, Date Filter, Order Status, Alphabetical Sort */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
            {/* Search Input: name, email, phone, or store */}
            <div style={{ minWidth: 240, flex: 1 }}>
              <Input
                placeholder="Search by name, email, phone, or store..."
                prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                allowClear
              />
            </div>

            {/* Date Preset Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <Select
                value={dateType}
                onChange={(val) => {
                  setDateType(val);
                  if (val !== 'single') setSingleDate(null);
                  if (val !== 'range') setRangeDates(null);
                }}
                style={{ width: 140 }}
                suffixIcon={<CalendarOutlined style={{ color: '#0284c7' }} />}
                options={[
                  { label: 'All Time', value: 'all' },
                  { label: 'Today', value: 'today' },
                  { label: 'Yesterday', value: 'yesterday' },
                  { label: 'This Week', value: 'week' },
                  { label: 'This Month', value: 'month' },
                  { label: 'Specific Date', value: 'single' },
                  { label: 'Custom Range', value: 'range' },
                ]}
              />

              {dateType === 'single' && (
                <DatePicker
                  value={singleDate}
                  onChange={(date) => setSingleDate(date)}
                  format="YYYY-MM-DD"
                  placeholder="Select Date"
                  allowClear={false}
                  style={{ width: 140 }}
                />
              )}

              {dateType === 'range' && (
                <DatePicker.RangePicker
                  value={rangeDates}
                  onChange={(dates) => setRangeDates(dates)}
                  format="YYYY-MM-DD"
                  allowClear={false}
                  style={{ width: 230 }}
                />
              )}
            </div>

            {/* Order Status Filter */}
            <div style={{ minWidth: 160 }}>
              <Select
                allowClear
                placeholder="Filter by Order Status"
                value={status}
                onChange={(val) => setStatus(val !== undefined ? val : undefined)}
                style={{ width: '100%' }}
              >
                {[0, 1, 2, 3, 4, 5].map((code) => {
                  const s = getOrderStatus(code);
                  return (
                    <Select.Option key={code} value={code}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                        <span
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            backgroundColor:
                              code === 4
                                ? '#22c55e'
                                : code === 0
                                ? '#f59e0b'
                                : code === 1
                                ? '#3b82f6'
                                : code === 2
                                ? '#a855f7'
                                : '#ef4444',
                          }}
                        />
                        {s.text}
                      </span>
                    </Select.Option>
                  );
                })}
              </Select>
            </div>

            {/* Alphabetical Sort */}
            <div style={{ minWidth: 150 }}>
              <Select
                value={sort || ''}
                onChange={(val) => setSort(val || '')}
                style={{ width: '100%' }}
                suffixIcon={<SortAscendingOutlined style={{ color: '#088b46' }} />}
                options={[
                  { label: 'Default Sort', value: '' },
                  { label: 'Name (A - Z)', value: 'a-z' },
                  { label: 'Name (Z - A)', value: 'z-a' },
                ]}
              />
            </div>
          </div>

          {/* Row 2: Vendor Filter, Role Filter, Reset Button */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', paddingTop: 2 }}>
            {/* Vendor Filter */}
            <div style={{ minWidth: 200, flex: '1 1 200px' }}>
              <Select
                showSearch
                allowClear
                loading={vendorsLoading}
                placeholder="Filter by Vendor (store or ID)"
                value={vendorId}
                onChange={(val) => setVendorId(val)}
                style={{ width: '100%' }}
                optionFilterProp="children"
                filterOption={(input, option) =>
                  (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
                suffixIcon={<ShopOutlined style={{ color: '#d97706' }} />}
                options={vendorsList.map((v) => ({
                  value: v.id,
                  label: `${v.name} (ID: ${v.id})`,
                }))}
              />
            </div>

            {/* Role Filter */}
            <div style={{ minWidth: 160 }}>
              <Select
                allowClear
                placeholder="Filter by Role"
                value={roleId}
                onChange={(val) => setRoleId(val)}
                style={{ width: '100%' }}
              >
                <Select.Option value="1">Super Admin</Select.Option>
                <Select.Option value="2">Manager</Select.Option>
                <Select.Option value="3">Vendor</Select.Option>
                <Select.Option value="4">Delivery Partner</Select.Option>
              </Select>
            </div>

            {/* Reset Filters */}
            <Button
              icon={<ClearOutlined />}
              onClick={resetAllFilters}
              type="default"
              disabled={activeFilterCount === 0}
              style={{ borderRadius: 6 }}
            >
              Reset Filters
            </Button>
          </div>

          {/* Row 3: Active Filters Tags */}
          {activeFilterCount > 0 && (
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 8,
                alignItems: 'center',
                paddingTop: 8,
                borderTop: '1px dashed #e2e8f0',
                marginTop: 2,
              }}
            >
              <span style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>Active Filters:</span>

              {searchInput && (
                <Tag closable onClose={() => setSearchInput('')} color="blue">
                  Search: {searchInput}
                </Tag>
              )}

              {dateType && dateType !== 'all' && (
                <Tag closable onClose={() => setDateType('all')} color="cyan">
                  Date:{' '}
                  {dateType === 'today'
                    ? 'Today'
                    : dateType === 'yesterday'
                    ? 'Yesterday'
                    : dateType === 'week'
                    ? 'This Week'
                    : dateType === 'month'
                    ? 'This Month'
                    : dateType === 'single' && singleDate
                    ? dayjs(singleDate).format('YYYY-MM-DD')
                    : dateType === 'range' && rangeDates?.[0] && rangeDates?.[1]
                    ? `${dayjs(rangeDates[0]).format('YYYY-MM-DD')} to ${dayjs(rangeDates[1]).format('YYYY-MM-DD')}`
                    : dateType}
                </Tag>
              )}

              {status !== undefined && status !== null && status !== '' && (
                <Tag closable onClose={() => setStatus(undefined)} color="orange">
                  Order Status: {getOrderStatus(status).text}
                </Tag>
              )}

              {vendorId !== undefined && vendorId !== null && vendorId !== '' && (
                <Tag closable onClose={() => setVendorId(undefined)} color="gold">
                  Vendor: {selectedVendor ? selectedVendor.name : `#${vendorId}`}
                </Tag>
              )}

              {sort && (
                <Tag closable onClose={() => setSort('')} color="green">
                  Sort: {sort === 'a-z' ? 'A - Z' : sort === 'z-a' ? 'Z - A' : sort}
                </Tag>
              )}

              {roleId && (
                <Tag closable onClose={() => setRoleId(undefined)} color="purple">
                  Role: {roleId === '1' ? 'Super Admin' : roleId === '2' ? 'Manager' : roleId === '3' ? 'Vendor' : 'Delivery Partner'}
                </Tag>
              )}

              <Button
                type="link"
                size="small"
                onClick={resetAllFilters}
                style={{ fontSize: 11.5, padding: 0, height: 'auto', color: '#ef4444' }}
              >
                Clear all
              </Button>
            </div>
          )}
        </div>

        {error && (
          <Alert
            type="error"
            message="Error fetching users"
            description={String(error)}
            showIcon
            action={
              <Button size="small" type="primary" danger onClick={loadUsers}>
                Retry
              </Button>
            }
            style={{ marginBottom: 16, borderRadius: 8 }}
          />
        )}

        <Table
          columns={columns}
          dataSource={users}
          rowKey={(record) => record.id || record.username}
          loading={loading}
          pagination={{
            current: page,
            pageSize: limit,
            total: totalUsers,
            onChange: (p, pSize) => {
              setPage(p);
              setLimit(pSize);
            },
            showSizeChanger: true,
            pageSizeOptions: ['5', '10', '25', '50', '100'],
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} users`,
          }}
        />
      </div>

    </div>
  );
};

export default UserList;
