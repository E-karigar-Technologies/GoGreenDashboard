import React, { useState } from 'react';
import { Table, Alert, Space, Button, Tag, Badge, Tooltip, Avatar, Popover, Row, Col } from 'antd';
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
  RightOutlined,
  DownOutlined,
} from '@ant-design/icons';
import useOrder, { getOrderStatus, parseOrderTime, parseOrderIdNum, calculateOrderFinancials } from './hooks/useOrder';
import useOrderFilterOptions from './hooks/useOrderFilterOptions';
import SingleOrder from './SingleOrder';
import OrderFilters from './OrderFilters';
import useDebounce from '../../../hooks/useDebounce';
import styles from './orders.module.scss';

const Orders = () => {
  const {
    orders,
    total,
    page,
    limit,
    search,
    vendorId,
    riderId,
    userId,
    status,
    sort,
    dateType,
    singleDate,
    rangeDates,
    loading,
    error,
    setPage,
    setLimit,
    setSearch,
    setVendorId,
    setRiderId,
    setUserId,
    setStatus,
    setSort,
    setDateType,
    setSingleDate,
    setRangeDates,
    resetFilters,
    refetch,
  } = useOrder();

  const { vendors, riders, customers, loading: filterOptionsLoading } = useOrderFilterOptions();
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searchInput, setSearchInput] = useState(search);

  // Sync internal search input with external/URL search state
  React.useEffect(() => {
    setSearchInput(search);
  }, [search]);

  const debouncedSearch = useDebounce(searchInput, 500);

  React.useEffect(() => {
    setSearch(debouncedSearch);
  }, [debouncedSearch, setSearch]);

  // Compute stat totals
  const totalRevenue = orders.reduce((sum, o) => sum + calculateOrderFinancials(o).overall, 0);
  const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;
  const deliveredCount = orders.filter((o) => o.order_status === 4).length;
  const pendingCount = orders.filter((o) => o.order_status === 0).length;

  // Expanded row renderer (dropdown panel for full order details without horizontal scroll)
  const renderExpandedRow = (record) => {
    const { itemsPrice, deliveryCharge, fastDeliveryCharge, tip, tipPct, overall } = calculateOrderFinancials(record);
    const u = record.user || {};
    const addr = record.address || {};
    const addrText = typeof addr === 'string' ? addr : addr?.address;
    const floor = addr?.floor ? `Floor ${addr.floor}` : null;
    const landmark = addr?.landmark;
    const extraAddrInfo = [floor, landmark].filter(Boolean).join(', ');
    const v = record.vendor || {};
    const r = record.rider;
    const products = record.products || [];
    const pm = record.payment_method || 'COD';
    const isPaid = record.order_payment_status === 1;

    return (
      <div className={styles.expandedOrderContainer}>
        <Row gutter={[12, 12]}>
          {/* Col 1: Customer & Delivery Address */}
          <Col xs={24} sm={12} xl={6}>
            <div className={styles.expandedSection}>
              <div className={styles.expandedSectionTitle}>
                <EnvironmentOutlined style={{ color: '#0284c7' }} /> Delivery Address
              </div>
              <div className={styles.expandedSectionContent}>
                <div style={{ fontWeight: 600, color: '#0f172a' }}>
                  {[u.firstname, u.lastname].filter(Boolean).join(' ') || u.name || 'Customer'}
                </div>
                <div style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 6px 0' }}>
                  {[u.prefix, u.phonenumber].filter(Boolean).join(' ')} {u.email && `• ${u.email}`}
                </div>
                {addrText ? (
                  <div style={{ fontSize: '12px', color: '#334155', background: '#f1f5f9', padding: '6px 8px', borderRadius: '6px' }}>
                    {addr?.type && (
                      <Tag color="purple" style={{ fontSize: '10px', padding: '0 4px', marginRight: 4 }}>
                        {addr.type === 1 ? 'Home' : addr.type === 2 ? 'Work' : 'Other'}
                      </Tag>
                    )}
                    {addrText}
                    {extraAddrInfo && <div style={{ color: '#64748b', fontSize: '11px', marginTop: 2 }}>{extraAddrInfo}</div>}
                  </div>
                ) : (
                  <div style={{ fontSize: '12px', color: '#94a3b8' }}>No address provided</div>
                )}
              </div>
            </div>
          </Col>

          {/* Col 2: Store / Vendor */}
          <Col xs={24} sm={12} xl={6}>
            <div className={styles.expandedSection}>
              <div className={styles.expandedSectionTitle}>
                <ShopOutlined style={{ color: '#d97706' }} /> Store / Vendor
              </div>
              <div className={styles.expandedSectionContent}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {v.store_image ? (
                    <img src={v.store_image} alt="Store" style={{ width: 36, height: 36, borderRadius: 6, objectFit: 'cover' }} />
                  ) : (
                    <Avatar size={36} icon={<ShopOutlined />} style={{ backgroundColor: '#fef3c7', color: '#d97706' }} />
                  )}
                  <div>
                    <div style={{ fontWeight: 600, color: '#0f172a' }}>{v.store_name || 'Vendor'}</div>
                    {v.store_address && (
                      <div style={{ fontSize: '11.5px', color: '#64748b' }}>{v.store_address}</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Col>

          {/* Col 3: Assigned Rider */}
          <Col xs={24} sm={12} xl={6}>
            <div className={styles.expandedSection}>
              <div className={styles.expandedSectionTitle}>
                <CarOutlined style={{ color: '#9333ea' }} /> Assigned Rider
              </div>
              <div className={styles.expandedSectionContent}>
                {r ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Avatar size={36} icon={<CarOutlined />} style={{ backgroundColor: '#f3e8ff', color: '#9333ea' }} />
                    <div>
                      <div style={{ fontWeight: 600, color: '#0f172a' }}>
                        {[r.firstname, r.lastname].filter(Boolean).join(' ') || 'Rider'}
                      </div>
                      {r.custom_id && <div style={{ fontSize: '11px', color: '#64748b' }}>ID: {r.custom_id}</div>}
                      {r.phonenumber && <div style={{ fontSize: '11px', color: '#64748b' }}>{r.phonenumber}</div>}
                    </div>
                  </div>
                ) : (
                  <Tag color="default" style={{ padding: '4px 8px', fontSize: '12px' }}>No Rider Assigned</Tag>
                )}
              </div>
            </div>
          </Col>

          {/* Col 4: Financials & Payment Details */}
          <Col xs={24} sm={12} xl={6}>
            <div className={styles.expandedSection}>
              <div className={styles.expandedSectionTitle}>
                <DollarOutlined style={{ color: '#088b46' }} /> Financials & Payment
              </div>
              <div className={styles.expandedSectionContent} style={{ fontSize: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                  <span style={{ color: '#64748b' }}>Items Subtotal:</span>
                  <strong>${itemsPrice.toFixed(2)}</strong>
                </div>
                {deliveryCharge > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                    <span style={{ color: '#64748b' }}>Delivery Fee:</span>
                    <span>${deliveryCharge.toFixed(2)}</span>
                  </div>
                )}
                {fastDeliveryCharge > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                    <span style={{ color: '#64748b' }}>Express Fee:</span>
                    <span>${fastDeliveryCharge.toFixed(2)}</span>
                  </div>
                )}
                {tip > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                    <span style={{ color: '#64748b' }}>Tip:</span>
                    <span>${tip.toFixed(2)}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: 4, marginTop: 4 }}>
                  <span style={{ fontWeight: 700, color: '#0f172a' }}>Total:</span>
                  <span style={{ fontWeight: 800, color: '#088b46', fontSize: '14px' }}>${overall.toFixed(2)}</span>
                </div>
                <div style={{ marginTop: 6, display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                  <Tag color="purple" style={{ margin: 0, textTransform: 'uppercase', fontWeight: 700, fontSize: '10px' }}>
                    {pm}
                  </Tag>
                  <Tag color={isPaid ? 'green' : 'red'} style={{ margin: 0, fontWeight: 700, fontSize: '10px' }}>
                    {isPaid ? 'Paid' : 'Unpaid'}
                  </Tag>
                  {record.created_at && (
                    <span style={{ fontSize: '11px', color: '#64748b', marginLeft: 'auto' }}>
                      {new Date(record.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </Col>

          {/* Ordered Items Preview */}
          {products.length > 0 && (
            <Col span={24}>
              <div className={styles.expandedItemsBox}>
                <div style={{ fontWeight: 700, fontSize: '12px', color: '#475569', marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Ordered Items ({products.length})</span>
                  <Button
                    size="small"
                    type="primary"
                    icon={<EyeOutlined />}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedOrder(record);
                    }}
                    style={{ background: '#088b46', borderColor: '#088b46', fontSize: '11px' }}
                  >
                    View Full Order & Invoice
                  </Button>
                </div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {products.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#f8fafc', padding: '6px 10px', borderRadius: 6, border: '1px solid #e2e8f0' }}>
                      {(item.featured_image || item.image) ? (
                        <img src={item.featured_image || item.image} alt={item.product_name} style={{ width: 28, height: 28, borderRadius: 4, objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: 28, height: 28, borderRadius: 4, background: '#e2e8f0' }} />
                      )}
                      <div style={{ fontSize: '12px', fontWeight: 600, color: '#1e293b' }}>
                        {item.product_name || item.name}
                      </div>
                      <Tag color="blue" style={{ fontSize: '10px', padding: '0 4px', margin: 0 }}>
                        x{item.product_quantity || 1}
                      </Tag>
                      {item.price && (
                        <span style={{ fontSize: '11.5px', color: '#088b46', fontWeight: 700 }}>
                          ${Number(item.price).toFixed(2)}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </Col>
          )}
        </Row>
      </div>
    );
  };

  const columns = [
    {
      title: 'ORDER ID',
      key: 'order_id',
      sorter: (a, b) => parseOrderIdNum(a) - parseOrderIdNum(b),
      render: (_, record) => {
        const uid = record.order_uid || record.order_id || record.id;
        const dateStr = record.created_at
          ? new Date(record.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })
          : null;
        return (
          <div style={{ minWidth: 140 }}>
            <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '13px', letterSpacing: '0.2px' }}>
              #{uid ? String(uid) : '-'}
            </div>
            <div style={{ fontSize: '11px', color: '#64748b', marginTop: 2, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {record.order_id && record.order_id !== uid && <span>Ref: #{record.order_id}</span>}
              {dateStr && <span>• {dateStr}</span>}
            </div>
          </div>
        );
      },
    },
    {
      title: 'CUSTOMER',
      key: 'customer',
      render: (_, record) => {
        const u = record.user || {};
        const fullName = [u.firstname, u.lastname].filter(Boolean).join(' ') || u.name || 'Customer';
        const phone = [u.prefix, u.phonenumber].filter(Boolean).join(' ');
        const addr = record.address || {};

        return (
          <div style={{ minWidth: 150 }}>
            <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '13px' }}>
              {fullName}
              {addr?.type && (
                <Tag color="purple" style={{ fontSize: '9px', padding: '0 3px', marginLeft: 4, height: 16, lineHeight: '14px' }}>
                  {addr.type === 1 ? 'Home' : addr.type === 2 ? 'Work' : 'Other'}
                </Tag>
              )}
            </div>
            {phone && (
              <div style={{ fontSize: '11.5px', color: '#64748b' }}>
                {phone}
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: 'STORE',
      key: 'vendor',
      responsive: ['xxl'],
      render: (_, record) => {
        const v = record.vendor || {};
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 120 }}>
            {v.store_image ? (
              <img
                src={v.store_image}
                alt="Store"
                style={{ width: 24, height: 24, borderRadius: 6, objectFit: 'cover' }}
              />
            ) : (
              <Avatar size={24} icon={<ShopOutlined />} style={{ backgroundColor: '#fef3c7', color: '#d97706' }} />
            )}
            <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '12px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {v.store_name || '-'}
            </div>
          </div>
        );
      },
    },
    {
      title: 'AMOUNT',
      key: 'overall_amount',
      sorter: (a, b) => calculateOrderFinancials(a).overall - calculateOrderFinancials(b).overall,
      render: (_, record) => {
        const { overall } = calculateOrderFinancials(record);
        const pm = record.payment_method || 'COD';
        const isPaid = record.order_payment_status === 1;

        return (
          <div style={{ minWidth: 110 }}>
            <div style={{ fontWeight: 800, color: '#088b46', fontSize: '14px' }}>
              ${overall.toFixed(2)}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
              <span style={{ fontSize: '10px', fontWeight: 700, color: '#6366f1', background: '#eef2ff', padding: '1px 4px', borderRadius: 3 }}>
                {pm.toUpperCase()}
              </span>
              <span style={{ fontSize: '10px', fontWeight: 700, color: isPaid ? '#16a34a' : '#dc2626' }}>
                {isPaid ? 'Paid' : 'Unpaid'}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      title: 'STATUS',
      dataIndex: 'order_status',
      key: 'order_status',
      render: (statusVal) => {
        const s = getOrderStatus(statusVal);
        return (
          <Tag color={s.color} style={{ borderRadius: '12px', padding: '2px 8px', fontWeight: 700, fontSize: '11px', margin: 0 }}>
            {s.text}
          </Tag>
        );
      },
    },
    {
      title: 'ACTION',
      key: 'action',
      width: 80,
      align: 'center',
      render: (_, record) => (
        <Tooltip title="View Full Order Invoice">
          <Button
            type="primary"
            size="small"
            icon={<EyeOutlined />}
            style={{ borderRadius: '6px', background: '#088b46', border: 'none', fontWeight: 600, fontSize: '11.5px' }}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedOrder(record);
            }}
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
          onSearchSubmit={(val) => {
            setSearchInput(val);
            setSearch(val);
          }}
          dateType={dateType}
          onDateTypeChange={setDateType}
          singleDate={singleDate}
          onSingleDateChange={setSingleDate}
          rangeDates={rangeDates}
          onRangeDatesChange={setRangeDates}
          status={status}
          onStatusChange={setStatus}
          vendorId={vendorId}
          onVendorChange={setVendorId}
          riderId={riderId}
          onRiderChange={setRiderId}
          userId={userId}
          onUserChange={setUserId}
          sort={sort}
          onSortChange={setSort}
          onReset={() => {
            setSearchInput('');
            resetFilters();
          }}
          vendors={vendors}
          riders={riders}
          customers={customers}
          filterOptionsLoading={filterOptionsLoading}
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
          className={styles.ordersTable}
          columns={columns}
          dataSource={orders}
          rowKey={(record) => record.order_id || record.id || record.order_uid}
          loading={loading}
          expandable={{
            expandedRowRender: renderExpandedRow,
            rowExpandable: () => true,
            expandRowByClick: true,
          }}
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