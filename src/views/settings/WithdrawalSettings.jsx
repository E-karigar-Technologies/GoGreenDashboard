import React, { useState, useEffect, useMemo } from 'react';
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
  Col
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
  ClockCircleOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import {
  getWithdrawalSettings,
  updateWithdrawalSettings
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
  }, []);

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

        {/* Section 4: Current Withdrawal Configuration Table */}
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
      </Spin>
    </div>
  );
};

export default WithdrawalSettings;
