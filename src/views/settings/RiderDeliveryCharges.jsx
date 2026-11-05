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
  CloseCircleOutlined,
  ThunderboltOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import {
  getRiderDeliverySettings,
  updateRiderDeliverySettings
} from '../../services/apiService';
import styles from './riderDeliveryCharges.module.scss';

// Standard sample distances for breakdown
const SAMPLE_DISTANCES = [3, 5, 5.1, 5.5, 6, 6.1, 7, 10, 10.1];

/**
 * Formula:
 * standard payout = distance <= baseDistance ? baseAmount : baseAmount + Math.ceil(distance - baseDistance) * additionalAmount
 * fast delivery payout = standard payout + (isFastDeliveryEnabled ? fastDeliveryAmount : 0)
 */
const calculatePayout = (dist, baseDist, baseAmt, addlAmt, fastAmt, isFastEnabled) => {
  const d = Math.max(0, parseFloat(dist) || 0);
  const bd = Math.max(0.01, parseFloat(baseDist) || 5);
  const ba = Math.max(0, parseFloat(baseAmt) || 0);
  const aa = Math.max(0, parseFloat(addlAmt) || 0);
  const fa = Math.max(0, parseFloat(fastAmt) || 0);

  let standardPayout = 0;
  let rule = '';
  let extraKm = 0;

  if (d <= bd) {
    standardPayout = ba;
    rule = `Within Base (${bd} KM)`;
  } else {
    const excess = d - bd;
    extraKm = Math.ceil(excess);
    const extraAmt = extraKm * aa;
    standardPayout = ba + extraAmt;
    rule = `Base + Math.ceil(${excess.toFixed(1)}) × $${aa.toFixed(2)}`;
  }

  const fastSurcharge = isFastEnabled ? fa : 0;
  const fastPayout = standardPayout + fastSurcharge;

  return {
    distance: d,
    rule,
    extraKm,
    standardPayout,
    fastPayout,
    fastSurcharge
  };
};

