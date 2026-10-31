import React, { useState, useEffect, useMemo } from 'react';
import {
  InputNumber,
  Switch,
  Select,
  Button,
  Table,
  Tag,
  Alert,
  Spin,
  message,
  Tooltip
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
  DollarOutlined
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
    allow_specific_amount: true,
    allow_full_balance: true,
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
    allow_specific_amount: true,
    allow_full_balance: true,
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
            allow_specific_amount: Number(vendor.allow_specific_amount) === 1,
            allow_full_balance: Number(vendor.allow_full_balance) === 1,
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
            allow_specific_amount: Number(rider.allow_specific_amount) === 1,
            allow_full_balance: Number(rider.allow_full_balance) === 1,
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
    // Validation: Minimum amounts
    if (vendorConfig.minimum_amount === null || isNaN(vendorConfig.minimum_amount) || vendorConfig.minimum_amount < 0) {
      const msg = 'Vendor minimum withdrawal amount must be a positive number.';
      setErrorMsg(msg);
      message.error(msg);
      return;
    }

    if (riderConfig.minimum_amount === null || isNaN(riderConfig.minimum_amount) || riderConfig.minimum_amount < 0) {
      const msg = 'Rider minimum withdrawal amount must be a positive number.';
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
        allow_specific_amount: vendorConfig.allow_specific_amount ? 1 : 0,
        allow_full_balance: vendorConfig.allow_full_balance ? 1 : 0,
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
        allow_specific_amount: riderConfig.allow_specific_amount ? 1 : 0,
        allow_full_balance: riderConfig.allow_full_balance ? 1 : 0,
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
        minimum_amount: `$${vendorConfig.minimum_amount.toFixed(2)} CAD`,
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
        minimum_amount: `$${vendorConfig.minimum_amount.toFixed(2)} CAD`,
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
        minimum_amount: `$${riderConfig.minimum_amount.toFixed(2)} CAD`,
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
        minimum_amount: `$${riderConfig.minimum_amount.toFixed(2)} CAD`,
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
      width: 110,
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
      width: 100,
      render: (val) => <Tag color={val === 'Weekly' ? 'purple' : 'cyan'}>{val}</Tag>
    },
    {
      title: 'Payout Day / Date',
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
      title: 'Minimum Amount (CAD)',
      dataIndex: 'minimum_amount',
      key: 'minimum_amount',
      render: (val) => <strong style={{ color: '#1e293b' }}>{val}</strong>
    },
    {
      title: 'Allowed Amount Options',
      dataIndex: 'allowed_options',
      key: 'allowed_options',
      render: (opts) => (
        <span>
          {opts && opts.length > 0 ? (
            opts.map((opt) => (
              <Tag key={opt} color="geekblue" style={{ fontSize: 11 }}>
                {opt}
              </Tag>
            ))
          ) : (
            <Tag color="red">None (Blocked)</Tag>
          )}
        </span>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) =>
        status === 'Active' ? (
          <Tag color="success" icon={<CheckCircleOutlined />}>Active</Tag>
        ) : (
          <Tag color="default" icon={<CloseCircleOutlined />}>Disabled</Tag>
        )
    },
    {
      title: 'Last Updated',
      dataIndex: 'updated_at',
      key: 'updated_at',
      render: (d) => (d ? dayjs(d).format('MMM D, YYYY • hh:mm A') : 'Default')
    }
  ];

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.headerSection}>
        <div className={styles.titleBox}>
          <h2>
            <WalletOutlined style={{ color: '#088b46', marginRight: 8 }} />
            Withdrawal Settings
          </h2>
          <p>Control automatic withdrawal schedules and withdrawal amount options for Vendor and Rider apps.</p>
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
          <span>How Automatic Withdrawals & Amount Options Work</span>
        </div>
        <div className={styles.infoBody}>
          <div className={styles.infoCol}>
            <strong>🗓️ Schedules & Frequencies:</strong> Admin can independently enable Weekly and/or Monthly withdrawal schedules for Vendors and Riders. In their respective apps, users choose their preferred frequency among globally enabled options.
          </div>
          <div className={styles.infoCol}>
            <strong>💵 Specific Amount Option:</strong> User specifies a preferred withdrawal amount (e.g., CA$100.00). The amount must be at least the admin-defined minimum and cannot exceed the available wallet balance when payout executes.
          </div>
          <div className={styles.infoCol}>
            <strong>🏦 All Available Amount Option:</strong> Automatically withdraws 100% of the cleared, eligible wallet balance. Excludes pending earnings, reserved funds, active disputes, or balances already committed to another payout.
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

            {/* Minimum Amount */}
            <div className={styles.inputGroup} style={{ marginTop: 14 }}>
              <label>Minimum Withdrawal Amount (CAD)</label>
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
                Vendors cannot withdraw an amount below this threshold.
              </span>
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

            {/* Minimum Amount */}
            <div className={styles.inputGroup} style={{ marginTop: 14 }}>
              <label>Minimum Withdrawal Amount (CAD)</label>
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
                Riders cannot withdraw an amount below this threshold.
              </span>
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

