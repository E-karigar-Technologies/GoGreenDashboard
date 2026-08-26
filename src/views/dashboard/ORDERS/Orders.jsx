import React, { useState } from 'react';
import { Table, Alert, Space, Button, Tag, Badge, Tooltip, Avatar } from 'antd';
import { ShoppingCartOutlined, DollarOutlined, EyeOutlined, CheckCircleOutlined, ShopOutlined, EnvironmentOutlined } from '@ant-design/icons';
import useOrder, { getOrderStatus, parseOrderTime, parseOrderIdNum, calculateOrderFinancials } from './hooks/useOrder';
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
      key: 'order_id',
      sorter: (a, b) => parseOrderIdNum(a) - parseOrderIdNum(b),
      render: (_, record) => {
        const uid = record.order_uid || record.order_id || record.id;
        return (
          <div>
            <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '13.5px' }}>
              {uid ? String(uid) : '-'}
            </div>
            {record.order_id && (
              <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 500 }}>
                ID: #{record.order_id}
              </span>
            )}
          </div>
        );
      },
    },
    {
      title: 'Customer & Delivery Address',
      key: 'customer',
      width: 260,
      render: (_, record) => {
        const u = record.user || {};
        const addr = record.address || {};

        const fullName = [u.firstname, u.lastname].filter(Boolean).join(' ') || u.name || 'Customer';
        const phone = [u.prefix, u.phonenumber].filter(Boolean).join(' ');
        const email = u.email;
        const customId = u.custom_id;

        const addrText = typeof addr === 'string' ? addr : addr?.address;
        const addrType = addr?.type === 1 ? 'Home' : addr?.type === 2 ? 'Work' : addr?.type === 3 ? 'Other' : null;
        const floor = addr?.floor ? `Floor ${addr.floor}` : null;
        const landmark = addr?.landmark;
        const extraAddrInfo = [floor, landmark].filter(Boolean).join(', ');

        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '13.5px' }}>
              {fullName}
              {customId && <span style={{ fontSize: '11px', color: '#64748b', marginLeft: 4 }}>(ID: {customId})</span>}
            </div>

            {(phone || email) && (
              <div style={{ fontSize: '11.5px', color: '#64748b' }}>
                {phone && <span>{phone}</span>}
                {phone && email && <span style={{ margin: '0 4px' }}>•</span>}
                {email && <span style={{ wordBreak: 'break-all' }}>{email}</span>}
              </div>
            )}

            {addrText && (
              <div style={{ marginTop: 3, display: 'flex', alignItems: 'flex-start', gap: 4 }}>
                {addrType && (
                  <Tag color="purple" style={{ fontSize: '10px', padding: '0 4px', margin: '2px 0 0 0', height: '18px', lineHeight: '16px' }}>
                    {addrType}
                  </Tag>
                )}
                <Tooltip title={extraAddrInfo ? `${addrText} (${extraAddrInfo})` : addrText}>
                  <div style={{ fontSize: '11.5px', color: '#475569', lineHeight: '1.3' }}>
                    <EnvironmentOutlined style={{ color: '#0284c7', marginRight: 3 }} />
                    {addrText.length > 45 ? `${addrText.slice(0, 45)}...` : addrText}
                    {extraAddrInfo && <span style={{ color: '#94a3b8', display: 'block', fontSize: '10.5px' }}>{extraAddrInfo}</span>}
                  </div>
                </Tooltip>
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: 'Vendor',
      key: 'vendor',
      width: 170,
      render: (_, record) => {
        const v = record.vendor || {};
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {v.store_image ? (
              <img
                src={v.store_image}
                alt="Store"
                style={{ width: 28, height: 28, borderRadius: 6, objectFit: 'cover', border: '1px solid #e2e8f0' }}
              />
            ) : (
              <Avatar size={28} icon={<ShopOutlined />} style={{ backgroundColor: '#e0f2fe', color: '#0284c7' }} />
            )}
            <div>
              <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '13px' }}>
                {v.store_name || '-'}
              </div>
              {v.store_address && (
                <div style={{ fontSize: '11px', color: '#64748b' }}>
                  {v.store_address}
                </div>
              )}
            </div>
          </div>
        );
      },
    },
    {
      title: 'Qty',
      dataIndex: 'total_quantity',
      key: 'total_quantity',
      align: 'center',
      width: 65,
      render: (qty) => <Badge count={qty || 0} style={{ backgroundColor: '#0284c7' }} />,
    },
    {
      title: 'Overall Amount',
      key: 'overall_amount',
      width: 160,
      sorter: (a, b) => calculateOrderFinancials(a).overall - calculateOrderFinancials(b).overall,
      render: (_, record) => {
        const { itemsPrice, deliveryCharge, fastDeliveryCharge, tip, tipPct, overall } = calculateOrderFinancials(record);

        const breakdownTooltip = (
          <div style={{ padding: '4px', fontSize: '12px' }}>
            <div>Items Subtotal: <strong>${itemsPrice.toFixed(2)}</strong></div>
            {deliveryCharge > 0 && <div>Rider Delivery: <strong>${deliveryCharge.toFixed(2)}</strong></div>}
            {fastDeliveryCharge > 0 && <div>Express Delivery: <strong>${fastDeliveryCharge.toFixed(2)}</strong></div>}
            {tip > 0 && (
              <div>
                Tip {tipPct > 0 ? `(${tipPct}%)` : ''}: <strong>+${tip.toFixed(2)}</strong>
              </div>
            )}
            <hr style={{ margin: '4px 0', borderColor: 'rgba(255,255,255,0.2)' }} />
            <div>Overall Amount: <strong style={{ color: '#4ade80' }}>${overall.toFixed(2)}</strong></div>
          </div>
        );

        return (
          <Tooltip title={breakdownTooltip}>
            <div style={{ cursor: 'pointer' }}>
              <div style={{ fontWeight: 700, color: '#088b46', fontSize: '15px' }}>
                ${overall.toFixed(2)}
              </div>
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 2 }}>
                {deliveryCharge > 0 && (
                  <Tag color="cyan" style={{ fontSize: '10px', padding: '0 4px', margin: 0 }}>
                    Del: ${deliveryCharge}
                  </Tag>
                )}
                {tip > 0 && (
                  <Tag color="gold" style={{ fontSize: '10px', padding: '0 4px', margin: 0 }}>
                    Tip: ${tip.toFixed(2)}
                  </Tag>
                )}
              </div>
            </div>
          </Tooltip>
        );
      },
    },
    {
      title: 'Payment',
      key: 'payment',
      width: 110,
      render: (_, record) => {
        const pm = record.payment_method || 'COD';
        const isPaid = record.order_payment_status === 1;
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Tag color="purple" style={{ textTransform: 'uppercase', width: 'fit-content', fontWeight: 600 }}>
              {pm}
            </Tag>
            <span style={{ fontSize: '10.5px', fontWeight: 600, color: isPaid ? '#16a34a' : '#dc2626' }}>
              {isPaid ? '• Paid' : '• Unpaid'}
            </span>
          </div>
        );
      },
    },
    {
      title: 'Status',
      dataIndex: 'order_status',
      key: 'order_status',
      width: 130,
      render: (statusVal) => {
        const s = getOrderStatus(statusVal);
        return <Tag color={s.color} style={{ borderRadius: '12px', padding: '2px 10px', fontWeight: 600 }}>{s.text}</Tag>;
      },
    },
    {
      title: 'Created At',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 140,
      sorter: (a, b) => parseOrderTime(a) - parseOrderTime(b),
      render: (text) => text ? new Date(text).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : '-',
    },
    {
      title: 'Action',
      key: 'action',
      width: 80,
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
  const totalRevenue = orders.reduce((sum, o) => sum + calculateOrderFinancials(o).overall, 0);

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
            <div className="stat-number">${totalRevenue.toLocaleString()}</div>
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