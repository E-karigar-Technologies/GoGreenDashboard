import React from 'react';
import { Card, Button, Table, Row, Col, Avatar, Tag, Image as AntImage, Divider, Steps } from 'antd';
import {
  User as UserIcon,
  Store as StoreIcon,
  Bike as BikeIcon,
  MapPin,
  Phone,
  Mail,
  DollarSign,
  ShoppingCart,
  Image as LucideImage,
  ArrowLeft,
  Hash,
  BadgeCheck,
  Printer,
  Calendar,
  CreditCard,
  Building,
  Home,
  Compass
} from 'lucide-react';
import { getOrderStatus, calculateOrderFinancials } from './hooks/useOrder';
import styles from './orders.module.scss';

const labelFixedStyle = { width: 140, fontWeight: 600, color: '#64748b', fontSize: '13.5px' };
const valueFlexStyle = { flex: 1, color: '#0f172a', fontWeight: 500, fontSize: '13.5px' };
const fieldRowStyle = { display: 'flex', alignItems: 'flex-start', marginBottom: 8 };

const sectionTitle = (icon, text) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 16, fontWeight: 700, color: '#0f172a', marginBottom: 16 }}>
    {icon}
    <span>{text}</span>
  </div>
);

const SingleOrder = ({ order, onBack }) => {
  if (!order) {
    return (
      <Card style={{ maxWidth: 800, margin: '24px auto', borderRadius: 12, textAlign: 'center' }}>
        <h3>No Order Details Found</h3>
        <p style={{ color: '#64748b' }}>The requested order record could not be loaded.</p>
        <Button icon={<ArrowLeft size={16} />} onClick={onBack} type="primary">
          Back to Orders
        </Button>
      </Card>
    );
  }

  const addressType = (type) => {
    if (type === 1) return { label: 'Home', icon: <Home size={12} /> };
    if (type === 2) return { label: 'Work', icon: <Building size={12} /> };
    return { label: 'Other', icon: <Compass size={12} /> };
  };

  const financials = calculateOrderFinancials(order);
  const status = getOrderStatus(order.order_status);

  // Address parsing
  const addr = order.address || {};
  const addrText = typeof addr === 'string' ? addr : addr?.address || '-';
  const addrInfo = addressType(addr?.type);
  const floor = addr?.floor ? `Floor ${addr.floor}` : null;
  const landmark = addr?.landmark ? `Landmark: ${addr.landmark}` : null;

  // Products table columns
  const productColumns = [
    {
      title: 'Item',
      key: 'product_image',
      width: 70,
      render: (_, record) => {
        const img = record.featured_image || record.image;
        return img ? (
          <AntImage
            src={img}
            alt={record.product_name || 'Product'}
            width={50}
            height={50}
            style={{ objectFit: 'cover', borderRadius: 8, border: '1px solid #e2e8f0' }}
          />
        ) : (
          <div style={{ width: 50, height: 50, background: '#f1f5f9', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
            <LucideImage size={20} />
          </div>
        );
      },
    },
    {
      title: 'Product Details',
      dataIndex: 'product_name',
      key: 'product_name',
      render: (name, record) => (
        <div>
          <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '14px' }}>
            {name || record.name || 'Unnamed Product'}
          </div>
          {record.product_size && (
            <Tag color="blue" style={{ fontSize: '11px', marginTop: 3 }}>
              Variant / Size: {record.product_size}
            </Tag>
          )}
        </div>
      ),
    },
    {
      title: 'Unit Price',
      dataIndex: 'single_item_price',
      key: 'single_item_price',
      align: 'right',
      width: 110,
      render: (price) => (
        <span style={{ fontWeight: 500, color: '#334155' }}>
          ${Number(price || 0).toFixed(2)}
        </span>
      ),
    },
    {
      title: 'Qty',
      dataIndex: 'product_quantity',
      key: 'product_quantity',
      align: 'center',
      width: 80,
      render: (qty) => (
        <Tag color="cyan" style={{ fontWeight: 700, borderRadius: 10, padding: '2px 8px' }}>
          x{qty || 1}
        </Tag>
      ),
    },
    {
      title: 'Total Price',
      dataIndex: 'total_item_price',
      key: 'total_item_price',
      align: 'right',
      width: 120,
      render: (price, record) => {
        const itemTotal = price || (Number(record.single_item_price || 0) * Number(record.product_quantity || 1));
        return (
          <span style={{ fontWeight: 700, color: '#088b46', fontSize: '14px' }}>
            ${Number(itemTotal || 0).toFixed(2)}
          </span>
        );
      },
    },
  ];

  // Determine current step index for the tracker
  let currentStep = 0;
  const statusNum = Number(order.order_status);
  if (statusNum === 1) currentStep = 1;
  else if (statusNum === 2) currentStep = 2;
  else if (statusNum === 4) currentStep = 4;
  else if (statusNum === 3 || statusNum === 5) currentStep = 4; // Rejected step

  const isRejected = statusNum === 3 || statusNum === 5;

  return (
    <div style={{ margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header Bar */}
      <div
        className={styles.noPrint}
        style={{
          background: '#ffffff',
          borderRadius: 12,
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
          border: '1px solid #e2e8f0',
          padding: '16px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Button icon={<ArrowLeft size={16} />} onClick={onBack} type="default" style={{ fontWeight: 600, borderRadius: 8 }}>
            Back to Orders
          </Button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Hash size={18} color="#0284c7" />
            <span style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>
              Order #{order.order_uid || order.order_id || order.id}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Tag color={status.color} style={{ fontSize: '14px', padding: '4px 12px', borderRadius: 12, fontWeight: 700, margin: 0 }}>
            {status.text}
          </Tag>
          <Button
            icon={<Printer size={16} />}
            onClick={() => window.print()}
            type="primary"
            style={{ background: '#088b46', border: 'none', borderRadius: 8, fontWeight: 600 }}
          >
            Print Invoice
          </Button>
        </div>
      </div>

      {/* Visual Order Progress Tracker */}
      <div className={`${styles.orderStepsCard} ${styles.noPrint}`}>
        <Steps
          current={currentStep}
          status={isRejected ? 'error' : 'process'}
          items={[
            { title: 'Pending', description: 'Order Placed' },
            { title: 'Confirmed', description: 'Store Accepted' },
            { title: 'Assigned', description: 'Rider Allocated' },
            { title: 'Picked Up', description: 'On The Way' },
            { title: isRejected ? 'Rejected' : 'Delivered', description: isRejected ? 'Order Cancelled' : 'Completed' },
          ]}
        />
      </div>

      {/* Printable / Detail Section */}
      <div className={styles.printableReceipt}>
        {/* Customer & Vendor Summary Cards */}
        <Row gutter={[20, 20]} style={{ marginBottom: 20 }}>
          {/* Customer Card */}
          <Col xs={24} md={12}>
            <Card bordered={false} className={styles.detailCard} style={{ height: '100%' }}>
              {sectionTitle(<UserIcon size={18} color="#0284c7" />, 'Customer Information')}
              <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                <Avatar size={54} icon={<UserIcon size={26} />} style={{ background: '#e0f2fe', color: '#0284c7', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={fieldRowStyle}>
                    <span style={labelFixedStyle}>Customer Name:</span>
                    <span style={valueFlexStyle}>
                      {[order.user?.firstname, order.user?.lastname].filter(Boolean).join(' ') || order.user?.name || 'Guest Customer'}
                      {order.user?.custom_id && <span style={{ fontSize: '11px', color: '#64748b', marginLeft: 6 }}>(ID: {order.user.custom_id})</span>}
                    </span>
                  </div>

                  {(order.user?.phonenumber || order.user?.prefix) && (
                    <div style={fieldRowStyle}>
                      <span style={labelFixedStyle}>Phone Number:</span>
                      <span style={valueFlexStyle}>
                        <Phone size={13} style={{ marginRight: 4, color: '#0284c7' }} />
                        {[order.user.prefix, order.user.phonenumber].filter(Boolean).join(' ')}
                      </span>
                    </div>
                  )}

                  {order.user?.email && (
                    <div style={fieldRowStyle}>
                      <span style={labelFixedStyle}>Email Address:</span>
                      <span style={valueFlexStyle}>
                        <Mail size={13} style={{ marginRight: 4, color: '#0284c7' }} />
                        {order.user.email}
                      </span>
                    </div>
                  )}

                  <div style={fieldRowStyle}>
                    <span style={labelFixedStyle}>Delivery Address:</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                        {addrInfo && (
                          <Tag color="purple" style={{ fontSize: '11px', margin: 0, padding: '0 6px', display: 'flex', alignItems: 'center', gap: 4 }}>
                            {addrInfo.icon}
                            {addrInfo.label}
                          </Tag>
                        )}
                        {floor && <Tag color="blue" style={{ fontSize: '11px', margin: 0 }}>{floor}</Tag>}
                      </div>
                      <div style={{ fontSize: '13px', color: '#334155', marginTop: 4 }}>
                        <MapPin size={13} style={{ marginRight: 4, color: '#ef4444' }} />
                        {addrText}
                      </div>
                      {landmark && <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: 2 }}>{landmark}</div>}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </Col>

          {/* Vendor Card */}
          <Col xs={24} md={12}>
            <Card bordered={false} className={styles.detailCard} style={{ height: '100%' }}>
              {sectionTitle(<StoreIcon size={18} color="#d97706" />, 'Vendor / Store Information')}
              <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                {order.vendor?.store_image ? (
                  <img
                    src={order.vendor.store_image}
                    alt="Store"
                    style={{ width: 54, height: 54, borderRadius: 10, objectFit: 'cover', border: '1px solid #e2e8f0', flexShrink: 0 }}
                  />
                ) : (
                  <Avatar size={54} icon={<StoreIcon size={26} />} style={{ background: '#fef3c7', color: '#d97706', flexShrink: 0 }} />
                )}
                <div style={{ flex: 1 }}>
                  <div style={fieldRowStyle}>
                    <span style={labelFixedStyle}>Store Name:</span>
                    <span style={{ ...valueFlexStyle, fontWeight: 700 }}>
                      {order.vendor?.store_name || 'Store N/A'}
                      {order.vendor?.custom_id && <span style={{ fontSize: '11px', color: '#64748b', marginLeft: 6 }}>(ID: {order.vendor.custom_id})</span>}
                    </span>
                  </div>

                  {order.vendor?.store_address && (
                    <div style={fieldRowStyle}>
                      <span style={labelFixedStyle}>Store Address:</span>
                      <span style={valueFlexStyle}>
                        <MapPin size={13} style={{ marginRight: 4, color: '#d97706' }} />
                        {order.vendor.store_address}
                      </span>
                    </div>
                  )}

                  {(order.vendor?.phone || order.vendor?.phonenumber) && (
                    <div style={fieldRowStyle}>
                      <span style={labelFixedStyle}>Contact Phone:</span>
                      <span style={valueFlexStyle}>
                        <Phone size={13} style={{ marginRight: 4, color: '#d97706' }} />
                        {order.vendor.phone || order.vendor.phonenumber}
                      </span>
                    </div>
                  )}

                  {order.created_at && (
                    <div style={fieldRowStyle}>
                      <span style={labelFixedStyle}>Order Date:</span>
                      <span style={valueFlexStyle}>
                        <Calendar size={13} style={{ marginRight: 4, color: '#64748b' }} />
                        {new Date(order.created_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </Col>
        </Row>

        {/* Ordered Products Table */}
        <Card bordered={false} className={styles.detailCard} style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            {sectionTitle(<ShoppingCart size={18} color="#088b46" />, `Ordered Items (${(order.products || []).length})`)}
            <Tag color="cyan" style={{ fontWeight: 600, borderRadius: 10 }}>
              Total Qty: {order.total_quantity || (order.products || []).reduce((sum, p) => sum + Number(p.product_quantity || 1), 0)}
            </Tag>
          </div>
          <Table
            columns={productColumns}
            dataSource={order.products || []}
            rowKey={(record, index) => record.id || index}
            pagination={false}
            scroll={{ x: 'max-content' }}
          />
        </Card>

        {/* Rider & Financial Breakdown Cards */}
        <Row gutter={[20, 20]}>
          {/* Rider Details Card */}
          <Col xs={24} md={12}>
            <Card bordered={false} className={styles.detailCard} style={{ height: '100%' }}>
              {sectionTitle(<BikeIcon size={18} color="#9333ea" />, 'Delivery Partner / Rider')}
              {order.rider ? (
                <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                  <Avatar size={54} icon={<BikeIcon size={26} />} style={{ background: '#f3e8ff', color: '#9333ea', flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={fieldRowStyle}>
                      <span style={labelFixedStyle}>Rider Name:</span>
                      <span style={{ ...valueFlexStyle, fontWeight: 700 }}>
                        {[order.rider.firstname, order.rider.lastname].filter(Boolean).join(' ') || 'Assigned Rider'}
                        {order.rider.custom_id && <span style={{ fontSize: '11px', color: '#64748b', marginLeft: 6 }}>(ID: {order.rider.custom_id})</span>}
                      </span>
                    </div>

                    {(order.rider.phonenumber || order.rider.phone) && (
                      <div style={fieldRowStyle}>
                        <span style={labelFixedStyle}>Rider Phone:</span>
                        <span style={valueFlexStyle}>
                          <Phone size={13} style={{ marginRight: 4, color: '#9333ea' }} />
                          {[order.rider.prefix, order.rider.phonenumber || order.rider.phone].filter(Boolean).join(' ')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div style={{ padding: '24px 0', textAlign: 'center', color: '#94a3b8' }}>
                  <BikeIcon size={36} style={{ marginBottom: 8, opacity: 0.5 }} />
                  <div style={{ fontWeight: 500 }}>No rider assigned yet</div>
                </div>
              )}
            </Card>
          </Col>

          {/* Financial Breakdown Card */}
          <Col xs={24} md={12}>
            <Card bordered={false} className={styles.detailCard} style={{ height: '100%' }}>
              {sectionTitle(<DollarSign size={18} color="#088b46" />, 'Financial & Payment Breakdown')}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={fieldRowStyle}>
                  <span style={labelFixedStyle}>Payment Method:</span>
                  <span style={valueFlexStyle}>
                    <CreditCard size={13} style={{ marginRight: 4, color: '#088b46' }} />
                    <Tag color="purple" style={{ textTransform: 'uppercase', fontWeight: 700, margin: 0 }}>
                      {order.payment_method || 'COD'}
                    </Tag>
                  </span>
                </div>

                <div style={fieldRowStyle}>
                  <span style={labelFixedStyle}>Payment Status:</span>
                  <span style={valueFlexStyle}>
                    <Tag color={order.order_payment_status === 1 ? 'green' : 'volcano'} style={{ fontWeight: 700, margin: 0 }}>
                      {order.order_payment_status === 1 ? 'PAID' : 'UNPAID'}
                    </Tag>
                  </span>
                </div>

                <Divider style={{ margin: '8px 0' }} />

                <div style={fieldRowStyle}>
                  <span style={labelFixedStyle}>Items Subtotal:</span>
                  <span style={valueFlexStyle}>${financials.itemsPrice.toFixed(2)}</span>
                </div>

                {financials.deliveryCharge > 0 && (
                  <div style={fieldRowStyle}>
                    <span style={labelFixedStyle}>Delivery Fee:</span>
                    <span style={valueFlexStyle}>${financials.deliveryCharge.toFixed(2)}</span>
                  </div>
                )}

                {financials.fastDeliveryCharge > 0 && (
                  <div style={fieldRowStyle}>
                    <span style={labelFixedStyle}>Express Delivery:</span>
                    <span style={valueFlexStyle}>${financials.fastDeliveryCharge.toFixed(2)}</span>
                  </div>
                )}

                {financials.tip > 0 && (
                  <div style={fieldRowStyle}>
                    <span style={labelFixedStyle}>Rider Tip {financials.tipPct > 0 ? `(${financials.tipPct}%)` : ''}:</span>
                    <span style={{ ...valueFlexStyle, color: '#d97706' }}>+${financials.tip.toFixed(2)}</span>
                  </div>
                )}

                <Divider style={{ margin: '8px 0' }} />

                <div style={{ ...fieldRowStyle, alignItems: 'center' }}>
                  <span style={{ ...labelFixedStyle, fontSize: '15px', color: '#0f172a', fontWeight: 700 }}>
                    Overall Amount:
                  </span>
                  <span style={{ ...valueFlexStyle, fontSize: '20px', color: '#088b46', fontWeight: 800 }}>
                    ${financials.overall.toFixed(2)}
                  </span>
                </div>
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default SingleOrder;
