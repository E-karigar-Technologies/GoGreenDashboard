import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  Card,
  Row,
  Col,
  Input,
  Select,
  DatePicker,
  Button,
  Tag,
  Modal,
  Form,
  Space,
  Tooltip,
  Popover,
  Segmented,
  Alert,
  Typography,
  message,
} from 'antd';
import {
  WalletOutlined,
  ReloadOutlined,
  SearchOutlined,
  EditOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  SyncOutlined,
  BankOutlined,
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  DollarOutlined,
  FileTextOutlined,
  ShopOutlined,
  EnvironmentOutlined,
  PlusOutlined,
  MinusOutlined,
  EyeOutlined,
  ArrowRightOutlined,
  InfoCircleOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { getVendorWithdrawals, updateVendorWithdrawal } from '../../../services/apiService';
import styles from './vendorWithdrawals.module.scss';

const { Text } = Typography;
const { TextArea } = Input;

// Helper to format status badges with complete descriptions
const getStatusInfo = (statusStr) => {
  const status = String(statusStr || 'Pending').toLowerCase().trim();
  switch (status) {
    case 'approved':
      return {
        label: 'Approved',
        color: 'processing',
        icon: <SyncOutlined spin />,
        title: 'Approved (In Progress)',
        meaning: 'Request verified and authorized. Payout is in transit / queued for bank transfer.',
      };
    case 'completed':
    case 'success':
    case 'paid':
      return {
        label: 'Completed',
        color: 'success',
        icon: <CheckCircleOutlined />,
        title: 'Completed (Paid)',
        meaning: 'Funds successfully transferred to vendor bank account. Transaction complete with reference.',
      };
    case 'failed':
      return {
        label: 'Failed',
        color: 'error',
        icon: <CloseCircleOutlined />,
        title: 'Bank Transfer Failed',
        meaning: 'Transfer failed due to incorrect account number, invalid transit/IFSC, or bank gateway error.',
      };
    case 'rejected':
      return {
        label: 'Rejected',
        color: 'error',
        icon: <CloseCircleOutlined />,
        title: 'Declined by Admin',
        meaning: 'Withdrawal declined by admin due to policy violation or disputed orders. Funds remain in wallet.',
      };
    case 'cancelled':
    case 'canceled':
      return {
        label: 'Cancelled',
        color: 'error',
        icon: <CloseCircleOutlined />,
        title: 'Cancelled',
        meaning: 'Withdrawal was cancelled before payment processing.',
      };
    case 'pending':
    default:
      return {
        label: 'Pending',
        color: 'warning',
        icon: <ClockCircleOutlined />,
        title: 'Pending Review',
        meaning: 'New withdrawal request submitted. Awaiting admin review and bank account verification.',
      };
  }
};

// Reusable Status Guide Popover Content
const StatusGuidePopoverContent = () => (
  <div style={{ maxWidth: 440, padding: '4px 0' }}>
    <div style={{ fontWeight: 700, fontSize: 13.5, color: '#0f172a', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6, borderBottom: '1px solid #f1f5f9', paddingBottom: 6 }}>
      <InfoCircleOutlined style={{ color: '#2563eb' }} />
      Withdrawal Status Meanings & Lifecycle Guide
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
        <Tag color="warning" icon={<ClockCircleOutlined />} style={{ minWidth: 95, textAlign: 'center', margin: 0, fontWeight: 600 }}>
          Pending
        </Tag>
        <div style={{ fontSize: 11.5, color: '#475569', lineHeight: 1.4 }}>
          <strong style={{ color: '#b45309' }}>Awaiting Review:</strong> Request submitted by vendor. Awaiting admin review and bank account verification before money is sent.
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
        <Tag color="processing" icon={<SyncOutlined spin />} style={{ minWidth: 95, textAlign: 'center', margin: 0, fontWeight: 600 }}>
          Approved
        </Tag>
        <div style={{ fontSize: 11.5, color: '#475569', lineHeight: 1.4 }}>
          <strong style={{ color: '#0284c7' }}>Authorized / In Transit:</strong> Admin verified the request. Payment has been approved and is queued/processing with the bank.
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
        <Tag color="success" icon={<CheckCircleOutlined />} style={{ minWidth: 95, textAlign: 'center', margin: 0, fontWeight: 600 }}>
          Completed
        </Tag>
        <div style={{ fontSize: 11.5, color: '#475569', lineHeight: 1.4 }}>
          <strong style={{ color: '#16a34a' }}>Paid & Closed:</strong> Funds successfully deposited into vendor bank account. Transaction Reference is attached.
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
        <Tag color="error" icon={<CloseCircleOutlined />} style={{ minWidth: 95, textAlign: 'center', margin: 0, fontWeight: 600 }}>
          Failed
        </Tag>
        <div style={{ fontSize: 11.5, color: '#475569', lineHeight: 1.4 }}>
          <strong style={{ color: '#dc2626' }}>Transfer Failed:</strong> Bank or payment gateway rejected the transfer (e.g. incorrect account/transit/IFSC number, account closed, or timeout).
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
        <Tag color="error" icon={<CloseCircleOutlined />} style={{ minWidth: 95, textAlign: 'center', margin: 0, fontWeight: 600 }}>
          Rejected
        </Tag>
        <div style={{ fontSize: 11.5, color: '#475569', lineHeight: 1.4 }}>
          <strong style={{ color: '#dc2626' }}>Declined by Admin:</strong> Request rejected by admin due to policy discrepancies, dispute, or invalid bank details. Funds stay in wallet balance.
        </div>
      </div>
    </div>
  </div>
);

// Data extractor functions for vendor withdrawal record
const getVendorStoreName = (item) =>
  item?.store_name || item?.vendor?.store_name || item?.vendor?.storename || item?.vendor_name || 'Vendor Store';

const getVendorOwnerName = (item) => {
  if (item?.vendor_firstname || item?.vendor_lastname) {
    return [item.vendor_firstname, item.vendor_lastname].filter(Boolean).join(' ');
  }
  if (item?.vendor?.firstname || item?.vendor?.lastname) {
    return [item.vendor.firstname, item.vendor.lastname].filter(Boolean).join(' ');
  }
  if (item?.user?.firstname || item?.user?.lastname) {
    return [item.user.firstname, item.user.lastname].filter(Boolean).join(' ');
  }
  return item?.owner_name || item?.vendor_name || 'Vendor';
};

const getVendorPhone = (item) => {
  if (item?.vendor_phonenumber) {
    const prefix = item?.vendor_prefix ? `${item.vendor_prefix} ` : '';
    return prefix + item.vendor_phonenumber;
  }
  const v = item?.vendor || item?.user;
  if (v?.phonenumber) {
    const prefix = v?.prefix ? `${v.prefix} ` : '';
    return prefix + v.phonenumber;
  }
  return item?.phone || item?.mobile || 'N/A';
};

const getVendorEmail = (item) => {
  return item?.vendor_email || item?.vendor?.email || item?.user?.email || null;
};

const getVendorCustomId = (item) => {
  return item?.withdrawal_uid || item?.vendor?.custom_id || item?.custom_id || (item?.vendor_id ? `VND#${item.vendor_id}` : null);
};

const getBankDetails = (item) => {
  const b = item?.bank_details || item;
  const accNo = item?.account_number || b?.account_number || b?.acc_no || b?.account_no;
  const accHolder = item?.account_holder_name || b?.account_holder_name || b?.acc_holder;
  const bankName = item?.bank_name || b?.bank_name || b?.bank;
  const transitNo = item?.transit_number || b?.transit_number || b?.transit_no;
  const instNo = item?.institution_number || b?.institution_number || b?.inst_no;
  const ifsc = item?.ifsc_code || b?.ifsc_code || b?.ifsc;
  const upiId = item?.upi_id || b?.upi_id || b?.upi;

  return { accNo, accHolder, bankName, transitNo, instNo, ifsc, upiId };
};

const getTargetVendorId = (record) => {
  return record?.vendor_id || record?.user_id || record?.vendor?.id || record?.vendor?.user_id;
};

const VendorWithdrawals = () => {
  const navigate = useNavigate();
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Filter states
  const [filterType, setFilterType] = useState('all'); // 'all', 'today', 'date'
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [statusTab, setStatusTab] = useState('all'); // 'all', 'Pending', 'Approved', 'Completed', 'Failed', 'Rejected'
  const [searchText, setSearchText] = useState('');

  // Modal Update State
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [form] = Form.useForm();

  // Fetch API
  const fetchWithdrawals = async () => {
    setLoading(true);
    setError(null);
    let dateStr = null;
    if (filterType === 'date' && selectedDate) {
      dateStr = selectedDate.format('YYYY-MM-DD');
    }

    const res = await getVendorWithdrawals(filterType, dateStr);
    if (res.success) {
      setWithdrawals(res.data || []);
    } else {
      setError(res.error || 'Failed to load vendor withdrawals');
      setWithdrawals([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchWithdrawals();
  }, [filterType, selectedDate]);

  // Metric Stats
  const stats = useMemo(() => {
    const total = withdrawals.length;
    const pending = withdrawals.filter((w) => {
      const s = String(w.status || w.withdrawal_status || '').toLowerCase().trim();
      return s === 'pending';
    }).length;
    const approved = withdrawals.filter((w) => {
      const s = String(w.status || w.withdrawal_status || '').toLowerCase().trim();
      return s === 'approved';
    }).length;
    const completed = withdrawals.filter((w) => {
      const s = String(w.status || w.withdrawal_status || '').toLowerCase().trim();
      return ['completed', 'success', 'paid'].includes(s);
    }).length;
    const rejected = withdrawals.filter((w) => {
      const s = String(w.status || w.withdrawal_status || '').toLowerCase().trim();
      return s === 'rejected';
    }).length;
    const failed = withdrawals.filter((w) => {
      const s = String(w.status || w.withdrawal_status || '').toLowerCase().trim();
      return ['failed', 'cancelled', 'canceled'].includes(s);
    }).length;

    const totalAmount = withdrawals.reduce(
      (sum, w) => sum + (parseFloat(w.amount || w.requested_amount || 0) || 0),
      0
    );

    return { total, pending, approved, completed, rejected, failed, totalAmount };
  }, [withdrawals]);

  // Filtered dataset for Table
  const filteredData = useMemo(() => {
    return withdrawals.filter((item) => {
      const itemStatus = String(item.status || item.withdrawal_status || '').toLowerCase().trim();
      // Status filter
      if (statusTab !== 'all') {
        const target = statusTab.toLowerCase();
        if (target === 'failed') {
          if (!['failed', 'cancelled', 'canceled'].includes(itemStatus)) return false;
        } else if (target === 'completed') {
          if (!['completed', 'success', 'paid'].includes(itemStatus)) return false;
        } else if (itemStatus !== target) {
          return false;
        }
      }

      // Search filter
      if (searchText.trim() !== '') {
        const q = searchText.toLowerCase().trim();
        const id = String(item.id || '').toLowerCase();
        const uid = String(item.withdrawal_uid || '').toLowerCase();
        const storeName = getVendorStoreName(item).toLowerCase();
        const ownerName = getVendorOwnerName(item).toLowerCase();
        const email = String(getVendorEmail(item) || '').toLowerCase();
        const phone = String(getVendorPhone(item)).toLowerCase();
        const bankName = String(item.bank_name || '').toLowerCase();
        const accNo = String(item.account_number || '').toLowerCase();
        const accHolder = String(item.account_holder_name || '').toLowerCase();
        const txnRef = String(item?.transaction_reference || item?.txn_id || '').toLowerCase();
        const notes = String(item?.notes || '').toLowerCase();

        return (
          id.includes(q) ||
          uid.includes(q) ||
          storeName.includes(q) ||
          ownerName.includes(q) ||
          email.includes(q) ||
          phone.includes(q) ||
          bankName.includes(q) ||
          accNo.includes(q) ||
          accHolder.includes(q) ||
          txnRef.includes(q) ||
          notes.includes(q)
        );
      }

      return true;
    });
  }, [withdrawals, statusTab, searchText]);

  // Open Update Modal
  const handleOpenUpdateModal = (record) => {
    setSelectedRecord(record);
    form.setFieldsValue({
      status: record.status || 'Approved',
      admin_remarks: record.admin_remarks || '',
      transaction_reference: record.transaction_reference || '',
    });
    setIsModalOpen(true);
  };

  // Submit Status Update
  const handleFormSubmit = async (values) => {
    if (!selectedRecord) return;
    setUpdating(true);

    const payload = {
      id: selectedRecord.id,
      status: values.status,
      admin_remarks: values.admin_remarks || '',
      transaction_reference: values.transaction_reference || '',
    };

    const res = await updateVendorWithdrawal(payload);
    if (res.success) {
      message.success(res.message || 'Vendor withdrawal status updated successfully!');
      setIsModalOpen(false);
      fetchWithdrawals();
    } else {
      message.error(res.error || 'Failed to update withdrawal status');
    }
    setUpdating(false);
  };

  // Render expanded row with all columns/details when clicked on + button
  const renderExpandedRow = (record) => {
    const storeName = getVendorStoreName(record);
    const ownerName = getVendorOwnerName(record);
    const phone = getVendorPhone(record);
    const email = getVendorEmail(record);
    const { accNo, accHolder, bankName, transitNo, instNo, ifsc, upiId } = getBankDetails(record);
    const amt = record?.amount || record?.requested_amount || 0;
    const pendingAmt = record?.pending_amount;
    const statusVal = record?.status || record?.withdrawal_status || record?.payout_status;
    const statusInfo = getStatusInfo(statusVal);
    const targetVendorId = getTargetVendorId(record);
    const dateStr = record?.date_time || record?.created_at || record?.createdAt;
    const formattedDate = dateStr
      ? dayjs(dateStr).format('DD MMM YYYY • hh:mm A')
      : record?.date
      ? `${record.date} ${record.time || ''}`
      : 'N/A';

    return (
      <div
        style={{
          padding: '16px 20px',
          background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
          borderRadius: 10,
          border: '1px solid #e2e8f0',
          boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.02)',
        }}
      >
        <Row gutter={[16, 16]}>
          {/* Request Info & Amount */}
          <Col xs={24} sm={12} md={6}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 5 }}>
              <WalletOutlined style={{ color: '#2563eb' }} /> Request & Financials
            </div>
            <div style={{ fontSize: 12, color: '#475569' }}>
              <div>Req ID: <strong style={{ color: '#0f172a' }}>#{record.id}</strong> {record.withdrawal_uid && <Tag color="blue" style={{ fontSize: 10.5, borderRadius: 4, marginLeft: 4 }}>{record.withdrawal_uid}</Tag>}</div>
              <div style={{ marginTop: 4 }}>Date: <strong>{formattedDate}</strong></div>
              <div style={{ marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 11, color: '#64748b' }}>Amount:</span>
                <span style={{ fontWeight: 700, fontSize: 15, color: '#059669' }}>₹{parseFloat(amt).toFixed(2)}</span>
              </div>
              {pendingAmt && (
                <div style={{ fontSize: 11, color: '#2563eb', marginTop: 3 }}>
                  Wallet Bal: <strong>₹{parseFloat(pendingAmt).toFixed(2)}</strong>
                </div>
              )}
            </div>
          </Col>

          {/* Store & Contact Info */}
          <Col xs={24} sm={12} md={6}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 5 }}>
              <ShopOutlined style={{ color: '#088b46' }} /> Vendor Store & Contact
            </div>
            <div style={{ fontSize: 12, color: '#334155' }}>
              <div style={{ fontWeight: 600, color: '#0f172a', fontSize: 13 }}>
                {storeName}
              </div>
              <div style={{ marginTop: 2, color: '#475569' }}>
                Owner: <strong>{ownerName}</strong>
              </div>
              <div style={{ marginTop: 2 }}>
                Phone:{' '}
                {phone && phone !== 'N/A' ? (
                  <a href={`tel:${phone}`} style={{ color: '#088b46', fontWeight: 600, textDecoration: 'none' }}>
                    {phone}
                  </a>
                ) : <span style={{ color: '#94a3b8' }}>N/A</span>}
              </div>
              {email && (
                <div style={{ marginTop: 2 }}>
                  Email:{' '}
                  <a href={`mailto:${email}`} style={{ color: '#0284c7', textDecoration: 'none' }}>
                    {email}
                  </a>
                </div>
              )}
              {record.store_address && (
                <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }} title={record.store_address}>
                  <EnvironmentOutlined style={{ marginRight: 4 }} />
                  {record.store_address}
                </div>
              )}
            </div>
          </Col>

          {/* Bank Account Info */}
          <Col xs={24} sm={12} md={6}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 5 }}>
              <BankOutlined style={{ color: '#7c3aed' }} /> Bank Payout Details
            </div>
            <div style={{ fontSize: 12, color: '#334155' }}>
              {accHolder && <div><strong>Holder:</strong> {accHolder}</div>}
              {bankName && <div><strong>Bank:</strong> {bankName}</div>}
              {accNo && <div><strong>A/C No:</strong> <span style={{ fontFamily: 'monospace' }}>{accNo}</span></div>}
              {(transitNo || instNo) && (
                <div>
                  {transitNo && <span><strong>Transit:</strong> {transitNo} </span>}
                  {instNo && <span><strong>Inst:</strong> {instNo}</span>}
                </div>
              )}
              {ifsc && <div><strong>IFSC:</strong> {ifsc}</div>}
              {upiId && <div><strong>UPI ID:</strong> <Tag color="purple" style={{ fontSize: 10 }}>{upiId}</Tag></div>}
              {!accNo && !upiId && !bankName && !accHolder && (
                <span style={{ color: '#94a3b8' }}>Details not provided</span>
              )}
            </div>
          </Col>

          {/* Status & Processing Remarks */}
          <Col xs={24} sm={12} md={6}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 5 }}>
              <FileTextOutlined style={{ color: '#d97706' }} /> Processing & Notes
            </div>
            <div>
              <div style={{ marginBottom: 4 }}>
                <Tooltip title={<span><strong>{statusInfo.title}:</strong> {statusInfo.meaning}</span>}>
                  <Tag color={statusInfo.color} icon={statusInfo.icon} style={{ borderRadius: 10, fontWeight: 600, cursor: 'pointer' }}>
                    {statusInfo.label}
                  </Tag>
                </Tooltip>
                <div style={{ fontSize: 11, color: '#64748b', marginTop: 3 }}>{statusInfo.meaning}</div>
              </div>
              {record.transaction_reference && (
                <div style={{ fontSize: 12, marginTop: 4 }}>
                  <strong>Txn Ref:</strong> <Tag color="geekblue" style={{ fontSize: 10 }}>{record.transaction_reference}</Tag>
                </div>
              )}
              {record.notes && (
                <div style={{ fontSize: 11.5, color: '#475569', background: '#f1f5f9', padding: '5px 8px', borderRadius: 4, marginTop: 4 }}>
                  <em>Note: {record.notes}</em>
                </div>
              )}
              {record.admin_remarks && (
                <div style={{ fontSize: 11.5, color: '#64748b', background: '#fef3c7', border: '1px solid #fde68a', padding: '5px 8px', borderRadius: 4, marginTop: 4 }}>
                  <em>Admin: {record.admin_remarks}</em>
                </div>
              )}
            </div>
          </Col>
        </Row>

        {/* Footer Actions */}
        <div style={{ marginTop: 14, paddingTop: 10, borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <Button
            size="small"
            type="primary"
            icon={<EditOutlined />}
            style={{ fontWeight: 600, borderRadius: 6 }}
            onClick={() => handleOpenUpdateModal(record)}
          >
            Update Withdrawal Status
          </Button>
          {targetVendorId && (
            <Button
              size="small"
              icon={<EyeOutlined />}
              style={{
                borderRadius: 6,
                fontWeight: 600,
                backgroundColor: '#088b46',
                borderColor: '#088b46',
                color: '#ffffff',
              }}
              onClick={() => navigate(`/vendors/${targetVendorId}`)}
            >
              Open Vendor Page (#{targetVendorId})
            </Button>
          )}
        </div>
      </div>
    );
  };

  const expandedRowRender = renderExpandedRow;

  // Limited primary columns definition (fits on any screen without horizontal scroll)
  const columns = [
    {
      title: 'Req ID & Date',
      key: 'req_id',
      width: 150,
      render: (_, record) => {
        const dateStr = record?.date_time || record?.created_at || record?.createdAt;
        const formattedDate = dateStr
          ? dayjs(dateStr).format('MMM D, YYYY • hh:mm A')
          : record?.date
          ? `${record.date} ${record.time || ''}`
          : '';

        return (
          <div>
            <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '13.5px' }}>
              #{record.id}
            </div>
            {record.withdrawal_uid && (
              <div style={{ fontSize: '11px', color: '#2563eb', fontWeight: 600 }}>
                {record.withdrawal_uid}
              </div>
            )}
            {formattedDate && (
              <div style={{ fontSize: '11px', color: '#64748b', marginTop: 2 }}>
                {formattedDate}
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: 'Vendor Details',
      key: 'vendor_info',
      render: (_, record) => {
        const storeName = getVendorStoreName(record);
        const ownerName = getVendorOwnerName(record);
        const phone = getVendorPhone(record);
        const targetVendorId = getTargetVendorId(record);

        return (
          <div>
            <div
              style={{
                fontWeight: 600,
                color: '#0f172a',
                fontSize: '13.5px',
                cursor: targetVendorId ? 'pointer' : 'default',
              }}
              onClick={() => {
                if (targetVendorId) navigate(`/vendors/${targetVendorId}`);
              }}
            >
              <ShopOutlined style={{ marginRight: 6, color: '#088b46' }} />
              <span style={{ textDecoration: targetVendorId ? 'underline' : 'none' }}>{storeName}</span>
            </div>
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: 2 }}>
              <UserOutlined style={{ marginRight: 4 }} />
              {ownerName}
              {phone && phone !== 'N/A' && ` • ${phone}`}
            </div>
          </div>
        );
      },
    },
    {
      title: 'Amount',
      key: 'amount',
      width: 130,
      render: (_, record) => {
        const amt = record?.amount || record?.requested_amount || 0;
        return (
          <div style={{ fontWeight: 700, color: '#059669', fontSize: '15px' }}>
            ₹{parseFloat(amt).toFixed(2)}
          </div>
        );
      },
    },
    {
      title: (
        <span>
          Status{' '}
          <Tooltip title="Hover on any status badge or click Status Meanings above for details">
            <InfoCircleOutlined style={{ color: '#94a3b8', fontSize: 12, marginLeft: 2 }} />
          </Tooltip>
        </span>
      ),
      key: 'status',
      width: 135,
      render: (_, record) => {
        const statusVal = record?.status || record?.withdrawal_status || record?.payout_status;
        const info = getStatusInfo(statusVal);
        return (
          <Tooltip title={<span><strong>{info.title}:</strong> {info.meaning}</span>} placement="top">
            <Tag color={info.color} icon={info.icon} style={{ borderRadius: 12, padding: '3px 10px', fontWeight: 600, cursor: 'pointer' }}>
              {info.label}
            </Tag>
          </Tooltip>
        );
      },
    },
    {
      title: 'Action',
      key: 'action',
      width: 185,
      align: 'right',
      render: (_, record) => {
        const targetVendorId = getTargetVendorId(record);
        return (
          <Space size={6}>
            <Button
              type="primary"
              icon={<EditOutlined />}
              size="small"
              onClick={() => handleOpenUpdateModal(record)}
              style={{ fontWeight: 600, borderRadius: 5 }}
            >
              Update
            </Button>
            {targetVendorId && (
              <Button
                size="small"
                icon={<EyeOutlined />}
                style={{
                  borderRadius: 5,
                  background: '#088b46',
                  color: '#ffffff',
                  borderColor: '#088b46',
                  fontWeight: 600,
                }}
                onClick={() => navigate(`/vendors/${targetVendorId}`)}
              >
                View Page
              </Button>
            )}
          </Space>
        );
      },
    },
  ];

  return (
    <div className={styles.withdrawalsContainer}>
      {/* Header Section */}
      <div className={styles.headerSection}>
        <div className={styles.titleBox}>
          <h2>
            <WalletOutlined style={{ color: '#2563eb' }} />
            Vendor Withdrawal Requests
          </h2>
          <p>Review vendor withdrawal requests, update status to Approved/Completed, and attach transaction references</p>
        </div>

        <div className={styles.controlsBox}>
          <Select
            value={filterType}
            onChange={(val) => setFilterType(val)}
            style={{ width: 160 }}
            options={[
              { label: 'All Requests', value: 'all' },
              { label: "Today's Requests", value: 'today' },
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
            onClick={fetchWithdrawals}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert
          message="Error Loading Withdrawals"
          description={error}
          type="error"
          showIcon
          closable
          style={{ marginBottom: 20 }}
        />
      )}

      {/* Metric Stat Cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statInfo}>
            <div className={styles.statLabel}>Total Requests</div>
            <div className={styles.statValue}>{stats.total}</div>
          </div>
          <div className={styles.statIcon} style={{ background: '#eff6ff', color: '#2563eb' }}>
            <WalletOutlined />
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statInfo}>
            <div className={styles.statLabel}>Total Requested ₹</div>
            <div className={styles.statValue}>₹{stats.totalAmount.toFixed(2)}</div>
          </div>
          <div className={styles.statIcon} style={{ background: '#ecfdf5', color: '#059669' }}>
            <DollarOutlined />
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statInfo}>
            <div className={styles.statLabel}>Pending</div>
            <div className={styles.statValue}>{stats.pending}</div>
          </div>
          <div className={styles.statIcon} style={{ background: '#fffbe6', color: '#faad14' }}>
            <ClockCircleOutlined />
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statInfo}>
            <div className={styles.statLabel}>Approved</div>
            <div className={styles.statValue}>{stats.approved}</div>
          </div>
          <div className={styles.statIcon} style={{ background: '#e0f2fe', color: '#0284c7' }}>
            <SyncOutlined />
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statInfo}>
            <div className={styles.statLabel}>Completed</div>
            <div className={styles.statValue}>{stats.completed}</div>
          </div>
          <div className={styles.statIcon} style={{ background: '#f0fdf4', color: '#16a34a' }}>
            <CheckCircleOutlined />
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statInfo}>
            <div className={styles.statLabel}>Failed</div>
            <div className={styles.statValue}>{stats.failed}</div>
          </div>
          <div className={styles.statIcon} style={{ background: '#fef2f2', color: '#ef4444' }}>
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
              { label: `Pending (${stats.pending})`, value: 'Pending' },
              { label: `Approved (${stats.approved})`, value: 'Approved' },
              { label: `Completed (${stats.completed})`, value: 'Completed' },
              { label: `Failed (${stats.failed})`, value: 'Failed' },
              { label: `Rejected (${stats.rejected})`, value: 'Rejected' },
            ]}
            value={statusTab}
            onChange={(val) => setStatusTab(val)}
          />

          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <Input
              placeholder="Search by Store, Owner, Email, Phone, UID, Bank, Acc No..."
              prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
              style={{ width: 340 }}
            />
            <Popover
              content={<StatusGuidePopoverContent />}
              title={<span style={{ fontWeight: 700 }}><QuestionCircleOutlined /> Withdrawal Status Meanings & Guide</span>}
              trigger="click"
              placement="bottomRight"
            >
              <Button icon={<QuestionCircleOutlined />} style={{ borderRadius: 6, fontWeight: 500 }}>
                Status Meanings
              </Button>
            </Popover>
          </div>
        </div>

        <Table
          dataSource={filteredData}
          columns={columns}
          rowKey={(record) => record.id || Math.random()}
          loading={loading}
          pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (t) => `Total ${t} requests` }}
          expandable={{
            expandedRowRender,
            rowExpandable: () => true,
            expandIcon: ({ expanded, onExpand, record }) => (
              <Button
                size="small"
                type="default"
                onClick={(e) => {
                  e.stopPropagation();
                  onExpand(record, e);
                }}
                style={{
                  width: 24,
                  height: 24,
                  minWidth: 24,
                  padding: 0,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "50%",
                  backgroundColor: expanded ? "#088b46" : "#f0fdf4",
                  borderColor: expanded ? "#088b46" : "#86efac",
                  color: expanded ? "#ffffff" : "#088b46",
                  fontWeight: "bold",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                  transition: "all 0.2s",
                  cursor: "pointer",
                }}
              >
                {expanded ? (
                  <MinusOutlined style={{ fontSize: 10 }} />
                ) : (
                  <PlusOutlined style={{ fontSize: 10 }} />
                )}
              </Button>
            ),
          }}
        />
      </div>

      {/* Status Update Modal */}
      <Modal
        title={`Update Withdrawal Status - Request #${selectedRecord?.id} (${selectedRecord?.withdrawal_uid || ''})`}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        {selectedRecord && (
          <div>
            {/* Vendor Summary Card */}
            <div className={styles.modalSectionCard}>
              <div className={styles.sectionHeader} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <ShopOutlined /> Vendor Details
                </div>
                {getTargetVendorId(selectedRecord) && (
                  <Button
                    size="small"
                    type="link"
                    icon={<EyeOutlined />}
                    onClick={() => navigate(`/vendors/${getTargetVendorId(selectedRecord)}`)}
                    style={{ padding: 0, height: "auto", fontWeight: 600, color: "#088b46" }}
                  >
                    Open Vendor Page #{getTargetVendorId(selectedRecord)}
                  </Button>
                )}
              </div>
              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <div className={styles.infoLabel}>Store Name</div>
                  <div className={styles.infoVal}>{getVendorStoreName(selectedRecord)}</div>
                </div>
                <div className={styles.infoItem}>
                  <div className={styles.infoLabel}>Owner & Phone</div>
                  <div className={styles.infoVal}>
                    {getVendorOwnerName(selectedRecord)} ({getVendorPhone(selectedRecord)})
                  </div>
                </div>
                {getVendorEmail(selectedRecord) && (
                  <div className={styles.infoItem}>
                    <div className={styles.infoLabel}>Email</div>
                    <div className={styles.infoVal}>{getVendorEmail(selectedRecord)}</div>
                  </div>
                )}
                <div className={styles.infoItem}>
                  <div className={styles.infoLabel}>A/C Holder & Bank</div>
                  <div className={styles.infoVal}>
                    {selectedRecord?.account_holder_name ? `${selectedRecord.account_holder_name} • ` : ''}
                    {selectedRecord?.bank_name || 'N/A'} (A/C: {selectedRecord?.account_number || 'N/A'})
                  </div>
                </div>
                {(selectedRecord?.transit_number || selectedRecord?.institution_number) && (
                  <div className={styles.infoItem}>
                    <div className={styles.infoLabel}>Transit & Institution No</div>
                    <div className={styles.infoVal}>
                      Transit: {selectedRecord?.transit_number || 'N/A'} | Inst: {selectedRecord?.institution_number || 'N/A'}
                    </div>
                  </div>
                )}
                <div className={styles.infoItem}>
                  <div className={styles.infoLabel}>Requested Amount</div>
                  <div className={styles.infoVal} style={{ color: '#059669', fontSize: '15px' }}>
                    ₹{parseFloat(selectedRecord?.amount || selectedRecord?.requested_amount || 0).toFixed(2)}
                  </div>
                </div>
                {selectedRecord?.pending_amount && (
                  <div className={styles.infoItem}>
                    <div className={styles.infoLabel}>Wallet Balance</div>
                    <div className={styles.infoVal} style={{ color: '#2563eb' }}>
                      ₹{parseFloat(selectedRecord.pending_amount).toFixed(2)}
                    </div>
                  </div>
                )}
                <div className={styles.infoItem}>
                  <div className={styles.infoLabel}>Current Status</div>
                  <div className={styles.infoVal}>
                    {(() => {
                      const statusVal = selectedRecord?.status || selectedRecord?.withdrawal_status;
                      const info = getStatusInfo(statusVal);
                      return <Tag color={info.color}>{info.label}</Tag>;
                    })()}
                  </div>
                </div>
                {selectedRecord?.notes && (
                  <div className={styles.infoItem} style={{ gridColumn: 'span 2' }}>
                    <div className={styles.infoLabel}>Vendor Note</div>
                    <div className={styles.infoVal} style={{ fontStyle: 'italic', fontWeight: 400 }}>
                      "{selectedRecord.notes}"
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Status Update Form */}
            <Form form={form} layout="vertical" onFinish={handleFormSubmit}>
              <Form.Item
                name="status"
                label="Withdrawal Status"
                rules={[{ required: true, message: 'Please select a status' }]}
              >
                <Select
                  options={[
                    { label: 'Approved', value: 'Approved' },
                    { label: 'Completed', value: 'Completed' },
                    { label: 'Pending', value: 'Pending' },
                    { label: 'Failed', value: 'Failed' },
                    { label: 'Rejected', value: 'Rejected' },
                  ]}
                />
              </Form.Item>

              <Form.Item
                name="transaction_reference"
                label="Transaction Reference / UTR Number"
                extra="Enter UPI / Bank Reference / UTR Number for payout tracking"
              >
                <Input placeholder="e.g. TXN99887766 or UTR12345678" />
              </Form.Item>

              <Form.Item name="admin_remarks" label="Admin Remarks / Notes">
                <TextArea
                  rows={3}
                  placeholder="e.g. Withdrawal processed successfully to vendor bank account via IMPS"
                />
              </Form.Item>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
                <Button onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button type="primary" htmlType="submit" loading={updating}>
                  Update Status
                </Button>
              </div>
            </Form>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default VendorWithdrawals;
