import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Card,
  Row,
  Col,
  Tag,
  Badge,
  Button,
  Avatar,
  Table,
  Tabs,
  Input,
  Tooltip,
  Divider,
  Spin,
  Alert,
  Switch,
  Modal,
  Descriptions,
  message,
  Empty,
  Pagination,
  Segmented,
} from 'antd';
import {
  ArrowLeftOutlined,
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  ShoppingOutlined,
  DollarOutlined,
  ReloadOutlined,
  ShopOutlined,
  EyeOutlined,
  SearchOutlined,
  CompassOutlined,
  RiseOutlined,
  TableOutlined,
  AppstoreOutlined,
  CopyOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import {
  getUserDetailsById,
  getAllUserDetails,
  updateUserActiveStatus,
} from '../../../services/apiService';
import {
  calculateOrderFinancials,
  getOrderStatus,
} from '../../dashboard/ORDERS/hooks/useOrder';

const SingleUser = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(location.state?.user || null);
  const [error, setError] = useState(null);
  const [statusUpdating, setStatusUpdating] = useState(false);

  // Orders display and filtering state
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'cards'
  const [activeTab, setActiveTab] = useState('all');
  const [orderSearch, setOrderSearch] = useState('');
  const [orderPage, setOrderPage] = useState(1);
  const [orderPageSize, setOrderPageSize] = useState(10);

  // Detail Modal state
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderModalVisible, setOrderModalVisible] = useState(false);

  const userId = id || user?.id || user?.user_id;

  const loadUserData = useCallback(async () => {
    if (!userId) {
      setError('No user ID provided.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch user with orders
      const userRes = await getUserDetailsById(userId);
      let userData = userRes.success && userRes.data ? userRes.data : null;

      // Fetch extended profile details (DOB, address, coordinates, gender)
      try {
        const detailsRes = await getAllUserDetails();
        if (detailsRes.success && Array.isArray(detailsRes.data)) {
          const detailMatch = detailsRes.data.find(
            (u) => Number(u.id) === Number(userId)
          );
          if (detailMatch) {
            userData = {
              ...(userData || {}),
              ...detailMatch,
              orders: userData?.orders || detailMatch.orders || [],
            };
          }
        }
      } catch (e) {
        console.warn('Could not load extended profile details:', e);
      }

      if (userData) {
        setUser(userData);
      } else if (!user) {
        setError('User not found.');
      }
    } catch (err) {
      console.error('Failed to load user details:', err);
      setError(err.message || 'Failed to load user data.');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  // Handle active status toggle
  const handleStatusToggle = async (checked) => {
    try {
      setStatusUpdating(true);
      const newStatus = checked ? 1 : 0;
      const res = await updateUserActiveStatus(userId, newStatus);
      if (res.success || res.status) {
        message.success(`User marked as ${checked ? 'Active' : 'Inactive'}`);
        setUser((prev) => ({
          ...prev,
          status: newStatus,
          is_verified: newStatus,
          active: newStatus,
        }));
      } else {
        message.error(res.error || 'Failed to update user status');
      }
    } catch (err) {
      message.error(err.message || 'Failed to update status');
    } finally {
      setStatusUpdating(false);
    }
  };

  // Extract all orders sorted descending by date/id
  const ordersList = useMemo(() => {
    const raw = user?.orders || [];
    return [...raw].sort((a, b) => {
      const dateA = new Date(
        a.created_at || a.createdAt || a.order_date || 0
      ).getTime();
      const dateB = new Date(
        b.created_at || b.createdAt || b.order_date || 0
      ).getTime();
      if (dateA && dateB && !isNaN(dateA) && !isNaN(dateB) && dateA !== dateB) {
        return dateB - dateA;
      }
      return Number(b.id || b.order_id || 0) - Number(a.id || a.order_id || 0);
    });
  }, [user]);

  // Financial Calculations & Total Spend
  const financials = useMemo(() => {
    let totalSpend = 0;
    let deliveredSpend = 0;
    let deliveredCount = 0;
    let cancelledCount = 0;
    let pendingCount = 0;
    let totalItemsPurchased = 0;

    ordersList.forEach((ord) => {
      const fin = calculateOrderFinancials(ord);
      const isDelivered = Number(ord.order_status) === 4;
      const isCancelled =
        Number(ord.order_status) === 3 || Number(ord.order_status) === 5;

      const items = ord.products || ord.order_items || ord.items || [];
      const orderQty = items.reduce(
        (sum, itm) => sum + Number(itm.quantity || itm.qty || 1),
        0
      );
      totalItemsPurchased += orderQty || Number(ord.total_quantity || 1);

      if (isDelivered) {
        deliveredCount += 1;
        deliveredSpend += fin.overall;
      } else if (isCancelled) {
        cancelledCount += 1;
      } else {
        pendingCount += 1;
      }

      // Total lifetime spend (excluding cancelled orders, or all placed)
      if (!isCancelled) {
        totalSpend += fin.overall;
      }
    });

    const totalOrders = ordersList.length;
    const aov =
      totalOrders > 0
        ? totalSpend / (totalOrders - cancelledCount > 0 ? totalOrders - cancelledCount : 1)
        : 0;
    const latestOrder = ordersList[0];

    return {
      totalSpend,
      deliveredSpend,
      totalOrders,
      deliveredCount,
      cancelledCount,
      pendingCount,
      totalItemsPurchased,
      aov,
      latestOrderDate: latestOrder?.created_at || latestOrder?.order_date || null,
    };
  }, [ordersList]);

  // Filtered orders list based on tab and search
  const filteredOrders = useMemo(() => {
    return ordersList.filter((ord) => {
      const st = Number(ord.order_status);
      if (activeTab === 'delivered' && st !== 4) return false;
      if (activeTab === 'pending' && (st === 4 || st === 3 || st === 5)) return false;
      if (activeTab === 'cancelled' && st !== 3 && st !== 5) return false;

      if (orderSearch.trim()) {
        const query = orderSearch.toLowerCase().trim();
        const orderIdMatch = String(ord.order_uid || ord.id || '').toLowerCase().includes(query);
        const storeMatch = String(
          ord.store_name || ord.vendor?.store_name || ord.vendor_name || ''
        ).toLowerCase().includes(query);
        const productMatch = (ord.products || []).some((p) =>
          String(p.name || p.product_name || '').toLowerCase().includes(query)
        );
        return orderIdMatch || storeMatch || productMatch;
      }

      return true;
    });
  }, [ordersList, activeTab, orderSearch]);

  // Paginated slice for cards view
  const paginatedOrders = useMemo(() => {
    const start = (orderPage - 1) * orderPageSize;
    return filteredOrders.slice(start, start + orderPageSize);
  }, [filteredOrders, orderPage, orderPageSize]);

  // Reset page when filter tab or search query changes
  useEffect(() => {
    setOrderPage(1);
  }, [activeTab, orderSearch]);

  const fullName =
    [user?.firstname, user?.lastname].filter(Boolean).join(' ') ||
    user?.name ||
    user?.username ||
    `User #${userId}`;

  const isActive =
    user?.status === 1 ||
    user?.is_verified === 1 ||
    user?.active === 1;

  const roleName =
    user?.role_name ||
    (user?.role_id === 1
      ? 'Super Admin'
      : user?.role_id === 2
      ? 'Manager'
      : user?.role_id === 3
      ? 'Vendor'
      : user?.role_id === 4
      ? 'Delivery Partner'
      : 'Customer');

  // Table Columns Definition
  const tableColumns = [
    {
      title: 'Order ID',
      key: 'order_id',
      width: 170,
      render: (_, ord) => {
        const uid = ord.order_uid || ord.id;
        return (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '13px' }}>
                #{uid}
              </span>
              <Tooltip title="Copy Order ID">
                <Button
                  type="text"
                  size="small"
                  icon={<CopyOutlined style={{ fontSize: 11, color: '#94a3b8' }} />}
                  style={{ padding: 0, width: 20, height: 20 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigator.clipboard.writeText(String(uid));
                    message.success('Order ID copied');
                  }}
                />
              </Tooltip>
            </div>
            <div style={{ display: 'flex', gap: 4, marginTop: 4, flexWrap: 'wrap' }}>
              {ord.payment_method && (
                <Tag color="default" style={{ fontSize: '10.5px', padding: '0 5px', margin: 0, borderRadius: 4 }}>
                  {ord.payment_method}
                </Tag>
              )}
              {ord.is_fast_delivery === 1 && (
                <Tag color="magenta" style={{ fontSize: '10.5px', padding: '0 5px', margin: 0, borderRadius: 4 }}>
                  ⚡ Fast
                </Tag>
              )}
            </div>
          </div>
        );
      },
    },
    {
      title: 'Date & Time',
      key: 'date',
      width: 140,
      render: (_, ord) => (
        <div style={{ fontSize: '12px', color: '#475569' }}>
          <div>{ord.created_at ? dayjs(ord.created_at).format('MMM D, YYYY') : 'N/A'}</div>
          <div style={{ color: '#94a3b8', fontSize: '11px' }}>
            {ord.created_at ? dayjs(ord.created_at).format('h:mm A') : ''}
          </div>
        </div>
      ),
    },
    {
      title: 'Store / Vendor',
      key: 'store',
      render: (_, ord) => (
        <div style={{ fontSize: '12.5px' }}>
          <div style={{ fontWeight: 600, color: '#1e293b', display: 'flex', alignItems: 'center', gap: 6 }}>
            <ShopOutlined style={{ color: '#088b46' }} />
            <span>{ord.store_name || ord.vendor?.store_name || ord.vendor_name || 'Store'}</span>
          </div>
          {ord.delivery_address?.address && (
            <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: 2, maxWidth: 260, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              📍 {ord.delivery_address.address}
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Items',
      key: 'items',
      width: 180,
      render: (_, ord) => {
        const items = ord.products || ord.order_items || ord.items || [];
        if (!items.length) {
          return <span style={{ color: '#94a3b8', fontSize: '12px' }}>{ord.total_quantity || 1} Item(s)</span>;
        }

        const firstItem = items[0];
        const firstName = firstItem.name || firstItem.product_name || 'Product';
        const extraCount = items.length - 1;

        return (
          <div style={{ fontSize: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontWeight: 600, color: '#334155' }}>{firstName}</span>
              <Tag color="blue" style={{ fontSize: '10px', padding: '0 4px', margin: 0, borderRadius: 4 }}>
                x{firstItem.quantity || firstItem.qty || 1}
              </Tag>
            </div>
            {extraCount > 0 && (
              <div style={{ color: '#64748b', fontSize: '11px', marginTop: 2 }}>
                +{extraCount} more item{extraCount > 1 ? 's' : ''}
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: 'Status',
      key: 'status',
      width: 130,
      align: 'center',
      render: (_, ord) => {
        const statusObj = getOrderStatus(ord.order_status);
        return (
          <Tag color={statusObj.color} style={{ fontWeight: 700, borderRadius: 10, padding: '2px 8px', fontSize: '11.5px' }}>
            {statusObj.text}
          </Tag>
        );
      },
    },
    {
      title: 'Total Amount',
      key: 'amount',
      width: 120,
      align: 'right',
      render: (_, ord) => {
        const fin = calculateOrderFinancials(ord);
        return (
          <strong style={{ fontSize: '14.5px', color: '#088b46', fontWeight: 800 }}>
            ${fin.overall.toFixed(2)}
          </strong>
        );
      },
    },
    {
      title: 'Action',
      key: 'action',
      width: 90,
      align: 'center',
      render: (_, ord) => (
        <Button
          size="small"
          icon={<EyeOutlined />}
          onClick={() => {
            setSelectedOrder(ord);
            setOrderModalVisible(true);
          }}
          style={{ borderRadius: 6, fontWeight: 600, fontSize: '11.5px' }}
        >
          Details
        </Button>
      ),
    },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '20px 24px' }}>
      {/* Centered responsive container prevents infinite stretching on ultra-wide screens */}
      <div style={{ maxWidth: 1560, margin: '0 auto', width: '100%' }}>
        {/* Top Header & Breadcrumb Bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 12,
            marginBottom: 20,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate('/all-users')}
              style={{
                borderRadius: 8,
                fontWeight: 600,
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              }}
            >
              Back to Users
            </Button>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#0f172a' }}>
                  {fullName}
                </h2>
                <Tag
                  color="blue"
                  style={{ fontWeight: 700, borderRadius: 12, padding: '2px 10px', fontSize: 12 }}
                >
                  {roleName}
                </Tag>
                <Tag
                  color={isActive ? 'green' : 'volcano'}
                  style={{ fontWeight: 700, borderRadius: 12, padding: '2px 10px', fontSize: 12 }}
                >
                  {isActive ? 'Active User' : 'Inactive User'}
                </Tag>
              </div>
              <span style={{ fontSize: 12.5, color: '#64748b' }}>
                Customer Profile & Orders Overview • User ID: <strong>#{userId}</strong>
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Button
              icon={<ReloadOutlined spin={loading} />}
              onClick={loadUserData}
              style={{ borderRadius: 8, fontWeight: 600 }}
            >
              Refresh Data
            </Button>
            <Button
              type="primary"
              icon={<ShoppingOutlined />}
              onClick={() => navigate(`/all-orders?search=${encodeURIComponent(user?.firstname || fullName)}`)}
              style={{
                background: '#088b46',
                border: 'none',
                borderRadius: 8,
                fontWeight: 600,
              }}
            >
              Search in All Orders
            </Button>
          </div>
        </div>

        {error && (
          <Alert
            type="error"
            message="Notice"
            description={error}
            showIcon
            style={{ marginBottom: 20, borderRadius: 8 }}
          />
        )}

        {loading && !user ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <Spin size="large" />
            <div style={{ marginTop: 16, color: '#64748b', fontWeight: 600 }}>
              Loading user profile and orders...
            </div>
          </div>
        ) : (
          <>
            {/* KPI STATS ROW */}
            <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
              {/* Total Spend */}
              <Col xs={24} sm={12} lg={6}>
                <Card
                  bordered={false}
                  style={{
                    borderRadius: 12,
                    background: 'linear-gradient(135deg, #088b46 0%, #065e2f 100%)',
                    boxShadow: '0 6px 18px rgba(8, 139, 70, 0.22)',
                    color: '#ffffff',
                    height: '100%',
                  }}
                  bodyStyle={{ padding: '18px 20px' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Total Spend
                      </div>
                      <div style={{ fontSize: 28, fontWeight: 800, marginTop: 4, color: '#ffffff', letterSpacing: '-0.5px' }}>
                        ${financials.totalSpend.toFixed(2)}
                      </div>
                      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 4 }}>
                        Across {financials.totalOrders} total order{financials.totalOrders === 1 ? '' : 's'}
                      </div>
                    </div>
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 10,
                        background: 'rgba(255,255,255,0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 22,
                      }}
                    >
                      <DollarOutlined />
                    </div>
                  </div>
                </Card>
              </Col>

              {/* Total Orders */}
              <Col xs={24} sm={12} lg={6}>
                <Card
                  bordered={false}
                  style={{
                    borderRadius: 12,
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                    height: '100%',
                  }}
                  bodyStyle={{ padding: '18px 20px' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontSize: 12, color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Total Orders
                      </div>
                      <div style={{ fontSize: 28, fontWeight: 800, marginTop: 4, color: '#0f172a' }}>
                        {financials.totalOrders}
                      </div>
                      <div style={{ fontSize: 12, color: financials.deliveredCount > 0 ? '#16a34a' : '#64748b', marginTop: 4, fontWeight: 600 }}>
                        {financials.deliveredCount} delivered successfully
                      </div>
                    </div>
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 10,
                        background: '#e0f2fe',
                        color: '#0284c7',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 20,
                      }}
                    >
                      <ShoppingOutlined />
                    </div>
                  </div>
                </Card>
              </Col>

              {/* Average Order Value (AOV) */}
              <Col xs={24} sm={12} lg={6}>
                <Card
                  bordered={false}
                  style={{
                    borderRadius: 12,
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                    height: '100%',
                  }}
                  bodyStyle={{ padding: '18px 20px' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontSize: 12, color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Avg Order Value (AOV)
                      </div>
                      <div style={{ fontSize: 28, fontWeight: 800, marginTop: 4, color: '#0f172a' }}>
                        ${financials.aov.toFixed(2)}
                      </div>
                      <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
                        {financials.totalItemsPurchased} total item{financials.totalItemsPurchased === 1 ? '' : 's'} purchased
                      </div>
                    </div>
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 10,
                        background: '#fef3c7',
                        color: '#d97706',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 20,
                      }}
                    >
                      <RiseOutlined />
                    </div>
                  </div>
                </Card>
              </Col>

              {/* Last Order Date */}
              <Col xs={24} sm={12} lg={6}>
                <Card
                  bordered={false}
                  style={{
                    borderRadius: 12,
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                    height: '100%',
                  }}
                  bodyStyle={{ padding: '18px 20px' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontSize: 12, color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Last Order Date
                      </div>
                      <div style={{ fontSize: 18, fontWeight: 800, marginTop: 8, color: '#0f172a' }}>
                        {financials.latestOrderDate
                          ? dayjs(financials.latestOrderDate).format('MMM D, YYYY')
                          : 'No orders yet'}
                      </div>
                      <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
                        {financials.latestOrderDate
                          ? dayjs(financials.latestOrderDate).format('h:mm A')
                          : 'Customer has not ordered'}
                      </div>
                    </div>
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 10,
                        background: '#f3e8ff',
                        color: '#9333ea',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 20,
                      }}
                    >
                      <CalendarOutlined />
                    </div>
                  </div>
                </Card>
              </Col>
            </Row>

            {/* MAIN TWO-COLUMN BALANCED LAYOUT */}
            <Row gutter={[20, 20]} align="top">
              {/* Left Column: Customer Details (Sticky Sidebar) */}
              <Col xs={24} lg={8} xl={7}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16, position: 'sticky', top: 20 }}>
                  {/* Profile Card */}
                  <Card
                    bordered={false}
                    style={{
                      borderRadius: 12,
                      boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                      border: '1px solid #e2e8f0',
                    }}
                    bodyStyle={{ padding: 20 }}
                  >
                    <div style={{ textAlign: 'center', paddingBottom: 16, borderBottom: '1px solid #f1f5f9' }}>
                      <Avatar
                        size={72}
                        src={user?.profile_pic || user?.avatar}
                        style={{
                          backgroundColor: '#088b46',
                          fontSize: 28,
                          fontWeight: 700,
                          boxShadow: '0 4px 12px rgba(8, 139, 70, 0.25)',
                          marginBottom: 10,
                        }}
                      >
                        {fullName.charAt(0).toUpperCase()}
                      </Avatar>

                      <h3 style={{ margin: 0, fontWeight: 800, color: '#0f172a', fontSize: 18 }}>
                        {fullName}
                      </h3>
                      <div style={{ color: '#64748b', fontSize: 12.5, marginTop: 2, wordBreak: 'break-all' }}>
                        {user?.email || 'No email provided'}
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 10 }}>
                        <Tag color="blue" style={{ fontWeight: 700, borderRadius: 8, padding: '1px 8px', fontSize: 11 }}>
                          {roleName}
                        </Tag>
                        <Tag color={isActive ? 'green' : 'volcano'} style={{ fontWeight: 700, borderRadius: 8, padding: '1px 8px', fontSize: 11 }}>
                          {isActive ? 'Active' : 'Inactive'}
                        </Tag>
                      </div>
                    </div>

                    {/* Profile Information List */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: '#64748b', fontSize: 12.5, display: 'flex', alignItems: 'center', gap: 6 }}>
                          <PhoneOutlined /> Phone
                        </span>
                        <strong style={{ color: '#0f172a', fontSize: 12.5 }}>
                          {[user?.prefix, user?.phonenumber || user?.phone].filter(Boolean).join(' ') || 'N/A'}
                        </strong>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: '#64748b', fontSize: 12.5, display: 'flex', alignItems: 'center', gap: 6 }}>
                          <UserOutlined /> Gender
                        </span>
                        <strong style={{ color: '#0f172a', fontSize: 12.5 }}>
                          {user?.gender || 'Not Specified'}
                        </strong>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: '#64748b', fontSize: 12.5, display: 'flex', alignItems: 'center', gap: 6 }}>
                          <CalendarOutlined /> Date of Birth
                        </span>
                        <strong style={{ color: '#0f172a', fontSize: 12.5 }}>
                          {user?.dob ? dayjs(user.dob).format('MMM D, YYYY') : 'N/A'}
                        </strong>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: '#64748b', fontSize: 12.5, display: 'flex', alignItems: 'center', gap: 6 }}>
                          <ClockCircleOutlined /> Joined
                        </span>
                        <strong style={{ color: '#0f172a', fontSize: 12.5 }}>
                          {user?.created_at ? dayjs(user.created_at).format('MMM D, YYYY') : 'N/A'}
                        </strong>
                      </div>

                      <Divider style={{ margin: '6px 0' }} />

                      {/* Account Status Switch */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 12.5, color: '#0f172a' }}>Account Status</div>
                          <div style={{ fontSize: 11, color: '#64748b' }}>
                            {isActive ? 'Account active' : 'Account inactive'}
                          </div>
                        </div>
                        <Switch
                          checked={isActive}
                          loading={statusUpdating}
                          onChange={handleStatusToggle}
                          style={{ backgroundColor: isActive ? '#088b46' : undefined }}
                        />
                      </div>
                    </div>
                  </Card>

                  {/* Delivery Address Card */}
                  <Card
                    title={
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 700, color: '#0f172a' }}>
                        <EnvironmentOutlined style={{ color: '#088b46' }} /> Delivery Address
                      </span>
                    }
                    bordered={false}
                    style={{
                      borderRadius: 12,
                      boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                      border: '1px solid #e2e8f0',
                    }}
                    bodyStyle={{ padding: 18 }}
                  >
                    {user?.address ? (
                      <div>
                        <p style={{ color: '#1e293b', fontSize: 13, lineHeight: 1.5, marginBottom: 10 }}>
                          {user.address}
                        </p>

                        {(user?.customer_lat && user?.customer_lng) && (
                          <div style={{ background: '#f8fafc', padding: '8px 10px', borderRadius: 6, marginBottom: 10, fontSize: 11.5, color: '#475569', fontFamily: 'monospace' }}>
                            GPS: {user.customer_lat}, {user.customer_lng}
                          </div>
                        )}

                        {(user?.customer_lat && user?.customer_lng) && (
                          <Button
                            icon={<CompassOutlined />}
                            type="default"
                            size="small"
                            href={`https://www.google.com/maps/search/?api=1&query=${user.customer_lat},${user.customer_lng}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ borderRadius: 6, fontWeight: 600, fontSize: 11.5 }}
                          >
                            Open in Google Maps
                          </Button>
                        )}
                      </div>
                    ) : (
                      <div style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: 12.5 }}>
                        No delivery address recorded in profile.
                      </div>
                    )}
                  </Card>
                </div>
              </Col>

              {/* Right Column: Customer Orders Breakdown */}
              <Col xs={24} lg={16} xl={17}>
                <Card
                  bordered={false}
                  style={{
                    borderRadius: 12,
                    boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                    border: '1px solid #e2e8f0',
                  }}
                  bodyStyle={{ padding: 20 }}
                >
                  {/* Orders Header: Title, Search, and View Mode Toggle */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: 12,
                      marginBottom: 16,
                    }}
                  >
                    <div>
                      <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: '#0f172a' }}>
                        Orders History ({ordersList.length})
                      </h3>
                      <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>
                        Detailed list of customer orders with amounts and items breakdown.
                      </p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                      <Input
                        placeholder="Search by ID, store, product..."
                        prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
                        value={orderSearch}
                        onChange={(e) => setOrderSearch(e.target.value)}
                        allowClear
                        size="small"
                        style={{ width: 230, borderRadius: 6 }}
                      />

                      <Segmented
                        value={viewMode}
                        onChange={setViewMode}
                        options={[
                          { label: 'Table', value: 'table', icon: <TableOutlined /> },
                          { label: 'Cards', value: 'cards', icon: <AppstoreOutlined /> },
                        ]}
                      />
                    </div>
                  </div>

                  {/* Tabs for Order Status */}
                  <Tabs
                    activeKey={activeTab}
                    onChange={setActiveTab}
                    items={[
                      {
                        key: 'all',
                        label: (
                          <span>
                            All Orders <Badge count={ordersList.length} style={{ backgroundColor: '#088b46', marginLeft: 4 }} />
                          </span>
                        ),
                      },
                      {
                        key: 'delivered',
                        label: (
                          <span>
                            Delivered <Badge count={financials.deliveredCount} style={{ backgroundColor: '#16a34a', marginLeft: 4 }} />
                          </span>
                        ),
                      },
                      {
                        key: 'pending',
                        label: (
                          <span>
                            In Progress <Badge count={financials.pendingCount} style={{ backgroundColor: '#f59e0b', marginLeft: 4 }} />
                          </span>
                        ),
                      },
                      {
                        key: 'cancelled',
                        label: (
                          <span>
                            Cancelled <Badge count={financials.cancelledCount} style={{ backgroundColor: '#ef4444', marginLeft: 4 }} />
                          </span>
                        ),
                      },
                    ]}
                    style={{ marginBottom: 12 }}
                  />

                  {/* Orders Content: Table View vs Card View */}
                  {filteredOrders.length === 0 ? (
                    <Empty
                      description={
                        <span style={{ color: '#94a3b8' }}>
                          {ordersList.length === 0
                            ? 'This user has not placed any orders yet.'
                            : 'No orders match the selected filter.'}
                        </span>
                      }
                      style={{ padding: '40px 0' }}
                    />
                  ) : viewMode === 'table' ? (
                    /* 📋 TABLE VIEW */
                    <Table
                      columns={tableColumns}
                      dataSource={filteredOrders}
                      rowKey={(ord, idx) => ord.id || ord.order_uid || idx}
                      pagination={{
                        current: orderPage,
                        pageSize: orderPageSize,
                        total: filteredOrders.length,
                        onChange: (p, ps) => {
                          setOrderPage(p);
                          setOrderPageSize(ps);
                        },
                        showSizeChanger: true,
                        pageSizeOptions: ['5', '10', '20', '50'],
                        showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} orders`,
                      }}
                      size="middle"
                    />
                  ) : (
                    /* 🗂️ PAGINATED CARDS VIEW */
                    <div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        {paginatedOrders.map((ord, index) => {
                          const fin = calculateOrderFinancials(ord);
                          const statusObj = getOrderStatus(ord.order_status);
                          const itemsList = ord.products || ord.order_items || ord.items || [];
                          const orderAddress =
                            ord.delivery_address?.address ||
                            ord.address ||
                            user?.address ||
                            'N/A';

                          return (
                            <Card
                              key={ord.id || ord.order_uid || index}
                              size="small"
                              style={{
                                borderRadius: 10,
                                border: '1px solid #e2e8f0',
                                background: '#ffffff',
                                boxShadow: '0 1px 4px rgba(0,0,0,0.02)',
                              }}
                              bodyStyle={{ padding: 14 }}
                            >
                              {/* Order Header */}
                              <div
                                style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  flexWrap: 'wrap',
                                  gap: 8,
                                  paddingBottom: 8,
                                  borderBottom: '1px solid #f1f5f9',
                                  marginBottom: 10,
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                  <span style={{ fontWeight: 800, fontSize: 14, color: '#0f172a' }}>
                                    #{ord.order_uid || ord.id || `ORD-${index + 1}`}
                                  </span>
                                  <Tag color={statusObj.color} style={{ fontWeight: 700, borderRadius: 8, margin: 0, fontSize: 11 }}>
                                    {statusObj.text}
                                  </Tag>
                                  {ord.payment_method && (
                                    <Tag color="default" style={{ fontWeight: 600, borderRadius: 4, fontSize: 10.5 }}>
                                      {ord.payment_method}
                                    </Tag>
                                  )}
                                  {ord.is_fast_delivery === 1 && (
                                    <Tag color="magenta" style={{ fontWeight: 700, borderRadius: 4, fontSize: 10.5 }}>
                                      ⚡ Fast
                                    </Tag>
                                  )}
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                  <span style={{ fontSize: 11.5, color: '#64748b' }}>
                                    <CalendarOutlined style={{ marginRight: 4 }} />
                                    {ord.created_at
                                      ? dayjs(ord.created_at).format('MMM D, YYYY h:mm A')
                                      : 'N/A'}
                                  </span>

                                  <Button
                                    size="small"
                                    icon={<EyeOutlined />}
                                    onClick={() => {
                                      setSelectedOrder(ord);
                                      setOrderModalVisible(true);
                                    }}
                                    style={{ borderRadius: 6, fontWeight: 600, fontSize: 11 }}
                                  >
                                    Details
                                  </Button>
                                </div>
                              </div>

                              {/* Order Store & Delivery Address */}
                              <div
                                style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'flex-start',
                                  flexWrap: 'wrap',
                                  gap: 8,
                                  fontSize: 12,
                                  marginBottom: 10,
                                  color: '#475569',
                                }}
                              >
                                <div>
                                  <ShopOutlined style={{ color: '#088b46', marginRight: 4 }} />
                                  Store:{' '}
                                  <strong style={{ color: '#0f172a' }}>
                                    {ord.store_name || ord.vendor?.store_name || ord.vendor_name || 'Store'}
                                  </strong>
                                </div>

                                <div style={{ maxWidth: 320, textAlign: 'right' }}>
                                  <EnvironmentOutlined style={{ color: '#0284c7', marginRight: 4 }} />
                                  <span style={{ color: '#64748b' }}>{orderAddress}</span>
                                </div>
                              </div>

                              {/* Items Breakdown */}
                              {itemsList.length > 0 && (
                                <div
                                  style={{
                                    background: '#f8fafc',
                                    borderRadius: 6,
                                    padding: '8px 10px',
                                    marginBottom: 10,
                                    border: '1px solid #f1f5f9',
                                  }}
                                >
                                  <div
                                    style={{
                                      fontSize: 11,
                                      fontWeight: 700,
                                      color: '#64748b',
                                      textTransform: 'uppercase',
                                      letterSpacing: '0.5px',
                                      marginBottom: 4,
                                    }}
                                  >
                                    Order Items ({itemsList.length})
                                  </div>
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                    {itemsList.map((item, itemIdx) => {
                                      const qty = item.quantity || item.qty || 1;
                                      const price = Number(item.price || item.unit_price || 0);
                                      const itemName =
                                        item.name || item.product_name || item.title || `Product #${itemIdx + 1}`;

                                      return (
                                        <div
                                          key={itemIdx}
                                          style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            fontSize: 12,
                                          }}
                                        >
                                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <span style={{ fontWeight: 600, color: '#1e293b' }}>
                                              {itemName}
                                            </span>
                                            <Tag
                                              color="blue"
                                              style={{
                                                fontSize: 10,
                                                padding: '0 4px',
                                                margin: 0,
                                                borderRadius: 4,
                                                fontWeight: 700,
                                              }}
                                            >
                                              x{qty}
                                            </Tag>
                                          </div>

                                          {price > 0 && (
                                            <span style={{ fontWeight: 600, color: '#334155' }}>
                                              ${(price * qty).toFixed(2)}
                                            </span>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}

                              {/* Financial Summary */}
                              <div
                                style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  flexWrap: 'wrap',
                                  gap: 8,
                                  paddingTop: 6,
                                  borderTop: '1px dashed #e2e8f0',
                                  fontSize: 12,
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#64748b' }}>
                                  <span>
                                    Items: <strong>${fin.itemsPrice.toFixed(2)}</strong>
                                  </span>
                                  {fin.deliveryCharge > 0 && (
                                    <span>
                                      Delivery: <strong>${fin.deliveryCharge.toFixed(2)}</strong>
                                    </span>
                                  )}
                                  {fin.fastDeliveryCharge > 0 && (
                                    <span>
                                      Fast: <strong>${fin.fastDeliveryCharge.toFixed(2)}</strong>
                                    </span>
                                  )}
                                  {fin.tip > 0 && (
                                    <span style={{ color: '#0284c7' }}>
                                      Tip: <strong>${fin.tip.toFixed(2)}</strong>
                                    </span>
                                  )}
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                  <span style={{ fontSize: 12, fontWeight: 700, color: '#0f172a' }}>
                                    Total Spend:
                                  </span>
                                  <span
                                    style={{
                                      fontSize: 16,
                                      fontWeight: 800,
                                      color: '#088b46',
                                    }}
                                  >
                                    ${fin.overall.toFixed(2)}
                                  </span>
                                </div>
                              </div>
                            </Card>
                          );
                        })}
                      </div>

                      {/* Pagination Controls for Card View */}
                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
                        <Pagination
                          current={orderPage}
                          pageSize={orderPageSize}
                          total={filteredOrders.length}
                          onChange={(p, ps) => {
                            setOrderPage(p);
                            setOrderPageSize(ps);
                          }}
                          showSizeChanger
                          pageSizeOptions={['5', '10', '20', '50']}
                          showTotal={(total, range) => `${range[0]}-${range[1]} of ${total} orders`}
                        />
                      </div>
                    </div>
                  )}
                </Card>
              </Col>
            </Row>
          </>
        )}
      </div>

      {/* Detailed Order Modal */}
      {selectedOrder && (
        <Modal
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontWeight: 800, fontSize: 16 }}>
                Order #{selectedOrder.order_uid || selectedOrder.id}
              </span>
              <Tag color={getOrderStatus(selectedOrder.order_status).color} style={{ fontWeight: 700 }}>
                {getOrderStatus(selectedOrder.order_status).text}
              </Tag>
            </div>
          }
          open={orderModalVisible}
          onCancel={() => setOrderModalVisible(false)}
          footer={[
            <Button
              key="close"
              type="primary"
              onClick={() => setOrderModalVisible(false)}
              style={{ background: '#088b46', border: 'none', borderRadius: 6 }}
            >
              Close
            </Button>,
          ]}
          width={620}
        >
          {(() => {
            const fin = calculateOrderFinancials(selectedOrder);
            const extra = selectedOrder.extra_details || {};
            const items = selectedOrder.products || selectedOrder.order_items || selectedOrder.items || [];

            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <Descriptions bordered size="small" column={2}>
                  <Descriptions.Item label="Store Name">
                    <strong>{selectedOrder.store_name || selectedOrder.vendor_name || 'N/A'}</strong>
                  </Descriptions.Item>
                  <Descriptions.Item label="Order Date">
                    {selectedOrder.created_at ? dayjs(selectedOrder.created_at).format('YYYY-MM-DD h:mm A') : 'N/A'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Payment Method">
                    {selectedOrder.payment_method || 'COD'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Preparing Time">
                    {selectedOrder.preparing_time ? `${selectedOrder.preparing_time} mins` : 'N/A'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Delivery Address" span={2}>
                    {selectedOrder.delivery_address?.address || selectedOrder.address || user?.address || 'N/A'}
                  </Descriptions.Item>
                </Descriptions>

                {/* Ordered Items Table */}
                <div>
                  <h4 style={{ margin: '6px 0', fontWeight: 700, fontSize: 13.5 }}>Ordered Items</h4>
                  <Table
                    size="small"
                    pagination={false}
                    dataSource={items}
                    rowKey={(rec, idx) => rec.id || idx}
                    columns={[
                      {
                        title: 'Product',
                        dataIndex: 'name',
                        render: (val, r) => val || r.product_name || 'Item',
                      },
                      {
                        title: 'Qty',
                        dataIndex: 'quantity',
                        width: 60,
                        align: 'center',
                        render: (val, r) => val || r.qty || 1,
                      },
                      {
                        title: 'Unit Price',
                        dataIndex: 'price',
                        width: 90,
                        align: 'right',
                        render: (val, r) => `$${Number(val || r.unit_price || 0).toFixed(2)}`,
                      },
                      {
                        title: 'Total',
                        key: 'total',
                        width: 90,
                        align: 'right',
                        render: (_, r) => {
                          const q = r.quantity || r.qty || 1;
                          const p = Number(r.price || r.unit_price || 0);
                          return <strong>${(q * p).toFixed(2)}</strong>;
                        },
                      },
                    ]}
                  />
                </div>

                {/* Financial Summary */}
                <div style={{ background: '#f8fafc', padding: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}>
                  <h4 style={{ margin: '0 0 8px 0', fontWeight: 700, fontSize: 13.5 }}>Financial Breakdown</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 5, fontSize: 12.5 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                      <span>Items Price:</span>
                      <strong>${fin.itemsPrice.toFixed(2)}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                      <span>Delivery Charge:</span>
                      <strong>${fin.deliveryCharge.toFixed(2)}</strong>
                    </div>
                    {fin.fastDeliveryCharge > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                        <span>Fast Delivery Charge:</span>
                        <strong>${fin.fastDeliveryCharge.toFixed(2)}</strong>
                      </div>
                    )}
                    {fin.tip > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#0284c7' }}>
                        <span>Tip Amount:</span>
                        <strong>${fin.tip.toFixed(2)}</strong>
                      </div>
                    )}
                    {extra.vendor_share && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#8c8c8c', fontSize: 11.5 }}>
                        <span>Vendor Share:</span>
                        <span>${Number(extra.vendor_share).toFixed(2)}</span>
                      </div>
                    )}
                    {extra.rider_share && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#8c8c8c', fontSize: 11.5 }}>
                        <span>Rider Share:</span>
                        <span>${Number(extra.rider_share).toFixed(2)}</span>
                      </div>
                    )}
                    <Divider style={{ margin: '6px 0' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15, fontWeight: 800, color: '#088b46' }}>
                      <span>Final Order Amount:</span>
                      <span>${fin.overall.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </Modal>
      )}
    </div>
  );
};

export default SingleUser;
