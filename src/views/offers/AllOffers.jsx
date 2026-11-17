import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  Button,
  Input,
  Select,
  Tag,
  Switch,
  Space,
  Row,
  Col,
  Modal,
  Popconfirm,
  Tooltip,
  Typography,
  message,
  Card,
  Empty
} from 'antd';
import {
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  TagOutlined,
  DollarOutlined,
  PercentageOutlined,
  CarOutlined,
  EyeOutlined,
  CopyOutlined,
  ShoppingOutlined,
  FireOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import {
  getOffers,
  toggleOfferStatus,
  deleteOffer,
  getOfferCustomers
} from '../../services/apiService';
import styles from './offers.module.scss';

const { Option } = Select;
const { Text } = Typography;

const AllOffers = () => {
  const navigate = useNavigate();

  // Offers Data State
  const [offers, setOffers] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);

  // Filters
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  // Customer Redemptions Modal State
  const [customerModalVisible, setCustomerModalVisible] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [offerCustomers, setOfferCustomers] = useState([]);
  const [customerLoading, setCustomerLoading] = useState(false);

  // Fetch offers
  const fetchOffersData = async () => {
    setLoading(true);
    try {
      const res = await getOffers({
        search: searchText,
        status: statusFilter,
        offer_type: typeFilter
      });
      if (res.success && Array.isArray(res.data)) {
        setOffers(res.data);
        if (res.summary) setSummary(res.summary);
      } else {
        message.error(res.error || 'Failed to fetch offers');
      }
    } catch (err) {
      console.error(err);
      message.error('Error fetching offers data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffersData();
  }, [statusFilter, typeFilter]);

  // Handle Search on Enter or Click
  const handleSearch = () => {
    fetchOffersData();
  };

  // Toggle Status
  const handleToggleStatus = async (record, checked) => {
    const originalStatus = record.status;
    // Optimistic update
    setOffers((prev) =>
      prev.map((o) => (o.id === record.id ? { ...o, status: checked ? 1 : 0 } : o))
    );

    const res = await toggleOfferStatus(record.id, checked ? 1 : 0);
    if (res.success) {
      message.success(`Offer '${record.offer_code}' is now ${checked ? 'Active' : 'Inactive'}`);
      fetchOffersData();
    } else {
      message.error(res.error || 'Failed to update offer status');
      // Rollback
      setOffers((prev) =>
        prev.map((o) => (o.id === record.id ? { ...o, status: originalStatus } : o))
      );
    }
  };

  // Delete Offer
  const handleDeleteOffer = async (id, code) => {
    const res = await deleteOffer(id);
    if (res.success) {
      message.success(`Offer '${code}' deleted successfully`);
      fetchOffersData();
    } else {
      message.error(res.error || 'Failed to delete offer');
    }
  };

  // Open Customers Modal to see who applied this offer
  const handleOpenCustomersModal = async (offerRecord) => {
    setSelectedOffer(offerRecord);
    setCustomerModalVisible(true);
    setCustomerLoading(true);
    try {
      const res = await getOfferCustomers(offerRecord.id);
      if (res.success && Array.isArray(res.data)) {
        setOfferCustomers(res.data);
      } else {
        message.error(res.error || 'Failed to fetch customer redemptions');
      }
    } catch (err) {
      console.error(err);
      message.error('Error loading customer list');
    } finally {
      setCustomerLoading(false);
    }
  };

  // Copy code to clipboard
  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    message.success(`Promo code '${code}' copied to clipboard!`);
  };

  // Table Columns
  const columns = [
    {
      title: 'Promo Code & Details',
      key: 'offer_code',
      width: 250,
      render: (_, record) => (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span
              style={{
                fontFamily: 'monospace',
                fontSize: '13px',
                fontWeight: 800,
                color: '#088b46',
                background: '#f0fdf4',
                border: '1px dashed #86efac',
                padding: '2px 8px',
                borderRadius: 6,
                letterSpacing: '0.8px',
                cursor: 'pointer'
              }}
              title="Click to copy promo code"
              onClick={() => handleCopyCode(record.offer_code)}
            >
              {record.offer_code} <CopyOutlined style={{ fontSize: 11, color: '#16a34a' }} />
            </span>

            {record.validity_status === 'active' && (
              <Tag color="success" style={{ margin: 0, fontSize: 10.5, fontWeight: 600 }}>Active</Tag>
            )}
            {record.validity_status === 'expired' && (
              <Tag color="error" style={{ margin: 0, fontSize: 10.5, fontWeight: 600 }}>Expired</Tag>
            )}
            {record.validity_status === 'upcoming' && (
              <Tag color="blue" style={{ margin: 0, fontSize: 10.5, fontWeight: 600 }}>Upcoming</Tag>
            )}
            {record.validity_status === 'inactive' && (
              <Tag color="default" style={{ margin: 0, fontSize: 10.5, fontWeight: 600 }}>Inactive</Tag>
            )}
          </div>

          <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '13.5px' }}>
            {record.title}
          </div>

          {record.description && (
            <div
              style={{
                fontSize: '11.5px',
                color: '#64748b',
                marginTop: 2,
                display: '-webkit-box',
                WebkitLineClamp: 1,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                maxWidth: 240
              }}
              title={record.description}
            >
              {record.description}
            </div>
          )}
        </div>
      )
    },
    {
      title: 'Discount Value',
      key: 'discount',
      width: 140,
      render: (_, record) => {
        if (record.offer_type === 'percentage') {
          return (
            <div>
              <div style={{ fontWeight: 700, fontSize: '15px', color: '#088b46' }}>
                {parseFloat(record.discount_value)}% OFF
              </div>
              <div style={{ fontSize: '11px', color: '#64748b' }}>
                {record.max_discount_amount ? `Up to $${parseFloat(record.max_discount_amount).toFixed(2)}` : 'No max cap'}
              </div>
            </div>
          );
        } else if (record.offer_type === 'flat_discount') {
          return (
            <div>
              <div style={{ fontWeight: 700, fontSize: '15px', color: '#2563eb' }}>
                FLAT ${parseFloat(record.discount_value).toFixed(2)}
              </div>
              <div style={{ fontSize: '11px', color: '#64748b' }}>Direct cart deduction</div>
            </div>
          );
        } else {
          return (
            <div>
              <div style={{ fontWeight: 700, fontSize: '14px', color: '#7c3aed' }}>
                FREE DELIVERY
              </div>
              <div style={{ fontSize: '11px', color: '#64748b' }}>$0 Delivery Fee</div>
            </div>
          );
        }
      }
    },
    {
      title: 'Min Order',
      dataIndex: 'min_order_amount',
      key: 'min_order',
      width: 110,
      render: (val) => (
        <span style={{ fontWeight: 600, color: '#334155', fontSize: '13px' }}>
          {parseFloat(val) > 0 ? `$${parseFloat(val).toFixed(2)}` : 'None ($0)'}
        </span>
      )
    },
    {
      title: 'Validity Schedule',
      key: 'validity',
      width: 160,
      render: (_, record) => (
        <div style={{ fontSize: '12px' }}>
          <div style={{ color: '#475569' }}>
            From: <strong>{dayjs(record.start_date).format('DD MMM YYYY')}</strong>
          </div>
          <div style={{ color: '#475569', marginTop: 2 }}>
            To: <strong>{dayjs(record.end_date).format('DD MMM YYYY')}</strong>
          </div>
        </div>
      )
    },
    {
      title: 'Customer Redemptions',
      key: 'redemptions',
      width: 170,
      render: (_, record) => {
        const count = Number(record.redemptions_count || 0);
        return (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '13.5px' }}>
                {count} {count === 1 ? 'Customer' : 'Customers'}
              </span>
              {record.total_usage_limit && (
                <span style={{ fontSize: '11px', color: '#94a3b8' }}>/ {record.total_usage_limit}</span>
              )}
            </div>

            <Button
              size="small"
              icon={<UserOutlined />}
              onClick={() => handleOpenCustomersModal(record)}
              style={{
                fontSize: '11.5px',
                borderRadius: 5,
                color: count > 0 ? '#088b46' : '#64748b',
                borderColor: count > 0 ? '#86efac' : '#e2e8f0',
                background: count > 0 ? '#f0fdf4' : '#ffffff',
                fontWeight: 600,
                padding: '0 8px'
              }}
            >
              {count > 0 ? `View Customers (${count})` : 'Check Users'}
            </Button>
          </div>
        );
      }
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 110,
      align: 'center',
      render: (status, record) => (
        <Switch
          checked={Number(status) === 1}
          onChange={(checked) => handleToggleStatus(record, checked)}
          checkedChildren="Active"
          unCheckedChildren="Inactive"
          style={{ backgroundColor: Number(status) === 1 ? '#088b46' : undefined }}
        />
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      align: 'center',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Edit Offer">
            <Button
              type="text"
              size="small"
              icon={<EditOutlined style={{ color: '#0284c7', fontSize: 16 }} />}
              onClick={() => navigate(`/edit-offer/${record.id}`)}
            />
          </Tooltip>

          <Popconfirm
            title="Delete Offer"
            description={`Are you sure you want to delete promo code '${record.offer_code}'?`}
            onConfirm={() => handleDeleteOffer(record.id, record.offer_code)}
            okText="Delete"
            cancelText="Cancel"
            okButtonProps={{ danger: true }}
          >
            <Tooltip title="Delete Offer">
              <Button
                type="text"
                size="small"
                icon={<DeleteOutlined style={{ color: '#ef4444', fontSize: 16 }} />}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div className={styles.container}>
      {/* Header Card */}
      <div className={styles.headerCard}>
        <div className={styles.titleArea}>
          <h2>Customer Offers & Promo Codes</h2>
          <p>
            Manage discounts, percentage vouchers, and promotional deals displayed in customer mobile applications.
          </p>
        </div>

        <Space>
          <Button
            icon={<ReloadOutlined spin={loading} />}
            onClick={fetchOffersData}
            style={{ borderRadius: 8, fontWeight: 600 }}
          >
            Refresh
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/create-offer')}
            style={{
              backgroundColor: '#088b46',
              borderColor: '#088b46',
              borderRadius: 8,
              fontWeight: 700,
              padding: '0 20px',
              height: 40,
              boxShadow: '0 2px 6px rgba(8, 139, 70, 0.25)'
            }}
          >
            Create Offer
          </Button>
        </Space>
      </div>

      {/* KPI Overview Bar */}
      <Row gutter={[16, 16]} className={styles.metricsRow}>
        <Col xs={24} sm={12} md={6}>
          <div className={styles.metricCard}>
            <div className={styles.metricLabel}>
              <TagOutlined style={{ color: '#088b46' }} /> Total Offers
            </div>
            <div className={styles.metricValue}>{summary?.total_offers || offers.length}</div>
            <div className={styles.metricSub}>All created promotions</div>
          </div>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <div className={styles.metricCard}>
            <div className={styles.metricLabel}>
              <CheckCircleOutlined style={{ color: '#16a34a' }} /> Active Offers
            </div>
            <div className={styles.metricValue} style={{ color: '#16a34a' }}>
              {summary?.active_offers || offers.filter((o) => o.validity_status === 'active').length}
            </div>
            <div className={styles.metricSub}>Live in customer mobile app</div>
          </div>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <div className={styles.metricCard}>
            <div className={styles.metricLabel}>
              <UserOutlined style={{ color: '#2563eb' }} /> Total Redemptions
            </div>
            <div className={styles.metricValue} style={{ color: '#2563eb' }}>
              {summary?.total_redemptions || offers.reduce((sum, o) => sum + Number(o.redemptions_count || 0), 0)}
            </div>
            <div className={styles.metricSub}>Times applied at checkout</div>
          </div>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <div className={styles.metricCard}>
            <div className={styles.metricLabel}>
              <DollarOutlined style={{ color: '#d97706' }} /> Customer Savings
            </div>
            <div className={styles.metricValue} style={{ color: '#d97706' }}>
              ${parseFloat(summary?.total_discount_given || offers.reduce((sum, o) => sum + parseFloat(o.total_discount_given || 0), 0)).toFixed(2)}
            </div>
            <div className={styles.metricSub}>Total discount provided</div>
          </div>
        </Col>
      </Row>

      {/* Main Table Card */}
      <div className={styles.tableCard}>
        {/* Filter Toolbar */}
        <div className={styles.filterBar}>
          <div className={styles.filterGroup}>
            <Input
              placeholder="Search promo code or title..."
              prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onPressEnter={handleSearch}
              style={{ width: 260, borderRadius: 8 }}
              allowClear
            />
            <Button onClick={handleSearch} style={{ borderRadius: 8 }}>
              Search
            </Button>
          </div>

          <div className={styles.filterGroup}>
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: 140, borderRadius: 8 }}
            >
              <Option value="all">All Statuses</Option>
              <Option value="1">Active Only</Option>
              <Option value="0">Inactive Only</Option>
            </Select>

            <Select
              value={typeFilter}
              onChange={setTypeFilter}
              style={{ width: 160, borderRadius: 8 }}
            >
              <Option value="all">All Discount Types</Option>
              <Option value="percentage">Percentage (%)</Option>
              <Option value="flat_discount">Flat Discount ($)</Option>
              <Option value="free_delivery">Free Delivery</Option>
            </Select>
          </div>
        </div>

        {/* Offers Table */}
        <Table
          dataSource={offers}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10, showSizeChanger: true }}
          size="middle"
          bordered
        />
      </div>

      {/* Modal: Customers Who Chose This Offer */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <UserOutlined style={{ color: '#088b46' }} />
            <span>Customers Who Chose '{selectedOffer?.offer_code}'</span>
            <Tag color="green" style={{ marginLeft: 6 }}>
              {offerCustomers.length} Redemptions
            </Tag>
          </div>
        }
        open={customerModalVisible}
        onCancel={() => setCustomerModalVisible(false)}
        width={780}
        footer={[
          <Button key="close" type="primary" onClick={() => setCustomerModalVisible(false)} style={{ backgroundColor: '#088b46', borderColor: '#088b46' }}>
            Done
          </Button>
        ]}
      >
        <div style={{ marginBottom: 14, fontSize: 13, color: '#475569', background: '#f8fafc', padding: '10px 14px', borderRadius: 8 }}>
          <strong>{selectedOffer?.title}:</strong> {selectedOffer?.description || 'No description'}
        </div>

        {offerCustomers.length === 0 && !customerLoading ? (
          <Empty
            description="No customers have chosen or redeemed this offer yet."
            style={{ padding: '30px 0' }}
          />
        ) : (
          <Table
            dataSource={offerCustomers}
            rowKey="redemption_id"
            loading={customerLoading}
            pagination={{ pageSize: 6 }}
            size="small"
            bordered
            columns={[
              {
                title: 'Customer Name',
                key: 'name',
                render: (_, r) => {
                  const fullName = [r.firstname, r.lastname].filter(Boolean).join(' ');
                  return (
                    <div>
                      <strong style={{ color: '#0f172a' }}>{fullName || `Customer #${r.customer_id}`}</strong>
                      <div style={{ fontSize: 11, color: '#64748b' }}>
                        ID: #{r.customer_id}
                      </div>
                    </div>
                  );
                }
              },
              {
                title: 'Contact Info',
                key: 'contact',
                render: (_, r) => (
                  <div style={{ fontSize: 12 }}>
                    {r.phonenumber && <div>Phone: <strong>{r.phonenumber}</strong></div>}
                    {r.email && <div style={{ color: '#64748b' }}>{r.email}</div>}
                    {!r.phonenumber && !r.email && <span style={{ color: '#94a3b8' }}>N/A</span>}
                  </div>
                )
              },
              {
                title: 'Discount Saved',
                dataIndex: 'discount_amount',
                key: 'discount',
                align: 'right',
                render: (val) => (
                  <span style={{ fontWeight: 700, color: '#16a34a', fontSize: '13.5px' }}>
                    -${parseFloat(val || 0).toFixed(2)}
                  </span>
                )
              },
              {
                title: 'Associated Order',
                key: 'order',
                render: (_, r) => (
                  r.order_uid ? (
                    <Tag color="blue" style={{ fontFamily: 'monospace', fontWeight: 600 }}>
                      {r.order_uid}
                    </Tag>
                  ) : (
                    <span style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: 11.5 }}>
                      In-cart redemption
                    </span>
                  )
                )
              },
              {
                title: 'Date & Time Chosen',
                dataIndex: 'applied_at',
                key: 'applied_at',
                render: (dt) => (
                  <span style={{ fontSize: 12, color: '#475569' }}>
                    {dt ? dayjs(dt).format('DD MMM YYYY • hh:mm A') : '-'}
                  </span>
                )
              }
            ]}
          />
        )}
      </Modal>
    </div>
  );
};

export default AllOffers;

