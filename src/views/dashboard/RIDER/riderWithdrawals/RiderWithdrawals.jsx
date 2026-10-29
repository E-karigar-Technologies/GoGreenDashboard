import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  Select,
  DatePicker,
  Button,
  Tag,
  Modal,
  Form,
  Input,
  Segmented,
  Alert,
  Typography,
  message,
  Space,
  Row,
  Col,
  Tooltip,
  Popover,
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
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  DollarOutlined,
  CarOutlined,
  BankOutlined,
  FileTextOutlined,
  EyeOutlined,
  PlusOutlined,
  MinusOutlined,
  InfoCircleOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { getRiderWithdrawals, updateRiderWithdrawal } from '../../../../services/apiService';
import styles from './riderWithdrawals.module.scss';

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
        meaning: 'Funds successfully transferred to rider bank account. Transaction complete with UTR reference.',
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
          <strong style={{ color: '#b45309' }}>Awaiting Review:</strong> Request submitted by rider. Awaiting admin review and bank account verification before money is sent.
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
          <strong style={{ color: '#16a34a' }}>Paid & Closed:</strong> Funds successfully deposited into rider bank account. UTR / Transaction Reference is attached.
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

// Data extractor functions for rider withdrawal record
const getRiderName = (item) => {
  if (item?.rider_firstname || item?.rider_lastname) {
    return [item.rider_firstname, item.rider_lastname].filter(Boolean).join(' ');
  }
  const r = item?.rider || item?.user || item?.driver;
  if (r?.firstname || r?.lastname) {
    return [r.firstname, r.lastname].filter(Boolean).join(' ');
  }
  return r?.name || r?.rider_name || item?.rider_name || item?.owner_name || item?.account_holder_name || item?.name || 'Rider';
};

const getRiderPhone = (item) => {
  if (item?.rider_phonenumber) {
    const prefix = item?.rider_prefix ? `${item.rider_prefix} ` : '';
    return prefix + item.rider_phonenumber;
  }
  const r = item?.rider || item?.user || item?.driver;
  if (r?.phonenumber || r?.phone || r?.mobile) {
    const prefix = r?.prefix ? `${r.prefix} ` : '';
    return prefix + (r.phonenumber || r.phone || r.mobile);
  }
  return item?.phone || item?.mobile || 'N/A';
};

const getRiderEmail = (item) => {
  return item?.rider_email || item?.rider?.email || item?.user?.email || null;
};

const getRiderCustomId = (item) => {
  if (item?.rider_custom_id) return item.rider_custom_id;
  const r = item?.rider || item?.user || item?.driver;
  return r?.custom_id || r?.rider_code || item?.custom_id || (item?.rider_id ? `RID#${item.rider_id}` : null);
};

const getBankDetails = (item) => {
  const b = item?.bank_details || item?.account_info || item?.rider?.bank_details || item;
  const accNo = item?.account_number || b?.account_number || b?.acc_no || b?.account_no;
  const accHolder = item?.account_holder_name || b?.account_holder_name || b?.acc_holder;
  const bankName = item?.bank_name || b?.bank_name || b?.bank;
  const transitNo = item?.transit_number || b?.transit_number || b?.transit_no;
  const instNo = item?.institution_number || b?.institution_number || b?.inst_no;
  const ifsc = item?.ifsc_code || b?.ifsc_code || b?.ifsc;
  const upiId = item?.upi_id || b?.upi_id || b?.upi;
  const interacEmail = item?.interac_email || b?.interac_email;

  return { accNo, accHolder, bankName, transitNo, instNo, ifsc, upiId, interacEmail };
};


const getTargetRiderId = (item) => {
  return item?.rider_id || item?.user_id || item?.rider?.id || item?.rider?.user_id || item?.driver_id || null;
};

