import React, { useState } from 'react';
import { Table, Alert, Space, Button, Tag, Badge, Tooltip } from 'antd';
import { ShoppingCartOutlined, DollarOutlined, EyeOutlined, CheckCircleOutlined } from '@ant-design/icons';
import useOrder, { getOrderStatus } from './hooks/useOrder';
import useVendors from './hooks/useVendors';
import SingleOrder from './SingleOrder';
import OrderFilters from './OrderFilters';
import useDebounce from '../../../hooks/useDebounce';

const Orders = () => {
  const {
    orders,
    total,
    page,
    limit,
    search,
    vendorId,
    status,
    dateRange,
    loading,
    error,
    setPage,
    setLimit,
    setSearch,
    setVendorId,
    setStatus,
    setDateRange,
  } = useOrder();
  const { vendors, loading: vendorsLoading } = useVendors();
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searchInput, setSearchInput] = useState(search);
  
  const debouncedSearch = useDebounce(searchInput, 500);
  
  React.useEffect(() => {
    setSearch(debouncedSearch);
  }, [debouncedSearch, setSearch]);

  const columns = [
    {
      title: 'Order ID',
      dataIndex: 'order_id',
      key: 'order_id',
      render: (text) => <span style={{ fontWeight: 600, color: '#0f172a' }}>#{text}</span>,
    },
    {
      title: 'Customer',
      dataIndex: ['user', 'custom_id'],
      key: 'user',
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 500, color: '#334155' }}>{record.user?.name || record.user?.custom_id || '-'}</div>
          <div style={{ fontSize: '12px', color: '#94a3b8' }}>ID: {record.user?.custom_id || '-'}</div>
        </div>
      ),
    },
    {
      title: 'Vendor',
      dataIndex: ['vendor', 'store_name'],
      key: 'vendor',
      render: (_, record) => <Tag color="blue">{record.vendor?.store_name || '-'}</Tag>,
    },
    {
      title: 'Qty',
      dataIndex: 'total_quantity',
      key: 'total_quantity',
      align: 'center',
      render: (qty) => <Badge count={qty} style={{ backgroundColor: '#0284c7' }} />,
    },
    {
      title: 'Total Price',
      dataIndex: 'total_price',
      key: 'total_price',
      render: (price) => <span style={{ fontWeight: 700, color: '#088b46' }}>₹{Number(price || 0).toLocaleString()}</span>,
    },
    {
      title: 'Payment',
      dataIndex: 'payment_method',
      key: 'payment_method',
      render: (pm) => <Tag color="purple" style={{ textTransform: 'uppercase' }}>{pm || 'COD'}</Tag>,
    },
    {
      title: 'Status',
      dataIndex: 'order_status',
      key: 'order_status',
      render: (statusVal) => {
        const s = getOrderStatus(statusVal);
        return <Tag color={s.color} style={{ borderRadius: '12px', padding: '2px 10px', fontWeight: 600 }}>{s.text}</Tag>;
      },
    },
    {
      title: 'Created At',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (text) => text ? new Date(text).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : '-',
    },
    {
      title: 'Action',
      key: 'action',
      align: 'center',
      render: (_, record) => (
        <Tooltip title="View Order Details">
          <Button
            type="primary"
            size="small"
            icon={<EyeOutlined />}
            style={{ borderRadius: '6px', background: '#088b46', border: 'none' }}
            onClick={() => setSelectedOrder(record)}
          >
            View
          </Button>
        </Tooltip>
      ),
    },
  ];

  if (selectedOrder) {
    return <SingleOrder order={selectedOrder} onBack={() => setSelectedOrder(null)} />;
  }

  // Compute stat totals
  const totalRevenue = orders.reduce((sum, o) => sum + (Number(o.total_price) || 0), 0);

  return (
    <div className="page-container">
      {/* Page Header */}
      <div className="page-header-card">
        <div className="header-title-block">
          <h2>Order Management</h2>
          <p>Monitor customer purchases, track fulfillment statuses, and manage store orders.</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="page-stats-grid">
        <div className="page-stat-card">
          <div className="stat-meta">
            <div className="stat-label">Total Orders Count</div>
            <div className="stat-number">{total || orders.length}</div>
          </div>
          <div className="stat-icon" style={{ background: '#e0f2fe', color: '#0284c7' }}>
            <ShoppingCartOutlined />
          </div>
        </div>

        <div className="page-stat-card">
          <div className="stat-meta">
            <div className="stat-label">Current Revenue</div>
            <div className="stat-number">₹{totalRevenue.toLocaleString()}</div>
          </div>
          <div className="stat-icon" style={{ background: '#dcfce7', color: '#088b46' }}>
            <DollarOutlined />
          </div>
        </div>

        <div className="page-stat-card">
          <div className="stat-meta">
            <div className="stat-label">Page Orders Count</div>
            <div className="stat-number">{orders.length}</div>
          </div>
          <div className="stat-icon" style={{ background: '#f3e8ff', color: '#9333ea' }}>
            <CheckCircleOutlined />
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="page-content-card">
        <OrderFilters
          searchInput={searchInput}
          onSearchInputChange={setSearchInput}
          onSearchSubmit={setSearch}
          vendorId={vendorId}
          onVendorChange={setVendorId}
          status={status}
          onStatusChange={setStatus}
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          vendors={vendors}
          vendorsLoading={vendorsLoading}
        />

        {error && (
          <Alert
            type="error"
            message="Error loading orders"
            description={error.message || String(error)}
            showIcon
            style={{ marginBottom: 16, borderRadius: 8 }}
          />
        )}

        <Table
          columns={columns}
          dataSource={orders}
          rowKey="order_id"
          loading={loading}
          scroll={{ x: 'max-content' }}
          pagination={{
            current: page,
            pageSize: limit,
            total: total,
            onChange: (page, pageSize) => {
              setPage(page);
              setLimit(pageSize);
            },
            showSizeChanger: true,
            pageSizeOptions: ['10', '25', '50', '100'],
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} orders`,
          }}
        />
      </div>
    </div>
  );
};

export default Orders;