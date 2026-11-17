import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  Form,
  Input,
  InputNumber,
  Select,
  DatePicker,
  Switch,
  Button,
  Row,
  Col,
  Upload,
  Card,
  Tag,
  Divider,
  message,
  Space,
  Tooltip
} from 'antd';
import {
  ArrowLeftOutlined,
  TagOutlined,
  DollarOutlined,
  PercentageOutlined,
  CarOutlined,
  CalendarOutlined,
  UploadOutlined,
  CheckCircleOutlined,
  CopyOutlined,
  ThunderboltOutlined,
  ScissorOutlined,
  InfoCircleOutlined,
  SaveOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { createOffer, getOfferById, updateOffer } from '../../services/apiService';
import styles from './offers.module.scss';

const { TextArea } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

const CreateOffer = () => {
  const navigate = useNavigate();
  const { id: paramId } = useParams();
  const [searchParams] = useSearchParams();
  const offerId = paramId || searchParams.get('id');
  const isEditMode = Boolean(offerId);

  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [bannerFile, setBannerFile] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);

  // Live Preview Form State
  const [previewValues, setPreviewValues] = useState({
    offer_code: 'GOGREEN20',
    title: '20% Off Welcome Discount',
    description: 'Get 20% off up to $15 on your first fresh grocery orders.',
    offer_type: 'percentage',
    discount_value: 20,
    min_order_amount: 30,
    max_discount_amount: 15,
    start_date: dayjs(),
    end_date: dayjs().add(30, 'day'),
    usage_limit_per_customer: 1,
    status: 1
  });

  // Interactive Live Cart Calculator State
  const [testCartAmount, setTestCartAmount] = useState(50);

  // Load existing offer for Edit Mode
  useEffect(() => {
    if (isEditMode) {
      setLoading(true);
      getOfferById(offerId)
        .then((res) => {
          if (res.success && res.data) {
            const o = res.data;
            const start = o.start_date ? dayjs(o.start_date) : dayjs();
            const end = o.end_date ? dayjs(o.end_date) : dayjs().add(30, 'day');

            form.setFieldsValue({
              offer_code: o.offer_code,
              title: o.title,
              description: o.description,
              offer_type: o.offer_type,
              discount_value: parseFloat(o.discount_value),
              min_order_amount: parseFloat(o.min_order_amount) || 0,
              max_discount_amount: o.max_discount_amount ? parseFloat(o.max_discount_amount) : undefined,
              date_range: [start, end],
              usage_limit_per_customer: o.usage_limit_per_customer || 1,
              total_usage_limit: o.total_usage_limit || undefined,
              status: Number(o.status) === 1
            });

            setPreviewValues({
              offer_code: o.offer_code,
              title: o.title,
              description: o.description,
              offer_type: o.offer_type,
              discount_value: parseFloat(o.discount_value),
              min_order_amount: parseFloat(o.min_order_amount) || 0,
              max_discount_amount: o.max_discount_amount ? parseFloat(o.max_discount_amount) : null,
              start_date: start,
              end_date: end,
              usage_limit_per_customer: o.usage_limit_per_customer || 1,
              status: Number(o.status) === 1 ? 1 : 0
            });

            if (o.banner_image) {
              setBannerPreview(o.banner_image);
            }
          } else {
            message.error(res.error || 'Failed to load offer details');
          }
        })
        .catch(() => message.error('Error fetching offer'))
        .finally(() => setLoading(false));
    }
  }, [isEditMode, offerId, form]);

  // Handle form change for live preview
  const handleValuesChange = (_, allValues) => {
    setPreviewValues((prev) => ({
      ...prev,
      offer_code: allValues.offer_code ? allValues.offer_code.toUpperCase() : prev.offer_code,
      title: allValues.title || prev.title,
      description: allValues.description,
      offer_type: allValues.offer_type || prev.offer_type,
      discount_value: allValues.discount_value !== undefined ? allValues.discount_value : prev.discount_value,
      min_order_amount: allValues.min_order_amount !== undefined ? allValues.min_order_amount : prev.min_order_amount,
      max_discount_amount: allValues.max_discount_amount,
      start_date: allValues.date_range?.[0] || prev.start_date,
      end_date: allValues.date_range?.[1] || prev.end_date,
      usage_limit_per_customer: allValues.usage_limit_per_customer || prev.usage_limit_per_customer,
      status: allValues.status ? 1 : 0
    }));
  };

  // Generate random attractive promo code
  const handleGenerateRandomCode = () => {
    const prefixes = ['GOGREEN', 'SAVE', 'DEAL', 'SUPER', 'FRESH', 'OFFER'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const num = previewValues.discount_value > 0 ? previewValues.discount_value : Math.floor(10 + Math.random() * 40);
    const code = `${prefix}${num}`;
    form.setFieldsValue({ offer_code: code });
    setPreviewValues((prev) => ({ ...prev, offer_code: code }));
  };

  // Quick preset duration buttons
  const setQuickDuration = (days) => {
    const start = dayjs();
    const end = dayjs().add(days, 'day');
    form.setFieldsValue({ date_range: [start, end] });
    setPreviewValues((prev) => ({ ...prev, start_date: start, end_date: end }));
  };

  // Handle image upload
  const handleImageChange = ({ file }) => {
    if (file.status === 'removed') {
      setBannerFile(null);
      setBannerPreview(null);
      return;
    }
    const originFile = file.originFileObj || file;
    setBannerFile(originFile);
    setBannerPreview(URL.createObjectURL(originFile));
  };

  // Calculate live test savings
  const calculateTestSavings = () => {
    const cart = parseFloat(testCartAmount) || 0;
    const minOrder = parseFloat(previewValues.min_order_amount) || 0;

    if (cart < minOrder) {
      return {
        isEligible: false,
        discount: 0,
        final: cart,
        reason: `Add $${(minOrder - cart).toFixed(2)} more to reach min order of $${minOrder.toFixed(2)}`
      };
    }

    let discount = 0;
    if (previewValues.offer_type === 'percentage') {
      const raw = (cart * (parseFloat(previewValues.discount_value) || 0)) / 100;
      discount = previewValues.max_discount_amount ? Math.min(raw, parseFloat(previewValues.max_discount_amount)) : raw;
    } else if (previewValues.offer_type === 'flat_discount') {
      discount = Math.min(parseFloat(previewValues.discount_value) || 0, cart);
    } else if (previewValues.offer_type === 'free_delivery') {
      discount = 4.99; // Standard mock delivery fee
    }

    discount = parseFloat(discount.toFixed(2));
    const final = Math.max(0, parseFloat((cart - discount).toFixed(2)));

    return {
      isEligible: true,
      discount,
      final,
      reason: null
    };
  };

  const testSavings = calculateTestSavings();

  // Submit Handler
  const onFinish = async (values) => {
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('offer_code', values.offer_code.toUpperCase().trim());
      formData.append('title', values.title.trim());
      if (values.description) formData.append('description', values.description.trim());
      formData.append('offer_type', values.offer_type);
      formData.append('discount_value', values.discount_value);
      formData.append('min_order_amount', values.min_order_amount || 0);
      if (values.max_discount_amount !== undefined && values.max_discount_amount !== null) {
        formData.append('max_discount_amount', values.max_discount_amount);
      }
      formData.append('start_date', values.date_range[0].format('YYYY-MM-DD'));
      formData.append('end_date', values.date_range[1].format('YYYY-MM-DD'));
      formData.append('usage_limit_per_customer', values.usage_limit_per_customer || 1);
      if (values.total_usage_limit) {
        formData.append('total_usage_limit', values.total_usage_limit);
      }
      formData.append('status', values.status ? 1 : 0);

      if (bannerFile) {
        formData.append('banner_image', bannerFile);
      }

      let res;
      if (isEditMode) {
        res = await updateOffer(offerId, formData);
      } else {
        res = await createOffer(formData);
      }

      if (res.success) {
        message.success(isEditMode ? 'Offer updated successfully!' : 'Offer created and published successfully!');
        navigate('/offers');
      } else {
        message.error(res.error || 'Failed to save offer');
      }
    } catch (err) {
      console.error(err);
      message.error('An unexpected error occurred while saving the offer');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* Header Card */}
      <div className={styles.headerCard}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/offers')}
            style={{ borderRadius: 8 }}
          />
          <div className={styles.titleArea}>
            <h2>{isEditMode ? 'Edit Customer Offer' : 'Create Customer Offer & Promo Code'}</h2>
            <p>
              Generate promotional discount codes, percentage vouchers, and free delivery perks for customer mobile apps.
            </p>
          </div>
        </div>

        <Space>
          <Button onClick={() => navigate('/offers')} style={{ borderRadius: 8 }}>
            Cancel
          </Button>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            loading={submitting}
            onClick={() => form.submit()}
            style={{
              backgroundColor: '#088b46',
              borderColor: '#088b46',
              borderRadius: 8,
              fontWeight: 700,
              padding: '0 20px',
              height: 40,
              boxShadow: '0 2px 6px rgba(8, 139, 70, 0.25)'
            }}
          >
            {isEditMode ? 'Update Offer' : 'Publish Offer'}
          </Button>
        </Space>
      </div>

      {/* Main Content Form & Live Preview */}
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          offer_code: 'GOGREEN20',
          title: '20% Off Welcome Discount',
          description: 'Get 20% off up to $15 on your first fresh grocery orders.',
          offer_type: 'percentage',
          discount_value: 20,
          min_order_amount: 30,
          max_discount_amount: 15,
          date_range: [dayjs(), dayjs().add(30, 'day')],
          usage_limit_per_customer: 1,
          status: true
        }}
        onValuesChange={handleValuesChange}
        onFinish={onFinish}
      >
        <div className={styles.formRow}>
          {/* Left Column: Form Configuration */}
          <div className={styles.formMainCol}>
            {/* Section 1: Offer Identity */}
            <div className={styles.sectionCard}>
              <div className={styles.sectionHeader}>
                <TagOutlined style={{ color: '#088b46' }} />
                <span>Offer Identity & Promo Code</span>
              </div>

              <Row gutter={16}>
                <Col xs={24} md={14}>
                  <Form.Item
                    name="title"
                    label="Offer Title (Visible to Customer)"
                    rules={[{ required: true, message: 'Please enter offer title' }]}
                  >
                    <Input placeholder="e.g. 20% Off First Grocery Order" maxLength={100} style={{ borderRadius: 6 }} />
                  </Form.Item>
                </Col>

                <Col xs={24} md={10}>
                  <Form.Item
                    name="offer_code"
                    label={
                      <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                        <span>Promo Code</span>
                        <a
                          onClick={handleGenerateRandomCode}
                          style={{ fontSize: 11.5, color: '#088b46', fontWeight: 600 }}
                        >
                          ⚡ Auto-Generate
                        </a>
                      </div>
                    }
                    rules={[
                      { required: true, message: 'Promo code is required' },
                      { pattern: /^[A-Za-z0-9_-]+$/, message: 'Alphanumeric characters only' }
                    ]}
                  >
                    <Input
                      placeholder="e.g. WELCOME20"
                      maxLength={30}
                      style={{ textTransform: 'uppercase', fontFamily: 'monospace', fontWeight: 700, borderRadius: 6 }}
                      prefix={<ScissorOutlined style={{ color: '#94a3b8' }} />}
                    />
                  </Form.Item>
                </Col>

                <Col xs={24}>
                  <Form.Item name="description" label="Short Description & Terms (App Display)">
                    <TextArea
                      rows={2}
                      placeholder="e.g. Enjoy 20% discount up to $15 on all fresh fruits, dairy and vegetables."
                      maxLength={250}
                      style={{ borderRadius: 6 }}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </div>

            {/* Section 2: Discount Value & Cart Conditions */}
            <div className={styles.sectionCard}>
              <div className={styles.sectionHeader}>
                <DollarOutlined style={{ color: '#2563eb' }} />
                <span>Discount Type & Cart Rules</span>
              </div>

              <Row gutter={16}>
                <Col xs={24} md={8}>
                  <Form.Item
                    name="offer_type"
                    label="Discount Type"
                    rules={[{ required: true, message: 'Select discount type' }]}
                  >
                    <Select style={{ borderRadius: 6 }}>
                      <Option value="percentage">Percentage Discount (%)</Option>
                      <Option value="flat_discount">Flat Amount Discount ($)</Option>
                      <Option value="free_delivery">Free Delivery ($0 Fee)</Option>
                    </Select>
                  </Form.Item>
                </Col>

                <Col xs={24} md={8}>
                  <Form.Item
                    name="discount_value"
                    label={
                      previewValues.offer_type === 'percentage'
                        ? 'Discount Percent (%)'
                        : previewValues.offer_type === 'flat_discount'
                        ? 'Flat Amount ($)'
                        : 'Delivery Fee Waived ($)'
                    }
                    rules={[{ required: true, message: 'Please enter discount value' }]}
                  >
                    <InputNumber
                      min={0}
                      max={previewValues.offer_type === 'percentage' ? 100 : 10000}
                      style={{ width: '100%', borderRadius: 6 }}
                      addonAfter={previewValues.offer_type === 'percentage' ? '%' : '$'}
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} md={8}>
                  <Form.Item name="min_order_amount" label="Minimum Cart Amount ($)">
                    <InputNumber
                      min={0}
                      placeholder="0 (No minimum)"
                      style={{ width: '100%', borderRadius: 6 }}
                      addonBefore="$"
                    />
                  </Form.Item>
                </Col>

                {previewValues.offer_type === 'percentage' && (
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="max_discount_amount"
                      label="Maximum Discount Cap ($)"
                      tooltip="Optional upper limit for percentage discount (e.g. 20% off up to max $15)"
                    >
                      <InputNumber
                        min={0}
                        placeholder="e.g. 15.00 (Leave blank for no limit)"
                        style={{ width: '100%', borderRadius: 6 }}
                        addonBefore="$"
                      />
                    </Form.Item>
                  </Col>
                )}
              </Row>
            </div>

            {/* Section 3: Validity Schedule & Redemptions */}
            <div className={styles.sectionCard}>
              <div className={styles.sectionHeader}>
                <CalendarOutlined style={{ color: '#d97706' }} />
                <span>Validity & Redemption Limits</span>
              </div>

              <Row gutter={16}>
                <Col xs={24} md={14}>
                  <Form.Item
                    name="date_range"
                    label={
                      <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                        <span>Offer Valid Period (Start to End Date)</span>
                        <Space size="small">
                          <Tag
                            color="blue"
                            style={{ cursor: 'pointer', margin: 0, fontSize: 11 }}
                            onClick={() => setQuickDuration(7)}
                          >
                            7 Days
                          </Tag>
                          <Tag
                            color="blue"
                            style={{ cursor: 'pointer', margin: 0, fontSize: 11 }}
                            onClick={() => setQuickDuration(30)}
                          >
                            30 Days
                          </Tag>
                          <Tag
                            color="blue"
                            style={{ cursor: 'pointer', margin: 0, fontSize: 11 }}
                            onClick={() => setQuickDuration(90)}
                          >
                            90 Days
                          </Tag>
                        </Space>
                      </div>
                    }
                    rules={[{ required: true, message: 'Please select valid start and end dates' }]}
                  >
                    <RangePicker style={{ width: '100%', borderRadius: 6 }} format="YYYY-MM-DD" />
                  </Form.Item>
                </Col>

                <Col xs={24} md={5}>
                  <Form.Item
                    name="usage_limit_per_customer"
                    label="Uses Per Customer"
                    tooltip="How many times a single customer can redeem this offer (typically 1 for welcome deals)"
                    rules={[{ required: true, message: 'Enter limit' }]}
                  >
                    <InputNumber min={1} max={100} style={{ width: '100%', borderRadius: 6 }} addonAfter="times" />
                  </Form.Item>
                </Col>

                <Col xs={24} md={5}>
                  <Form.Item
                    name="total_usage_limit"
                    label="Total Global Cap"
                    tooltip="Optional global redemptions limit (e.g. first 500 customers to redeem)"
                  >
                    <InputNumber min={1} placeholder="Unlimited" style={{ width: '100%', borderRadius: 6 }} />
                  </Form.Item>
                </Col>

                <Col xs={24}>
                  <Divider style={{ margin: '8px 0 16px 0' }} />
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontWeight: 600, color: '#0f172a', fontSize: 13.5 }}>Offer Active Status</div>
                      <div style={{ fontSize: 12, color: '#64748b' }}>
                        When turned off, this offer is hidden from customer apps and cannot be applied at checkout.
                      </div>
                    </div>
                    <Form.Item name="status" valuePropName="checked" style={{ margin: 0 }}>
                      <Switch checkedChildren="Active" unCheckedChildren="Inactive" style={{ backgroundColor: previewValues.status ? '#088b46' : undefined }} />
                    </Form.Item>
                  </div>
                </Col>
              </Row>
            </div>

            {/* Section 4: Optional Mobile Banner */}
            <div className={styles.sectionCard}>
              <div className={styles.sectionHeader}>
                <UploadOutlined style={{ color: '#7c3aed' }} />
                <span>Mobile App Banner (Optional)</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                <Upload
                  name="banner_image"
                  listType="picture"
                  maxCount={1}
                  beforeUpload={() => false}
                  onChange={handleImageChange}
                  showUploadList={false}
                >
                  <Button icon={<UploadOutlined />} style={{ borderRadius: 6 }}>
                    Select Banner Image
                  </Button>
                </Upload>

                {bannerPreview && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <img
                      src={bannerPreview}
                      alt="Banner Preview"
                      style={{ height: 48, width: 90, objectFit: 'cover', borderRadius: 6, border: '1px solid #e2e8f0' }}
                    />
                    <Button size="small" danger type="text" onClick={() => { setBannerFile(null); setBannerPreview(null); }}>
                      Remove
                    </Button>
                  </div>
                )}
                {!bannerPreview && (
                  <span style={{ fontSize: 12, color: '#94a3b8' }}>
                    Recommended size: 600x300px (JPG/PNG). Used in customer app promotional carousels.
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Customer Mobile App Live Ticket Preview */}
          <div className={styles.previewSideCol}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
              <ThunderboltOutlined style={{ color: '#088b46' }} />
              Live Customer App Voucher Preview
            </div>

            {/* Mobile Ticket Simulation */}
            <div className={styles.mobileCouponTicket}>
              <div className={styles.ticketGlow} />

              <div className={styles.ticketTop}>
                <div className={styles.ticketBadge}>
                  {previewValues.offer_type === 'percentage'
                    ? 'Percentage Deal'
                    : previewValues.offer_type === 'flat_discount'
                    ? 'Flat Savings'
                    : 'Free Delivery'}
                </div>
                {previewValues.status === 1 ? (
                  <Tag color="success" style={{ margin: 0, fontWeight: 600 }}>Active</Tag>
                ) : (
                  <Tag color="default" style={{ margin: 0, fontWeight: 600 }}>Inactive</Tag>
                )}
              </div>

              <div className={styles.ticketDiscount}>
                {previewValues.offer_type === 'percentage'
                  ? `${previewValues.discount_value || 0}% OFF`
                  : previewValues.offer_type === 'flat_discount'
                  ? `FLAT $${previewValues.discount_value || 0} OFF`
                  : 'FREE DELIVERY'}
              </div>

              <div className={styles.ticketTitle}>
                {previewValues.title || 'Special Promotion Deal'}
              </div>

              <div className={styles.ticketDesc}>
                {previewValues.description || 'Valid on fresh fruits, groceries and daily items.'}
              </div>

              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.75)', display: 'flex', justifyContent: 'space-between' }}>
                <span>Min Order: ${parseFloat(previewValues.min_order_amount || 0).toFixed(2)}</span>
                {previewValues.max_discount_amount && (
                  <span>Max Savings: ${parseFloat(previewValues.max_discount_amount).toFixed(2)}</span>
                )}
              </div>

              <div className={styles.ticketDashedLine} />

              <div className={styles.ticketBottom}>
                <div className={styles.codeBox}>
                  <ScissorOutlined style={{ fontSize: 13, transform: 'rotate(-45deg)' }} />
                  {previewValues.offer_code || 'CODE'}
                </div>

                <div className={styles.applyBtn}>
                  APPLY IN APP
                </div>
              </div>

              <div style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.7)', marginTop: 12, textAlign: 'center' }}>
                Expires {dayjs(previewValues.end_date).format('MMM D, YYYY')} • Limit {previewValues.usage_limit_per_customer || 1}x/customer
              </div>
            </div>

            {/* Interactive Cart Calculation Tester */}
            <div className={styles.interactiveTester}>
              <div style={{ fontWeight: 700, fontSize: 12.5, color: '#0f172a', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                <CheckCircleOutlined style={{ color: '#088b46' }} />
                Instant Cart Tester (Try Different Cart Values)
              </div>

              <div style={{ marginBottom: 10 }}>
                <label style={{ fontSize: 11.5, color: '#64748b', display: 'block', marginBottom: 4 }}>
                  Customer Cart Total ($):
                </label>
                <InputNumber
                  value={testCartAmount}
                  onChange={(val) => setTestCartAmount(val || 0)}
                  min={0}
                  addonBefore="$"
                  style={{ width: '100%', borderRadius: 6 }}
                />
              </div>

              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 8, padding: '10px 12px', fontSize: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, color: '#475569' }}>
                  <span>Cart Subtotal:</span>
                  <span>${parseFloat(testCartAmount || 0).toFixed(2)}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, color: testSavings.isEligible ? '#16a34a' : '#94a3b8', fontWeight: 600 }}>
                  <span>Promo Discount ({previewValues.offer_code}):</span>
                  <span>{testSavings.isEligible ? `-$${testSavings.discount.toFixed(2)}` : '$0.00'}</span>
                </div>

                <Divider style={{ margin: '6px 0' }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 13, color: '#0f172a' }}>
                  <span>Customer Pays:</span>
                  <span style={{ color: '#088b46' }}>${testSavings.final.toFixed(2)}</span>
                </div>

                {testSavings.reason && (
                  <div style={{ marginTop: 6, fontSize: 11, color: '#d97706', fontWeight: 600 }}>
                    ⚠️ {testSavings.reason}
                  </div>
                )}
                {testSavings.isEligible && (
                  <div style={{ marginTop: 6, fontSize: 11, color: '#16a34a', fontWeight: 600 }}>
                    ✓ Promo applicable! Customer saves ${testSavings.discount.toFixed(2)}.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Form>
    </div>
  );
};

export default CreateOffer;