const RiderWithdrawals = () => {
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

    const res = await getRiderWithdrawals(filterType, dateStr);
    if (res.success) {
      setWithdrawals(res.data || []);
    } else {
      setError(res.error || 'Failed to load rider withdrawals');
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
        const payoutId = String(item.payout_id || '').toLowerCase();
        const riderName = getRiderName(item).toLowerCase();
        const email = String(getRiderEmail(item) || '').toLowerCase();
        const phone = String(getRiderPhone(item)).toLowerCase();
        const customId = String(getRiderCustomId(item) || '').toLowerCase();
        const bankName = String(item.bank_name || '').toLowerCase();
        const accNo = String(item.account_number || '').toLowerCase();
        const accHolder = String(item.account_holder_name || '').toLowerCase();
        const txnRef = String(item?.transaction_ref || item?.transaction_reference || item?.txn_id || '').toLowerCase();
        const notes = String(item?.notes || '').toLowerCase();

        return (
          id.includes(q) ||
          payoutId.includes(q) ||
          riderName.includes(q) ||
          email.includes(q) ||
          phone.includes(q) ||
          customId.includes(q) ||
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
    const txnRefVal = record.transaction_ref || record.transaction_reference || '';
    form.setFieldsValue({
      status: record.status || 'Completed',
      admin_remarks: record.admin_remarks || '',
      transaction_ref: txnRefVal,
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
      transaction_ref: values.transaction_ref || '',
      transaction_reference: values.transaction_ref || '',
    };

    const res = await updateRiderWithdrawal(payload);
    if (res.success) {
      message.success(res.message || 'Rider withdrawal status updated successfully!');
      setIsModalOpen(false);
      fetchWithdrawals();
    } else {
      message.error(res.error || 'Failed to update rider withdrawal status');
    }
    setUpdating(false);
  };

  // Render expanded row with all columns/details when clicked on + button
  const renderExpandedRow = (record) => {
    const riderName = getRiderName(record);
    const phone = getRiderPhone(record);
    const email = getRiderEmail(record);
    const customId = getRiderCustomId(record);
    const { accNo, accHolder, bankName, transitNo, instNo, ifsc, upiId, interacEmail } = getBankDetails(record);
    const amt = record?.amount || record?.requested_amount || 0;
    const statusVal = record?.status || record?.withdrawal_status || record?.payout_status;
    const statusInfo = getStatusInfo(statusVal);
    const targetRiderId = getTargetRiderId(record);
    const dateStr = record?.created_at || record?.createdAt || record?.delivery_date || record?.request_date || record?.date;
    const formattedDate = dateStr
      ? dayjs(dateStr).format('DD MMM YYYY • hh:mm A')
      : 'N/A';
    const txnRef = record.transaction_ref || record.transaction_reference;

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
              <div>Req ID: <strong style={{ color: '#0f172a' }}>#{record.id}</strong> {record.payout_id && <Tag color="blue" style={{ fontSize: 10.5, borderRadius: 4, marginLeft: 4 }}>{record.payout_id}</Tag>}</div>
              <div style={{ marginTop: 4 }}>Date: <strong>{formattedDate}</strong></div>
              <div style={{ marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 11, color: '#64748b' }}>Amount:</span>
                <span style={{ fontWeight: 700, fontSize: 15, color: '#059669' }}>₹{parseFloat(amt).toFixed(2)}</span>
              </div>
            </div>
          </Col>

          {/* Rider Profile & Contact */}
          <Col xs={24} sm={12} md={6}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 5 }}>
              <UserOutlined style={{ color: '#088b46' }} /> Rider Information
            </div>
            <div style={{ fontSize: 12, color: '#334155' }}>
              <div
                style={{
                  fontWeight: 600,
                  color: '#0f172a',
                  fontSize: 13,
                  cursor: targetRiderId ? 'pointer' : 'default',
                }}
                onClick={() => {
                  if (targetRiderId) navigate(`/riders/${targetRiderId}`);
                }}
              >
                <span style={{ textDecoration: targetRiderId ? 'underline' : 'none' }}>{riderName}</span>
                {customId && (
                  <Tag color="blue" style={{ fontSize: 10.5, marginLeft: 6, borderRadius: 4 }}>
                    {customId}
                  </Tag>
                )}
              </div>
              <div style={{ marginTop: 4 }}>
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
            </div>
          </Col>

          {/* Payout & Bank Account Details */}
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
              {interacEmail && <div><strong>Interac:</strong> <Tag color="cyan" style={{ fontSize: 10 }}>{interacEmail}</Tag></div>}
              {!accNo && !upiId && !bankName && !accHolder && !interacEmail && (
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
              {txnRef && (
                <div style={{ fontSize: 12, marginTop: 4 }}>
                  <strong>Txn Ref:</strong> <Tag color="geekblue" style={{ fontSize: 10 }}>{txnRef}</Tag>
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
          {targetRiderId && (
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
              onClick={() => navigate(`/riders/${targetRiderId}`)}
            >
              Open Rider Page (#{targetRiderId})
            </Button>
          )}
        </div>
      </div>
    );
  };

  // Limited primary columns definition (fits on any screen without horizontal scroll)
  const columns = [
    {
      title: 'Req ID & Date',
      key: 'req_id',
      width: 150,
      render: (_, record) => {
        const dateStr = record?.created_at || record?.createdAt || record?.delivery_date || record?.request_date || record?.date;
        const formattedDate = dateStr
          ? dayjs(dateStr).format('MMM D, YYYY • hh:mm A')
          : '';

        return (
          <div>
            <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '13.5px' }}>
              #{record.id}
            </div>
            {record.payout_id && (
              <div style={{ fontSize: '11px', color: '#2563eb', fontWeight: 600 }}>
                {record.payout_id}
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
      title: 'Rider Details',
      key: 'rider_info',
      render: (_, record) => {
        const riderName = getRiderName(record);
        const phone = getRiderPhone(record);
        const customId = getRiderCustomId(record);
        const targetRiderId = getTargetRiderId(record);

        return (
          <div>
            <div
              style={{
                fontWeight: 600,
                color: '#0f172a',
                fontSize: '13.5px',
                cursor: targetRiderId ? 'pointer' : 'default',
              }}
              onClick={() => {
                if (targetRiderId) navigate(`/riders/${targetRiderId}`);
              }}
            >
              <UserOutlined style={{ marginRight: 6, color: '#088b46' }} />
              <span style={{ textDecoration: targetRiderId ? 'underline' : 'none' }}>{riderName}</span>
            </div>
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: 2 }}>
              <PhoneOutlined style={{ marginRight: 4 }} />
              {phone}
              {customId && (
                <Tag color="blue" style={{ fontSize: '10px', padding: '0 4px', marginLeft: 6 }}>
                  {customId}
                </Tag>
              )}
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
        const targetRiderId = getTargetRiderId(record);
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
            {targetRiderId && (
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
                onClick={() => navigate(`/riders/${targetRiderId}`)}
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
            <CarOutlined style={{ color: '#2563eb' }} />
            Rider Withdrawal Requests
          </h2>
          <p>Review rider payout requests, approve or complete payments, and track transaction reference codes</p>
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

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <Input
              placeholder="Search by Rider Name, Email, Phone, Payout ID, Bank, Acc No..."
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
            expandedRowRender: renderExpandedRow,
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
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '50%',
                  backgroundColor: expanded ? '#088b46' : '#f0fdf4',
                  borderColor: expanded ? '#088b46' : '#86efac',
                  color: expanded ? '#ffffff' : '#088b46',
                  fontWeight: 'bold',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                  transition: 'all 0.2s',
                  cursor: 'pointer',
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
        title={`Update Rider Withdrawal Status - Request #${selectedRecord?.id} (${selectedRecord?.payout_id || ''})`}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        {selectedRecord && (
          <div>
            {/* Rider & Account Summary Card */}
            <div className={styles.modalSectionCard}>
              <div className={styles.sectionHeader}>
                <UserOutlined /> Rider & Account Details
              </div>
              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <div className={styles.infoLabel}>Rider Name</div>
                  <div className={styles.infoVal}>{getRiderName(selectedRecord)}</div>
                </div>
                <div className={styles.infoItem}>
                  <div className={styles.infoLabel}>Phone / Email</div>
                  <div className={styles.infoVal}>
                    {getRiderPhone(selectedRecord)}
                    {getRiderEmail(selectedRecord) ? ` • ${getRiderEmail(selectedRecord)}` : ''}
                  </div>
                </div>
                <div className={styles.infoItem}>
                  <div className={styles.infoLabel}>A/C Holder Name</div>
                  <div className={styles.infoVal}>{selectedRecord?.account_holder_name || getRiderName(selectedRecord)}</div>
                </div>
                <div className={styles.infoItem}>
                  <div className={styles.infoLabel}>Bank & Account No</div>
                  <div className={styles.infoVal}>
                    {selectedRecord?.bank_name ? `${selectedRecord.bank_name} - ` : ''}
                    {selectedRecord?.account_number || 'N/A'}
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
                {selectedRecord?.notes && (
                  <div className={styles.infoItem} style={{ gridColumn: 'span 2' }}>
                    <div className={styles.infoLabel}>Rider Note</div>
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
                label={<span style={{ fontWeight: 600 }}>Withdrawal Status</span>}
                rules={[{ required: true, message: 'Please select a status' }]}
              >
                <Select
                  options={[
                    {
                      value: 'Approved',
                      label: (
                        <div style={{ padding: '2px 0' }}>
                          <span style={{ fontWeight: 600, color: '#0284c7' }}>Approved (In Progress)</span>
                          <span style={{ fontSize: 11, color: '#64748b', display: 'block' }}>
                            Authorized & queued for bank transfer
                          </span>
                        </div>
                      ),
                    },
                    {
                      value: 'Completed',
                      label: (
                        <div style={{ padding: '2px 0' }}>
                          <span style={{ fontWeight: 600, color: '#16a34a' }}>Completed (Paid)</span>
                          <span style={{ fontSize: 11, color: '#64748b', display: 'block' }}>
                            Funds sent to bank account (enter UTR/Ref below)
                          </span>
                        </div>
                      ),
                    },
                    {
                      value: 'Pending',
                      label: (
                        <div style={{ padding: '2px 0' }}>
                          <span style={{ fontWeight: 600, color: '#d97706' }}>Pending</span>
                          <span style={{ fontSize: 11, color: '#64748b', display: 'block' }}>
                            Awaiting admin review & verification
                          </span>
                        </div>
                      ),
                    },
                    {
                      value: 'Failed',
                      label: (
                        <div style={{ padding: '2px 0' }}>
                          <span style={{ fontWeight: 600, color: '#dc2626' }}>Failed</span>
                          <span style={{ fontSize: 11, color: '#64748b', display: 'block' }}>
                            Bank transfer or gateway failed
                          </span>
                        </div>
                      ),
                    },
                    {
                      value: 'Rejected',
                      label: (
                        <div style={{ padding: '2px 0' }}>
                          <span style={{ fontWeight: 600, color: '#dc2626' }}>Rejected</span>
                          <span style={{ fontSize: 11, color: '#64748b', display: 'block' }}>
                            Request declined by admin (funds stay in wallet)
                          </span>
                        </div>
                      ),
                    },
                  ]}
                />
              </Form.Item>

              {/* Status Explanation Callout */}
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: 8,
                  padding: '10px 14px',
                  marginBottom: 16,
                  fontSize: 12,
                }}
              >
                <div style={{ fontWeight: 600, color: '#1e293b', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <InfoCircleOutlined style={{ color: '#2563eb' }} />
                  What each status means:
                </div>
                <div style={{ color: '#475569', lineHeight: 1.5 }}>
                  <div><strong style={{ color: '#0284c7' }}>Approved:</strong> Admin verified the request. Payout is in transit / scheduled for bank transfer.</div>
                  <div><strong style={{ color: '#16a34a' }}>Completed:</strong> Money has been paid to the rider bank account. Transaction UTR / Ref is required.</div>
                  <div><strong style={{ color: '#d97706' }}>Pending:</strong> Initial state awaiting admin verification.</div>
                  <div><strong style={{ color: '#dc2626' }}>Failed:</strong> Bank transfer failed (invalid account, IFSC, transit no, or server error).</div>
                  <div><strong style={{ color: '#dc2626' }}>Rejected:</strong> Request declined by admin. Funds remain in rider's wallet.</div>
                </div>
              </div>

              <Form.Item
                name="transaction_ref"
                label="Transaction Reference / UTR Number"
                extra="Enter Interac / Bank Reference / UTR Number for payout tracking"
              >
                <Input placeholder="e.g. REF44332211 or UTR12345678" />
              </Form.Item>

              <Form.Item name="admin_remarks" label="Admin Remarks / Notes">
                <TextArea
                  rows={3}
                  placeholder="e.g. Rider payout transferred via Interac / Bank IMPS"
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

export default RiderWithdrawals;
