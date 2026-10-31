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
  PercentageOutlined,
  SaveOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  CalculatorOutlined,
  InfoCircleOutlined,
  DollarOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import {
  getVendorCommissionSettings,
  updateVendorCommissionSettings
} from '../../services/apiService';
import styles from './vendorCommission.module.scss';

// Standard example sales from specification
const SAMPLE_SALES = [100, 150, 200];

const VendorCommission = () => {
  // Saved database configuration
  const [savedConfig, setSavedConfig] = useState({
    id: 1,
    commission_percentage: 15.0,
    is_enabled: 1,
    updated_at: null
  });

  // Editable configuration inputs
  const [commissionPercentage, setCommissionPercentage] = useState(15.0);
  const [isEnabled, setIsEnabled] = useState(true);

  // Live Calculator state
  const [calcSubtotal, setCalcSubtotal] = useState(150.0);

  // Status & loading
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Fetch settings from API
  const fetchSettings = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await getVendorCommissionSettings();
      if (res.success && res.data) {
        const data = res.data;
        const pct = parseFloat(data.commission_percentage) !== undefined && !isNaN(parseFloat(data.commission_percentage))
          ? parseFloat(data.commission_percentage)
          : 15.0;
        const en = Number(data.is_enabled) === 1;

        setSavedConfig({
          id: data.id || 1,
          commission_percentage: pct,
          is_enabled: en ? 1 : 0,
          updated_at: data.updated_at || data.created_at || null
        });

        setCommissionPercentage(pct);
        setIsEnabled(en);
      } else {
        message.error(res.error || 'Failed to load vendor commission settings.');
      }
    } catch (err) {
      console.error(err);
      message.error('Error fetching vendor commission settings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  // Save changes handler
  const handleSave = async () => {
    // Validation: Percentage between 0 and 100
    if (
      commissionPercentage === null ||
      commissionPercentage === undefined ||
      isNaN(commissionPercentage) ||
      !isFinite(commissionPercentage)
    ) {
      const msg = 'Commission percentage must be a valid numeric value.';
      setErrorMsg(msg);
      message.error(msg);
      return;
    }

    if (commissionPercentage < 0 || commissionPercentage > 100) {
      const msg = 'Commission percentage must be between 0% and 100%.';
      setErrorMsg(msg);
      message.error(msg);
      return;
    }

    setErrorMsg('');
    setSaving(true);

    const payload = {
      commission_percentage: parseFloat(Number(commissionPercentage).toFixed(2)),
      is_enabled: isEnabled ? 1 : 0
    };

    try {
      const res = await updateVendorCommissionSettings(payload);
      if (res.success && res.data) {
        const data = res.data;
        const pct = parseFloat(data.commission_percentage) || payload.commission_percentage;
        const en = Number(data.is_enabled) === 1;

        setSavedConfig({
          id: data.id || 1,
          commission_percentage: pct,
          is_enabled: en ? 1 : 0,
          updated_at: data.updated_at || new Date().toISOString()
        });

        message.success('Vendor commission settings updated successfully!');
      } else {
        const err = res.error || 'Failed to update commission settings.';
        setErrorMsg(err);
        message.error(err);
      }
    } catch (err) {
      console.error(err);
      const errTxt = 'Network or server error while updating settings.';
      setErrorMsg(errTxt);
      message.error(errTxt);
    } finally {
      setSaving(false);
    }
  };

  // Section 2: Examples Table Calculations (updates dynamically with entered percentage and toggle)
  const exampleRows = useMemo(() => {
    const activePct = isEnabled ? Math.max(0, parseFloat(commissionPercentage) || 0) : 0;
    return SAMPLE_SALES.map((subtotal, idx) => {
      const commissionAmt = isEnabled ? parseFloat(((subtotal * activePct) / 100).toFixed(2)) : 0;
      const vendorNet = parseFloat((subtotal - commissionAmt).toFixed(2));

      return {
        key: idx,
        subtotal: `$${subtotal.toFixed(2)} CAD`,
        rate: isEnabled ? `${activePct.toFixed(2)}%` : '0.00% (Disabled)',
        commission: `$${commissionAmt.toFixed(2)} CAD`,
        vendorNet: `$${vendorNet.toFixed(2)} CAD`
      };
    });
  }, [commissionPercentage, isEnabled]);

  const exampleColumns = [
    {
      title: 'Vendor Item Subtotal',
      dataIndex: 'subtotal',
      key: 'subtotal',
      render: (text) => <strong style={{ color: '#0f172a' }}>{text}</strong>
    },
    {
      title: 'Applied Rate',
      dataIndex: 'rate',
      key: 'rate',
      render: (text) => <Tag color={isEnabled ? 'blue' : 'default'}>{text}</Tag>
    },
    {
      title: 'Admin Commission (CAD)',
      dataIndex: 'commission',
      key: 'commission',
      render: (text) => <strong style={{ color: '#ea580c' }}>{text}</strong>
    },
    {
      title: 'Vendor Net Earnings (CAD)',
      dataIndex: 'vendorNet',
      key: 'vendorNet',
      align: 'right',
      render: (text) => <strong style={{ color: '#088b46', fontSize: 14 }}>{text}</strong>
    }
  ];

  // Section 3: Live Calculator Calculations
  const liveCalculation = useMemo(() => {
    const subtotal = Math.max(0, parseFloat(calcSubtotal) || 0);
    const activePct = isEnabled ? Math.max(0, parseFloat(commissionPercentage) || 0) : 0;
    const adminCommission = isEnabled ? parseFloat(((subtotal * activePct) / 100).toFixed(2)) : 0.0;
    const vendorEarnings = parseFloat((subtotal - adminCommission).toFixed(2));

    return {
      subtotal,
      appliedPercentage: activePct,
      adminCommission,
      vendorEarnings
    };
  }, [calcSubtotal, commissionPercentage, isEnabled]);

  const lastUpdated = savedConfig.updated_at
    ? dayjs(savedConfig.updated_at).format('MMM D, YYYY • hh:mm A')
    : 'Not yet updated';

  return (
    <div className={styles.container}>
      {/* Page Heading */}
      <div className={styles.headerSection}>
        <div className={styles.titleBox}>
          <h2>
            <PercentageOutlined style={{ color: '#088b46', marginRight: 8 }} />
            Vendor Commission Settings
          </h2>
          <p>Configure the global commission percentage charged to vendors for completed orders.</p>
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
        {/* SECTION 1: Commission Configuration */}
        <div className={styles.card}>
          <div className={styles.cardTitle}>
            <span>Section 1: Commission Configuration</span>
            {savedConfig.is_enabled === 1 ? (
              <Tag color="success" icon={<CheckCircleOutlined />}>Active</Tag>
            ) : (
              <Tag color="default" icon={<CloseCircleOutlined />}>Disabled</Tag>
            )}
          </div>

          <div className={styles.inputsRow}>
            {/* Commission Percentage Input */}
            <div className={styles.inputGroup}>
              <label>Commission Percentage (%)</label>
              <InputNumber
                value={commissionPercentage}
                onChange={(val) => setCommissionPercentage(val !== null ? val : 0)}
                min={0}
                max={100}
                step={0.5}
                precision={2}
                addonAfter="%"
                style={{ width: '100%', maxWidth: 320 }}
              />
              <span className={styles.hint}>
                Default: 15.00%. Enter an applicable percentage between 0.00% and 100.00%.
              </span>
            </div>
          </div>

          <div className={styles.bottomControlRow}>
            <div className={styles.toggleContainer}>
              <Switch
                checked={isEnabled}
                onChange={setIsEnabled}
                style={{ backgroundColor: isEnabled ? '#088b46' : undefined }}
              />
              <span>{isEnabled ? 'Commission Enabled (Active)' : 'Commission Disabled (0% applied)'}</span>
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

          {/* Configuration inline status */}
          <div className={styles.statusMeta}>
            <span>
              <strong>Saved Configuration:</strong> {savedConfig.commission_percentage.toFixed(2)}% Global Commission
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

        {/* SECTION 2: How It Works */}
        <div className={styles.card}>
          <div className={styles.cardTitle}>
            <span>Section 2: How It Works</span>
          </div>

          <div className={styles.formulaBox}>
            Commission = Vendor Item Subtotal × Commission Percentage / 100
            <br />
            Vendor Net Earnings = Vendor Item Subtotal - Commission
          </div>

          <div className={styles.howItWorksText}>
            Admin commission is calculated strictly from the <strong>vendor item subtotal</strong> (after applicable item discounts), excluding delivery charges, tax, and customer tips. When commission is disabled, 0% is charged and 100% of the item subtotal goes to the vendor. All amounts are calculated in <strong>CAD</strong>.
          </div>

          <Table
            dataSource={exampleRows}
            columns={exampleColumns}
            pagination={false}
            size="small"
            bordered
          />
        </div>

        {/* SECTION 3: Live Commission Calculator */}
        <div className={styles.card}>
          <div className={styles.cardTitle}>
            <span>
              <CalculatorOutlined style={{ marginRight: 8, color: '#088b46' }} />
              Section 3: Live Commission Calculator
            </span>
          </div>

          <div className={styles.calcContainer}>
            <div className={styles.calcInputs}>
              <div className={styles.inputGroup}>
                <label>Order Subtotal (CAD)</label>
                <InputNumber
                  value={calcSubtotal}
                  onChange={(val) => setCalcSubtotal(val !== null ? val : 0)}
                  min={0}
                  step={10}
                  precision={2}
                  prefix="$"
                  addonAfter="CAD"
                  style={{ width: '100%' }}
                />
                <span className={styles.hint}>
                  Enter an example order subtotal to test earnings.
                </span>
              </div>
            </div>

            <div>
              <div className={styles.statGrid}>
                {/* 1. Commission Percentage */}
                <div className={`${styles.statCard} ${styles.info}`}>
                  <div className={styles.statLabel}>Commission Percentage</div>
                  <div className={styles.statValue}>
                    {liveCalculation.appliedPercentage.toFixed(2)}%
                  </div>
                  <div className={styles.statSubtext}>
                    {isEnabled ? 'Active Rate' : 'Disabled (0% applied)'}
                  </div>
                </div>

                {/* 2. Admin Commission Amount */}
                <div className={`${styles.statCard} ${styles.secondary}`}>
                  <div className={styles.statLabel}>Admin Commission</div>
                  <div className={styles.statValue}>
                    ${liveCalculation.adminCommission.toFixed(2)} CAD
                  </div>
                  <div className={styles.statSubtext}>
                    {liveCalculation.appliedPercentage.toFixed(2)}% of ${liveCalculation.subtotal.toFixed(2)}
                  </div>
                </div>

                {/* 3. Vendor Net Earnings */}
                <div className={`${styles.statCard} ${styles.primary}`}>
                  <div className={styles.statLabel}>Vendor Net Earnings</div>
                  <div className={styles.statValue}>
                    ${liveCalculation.vendorEarnings.toFixed(2)} CAD
                  </div>
                  <div className={styles.statSubtext}>
                    Subtotal − Admin Commission
                  </div>
                </div>
              </div>

              <div className={styles.calcFormulaResult}>
                📊 <strong>Calculation Breakdown:</strong> ${liveCalculation.subtotal.toFixed(2)} CAD sale at{' '}
                {liveCalculation.appliedPercentage.toFixed(2)}% commission ={' '}
                <strong>${liveCalculation.adminCommission.toFixed(2)} CAD</strong> admin commission, leaving{' '}
                <strong>${liveCalculation.vendorEarnings.toFixed(2)} CAD</strong> vendor net earnings.
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 4: Current Configuration */}
        <div className={styles.card}>
          <div className={styles.cardTitle}>
            <span>Section 4: Current Configuration</span>
          </div>

          <div className={styles.currentConfigGrid}>
            <div className={styles.configItem}>
              <div className={styles.configLabel}>Saved Commission Percentage</div>
              <div className={styles.configValue}>
                {savedConfig.commission_percentage.toFixed(2)}%
              </div>
            </div>

            <div className={styles.configItem}>
              <div className={styles.configLabel}>Status</div>
              <div className={styles.configValue}>
                {savedConfig.is_enabled === 1 ? (
                  <Tag color="success" style={{ fontSize: 13, padding: '2px 8px' }}>
                    Active (Enabled)
                  </Tag>
                ) : (
                  <Tag color="default" style={{ fontSize: 13, padding: '2px 8px' }}>
                    Disabled
                  </Tag>
                )}
              </div>
            </div>

            <div className={styles.configItem}>
              <div className={styles.configLabel}>Last Updated</div>
              <div className={styles.configValue} style={{ fontSize: 14 }}>
                {lastUpdated}
              </div>
            </div>
          </div>
        </div>
      </Spin>
    </div>
  );
};

export default VendorCommission;

