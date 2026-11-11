import React, { useState, useEffect } from 'react';
import {
  InputNumber,
  Input,
  Button,
  Tag,
  Alert,
  Spin,
  message,
  Switch,
  Table,
  Space
} from 'antd';
import {
  ClockCircleOutlined,
  SaveOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  InfoCircleOutlined,
  ThunderboltOutlined,
  CheckOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import {
  getVendorOrderTimingSettings,
  updateVendorOrderTimingSettings
} from '../../services/apiService';
import styles from './vendorOrderTiming.module.scss';

const PRESET_MINUTES = [3, 5, 10, 15, 30];

const VendorOrderTiming = () => {
  // Current saved configuration from database
  const [savedConfig, setSavedConfig] = useState({
    id: 1,
    accept_timeout_minutes: 5,
    is_auto_cancel_enabled: 1,
    cancellation_reason: 'Auto-cancelled: Store did not accept the order in time',
    updated_at: null
  });

  // Editable input states
  const [acceptTimeoutMinutes, setAcceptTimeoutMinutes] = useState(5);
  const [isAutoCancelEnabled, setIsAutoCancelEnabled] = useState(true);
  const [cancellationReason, setCancellationReason] = useState(
    'Auto-cancelled: Store did not accept the order in time'
  );

  // Status & loading
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Fetch settings from API
  const fetchSettings = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await getVendorOrderTimingSettings();
      if (res.success && res.data) {
        const data = res.data;
        const timeout = parseInt(data.accept_timeout_minutes, 10) || 5;
        const autoCancel = Number(data.is_auto_cancel_enabled) === 1;
        const reason =
          data.cancellation_reason ||
          'Auto-cancelled: Store did not accept the order in time';

        setSavedConfig({
          id: data.id || 1,
          accept_timeout_minutes: timeout,
          is_auto_cancel_enabled: autoCancel ? 1 : 0,
          cancellation_reason: reason,
          updated_at: data.updated_at || data.created_at || null
        });

        setAcceptTimeoutMinutes(timeout);
        setIsAutoCancelEnabled(autoCancel);
        setCancellationReason(reason);
      } else {
        message.error(res.error || 'Failed to load vendor order timing settings.');
      }
    } catch (err) {
      console.error(err);
      message.error('Error fetching vendor order timing settings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  // Save changes handler
  const handleSave = async () => {
    if (!acceptTimeoutMinutes || isNaN(acceptTimeoutMinutes) || acceptTimeoutMinutes < 1) {
      const msg = 'Vendor order accept timeout must be at least 1 minute.';
      setErrorMsg(msg);
      message.error(msg);
      return;
    }

    if (!cancellationReason || !cancellationReason.trim()) {
      const msg = 'Cancellation reason cannot be empty.';
      setErrorMsg(msg);
      message.error(msg);
      return;
    }

    setErrorMsg('');
    setSaving(true);

    const payload = {
      accept_timeout_minutes: parseInt(acceptTimeoutMinutes, 10),
      is_auto_cancel_enabled: isAutoCancelEnabled ? 1 : 0,
      cancellation_reason: cancellationReason.trim()
    };

    try {
      const res = await updateVendorOrderTimingSettings(payload);
      if (res.success && res.data) {
        message.success(res.message || 'Vendor timing settings updated successfully.');
        const d = res.data;
        const timeout = parseInt(d.accept_timeout_minutes, 10) || payload.accept_timeout_minutes;
        const autoCancel = Number(d.is_auto_cancel_enabled) === 1;
        const reason = d.cancellation_reason || payload.cancellation_reason;

        setSavedConfig({
          id: d.id || 1,
          accept_timeout_minutes: timeout,
          is_auto_cancel_enabled: autoCancel ? 1 : 0,
          cancellation_reason: reason,
          updated_at: d.updated_at || new Date().toISOString()
        });

        setAcceptTimeoutMinutes(timeout);
        setIsAutoCancelEnabled(autoCancel);
        setCancellationReason(reason);
      } else {
        const errorText = res.error || 'Failed to update timing settings.';
        setErrorMsg(errorText);
        message.error(errorText);
      }
    } catch (err) {
      console.error(err);
      const errorText = 'Error saving vendor order timing settings.';
      setErrorMsg(errorText);
      message.error(errorText);
    } finally {
      setSaving(false);
    }
  };

  // Reset inputs to saved values
  const handleReset = () => {
    setAcceptTimeoutMinutes(savedConfig.accept_timeout_minutes);
    setIsAutoCancelEnabled(Number(savedConfig.is_auto_cancel_enabled) === 1);
    setCancellationReason(savedConfig.cancellation_reason);
    setErrorMsg('');
    message.info('Form reset to saved settings.');
  };

  const lastUpdated = savedConfig.updated_at
    ? dayjs(savedConfig.updated_at).format('MMM D, YYYY • h:mm A')
    : 'Default setup';

  // Summary table data
  const summaryColumns = [
    {
      title: 'Setting',
      dataIndex: 'parameter',
      key: 'parameter',
      render: (text) => <strong>{text}</strong>
    },
    {
      title: 'Active Value',
      dataIndex: 'value',
      key: 'value',
      width: 200,
      render: (text, record) => (
        <Tag color={record.tagColor} style={{ fontWeight: 600 }}>
          {text}
        </Tag>
      )
    },
    {
      title: 'Description',
      dataIndex: 'note',
      key: 'note',
      render: (text) => <span style={{ color: '#64748b', fontSize: 13 }}>{text}</span>
    }
  ];

  const summaryData = [
    {
      key: 'timeout',
      parameter: 'Vendor Acceptance Time Limit',
      value: `${savedConfig.accept_timeout_minutes} Minutes`,
      tagColor: 'blue',
      note: 'Time vendor has to accept a new order before it expires'
    },
    {
      key: 'auto_cancel',
      parameter: 'Automatic Cancellation',
      value: Number(savedConfig.is_auto_cancel_enabled) === 1 ? 'Enabled' : 'Disabled',
      tagColor: Number(savedConfig.is_auto_cancel_enabled) === 1 ? 'green' : 'default',
      note:
        Number(savedConfig.is_auto_cancel_enabled) === 1
          ? 'System cancels order automatically after time limit'
          : 'Orders remain pending indefinitely until manual action'
    },
    {
      key: 'reason',
      parameter: 'Cancellation Reason',
      value: savedConfig.cancellation_reason,
      tagColor: 'cyan',
      note: 'Saved in order details and visible to customer in order history'
    }
  ];

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.headerSection}>
        <div className={styles.titleBox}>
          <h2>
            <ClockCircleOutlined style={{ color: '#0284c7' }} />
            Vendor Order Acceptance Timing
          </h2>
          <p>
            Control how long stores have to accept new orders and manage auto-cancellation rules.
          </p>
        </div>

        <Button
          icon={<ReloadOutlined spin={loading} />}
          onClick={fetchSettings}
          size="middle"
        >
          Refresh
        </Button>
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

      <Spin spinning={loading}>
        {/* Card 1: Configuration Form */}
        <div className={styles.card}>
          <div className={styles.cardTitle}>
            <span>Order Acceptance & Auto-Cancel Rules</span>
            <Space>
              {isAutoCancelEnabled ? (
                <Tag color="success" icon={<CheckCircleOutlined />}>
                  Auto-Cancel Active ({acceptTimeoutMinutes} min)
                </Tag>
              ) : (
                <Tag color="default" icon={<CloseCircleOutlined />}>
                  Auto-Cancel Disabled
                </Tag>
              )}
            </Space>
          </div>
          <div className={styles.cardSubtitle}>
            When a customer places an order, the vendor must accept within this time window.
          </div>

          {/* Auto-Cancel Toggle Banner */}
          <div
            className={`${styles.toggleBanner} ${
              isAutoCancelEnabled ? styles.active : ''
            }`}
          >
            <div className={styles.toggleText}>
              <div className={styles.toggleTitle}>
                <ThunderboltOutlined
                  style={{
                    color: isAutoCancelEnabled ? '#10b981' : '#64748b'
                  }}
                />
                Automatic Cancellation on Timeout
              </div>
              <p>
                When enabled, if the store does not accept within the time limit, the order automatically cancels and records the reason below.
              </p>
            </div>
            <Switch
              checked={isAutoCancelEnabled}
              onChange={(checked) => setIsAutoCancelEnabled(checked)}
              checkedChildren="ENABLED"
              unCheckedChildren="DISABLED"
              style={{
                backgroundColor: isAutoCancelEnabled ? '#10b981' : '#cbd5e1'
              }}
            />
          </div>

          {/* Input Fields Grid */}
          <div className={styles.gridRow}>
            {/* Acceptance Timeout */}
            <div className={styles.inputItem}>
              <label>
                <ClockCircleOutlined style={{ color: '#0284c7' }} />
                Vendor Accept Timeout
              </label>
              <InputNumber
                style={{ width: '100%' }}
                size="large"
                min={1}
                max={120}
                step={1}
                value={acceptTimeoutMinutes}
                onChange={(val) => setAcceptTimeoutMinutes(val)}
                addonAfter="Minutes"
                placeholder="e.g. 5"
              />
              {/* Quick Presets */}
              <div className={styles.presetRow}>
                <span className={styles.presetLabel}>Quick Select:</span>
                {PRESET_MINUTES.map((min) => (
                  <Tag
                    key={min}
                    color={acceptTimeoutMinutes === min ? 'blue' : 'default'}
                    className={styles.presetTag}
                    onClick={() => setAcceptTimeoutMinutes(min)}
                  >
                    {min} Min
                  </Tag>
                ))}
              </div>
              <div className={styles.hintText}>
                The vendor will have this many minutes to click "Accept Order".
              </div>
            </div>

            {/* Cancellation Reason */}
            <div className={styles.inputItem}>
              <label>
                <InfoCircleOutlined style={{ color: '#0284c7' }} />
                Auto-Cancellation Reason
              </label>
              <Input
                size="large"
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                placeholder="e.g. Auto-cancelled: Store did not accept the order in time"
                maxLength={255}
              />
              <div className={styles.hintText}>
                This explanation is displayed in the admin order list and shown to the customer.
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className={styles.actionRow}>
            <Button size="large" onClick={handleReset} disabled={saving}>
              Reset
            </Button>
            <Button
              type="primary"
              size="large"
              icon={<SaveOutlined />}
              onClick={handleSave}
              loading={saving}
              style={{ backgroundColor: '#10b981', borderColor: '#10b981' }}
            >
              Save Changes
            </Button>
          </div>
        </div>

        {/* Card 2: Simple 3-Step Lifecycle (Easy to understand) */}
        <div className={styles.card}>
          <div className={styles.cardTitle}>
            <span>How It Works</span>
          </div>
          <div className={styles.cardSubtitle}>
            Order lifecycle when a new customer order is placed
          </div>

          <div className={styles.timelineGrid}>
            <div className={styles.timelineCard}>
              <span className={styles.stepBadge} style={{ background: '#e0f2fe', color: '#0284c7' }}>
                Step 1
              </span>
              <h5>Customer Places Order</h5>
              <p>
                Order status is set to <strong>Pending (0)</strong> and the acceptance timer starts immediately.
              </p>
            </div>

            <div className={styles.timelineCard}>
              <span className={styles.stepBadge} style={{ background: '#ecfdf5', color: '#059669' }}>
                Step 2
              </span>
              <h5>Store Accepts in Time</h5>
              <p>
                If the vendor accepts within <strong>{savedConfig.accept_timeout_minutes} minutes</strong>, the timer stops and the order proceeds normally.
              </p>
            </div>

            <div className={styles.timelineCard}>
              <span className={styles.stepBadge} style={{ background: '#fef2f2', color: '#dc2626' }}>
                Step 3
              </span>
              <h5>Timeout Exceeded</h5>
              <p>
                If not accepted in time, the system marks order as <strong>Cancelled (3)</strong> with your reason and notifies the customer.
              </p>
            </div>
          </div>
        </div>

        {/* Card 3: Active Settings Overview */}
        <div className={styles.card}>
          <div className={styles.cardTitle}>
            <span>Current Active Configuration</span>
          </div>
          <div className={styles.cardSubtitle}>
            Live values active in the database (<code>vendor_order_timing_settings</code>)
          </div>

          <Table
            dataSource={summaryData}
            columns={summaryColumns}
            pagination={false}
            bordered
            size="middle"
          />

          <div className={styles.statusFooter}>
            <CheckOutlined style={{ color: '#10b981' }} />
            <span>Last updated: <strong>{lastUpdated}</strong></span>
          </div>
        </div>
      </Spin>
    </div>
  );
};

export default VendorOrderTiming;
