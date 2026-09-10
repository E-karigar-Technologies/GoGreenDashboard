import React, { useEffect, useState, useMemo } from 'react';
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
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { getRiderWithdrawals, updateRiderWithdrawal } from '../../../../services/apiService';
import styles from './riderWithdrawals.module.scss';

const { Text } = Typography;
const { TextArea } = Input;

// Helper to format status badges
const getStatusInfo = (statusStr) => {
  const status = String(statusStr || 'Pending').toLowerCase().trim();
  switch (status) {
    case 'approved':
      return { label: 'Approved', color: 'processing', icon: <SyncOutlined spin /> };
    case 'completed':
    case 'success':
    case 'paid':
      return { label: 'Completed', color: 'success', icon: <CheckCircleOutlined /> };
    case 'failed':
      return { label: 'Failed', color: 'error', icon: <CloseCircleOutlined /> };
    case 'rejected':
      return { label: 'Rejected', color: 'error', icon: <CloseCircleOutlined /> };
    case 'cancelled':
    case 'canceled':
      return { label: 'Cancelled', color: 'error', icon: <CloseCircleOutlined /> };
    case 'pending':
    default:
      return { label: 'Pending', color: 'warning', icon: <ClockCircleOutlined /> };
  }
};

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

const RiderWithdrawals = () => {
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

  // Columns definition
  const columns = [
    {
      title: 'Req ID & Date',
      key: 'req_id',
      width: 180,
      render: (_, record) => {
        const dateStr = record?.created_at || record?.createdAt || record?.delivery_date || record?.request_date;
        return (
          <div>
            <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '14px' }}>
              #{record.id}
            </div>
            {record.payout_id && (
              <div style={{ fontSize: '11px', color: '#2563eb', fontWeight: 600 }}>
                {record.payout_id}
              </div>
            )}
            {dateStr && (
              <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: 2 }}>
                {dayjs(dateStr).format('MMM D, YYYY • hh:mm A')}
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: 'Rider Details',
      key: 'rider_info',
      width: 250,
      render: (_, record) => {
        const riderName = getRiderName(record);
        const phone = getRiderPhone(record);
        const email = getRiderEmail(record);
        const customId = getRiderCustomId(record);

        return (
          <div>
            <div style={{ fontWeight: 600, color: '#1e293b', fontSize: '13.5px' }}>
              <UserOutlined style={{ marginRight: 6, color: '#2563eb' }} />
              {riderName}
            </div>
            <div style={{ fontSize: '12px', color: '#475569', marginTop: 2 }}>
              <PhoneOutlined style={{ marginRight: 4 }} />
              {phone}
            </div>
            {email && (
              <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: 1 }}>
                <MailOutlined style={{ marginRight: 4 }} />
                {email}
              </div>
            )}
            {customId && (
              <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: 2 }}>
                ID: <Tag color="blue" style={{ fontSize: '10px', padding: '0 4px', margin: 0 }}>{customId}</Tag>
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: 'Payout Account Info',
      key: 'account_info',
      width: 270,
      render: (_, record) => {
        const { accNo, accHolder, bankName, transitNo, instNo, ifsc, upiId, interacEmail } = getBankDetails(record);
        if (!accNo && !upiId && !bankName && !interacEmail && !accHolder) {
          return <Text type="secondary" style={{ fontSize: 12 }}>Details not provided</Text>;
        }
        return (
          <div style={{ fontSize: '12px', color: '#334155' }}>
            {accHolder && (
              <div>
                <strong>A/C Holder:</strong> {accHolder}
              </div>
            )}
            {bankName && (
              <div>
                <strong>Bank:</strong> {bankName}
              </div>
            )}
            {accNo && (
              <div>
                <strong>A/C No:</strong> {accNo}
              </div>
            )}
            {(transitNo || instNo) && (
              <div>
                {transitNo && <span><strong>Transit:</strong> {transitNo} </span>}
                {instNo && <span><strong>Inst:</strong> {instNo}</span>}
              </div>
            )}
            {ifsc && (
              <div>
                <strong>IFSC:</strong> {ifsc}
              </div>
            )}
            {upiId && (
              <div>
                <strong>UPI ID:</strong> <Tag color="purple" style={{ fontSize: 10 }}>{upiId}</Tag>
              </div>
            )}
            {interacEmail && (
              <div>
                <strong>Interac:</strong> <Tag color="cyan" style={{ fontSize: 10 }}>{interacEmail}</Tag>
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: 'Amount Requested',
      key: 'amount',
      width: 160,
      render: (_, record) => {
        const amt = record?.amount || record?.requested_amount || 0;
        return (
          <div>
            <div style={{ fontWeight: 700, color: '#059669', fontSize: '16px' }}>
              ₹{parseFloat(amt).toFixed(2)}
            </div>
          </div>
        );
      },
    },
    {
      title: 'Status',
      key: 'status',
      width: 140,
      render: (_, record) => {
        const statusVal = record?.status || record?.withdrawal_status || record?.payout_status;
        const info = getStatusInfo(statusVal);
        return (
          <Tag color={info.color} icon={info.icon} style={{ borderRadius: 12, padding: '3px 10px', fontWeight: 600 }}>
            {info.label}
          </Tag>
        );
      },
    },
    {
      title: 'Txn Ref & Remarks',
      key: 'remarks',
      width: 230,
      render: (_, record) => {
        const txnRef = record.transaction_ref || record.transaction_reference;
        return (
          <div style={{ fontSize: '12px', color: '#475569' }}>
            {txnRef && (
              <div>
                <strong>Txn Ref:</strong> <Tag color="geekblue" style={{ fontSize: 10 }}>{txnRef}</Tag>
              </div>
            )}
            {record.notes && (
              <div style={{ marginTop: 2, color: '#475569' }}>
                <FileTextOutlined style={{ marginRight: 4, color: '#94a3b8' }} />
                <span>Note: {record.notes}</span>
              </div>
            )}
            {record.admin_remarks && (
              <div style={{ marginTop: 2, fontStyle: 'italic', color: '#64748b' }}>
                "Admin: {record.admin_remarks}"
              </div>
            )}
            {!txnRef && !record.notes && !record.admin_remarks && (
              <span style={{ color: '#cbd5e1' }}>-</span>
            )}
          </div>
        );
      },
    },
    {
      title: 'Action',
      key: 'action',
      width: 120,
      fixed: 'right',
      render: (_, record) => (
        <Button
          type="primary"
          icon={<EditOutlined />}
          size="small"
          onClick={() => handleOpenUpdateModal(record)}
        >
          Update
        </Button>
      ),
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

          <Input
            placeholder="Search by Rider Name, Email, Phone, Payout ID, Bank, Acc No..."
            prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
            style={{ width: 360 }}
          />
        </div>

        <Table
          dataSource={filteredData}
          columns={columns}
          rowKey={(record) => record.id || Math.random()}
          loading={loading}
          pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (t) => `Total ${t} requests` }}
          scroll={{ x: 1350 }}
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
                label="Withdrawal Status"
                rules={[{ required: true, message: 'Please select a status' }]}
              >
                <Select
                  options={[
                    { label: 'Completed', value: 'Completed' },
                    { label: 'Approved', value: 'Approved' },
                    { label: 'Pending', value: 'Pending' },
                    { label: 'Failed', value: 'Failed' },
                    { label: 'Rejected', value: 'Rejected' },
                  ]}
                />
              </Form.Item>

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
