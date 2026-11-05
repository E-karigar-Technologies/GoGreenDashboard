import React, { useState, useEffect } from 'react';
import {
  InputNumber,
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
  CompassOutlined,
  SaveOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  AimOutlined,
  ShopOutlined,
  GlobalOutlined,
  ExperimentOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import {
  getDistanceSettings,
  updateDistanceSettings
} from '../../services/apiService';
import styles from './distanceManager.module.scss';

const DistanceManager = () => {
  // Saved database configuration
  const [savedConfig, setSavedConfig] = useState({
    id: 1,
    max_customer_distance_km: 15.0,
    rider_radius_tier1_km: 3.0,
    rider_radius_tier2_km: 5.0,
    rider_radius_max_km: 10.0,
    bypass_distance_restriction: 0,
    is_enabled: 1,
    updated_at: null
  });

  // Editable input states
  const [maxCustomerDistance, setMaxCustomerDistance] = useState(15.0);
  const [riderRadiusTier1, setRiderRadiusTier1] = useState(3.0);
  const [riderRadiusTier2, setRiderRadiusTier2] = useState(5.0);
  const [riderRadiusMax, setRiderRadiusMax] = useState(10.0);
  const [bypassDistanceRestriction, setBypassDistanceRestriction] = useState(false);

  // Status & loading
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Fetch settings from API
  const fetchSettings = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await getDistanceSettings();
      if (res.success && res.data) {
        const data = res.data;
        const maxCust = parseFloat(data.max_customer_distance_km) || 15.0;
        const tier1 = parseFloat(data.rider_radius_tier1_km) || 3.0;
        const tier2 = parseFloat(data.rider_radius_tier2_km) || 5.0;
        const tierMax = parseFloat(data.rider_radius_max_km) || 10.0;
        const bypass = Number(data.bypass_distance_restriction) === 1;

        setSavedConfig({
          id: data.id || 1,
          max_customer_distance_km: maxCust,
          rider_radius_tier1_km: tier1,
          rider_radius_tier2_km: tier2,
          rider_radius_max_km: tierMax,
          bypass_distance_restriction: bypass ? 1 : 0,
          is_enabled: 1,
          updated_at: data.updated_at || data.created_at || null
        });

        setMaxCustomerDistance(maxCust);
        setRiderRadiusTier1(tier1);
        setRiderRadiusTier2(tier2);
        setRiderRadiusMax(tierMax);
        setBypassDistanceRestriction(bypass);
      } else {
        message.error(res.error || 'Failed to load distance settings.');
      }
    } catch (err) {
      console.error(err);
      message.error('Error fetching distance settings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  // Save handler
  const handleSave = async () => {
    if (maxCustomerDistance === null || isNaN(maxCustomerDistance) || !isFinite(maxCustomerDistance) || maxCustomerDistance <= 0) {
      const msg = 'Customer delivery range must be greater than 0 KM.';
      setErrorMsg(msg);
      message.error(msg);
      return;
    }
    if (riderRadiusTier1 === null || isNaN(riderRadiusTier1) || !isFinite(riderRadiusTier1) || riderRadiusTier1 <= 0) {
      const msg = 'Tier 1 radius must be greater than 0 KM.';
      setErrorMsg(msg);
      message.error(msg);
      return;
    }
    if (riderRadiusTier2 === null || isNaN(riderRadiusTier2) || !isFinite(riderRadiusTier2) || riderRadiusTier2 <= 0) {
      const msg = 'Tier 2 radius must be greater than 0 KM.';
      setErrorMsg(msg);
      message.error(msg);
      return;
    }
    if (riderRadiusMax === null || isNaN(riderRadiusMax) || !isFinite(riderRadiusMax) || riderRadiusMax <= 0) {
      const msg = 'Tier 3 radius must be greater than 0 KM.';
      setErrorMsg(msg);
      message.error(msg);
      return;
    }

    if (riderRadiusTier1 > riderRadiusTier2) {
      message.warning('Tier 1 radius is larger than Tier 2 radius.');
    }
    if (riderRadiusTier2 > riderRadiusMax) {
      message.warning('Tier 2 radius is larger than Tier 3 max radius.');
    }

    setErrorMsg('');
    setSaving(true);

    const payload = {
      max_customer_distance_km: parseFloat(Number(maxCustomerDistance).toFixed(2)),
      rider_radius_tier1_km: parseFloat(Number(riderRadiusTier1).toFixed(2)),
      rider_radius_tier2_km: parseFloat(Number(riderRadiusTier2).toFixed(2)),
      rider_radius_max_km: parseFloat(Number(riderRadiusMax).toFixed(2)),
      bypass_distance_restriction: bypassDistanceRestriction ? 1 : 0,
      is_enabled: 1
    };

    try {
      const res = await updateDistanceSettings(payload);
      if (res.success && res.data) {
        message.success(res.message || 'Settings saved successfully.');
        const d = res.data;
        setSavedConfig({
          id: d.id || 1,
          max_customer_distance_km: parseFloat(d.max_customer_distance_km !== undefined ? d.max_customer_distance_km : maxCustomerDistance),
          rider_radius_tier1_km: parseFloat(d.rider_radius_tier1_km !== undefined ? d.rider_radius_tier1_km : riderRadiusTier1),
          rider_radius_tier2_km: parseFloat(d.rider_radius_tier2_km !== undefined ? d.rider_radius_tier2_km : riderRadiusTier2),
          rider_radius_max_km: parseFloat(d.rider_radius_max_km !== undefined ? d.rider_radius_max_km : riderRadiusMax),
          bypass_distance_restriction: d.bypass_distance_restriction !== undefined ? Number(d.bypass_distance_restriction) : (bypassDistanceRestriction ? 1 : 0),
          is_enabled: 1,
          updated_at: d.updated_at || new Date().toISOString()
        });
      } else {
        const msg = res.error || 'Failed to update distance settings.';
        setErrorMsg(msg);
        message.error(msg);
      }
    } catch (err) {
      console.error(err);
      message.error('Error saving distance settings.');
    } finally {
      setSaving(false);
    }
  };

  const lastUpdated = savedConfig.updated_at
    ? dayjs(savedConfig.updated_at).format('MMM D, YYYY • h:mm A')
    : 'Default setup';

  const summaryData = [
    {
      key: 'test_mode',
      parameter: 'Location Test Mode (Bypass Distance)',
      value: savedConfig.bypass_distance_restriction === 1 ? 'Enabled (Bypass ON)' : 'Disabled (Strict)',
      tagColor: savedConfig.bypass_distance_restriction === 1 ? 'orange' : 'green',
      note: savedConfig.bypass_distance_restriction === 1 ? 'Testing allowed across any location/country' : 'Enforcing strict distance limits'
    },
    {
      key: 'customer_distance',
      parameter: 'Max Customer Delivery Range',
      value: `${savedConfig.max_customer_distance_km} KM`,
      tagColor: 'blue',
      note: 'Customer-to-vendor max range'
    },
    {
      key: 'tier1',
      parameter: 'Rider Search: Tier 1 (Initial)',
      value: `${savedConfig.rider_radius_tier1_km} KM`,
      tagColor: 'blue',
      note: 'Initial wave search radius'
    },
    {
      key: 'tier2',
      parameter: 'Rider Search: Tier 2 (Expanded)',
      value: `${savedConfig.rider_radius_tier2_km} KM`,
      tagColor: 'blue',
      note: 'Second wave expanded search radius'
    },
    {
      key: 'tier3',
      parameter: 'Rider Search: Tier 3 (Maximum)',
      value: `${savedConfig.rider_radius_max_km} KM`,
      tagColor: 'blue',
      note: 'Maximum outer dispatch radius'
    }
  ];

  const summaryColumns = [
    {
      title: 'Parameter',
      dataIndex: 'parameter',
      key: 'parameter',
      render: (text) => <strong>{text}</strong>
    },
    {
      title: 'Current Value',
      dataIndex: 'value',
      key: 'value',
      width: 220,
      render: (text, record) => <Tag color={record.tagColor} style={{ fontWeight: 600 }}>{text}</Tag>
    },
    {
      title: 'Description',
      dataIndex: 'note',
      key: 'note',
      render: (text) => <span style={{ color: '#64748b', fontSize: 13 }}>{text}</span>
    }
  ];

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.headerSection}>
        <div className={styles.titleBox}>
          <h2>
            <CompassOutlined style={{ color: '#0284c7' }} />
            Distance Manager
          </h2>
          <p>Configure customer delivery range, rider search radiuses, and location test mode.</p>
        </div>

        <Button icon={<ReloadOutlined spin={loading} />} onClick={fetchSettings} size="middle">
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
            <span>Distance & Radius Settings</span>
            <Space>
              {bypassDistanceRestriction ? (
                <Tag color="orange" icon={<ExperimentOutlined />}>Test Mode Active</Tag>
              ) : (
                <Tag color="success" icon={<CheckCircleOutlined />}>Strict Mode</Tag>
              )}
            </Space>
          </div>
          <div className={styles.cardSubtitle}>
            Adjust distance limits for customers and riders, or enable bypass for cross-border testing.
          </div>

          {/* Test Mode Toggle Banner */}
          <div className={styles.testModeBox}>
            <div className={styles.testModeText}>
              <div className={styles.testModeTitle}>
                <GlobalOutlined style={{ color: '#d97706', marginRight: 6 }} />
                Bypass Distance Restrictions (India / Canada Test Mode)
              </div>
              <p>
                When enabled, distance checks are bypassed so you can test orders and rider dispatches from any location (e.g. Ambala, India to Canada).
              </p>
            </div>
            <Switch
              checked={bypassDistanceRestriction}
              onChange={(checked) => setBypassDistanceRestriction(checked)}
              checkedChildren="TEST ON"
              unCheckedChildren="OFF"
              style={{
                backgroundColor: bypassDistanceRestriction ? '#f59e0b' : '#cbd5e1'
              }}
            />
          </div>

          {/* 4 Input Fields Grid */}
          <div className={styles.gridRow}>
            {/* Customer Distance */}
            <div className={styles.inputItem}>
              <label>
                <ShopOutlined style={{ color: '#0284c7' }} />
                Max Customer Delivery Range
              </label>
              <InputNumber
                value={maxCustomerDistance}
                onChange={(val) => setMaxCustomerDistance(val !== null ? val : 0)}
                min={0.5}
                step={1}
                precision={2}
                addonAfter="KM"
                style={{ width: '100%' }}
              />
              <span className={styles.hintText}>Max distance from customer to store for ordering.</span>
            </div>

            {/* Rider Tier 1 */}
            <div className={styles.inputItem}>
              <label>
                <AimOutlined style={{ color: '#16a34a' }} />
                Rider Tier 1: Initial Search Radius
              </label>
              <InputNumber
                value={riderRadiusTier1}
                onChange={(val) => setRiderRadiusTier1(val !== null ? val : 0)}
                min={0.5}
                step={0.5}
                precision={2}
                addonAfter="KM"
                style={{ width: '100%' }}
              />
              <span className={styles.hintText}>Initial radius to find nearest delivery riders.</span>
            </div>

            {/* Rider Tier 2 */}
            <div className={styles.inputItem}>
              <label>
                <AimOutlined style={{ color: '#d97706' }} />
                Rider Tier 2: Expanded Radius
              </label>
              <InputNumber
                value={riderRadiusTier2}
                onChange={(val) => setRiderRadiusTier2(val !== null ? val : 0)}
                min={0.5}
                step={0.5}
                precision={2}
                addonAfter="KM"
                style={{ width: '100%' }}
              />
              <span className={styles.hintText}>Expanded radius if no rider is found in Tier 1.</span>
            </div>

            {/* Rider Tier 3 */}
            <div className={styles.inputItem}>
              <label>
                <AimOutlined style={{ color: '#dc2626' }} />
                Rider Tier 3: Maximum Radius
              </label>
              <InputNumber
                value={riderRadiusMax}
                onChange={(val) => setRiderRadiusMax(val !== null ? val : 0)}
                min={0.5}
                step={1}
                precision={2}
                addonAfter="KM"
                style={{ width: '100%' }}
              />
              <span className={styles.hintText}>Maximum outer dispatch limit for riders.</span>
            </div>
          </div>

          {/* Action Row */}
          <div className={styles.actionRow}>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              loading={saving}
              onClick={handleSave}
              style={{
                backgroundColor: '#0284c7',
                borderColor: '#0284c7',
                fontWeight: 600,
                minWidth: 150
              }}
            >
              Save Changes
            </Button>
          </div>
        </div>

        {/* Card 2: Current Configuration Overview */}
        <div className={styles.card}>
          <div className={styles.cardTitle}>
            <span>Current Configuration Overview</span>
            <Tag color="success">Live Database</Tag>
          </div>
          <div className={styles.cardSubtitle}>
            Active values currently applied to order creation and dispatching.
          </div>

          <Table
            dataSource={summaryData}
            columns={summaryColumns}
            pagination={false}
            size="middle"
            bordered
          />

          <div className={styles.statusFooter}>
            <span>Database Table: <code>distance_settings</code> (ID #1)</span>
            <span>•</span>
            <span>Last Updated: {lastUpdated}</span>
          </div>
        </div>
      </Spin>
    </div>
  );
};

export default DistanceManager;
