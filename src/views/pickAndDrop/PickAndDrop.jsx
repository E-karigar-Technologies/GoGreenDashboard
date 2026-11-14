import React, { useEffect, useState, useMemo } from 'react';
import {
  Table,
  Input,
  Select,
  DatePicker,
  Button,
  Tag,
  Modal,
  Tooltip,
  Segmented,
  Alert,
  Typography,
  Steps,
  Divider,
  Row,
  Col,
} from 'antd';
import {
  CarOutlined,
  ReloadOutlined,
  SearchOutlined,
  EyeOutlined,
  UserOutlined,
  PhoneOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  SyncOutlined,
  CodeSandboxOutlined,
  DollarOutlined,
  SafetyCertificateOutlined,
  CompassOutlined,
  FileTextOutlined,
  MailOutlined,
  ThunderboltOutlined,
  PlusOutlined,
  MinusOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { getAllParcels } from '../../services/apiService';
import styles from './pickAndDrop.module.scss';

const { Text } = Typography;

// Status Mapping Helper
const getParcelStatusInfo = (status) => {
  const numStatus = Number(status);
  switch (numStatus) {
    case 0:
      return { label: 'Placed', color: 'warning', icon: <ClockCircleOutlined /> };
    case 1:
      return { label: 'Confirmed', color: 'processing', icon: <SyncOutlined spin /> };
    case 2:
      return { label: 'In Transit', color: 'purple', icon: <CarOutlined /> };
    case 3:
      return { label: 'Cancelled', color: 'error', icon: <CloseCircleOutlined /> };
    case 4:
      return { label: 'Delivered', color: 'success', icon: <CheckCircleOutlined /> };
    default:
      return { label: 'Unknown', color: 'default', icon: null };
  }
};

// Robust Helper Extractor Functions matching backend JSON schema
const getParcelUid = (item) =>
  item?.parcel_uid || item?.tracking_id || item?.order_id || (item?.id ? `ID:#${item.id}` : 'N/A');
const getRefId = (item) => (item?.id ? `#${item.id}` : null);

const getSenderName = (item) => {
  if (item?.customer?.firstname || item?.customer?.lastname) {
    return [item.customer.firstname, item.customer.lastname].filter(Boolean).join(' ');
  }
  if (item?.sender_name) return item.sender_name;
  if (item?.user?.firstname || item?.user?.lastname) {
    return [item.user.firstname, item.user.lastname].filter(Boolean).join(' ');
  }
  return item?.user?.name || item?.sender?.name || 'Customer';
};

const getSenderPhone = (item) => {
  const c = item?.customer || item?.user;
  if (c?.phonenumber) {
    return [c.prefix, c.phonenumber].filter(Boolean).join(' ');
  }
  return item?.sender_phone || item?.sender?.phone || 'N/A';
};

const getSenderEmail = (item) => item?.customer?.email || item?.user?.email || null;

const getReceiverName = (item) => item?.receiver_name || item?.receiver?.name || 'Receiver';
const getReceiverPhone = (item) => item?.receiver_phone || item?.receiver?.phone || 'N/A';

const getPickupAddress = (item) => {
  if (typeof item?.pickup_address === 'string' && item.pickup_address) return item.pickup_address;
  if (item?.pickup_address?.address) return item.pickup_address.address;
  if (typeof item?.pickup_location === 'string') return item.pickup_location;
  if (item?.pickup_location?.address) return item.pickup_location.address;
  return 'Pickup location not set';
};

const getDropAddress = (item) => {
  if (typeof item?.delivered_address === 'string' && item.delivered_address) return item.delivered_address;
  if (typeof item?.drop_address === 'string' && item.drop_address) return item.drop_address;
  if (item?.drop_address?.address) return item.drop_address.address;
  if (typeof item?.delivery_address === 'string') return item.delivery_address;
  if (item?.delivery_address?.address) return item.delivery_address.address;
  return 'Drop location not set';
};

const getRiderName = (item) => {
  const r = item?.rider || item?.delivery_partner;
  if (!r) return null;
  if (r.firstname || r.lastname) {
    return [r.firstname, r.lastname].filter(Boolean).join(' ');
  }
  return r.name || 'Assigned Rider';
};

const getRiderPhone = (item) => {
  const r = item?.rider || item?.delivery_partner;
  if (!r) return null;
  return [r.prefix, r.phonenumber || r.phone].filter(Boolean).join(' ');
};

const getRiderCustomId = (item) => item?.rider?.custom_id || null;

// Safe helper to parse parcel_details which may be an Array, a JSON string, a plain string, or an Object
const parseParcelDetails = (details) => {
  if (!details) return [];
  if (Array.isArray(details)) return details;
  if (typeof details === 'string') {
    const trimmed = details.trim();
    if (trimmed === '') return [];
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) return parsed;
      if (typeof parsed === 'object' && parsed !== null) return [parsed];
      return [{ name: trimmed }];
    } catch {
      return [{ name: trimmed }];
    }
  }
  if (typeof details === 'object' && details !== null) return [details];
  return [];
};

