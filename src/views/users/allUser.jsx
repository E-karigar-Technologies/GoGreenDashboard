import React, { useState, useEffect, useCallback } from 'react';
import { Table, Tag, Input, Select, Button, Spin, Alert, Card, Badge, Tooltip, Drawer, Avatar } from 'antd';
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
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { fetchUsersList, getAllVendors } from '../../services/apiService';
import DateRangeSelector from '../../components/DateRangeSelector';
import { getOrderStatus, calculateOrderFinancials } from '../dashboard/ORDERS/hooks/useOrder';
import useDebounce from '../../hooks/useDebounce';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Pagination state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalUsers, setTotalUsers] = useState(0);

  // Filters state
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebounce(searchInput, 500);

  const [vendorId, setVendorId] = useState(undefined);
  const [orderStatus, setOrderStatus] = useState(undefined);
  const [roleId, setRoleId] = useState(undefined);

  // Date Filter State
  const [dateRange, setDateRange] = useState({
    preset: 'all',
    start: null,
    end: null,
  });

  // Vendors list for vendor_id filter
  const [vendorsList, setVendorsList] = useState([]);
  const [vendorsLoading, setVendorsLoading] = useState(false);

  // User detail drawer
  const [selectedUser, setSelectedUser] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

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

      if (orderStatus !== undefined && orderStatus !== null && orderStatus !== '') {
        params.order_status = orderStatus;
      }

      if (roleId !== undefined && roleId !== null && roleId !== '') {
        params.role_id = roleId;
      }

      // Date filtering logic
      if (dateRange.preset === 'today') {
        params.date_filter = 'today';
      } else if (dateRange.preset === 'custom' && dateRange.start && dateRange.end) {
        params.start_date = dateRange.start.format('YYYY-MM-DD');
        params.end_date = dateRange.end.format('YYYY-MM-DD');
      } else if (dateRange.start && dateRange.end) {
        params.start_date = dateRange.start.format('YYYY-MM-DD');
        params.end_date = dateRange.end.format('YYYY-MM-DD');
      } else if (dateRange.preset && dateRange.preset !== 'all') {
        params.date_filter = dateRange.preset;
      }

      const res = await fetchUsersList(params);

      if (res.success) {
        const rawUsers = res.data || [];
        // Sort users in DESCENDING order (newest/highest ID first)
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

        setUsers(rawUsers);
        setTotalUsers(res.pagination?.totalUsers || rawUsers.length);
      } else {
        setUsers([]);
        setError(res.error || 'Failed to fetch users list');
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
      setError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  }, [page, limit, debouncedSearch, vendorId, orderStatus, roleId, dateRange]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, vendorId, orderStatus, roleId, dateRange]);

  const resetAllFilters = () => {
    setSearchInput('');
    setVendorId(undefined);
    setOrderStatus(undefined);
    setRoleId(undefined);
    setDateRange({ preset: 'all', start: null, end: null });
    setPage(1);
  };

  // Stat Counters
  const activeCount = users.filter((u) => u.status === 1 || u.is_verified === 1 || u.active === 1).length;
  const inactiveCount = Math.max(0, users.length - activeCount);

  const columns = [
    {
      title: 'User ID',
      key: 'userId',
      width: 130,
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
        const fullName = [record.firstname || record.first_name, record.lastname || record.last_name]
          .filter(Boolean)
          .join(' ') || record.name || record.username || 'Unnamed User';
        const initial = fullName ? fullName.charAt(0).toUpperCase() : 'U';

        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Avatar
              size={48}
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
              <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '14.5px' }}>
                {fullName}
              </div>
              {record.username && (
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 1 }}>
                  @{record.username}
                </div>
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2, fontSize: '12.5px' }}>
            {phone && (
              <span style={{ fontWeight: 500, color: '#0f172a' }}>
                <PhoneOutlined style={{ color: '#0284c7', marginRight: 5 }} />
                {phone}
              </span>
            )}
            {email && (
              <span style={{ color: '#64748b', wordBreak: 'break-all' }}>
                <MailOutlined style={{ color: '#088b46', marginRight: 5 }} />
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
      width: 140,
      render: (_, record) => {
        const rName = record.role_name || (record.role_id === 1 ? 'Super Admin' : record.role_id === 2 ? 'Manager' : record.role_id === 3 ? 'Vendor' : record.role_id === 4 ? 'Delivery Partner' : 'Customer');
        const color = record.role_id === 1 ? 'red' : record.role_id === 2 ? 'purple' : record.role_id === 3 ? 'gold' : record.role_id === 4 ? 'cyan' : 'blue';

        return (
          <Tag color={color} style={{ fontWeight: 700, borderRadius: 10, padding: '2px 10px' }}>
            {rName}
          </Tag>
        );
      },
    },
    {
      title: 'Orders',
      key: 'orders',
      align: 'center',
      width: 100,
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
      width: 110,
      align: 'center',
      render: (_, record) => {
        const isVer = record.status === 1 || record.is_verified === 1 || record.active === 1;
        return (
          <Tag color={isVer ? 'green' : 'volcano'} style={{ fontWeight: 700, borderRadius: 10, padding: '2px 10px' }}>
            {isVer ? 'Active' : 'Inactive'}
          </Tag>
        );
      },
    },
    {
      title: 'Action',
      key: 'action',
      width: 90,
      align: 'center',
      render: (_, record) => (
        <Tooltip title="View User Details & Orders">
          <Button
            type="primary"
            size="small"
            icon={<EyeOutlined />}
            style={{ background: '#088b46', border: 'none', borderRadius: 6, fontWeight: 600 }}
            onClick={() => {
              setSelectedUser(record);
              setDrawerOpen(true);
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
      {/* Page Header matching Vendors and Riders layout */}
      <div className="page-header-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div className="header-title-block">
          <h2>Users Management</h2>
          <p>View, monitor, and manage system user accounts, roles, vendor connections, and order histories.</p>
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

      {/* KPI Stats Grid matching Vendors & Riders pages */}
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

      {/* Filter Bar & Content Card */}
      <div className="page-content-card">
        <div style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
          <FilterOutlined style={{ color: '#088b46' }} /> Filter User Accounts
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', marginBottom: 20 }}>
          {/* Search Bar */}
          <div style={{ minWidth: 200, flex: 1 }}>
            <Input
              placeholder="Search by name, email, username, phone..."
              prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              allowClear
            />
          </div>

          {/* Vendor ID Filter */}
          <div style={{ minWidth: 180 }}>
            <Select
              showSearch
              allowClear
              loading={vendorsLoading}
              placeholder="Filter by Vendor ID"
              value={vendorId}
              onChange={(val) => setVendorId(val)}
              style={{ width: '100%' }}
              optionFilterProp="children"
            >
              {vendorsList.map((v) => (
                <Select.Option key={v.id} value={v.id}>
                  {v.name} (ID: {v.id})
                </Select.Option>
              ))}
            </Select>
          </div>

          {/* Order Status Filter */}
          <div style={{ minWidth: 160 }}>
            <Select
              allowClear
              placeholder="Filter by Order Status"
              value={orderStatus}
              onChange={(val) => setOrderStatus(val)}
              style={{ width: '100%' }}
            >
              {[0, 1, 2, 3, 4].map((code) => {
                const s = getOrderStatus(code);
                return (
                  <Select.Option key={code} value={code}>
                    {s.text}
                  </Select.Option>
                );
              })}
            </Select>
          </div>

          {/* Role Filter */}
          <div style={{ minWidth: 150 }}>
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

          {/* Date Range Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#f8fafc', padding: '4px 10px', borderRadius: 8, border: '1px solid #e2e8f0' }}>
            <CalendarOutlined style={{ color: '#088b46' }} />
            <DateRangeSelector
              preset={dateRange.preset}
              start={dateRange.start}
              end={dateRange.end}
              onChange={(newRange) => setDateRange(newRange)}
            />
          </div>

          {/* Reset Filters */}
          <Button icon={<ClearOutlined />} onClick={resetAllFilters} type="default">
            Reset
          </Button>
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
          scroll={{ x: 'max-content' }}
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

      {/* User Details Drawer */}
      <Drawer
        title="User & Associated Orders Detail"
        placement="right"
        width={480}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        {selectedUser && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingBottom: 12, borderBottom: '1px solid #f1f5f9' }}>
              <Avatar size={54} src={selectedUser.profile_pic || selectedUser.avatar} style={{ backgroundColor: '#0284c7' }}>
                {selectedUser.firstname ? selectedUser.firstname.charAt(0).toUpperCase() : 'U'}
              </Avatar>
              <div>
                <h4 style={{ margin: 0, fontWeight: 700, color: '#0f172a' }}>
                  {[selectedUser.firstname, selectedUser.lastname].filter(Boolean).join(' ') || selectedUser.name || selectedUser.username}
                </h4>
                <span style={{ fontSize: 12, color: '#64748b' }}>User ID: #{selectedUser.id}</span>
              </div>
            </div>

            <div>
              <div style={{ fontWeight: 600, color: '#64748b', fontSize: 12, marginBottom: 4 }}>Contact Info</div>
              <div><strong>Phone:</strong> {[selectedUser.prefix, selectedUser.phonenumber || selectedUser.phone].filter(Boolean).join(' ') || 'N/A'}</div>
              <div><strong>Email:</strong> {selectedUser.email || 'N/A'}</div>
            </div>

            <div>
              <div style={{ fontWeight: 600, color: '#64748b', fontSize: 12, marginBottom: 4 }}>Role & Status</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <Tag color="blue" style={{ fontWeight: 700 }}>{selectedUser.role_name || 'User'}</Tag>
                <Tag color={selectedUser.status === 1 || selectedUser.is_verified === 1 ? 'green' : 'volcano'} style={{ fontWeight: 700 }}>
                  {selectedUser.status === 1 || selectedUser.is_verified === 1 ? 'Active' : 'Inactive'}
                </Tag>
              </div>
            </div>

            <div>
              <div style={{ fontWeight: 700, color: '#0f172a', fontSize: 15, marginBottom: 8, borderBottom: '1px solid #f1f5f9', paddingBottom: 4 }}>
                Associated Orders ({(selectedUser.orders || []).length})
              </div>

              {(selectedUser.orders || []).length === 0 ? (
                <div style={{ color: '#94a3b8', fontStyle: 'italic' }}>No orders found for this user in filter.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxHeight: 420, overflowY: 'auto' }}>
                  {[...(selectedUser.orders || [])]
                    .sort((a, b) => {
                      const dateA = new Date(a.created_at || a.createdAt || a.order_date || 0).getTime();
                      const dateB = new Date(b.created_at || b.createdAt || b.order_date || 0).getTime();
                      if (dateA && dateB && !isNaN(dateA) && !isNaN(dateB) && dateA !== dateB) {
                        return dateB - dateA;
                      }
                      const idA = Number(a.order_id || a.id || 0);
                      const idB = Number(b.order_id || b.id || 0);
                      return idB - idA;
                    })
                    .map((ord, idx) => {
                      const statusObj = getOrderStatus(ord.order_status);
                      const fin = calculateOrderFinancials(ord);
                      const itemsList = ord.order_items || ord.items || ord.products || [];

                      return (
                        <Card key={idx} size="small" style={{ borderRadius: 10, background: '#ffffff', border: '1px solid #e2e8f0', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
                          {/* Order Header */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                            <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '13.5px' }}>
                              Order #{ord.order_uid || ord.order_id || ord.id}
                            </span>
                            <Tag color={statusObj.color} style={{ fontWeight: 700, margin: 0, borderRadius: 10 }}>
                              {statusObj.text}
                            </Tag>
                          </div>

                          {/* Store Name & Date */}
                          <div style={{ fontSize: 12, color: '#64748b', marginBottom: 8, display: 'flex', justifyContent: 'space-between' }}>
                            <span>Store: <strong style={{ color: '#334155' }}>{ord.store_name || ord.vendor?.store_name || ord.vendor_name || 'N/A'}</strong></span>
                            {ord.created_at && (
                              <span>{dayjs(ord.created_at).format('MMM D, YYYY h:mm A')}</span>
                            )}
                          </div>

                          {/* Items List Breakdown */}
                          {itemsList.length > 0 && (
                            <div style={{ background: '#f8fafc', padding: '8px 10px', borderRadius: 8, marginBottom: 8 }}>
                              <div style={{ fontSize: 11.5, fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                                Order Items ({itemsList.length}):
                              </div>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                {itemsList.map((item, itemIdx) => {
                                  const qty = item.quantity || item.qty || 1;
                                  const unitPrice = Number(item.price || item.unit_price || 0);
                                  const itemTotal = qty * unitPrice;
                                  const pName = item.name || item.product_name || item.title || `Item #${itemIdx + 1}`;
                                  const pImg = item.product_image || item.image || item.img;

                                  return (
                                    <div key={itemIdx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12 }}>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        {pImg ? (
                                          <img src={pImg} alt={pName} style={{ width: 24, height: 24, borderRadius: 4, objectFit: 'cover' }} />
                                        ) : (
                                          <span style={{ fontSize: 10, background: '#cbd5e1', padding: '2px 4px', borderRadius: 4, color: '#334155' }}>📦</span>
                                        )}
                                        <span style={{ fontWeight: 600, color: '#1e293b' }}>{pName}</span>
                                        <Tag color="blue" style={{ fontSize: 10, padding: '0 4px', margin: 0, borderRadius: 4 }}>
                                          x{qty}
                                        </Tag>
                                      </div>
                                      <span style={{ fontWeight: 600, color: '#475569' }}>
                                        ${itemTotal.toFixed(2)}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {/* Financial Summary */}
                          <div style={{ borderTop: '1px dashed #e2e8f0', paddingTop: 6, display: 'flex', flexDirection: 'column', gap: 2, fontSize: 12 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                              <span>Items Price:</span>
                              <strong style={{ color: '#334155' }}>${fin.itemsPrice.toFixed(2)}</strong>
                            </div>

                            {fin.deliveryCharge > 0 && (
                              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                                <span>Delivery Fee (rider_deliveryCharge):</span>
                                <span style={{ color: '#334155', fontWeight: 600 }}>${fin.deliveryCharge.toFixed(2)}</span>
                              </div>
                            )}

                            {fin.fastDeliveryCharge > 0 && (
                              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                                <span>Fast Delivery Charge:</span>
                                <span style={{ color: '#334155', fontWeight: 600 }}>${fin.fastDeliveryCharge.toFixed(2)}</span>
                              </div>
                            )}

                            {(fin.tip > 0 || fin.tipPct > 0) && (
                              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#0284c7' }}>
                                <span>Tip {fin.tipPct > 0 ? `(${fin.tipPct}%)` : ''}:</span>
                                <strong style={{ color: '#0284c7' }}>${fin.tip.toFixed(2)}</strong>
                              </div>
                            )}

                            {/* Final Amount (overall_amount) */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4, paddingTop: 4, borderTop: '1px solid #f1f5f9' }}>
                              <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '13px' }}>Final Amount:</span>
                              <strong style={{ fontSize: '15px', color: '#088b46', fontWeight: 800 }}>
                                ${fin.overall.toFixed(2)}
                              </strong>
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                </div>
              )}
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default UserList;
