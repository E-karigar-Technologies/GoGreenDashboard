import React, { useState, useEffect, useMemo } from 'react';
import {
  InputNumber,
  Switch,
  Button,
  Table,
  Tag,
  Alert,
  Spin,
  message,
  Space
} from 'antd';
import {
  CarOutlined,
  SaveOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import {
  getRiderDeliverySettings,
  updateRiderDeliverySettings
} from '../../services/apiService';
import styles from './riderDeliveryCharges.module.scss';

// Standard distance examples from specification (including 10 km and 10.1 km tier transition)
const SAMPLE_DISTANCES = [3, 5, 5.1, 5.5, 6, 6.1, 7, 10, 10.1];

/**
 * Formula: payout = distance <= baseDistance ? baseAmount : baseAmount + Math.ceil(distance - baseDistance) * additionalAmount
 */
const calculatePayout = (dist, baseDist, baseAmt, addlAmt) => {
  const d = Math.max(0, parseFloat(dist) || 0);
  const bd = Math.max(0.01, parseFloat(baseDist) || 5);
  const ba = Math.max(0, parseFloat(baseAmt) || 0);
  const aa = Math.max(0, parseFloat(addlAmt) || 0);

  if (d <= bd) {
    return {
      distance: d,
      rule: `Within Base (${bd} KM)`,
      extraKm: 0,
      totalPayout: ba
    };
  }

  const excess = d - bd;
  const billedKm = Math.ceil(excess);
  const extraAmt = billedKm * aa;
  return {
    distance: d,
    rule: `Base + Math.ceil(${excess.toFixed(1)}) × $${aa.toFixed(2)}`,
    extraKm: billedKm,
    totalPayout: ba + extraAmt
  };
};

const RiderDeliveryCharges = () => {
  // Saved database configuration
  const [savedConfig, setSavedConfig] = useState({
    id: 1,
    base_distance_km: 5.0,
    base_amount_cad: 5.0,
    additional_amount_per_km_cad: 1.0,
    is_enabled: 1,
    updated_at: null
  });

  // Editable input states
  const [baseDistance, setBaseDistance] = useState(5.0);
  const [baseAmount, setBaseAmount] = useState(5.0);
  const [additionalAmount, setAdditionalAmount] = useState(1.0);
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
      const res = await getRiderDeliverySettings();
      if (res.success && res.data) {
        const data = res.data;
        const bd = parseFloat(data.base_distance_km) || 5.0;
        const ba = parseFloat(data.base_amount_cad) || 5.0;
        const aa = parseFloat(data.additional_amount_per_km_cad) || 1.0;
        const en = Number(data.is_enabled) === 1;

        setSavedConfig({
          id: data.id || 1,
          base_distance_km: bd,
          base_amount_cad: ba,
          additional_amount_per_km_cad: aa,
          is_enabled: en ? 1 : 0,
          updated_at: data.updated_at || data.created_at || null
        });

        setBaseDistance(bd);
        setBaseAmount(ba);
        setAdditionalAmount(aa);
        setIsEnabled(en);
      } else {
        message.error(res.error || 'Failed to load settings.');
      }
    } catch (err) {
      console.error(err);
      message.error('Error fetching delivery settings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  // Save handler
  const handleSave = async () => {
    // Validation
    if (baseDistance === null || isNaN(baseDistance) || !isFinite(baseDistance) || baseDistance <= 0) {
      const msg = 'Base distance must be greater than 0.';
      setErrorMsg(msg);
      message.error(msg);
      return;
    }
    if (baseAmount === null || isNaN(baseAmount) || !isFinite(baseAmount) || baseAmount < 0) {
      const msg = 'Base amount cannot be negative.';
      setErrorMsg(msg);
      message.error(msg);
      return;
    }
    if (additionalAmount === null || isNaN(additionalAmount) || !isFinite(additionalAmount) || additionalAmount < 0) {
      const msg = 'Additional amount per KM cannot be negative.';
      setErrorMsg(msg);
      message.error(msg);
      return;
    }

    setErrorMsg('');
    setSaving(true);

    const payload = {
      base_distance_km: parseFloat(Number(baseDistance).toFixed(2)),
      base_amount_cad: parseFloat(Number(baseAmount).toFixed(2)),
      additional_amount_per_km_cad: parseFloat(Number(additionalAmount).toFixed(2)),
      is_enabled: isEnabled ? 1 : 0
    };

    try {
      const res = await updateRiderDeliverySettings(payload);
      if (res.success && res.data) {
        message.success(res.message || 'Settings saved successfully!');
        const d = res.data;
        setSavedConfig({
          id: d.id || 1,
          base_distance_km: parseFloat(d.base_distance_km),
          base_amount_cad: parseFloat(d.base_amount_cad),
          additional_amount_per_km_cad: parseFloat(d.additional_amount_per_km_cad),
          is_enabled: Number(d.is_enabled) === 1 ? 1 : 0,
          updated_at: d.updated_at || new Date().toISOString()
        });
      } else {
        const msg = res.error || 'Failed to update settings.';
        setErrorMsg(msg);
        message.error(msg);
      }
    } catch (err) {
      console.error(err);
      message.error('Error saving settings.');
    } finally {
      setSaving(false);
    }
  };

  // Instant refresh of example breakdown table
  const breakdownRows = useMemo(() => {
    return SAMPLE_DISTANCES.map((d) => {
      const calc = calculatePayout(d, baseDistance, baseAmount, additionalAmount);
      return {
        key: d,
        distance: `${d} km`,
        rule: calc.rule,
        payout: `$${calc.totalPayout.toFixed(2)} CAD`
      };
    });
  }, [baseDistance, baseAmount, additionalAmount]);

  const breakdownColumns = [
    {
      title: 'Distance',
      dataIndex: 'distance',
      key: 'distance',
      width: 120,
      render: (text) => <strong style={{ color: '#0f172a' }}>{text}</strong>
    },
    {
      title: 'Calculation Rule',
      dataIndex: 'rule',
      key: 'rule',
      render: (text) => <span style={{ color: '#475569', fontSize: 13 }}>{text}</span>
    },
    {
      title: 'Rider Payout (CAD)',
      dataIndex: 'payout',
      key: 'payout',
      align: 'right',
      width: 170,
      render: (text) => <strong style={{ color: '#088b46', fontSize: 14 }}>{text}</strong>
    }
  ];

  const lastUpdated = savedConfig.updated_at
    ? dayjs(savedConfig.updated_at).format('MMM D, YYYY • hh:mm A')
    : 'Not yet updated';

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.headerSection}>
        <div className={styles.titleBox}>
          <h2>
            <CarOutlined style={{ color: '#088b46', marginRight: 8 }} />
            Rider Delivery Charges
          </h2>
          <p>Configure how much riders earn for each delivery based on distance.</p>
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
        {/* Section 1: Configuration Card */}
        <div className={styles.card}>
          <div className={styles.cardTitle}>
            <span>Delivery Charge Configuration</span>
            {savedConfig.is_enabled === 1 ? (
              <Tag color="success" icon={<CheckCircleOutlined />}>Active</Tag>
            ) : (
              <Tag color="default" icon={<CloseCircleOutlined />}>Disabled</Tag>
            )}
          </div>

          <div className={styles.inputsRow}>
            {/* Input 1 */}
            <div className={styles.inputGroup}>
              <label>1. Base Distance (KM)</label>
              <InputNumber
                value={baseDistance}
                onChange={(val) => setBaseDistance(val !== null ? val : 0)}
                min={0.1}
                step={0.5}
                precision={2}
                addonAfter="KM"
                style={{ width: '100%' }}
              />
            </div>

            {/* Input 2 */}
            <div className={styles.inputGroup}>
              <label>2. Base Amount (CAD)</label>
              <InputNumber
                value={baseAmount}
                onChange={(val) => setBaseAmount(val !== null ? val : 0)}
                min={0}
                step={0.5}
                precision={2}
                prefix="$"
                addonAfter="CAD"
                style={{ width: '100%' }}
              />
            </div>

            {/* Input 3 */}
            <div className={styles.inputGroup}>
              <label>3. Additional Amount Per KM (CAD)</label>
              <InputNumber
                value={additionalAmount}
                onChange={(val) => setAdditionalAmount(val !== null ? val : 0)}
                min={0}
                step={0.25}
                precision={2}
                prefix="$"
                addonAfter="CAD"
                style={{ width: '100%' }}
              />
            </div>
          </div>

          <div className={styles.bottomControlRow}>
            <div className={styles.toggleContainer}>
              <Switch
                checked={isEnabled}
                onChange={setIsEnabled}
                style={{ backgroundColor: isEnabled ? '#088b46' : undefined }}
              />
              <span>{isEnabled ? 'Enabled (Active)' : 'Disabled'}</span>
            </div>

            <Button
              type="primary"
              icon={<SaveOutlined />}
              loading={saving}
              onClick={handleSave}
              style={{
                backgroundColor: '#088b46',
                borderColor: '#088b46',
                fontWeight: 600,
                minWidth: 140
              }}
            >
              Save Changes
            </Button>
          </div>

          {/* Section 4: Current Configuration Summary */}
          <div className={styles.statusMeta}>
            <span>
              <strong>Current Saved Settings:</strong> {savedConfig.base_distance_km} KM Base (${savedConfig.base_amount_cad.toFixed(2)} CAD) + ${savedConfig.additional_amount_per_km_cad.toFixed(2)} CAD/KM
            </span>
            <span>•</span>
            <span>
              <strong>Status:</strong> {savedConfig.is_enabled === 1 ? 'Active' : 'Disabled'}
            </span>
            <span>•</span>
            <span>
              <strong>Last Updated:</strong> {lastUpdated}
            </span>
          </div>
        </div>

        {/* Section 2: How It Works & Section 3: Charge Breakdown */}
        <div className={styles.card}>
          <div className={styles.cardTitle}>
            <span>How It Works & Charge Breakdown</span>
          </div>

          <div className={styles.formulaBox}>
            payout = distance &lt;= baseDistance ? baseAmount : baseAmount + Math.ceil(distance - baseDistance) * additionalAmount
          </div>

          <div className={styles.howItWorksText}>
            For deliveries from 0 to {baseDistance} km, the rider earns <strong>${baseAmount.toFixed(2)} CAD</strong>. Beyond {baseDistance} km, each additional kilometre or fraction of a kilometre adds <strong>${additionalAmount.toFixed(2)} CAD</strong> using <code>Math.ceil()</code> on the excess distance.
          </div>

          <Table
            dataSource={breakdownRows}
            columns={breakdownColumns}
            pagination={false}
            size="small"
            bordered
          />

          <div className={styles.tierNote}>
            💡 <strong>Tier Transition Note:</strong> At exactly <strong>10.0 km</strong>, the excess distance is exactly 5.0 km, resulting in <strong>$10.00 CAD</strong> ($5.00 base + 5 × $1.00). As soon as the delivery exceeds 10 km (e.g. <strong>10.1 km</strong>), <code>Math.ceil()</code> rounds up the excess to 6 km, making the payout <strong>$11.00 CAD</strong> ($5.00 base + 6 × $1.00).
          </div>
        </div>
      </Spin>
    </div>
  );
};

export default RiderDeliveryCharges;
