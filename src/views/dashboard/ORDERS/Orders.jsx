import React, { useState } from 'react';
import { Table, Alert, Space, Button, Tag, Badge, Tooltip, Avatar, Popover } from 'antd';
import {
  ShoppingCartOutlined,
  DollarOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  ShopOutlined,
  EnvironmentOutlined,
  ReloadOutlined,
  ClockCircleOutlined,
  CarOutlined,
  UserOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons';
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
    refetch,
  } = useOrder();

  const { vendors, loading: vendorsLoading } = useVendors();
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searchInput, setSearchInput] = useState(search);

  const debouncedSearch = useDebounce(searchInput, 500);

  React.useEffect(() => {
    setSearch(debouncedSearch);
  }, [debouncedSearch, setSearch]);

  // Compute stat totals
  const totalRevenue = orders.reduce((sum, o) => sum + calculateOrderFinancials(o).overall, 0);
  const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;
  const deliveredCount = orders.filter((o) => o.order_status === 4).length;
  const pendingCount = orders.filter((o) => o.order_status === 0).length;

  const columns = [
    {
      title: 'Order ID',
      key: 'order_id',
      width: 140,
      sorter: (a, b) => parseOrderIdNum(a) - parseOrderIdNum(b),
      render: (_, record) => {
        const uid = record.order_uid || record.order_id || record.id;
        return (
          <div>
            <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '13.5px', letterSpacing: '0.2px' }}>
              #{uid ? String(uid) : '-'}
            </div>
            {record.order_id && record.order_id !== uid && (
              <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 500 }}>
                Ref: #{record.order_id}
              </span>
            )}
          </div>
        );
      },
    },
    {
      title: 'Customer & Delivery Address',
      key: 'customer',
      width: 270,
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
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
              <div style={{ marginTop: 2, display: 'flex', alignItems: 'flex-start', gap: 4 }}>
                {addrType && (
                  <Tag color="purple" style={{ fontSize: '10px', padding: '0 5px', margin: '2px 0 0 0', height: '18px', lineHeight: '16px' }}>
                    {addrType}
                  </Tag>
                )}
                <Tooltip title={extraAddrInfo ? `${addrText} (${extraAddrInfo})` : addrText}>
                  <div style={{ fontSize: '11.5px', color: '#475569', lineHeight: '1.3' }}>
                    <EnvironmentOutlined style={{ color: '#0284c7', marginRight: 3 }} />
                    {addrText.length > 40 ? `${addrText.slice(0, 40)}...` : addrText}
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
      title: 'Store / Vendor',
      key: 'vendor',
      width: 180,
      render: (_, record) => {
        const v = record.vendor || {};
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {v.store_image ? (
              <img
                src={v.store_image}
                alt="Store"
                style={{ width: 32, height: 32, borderRadius: 8, objectFit: 'cover', border: '1px solid #e2e8f0' }}
              />
            ) : (
              <Avatar size={32} icon={<ShopOutlined />} style={{ backgroundColor: '#fef3c7', color: '#d97706' }} />
            )}
            <div>
              <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '13px' }}>
                {v.store_name || '-'}
              </div>
              {v.store_address && (
                <div style={{ fontSize: '11px', color: '#64748b' }}>
                  {v.store_address.length > 25 ? `${v.store_address.slice(0, 25)}...` : v.store_address}
                </div>
              )}
            </div>
          </div>
        );
      },
    },
    {
      title: 'Rider',
      key: 'rider',
      width: 150,
      render: (_, record) => {
        const r = record.rider;
        if (!r) {
          return <Tag color="default" style={{ color: '#64748b', fontSize: '11px' }}>Unassigned</Tag>;
        }
        const riderName = [r.firstname, r.lastname].filter(Boolean).join(' ') || 'Assigned Rider';
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Avatar size={24} icon={<CarOutlined />} style={{ backgroundColor: '#f3e8ff', color: '#9333ea' }} />
            <div>
              <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '12px' }}>
                {riderName}
              </div>
              {r.custom_id && (
                <span style={{ fontSize: '10.5px', color: '#64748b' }}>ID: {r.custom_id}</span>
              )}
            </div>
          </div>
        );
      },
    },
    {
      title: 'Items',
      key: 'items',
      align: 'center',
      width: 90,
      render: (_, record) => {
        const products = record.products || [];
        const totalQty = record.total_quantity || products.reduce((sum, p) => sum + Number(p.product_quantity || 1), 0);

        const itemsPopover = (
          <div style={{ maxWidth: 280, padding: 4 }}>
            <div style={{ fontWeight: 700, fontSize: '12px', marginBottom: 6, borderBottom: '1px solid #e2e8f0', paddingBottom: 4 }}>
              Ordered Products ({products.length})
            </div>
            {products.length === 0 ? (
              <span style={{ fontSize: '12px', color: '#94a3b8' }}>No item details available</span>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 200, overflowY: 'auto' }}>
                {products.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '12px' }}>
                    {(item.featured_image || item.image) ? (
                      <img src={item.featured_image || item.image} alt={item.product_name} style={{ width: 24, height: 24, borderRadius: 4, objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: 24, height: 24, borderRadius: 4, background: '#f1f5f9' }} />
                    )}
                    <div style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.product_name || item.name}
                    </div>
                    <Tag color="blue" style={{ fontSize: '10px', padding: '0 4px', margin: 0 }}>
                      x{item.product_quantity || 1}
                    </Tag>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

        return (
          <Popover content={itemsPopover} title={null} trigger="hover">
            <Tag color="cyan" style={{ cursor: 'pointer', fontWeight: 700, borderRadius: 12, padding: '2px 8px' }}>
              <UnorderedListOutlined style={{ marginRight: 4 }} />
              {totalQty}
            </Tag>
          </Popover>
        );
      },
    },
    {
      title: 'Financials',
      key: 'overall_amount',
      width: 150,
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
              <div style={{ fontWeight: 800, color: '#088b46', fontSize: '15px' }}>
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
      title: 'Payment Mode',
      key: 'payment',
      width: 120,
      render: (_, record) => {
        const pm = record.payment_method || 'COD';
        const isPaid = record.order_payment_status === 1;
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Tag color="purple" style={{ textTransform: 'uppercase', width: 'fit-content', fontWeight: 700, borderRadius: 4 }}>
              {pm}
            </Tag>
            <span style={{ fontSize: '11px', fontWeight: 700, color: isPaid ? '#16a34a' : '#dc2626' }}>
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
      width: 140,
      render: (statusVal) => {
        const s = getOrderStatus(statusVal);
        return (
          <Tag color={s.color} style={{ borderRadius: '12px', padding: '3px 10px', fontWeight: 700, fontSize: '12px' }}>
            {s.text}
          </Tag>
        );
      },
    },
    {
      title: 'Order Date',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 140,
      sorter: (a, b) => parseOrderTime(a) - parseOrderTime(b),
      render: (text) => text ? new Date(text).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : '-',
    },
    {
      title: 'Action',
      key: 'action',
      width: 90,
      align: 'center',
      render: (_, record) => (
        <Tooltip title="View Detailed Order Invoice">
          <Button
            type="primary"
            size="small"
            icon={<EyeOutlined />}
            style={{ borderRadius: '6px', background: '#088b46', border: 'none', fontWeight: 600 }}
            onClick={() => setSelectedOrder(record)}
          >
            Details
          </Button>
        </Tooltip>
      ),
    },
  ];

  if (selectedOrder) {
    return <SingleOrder order={selectedOrder} onBack={() => setSelectedOrder(null)} />;
  }

  return (
    <div className="page-container">
      {/* Page Header */}
      <div className="page-header-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div className="header-title-block">
          <h2>Order Management</h2>
          <p>Real-time order monitoring, fulfillment tracking, financial breakdown, and detailed customer invoices.</p>
        </div>
        <Button
          icon={<ReloadOutlined spin={loading} />}
          onClick={refetch}
          type="default"
          style={{ borderRadius: 8, fontWeight: 600 }}
        >
          Refresh Live Data
        </Button>
      </div>

      {/* Dynamic Key Performance Indicator Stats */}
      <div className="page-stats-grid">
        <div className="page-stat-card">
          <div className="stat-meta">
            <div className="stat-label">Total Orders</div>
            <div className="stat-number">{total || orders.length}</div>
          </div>
          <div className="stat-icon" style={{ background: '#e0f2fe', color: '#0284c7' }}>
            <ShoppingCartOutlined />
          </div>
        </div>

        <div className="page-stat-card">
          <div className="stat-meta">
            <div className="stat-label">Total Revenue</div>
            <div className="stat-number">${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          </div>
          <div className="stat-icon" style={{ background: '#dcfce7', color: '#088b46' }}>
            <DollarOutlined />
          </div>
        </div>

        <div className="page-stat-card">
          <div className="stat-meta">
            <div className="stat-label">Avg Order Value (AOV)</div>
            <div className="stat-number">${avgOrderValue.toFixed(2)}</div>
          </div>
          <div className="stat-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
            <ClockCircleOutlined />
          </div>
        </div>

        <div className="page-stat-card">
          <div className="stat-meta">
            <div className="stat-label">Delivered Orders</div>
            <div className="stat-number">{deliveredCount}</div>
          </div>
          <div className="stat-icon" style={{ background: '#f3e8ff', color: '#9333ea' }}>
            <CheckCircleOutlined />
          </div>
        </div>
      </div>

      {/* Orders Filter & Content Section */}
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
            message="Error fetching orders from server"
            description={error.message || String(error)}
            showIcon
            action={
              <Button size="small" type="primary" danger onClick={refetch}>
                Retry
              </Button>
            }
            style={{ marginBottom: 16, borderRadius: 8 }}
          />
        )}

        <Table
          columns={columns}
          dataSource={orders}
          rowKey={(record) => record.order_id || record.id || record.order_uid}
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