const PickAndDrop = () => {
  const [parcels, setParcels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Filters state
  const [filterType, setFilterType] = useState('all'); // 'all', 'today', 'date'
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [statusTab, setStatusTab] = useState('all');
  const [searchText, setSearchText] = useState('');

  // Pagination state
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });

  // Detail Modal State
  const [selectedParcel, setSelectedParcel] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch API
  const fetchParcels = async () => {
    setLoading(true);
    setError(null);
    let dateStr = null;
    if (filterType === 'date' && selectedDate) {
      dateStr = selectedDate.format('YYYY-MM-DD');
    }

    const res = await getAllParcels(filterType, dateStr);
    if (res.success) {
      setParcels(res.data || []);
    } else {
      setError(res.error || 'Failed to load Pick & Drop parcels');
      setParcels([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchParcels();
  }, [filterType, selectedDate]);

  // Reset pagination to page 1 when filters change
  useEffect(() => {
    setPagination((prev) => ({ ...prev, current: 1 }));
  }, [searchText, statusTab, filterType, selectedDate]);

  // Statistics calculation
  const stats = useMemo(() => {
    const total = parcels.length;
    const pending = parcels.filter((p) => Number(p.status) === 0).length;
    const confirmed = parcels.filter((p) => Number(p.status) === 1).length;
    const inTransit = parcels.filter((p) => Number(p.status) === 2).length;
    const delivered = parcels.filter((p) => Number(p.status) === 4).length;
    const cancelled = parcels.filter((p) => Number(p.status) === 3).length;

    return { total, pending, active: confirmed + inTransit, delivered, cancelled };
  }, [parcels]);

  // Filtered dataset for Table
  const filteredData = useMemo(() => {
    return parcels.filter((item) => {
      // Status filter
      if (statusTab !== 'all' && String(item.status) !== String(statusTab)) {
        return false;
      }

      // Search filter
      if (searchText.trim() !== '') {
        const q = searchText.toLowerCase().trim();
        const uid = String(getParcelUid(item)).toLowerCase();
        const refId = String(getRefId(item) || '').toLowerCase();
        const sName = getSenderName(item).toLowerCase();
        const sPhone = String(getSenderPhone(item)).toLowerCase();
        const rName = getReceiverName(item).toLowerCase();
        const rPhone = String(getReceiverPhone(item)).toLowerCase();
        const pAddr = getPickupAddress(item).toLowerCase();
        const dAddr = getDropAddress(item).toLowerCase();

        return (
          uid.includes(q) ||
          refId.includes(q) ||
          sName.includes(q) ||
          sPhone.includes(q) ||
          rName.includes(q) ||
          rPhone.includes(q) ||
          pAddr.includes(q) ||
          dAddr.includes(q)
        );
      }

      return true;
    });
  }, [parcels, statusTab, searchText]);

  // Comprehensive Expanded Row View (Triggered by first-column '+' button)
  const renderExpandedRow = (record) => {
    const statusInfo = getParcelStatusInfo(record?.status);
    const items = parseParcelDetails(record?.parcel_details);
    const senderName = getSenderName(record);
    const senderPhone = getSenderPhone(record);
    const senderEmail = getSenderEmail(record);
    const receiverName = getReceiverName(record);
    const receiverPhone = getReceiverPhone(record);
    const pickupAddress = getPickupAddress(record);
    const dropAddress = getDropAddress(record);
    const riderName = getRiderName(record);
    const riderPhone = getRiderPhone(record);
    const riderCustomId = getRiderCustomId(record);
    const totalAmount = record?.total_amount || record?.amount || record?.price || '0.00';
    const paymentMode = record?.payment_mode || 'COD';
    const isPaid = Number(record?.payment_status) === 1 || record?.payment_status === 'paid';
    const isFast = record?.delivery_type === 'Fast';

    return (
      <div
        style={{
          background: '#f8fafc',
          padding: '18px 20px',
          borderRadius: 10,
          border: '1px solid #e2e8f0',
          margin: '4px 0',
        }}
      >
        {/* Top Header inside Expanded Row */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 10,
            marginBottom: 14,
            paddingBottom: 10,
            borderBottom: '1px solid #e2e8f0',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <Tag color="cyan" style={{ fontSize: '12px', fontWeight: 700, padding: '2px 8px', borderRadius: 4 }}>
              {getParcelUid(record)}
            </Tag>
            {getRefId(record) && (
              <Tag color="blue" style={{ fontSize: '11px', borderRadius: 4 }}>
                Ref: {getRefId(record)}
              </Tag>
            )}
            <Tag
              color={statusInfo.color}
              icon={statusInfo.icon}
              style={{ borderRadius: 12, padding: '2px 10px', fontWeight: 600 }}
            >
              {statusInfo.label}
            </Tag>
            {isFast && (
              <Tag color="volcano" icon={<ThunderboltOutlined />} style={{ borderRadius: 12, fontWeight: 600 }}>
                Fast Delivery
              </Tag>
            )}
            {record?.is_schedule && (
              <Tag color="purple" style={{ borderRadius: 12 }}>
                Scheduled: {record.is_schedule}
              </Tag>
            )}
          </div>

          <Button
            type="primary"
            ghost
            size="small"
            icon={<EyeOutlined />}
            onClick={() => {
              setSelectedParcel(record);
              setIsModalOpen(true);
            }}
            style={{ borderRadius: 6, fontWeight: 600 }}
          >
            Full Details & Timeline Modal
          </Button>
        </div>

        {/* 3-Column Responsive Grid */}
        <Row gutter={[16, 16]}>
          {/* Col 1: Route & Location Details */}
          <Col xs={24} md={10} lg={9}>
            <div
              style={{
                background: '#ffffff',
                padding: '14px 16px',
                borderRadius: 8,
                border: '1px solid #e2e8f0',
                height: '100%',
              }}
            >
              <div
                style={{
                  fontSize: '11.5px',
                  textTransform: 'uppercase',
                  fontWeight: 700,
                  color: '#64748b',
                  marginBottom: 12,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <CompassOutlined style={{ color: '#2563eb' }} /> Pickup & Delivery Route
              </div>

              {/* Pickup Point */}
              <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    background: '#10b981',
                    marginTop: 5,
                    flexShrink: 0,
                  }}
                />
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#10b981', textTransform: 'uppercase' }}>
                    Pickup Location
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>
                    {senderName} • <span style={{ color: '#64748b', fontWeight: 400 }}>{senderPhone}</span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#475569', marginTop: 2, lineHeight: 1.4 }}>
                    {pickupAddress}
                  </div>
                </div>
              </div>

              {/* Drop Point */}
              <div style={{ display: 'flex', gap: 10 }}>
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    background: '#ef4444',
                    marginTop: 5,
                    flexShrink: 0,
                  }}
                />
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#ef4444', textTransform: 'uppercase' }}>
                    Delivery Location
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>
                    {receiverName} • <span style={{ color: '#64748b', fontWeight: 400 }}>{receiverPhone}</span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#475569', marginTop: 2, lineHeight: 1.4 }}>
                    {dropAddress}
                  </div>
                </div>
              </div>

              {(record?.distance || record?.duration) && (
                <div
                  style={{
                    marginTop: 12,
                    paddingTop: 10,
                    borderTop: '1px dashed #e2e8f0',
                    display: 'flex',
                    gap: 12,
                    fontSize: '12px',
                    color: '#64748b',
                  }}
                >
                  {record.distance && <span>📍 Distance: <strong>{record.distance}</strong></span>}
                  {record.duration && <span>⏱️ Est. Time: <strong>{record.duration}</strong></span>}
                </div>
              )}
            </div>
          </Col>

          {/* Col 2: Parcel Content & Instructions */}
          <Col xs={24} sm={12} md={7} lg={8}>
            <div
              style={{
                background: '#ffffff',
                padding: '14px 16px',
                borderRadius: 8,
                border: '1px solid #e2e8f0',
                height: '100%',
              }}
            >
              <div
                style={{
                  fontSize: '11.5px',
                  textTransform: 'uppercase',
                  fontWeight: 700,
                  color: '#64748b',
                  marginBottom: 12,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <FileTextOutlined style={{ color: '#8b5cf6' }} /> Parcel Items & Instructions
              </div>

              <div style={{ marginBottom: 10 }}>
                <div style={{ fontSize: '11px', color: '#64748b' }}>Items:</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
                  {items.length > 0 ? (
                    items.map((it, idx) => {
                      const itemName = typeof it === 'string' ? it : it?.name || it?.title || it?.item_name || 'Item';
                      const itemWeight = it?.weight ? ` (${it.weight} ${it.unit || 'kg'})` : '';
                      return (
                        <Tag key={idx} color="geekblue" style={{ borderRadius: 6, fontSize: '12px' }}>
                          {itemName}{itemWeight}
                        </Tag>
                      );
                    })
                  ) : (
                    <Tag color="default">{record?.parcel_type || 'General Parcel'}</Tag>
                  )}
                </div>
              </div>

              {record?.total_weight && (
                <div style={{ fontSize: '12px', color: '#475569', marginBottom: 8 }}>
                  Total Weight: <strong>{record.total_weight} kg</strong>
                </div>
              )}

              {senderEmail && (
                <div style={{ fontSize: '12px', color: '#475569', marginBottom: 8 }}>
                  Sender Email: <span style={{ color: '#0284c7' }}>{senderEmail}</span>
                </div>
              )}

              {(record?.parcel_comment || record?.scheduled_comments) && (
                <div style={{ fontSize: '12px', color: '#475569', marginBottom: 8 }}>
                  Notes:{' '}
                  <span style={{ fontStyle: 'italic', color: '#64748b' }}>
                    {record.parcel_comment || record.scheduled_comments}
                  </span>
                </div>
              )}

              {record?.parcel_otp && (
                <div style={{ marginTop: 8 }}>
                  <Tag color="purple" icon={<SafetyCertificateOutlined />}>
                    Delivery OTP: <strong>{record.parcel_otp}</strong>{' '}
                    {record?.otp_verify === 1 ? '(Verified)' : '(Pending Verification)'}
                  </Tag>
                </div>
              )}
            </div>
          </Col>

          {/* Col 3: Payment & Assigned Rider */}
          <Col xs={24} sm={12} md={7} lg={7}>
            <div
              style={{
                background: '#ffffff',
                padding: '14px 16px',
                borderRadius: 8,
                border: '1px solid #e2e8f0',
                height: '100%',
              }}
            >
              <div
                style={{
                  fontSize: '11.5px',
                  textTransform: 'uppercase',
                  fontWeight: 700,
                  color: '#64748b',
                  marginBottom: 12,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <DollarOutlined style={{ color: '#059669' }} /> Payment & Assigned Rider
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span style={{ fontSize: '12px', color: '#64748b' }}>Total Fare:</span>
                <span style={{ fontSize: '17px', fontWeight: 700, color: '#059669' }}>
                  ₹{(parseFloat(totalAmount) || 0).toFixed(2)}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontSize: '12px', color: '#64748b' }}>Payment Mode:</span>
                <span>
                  <strong>{paymentMode}</strong> •{' '}
                  <Tag color={isPaid ? 'green' : 'orange'} style={{ borderRadius: 4, margin: 0 }}>
                    {isPaid ? 'Paid' : 'Unpaid'}
                  </Tag>
                </span>
              </div>

              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 10, marginTop: 4 }}>
                <div style={{ fontSize: '11px', color: '#64748b', marginBottom: 4 }}>Delivery Rider:</div>
                {riderName ? (
                  <div>
                    <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '13px' }}>
                      <CarOutlined style={{ marginRight: 6, color: '#8b5cf6' }} />
                      {riderName}
                    </div>
                    {riderPhone && (
                      <div style={{ fontSize: '12px', color: '#64748b', marginTop: 2 }}>
                        <PhoneOutlined style={{ marginRight: 4 }} />
                        {riderPhone}
                      </div>
                    )}
                    {riderCustomId && (
                      <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: 2 }}>
                        ID: {riderCustomId}
                      </div>
                    )}
                  </div>
                ) : (
                  <Tag color="default">Rider Not Assigned</Tag>
                )}
              </div>
            </div>
          </Col>
        </Row>
      </div>
    );
  };

  // Primary Ant Design Table Columns - 100% Responsive, ZERO Horizontal Scroll
  const columns = [
    {
      title: '#',
      dataIndex: 'sr',
      key: 'sr',
      width: 50,
      align: 'center',
      render: (_, __, idx) => (
        <span style={{ fontWeight: 600, color: '#64748b', fontSize: '12px' }}>
          #{(pagination.current - 1) * pagination.pageSize + idx + 1}
        </span>
      ),
    },
    {
      title: 'Parcel UID & Date',
      key: 'parcel_uid',
      width: 175,
      render: (_, record) => {
        const uid = getParcelUid(record);
        const refId = getRefId(record);
        const dateStr = record?.created_at || record?.createdAt || record?.delivery_date;
        return (
          <div>
            <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '13px', letterSpacing: '0.2px' }}>
              {uid}
            </div>
            {refId && (
              <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 500 }}>
                Ref: {refId}
              </span>
            )}
            {dateStr && (
              <div style={{ fontSize: '11px', color: '#64748b', marginTop: 2 }}>
                {dayjs(dateStr).format('MMM D, YYYY • hh:mm A')}
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: 'Sender & Receiver',
      key: 'contacts',
      width: 175,
      render: (_, record) => (
        <div style={{ fontSize: '12px' }}>
          <div style={{ fontWeight: 600, color: '#1e293b', display: 'flex', alignItems: 'center', gap: 5 }}>
            <UserOutlined style={{ color: '#2563eb', fontSize: '11px' }} />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 140 }}>
              {getSenderName(record)}
            </span>
          </div>
          <div style={{ color: '#64748b', fontSize: '11px', marginLeft: 16 }}>
            {getSenderPhone(record)}
          </div>
          <div style={{ fontWeight: 600, color: '#1e293b', display: 'flex', alignItems: 'center', gap: 5, marginTop: 4 }}>
            <UserOutlined style={{ color: '#10b981', fontSize: '11px' }} />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 140 }}>
              {getReceiverName(record)}
            </span>
          </div>
          <div style={{ color: '#64748b', fontSize: '11px', marginLeft: 16 }}>
            {getReceiverPhone(record)}
          </div>
        </div>
      ),
    },
    {
      title: 'Pickup & Delivery Route',
      key: 'route',
      render: (_, record) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', flexShrink: 0 }} />
            <span
              style={{
                fontSize: '12px',
                color: '#334155',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                maxWidth: 240,
              }}
              title={getPickupAddress(record)}
            >
              <strong style={{ color: '#0f172a' }}>P:</strong> {getPickupAddress(record)}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444', flexShrink: 0 }} />
            <span
              style={{
                fontSize: '12px',
                color: '#334155',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                maxWidth: 240,
              }}
              title={getDropAddress(record)}
            >
              <strong style={{ color: '#0f172a' }}>D:</strong> {getDropAddress(record)}
            </span>
          </div>
        </div>
      ),
    },
    {
      title: 'Fare & Payment',
      key: 'payment',
      width: 130,
      render: (_, record) => {
        const totalAmount = record?.total_amount || record?.amount || record?.price || '0.00';
        const paymentMode = record?.payment_mode || 'COD';
        const isPaid = Number(record?.payment_status) === 1 || record?.payment_status === 'paid';
        const isFast = record?.delivery_type === 'Fast';

        return (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ fontWeight: 700, color: '#059669', fontSize: '13.5px' }}>
                ₹{(parseFloat(totalAmount) || 0).toFixed(2)}
              </span>
              {isFast && (
                <Tag color="volcano" style={{ fontSize: '10px', padding: '0 4px', margin: 0, borderRadius: 4 }}>
                  Fast
                </Tag>
              )}
            </div>
            <div style={{ fontSize: '11px', color: '#64748b', marginTop: 2 }}>
              <span>{paymentMode}</span> •{' '}
              <Tag color={isPaid ? 'green' : 'orange'} style={{ fontSize: '10px', padding: '0 4px', margin: 0, borderRadius: 4 }}>
                {isPaid ? 'Paid' : 'Unpaid'}
              </Tag>
            </div>
          </div>
        );
      },
    },
    {
      title: 'Status',
      key: 'status',
      width: 115,
      align: 'center',
      render: (_, record) => {
        const info = getParcelStatusInfo(record?.status);
        return (
          <Tag color={info.color} icon={info.icon} style={{ borderRadius: 12, padding: '2px 8px', fontWeight: 600 }}>
            {info.label}
          </Tag>
        );
      },
    },
    {
      title: 'Action',
      key: 'action',
      width: 55,
      align: 'center',
      render: (_, record) => (
        <Tooltip title="View Parcel Details">
          <Button
            type="primary"
            ghost
            icon={<EyeOutlined />}
            size="small"
            onClick={() => {
              setSelectedParcel(record);
              setIsModalOpen(true);
            }}
          />
        </Tooltip>
      ),
    },
  ];

  // Helper for Stepper current step index
  const getStepIndex = (status) => {
    const s = Number(status);
    if (s === 0) return 0; // Placed
    if (s === 1) return 1; // Confirmed
    if (s === 2) return 2; // In Transit
    if (s === 4) return 3; // Delivered
    return 0;
  };

  return (
    <div className={styles.pickDropContainer}>
      {/* Header Section */}
      <div className={styles.headerSection}>
        <div className={styles.titleBox}>
          <h2>
            <CodeSandboxOutlined style={{ color: '#2563eb' }} />
            Pick & Drop Requests
          </h2>
          <p>Real-time parcel delivery tracking, status monitoring, and customer details</p>
        </div>

        <div className={styles.controlsBox}>
          <Select
            value={filterType}
            onChange={(val) => setFilterType(val)}
            style={{ width: 160 }}
            options={[
              { label: 'All Parcels', value: 'all' },
              { label: "Today's Parcels", value: 'today' },
              { label: 'Specific Date', value: 'date' },
            ]}
          />

          {filterType === 'date' && (
            <DatePicker
              value={selectedDate}
              onChange={(date) => date && setSelectedDate(date)}
              format="YYYY-MM-DD"
              allowClear={false}
            />
          )}

          <Button
            type="primary"
            icon={<ReloadOutlined />}
            loading={loading}
            onClick={fetchParcels}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert
          message="Error Loading Parcels"
          description={error}
          type="error"
          showIcon
          closable
          style={{ marginBottom: 20 }}
        />
      )}

      {/* Summary Stat Cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statInfo}>
            <div className={styles.statLabel}>Total Parcels</div>
            <div className={styles.statValue}>{stats.total}</div>
          </div>
          <div className={styles.statIcon} style={{ background: '#eff6ff', color: '#2563eb' }}>
            <CodeSandboxOutlined />
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statInfo}>
            <div className={styles.statLabel}>Placed</div>
            <div className={styles.statValue}>{stats.pending}</div>
          </div>
          <div className={styles.statIcon} style={{ background: '#fffbe6', color: '#faad14' }}>
            <ClockCircleOutlined />
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statInfo}>
            <div className={styles.statLabel}>In Transit / Active</div>
            <div className={styles.statValue}>{stats.active}</div>
          </div>
          <div className={styles.statIcon} style={{ background: '#f3e8ff', color: '#9333ea' }}>
            <CarOutlined />
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statInfo}>
            <div className={styles.statLabel}>Delivered</div>
            <div className={styles.statValue}>{stats.delivered}</div>
          </div>
          <div className={styles.statIcon} style={{ background: '#f0fdf4', color: '#16a34a' }}>
            <CheckCircleOutlined />
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statInfo}>
            <div className={styles.statLabel}>Cancelled</div>
            <div className={styles.statValue}>{stats.cancelled}</div>
          </div>
          <div className={styles.statIcon} style={{ background: '#fef2f2', color: '#dc2626' }}>
            <CloseCircleOutlined />
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className={styles.mainCard}>
        <div className={styles.filterRow}>
          <Segmented
            options={[
              { label: `All (${stats.total})`, value: 'all' },
              { label: `Placed (${stats.pending})`, value: '0' },
              { label: `In Transit / Active (${stats.active})`, value: '2' },
              { label: `Delivered (${stats.delivered})`, value: '4' },
              { label: `Cancelled (${stats.cancelled})`, value: '3' },
            ]}
            value={statusTab}
            onChange={(val) => setStatusTab(val)}
          />

          <Input
            placeholder="Search by Parcel UID, Sender, Receiver, Phone, Address..."
            prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
            style={{ width: 360, maxWidth: '100%' }}
          />
        </div>

        {/* Clean Responsive Table with ZERO Horizontal Scroll */}
        <Table
          dataSource={filteredData}
          columns={columns}
          rowKey={(record) => record.parcel_uid || record.id || Math.random()}
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50'],
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} parcels`,
          }}
          onChange={(newPagination) => {
            setPagination({
              current: newPagination.current,
              pageSize: newPagination.pageSize,
            });
          }}
          expandable={{
            expandedRowRender: renderExpandedRow,
            rowExpandable: () => true,
            expandIcon: ({ expanded, onExpand, record }) => (
              <button
                type="button"
                onClick={(e) => onExpand(record, e)}
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: '50%',
                  border: expanded ? '1px solid #cbd5e1' : '1px solid #86efac',
                  background: expanded ? '#f1f5f9' : '#f0fdf4',
                  color: expanded ? '#64748b' : '#16a34a',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: 11,
                  padding: 0,
                  transition: 'all 0.2s',
                }}
                title={expanded ? 'Collapse parcel details' : 'Expand parcel details'}
              >
                {expanded ? <MinusOutlined /> : <PlusOutlined />}
              </button>
            ),
          }}
        />
      </div>

      {/* Comprehensive Parcel Details Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <CodeSandboxOutlined style={{ color: '#2563eb', fontSize: 20 }} />
            <span>Parcel UID: {getParcelUid(selectedParcel)}</span>
            {getRefId(selectedParcel) && <Tag color="blue">{getRefId(selectedParcel)}</Tag>}
          </div>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={[
          <Button key="close" type="primary" onClick={() => setIsModalOpen(false)}>
            Close
          </Button>,
        ]}
        width={760}
      >
        {selectedParcel && (
          <div>
            {/* Status Progress Stepper */}
            <div
              style={{
                background: '#f8fafc',
                padding: '20px 16px',
                borderRadius: 12,
                marginBottom: 20,
                border: '1px solid #e2e8f0',
              }}
            >
              <div
                style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  color: '#64748b',
                  textTransform: 'uppercase',
                  marginBottom: 14,
                }}
              >
                Parcel Delivery Status Progress
              </div>

              {Number(selectedParcel.status) === 3 ? (
                <Alert
                  message="Parcel Cancelled"
                  description="This pick and drop order request has been cancelled."
                  type="error"
                  showIcon
                />
              ) : (
                <Steps
                  current={getStepIndex(selectedParcel.status)}
                  status={Number(selectedParcel.status) === 4 ? 'finish' : 'process'}
                  items={[
                    { title: 'Placed', description: 'Order Created' },
                    { title: 'Confirmed', description: 'Rider Assigned' },
                    { title: 'In Transit', description: 'Out for Delivery' },
                    { title: 'Delivered', description: 'Parcel Delivered' },
                  ]}
                />
              )}
            </div>

            {/* Route Timeline */}
            <div className={styles.routeTimelineModal}>
              <div className={styles.timelineItem}>
                <div className={`${styles.timelineDot} ${styles.dotPickupModal}`} />
                <div className={styles.timelineContent}>
                  <div className={styles.timelineLabel}>PICKUP LOCATION</div>
                  <div className={styles.timelineTitle}>
                    {getSenderName(selectedParcel)} • {getSenderPhone(selectedParcel)}
                  </div>
                  <div className={styles.timelineSub}>{getPickupAddress(selectedParcel)}</div>
                </div>
              </div>

              <div className={styles.timelineItem}>
                <div className={`${styles.timelineDot} ${styles.dotDropModal}`} />
                <div className={styles.timelineContent}>
                  <div className={styles.timelineLabel}>DELIVERY LOCATION</div>
                  <div className={styles.timelineTitle}>
                    {getReceiverName(selectedParcel)} • {getReceiverPhone(selectedParcel)}
                  </div>
                  <div className={styles.timelineSub}>{getDropAddress(selectedParcel)}</div>
                </div>
              </div>
            </div>

            {/* Customer & Receiver Details */}
            <div className={styles.modalSectionCard}>
              <div className={styles.sectionHeader}>
                <UserOutlined /> Customer & Receiver Information
              </div>
              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <div className={styles.infoLabel}>Customer (Sender)</div>
                  <div className={styles.infoVal}>{getSenderName(selectedParcel)}</div>
                </div>
                <div className={styles.infoItem}>
                  <div className={styles.infoLabel}>Sender Phone</div>
                  <div className={styles.infoVal}>{getSenderPhone(selectedParcel)}</div>
                </div>
                <div className={styles.infoItem}>
                  <div className={styles.infoLabel}>Sender Email</div>
                  <div className={styles.infoVal}>{getSenderEmail(selectedParcel) || 'N/A'}</div>
                </div>
                <div className={styles.infoItem}>
                  <div className={styles.infoLabel}>Delivery Type</div>
                  <div className={styles.infoVal}>
                    {selectedParcel?.delivery_type || 'Standard'}{' '}
                    {selectedParcel?.is_schedule && `(${selectedParcel.is_schedule})`}
                  </div>
                </div>
                <div className={styles.infoItem}>
                  <div className={styles.infoLabel}>Receiver Name</div>
                  <div className={styles.infoVal}>{getReceiverName(selectedParcel)}</div>
                </div>
                <div className={styles.infoItem}>
                  <div className={styles.infoLabel}>Receiver Phone</div>
                  <div className={styles.infoVal}>{getReceiverPhone(selectedParcel)}</div>
                </div>
              </div>
            </div>

            {/* Parcel Content & Details */}
            <div className={styles.modalSectionCard}>
              <div className={styles.sectionHeader}>
                <FileTextOutlined /> Parcel Details & Items
              </div>
              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <div className={styles.infoLabel}>Parcel Items</div>
                  <div className={styles.infoVal}>
                    {(() => {
                      const parcelItems = parseParcelDetails(selectedParcel?.parcel_details);
                      return parcelItems.length > 0 ? (
                        parcelItems.map((item, idx) => {
                          const itemName = typeof item === 'string' ? item : item?.name || item?.title || item?.item_name || 'Item';
                          const itemWeight = item?.weight ? ` (${item.weight} ${item.unit || 'kg'})` : '';
                          return (
                            <Tag color="cyan" key={idx} style={{ marginTop: 2, borderRadius: 6 }}>
                              {itemName}{itemWeight}
                            </Tag>
                          );
                        })
                      ) : (
                        selectedParcel?.parcel_type || 'General Parcel'
                      );
                    })()}
                  </div>
                </div>

                <div className={styles.infoItem}>
                  <div className={styles.infoLabel}>Total Weight & Distance</div>
                  <div className={styles.infoVal}>
                    {selectedParcel?.total_weight ? `${selectedParcel.total_weight} kg` : 'N/A'} •{' '}
                    {selectedParcel?.distance || 'N/A'} {selectedParcel?.duration ? `(${selectedParcel.duration})` : ''}
                  </div>
                </div>

                <div className={styles.infoItem}>
                  <div className={styles.infoLabel}>Comment / Instructions</div>
                  <div className={styles.infoVal}>
                    {selectedParcel?.parcel_comment || selectedParcel?.scheduled_comments || 'None'}
                  </div>
                </div>

                <div className={styles.infoItem}>
                  <div className={styles.infoLabel}>Delivery Verification OTP</div>
                  <div className={styles.infoVal}>
                    {selectedParcel?.parcel_otp ? (
                      <Tag color="purple" icon={<SafetyCertificateOutlined />}>
                        OTP: {selectedParcel.parcel_otp}{' '}
                        {selectedParcel?.otp_verify === 1 ? '(Verified)' : '(Pending Verification)'}
                      </Tag>
                    ) : (
                      'N/A'
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Payment & Financial Breakdown */}
            <div className={styles.modalSectionCard}>
              <div className={styles.sectionHeader}>
                <DollarOutlined /> Payment & Financial Breakdown
              </div>
              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <div className={styles.infoLabel}>Total Amount</div>
                  <div className={styles.infoVal} style={{ color: '#059669', fontSize: '18px', fontWeight: 700 }}>
                    ₹{(parseFloat(selectedParcel?.total_amount || selectedParcel?.amount || 0) || 0).toFixed(2)}
                  </div>
                </div>

                <div className={styles.infoItem}>
                  <div className={styles.infoLabel}>Payment Mode & Status</div>
                  <div className={styles.infoVal}>
                    <strong>{selectedParcel?.payment_mode || 'COD'}</strong> •{' '}
                    <Tag
                      color={
                        Number(selectedParcel?.payment_status) === 1 || selectedParcel?.payment_status === 'paid'
                          ? 'green'
                          : 'orange'
                      }
                    >
                      {Number(selectedParcel?.payment_status) === 1 || selectedParcel?.payment_status === 'paid'
                        ? 'Paid'
                        : 'Unpaid / Cash on Delivery'}
                    </Tag>
                  </div>
                </div>

                {selectedParcel?.fast_delivery_charges && (
                  <div className={styles.infoItem}>
                    <div className={styles.infoLabel}>Fast Delivery Charges</div>
                    <div className={styles.infoVal}>
                      ₹{(parseFloat(selectedParcel.fast_delivery_charges) || 0).toFixed(2)}
                    </div>
                  </div>
                )}

                {selectedParcel?.rider_tip_value && (
                  <div className={styles.infoItem}>
                    <div className={styles.infoLabel}>Rider Tip</div>
                    <div className={styles.infoVal}>
                      ₹{(parseFloat(selectedParcel.rider_tip_value) || 0).toFixed(2)}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Assigned Rider */}
            <div className={styles.modalSectionCard}>
              <div className={styles.sectionHeader}>
                <CarOutlined /> Assigned Delivery Rider
              </div>
              {selectedParcel?.rider || selectedParcel?.delivery_partner ? (
                <div className={styles.infoGrid}>
                  <div className={styles.infoItem}>
                    <div className={styles.infoLabel}>Rider Name</div>
                    <div className={styles.infoVal}>{getRiderName(selectedParcel)}</div>
                  </div>

                  <div className={styles.infoItem}>
                    <div className={styles.infoLabel}>Contact Number</div>
                    <div className={styles.infoVal}>{getRiderPhone(selectedParcel)}</div>
                  </div>

                  {selectedParcel?.rider?.email && (
                    <div className={styles.infoItem}>
                      <div className={styles.infoLabel}>Rider Email</div>
                      <div className={styles.infoVal}>{selectedParcel.rider.email}</div>
                    </div>
                  )}

                  {getRiderCustomId(selectedParcel) && (
                    <div className={styles.infoItem}>
                      <div className={styles.infoLabel}>Rider ID</div>
                      <div className={styles.infoVal}>{getRiderCustomId(selectedParcel)}</div>
                    </div>
                  )}
                </div>
              ) : (
                <Alert message="No delivery rider has been assigned yet." type="info" showIcon />
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PickAndDrop;
