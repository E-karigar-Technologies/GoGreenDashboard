import React, { useState, useEffect } from 'react';
import {
  InputNumber,
  Button,
  Tag,
  Alert,
  Spin,
  message,
  Switch,
  Space,
  Table
} from 'antd';
import {
  CompassOutlined,
  SaveOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  AimOutlined,
  RightOutlined,
  InfoCircleOutlined,
  ShopOutlined,
  CarOutlined,
  ThunderboltOutlined,
  GlobalOutlined,
  ExperimentOutlined,
  SafetyCertificateOutlined
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
  const [isEnabled, setIsEnabled] = useState(true);

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
        const enabled = data.is_enabled !== undefined ? Number(data.is_enabled) === 1 : true;

        setSavedConfig({
          id: data.id || 1,
          max_customer_distance_km: maxCust,
          rider_radius_tier1_km: tier1,
          rider_radius_tier2_km: tier2,
          rider_radius_max_km: tierMax,
          bypass_distance_restriction: bypass ? 1 : 0,
          is_enabled: enabled ? 1 : 0,
          updated_at: data.updated_at || data.created_at || null
        });

        setMaxCustomerDistance(maxCust);
        setRiderRadiusTier1(tier1);
        setRiderRadiusTier2(tier2);
        setRiderRadiusMax(tierMax);
        setBypassDistanceRestriction(bypass);
        setIsEnabled(enabled);
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
    // Validations
    if (maxCustomerDistance === null || isNaN(maxCustomerDistance) || !isFinite(maxCustomerDistance) || maxCustomerDistance <= 0) {
      const msg = 'Max customer delivery distance must be greater than 0 KM.';
      setErrorMsg(msg);
      message.error(msg);
      return;
    }
    if (riderRadiusTier1 === null || isNaN(riderRadiusTier1) || !isFinite(riderRadiusTier1) || riderRadiusTier1 <= 0) {
      const msg = 'Tier 1 search radius must be greater than 0 KM.';
      setErrorMsg(msg);
      message.error(msg);
      return;
    }
    if (riderRadiusTier2 === null || isNaN(riderRadiusTier2) || !isFinite(riderRadiusTier2) || riderRadiusTier2 <= 0) {
      const msg = 'Tier 2 search radius must be greater than 0 KM.';
      setErrorMsg(msg);
      message.error(msg);
      return;
    }
    if (riderRadiusMax === null || isNaN(riderRadiusMax) || !isFinite(riderRadiusMax) || riderRadiusMax <= 0) {
      const msg = 'Tier 3 max search radius must be greater than 0 KM.';
      setErrorMsg(msg);
      message.error(msg);
      return;
    }

    if (riderRadiusTier1 > riderRadiusTier2) {
      message.warning('Notice: Tier 1 initial radius is larger than Tier 2 expanded radius.');
    }
    if (riderRadiusTier2 > riderRadiusMax) {
      message.warning('Notice: Tier 2 expanded radius is larger than Tier 3 max outer search radius.');
    }

    setErrorMsg('');
    setSaving(true);

    const payload = {
      max_customer_distance_km: parseFloat(Number(maxCustomerDistance).toFixed(2)),
      rider_radius_tier1_km: parseFloat(Number(riderRadiusTier1).toFixed(2)),
      rider_radius_tier2_km: parseFloat(Number(riderRadiusTier2).toFixed(2)),
      rider_radius_max_km: parseFloat(Number(riderRadiusMax).toFixed(2)),
      bypass_distance_restriction: bypassDistanceRestriction ? 1 : 0,
      is_enabled: isEnabled ? 1 : 0
    };

    try {
      const res = await updateDistanceSettings(payload);
      if (res.success && res.data) {
        message.success(res.message || 'Distance and radius settings updated successfully.');
        const d = res.data;
        setSavedConfig({
          id: d.id || 1,
          max_customer_distance_km: parseFloat(d.max_customer_distance_km !== undefined ? d.max_customer_distance_km : maxCustomerDistance),
          rider_radius_tier1_km: parseFloat(d.rider_radius_tier1_km !== undefined ? d.rider_radius_tier1_km : riderRadiusTier1),
          rider_radius_tier2_km: parseFloat(d.rider_radius_tier2_km !== undefined ? d.rider_radius_tier2_km : riderRadiusTier2),
          rider_radius_max_km: parseFloat(d.rider_radius_max_km !== undefined ? d.rider_radius_max_km : riderRadiusMax),
          bypass_distance_restriction: d.bypass_distance_restriction !== undefined ? Number(d.bypass_distance_restriction) : (bypassDistanceRestriction ? 1 : 0),
          is_enabled: d.is_enabled !== undefined ? Number(d.is_enabled) : (isEnabled ? 1 : 0),
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
    ? dayjs(savedConfig.updated_at).format('MMM D, YYYY h:mm A')
    : 'Default setup';

  const summaryData = [
    {
      key: 'test_mode',
      parameter: '🧪 Developer Test Mode (India / Canada Bypass)',
      activeValue: savedConfig.bypass_distance_restriction === 1 ? 'ENABLED (Bypass Active)' : 'DISABLED (Strict Enforcement)',
      status: savedConfig.bypass_distance_restriction === 1 ? 'warning' : 'success',
      description: savedConfig.bypass_distance_restriction === 1
        ? 'All distance limits are bypassed. Orders and riders can be tested across any location or country.'
        : 'Normal strict geographic enforcement: Customer max distance and rider search radiuses apply.'
    },
    {
      key: 'customer_distance',
      parameter: 'Max Customer Delivery Range',
      activeValue: `${savedConfig.max_customer_distance_km} KM`,
      status: 'info',
      description: 'Maximum allowable distance from customer address to vendor store for placing orders.'
    },
    {
      key: 'tier1',
      parameter: 'Rider Search: Tier 1 Initial Radius',
      activeValue: `${savedConfig.rider_radius_tier1_km} KM`,
      status: 'info',
      description: 'First wave search radius around the vendor to find and notify nearest delivery riders.'
    },
    {
      key: 'tier2',
      parameter: 'Rider Search: Tier 2 Expanded Radius',
      activeValue: `${savedConfig.rider_radius_tier2_km} KM`,
      status: 'info',
      description: 'Second wave expanded search radius if no rider is assigned from the initial radius.'
    },
    {
      key: 'tier3',
      parameter: 'Rider Search: Tier 3 Maximum Radius',
      activeValue: `${savedConfig.rider_radius_max_km} KM`,
      status: 'info',
      description: 'Outermost search boundary for riders. Prevents dispatch alerts to riders too far away.'
    }
  ];

  const summaryColumns = [
    {
      title: 'Configuration Parameter',
      dataIndex: 'parameter',
      key: 'parameter',
      width: 320,
      render: (text) => <strong style={{ color: '#0f172a' }}>{text}</strong>
    },
    {
      title: 'Active Value',
      dataIndex: 'activeValue',
      key: 'activeValue',
      width: 220,
      render: (text, record) => {
        const color = record.status === 'warning' ? 'orange' : (record.status === 'success' ? 'green' : 'blue');
        return <Tag color={color} style={{ fontWeight: 700, fontSize: 13 }}>{text}</Tag>;
      }
    },
    {
      title: 'Operational Impact',
      dataIndex: 'description',
      key: 'description',
      render: (text) => <span style={{ color: '#475569', fontSize: 12.5 }}>{text}</span>
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
          <p>Control dynamic Customer-to-Vendor delivery limits, 3-tier rider dispatch radiuses, and cross-border test bypass mode.</p>
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

      {/* Cross-border Test Mode Status Banner */}
      {bypassDistanceRestriction ? (
        <Alert
          type="warning"
          showIcon
          icon={<ExperimentOutlined style={{ fontSize: 20, color: '#d97706' }} />}
          message={
            <div style={{ fontWeight: 700, fontSize: 15 }}>
              🧪 Cross-Border Developer Test Mode is ACTIVE
            </div>
          }
          description="Distance restrictions between Customers, Vendors, and Riders are currently bypassed. You and your client can test the complete project workflow end-to-end from any location in the world (e.g., developer in Ambala, India and client/rider in Canada) without distance limitation errors."
          style={{ marginBottom: 20, border: '1px solid #f59e0b', backgroundColor: '#fffbeb' }}
        />
      ) : (
        <Alert
          type="success"
          showIcon
          icon={<SafetyCertificateOutlined style={{ fontSize: 20, color: '#16a34a' }} />}
          message={
            <div style={{ fontWeight: 700, fontSize: 14 }}>
              🛡️ Standard Distance Enforcement is ACTIVE
            </div>
          }
          description="Orders and rider dispatch searches are strictly restricted to the configured customer range and progressive rider radiuses."
          style={{ marginBottom: 20 }}
        />
      )}

      <Spin spinning={loading}>
        {/* Card 1: Cross-Border Test Mode Toggle */}
        <div className={styles.card} style={{ borderLeft: '4px solid #f59e0b' }}>
          <div className={styles.cardTitle}>
            <span>
              <GlobalOutlined style={{ color: '#d97706', marginRight: 8 }} />
              Location & Distance Bypass (India / Canada Test Mode)
            </span>
            <Tag color={bypassDistanceRestriction ? 'orange' : 'default'}>
              {bypassDistanceRestriction ? 'Test Mode Enabled' : 'Normal Mode'}
            </Tag>
          </div>
          <div className={styles.cardSubtitle}>
            Enable this feature so you can test all features across countries without geographical distance blockers.
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: '#f8fafc', borderRadius: 8, marginTop: 12 }}>
            <div style={{ maxWidth: '80%' }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: '#1e293b', marginBottom: 4 }}>
                Bypass Distance Restrictions for All Testing
              </div>
              <div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.5 }}>
                When toggled <strong>ON</strong>, customer app checkout will <strong>not</strong> be blocked even if customer is in India (Ambala) and vendor is in Canada (~11,000 KM away). The order dispatcher will also match and notify active delivery partners regardless of GPS distance.
              </div>
            </div>

            <Switch
              checked={bypassDistanceRestriction}
              onChange={(checked) => setBypassDistanceRestriction(checked)}
              checkedChildren="TEST ON"
              unCheckedChildren="STRICT"
              style={{
                backgroundColor: bypassDistanceRestriction ? '#f59e0b' : '#cbd5e1'
              }}
            />
          </div>
        </div>

        {/* Card 2: Customer Delivery Range */}
        <div className={styles.card}>
          <div className={styles.cardTitle}>
            <span>
              <ShopOutlined style={{ color: '#0284c7', marginRight: 8 }} />
              Customer-to-Vendor Delivery Range
            </span>
            <Tag color="cyan">Customer App Limit</Tag>
          </div>
          <div className={styles.cardSubtitle}>
            Set the maximum allowable driving distance between the customer's delivery address and the vendor's storefront in standard mode.
          </div>

          <div style={{ maxWidth: 420, marginBottom: 12 }}>
            <div className={styles.inputGroup}>
              <label>
                <CompassOutlined style={{ color: '#0284c7' }} />
                Max Customer Delivery Distance (KM)
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
              <div className={styles.inputHelperText}>
                In standard mode, when customer's address is further than <strong>{maxCustomerDistance} KM</strong> from a vendor, checkout is disabled.
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: 3-Tier Rider Search Radius Engine */}
        <div className={styles.card}>
          <div className={styles.cardTitle}>
            <span>
              <AimOutlined style={{ color: '#16a34a', marginRight: 8 }} />
              Progressive 3-Tier Rider Search Radius
            </span>
            <Tag color="green">Dispatch Engine</Tag>
          </div>
          <div className={styles.cardSubtitle}>
            Configure the expanding search radiuses used by the backend dispatch algorithm to find nearby delivery partners around vendors.
          </div>

          <div className={styles.inputsRow}>
            {/* Tier 1 */}
            <div className={styles.inputGroup}>
              <label>
                <AimOutlined style={{ color: '#16a34a' }} />
                1. Tier 1 Initial Radius (KM)
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
              <div className={styles.inputHelperText}>
                Initial immediate radius around vendor to find the nearest riders first.
              </div>
            </div>

            {/* Tier 2 */}
            <div className={styles.inputGroup}>
              <label>
                <AimOutlined style={{ color: '#d97706' }} />
                2. Tier 2 Expanded Radius (KM)
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
              <div className={styles.inputHelperText}>
                Second search wave triggered if no rider accepts or is found in Tier 1.
              </div>
            </div>

            {/* Tier 3 */}
            <div className={styles.inputGroup}>
              <label>
                <AimOutlined style={{ color: '#dc2626' }} />
                3. Tier 3 Maximum Radius (KM)
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
              <div className={styles.inputHelperText}>
                Maximum outer search boundary for riders around the vendor.
              </div>
            </div>
          </div>

          {/* Visual Progression Step Bar */}
          <div className={styles.radiusFlowBox}>
            <div className={styles.radiusFlowItem}>
              <span>🎯 <strong>Tier 1 Initial:</strong> {riderRadiusTier1} KM</span>
            </div>
            <RightOutlined style={{ color: '#94a3b8', fontSize: 13 }} />
            <div className={styles.radiusFlowItem}>
              <span>📡 <strong>Tier 2 Expanded:</strong> {riderRadiusTier2} KM</span>
            </div>
            <RightOutlined style={{ color: '#94a3b8', fontSize: 13 }} />
            <div className={styles.radiusFlowItem}>
              <span>🚀 <strong>Tier 3 Max Limit:</strong> {riderRadiusMax} KM</span>
            </div>
            <div style={{ marginLeft: 'auto', fontSize: 12, color: '#0369a1', fontWeight: 600 }}>
              Max Customer Range: {maxCustomerDistance} KM
            </div>
          </div>

          {/* Save Button */}
          <div className={styles.bottomControlRow}>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              loading={saving}
              onClick={handleSave}
              style={{
                backgroundColor: '#0284c7',
                borderColor: '#0284c7',
                fontWeight: 600,
                minWidth: 180
              }}
            >
              Save Distance Settings
            </Button>
          </div>
        </div>

        {/* Card 4: Current Saved Configuration Table */}
        <div className={styles.card}>
          <div className={styles.cardTitle}>
            <span>Current Active Configuration Summary</span>
            <Tag color="success" icon={<CheckCircleOutlined />}>Active</Tag>
          </div>
          <div className={styles.cardSubtitle}>
            Review the live parameters currently active in the <code>distance_settings</code> table and applied to backend dispatch logic.
          </div>

          <Table
            dataSource={summaryData}
            columns={summaryColumns}
            pagination={false}
            size="small"
            bordered
          />

          <div className={styles.statusMeta}>
            <span>
              <strong>Active Database Record:</strong> ID #{savedConfig.id}
            </span>
            <span>•</span>
            <span>
              <strong>Test Mode:</strong> {savedConfig.bypass_distance_restriction === 1 ? 'ACTIVE (Bypass ON)' : 'OFF (Strict)'}
            </span>
            <span>•</span>
            <span>
              <strong>Customer Max Distance:</strong> {savedConfig.max_customer_distance_km} KM
            </span>
            <span>•</span>
            <span>
              <strong>Rider Dispatch Radiuses:</strong> {savedConfig.rider_radius_tier1_km} KM ➔ {savedConfig.rider_radius_tier2_km} KM ➔ {savedConfig.rider_radius_max_km} KM
            </span>
            <span>•</span>
            <span>
              <strong>Last Updated:</strong> {lastUpdated}
            </span>
          </div>
        </div>

        {/* Card 5: Architecture & Cross-Border Test Workflow */}
        <div className={styles.card}>
          <div className={styles.cardTitle}>
            <span>How Distance Manager Works Across the System</span>
          </div>

          <div className={styles.infoGrid}>
            <div className={styles.infoBox}>
              <h4>
                <ShopOutlined style={{ color: '#0284c7' }} />
                1. Customer App (Ionic / Mobile)
              </h4>
              <p>
                When a customer views a store or adds items to cart, the app compares distance with <code>max_customer_distance_km</code>. When <strong>Test Mode</strong> is ON (or <code>bypass_distance_restriction = 1</code>), the customer can place orders from India to a Canadian store without distance restrictions.
              </p>
            </div>

            <div className={styles.infoBox}>
              <h4>
                <CarOutlined style={{ color: '#16a34a' }} />
                2. Backend Order Dispatcher (orderController.js)
              </h4>
              <p>
                The backend reads the dedicated <code>distance_settings</code> table. In <strong>Test Mode</strong>, it notifies all active delivery partners without bounding-box or Google Matrix ocean errors, allowing full order lifecycle testing between India and Canada.
              </p>
            </div>
          </div>
        </div>
      </Spin>
    </div>
  );
};

export default DistanceManager;