const RiderDeliveryCharges = () => {
  // Saved database configuration
  const [savedConfig, setSavedConfig] = useState({
    id: 1,
    base_distance_km: 5.0,
    base_amount_cad: 5.0,
    additional_amount_per_km_cad: 1.0,
    fast_delivery_amount_cad: 5.0,
    is_fast_delivery_enabled: 1,
    is_enabled: 1,
    updated_at: null
  });

  // Editable input states
  const [baseDistance, setBaseDistance] = useState(5.0);
  const [baseAmount, setBaseAmount] = useState(5.0);
  const [additionalAmount, setAdditionalAmount] = useState(1.0);
  const [fastDeliveryAmount, setFastDeliveryAmount] = useState(5.0);
  const [isFastDeliveryEnabled, setIsFastDeliveryEnabled] = useState(true);
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
        const fa = data.fast_delivery_amount_cad !== undefined ? parseFloat(data.fast_delivery_amount_cad) : 5.0;
        const fen = data.is_fast_delivery_enabled !== undefined ? Number(data.is_fast_delivery_enabled) === 1 : true;
        const en = Number(data.is_enabled) === 1;

        setSavedConfig({
          id: data.id || 1,
          base_distance_km: bd,
          base_amount_cad: ba,
          additional_amount_per_km_cad: aa,
          fast_delivery_amount_cad: fa,
          is_fast_delivery_enabled: fen ? 1 : 0,
          is_enabled: en ? 1 : 0,
          updated_at: data.updated_at || data.created_at || null
        });

        setBaseDistance(bd);
        setBaseAmount(ba);
        setAdditionalAmount(aa);
        setFastDeliveryAmount(fa);
        setIsFastDeliveryEnabled(fen);
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
      const msg = 'Base distance must be greater than 0 KM.';
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
    if (fastDeliveryAmount === null || isNaN(fastDeliveryAmount) || !isFinite(fastDeliveryAmount) || fastDeliveryAmount < 0) {
      const msg = 'Fast delivery fee cannot be negative.';
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
      fast_delivery_amount_cad: parseFloat(Number(fastDeliveryAmount).toFixed(2)),
      is_fast_delivery_enabled: isFastDeliveryEnabled ? 1 : 0,
      is_enabled: isEnabled ? 1 : 0
    };

    try {
      const res = await updateRiderDeliverySettings(payload);
      if (res.success && res.data) {
        message.success(res.message || 'Delivery charges updated successfully.');
        const d = res.data;
        setSavedConfig({
          id: d.id || 1,
          base_distance_km: parseFloat(d.base_distance_km),
          base_amount_cad: parseFloat(d.base_amount_cad),
          additional_amount_per_km_cad: parseFloat(d.additional_amount_per_km_cad),
          fast_delivery_amount_cad: parseFloat(d.fast_delivery_amount_cad !== undefined ? d.fast_delivery_amount_cad : fastDeliveryAmount),
          is_fast_delivery_enabled: Number(d.is_fast_delivery_enabled) === 1 ? 1 : 0,
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
      const calc = calculatePayout(
        d,
        baseDistance,
        baseAmount,
        additionalAmount,
        fastDeliveryAmount,
        isFastDeliveryEnabled
      );
      return {
        key: d,
        distance: `${d} km`,
        rule: calc.rule,
        standardPayout: `$${calc.standardPayout.toFixed(2)} CAD`,
        fastPayout: isFastDeliveryEnabled
          ? `$${calc.fastPayout.toFixed(2)} CAD`
          : `$${calc.standardPayout.toFixed(2)} CAD`,
        fastSurcharge: calc.fastSurcharge,
        isFastEnabled: isFastDeliveryEnabled
      };
    });
}, [baseDistance, baseAmount, additionalAmount, fastDeliveryAmount, isFastDeliveryEnabled]);

    const breakdownColumns = [
      {
        title: 'Distance',
        dataIndex: 'distance',
        key: 'distance',
        width: 110,
        render: (text) => <strong style={{ color: '#0f172a' }}>{text}</strong>
      },
      {
        title: 'Calculation Rule',
        dataIndex: 'rule',
        key: 'rule',
        render: (text) => <span style={{ color: '#475569', fontSize: 13 }}>{text}</span>
      },
      {
        title: 'Standard Payout (CAD)',
        dataIndex: 'standardPayout',
        key: 'standardPayout',
        align: 'right',
        width: 170,
        render: (text) => <strong style={{ color: '#088b46', fontSize: 13.5 }}>{text}</strong>
      },
      {
        title: (
          <span>
            <ThunderboltOutlined style={{ color: '#f59e0b', marginRight: 5 }} />
            Fast Delivery Payout (CAD)
          </span>
        ),
        dataIndex: 'fastPayout',
        key: 'fastPayout',
        align: 'right',
        width: 210,
        render: (text, record) => (
        < div >
  <strong style={{ color: '#d97706', fontSize: 13.5 }}>{text}</strong>
          {
    record.isFastEnabled && record.fastSurcharge > 0 ? (
      <div style={{ fontSize: 11, color: '#94a3b8' }}>
        (+${record.fastSurcharge.toFixed(2)} Fast Fee)
      </div>
    ) : (
      <div style={{ fontSize: 11, color: '#94a3b8' }}>
        (Fast Fee Disabled)
      </div>
    )
  }
        </div >
      )
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
              <p>Configure how much riders earn for each delivery based on distance and fast delivery pricing.</p>
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
              <span>Delivery Charge & Fast Delivery Configuration</span>
              <Space>
                {savedConfig.is_fast_delivery_enabled === 1 ? (
                  <Tag color="warning" icon={<ThunderboltOutlined />}>Fast Delivery Active</Tag>
                ) : (
                  <Tag color="default">Fast Delivery Off</Tag>
                )}
                {savedConfig.is_enabled === 1 ? (
                  <Tag color="success" icon={<CheckCircleOutlined />}>Charges Active</Tag>
                ) : (
                  <Tag color="default" icon={<CloseCircleOutlined />}>Charges Disabled</Tag>
                )}
              </Space>
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

                            {/* Input 4: Fast Delivery Pricing */}
                            <div className={styles.inputGroup}>
                              <label>
                                <ThunderboltOutlined style={{ color: '#d97706' }} />
                                4. Fast Delivery Fee (CAD)
                              </label>
                              <InputNumber
                                value={fastDeliveryAmount}
                                onChange={(val) => setFastDeliveryAmount(val !== null ? val : 0)}
                                min={0}
                                step={0.5}
                                precision={2}
                                prefix="$"
                                addonAfter="CAD"
                                style={{ width: '100%' }}
                              />
                            </div>
                          </div>

                              <div className={styles.bottomControlRow}>
                                <div className={styles.togglesGroup}>
                                  {/* Toggle 1: Global Enable */}
                                  <div className={styles.toggleContainer}>
                                    <Switch
                                      checked={isEnabled}
                                      onChange={setIsEnabled}
                                      style={{ backgroundColor: isEnabled ? '#088b46' : undefined }}
                                    />
                                    <span>Delivery Charges: {isEnabled ? 'Enabled' : 'Disabled'}</span>
                                  </div>

                                  {/* Toggle 2: Fast Delivery Pricing Enable */}
                                  <div className={styles.toggleContainer}>
                                    <Switch
                                      checked={isFastDeliveryEnabled}
                                      onChange={setIsFastDeliveryEnabled}
                                      style={{ backgroundColor: isFastDeliveryEnabled ? '#f59e0b' : undefined }}
                                    />
                                    <span>Fast Delivery Premium: {isFastDeliveryEnabled ? 'Active' : 'Disabled'}</span>
                                  </div>
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
                                    minWidth: 150
                                  }}
                                >
                                  Save Changes
                                </Button>
                              </div>

                                {/* Section 4: Current Configuration Summary */}
                                <div className={styles.statusMeta}>
                                  <span>
                                    <strong>Base Tier:</strong> {savedConfig.base_distance_km} KM (${savedConfig.base_amount_cad.toFixed(2)} CAD)
                                  </span>
                                  <span>•</span>
                                  <span>
                                    <strong>Extra KM:</strong> +${savedConfig.additional_amount_per_km_cad.toFixed(2)} CAD/KM
                                  </span>
                                  <span>•</span>
                                  <span>
                                    <strong>Fast Delivery:</strong> ${savedConfig.fast_delivery_amount_cad.toFixed(2)} CAD ({savedConfig.is_fast_delivery_enabled === 1 ? 'Active' : 'Off'})
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
                                      <span>How It Works & Live Dynamic Pricing Breakdown</span>
                                    </div>

                                      <div className={styles.formulaBox}>
                                        Standard Payout = distance &lt;= baseDistance ? baseAmount : baseAmount + Math.ceil(distance - baseDistance) * additionalAmount
                                        <br />
                                        Fast Delivery Payout = Standard Payout + (isFastDeliveryEnabled ? fastDeliveryAmount : 0)
                                      </div>

                                        <div className={styles.howItWorksText}>
                                          • <strong>Standard Delivery:</strong> For deliveries from 0 to {baseDistance} km, the rider earns <strong>${baseAmount.toFixed(2)} CAD</strong>. Beyond {baseDistance} km, each additional kilometre or fraction of a kilometre adds <strong>${additionalAmount.toFixed(2)} CAD</strong> using <code>Math.ceil()</code> on the excess distance.
                                          <br />
                                          • <strong>Fast Delivery (Express):</strong> When Fast Delivery is enabled, an extra premium of <strong>${fastDeliveryAmount.toFixed(2)} CAD</strong> is dynamically added to the delivery payout for fast-tracked orders.
                                        </div>

                                      <Table
                                        dataSource={breakdownRows}
                                        columns={breakdownColumns}
                                        pagination={false}
                                        size="small"
                                        bordered
                                      />

                                          <div className={styles.tierNote}>
                                            💡 <strong>Dynamic Preview Note:</strong> Changes to <em>Base Distance</em>, <em>Base Amount</em>, <em>Additional Amount/KM</em>, or <em>Fast Delivery Fee</em> update the calculation in the table above immediately in real time before saving.
                                          </div>
                                        </div>
                                </Spin>
                              </div>
                              );
};

                              export default RiderDeliveryCharges;
