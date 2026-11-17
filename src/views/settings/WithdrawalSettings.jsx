import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  InputNumber,
  Input,
  Switch,
  Select,
  Button,
  Table,
  Tag,
  Alert,
  Spin,
  message,
  Tooltip,
  Row,
  Col,
  Modal,
  Radio,
  Statistic,
  Card,
  Space,
  Divider,
  Result
} from 'antd';
import {
  WalletOutlined,
  ShopOutlined,
  CarOutlined,
  SaveOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  InfoCircleOutlined,
  CalendarOutlined,
  DollarOutlined,
  ThunderboltOutlined,
  ClockCircleOutlined,
  RocketOutlined,
  ExperimentOutlined,
  PlayCircleOutlined,
  EyeOutlined,
  ArrowRightOutlined,
  BankOutlined,
  CheckOutlined,
  HistoryOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import {
  getWithdrawalSettings,
  updateWithdrawalSettings,
  getSimulatePayoutsPreview,
  executeSimulatePayouts
} from '../../services/apiService';
import styles from './withdrawalSettings.module.scss';

const { Option } = Select;

const WEEKDAYS = [
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
  { value: 7, label: 'Sunday' }
];

// Helper to compute next upcoming payout date for preview
const calculateNextPayoutDate = (frequency, payoutDay) => {
  const now = new Date();
  const next = new Date(now.getTime());

  if (frequency === 'weekly') {
    const targetJsDay = payoutDay % 7; // 1->1 (Mon), 7->0 (Sun)
    const currentJsDay = now.getDay();
    let daysUntil = (targetJsDay - currentJsDay + 7) % 7;
    if (daysUntil === 0) daysUntil = 7;
    next.setDate(now.getDate() + daysUntil);
  } else {
    const targetDate = Math.min(28, Math.max(1, parseInt(payoutDay, 10) || 1));
    const currentDate = now.getDate();
    if (currentDate < targetDate) {
      next.setDate(targetDate);
    } else {
      next.setMonth(now.getMonth() + 1);
      next.setDate(targetDate);
    }
  }

  return dayjs(next).format('MMM D, YYYY');
};

const WithdrawalSettings = () => {
  // Vendor settings state
  const [vendorConfig, setVendorConfig] = useState({
    auto_withdrawal_enabled: true,
    minimum_amount: 50.0,
    maximum_amount: 5000.0,
    allow_specific_amount: true,
    allow_full_balance: true,
    quick_withdrawal_enabled: true,
    quick_withdrawal_fee_percent: 2.5,
    standard_payout_days: '2-4 business days',
    weekly: {
      id: 1,
      is_enabled: true,
      payout_day: 1,
      updated_at: null
    },
    monthly: {
      id: 2,
      is_enabled: true,
      payout_day: 1,
      updated_at: null
    }
  });

  // Rider settings state
  const [riderConfig, setRiderConfig] = useState({
    auto_withdrawal_enabled: true,
    minimum_amount: 20.0,
    maximum_amount: 5000.0,
    allow_specific_amount: true,
    allow_full_balance: true,
    quick_withdrawal_enabled: true,
    quick_withdrawal_fee_percent: 2.5,
    standard_payout_days: '2-4 business days',
    weekly: {
      id: 3,
      is_enabled: true,
      payout_day: 1,
      updated_at: null
    },
    monthly: {
      id: 4,
      is_enabled: true,
      payout_day: 1,
      updated_at: null
    }
  });

  const [rawRows, setRawRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const navigate = useNavigate();

  // Simulation State
  const [simModalVisible, setSimModalVisible] = useState(false);
  const [simLoading, setSimLoading] = useState(false);
  const [simExecuting, setSimExecuting] = useState(false);
  const [simPreviewData, setSimPreviewData] = useState(null);
  const [simTargetType, setSimTargetType] = useState('all'); // 'all', 'vendor', 'rider'
  const [simPayoutSpeed, setSimPayoutSpeed] = useState('standard'); // 'standard', 'quick'
  const [simMarkCompleted, setSimMarkCompleted] = useState(true);
  const [simExecutionResult, setSimExecutionResult] = useState(null);
  const [selectedSimKeys, setSelectedSimKeys] = useState([]);

  // Fetch settings from API
  const fetchSettings = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await getWithdrawalSettings();
      if (res.success && res.data) {
        const { vendor, rider, raw_rows } = res.data;

        if (vendor) {
          setVendorConfig({
            auto_withdrawal_enabled: Number(vendor.auto_withdrawal_enabled) === 1,
            minimum_amount: parseFloat(vendor.minimum_amount) || 50.0,
            maximum_amount: vendor.maximum_amount !== null && vendor.maximum_amount !== undefined
              ? parseFloat(vendor.maximum_amount)
              : 5000.0,
            allow_specific_amount: Number(vendor.allow_specific_amount) === 1,
            allow_full_balance: Number(vendor.allow_full_balance) === 1,
            quick_withdrawal_enabled: vendor.quick_withdrawal_enabled !== undefined
              ? Number(vendor.quick_withdrawal_enabled) === 1
              : true,
            quick_withdrawal_fee_percent: vendor.quick_withdrawal_fee_percent !== undefined
              ? parseFloat(vendor.quick_withdrawal_fee_percent)
              : 2.5,
            standard_payout_days: vendor.standard_payout_days || '2-4 business days',
            weekly: {
              id: vendor.weekly?.id || 1,
              is_enabled: Number(vendor.weekly?.is_enabled) === 1,
              payout_day: parseInt(vendor.weekly?.payout_day, 10) || 1,
              updated_at: vendor.weekly?.updated_at || null
            },
            monthly: {
              id: vendor.monthly?.id || 2,
              is_enabled: Number(vendor.monthly?.is_enabled) === 1,
              payout_day: parseInt(vendor.monthly?.payout_day, 10) || 1,
              updated_at: vendor.monthly?.updated_at || null
            }
          });
        }

        if (rider) {
          setRiderConfig({
            auto_withdrawal_enabled: Number(rider.auto_withdrawal_enabled) === 1,
            minimum_amount: parseFloat(rider.minimum_amount) || 20.0,
            maximum_amount: rider.maximum_amount !== null && rider.maximum_amount !== undefined
              ? parseFloat(rider.maximum_amount)
              : 5000.0,
            allow_specific_amount: Number(rider.allow_specific_amount) === 1,
            allow_full_balance: Number(rider.allow_full_balance) === 1,
            quick_withdrawal_enabled: rider.quick_withdrawal_enabled !== undefined
              ? Number(rider.quick_withdrawal_enabled) === 1
              : true,
            quick_withdrawal_fee_percent: rider.quick_withdrawal_fee_percent !== undefined
              ? parseFloat(rider.quick_withdrawal_fee_percent)
              : 2.5,
            standard_payout_days: rider.standard_payout_days || '2-4 business days',
            weekly: {
              id: rider.weekly?.id || 3,
              is_enabled: Number(rider.weekly?.is_enabled) === 1,
              payout_day: parseInt(rider.weekly?.payout_day, 10) || 1,
              updated_at: rider.weekly?.updated_at || null
            },
            monthly: {
              id: rider.monthly?.id || 4,
              is_enabled: Number(rider.monthly?.is_enabled) === 1,
              payout_day: parseInt(rider.monthly?.payout_day, 10) || 1,
              updated_at: rider.monthly?.updated_at || null
            }
          });
        }

        if (raw_rows) {
          setRawRows(raw_rows);
        }
      } else {
        message.error(res.error || 'Failed to load withdrawal settings.');
      }
    } catch (err) {
      console.error(err);
      message.error('Error fetching withdrawal settings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
    // Load simulation preview for dashboard stats
    getSimulatePayoutsPreview()
      .then((res) => {
        if (res?.success && res?.data) {
          setSimPreviewData(res.data);
        }
      })
      .catch(() => {});
  }, []);

  // Open simulation modal and fetch fresh preview
  const handleOpenSimulation = async () => {
    setSimModalVisible(true);
    setSimLoading(true);
    setSimExecutionResult(null);
    try {
      const res = await getSimulatePayoutsPreview();
      if (res.success && res.data) {
        setSimPreviewData(res.data);
      } else {
        message.error(res.error || 'Failed to load payout simulation preview');
      }
    } catch (err) {
      console.error(err);
      message.error('Error loading simulation preview');
    } finally {
      setSimLoading(false);
    }
  };

  // Run the simulation cycle
  const handleExecuteSimulation = async () => {
    setSimExecuting(true);
    try {
      const payload = {
        target_type: simTargetType,
        payout_speed: simPayoutSpeed,
        mark_as_completed: simMarkCompleted
      };
      const res = await executeSimulatePayouts(payload);
      if (res.success) {
        message.success(res.message || 'Simulated automated payout distribution executed successfully!');
        setSimExecutionResult(res.data || res);
        // Refresh simulation preview
        const freshPreview = await getSimulatePayoutsPreview();
        if (freshPreview.success) setSimPreviewData(freshPreview.data);
      } else {
        message.error(res.error || 'Simulation execution failed');
      }
    } catch (err) {
      console.error(err);
      message.error('Error executing payout simulation');
    } finally {
      setSimExecuting(false);
    }
  };

  // Save changes handler for both Vendor & Rider
  const handleSaveAll = async () => {
    // Validation: Vendor minimum and maximum amounts
    if (vendorConfig.minimum_amount === null || isNaN(vendorConfig.minimum_amount) || vendorConfig.minimum_amount < 0) {
      const msg = 'Vendor minimum withdrawal amount must be a non-negative number.';
      setErrorMsg(msg);
      message.error(msg);
      return;
    }

    if (vendorConfig.maximum_amount === null || isNaN(vendorConfig.maximum_amount) || vendorConfig.maximum_amount <= 0) {
      const msg = 'Vendor maximum withdrawal amount must be a positive number.';
      setErrorMsg(msg);
      message.error(msg);
      return;
    }

    if (vendorConfig.maximum_amount < vendorConfig.minimum_amount) {
      const msg = 'Vendor maximum withdrawal amount cannot be less than minimum withdrawal amount.';
      setErrorMsg(msg);
      message.error(msg);
      return;
    }

    // Validation: Rider minimum and maximum amounts
    if (riderConfig.minimum_amount === null || isNaN(riderConfig.minimum_amount) || riderConfig.minimum_amount < 0) {
      const msg = 'Rider minimum withdrawal amount must be a non-negative number.';
      setErrorMsg(msg);
      message.error(msg);
      return;
    }

    if (riderConfig.maximum_amount === null || isNaN(riderConfig.maximum_amount) || riderConfig.maximum_amount <= 0) {
      const msg = 'Rider maximum withdrawal amount must be a positive number.';
      setErrorMsg(msg);
      message.error(msg);
      return;
    }

    if (riderConfig.maximum_amount < riderConfig.minimum_amount) {
      const msg = 'Rider maximum withdrawal amount cannot be less than minimum withdrawal amount.';
      setErrorMsg(msg);
      message.error(msg);
      return;
    }

    // Validation: Fee percentages
    if (vendorConfig.quick_withdrawal_fee_percent < 0 || vendorConfig.quick_withdrawal_fee_percent > 100) {
      const msg = 'Vendor quick withdrawal fee must be between 0% and 100%.';
      setErrorMsg(msg);
      message.error(msg);
      return;
    }

    if (riderConfig.quick_withdrawal_fee_percent < 0 || riderConfig.quick_withdrawal_fee_percent > 100) {
      const msg = 'Rider quick withdrawal fee must be between 0% and 100%.';
      setErrorMsg(msg);
      message.error(msg);
      return;
    }

    // Validation: At least one amount option must be enabled if auto withdrawal is enabled
    if (vendorConfig.auto_withdrawal_enabled && !vendorConfig.allow_specific_amount && !vendorConfig.allow_full_balance) {
      const msg = 'Vendor automatic withdrawal requires at least one allowed amount option (Specific Amount or Full Balance).';
      setErrorMsg(msg);
      message.error(msg);
      return;
    }

    if (riderConfig.auto_withdrawal_enabled && !riderConfig.allow_specific_amount && !riderConfig.allow_full_balance) {
      const msg = 'Rider automatic withdrawal requires at least one allowed amount option (Specific Amount or Full Balance).';
      setErrorMsg(msg);
      message.error(msg);
      return;
    }

    setErrorMsg('');
    setSaving(true);

    const payload = {
      vendor: {
        auto_withdrawal_enabled: vendorConfig.auto_withdrawal_enabled ? 1 : 0,
        minimum_amount: parseFloat(Number(vendorConfig.minimum_amount).toFixed(2)),
        maximum_amount: parseFloat(Number(vendorConfig.maximum_amount).toFixed(2)),
        allow_specific_amount: vendorConfig.allow_specific_amount ? 1 : 0,
        allow_full_balance: vendorConfig.allow_full_balance ? 1 : 0,
        quick_withdrawal_enabled: vendorConfig.quick_withdrawal_enabled ? 1 : 0,
        quick_withdrawal_fee_percent: parseFloat(Number(vendorConfig.quick_withdrawal_fee_percent).toFixed(2)),
        standard_payout_days: vendorConfig.standard_payout_days,
        weekly: {
          is_enabled: vendorConfig.weekly.is_enabled ? 1 : 0,
          payout_day: vendorConfig.weekly.payout_day
        },
        monthly: {
          is_enabled: vendorConfig.monthly.is_enabled ? 1 : 0,
          payout_day: vendorConfig.monthly.payout_day
        }
      },
      rider: {
        auto_withdrawal_enabled: riderConfig.auto_withdrawal_enabled ? 1 : 0,
        minimum_amount: parseFloat(Number(riderConfig.minimum_amount).toFixed(2)),
        maximum_amount: parseFloat(Number(riderConfig.maximum_amount).toFixed(2)),
        allow_specific_amount: riderConfig.allow_specific_amount ? 1 : 0,
        allow_full_balance: riderConfig.allow_full_balance ? 1 : 0,
        quick_withdrawal_enabled: riderConfig.quick_withdrawal_enabled ? 1 : 0,
        quick_withdrawal_fee_percent: parseFloat(Number(riderConfig.quick_withdrawal_fee_percent).toFixed(2)),
        standard_payout_days: riderConfig.standard_payout_days,
        weekly: {
          is_enabled: riderConfig.weekly.is_enabled ? 1 : 0,
          payout_day: riderConfig.weekly.payout_day
        },
        monthly: {
          is_enabled: riderConfig.monthly.is_enabled ? 1 : 0,
          payout_day: riderConfig.monthly.payout_day
        }
      }
    };

    try {
      const res = await updateWithdrawalSettings(payload);
      if (res.success && res.data) {
        message.success('Withdrawal settings saved successfully!');
        if (res.data.raw_rows) {
          setRawRows(res.data.raw_rows);
        }
      } else {
        const err = res.error || 'Failed to update withdrawal settings.';
        setErrorMsg(err);
        message.error(err);
      }
    } catch (err) {
      console.error(err);
      message.error('Network error saving withdrawal settings.');
    } finally {
      setSaving(false);
    }
  };

  // Table rows for Section 4: Current Withdrawal Configuration
  const tableData = useMemo(() => {
    return [
      {
        key: 'vendor-weekly',
        user_type: 'Vendor',
        frequency: 'Weekly',
        payout_schedule: `Every ${WEEKDAYS.find((d) => d.value === vendorConfig.weekly.payout_day)?.label || 'Monday'}`,
        next_payout: vendorConfig.weekly.is_enabled
          ? calculateNextPayoutDate('weekly', vendorConfig.weekly.payout_day)
          : '—',
        amount_limits: `$${vendorConfig.minimum_amount.toFixed(2)} - $${vendorConfig.maximum_amount.toFixed(2)} CAD`,
        standard_turnaround: vendorConfig.standard_payout_days || '2-4 business days',
        quick_withdrawal: vendorConfig.quick_withdrawal_enabled
          ? `Enabled (${vendorConfig.quick_withdrawal_fee_percent}% fee)`
          : 'Disabled',
        allowed_options: [
          vendorConfig.allow_specific_amount && 'Specific Amount',
          vendorConfig.allow_full_balance && 'Full Balance'
        ].filter(Boolean),
        status: vendorConfig.auto_withdrawal_enabled && vendorConfig.weekly.is_enabled ? 'Active' : 'Disabled',
        updated_at: vendorConfig.weekly.updated_at
      },
      {
        key: 'vendor-monthly',
        user_type: 'Vendor',
        frequency: 'Monthly',
        payout_schedule: `Day ${vendorConfig.monthly.payout_day} of month`,
        next_payout: vendorConfig.monthly.is_enabled
          ? calculateNextPayoutDate('monthly', vendorConfig.monthly.payout_day)
          : '—',
        amount_limits: `$${vendorConfig.minimum_amount.toFixed(2)} - $${vendorConfig.maximum_amount.toFixed(2)} CAD`,
        standard_turnaround: vendorConfig.standard_payout_days || '2-4 business days',
        quick_withdrawal: vendorConfig.quick_withdrawal_enabled
          ? `Enabled (${vendorConfig.quick_withdrawal_fee_percent}% fee)`
          : 'Disabled',
        allowed_options: [
          vendorConfig.allow_specific_amount && 'Specific Amount',
          vendorConfig.allow_full_balance && 'Full Balance'
        ].filter(Boolean),
        status: vendorConfig.auto_withdrawal_enabled && vendorConfig.monthly.is_enabled ? 'Active' : 'Disabled',
        updated_at: vendorConfig.monthly.updated_at
      },
      {
        key: 'rider-weekly',
        user_type: 'Rider',
        frequency: 'Weekly',
        payout_schedule: `Every ${WEEKDAYS.find((d) => d.value === riderConfig.weekly.payout_day)?.label || 'Monday'}`,
        next_payout: riderConfig.weekly.is_enabled
          ? calculateNextPayoutDate('weekly', riderConfig.weekly.payout_day)
          : '—',
        amount_limits: `$${riderConfig.minimum_amount.toFixed(2)} - $${riderConfig.maximum_amount.toFixed(2)} CAD`,
        standard_turnaround: riderConfig.standard_payout_days || '2-4 business days',
        quick_withdrawal: riderConfig.quick_withdrawal_enabled
          ? `Enabled (${riderConfig.quick_withdrawal_fee_percent}% fee)`
          : 'Disabled',
        allowed_options: [
          riderConfig.allow_specific_amount && 'Specific Amount',
          riderConfig.allow_full_balance && 'Full Balance'
        ].filter(Boolean),
        status: riderConfig.auto_withdrawal_enabled && riderConfig.weekly.is_enabled ? 'Active' : 'Disabled',
        updated_at: riderConfig.weekly.updated_at
      },
      {
        key: 'rider-monthly',
        user_type: 'Rider',
        frequency: 'Monthly',
        payout_schedule: `Day ${riderConfig.monthly.payout_day} of month`,
        next_payout: riderConfig.monthly.is_enabled
          ? calculateNextPayoutDate('monthly', riderConfig.monthly.payout_day)
          : '—',
        amount_limits: `$${riderConfig.minimum_amount.toFixed(2)} - $${riderConfig.maximum_amount.toFixed(2)} CAD`,
        standard_turnaround: riderConfig.standard_payout_days || '2-4 business days',
        quick_withdrawal: riderConfig.quick_withdrawal_enabled
          ? `Enabled (${riderConfig.quick_withdrawal_fee_percent}% fee)`
          : 'Disabled',
        allowed_options: [
          riderConfig.allow_specific_amount && 'Specific Amount',
          riderConfig.allow_full_balance && 'Full Balance'
        ].filter(Boolean),
        status: riderConfig.auto_withdrawal_enabled && riderConfig.monthly.is_enabled ? 'Active' : 'Disabled',
        updated_at: riderConfig.monthly.updated_at
      }
    ];
  }, [vendorConfig, riderConfig]);

  const columns = [
    {
      title: 'User Type',
      dataIndex: 'user_type',
      key: 'user_type',
      width: 100,
      render: (val) => (
        <Tag color={val === 'Vendor' ? 'blue' : 'green'} style={{ fontWeight: 600 }}>
          {val === 'Vendor' ? <ShopOutlined style={{ marginRight: 4 }} /> : <CarOutlined style={{ marginRight: 4 }} />}
          {val}
        </Tag>
      )
    },
    {
      title: 'Frequency',
      dataIndex: 'frequency',
      key: 'frequency',
      width: 95,
      render: (val) => <Tag color={val === 'Weekly' ? 'purple' : 'cyan'}>{val}</Tag>
    },
    {
      title: 'Payout Schedule',
      dataIndex: 'payout_schedule',
      key: 'payout_schedule',
      render: (val) => <strong style={{ color: '#0f172a' }}>{val}</strong>
    },
    {
      title: 'Next Payout Date',
      dataIndex: 'next_payout',
      key: 'next_payout',
      render: (val) => <span style={{ color: '#088b46', fontWeight: 600 }}>{val}</span>
    },
    {
      title: 'Min - Max Limits (CAD)',
      dataIndex: 'amount_limits',
      key: 'amount_limits',
      render: (val) => <strong style={{ color: '#1e293b' }}>{val}</strong>
    },
    {
      title: 'Standard Turnaround',
      dataIndex: 'standard_turnaround',
      key: 'standard_turnaround',
      render: (val) => (
        <span style={{ color: '#0284c7', fontWeight: 600 }}>
          <ClockCircleOutlined style={{ marginRight: 4 }} />
          {val}
        </span>
      )
    },
    {
      title: 'Quick Withdrawal',
      dataIndex: 'quick_withdrawal',
      key: 'quick_withdrawal',
      render: (val) => (
        <Tag color={val.startsWith('Enabled') ? 'gold' : 'default'} style={{ fontWeight: 600 }}>
          <ThunderboltOutlined style={{ marginRight: 4 }} />
          {val}
        </Tag>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 95,
      render: (status) =>
        status === 'Active' ? (
          <Tag color="success" icon={<CheckCircleOutlined />}>Active</Tag>
        ) : (
          <Tag color="default" icon={<CloseCircleOutlined />}>Disabled</Tag>
        )
    }
  ];

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.headerSection}>
        <div className={styles.titleBox}>
          <h2>
            <WalletOutlined style={{ color: '#088b46', marginRight: 8 }} />
            Withdrawal Settings & Payout Policies
          </h2>
          <p>Configure automated payout schedules, min/max withdrawal caps, standard 2-4 day clearance, and 2.5% quick withdrawal fees.</p>
        </div>

        <div className={styles.headerActions}>
          <Button icon={<ReloadOutlined spin={loading} />} onClick={fetchSettings} size="middle">
            Refresh
          </Button>

          <Button
            type="primary"
            icon={<SaveOutlined />}
            loading={saving}
            onClick={handleSaveAll}
            style={{
              backgroundColor: '#088b46',
              borderColor: '#088b46',
              fontWeight: 600,
              minWidth: 150
            }}
          >
            Save All Changes
          </Button>
        </div>
      </div>

      {errorMsg && (
        <Alert
          message={errorMsg}
          type="error"
          showIcon
          closable
          onClose={() => setErrorMsg('')}
          style={{ marginBottom: 16 }}
        />
      )}

      {/* Information Panel */}
      <div className={styles.infoCard}>
        <div className={styles.infoHeader}>
          <InfoCircleOutlined style={{ color: '#088b46' }} />
          <span>Automated Payout Rules, Clearance Timeline & Quick Withdrawals</span>
        </div>
        <div className={styles.infoBody}>
          <div className={styles.infoCol}>
            <strong>🗓️ Standard Automatic Payouts (Within 2 to 4 Days):</strong> When riders or vendors use automatic scheduled withdrawals, payouts are transferred with 0% processing fee and clear within 2 to 4 business days.
          </div>
          <div className={styles.infoCol}>
            <strong>⚡ Express / Quick Withdrawal (2.5% Fee):</strong> If a rider or vendor requests an instant payout instead of waiting 2-4 days, an express fee (e.g. 2.5%) is deducted and funds are disbursed immediately.
          </div>
          <div className={styles.infoCol}>
            <strong>🛡️ Min & Max Amount Guardrails:</strong> Users can enter a custom specific amount or request full balance, strictly bound between the minimum and maximum withdrawal thresholds defined below.
          </div>
        </div>
      </div>

      <Spin spinning={loading}>
        {/* Two Responsive Cards Side by Side */}
        <div className={styles.cardsGrid}>
          {/* CARD 1: VENDOR WITHDRAWAL SETTINGS */}
          <div className={styles.settingCard}>
            <div className={styles.cardHeader}>
              <div className={styles.cardTitle}>
                <ShopOutlined style={{ color: '#1677ff', fontSize: 18 }} />
                <span>1. Vendor Withdrawal Settings</span>
              </div>
              <Tag color={vendorConfig.auto_withdrawal_enabled ? 'success' : 'default'}>
                {vendorConfig.auto_withdrawal_enabled ? 'Auto-Payout Active' : 'Disabled'}
              </Tag>
            </div>

            {/* Master Toggle */}
            <div className={styles.switchRow}>
              <div className={styles.switchLabel}>
                <span>Automatic Withdrawals</span>
                <small>Enable or disable automatic scheduled payouts for all vendors</small>
              </div>
              <Switch
                checked={vendorConfig.auto_withdrawal_enabled}
                onChange={(checked) => setVendorConfig({ ...vendorConfig, auto_withdrawal_enabled: checked })}
                style={{ backgroundColor: vendorConfig.auto_withdrawal_enabled ? '#088b46' : undefined }}
              />
            </div>

            {/* Amount Guardrails: Min and Max Amount Inputs */}
            <div className={styles.sectionBlock} style={{ marginTop: 14 }}>
              <div className={styles.sectionTitle}>Withdrawal Amount Limits (CAD)</div>
              <Row gutter={12}>
                <Col xs={24} sm={12}>
                  <div className={styles.inputGroup}>
                    <label>Minimum Amount (CAD)</label>
                    <InputNumber
                      value={vendorConfig.minimum_amount}
                      onChange={(val) => setVendorConfig({ ...vendorConfig, minimum_amount: val !== null ? val : 0 })}
                      min={0}
                      step={5}
                      precision={2}
                      prefix="$"
                      addonAfter="CAD"
                      style={{ width: '100%' }}
                    />
                    <span className={styles.hint}>
                      Vendors cannot withdraw below this minimum.
                    </span>
                  </div>
                </Col>

                <Col xs={24} sm={12}>
                  <div className={styles.inputGroup}>
                    <label>Maximum Amount (CAD)</label>
                    <InputNumber
                      value={vendorConfig.maximum_amount}
                      onChange={(val) => setVendorConfig({ ...vendorConfig, maximum_amount: val !== null ? val : 5000 })}
                      min={vendorConfig.minimum_amount || 0}
                      step={100}
                      precision={2}
                      prefix="$"
                      addonAfter="CAD"
                      style={{ width: '100%' }}
                    />
                    <span className={styles.hint}>
                      Capped limit per withdrawal request.
                    </span>
                  </div>
                </Col>
              </Row>
            </div>

            {/* Standard Automatic Withdrawal Timeline (2 to 4 Days) */}
            <div
              style={{
                background: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: 8,
                padding: '12px 14px',
                marginBottom: 16,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <ClockCircleOutlined style={{ color: '#16a34a', fontSize: 16 }} />
                <strong style={{ color: '#15803d', fontSize: '13px' }}>
                  Standard Automatic Turnaround: 2 to 4 Business Days
                </strong>
              </div>
              <p style={{ margin: 0, fontSize: '12px', color: '#166534', lineHeight: 1.4 }}>
                Vendors with automatic withdrawal enabled receive their scheduled payouts directly in their bank account within 2 to 4 business days at <strong>0% fee</strong>.
              </p>
            </div>

            {/* Quick / Instant Withdrawal Settings (2.5% Fee) */}
            <div
              style={{
                background: '#fffbeb',
                border: '1px solid #fde68a',
                borderRadius: 8,
                padding: '14px 16px',
                marginBottom: 18,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <ThunderboltOutlined style={{ color: '#d97706', fontSize: 17 }} />
                  <span style={{ fontWeight: 700, color: '#92400e', fontSize: '13.5px' }}>
                    Quick / Instant Withdrawal (Express Fee)
                  </span>
                </div>
                <Switch
                  checked={vendorConfig.quick_withdrawal_enabled}
                  onChange={(checked) => setVendorConfig({ ...vendorConfig, quick_withdrawal_enabled: checked })}
                  style={{ backgroundColor: vendorConfig.quick_withdrawal_enabled ? '#d97706' : undefined }}
                />
              </div>

              {vendorConfig.quick_withdrawal_enabled && (
                <div>
                  <div className={styles.inputGroup} style={{ marginBottom: 8 }}>
                    <label style={{ color: '#78350f', fontSize: '12.5px' }}>
                      Quick Withdrawal Processing Fee (%)
                    </label>
                    <InputNumber
                      value={vendorConfig.quick_withdrawal_fee_percent}
                      onChange={(val) =>
                        setVendorConfig({
                          ...vendorConfig,
                          quick_withdrawal_fee_percent: val !== null ? val : 2.5
                        })
                      }
                      min={0}
                      max={100}
                      step={0.1}
                      precision={2}
                      addonAfter="%"
                      style={{ width: '100%' }}
                    />
                  </div>
                  <div
                    style={{
                      fontSize: '11.5px',
                      color: '#92400e',
                      background: '#ffffff',
                      border: '1px dashed #fcd34d',
                      borderRadius: 6,
                      padding: '6px 10px',
                    }}
                  >
                    💡 <strong>Fee Example:</strong> On a $100.00 quick withdrawal, a {vendorConfig.quick_withdrawal_fee_percent}% (${(100 * (vendorConfig.quick_withdrawal_fee_percent / 100)).toFixed(2)}) fee is charged. Vendor receives <strong>${(100 - 100 * (vendorConfig.quick_withdrawal_fee_percent / 100)).toFixed(2)} CAD</strong> immediately.
                  </div>
                </div>
              )}
            </div>

            {/* Allowed Amount Options */}
            <div className={styles.sectionBlock}>
              <div className={styles.sectionTitle}>Allowed Withdrawal Amount Options</div>

              <div className={styles.switchRow}>
                <div className={styles.switchLabel}>
                  <span>Specific Amount Option</span>
                  <small>Vendors can enter a custom fixed withdrawal amount</small>
                </div>
                <Switch
                  checked={vendorConfig.allow_specific_amount}
                  onChange={(checked) => setVendorConfig({ ...vendorConfig, allow_specific_amount: checked })}
                  style={{ backgroundColor: vendorConfig.allow_specific_amount ? '#088b46' : undefined }}
                />
              </div>

              <div className={styles.switchRow}>
                <div className={styles.switchLabel}>
                  <span>All Available Balance Option</span>
                  <small>Vendors can withdraw 100% of their cleared balance</small>
                </div>
                <Switch
                  checked={vendorConfig.allow_full_balance}
                  onChange={(checked) => setVendorConfig({ ...vendorConfig, allow_full_balance: checked })}
                  style={{ backgroundColor: vendorConfig.allow_full_balance ? '#088b46' : undefined }}
                />
              </div>
            </div>

            {/* Schedules */}
            <div className={styles.sectionBlock}>
              <div className={styles.sectionTitle}>Payout Schedules</div>

              {/* Weekly */}
              <div className={styles.scheduleBox}>
                <div className={styles.scheduleHeader}>
                  <span className={styles.scheduleTitle}>Weekly Payout Schedule</span>
                  <Switch
                    checked={vendorConfig.weekly.is_enabled}
                    onChange={(checked) =>
                      setVendorConfig({
                        ...vendorConfig,
                        weekly: { ...vendorConfig.weekly, is_enabled: checked }
                      })
                    }
                    size="small"
                    style={{ backgroundColor: vendorConfig.weekly.is_enabled ? '#088b46' : undefined }}
                  />
                </div>

                {vendorConfig.weekly.is_enabled && (
                  <div className={styles.scheduleControl}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>
                      Weekly Payout Day:
                    </label>
                    <Select
                      value={vendorConfig.weekly.payout_day}
                      onChange={(val) =>
                        setVendorConfig({
                          ...vendorConfig,
                          weekly: { ...vendorConfig.weekly, payout_day: val }
                        })
                      }
                      style={{ width: '100%' }}
                    >
                      {WEEKDAYS.map((day) => (
                        <Option key={day.value} value={day.value}>
                          {day.label} (Every week)
                        </Option>
                      ))}
                    </Select>
                    <div className={styles.scheduleHint}>
                      Next Vendor Weekly Payout: {calculateNextPayoutDate('weekly', vendorConfig.weekly.payout_day)}
                    </div>
                  </div>
                )}
              </div>

              {/* Monthly */}
              <div className={styles.scheduleBox}>
                <div className={styles.scheduleHeader}>
                  <span className={styles.scheduleTitle}>Monthly Payout Schedule</span>
                  <Switch
                    checked={vendorConfig.monthly.is_enabled}
                    onChange={(checked) =>
                      setVendorConfig({
                        ...vendorConfig,
                        monthly: { ...vendorConfig.monthly, is_enabled: checked }
                      })
                    }
                    size="small"
                    style={{ backgroundColor: vendorConfig.monthly.is_enabled ? '#088b46' : undefined }}
                  />
                </div>

                {vendorConfig.monthly.is_enabled && (
                  <div className={styles.scheduleControl}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>
                      Monthly Payout Date:
                    </label>
                    <InputNumber
                      value={vendorConfig.monthly.payout_day}
                      onChange={(val) =>
                        setVendorConfig({
                          ...vendorConfig,
                          monthly: { ...vendorConfig.monthly, payout_day: Math.min(28, Math.max(1, val || 1)) }
                        })
                      }
                      min={1}
                      max={28}
                      addonAfter="of month"
                      style={{ width: '100%' }}
                    />
                    <div className={styles.scheduleHint}>
                      Next Vendor Monthly Payout: {calculateNextPayoutDate('monthly', vendorConfig.monthly.payout_day)}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* CARD 2: RIDER WITHDRAWAL SETTINGS */}
          <div className={styles.settingCard}>
            <div className={styles.cardHeader}>
              <div className={styles.cardTitle}>
                <CarOutlined style={{ color: '#088b46', fontSize: 18 }} />
                <span>2. Rider Withdrawal Settings</span>
              </div>
              <Tag color={riderConfig.auto_withdrawal_enabled ? 'success' : 'default'}>
                {riderConfig.auto_withdrawal_enabled ? 'Auto-Payout Active' : 'Disabled'}
              </Tag>
            </div>

            {/* Master Toggle */}
            <div className={styles.switchRow}>
              <div className={styles.switchLabel}>
                <span>Automatic Withdrawals</span>
                <small>Enable or disable automatic scheduled payouts for all riders</small>
              </div>
              <Switch
                checked={riderConfig.auto_withdrawal_enabled}
                onChange={(checked) => setRiderConfig({ ...riderConfig, auto_withdrawal_enabled: checked })}
                style={{ backgroundColor: riderConfig.auto_withdrawal_enabled ? '#088b46' : undefined }}
              />
            </div>

            {/* Amount Guardrails: Min and Max Amount Inputs */}
            <div className={styles.sectionBlock} style={{ marginTop: 14 }}>
              <div className={styles.sectionTitle}>Withdrawal Amount Limits (CAD)</div>
              <Row gutter={12}>
                <Col xs={24} sm={12}>
                  <div className={styles.inputGroup}>
                    <label>Minimum Amount (CAD)</label>
                    <InputNumber
                      value={riderConfig.minimum_amount}
                      onChange={(val) => setRiderConfig({ ...riderConfig, minimum_amount: val !== null ? val : 0 })}
                      min={0}
                      step={5}
                      precision={2}
                      prefix="$"
                      addonAfter="CAD"
                      style={{ width: '100%' }}
                    />
                    <span className={styles.hint}>
                      Riders cannot withdraw below this minimum.
                    </span>
                  </div>
                </Col>

                <Col xs={24} sm={12}>
                  <div className={styles.inputGroup}>
                    <label>Maximum Amount (CAD)</label>
                    <InputNumber
                      value={riderConfig.maximum_amount}
                      onChange={(val) => setRiderConfig({ ...riderConfig, maximum_amount: val !== null ? val : 5000 })}
                      min={riderConfig.minimum_amount || 0}
                      step={100}
                      precision={2}
                      prefix="$"
                      addonAfter="CAD"
                      style={{ width: '100%' }}
                    />
                    <span className={styles.hint}>
                      Capped limit per withdrawal request.
                    </span>
                  </div>
                </Col>
              </Row>
            </div>

            {/* Standard Automatic Withdrawal Timeline (2 to 4 Days) */}
            <div
              style={{
                background: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: 8,
                padding: '12px 14px',
                marginBottom: 16,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <ClockCircleOutlined style={{ color: '#16a34a', fontSize: 16 }} />
                <strong style={{ color: '#15803d', fontSize: '13px' }}>
                  Standard Automatic Turnaround: 2 to 4 Business Days
                </strong>
              </div>
              <p style={{ margin: 0, fontSize: '12px', color: '#166534', lineHeight: 1.4 }}>
                Riders with automatic withdrawal enabled receive their scheduled payouts directly in their bank account within 2 to 4 business days at <strong>0% fee</strong>.
              </p>
            </div>

            {/* Quick / Instant Withdrawal Settings (2.5% Fee) */}
            <div
              style={{
                background: '#fffbeb',
                border: '1px solid #fde68a',
                borderRadius: 8,
                padding: '14px 16px',
                marginBottom: 18,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <ThunderboltOutlined style={{ color: '#d97706', fontSize: 17 }} />
                  <span style={{ fontWeight: 700, color: '#92400e', fontSize: '13.5px' }}>
                    Quick / Instant Withdrawal (Express Fee)
                  </span>
                </div>
                <Switch
                  checked={riderConfig.quick_withdrawal_enabled}
                  onChange={(checked) => setRiderConfig({ ...riderConfig, quick_withdrawal_enabled: checked })}
                  style={{ backgroundColor: riderConfig.quick_withdrawal_enabled ? '#d97706' : undefined }}
                />
              </div>

              {riderConfig.quick_withdrawal_enabled && (
                <div>
                  <div className={styles.inputGroup} style={{ marginBottom: 8 }}>
                    <label style={{ color: '#78350f', fontSize: '12.5px' }}>
                      Quick Withdrawal Processing Fee (%)
                    </label>
                    <InputNumber
                      value={riderConfig.quick_withdrawal_fee_percent}
                      onChange={(val) =>
                        setRiderConfig({
                          ...riderConfig,
                          quick_withdrawal_fee_percent: val !== null ? val : 2.5
                        })
                      }
                      min={0}
                      max={100}
                      step={0.1}
                      precision={2}
                      addonAfter="%"
                      style={{ width: '100%' }}
                    />
                  </div>
                  <div
                    style={{
                      fontSize: '11.5px',
                      color: '#92400e',
                      background: '#ffffff',
                      border: '1px dashed #fcd34d',
                      borderRadius: 6,
                      padding: '6px 10px',
                    }}
                  >
                    💡 <strong>Fee Example:</strong> On a $100.00 quick withdrawal, a {riderConfig.quick_withdrawal_fee_percent}% (${(100 * (riderConfig.quick_withdrawal_fee_percent / 100)).toFixed(2)}) fee is charged. Rider receives <strong>${(100 - 100 * (riderConfig.quick_withdrawal_fee_percent / 100)).toFixed(2)} CAD</strong> immediately.
                  </div>
                </div>
              )}
            </div>

            {/* Allowed Amount Options */}
            <div className={styles.sectionBlock}>
              <div className={styles.sectionTitle}>Allowed Withdrawal Amount Options</div>

              <div className={styles.switchRow}>
                <div className={styles.switchLabel}>
                  <span>Specific Amount Option</span>
                  <small>Riders can enter a custom fixed withdrawal amount</small>
                </div>
                <Switch
                  checked={riderConfig.allow_specific_amount}
                  onChange={(checked) => setRiderConfig({ ...riderConfig, allow_specific_amount: checked })}
                  style={{ backgroundColor: riderConfig.allow_specific_amount ? '#088b46' : undefined }}
                />
              </div>

              <div className={styles.switchRow}>
                <div className={styles.switchLabel}>
                  <span>All Available Balance Option</span>
                  <small>Riders can withdraw 100% of their cleared balance</small>
                </div>
                <Switch
                  checked={riderConfig.allow_full_balance}
                  onChange={(checked) => setRiderConfig({ ...riderConfig, allow_full_balance: checked })}
                  style={{ backgroundColor: riderConfig.allow_full_balance ? '#088b46' : undefined }}
                />
              </div>
            </div>

            {/* Schedules */}
            <div className={styles.sectionBlock}>
              <div className={styles.sectionTitle}>Payout Schedules</div>

              {/* Weekly */}
              <div className={styles.scheduleBox}>
                <div className={styles.scheduleHeader}>
                  <span className={styles.scheduleTitle}>Weekly Payout Schedule</span>
                  <Switch
                    checked={riderConfig.weekly.is_enabled}
                    onChange={(checked) =>
                      setRiderConfig({
                        ...riderConfig,
                        weekly: { ...riderConfig.weekly, is_enabled: checked }
                      })
                    }
                    size="small"
                    style={{ backgroundColor: riderConfig.weekly.is_enabled ? '#088b46' : undefined }}
                  />
                </div>

                {riderConfig.weekly.is_enabled && (
                  <div className={styles.scheduleControl}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>
                      Weekly Payout Day:
                    </label>
                    <Select
                      value={riderConfig.weekly.payout_day}
                      onChange={(val) =>
                        setRiderConfig({
                          ...riderConfig,
                          weekly: { ...riderConfig.weekly, payout_day: val }
                        })
                      }
                      style={{ width: '100%' }}
                    >
                      {WEEKDAYS.map((day) => (
                        <Option key={day.value} value={day.value}>
                          {day.label} (Every week)
                        </Option>
                      ))}
                    </Select>
                    <div className={styles.scheduleHint}>
                      Next Rider Weekly Payout: {calculateNextPayoutDate('weekly', riderConfig.weekly.payout_day)}
                    </div>
                  </div>
                )}
              </div>

              {/* Monthly */}
              <div className={styles.scheduleBox}>
                <div className={styles.scheduleHeader}>
                  <span className={styles.scheduleTitle}>Monthly Payout Schedule</span>
                  <Switch
                    checked={riderConfig.monthly.is_enabled}
                    onChange={(checked) =>
                      setRiderConfig({
                        ...riderConfig,
                        monthly: { ...riderConfig.monthly, is_enabled: checked }
                      })
                    }
                    size="small"
                    style={{ backgroundColor: riderConfig.monthly.is_enabled ? '#088b46' : undefined }}
                  />
                </div>

                {riderConfig.monthly.is_enabled && (
                  <div className={styles.scheduleControl}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>
                      Monthly Payout Date:
                    </label>
                    <InputNumber
                      value={riderConfig.monthly.payout_day}
                      onChange={(val) =>
                        setRiderConfig({
                          ...riderConfig,
                          monthly: { ...riderConfig.monthly, payout_day: Math.min(28, Math.max(1, val || 1)) }
                        })
                      }
                      min={1}
                      max={28}
                      addonAfter="of month"
                      style={{ width: '100%' }}
                    />
                    <div className={styles.scheduleHint}>
                      Next Rider Monthly Payout: {calculateNextPayoutDate('monthly', riderConfig.monthly.payout_day)}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Automated Payment Distribution Simulator (Live Demonstration Mode) */}
        <div
          style={{
            background: 'linear-gradient(135deg, #f0fdf4 0%, #ffffff 50%, #eff6ff 100%)',
            border: '1px solid #bbf7d0',
            borderRadius: 12,
            padding: '24px 28px',
            marginBottom: 24,
            boxShadow: '0 4px 12px rgba(8, 139, 70, 0.05)',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              flexWrap: 'wrap',
              gap: 16,
              marginBottom: 18,
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 8,
                    background: '#088b46',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontSize: 18,
                  }}
                >
                  <RocketOutlined />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: '#0f172a' }}>
                    Automated Payment Distribution Simulator
                  </h3>
                  <div style={{ fontSize: 12.5, color: '#64748b', marginTop: 2 }}>
                    Demonstrate how the system automatically calculates wallet earnings, enforces minimum/maximum limits, applies standard (2-4 days) or quick (2.5% fee) rules, and logs mock bank deposits without a payment gateway.
                  </div>
                </div>
              </div>
            </div>

            <Space wrap>
              <Button
                icon={<EyeOutlined />}
                onClick={() => navigate('/vendor-withdrawals')}
                style={{ borderRadius: 6, fontWeight: 600 }}
              >
                Vendor Payouts Table
              </Button>
              <Button
                type="primary"
                icon={<PlayCircleOutlined />}
                onClick={handleOpenSimulation}
                style={{
                  backgroundColor: '#088b46',
                  borderColor: '#088b46',
                  borderRadius: 6,
                  fontWeight: 700,
                  boxShadow: '0 2px 6px rgba(8, 139, 70, 0.25)',
                }}
              >
                Launch Payout Simulator
              </Button>
            </Space>
          </div>

          {/* Quick Metrics Bar */}
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={6}>
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 8, padding: '14px 16px' }}>
                <div style={{ fontSize: 11.5, color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
                  Eligible Vendors
                </div>
                <div style={{ fontSize: 20, fontWeight: 700, color: '#088b46', marginTop: 4 }}>
                  {simPreviewData?.summary?.eligible_vendors_count ?? 2} Vendors
                </div>
                <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>
                  Pool: ₹{(simPreviewData?.summary?.total_vendor_payout ?? 6751.35).toLocaleString()} (Min ₹{vendorConfig.minimum_amount})
                </div>
              </div>
            </Col>

            <Col xs={24} sm={12} md={6}>
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 8, padding: '14px 16px' }}>
                <div style={{ fontSize: 11.5, color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
                  Eligible Riders
                </div>
                <div style={{ fontSize: 20, fontWeight: 700, color: '#0284c7', marginTop: 4 }}>
                  {simPreviewData?.summary?.eligible_riders_count ?? 2} Riders
                </div>
                <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>
                  Pool: ₹{(simPreviewData?.summary?.total_rider_payout ?? 5072.2).toLocaleString()} (Min ₹{riderConfig.minimum_amount})
                </div>
              </div>
            </Col>

            <Col xs={24} sm={12} md={6}>
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 8, padding: '14px 16px' }}>
                <div style={{ fontSize: 11.5, color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
                  Total Distribution Pool
                </div>
                <div style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', marginTop: 4 }}>
                  ₹{(simPreviewData?.summary?.total_distribution_amount ?? 11823.55).toLocaleString()}
                </div>
                <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>
                  Capped up to ₹{vendorConfig.maximum_amount.toLocaleString()} / beneficiary
                </div>
              </div>
            </Col>

            <Col xs={24} sm={12} md={6}>
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 8, padding: '14px 16px' }}>
                <div style={{ fontSize: 11.5, color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
                  Demonstration Mode
                </div>
                <div style={{ marginTop: 6 }}>
                  <Tag color="success" style={{ fontWeight: 700, padding: '2px 8px', fontSize: 11.5 }}>
                    ✓ Ready to Simulate
                  </Tag>
                </div>
                <div style={{ fontSize: 11.5, color: '#64748b', marginTop: 4 }}>
                  Generates mock UTR & updates ledger
                </div>
              </div>
            </Col>
          </Row>
        </div>

        {/* Section 5: Current Withdrawal Configuration Table */}
        <div className={styles.tableCard}>
          <div className={styles.tableTitle}>
            Current Withdrawal Configuration Overview
          </div>

          <Table
            dataSource={tableData}
            columns={columns}
            pagination={false}
            size="middle"
            bordered
          />
        </div>

        {/* Bottom Save Action */}
        <div className={styles.bottomActionRow}>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            loading={saving}
            onClick={handleSaveAll}
            style={{
              backgroundColor: '#088b46',
              borderColor: '#088b46',
              fontWeight: 600,
              minWidth: 160,
              height: 40,
              fontSize: 14
            }}
          >
            Save All Changes
          </Button>
        </div>

        {/* Modal: Automated Payout Distribution Simulator */}
        <Modal
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 16, fontWeight: 700, color: '#0f172a' }}>
              <RocketOutlined style={{ color: '#088b46', fontSize: 18 }} />
              Automated Payout Distribution Simulator
              <Tag color="cyan" style={{ marginLeft: 6, fontWeight: 600 }}>Demo Mode</Tag>
            </div>
          }
          open={simModalVisible}
          onCancel={() => setSimModalVisible(false)}
          width={920}
          footer={null}
          destroyOnClose
        >
          {simLoading ? (
            <div style={{ textAlign: 'center', padding: '50px 0' }}>
              <Spin size="large" tip="Calculating live beneficiary balances and payout rules..." />
            </div>
          ) : simExecutionResult ? (
            /* Results Screen */
            <div>
              <Alert
                type="success"
                showIcon
                message={
                  <span style={{ fontWeight: 700, fontSize: 14.5 }}>
                    Automated Payout Distribution Executed Successfully!
                  </span>
                }
                description={
                  <div style={{ fontSize: 12.5, marginTop: 4 }}>
                    {simExecutionResult.message || `Processed ${simExecutionResult.summary?.total_processed} beneficiaries.`}
                    {' '}Available wallet balances have been deducted and records logged to the payout ledger.
                  </div>
                }
                style={{ borderRadius: 8, marginBottom: 20 }}
              />

              {/* Result Summary Metrics */}
              <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
                <Col xs={12} sm={6}>
                  <Card size="small" style={{ borderRadius: 8, background: '#f8fafc', textAlign: 'center' }}>
                    <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Beneficiaries</div>
                    <div style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', marginTop: 4 }}>
                      {simExecutionResult.summary?.total_processed || 0}
                    </div>
                    <div style={{ fontSize: 11, color: '#64748b' }}>
                      {simExecutionResult.summary?.vendors_count || 0} Vendors • {simExecutionResult.summary?.riders_count || 0} Riders
                    </div>
                  </Card>
                </Col>

                <Col xs={12} sm={6}>
                  <Card size="small" style={{ borderRadius: 8, background: '#f8fafc', textAlign: 'center' }}>
                    <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Gross Distributed</div>
                    <div style={{ fontSize: 20, fontWeight: 700, color: '#2563eb', marginTop: 4 }}>
                      ₹{(simExecutionResult.summary?.total_gross || 0).toLocaleString()}
                    </div>
                    <div style={{ fontSize: 11, color: '#64748b' }}>Capped at maximum</div>
                  </Card>
                </Col>

                <Col xs={12} sm={6}>
                  <Card size="small" style={{ borderRadius: 8, background: '#f8fafc', textAlign: 'center' }}>
                    <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Fee Deducted</div>
                    <div style={{ fontSize: 20, fontWeight: 700, color: '#d97706', marginTop: 4 }}>
                      ₹{(simExecutionResult.summary?.total_fee || 0).toLocaleString()}
                    </div>
                    <div style={{ fontSize: 11, color: '#64748b' }}>
                      {simExecutionResult.summary?.payout_speed === 'quick' ? '2.5% Quick Fee' : '0% Standard Fee'}
                    </div>
                  </Card>
                </Col>

                <Col xs={12} sm={6}>
                  <Card size="small" style={{ borderRadius: 8, background: '#f0fdf4', border: '1px solid #bbf7d0', textAlign: 'center' }}>
                    <div style={{ fontSize: 11, color: '#166534', fontWeight: 600, textTransform: 'uppercase' }}>Net Deposited</div>
                    <div style={{ fontSize: 20, fontWeight: 700, color: '#16a34a', marginTop: 4 }}>
                      ₹{(simExecutionResult.summary?.total_net || 0).toLocaleString()}
                    </div>
                    <div style={{ fontSize: 11, color: '#166534' }}>Transferred to bank</div>
                  </Card>
                </Col>
              </Row>

              {/* Processed Transactions Table */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>
                  Generated Transaction Ledger (Simulated Bank Records)
                </div>
                <Table
                  dataSource={simExecutionResult.processed_records || []}
                  rowKey="uid"
                  pagination={{ pageSize: 5 }}
                  size="small"
                  bordered
                  columns={[
                    {
                      title: 'Payout UID',
                      dataIndex: 'uid',
                      key: 'uid',
                      width: 130,
                      render: (uid, record) => (
                        <div>
                          <strong style={{ color: '#0f172a' }}>{uid}</strong>
                          <div>
                            <Tag color={record.type === 'vendor' ? 'purple' : 'cyan'} style={{ fontSize: 10, marginTop: 2 }}>
                              {record.type === 'vendor' ? 'Vendor' : 'Rider'}
                            </Tag>
                          </div>
                        </div>
                      )
                    },
                    {
                      title: 'Beneficiary',
                      key: 'name',
                      render: (_, record) => (
                        <div>
                          <div style={{ fontWeight: 600, color: '#0f172a' }}>{record.name}</div>
                          {record.store_name && (
                            <div style={{ fontSize: 11.5, color: '#64748b' }}>Store: {record.store_name}</div>
                          )}
                          <div style={{ fontSize: 11, color: '#94a3b8' }}>
                            {record.bank_name} ({record.account_masked})
                          </div>
                        </div>
                      )
                    },
                    {
                      title: 'Gross Payout',
                      dataIndex: 'gross_amount',
                      key: 'gross',
                      align: 'right',
                      width: 110,
                      render: (val) => <span style={{ fontWeight: 600 }}>₹{parseFloat(val).toFixed(2)}</span>
                    },
                    {
                      title: 'Fee Deducted',
                      dataIndex: 'fee_amount',
                      key: 'fee',
                      align: 'right',
                      width: 110,
                      render: (val, record) => (
                        <span style={{ color: Number(val) > 0 ? '#d97706' : '#64748b', fontWeight: 600 }}>
                          ₹{parseFloat(val).toFixed(2)} ({record.fee_percent}%)
                        </span>
                      )
                    },
                    {
                      title: 'Net Deposited',
                      dataIndex: 'net_amount',
                      key: 'net',
                      align: 'right',
                      width: 120,
                      render: (val) => (
                        <span style={{ color: '#16a34a', fontWeight: 700, fontSize: 13.5 }}>
                          ₹{parseFloat(val).toFixed(2)}
                        </span>
                      )
                    },
                    {
                      title: 'Mock Bank Ref / UTR',
                      dataIndex: 'transaction_reference',
                      key: 'txn_ref',
                      width: 180,
                      render: (ref) => (
                        <Tag color="geekblue" style={{ fontFamily: 'monospace', fontWeight: 600, fontSize: 11 }}>
                          {ref}
                        </Tag>
                      )
                    }
                  ]}
                />
              </div>

              {/* Modal Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: 14 }}>
                <Button
                  onClick={() => setSimExecutionResult(null)}
                  icon={<HistoryOutlined />}
                  style={{ borderRadius: 6 }}
                >
                  Configure & Run Another
                </Button>
                <Space>
                  <Button
                    icon={<EyeOutlined />}
                    onClick={() => {
                      setSimModalVisible(false);
                      navigate('/vendor-withdrawals');
                    }}
                    style={{ borderRadius: 6 }}
                  >
                    View in Vendor Withdrawals
                  </Button>
                  <Button
                    type="primary"
                    onClick={() => setSimModalVisible(false)}
                    style={{ backgroundColor: '#088b46', borderColor: '#088b46', borderRadius: 6, fontWeight: 600 }}
                  >
                    Done
                  </Button>
                </Space>
              </div>
            </div>
          ) : (
            /* Configuration & Preview Screen */
            <div>
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: '16px 18px', marginBottom: 20 }}>
                <Row gutter={[16, 16]}>
                  {/* Option 1: Beneficiary Target */}
                  <Col xs={24} md={12}>
                    <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 6 }}>
                      Target Beneficiaries:
                    </label>
                    <Radio.Group
                      value={simTargetType}
                      onChange={(e) => setSimTargetType(e.target.value)}
                      buttonStyle="solid"
                      style={{ width: '100%', display: 'flex' }}
                    >
                      <Radio.Button value="all" style={{ flex: 1, textAlign: 'center' }}>All (Vendors & Riders)</Radio.Button>
                      <Radio.Button value="vendor" style={{ flex: 1, textAlign: 'center' }}>Vendors Only</Radio.Button>
                      <Radio.Button value="rider" style={{ flex: 1, textAlign: 'center' }}>Riders Only</Radio.Button>
                    </Radio.Group>
                  </Col>

                  {/* Option 2: Payout Speed */}
                  <Col xs={24} md={12}>
                    <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 6 }}>
                      Turnaround Policy to Demonstrate:
                    </label>
                    <Radio.Group
                      value={simPayoutSpeed}
                      onChange={(e) => setSimPayoutSpeed(e.target.value)}
                      buttonStyle="solid"
                      style={{ width: '100%', display: 'flex' }}
                    >
                      <Radio.Button value="standard" style={{ flex: 1, textAlign: 'center' }}>
                        Standard (0% Fee • 2-4 Days)
                      </Radio.Button>
                      <Radio.Button value="quick" style={{ flex: 1, textAlign: 'center' }}>
                        Quick (2.5% Fee • Instant)
                      </Radio.Button>
                    </Radio.Group>
                  </Col>
                </Row>

                <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px dashed #cbd5e1', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Switch
                      checked={simMarkCompleted}
                      onChange={setSimMarkCompleted}
                      size="small"
                      style={{ backgroundColor: simMarkCompleted ? '#088b46' : undefined }}
                    />
                    <span style={{ fontSize: 12, color: '#475569', fontWeight: 600 }}>
                      Mark as 'Completed' immediately with mock bank UTR reference
                    </span>
                  </div>
                  <Tag color={simPayoutSpeed === 'quick' ? 'orange' : 'green'} style={{ fontWeight: 600, margin: 0 }}>
                    {simPayoutSpeed === 'quick' ? '⚡ 2.5% Priority Fee Deducted' : '⏳ Standard 2-4 Days Settlement'}
                  </Tag>
                </div>
              </div>

              {/* Eligible Beneficiaries Preview Table */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>
                    Eligible Beneficiaries ({
                      (simTargetType === 'rider' ? 0 : (simPreviewData?.vendors || []).filter(v => v.is_eligible).length) +
                      (simTargetType === 'vendor' ? 0 : (simPreviewData?.riders || []).filter(r => r.is_eligible).length)
                    } Ready for Payout)
                  </div>
                  <div style={{ fontSize: 11.5, color: '#64748b' }}>
                    Criteria: Balance &ge; Min amount (Capped at ₹{vendorConfig.maximum_amount})
                  </div>
                </div>

                <Table
                  dataSource={[
                    ...(simTargetType === 'rider' ? [] : (simPreviewData?.vendors || []).filter(v => v.is_eligible).map(v => ({ ...v, key: `vendor-${v.user_id}` }))),
                    ...(simTargetType === 'vendor' ? [] : (simPreviewData?.riders || []).filter(r => r.is_eligible).map(r => ({ ...r, key: `rider-${r.user_id}` })))
                  ]}
                  size="small"
                  bordered
                  pagination={{ pageSize: 4 }}
                  columns={[
                    {
                      title: 'Role',
                      dataIndex: 'type',
                      key: 'type',
                      width: 90,
                      align: 'center',
                      render: (type) => (
                        <Tag color={type === 'vendor' ? 'purple' : 'cyan'} style={{ fontWeight: 600, margin: 0 }}>
                          {type === 'vendor' ? 'Vendor' : 'Rider'}
                        </Tag>
                      )
                    },
                    {
                      title: 'Beneficiary & Store',
                      key: 'name',
                      render: (_, record) => (
                        <div>
                          <strong style={{ color: '#0f172a' }}>{record.name}</strong>
                          {record.store_name && (
                            <div style={{ fontSize: 11.5, color: '#64748b' }}>Store: {record.store_name}</div>
                          )}
                          <div style={{ fontSize: 11, color: '#94a3b8' }}>
                            {record.bank_details?.bank_name} ({record.bank_details?.account_number})
                          </div>
                        </div>
                      )
                    },
                    {
                      title: 'Available Balance',
                      dataIndex: 'available_balance',
                      key: 'bal',
                      align: 'right',
                      width: 120,
                      render: (val) => <span>₹{parseFloat(val).toFixed(2)}</span>
                    },
                    {
                      title: 'Gross Payout',
                      dataIndex: 'proposed_amount',
                      key: 'gross',
                      align: 'right',
                      width: 115,
                      render: (val) => <strong style={{ color: '#2563eb' }}>₹{parseFloat(val).toFixed(2)}</strong>
                    },
                    {
                      title: simPayoutSpeed === 'quick' ? 'Fee (2.5%)' : 'Fee (0%)',
                      key: 'fee',
                      align: 'right',
                      width: 110,
                      render: (_, record) => {
                        const fee = simPayoutSpeed === 'quick'
                          ? (record.proposed_amount * 0.025).toFixed(2)
                          : '0.00';
                        return (
                          <span style={{ color: Number(fee) > 0 ? '#d97706' : '#64748b', fontWeight: 600 }}>
                            ₹{fee}
                          </span>
                        );
                      }
                    },
                    {
                      title: 'Net Deposited',
                      key: 'net',
                      align: 'right',
                      width: 120,
                      render: (_, record) => {
                        const fee = simPayoutSpeed === 'quick' ? record.proposed_amount * 0.025 : 0;
                        const net = (record.proposed_amount - fee).toFixed(2);
                        return (
                          <span style={{ color: '#16a34a', fontWeight: 700 }}>
                            ₹{net}
                          </span>
                        );
                      }
                    }
                  ]}
                />
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 10, borderTop: '1px solid #f1f5f9', paddingTop: 14 }}>
                <Button onClick={() => setSimModalVisible(false)} style={{ borderRadius: 6 }}>
                  Cancel
                </Button>
                <Button
                  type="primary"
                  icon={<PlayCircleOutlined />}
                  loading={simExecuting}
                  onClick={handleExecuteSimulation}
                  style={{
                    backgroundColor: '#088b46',
                    borderColor: '#088b46',
                    borderRadius: 6,
                    fontWeight: 700,
                    padding: '0 20px',
                    height: 38
                  }}
                >
                  Execute Automated Payout Cycle
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </Spin>
    </div>
  );
};

export default WithdrawalSettings;
