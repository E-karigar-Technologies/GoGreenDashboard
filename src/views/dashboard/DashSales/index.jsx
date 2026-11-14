import React, { useState, useEffect, useCallback } from 'react';
import { Row, Col, Card } from 'react-bootstrap';
import { Button, Spin, Tag, Table, Tooltip, Progress } from 'antd';
import { useNavigate } from 'react-router-dom';
import Chart from 'react-apexcharts';
import dayjs from 'dayjs';
import {
  UserOutlined,
  DollarOutlined,
  ShoppingOutlined,
  CheckCircleOutlined,
  SmileOutlined,
  ReloadOutlined,
  ShopOutlined,
  CarOutlined,
  ArrowRightOutlined,
  ClockCircleOutlined,
  AppstoreOutlined,
  CalendarOutlined,
  SyncOutlined,
  CloseCircleOutlined,
  CheckOutlined,
  StopOutlined,
} from '@ant-design/icons';

import {
  getOrdersList,
  getAllUserDetails,
  getAllVendors,
  getAllRiders,
  getAllProducts,
} from '../../../services/apiService';
import { calculateOrderFinancials, getOrderStatus } from '../ORDERS/hooks/useOrder';
import DateRangeSelector from '../../../components/DateRangeSelector';

export default function DashSales() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Date Range filter state (Default to 'today')
  const today = dayjs();
  const [dateRange, setDateRange] = useState({
    preset: 'today',
    start: today.startOf('day'),
    end: today.endOf('day'),
  });

  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalRevenue: 0,
    totalOrders: 0,
    deliveredOrders: 0,
    inProgressOrders: 0,
    pendingOrders: 0,
    rejectedOrders: 0,
    totalVendors: 0,
    activeVendors: 0,
    inactiveVendors: 0,
    totalRiders: 0,
    activeRiders: 0,
    inactiveRiders: 0,
    totalProducts: 0,
    monthlySalesData: Array(12).fill(0),
    monthlyOrderCounts: Array(12).fill(0),
    recentOrders: [],
  });

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const payload = {
        limit: 100,
        page: 1,
        start_date: dateRange?.start ? dateRange.start.format('YYYY-MM-DD') : undefined,
        end_date: dateRange?.end ? dateRange.end.format('YYYY-MM-DD') : undefined,
      };

      const [ordersRes, usersRes, vendorsRes, ridersRes, productsRes] = await Promise.allSettled([
        getOrdersList(payload),
        getAllUserDetails(),
        getAllVendors(),
        getAllRiders(),
        getAllProducts(),
      ]);

      let ordersList = [];
      let totalOrdersCount = 0;
      let calculatedRevenue = 0;
      let deliveredCount = 0;
      let inProgressCount = 0;
      let pendingCount = 0;
      let rejectedCount = 0;

      const monthlyRev = Array(12).fill(0);
      const monthlyCounts = Array(12).fill(0);

      if (ordersRes.status === 'fulfilled' && ordersRes.value?.success) {
        ordersList = ordersRes.value.data || [];
        totalOrdersCount = ordersRes.value.total || ordersList.length;

        ordersList.forEach((ord) => {
          const fin = calculateOrderFinancials(ord);
          calculatedRevenue += fin.overall;

          if (ord.order_status === 4) deliveredCount += 1;
          else if (ord.order_status === 0) pendingCount += 1;
          else if (ord.order_status === 3 || ord.order_status === 5) rejectedCount += 1;
          else if (ord.order_status === 1 || ord.order_status === 2) inProgressCount += 1;

          if (ord.created_at) {
            const date = new Date(ord.created_at);
            if (!isNaN(date.getTime())) {
              const monthIdx = date.getMonth();
              monthlyRev[monthIdx] += fin.overall;
              monthlyCounts[monthIdx] += 1;
            }
          }
        });
      }

      let customersCount = 0;
      if (usersRes.status === 'fulfilled' && usersRes.value?.success) {
        const userData = usersRes.value.data;
        if (Array.isArray(userData)) {
          customersCount = userData.length;
        } else if (userData && typeof userData === 'object') {
          customersCount = usersRes.value.total ?? userData.total ?? (Array.isArray(userData.users) ? userData.users.length : 0);
        }
      }

      // Vendor Active / Inactive Parsing
      let vendorsList = [];
      if (vendorsRes.status === 'fulfilled') {
        if (Array.isArray(vendorsRes.value?.data)) vendorsList = vendorsRes.value.data;
        else if (Array.isArray(vendorsRes.value)) vendorsList = vendorsRes.value;
      }
      const totalVendorsCount = vendorsList.length;
      const activeVendorsCount = vendorsList.filter(
        (v) => Number(v.status) === 1 || v.status === true || Number(v.is_verified) === 1
      ).length;
      const inactiveVendorsCount = Math.max(0, totalVendorsCount - activeVendorsCount);

      // Rider Active / Inactive Parsing
      let ridersList = [];
      if (ridersRes.status === 'fulfilled') {
        if (Array.isArray(ridersRes.value?.data)) ridersList = ridersRes.value.data;
        else if (Array.isArray(ridersRes.value)) ridersList = ridersRes.value;
      }
      const totalRidersCount = ridersList.length;
      const activeRidersCount = ridersList.filter(
        (r) => Number(r.status) === 1 || r.status === true || Number(r.is_verified) === 1 || Number(r.is_online) === 1
      ).length;
      const inactiveRidersCount = Math.max(0, totalRidersCount - activeRidersCount);

      let productsCount = 0;
      if (productsRes.status === 'fulfilled' && productsRes.value?.success) {
        const prodData = productsRes.value.data;
        if (Array.isArray(prodData)) {
          productsCount = prodData.length;
        } else if (prodData && typeof prodData === 'object') {
          productsCount = prodData.total ?? prodData.meta?.total ?? (Array.isArray(prodData.products) ? prodData.products.length : 0);
        } else if (typeof productsRes.value.total === 'number') {
          productsCount = productsRes.value.total;
        }
      }

      setStats({
        totalCustomers: Number(customersCount) || 0,
        totalRevenue: Number(calculatedRevenue) || 0,
        totalOrders: Number(totalOrdersCount) || 0,
        deliveredOrders: Number(deliveredCount) || 0,
        inProgressOrders: Number(inProgressCount) || 0,
        pendingOrders: Number(pendingCount) || 0,
        rejectedOrders: Number(rejectedCount) || 0,
        totalVendors: Number(totalVendorsCount) || 0,
        activeVendors: Number(activeVendorsCount) || 0,
        inactiveVendors: Number(inactiveVendorsCount) || 0,
        totalRiders: Number(totalRidersCount) || 0,
        activeRiders: Number(activeRidersCount) || 0,
        inactiveRiders: Number(inactiveRidersCount) || 0,
        totalProducts: Number(productsCount) || 0,
        monthlySalesData: monthlyRev,
        monthlyOrderCounts: monthlyCounts,
        recentOrders: Array.isArray(ordersList) ? ordersList.slice(0, 6) : [],
      });

      setLastUpdated(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    } catch (err) {
      console.error('Failed loading dynamic dashboard analytics:', err);
    } finally {
      setLoading(false);
    }
  }, [dateRange?.start, dateRange?.end]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Dynamic Sales Analytics Chart Options & Series
  const salesChartOptions = {
    height: 330,
    type: 'line',
    options: {
      chart: { background: 'transparent', toolbar: { show: false } },
      stroke: { width: [0, 3], curve: 'smooth' },
      plotOptions: { bar: { columnWidth: '45%', borderRadius: 4 } },
      colors: ['#088B46', '#0284c7'],
      fill: { opacity: [0.85, 1] },
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      yaxis: { min: 0 },
      grid: { borderColor: '#f1f5f9' },
      tooltip: {
        shared: true,
        intersect: false,
        y: {
          formatter(y, { seriesIndex }) {
            if (typeof y !== 'undefined' && y !== null) {
              return seriesIndex === 0 ? `$${Number(y || 0).toFixed(2)}` : `${y} orders`;
            }
            return y ?? 0;
          },
        },
      },
    },
    series: [
      {
        name: 'Revenue ($)',
        type: 'column',
        data: Array.isArray(stats.monthlySalesData) ? stats.monthlySalesData : Array(12).fill(0),
      },
      {
        name: 'Order Count',
        type: 'line',
        data: Array.isArray(stats.monthlyOrderCounts) ? stats.monthlyOrderCounts : Array(12).fill(0),
      },
    ],
  };

  // Dynamic Order Status Pie Chart
  const statusPieChartOptions = {
    type: 'pie',
    height: 230,
    options: {
      labels: ['Completed (Delivered)', 'In Progress', 'Pending', 'Rejected'],
      colors: ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444'],
      legend: { position: 'bottom', fontSize: '12px' },
      dataLabels: { enabled: true, formatter: (val) => `${Number(val || 0).toFixed(1)}%` },
    },
    series: [
      Number(stats.deliveredOrders) || (stats.totalOrders === 0 ? 1 : 0),
      Number(stats.inProgressOrders) || 0,
      Number(stats.pendingOrders) || 0,
      Number(stats.rejectedOrders) || 0,
    ],
  };

  // Recent Orders Table Columns
  const recentOrdersColumns = [
    {
      title: 'Order ID',
      key: 'order_id',
      render: (_, record) => (
        <span style={{ fontWeight: 700, color: '#0f172a' }}>
          #{record.order_uid || record.order_id || record.id}
        </span>
      ),
    },
    {
      title: 'Customer',
      key: 'customer',
      render: (_, record) => {
        const u = record.user || {};
        const name = [u.firstname, u.lastname].filter(Boolean).join(' ') || u.name || 'Guest Customer';
        return <span style={{ fontWeight: 600, color: '#334155' }}>{name}</span>;
      },
    },
    {
      title: 'Store',
      key: 'vendor',
      render: (_, record) => record.store_name || record.vendor?.store_name || record.vendor_name || 'Store N/A',
    },
    {
      title: 'Total Amount',
      key: 'amount',
      render: (_, record) => {
        const fin = calculateOrderFinancials(record);
        return <span style={{ fontWeight: 700, color: '#088b46' }}>${fin.overall.toFixed(2)}</span>;
      },
    },
    {
      title: 'Status',
      dataIndex: 'order_status',
      key: 'order_status',
      render: (statusVal) => {
        const s = getOrderStatus(statusVal);
        return <Tag color={s.color} style={{ borderRadius: '10px', fontWeight: 600 }}>{s.text}</Tag>;
      },
    },
  ];

  // Date range label formatter
  const dateFilterLabel = dateRange.preset === 'today'
    ? "Today's Live Data"
    : dateRange.preset === 'yesterday'
    ? "Yesterday's Data"
    : dateRange.preset === 'this_week'
    ? 'This Week Data'
    : dateRange.preset === 'this_month'
    ? 'This Month Data'
    : dateRange.preset === 'all'
    ? 'All-Time Analytics'
    : 'Filtered Date Range';

  const avgOrderValue = stats.totalOrders > 0 ? (Number(stats.totalRevenue || 0) / Number(stats.totalOrders || 1)).toFixed(2) : '0.00';
  const completionRate = stats.totalOrders > 0 ? ((Number(stats.deliveredOrders || 0) / Number(stats.totalOrders || 1)) * 100).toFixed(1) : '0.0';

  return (
    <div className="page-container">
      {/* Executive Dashboard Header */}
      <div className="page-header-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div className="header-title-block">
          <h2>GoGreen Operations Dashboard</h2>
          <p>Real-time store performance, daily order statuses, revenue metrics, vendor & rider status overview.</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4, flexWrap: 'wrap' }}>
            <Tag color="blue" style={{ fontWeight: 700, borderRadius: 12, padding: '2px 10px' }}>
              <CalendarOutlined style={{ marginRight: 4 }} /> {dateFilterLabel}
            </Tag>
            {lastUpdated && (
              <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <ClockCircleOutlined /> Refreshed at {lastUpdated}
              </span>
            )}
          </div>
        </div>

        {/* Date Filter & Control Bar */}
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#f8fafc', padding: '6px 12px', borderRadius: 10, border: '1px solid #e2e8f0' }}>
            <CalendarOutlined style={{ color: '#088b46', fontSize: '16px' }} />
            <DateRangeSelector
              preset={dateRange.preset}
              start={dateRange.start}
              end={dateRange.end}
              onChange={(newRange) => setDateRange(newRange)}
            />
          </div>

          <Button
            icon={<ReloadOutlined spin={loading} />}
            onClick={fetchDashboardData}
            type="default"
            style={{ borderRadius: 8, fontWeight: 600, height: 38 }}
          >
            Refresh
          </Button>

          <Button
            icon={<ArrowRightOutlined />}
            onClick={() => navigate('/all-orders')}
            type="primary"
            style={{ background: '#088b46', border: 'none', borderRadius: 8, fontWeight: 600, height: 38 }}
          >
            Orders List
          </Button>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <Spin size="large" tip="Loading real-time operations & status metrics..." />
        </div>
      ) : (
        <>
          {/* Primary Revenue & Order Status Grid (Clickable Cards) */}
          <div className="page-stats-grid">
            {/* Filtered Revenue Card */}
            <Tooltip title="Click to view all orders">
              <div
                className="page-stat-card"
                onClick={() => navigate('/all-orders')}
                style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
              >
                <div className="stat-meta">
                  <div className="stat-label">Revenue ({dateRange.preset === 'today' ? 'Today' : 'Filtered'})</div>
                  <div className="stat-number" style={{ color: '#088b46' }}>
                    ${Number(stats.totalRevenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
                <div className="stat-icon" style={{ background: '#dcfce7', color: '#088b46' }}>
                  <DollarOutlined />
                </div>
              </div>
            </Tooltip>

            {/* Completed Orders Card */}
            <Tooltip title="Click to view completed orders list">
              <div
                className="page-stat-card"
                onClick={() => navigate('/all-orders')}
                style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
              >
                <div className="stat-meta">
                  <div className="stat-label">Completed Orders ({dateRange.preset === 'today' ? 'Today' : 'Filtered'})</div>
                  <div className="stat-number" style={{ color: '#16a34a' }}>{Number(stats.deliveredOrders || 0).toLocaleString()}</div>
                </div>
                <div className="stat-icon" style={{ background: '#dcfce7', color: '#16a34a' }}>
                  <CheckCircleOutlined />
                </div>
              </div>
            </Tooltip>

            {/* In Progress Orders Card */}
            <Tooltip title="Click to view in-progress orders">
              <div
                className="page-stat-card"
                onClick={() => navigate('/all-orders')}
                style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
              >
                <div className="stat-meta">
                  <div className="stat-label">Orders In Progress</div>
                  <div className="stat-number" style={{ color: '#0284c7' }}>{Number(stats.inProgressOrders || 0).toLocaleString()}</div>
                </div>
                <div className="stat-icon" style={{ background: '#e0f2fe', color: '#0284c7' }}>
                  <SyncOutlined spin={Number(stats.inProgressOrders || 0) > 0} />
                </div>
              </div>
            </Tooltip>

            {/* Pending Orders Card */}
            <Tooltip title="Click to view pending orders">
              <div
                className="page-stat-card"
                onClick={() => navigate('/all-orders')}
                style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
              >
                <div className="stat-meta">
                  <div className="stat-label">Pending Orders</div>
                  <div className="stat-number" style={{ color: '#d97706' }}>{Number(stats.pendingOrders || 0).toLocaleString()}</div>
                </div>
                <div className="stat-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
                  <ClockCircleOutlined />
                </div>
              </div>
            </Tooltip>
          </div>

          {/* Vendors & Riders Active / Inactive Infrastructure Grid (Clickable Cards) */}
          <Row className="g-3 mb-4">
            {/* Vendor Stores Card */}
            <Col xs={12} sm={6} md={3}>
              <Tooltip title="Click to open Vendor Stores management">
                <Card
                  bordered={false}
                  onClick={() => navigate('/vendors')}
                  style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', background: '#ffffff', cursor: 'pointer', transition: 'all 0.2s ease' }}
                >
                  <Card.Body className="p-3">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontWeight: 700, color: '#334155', fontSize: '13px' }}>
                        <ShopOutlined style={{ color: '#d97706', marginRight: 6 }} /> Vendors Overview
                      </span>
                      <Tag color="gold" style={{ fontWeight: 800, margin: 0 }}>{Number(stats.totalVendors || 0).toLocaleString()} Total</Tag>
                    </div>
                    <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                      <div style={{ flex: 1, background: '#f0fdf4', borderRadius: 8, padding: '8px 10px', border: '1px solid #bbf7d0' }}>
                        <span style={{ fontSize: '11px', color: '#166534', fontWeight: 600, display: 'block' }}>
                          <CheckOutlined style={{ marginRight: 4 }} /> Active
                        </span>
                        <strong style={{ fontSize: '18px', color: '#16a34a' }}>{Number(stats.activeVendors || 0).toLocaleString()}</strong>
                      </div>
                      <div style={{ flex: 1, background: '#fef2f2', borderRadius: 8, padding: '8px 10px', border: '1px solid #fecaca' }}>
                        <span style={{ fontSize: '11px', color: '#991b1b', fontWeight: 600, display: 'block' }}>
                          <StopOutlined style={{ marginRight: 4 }} /> Inactive
                        </span>
                        <strong style={{ fontSize: '18px', color: '#dc2626' }}>{Number(stats.inactiveVendors || 0).toLocaleString()}</strong>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Tooltip>
            </Col>

            {/* Rider Partners Card */}
            <Col xs={12} sm={6} md={3}>
              <Tooltip title="Click to open Delivery Riders management">
                <Card
                  bordered={false}
                  onClick={() => navigate('/riders')}
                  style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', background: '#ffffff', cursor: 'pointer', transition: 'all 0.2s ease' }}
                >
                  <Card.Body className="p-3">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontWeight: 700, color: '#334155', fontSize: '13px' }}>
                        <CarOutlined style={{ color: '#9333ea', marginRight: 6 }} /> Riders Overview
                      </span>
                      <Tag color="purple" style={{ fontWeight: 800, margin: 0 }}>{Number(stats.totalRiders || 0).toLocaleString()} Total</Tag>
                    </div>
                    <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                      <div style={{ flex: 1, background: '#f0fdf4', borderRadius: 8, padding: '8px 10px', border: '1px solid #bbf7d0' }}>
                        <span style={{ fontSize: '11px', color: '#166534', fontWeight: 600, display: 'block' }}>
                          <CheckOutlined style={{ marginRight: 4 }} /> Active
                        </span>
                        <strong style={{ fontSize: '18px', color: '#16a34a' }}>{Number(stats.activeRiders || 0).toLocaleString()}</strong>
                      </div>
                      <div style={{ flex: 1, background: '#fef2f2', borderRadius: 8, padding: '8px 10px', border: '1px solid #fecaca' }}>
                        <span style={{ fontSize: '11px', color: '#991b1b', fontWeight: 600, display: 'block' }}>
                          <StopOutlined style={{ marginRight: 4 }} /> Inactive
                        </span>
                        <strong style={{ fontSize: '18px', color: '#dc2626' }}>{Number(stats.inactiveRiders || 0).toLocaleString()}</strong>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Tooltip>
            </Col>

            {/* Registered Customers Card */}
            <Col xs={12} sm={6} md={3}>
              <Tooltip title="Click to view Customer Accounts">
                <Card
                  bordered={false}
                  onClick={() => navigate('/all-users')}
                  style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', background: '#ffffff', cursor: 'pointer', transition: 'all 0.2s ease' }}
                >
                  <Card.Body className="p-3">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontWeight: 700, color: '#334155', fontSize: '13px' }}>
                        <UserOutlined style={{ color: '#0284c7', marginRight: 6 }} /> Registered Customers
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: 10 }}>
                      <strong style={{ fontSize: '22px', color: '#0284c7' }}>{Number(stats.totalCustomers || 0).toLocaleString()}</strong>
                      <span style={{ fontSize: '11.5px', color: '#64748b' }}>Active App Users</span>
                    </div>
                  </Card.Body>
                </Card>
              </Tooltip>
            </Col>

            {/* Catalog Products Card */}
            <Col xs={12} sm={6} md={3}>
              <Tooltip title="Click to open Catalog Products management">
                <Card
                  bordered={false}
                  onClick={() => navigate('/products')}
                  style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', background: '#ffffff', cursor: 'pointer', transition: 'all 0.2s ease' }}
                >
                  <Card.Body className="p-3">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontWeight: 700, color: '#334155', fontSize: '13px' }}>
                        <AppstoreOutlined style={{ color: '#088b46', marginRight: 6 }} /> Catalog Products
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: 10 }}>
                      <strong style={{ fontSize: '22px', color: '#088b46' }}>{Number(stats.totalProducts || 0).toLocaleString()}</strong>
                      <span style={{ fontSize: '11.5px', color: '#64748b' }}>Store Items</span>
                    </div>
                  </Card.Body>
                </Card>
              </Tooltip>
            </Col>
          </Row>

          {/* Analytics Charts & Detail Cards */}
          <Row className="g-4">
            {/* Sales Chart Section */}
            <Col md={12} xl={7}>
              <div className="page-content-card" style={{ height: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, borderBottom: '1px solid #f1f5f9', paddingBottom: 12 }}>
                  <h4 style={{ margin: 0, fontWeight: 700, color: '#0f172a', fontSize: '16px' }}>Monthly Revenue & Orders Trend</h4>
                  <Button type="link" onClick={() => navigate('/all-orders')} style={{ fontWeight: 700, color: '#088b46', padding: 0 }}>
                    ${Number(stats.totalRevenue || 0).toFixed(2)} Filtered Total <ArrowRightOutlined />
                  </Button>
                </div>
                <Row className="pb-2">
                  <div className="col-auto m-b-10" onClick={() => navigate('/all-orders')} style={{ cursor: 'pointer' }}>
                    <h3 className="mb-1" style={{ fontWeight: 700, color: '#0f172a' }}>${Number(stats.totalRevenue || 0).toFixed(2)}</h3>
                    <span style={{ fontSize: 12, color: '#64748b' }}>Gross Sales ({dateFilterLabel})</span>
                  </div>
                  <div className="col-auto m-b-10" onClick={() => navigate('/all-orders')} style={{ cursor: 'pointer' }}>
                    <h3 className="mb-1" style={{ fontWeight: 700, color: '#0284c7' }}>${avgOrderValue}</h3>
                    <span style={{ fontSize: 12, color: '#64748b' }}>Average Order Value</span>
                  </div>
                  <div className="col-auto m-b-10" onClick={() => navigate('/all-orders')} style={{ cursor: 'pointer' }}>
                    <h3 className="mb-1" style={{ fontWeight: 700, color: '#088b46' }}>{completionRate}%</h3>
                    <span style={{ fontSize: 12, color: '#64748b' }}>Completion Rate</span>
                  </div>
                </Row>
                <Chart {...salesChartOptions} />
              </div>
            </Col>

            {/* Infrastructure & Status Distribution (Clickable Rows) */}
            <Col md={12} xl={5}>
              <div className="page-content-card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, borderBottom: '1px solid #f1f5f9', paddingBottom: 12 }}>
                  <h4 style={{ margin: 0, fontWeight: 700, color: '#0f172a', fontSize: '16px' }}>Order Status Distribution</h4>
                  <SmileOutlined style={{ fontSize: 20, color: '#088b46' }} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 190, marginBottom: 12, cursor: 'pointer' }} onClick={() => navigate('/all-orders')}>
                  <Chart {...statusPieChartOptions} />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 'auto' }}>
                  <div
                    onClick={() => navigate('/all-orders')}
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: '#f0fdf4', borderRadius: 8, border: '1px solid #bbf7d0', cursor: 'pointer' }}
                  >
                    <span style={{ fontWeight: 600, color: '#166534', fontSize: '12.5px' }}>
                      <CheckCircleOutlined style={{ color: '#16a34a', marginRight: 6 }} />
                      Completed (Delivered) Orders:
                    </span>
                    <strong style={{ color: '#16a34a' }}>{Number(stats.deliveredOrders || 0).toLocaleString()}</strong>
                  </div>

                  <div
                    onClick={() => navigate('/all-orders')}
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: '#eff6ff', borderRadius: 8, border: '1px solid #bfdbfe', cursor: 'pointer' }}
                  >
                    <span style={{ fontWeight: 600, color: '#1e40af', fontSize: '12.5px' }}>
                      <SyncOutlined style={{ color: '#2563eb', marginRight: 6 }} />
                      Orders In Progress:
                    </span>
                    <strong style={{ color: '#2563eb' }}>{Number(stats.inProgressOrders || 0).toLocaleString()}</strong>
                  </div>

                  <div
                    onClick={() => navigate('/all-orders')}
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: '#fffbeb', borderRadius: 8, border: '1px solid #fde68a', cursor: 'pointer' }}
                  >
                    <span style={{ fontWeight: 600, color: '#92400e', fontSize: '12.5px' }}>
                      <ClockCircleOutlined style={{ color: '#d97706', marginRight: 6 }} />
                      Pending Orders:
                    </span>
                    <strong style={{ color: '#d97706' }}>{Number(stats.pendingOrders || 0).toLocaleString()}</strong>
                  </div>

                  <div
                    onClick={() => navigate('/all-orders')}
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: '#fef2f2', borderRadius: 8, border: '1px solid #fecaca', cursor: 'pointer' }}
                  >
                    <span style={{ fontWeight: 600, color: '#991b1b', fontSize: '12.5px' }}>
                      <CloseCircleOutlined style={{ color: '#dc2626', marginRight: 6 }} />
                      Rejected Orders:
                    </span>
                    <strong style={{ color: '#dc2626' }}>{Number(stats.rejectedOrders || 0).toLocaleString()}</strong>
                  </div>
                </div>
              </div>
            </Col>

            {/* Recent Live Store Orders Table (Clickable Rows) */}
            <Col md={12} xl={7}>
              <div className="page-content-card">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, borderBottom: '1px solid #f1f5f9', paddingBottom: 12 }}>
                  <h4 style={{ margin: 0, fontWeight: 700, color: '#0f172a', fontSize: '16px' }}>
                    Orders ({(stats.recentOrders || []).length}) - {dateFilterLabel}
                  </h4>
                  <Button
                    type="link"
                    onClick={() => navigate('/all-orders')}
                    style={{ fontWeight: 600, color: '#088b46', padding: 0 }}
                  >
                    View All Orders <ArrowRightOutlined />
                  </Button>
                </div>
                <Table
                  columns={recentOrdersColumns}
                  dataSource={Array.isArray(stats.recentOrders) ? stats.recentOrders : []}
                  rowKey={(record) => record.order_id || record.id}
                  pagination={false}
                  size="small"
                  scroll={{ x: 'max-content' }}
                  onRow={() => ({
                    onClick: () => navigate('/all-orders'),
                    style: { cursor: 'pointer' },
                  })}
                />
              </div>
            </Col>

            {/* Operational Summary & Progress Cards */}
            <Col md={12} xl={5}>
              <div className="page-content-card" style={{ height: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, borderBottom: '1px solid #f1f5f9', paddingBottom: 12 }}>
                  <h4 style={{ margin: 0, fontWeight: 700, color: '#0f172a', fontSize: '16px' }}>Fulfillment & Capacity Summary</h4>
                  <CheckCircleOutlined style={{ fontSize: 20, color: '#0284c7' }} />
                </div>
                <Row className="g-3">
                  <Col md={6}>
                    <Card
                      className="support-bar overflow-hidden border-0 shadow-sm"
                      onClick={() => navigate('/all-orders')}
                      style={{ background: '#f8fafc', borderRadius: 12, cursor: 'pointer' }}
                    >
                      <Card.Body className="p-3">
                        <h2 className="m-0" style={{ fontWeight: 800, color: '#088b46' }}>{completionRate}%</h2>
                        <span style={{ fontWeight: 600, color: '#0f172a', fontSize: '13px' }}>Completion Rate</span>
                        <p style={{ fontSize: 11.5, color: '#64748b', margin: '4px 0 0 0' }}>Delivered vs total orders.</p>
                      </Card.Body>
                    </Card>
                  </Col>

                  <Col md={6}>
                    <Card
                      className="support-bar overflow-hidden border-0 shadow-sm"
                      onClick={() => navigate('/all-orders')}
                      style={{ background: '#f8fafc', borderRadius: 12, cursor: 'pointer' }}
                    >
                      <Card.Body className="p-3">
                        <h2 className="m-0" style={{ fontWeight: 800, color: '#0284c7' }}>{Number(stats.inProgressOrders || 0).toLocaleString()}</h2>
                        <span style={{ fontWeight: 600, color: '#0f172a', fontSize: '13px' }}>In Progress</span>
                        <p style={{ fontSize: 11.5, color: '#64748b', margin: '4px 0 0 0' }}>Orders currently active.</p>
                      </Card.Body>
                    </Card>
                  </Col>

                  <Col md={12}>
                    <Card
                      className="support-bar overflow-hidden border-0 shadow-sm"
                      onClick={() => navigate('/all-orders')}
                      style={{ background: '#f8fafc', borderRadius: 12, marginTop: 4, cursor: 'pointer' }}
                    >
                      <Card.Body className="p-3">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                          <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '13.5px' }}>Fulfillment Completion Progress</span>
                          <span style={{ fontSize: '12px', fontWeight: 700, color: '#088b46' }}>{Number(stats.deliveredOrders || 0).toLocaleString()} / {Number(stats.totalOrders || 0).toLocaleString()} Orders</span>
                        </div>
                        <Progress percent={Math.min(100, Math.max(0, Number(completionRate) || 0))} strokeColor="#088b46" status="active" />
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              </div>
            </Col>
          </Row>
        </>
      )}
    </div>
  );
}
