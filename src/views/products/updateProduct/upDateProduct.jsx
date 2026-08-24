import React, { useState, useEffect } from "react";
import { Form, Input, Select, Upload, Button, Space, message, Checkbox, Switch, InputNumber, Modal as AntModal, Slider, Card, Row, Col, Tag, Tooltip } from "antd";
import { PlusOutlined, MinusCircleOutlined, UploadOutlined, DollarOutlined, ArrowLeftOutlined, SaveOutlined, PictureOutlined, ShopOutlined, AppstoreOutlined, TagsOutlined } from "@ant-design/icons";
import { getAllCategories, getAllSubCategoriesbyID, productfetchBrands, addProduct, getProductById } from "../../../services/apiService";
import Cropper from 'react-easy-crop';
import imageCompression from 'browser-image-compression';
import ProductVariants from "../components/ProductVariants";
import { unitOptions, quantityOptions } from "../components/options";
import Addons from "../components/Addons";
import { useParams, useNavigate } from "react-router-dom";
import { formatPrice } from "../../../services/utils/gen_utility";
import "../../../assets/scss/pages/uploder_override.scss";
import useUpdateProduct from "./hooks/useUpdateProduct";
import PricePreview from "../viewSingleProduct/components/PricePreview";
import { useWatch } from "antd/es/form/Form";

const { Option } = Select;
const { Dragger } = Upload;

const UpdateProduct = () => {                   
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams();
  const [productdata, setProductdata] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      const response = await getProductById(id);
      if (response.success) {
        const product = response.product;
        setProductdata(product);     
        handleCategoryChange(product?.category_id, false);
      }
    };
    fetchProduct();
  }, [id]);

  const {
    categories,
    brands,
    subCategories,
    vendors,
    selectedVendor,
    setSelectedVendor,
    handleVendorChange,
    showModal,
    setShowModal,
    loading,
    galleryImages,
    galleryPreviews,
    handleCategoryChange,
    handleGalleryDraggerChange,
    handleRemoveGalleryImage,
    galleryDraggerProps,
    handleFinish,
    hasVariants,
    setHasVariants,
    hasAddOns,
    setHasAddOns,
    variants,
    addVariant,
    removeVariant,
    updateVariant,
    addAddOn,
    removeAddOn,
    updateAddOn,
    editingVariantIdx,
    newVariantDraft,
    setNewVariantDraft,
    startEditVariant,
    saveEditVariant,
    cancelEditVariant,
    saveNewVariant,
    addons,
    setAddons,
    editingAddonIdx,
    setEditingAddonIdx,
    newAddonDraft,
    setNewAddonDraft,
    startEditAddon,
    saveEditAddon,
    cancelEditAddon,
    saveNewAddon,
    removeAddon,
    updateAddon,
    productImage,
    handleImageChange,
    selectedUnit,
    setSelectedUnit,
    normFile,
    handleUnitChange,
    validateFileUpload,
    uploadProps,
    discountPercent,
    setDiscountPercent,
    checkvarient
  } = useUpdateProduct(form, productdata);

  const enableDiscount = useWatch('enable_discount', form);
  const price = useWatch('price', form);
  const discountPrice = useWatch('discount_price', form);
  const hasvarientcheck = useWatch('has_variants', form);
  const discount_Percent_watch = useWatch('discount_percent', form);

  // Cropper setup
  const ASPECT_RATIO = 3 / 2;
  const OUTPUT_WIDTH = 1156;
  const OUTPUT_HEIGHT = Math.round(OUTPUT_WIDTH / ASPECT_RATIO);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [rawImageUrl, setRawImageUrl] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [cropContext, setCropContext] = useState({ type: null });
  const CROP_CONTAINER_WIDTH = 640;
  const CROP_CONTAINER_HEIGHT = 400;
  const [cropScale, setCropScale] = useState(0.8);

  const onCropComplete = (_, croppedPixels) => setCroppedAreaPixels(croppedPixels);

  const getCroppedBlob = (imageSrc, cropPixels) => new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) { reject(new Error('Canvas not supported')); return; }
      const { width, height, x, y } = cropPixels;
      canvas.width = OUTPUT_WIDTH;
      canvas.height = OUTPUT_HEIGHT;
      ctx.drawImage(image, x, y, width, height, 0, 0, OUTPUT_WIDTH, OUTPUT_HEIGHT);
      canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('Canvas is empty')), 'image/jpeg', 0.92);
    };
    image.onerror = reject;
    image.src = imageSrc;
  });

  const openCropperForFile = (type, pickedFile) => {
    const url = URL.createObjectURL(pickedFile);
    setRawImageUrl(url);
    setCropContext({ type });
    setCrop({ x: 0, y: 0 });
    const isSmallScreen = typeof window !== 'undefined' && window.innerWidth < 576;
    setCropScale(isSmallScreen ? 0.4 : 0.8);
    setZoom(1);
    setCroppedAreaPixels(null);
    setCropModalOpen(true);
  };

  const handleCropConfirm = async () => {
    try {
      if (!rawImageUrl || !croppedAreaPixels) return;
      const croppedBlob = await getCroppedBlob(rawImageUrl, croppedAreaPixels);
      const compressedBlob = await imageCompression(croppedBlob, {
        maxSizeMB: 0.5,
        useWebWorker: true,
        maxWidthOrHeight: 2000,
      });
      const compressedFile = new File([compressedBlob], 'cropped.jpg', { type: 'image/jpeg' });
      if (cropContext.type === 'featured') {
        handleImageChange({ fileList: [compressedFile] });
      } else if (cropContext.type === 'gallery') {
        handleGalleryDraggerChange(compressedFile);
      }
      setCropModalOpen(false);
      URL.revokeObjectURL(rawImageUrl);
      setRawImageUrl(null);
    } catch (err) {
      message.error('Failed to process image. Try another file.');
    }
  };

  const handleCropCancel = () => {
    if (rawImageUrl) URL.revokeObjectURL(rawImageUrl);
    setRawImageUrl(null);
    setCropModalOpen(false);
  };

  return (
    <div className="page-container" style={{ width: '100%' }}>
      {/* Page Header */}
      <div className="page-header-card">
        <div className="header-title-block">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Button
              type="default"
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate('/products')}
              style={{ borderRadius: 8 }}
            >
              Back
            </Button>
            <h2>Update Product #{id}</h2>
          </div>
          <p style={{ marginTop: 4 }}>Modify product details, category associations, pricing, inventory stock, variants, and gallery media.</p>
        </div>
        <Space>
          <Button
            type="primary"
            className="btn-primary-gogreen"
            icon={<SaveOutlined />}
            loading={loading}
            style={{ height: 42, padding: '0 24px' }}
            onClick={() => form.submit()}
          >
            Save Changes
          </Button>
        </Space>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        autoComplete="off"
        style={{ width: '100%' }}
      >
        {/* Section 1: General Product Information */}
        <div className="page-content-card" style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, borderBottom: '1px solid #f1f5f9', paddingBottom: 12 }}>
            <ShopOutlined style={{ fontSize: 20, color: '#088b46' }} />
            <h4 style={{ margin: 0, fontWeight: 700, color: '#0f172a' }}>General Information</h4>
          </div>

          <Row gutter={[16, 16]}>
            <Col md={8} xs={24}>
              <Form.Item label="Vendor" required name="vendor" disabled>
                <Select
                  placeholder="Select Vendor"
                  value={selectedVendor}
                  onChange={handleVendorChange}
                  allowClear
                  showSearch
                  optionFilterProp="children"
                  onClear={() => handleVendorChange(null)}
                  filterOption={(input, option) =>
                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                  style={{ width: '100%' }}
                >
                  {vendors.map((vendor) => (
                    <Option key={vendor.id} value={vendor.id}>{vendor.name}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col md={8} xs={24}>
              <Form.Item label="Brand Name" name="product_brand">
                <Select placeholder="Select Brand" showSearch optionFilterProp="children">
                  {brands.map((brand) => (
                    <Option key={brand.id} value={brand.id}>{brand.name}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col md={8} xs={24}>
              <Form.Item label="Product Name" name="name" rules={[{ required: true, message: "Please enter product name" }]}>
                <Input placeholder="Enter Product Name" />
              </Form.Item>
            </Col>

            <Col md={12} xs={24}>
              <Form.Item label="Category" name="category" rules={[{ required: true, message: "Please select a category" }]}>
                <Select placeholder="Select Category" showSearch optionFilterProp="children" onChange={handleCategoryChange}>
                  {categories.map((cat) => (
                    <Option key={cat.id} value={cat.id}>{cat.name}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col md={12} xs={24}>
              <Form.Item label="Subcategory" name="sub_category">
                <Select placeholder="Select Subcategory" showSearch optionFilterProp="children">
                  {subCategories.map((sub) => (
                    <Option key={sub.id} value={sub.id}>{sub.name}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col md={24} xs={24}>
              <Form.Item label="Product Description" name="description" rules={[{ required: true, message: "Please enter product description" }]}>
                <Input.TextArea rows={3} placeholder="Enter full detailed product description..." />
              </Form.Item>
            </Col>
          </Row>
        </div>

        {/* Section 2: Media & Gallery Images */}
        <div className="page-content-card" style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, borderBottom: '1px solid #f1f5f9', paddingBottom: 12 }}>
            <PictureOutlined style={{ fontSize: 20, color: '#088b46' }} />
            <h4 style={{ margin: 0, fontWeight: 700, color: '#0f172a' }}>Product Media & Gallery</h4>
          </div>

          <Row gutter={[24, 16]}>
            <Col md={12} xs={24}>
              <Form.Item
                label="Featured Product Image"
                name="product_image"
                valuePropName="fileList"
                getValueFromEvent={normFile}
                rules={[{ required: true, validator: validateFileUpload, message: "Please upload a product image" }]}
              >
                <Dragger
                  name="product_image"
                  maxCount={1}
                  fileList={productImage}
                  accept="image/*"
                  beforeUpload={(file) => {
                    const isImage = file.type.startsWith('image/');
                    if (!isImage) {
                      message.error('You can only upload image files!');
                      return Upload.LIST_IGNORE;
                    }
                    openCropperForFile('featured', file);
                    return Upload.LIST_IGNORE;
                  }}
                  showUploadList={false}
                  style={{ minHeight: 140, borderRadius: 8, padding: 12 }}
                >
                  <p className="ant-upload-drag-icon">
                    <UploadOutlined style={{ fontSize: 32, color: '#088b46' }} />
                  </p>
                  <p className="ant-upload-text">Click or drag featured image to upload</p>
                  <p className="ant-upload-hint">Max file size: 5MB</p>
                </Dragger>

                {(() => {
                  const list = (productImage || []);
                  if (!list.length) return null;
                  const file = list[0];
                  const url = file.url || file.thumbUrl;
                  if (!url) return null;
                  return (
                    <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                      <div style={{ position: 'relative', display: 'inline-block' }}>
                        <img src={url} alt="Product Preview" style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8, border: '1px solid #e2e8f0' }} />
                        <Button
                          type="text"
                          style={{ position: 'absolute', top: -6, right: -6, background: '#ef4444', color: 'white', borderRadius: '50%', width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 12, border: '2px solid white', padding: 0 }}
                          onClick={() => {
                            handleImageChange({ fileList: [] });
                            setTimeout(() => form.validateFields(['product_image']), 50);
                          }}
                        >
                          ×
                        </Button>
                      </div>
                    </div>
                  );
                })()}
              </Form.Item>
            </Col>

            <Col md={12} xs={24}>
              <Form.Item label={`Gallery Images (${galleryImages.length}/5)`} required>
                <Dragger
                  multiple
                  accept="image/*"
                  showUploadList={false}
                  beforeUpload={(file) => {
                    if (galleryImages.length >= 5) {
                      message.warning('Maximum 5 images allowed.');
                      return Upload.LIST_IGNORE;
                    }
                    openCropperForFile('gallery', file);
                    return Upload.LIST_IGNORE;
                  }}
                  style={{ minHeight: 140, borderRadius: 8, padding: 12 }}
                >
                  <p className="ant-upload-drag-icon">
                    <UploadOutlined style={{ fontSize: 32, color: '#088b46' }} />
                  </p>
                  <p className="ant-upload-text">
                    {galleryImages.length >= 5 ? 'Maximum 5 images reached.' : 'Click or drag gallery images to upload'}
                  </p>
                  <p className="ant-upload-hint">Max 5 images, 5MB each</p>
                </Dragger>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 12 }}>
                  {galleryPreviews.map((url, idx) => (
                    <div key={idx} style={{ position: 'relative', display: 'inline-block' }}>
                      <img src={url} alt={`Gallery ${idx + 1}`} style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8, border: '1px solid #e2e8f0' }} />
                      <Button
                        type="text"
                        style={{ position: 'absolute', top: -6, right: -6, background: '#ef4444', color: 'white', borderRadius: '50%', width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 12, border: '2px solid white', padding: 0 }}
                        onClick={() => handleRemoveGalleryImage(idx)}
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
              </Form.Item>
            </Col>
          </Row>
        </div>

        {/* Section 3: Pricing, Unit & Stock */}
        <div className="page-content-card" style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, borderBottom: '1px solid #f1f5f9', paddingBottom: 12 }}>
            <DollarOutlined style={{ fontSize: 20, color: '#088b46' }} />
            <h4 style={{ margin: 0, fontWeight: 700, color: '#0f172a' }}>Pricing & Stock Configuration</h4>
          </div>

          <Row gutter={[16, 16]}>
            <Col md={24} xs={24}>
              <div style={{ display: 'flex', alignItems: 'center', padding: '8px 12px', background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0', marginBottom: 12 }}>
                <Form.Item name="has_variants" valuePropName="checked" style={{ margin: 0, marginRight: 12 }}>
                  <Checkbox 
                    checked={checkvarient()}
                    onChange={(e) => { setHasVariants(e.target.checked); setHasAddOns(e.target.checked); }}
                  />
                </Form.Item>
                <div>
                  <div style={{ fontWeight: 600, color: '#0f172a' }}>Restaurant Product / Has Variants & Addons</div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>Enable if this product requires size, flavor options, or customizable add-ons</div>
                </div>
              </div>
            </Col>

            {hasvarientcheck && (
              <>
                <Col md={24} xs={24}>
                  <ProductVariants
                    variants={variants}
                    editingVariantIdx={editingVariantIdx}
                    newVariantDraft={newVariantDraft}
                    setNewVariantDraft={setNewVariantDraft}
                    startEditVariant={startEditVariant}
                    saveEditVariant={saveEditVariant}
                    cancelEditVariant={cancelEditVariant}
                    saveNewVariant={saveNewVariant}
                    removeVariant={removeVariant}
                    productPrice={form.getFieldValue('price')}
                    productDiscountPrice={form.getFieldValue('discount_price')}
                  />
                </Col>

                <Col md={24} xs={24}>
                  <Addons
                    addons={addons}
                    editingAddonIdx={editingAddonIdx}
                    newAddonDraft={newAddonDraft}
                    setNewAddonDraft={setNewAddonDraft}
                    startEditAddon={startEditAddon}
                    saveEditAddon={saveEditAddon}
                    cancelEditAddon={cancelEditAddon}
                    saveNewAddon={saveNewAddon}
                    removeAddon={removeAddon}
                  />
                </Col>

                <Col md={6} xs={24}>
                  <Form.Item label="Is this product available" name="is_available" valuePropName="checked">
                    <Switch checkedChildren="Yes" unCheckedChildren="No" />
                  </Form.Item>
                </Col>
              </>
            )}

            {!hasvarientcheck && (
              <>
                <Col md={6} xs={24}>
                  <Form.Item label="Original Price (₹)" name="price" rules={[{ required: true, message: "Please enter product price" }]}>
                    <Input 
                      type="number" 
                      placeholder="0.00"
                      prefix={<span style={{ color: '#088b46', fontWeight: 700 }}>₹</span>}
                      onChange={e => {
                        const p = Number(e.target.value);
                        form.setFieldsValue({ price: p, discount_price: p, discount_percent: 0 });
                      }} 
                    />
                  </Form.Item>
                </Col>

                <Col md={6} xs={24}>
                  <div style={{ display: 'flex', alignItems: 'center', height: '100%', paddingTop: 10 }}>
                    <Form.Item name="enable_discount" valuePropName="checked" style={{ margin: 0, marginRight: 12 }}>
                      <Checkbox
                        onChange={(e) => {
                          const checked = e.target.checked;
                          const pr = Number(form.getFieldValue('price'));
                          if (checked) {
                            form.setFieldsValue({ discount_price: pr, discount_percent: 0 });
                          } else {
                            form.setFieldsValue({ discount_price: undefined, discount_percent: undefined });
                          }
                        }}
                      />
                    </Form.Item>
                    <div>
                      <div style={{ fontWeight: 600, color: '#0f172a' }}>Enable Discount</div>
                      <div style={{ fontSize: 12, color: '#64748b' }}>Apply promotional discount</div>
                    </div>
                  </div>
                </Col>

                {enableDiscount && (
                  <>
                    <Col md={6} xs={24}>
                      <Form.Item
                        label="Selling Price (₹)"
                        name="discount_price"
                        rules={[
                          { required: true, message: 'Please enter selling price' },
                          ({ getFieldValue }) => ({
                            validator(_, value) {
                              const productPrice = getFieldValue('price');
                              if (value === undefined || value === null || value === '') {
                                return Promise.reject('Please enter selling price');
                              }
                              if (Number(value) > Number(productPrice)) {
                                return Promise.reject('Selling price cannot be greater than original price');
                              }
                              return Promise.resolve();
                            }
                          })
                        ]}
                      >
                        <InputNumber
                          style={{ width: '100%' }}
                          placeholder="Discounted Price"
                          prefix={<span style={{ color: '#088b46', fontWeight: 700 }}>₹</span>}
                          min={0}
                          onChange={(discount) => {
                            if (price && Number(discount) <= Number(price)) {
                              const percent = parseFloat((((Number(price) - discount) / Number(price)) * 100).toFixed(2));
                              form.setFieldsValue({ discount_percent: percent });
                              setDiscountPercent(percent);
                            } else {
                              form.setFieldsValue({ discount_percent: 0 });
                              setDiscountPercent(0);
                            }
                          }}
                        />
                      </Form.Item>
                    </Col>

                    <Col md={6} xs={24}>
                      <Form.Item label="Discount Percent (%)" name="discount_percent" rules={[{ required: true, message: 'Please enter discount percent' }]}>
                        <InputNumber
                          style={{ width: '100%' }}
                          placeholder="Discount %"
                          min={0}
                          max={100}
                          onChange={(percent) => {
                            const pr = Number(form.getFieldValue('price'));
                            if (!pr || percent > 100) {
                              form.setFieldsValue({ discount_percent: 0, discount_price: pr });
                              setDiscountPercent(0);
                              return;
                            }
                            const discount = parseFloat((pr - (pr * percent) / 100).toFixed(2));
                            form.setFieldsValue({ discount_percent: percent, discount_price: discount });
                            setDiscountPercent(percent);
                          }}
                        />
                      </Form.Item>
                    </Col>
                  </>
                )}

                <Col md={12} xs={24}>
                  <PricePreview price={price || 0} discountPrice={discountPrice || 0} enableDiscount={enableDiscount} />
                </Col>

                <Col md={4} xs={24}>
                  <Form.Item label="Unit" name="unit" rules={[{ required: true, message: "Please select a unit" }]}>
                    <Select
                      showSearch
                      placeholder="Select unit"
                      onChange={(value) => {
                        setSelectedUnit(value);
                        handleUnitChange(value);
                        form.setFieldsValue({ quantity: "" });
                      }}
                      style={{ width: '100%' }}
                    >
                      {unitOptions.map((u) => (
                        <Option key={u.value} value={u.value}>{u.label} ({u.value})</Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>

                <Col md={4} xs={24}>
                  <Form.Item label="Quantity" name="quantity" rules={[{ required: true, message: "Please enter quantity" }]}>
                    <Input type="number" placeholder="0" addonAfter={selectedUnit || ''} />
                  </Form.Item>
                </Col>

                <Col md={4} xs={24}>
                  <Form.Item label="Stock Quantity" name="stock" rules={[{ required: true, message: "Please enter stock" }]}>
                    <Input type="number" min={0} placeholder="Available Stock" />
                  </Form.Item>
                </Col>
              </>
            )}
          </Row>
        </div>

        {/* Section 4: Additional Custom Attributes */}
        <div className="page-content-card" style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, borderBottom: '1px solid #f1f5f9', paddingBottom: 12 }}>
            <TagsOutlined style={{ fontSize: 20, color: '#088b46' }} />
            <h4 style={{ margin: 0, fontWeight: 700, color: '#0f172a' }}>Additional Attributes</h4>
          </div>

          <Form.List name="attributes">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Space key={key} style={{ display: 'flex', marginBottom: 12 }} align="baseline">
                    <Form.Item {...restField} name={[name, 'key']} rules={[{ required: true, message: 'Key required' }]}>
                      <Input placeholder="Attribute Key (e.g. Origin, Organic)" style={{ width: 220 }} />
                    </Form.Item>
                    <Form.Item {...restField} name={[name, 'value']} rules={[{ required: true, message: 'Value required' }]}>
                      <Input placeholder="Attribute Value (e.g. India, 100% Pure)" style={{ width: 320 }} />
                    </Form.Item>
                    <MinusCircleOutlined onClick={() => remove(name)} style={{ color: '#ef4444', fontSize: 18 }} />
                  </Space>
                ))}
                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />} style={{ borderRadius: 8, height: 40 }}>
                  Add Attribute
                </Button>
              </>
            )}
          </Form.List>
        </div>

        {/* Submit Actions Footer */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginBottom: 40 }}>
          <Button size="large" onClick={() => navigate('/products')} style={{ borderRadius: 8, padding: '0 28px' }}>
            Cancel
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            size="large"
            className="btn-primary-gogreen"
            icon={<SaveOutlined />}
            style={{ padding: '0 36px', height: 44, borderRadius: 8 }}
          >
            Update Product
          </Button>
        </div>
      </Form>

      {/* Success Modal */}
      <AntModal open={showModal} onCancel={() => setShowModal(false)} footer={null} centered>
        <div style={{ textAlign: 'center', padding: '16px 0' }}>
          <h4 style={{ color: '#088b46', fontWeight: 700 }}>Product Updated Successfully</h4>
          <p style={{ color: '#64748b' }}>The Product details have been saved!</p>
          <Button type="primary" onClick={() => setShowModal(false)} className="btn-primary-gogreen">
            OK
          </Button>
        </div>
      </AntModal>

      {/* Crop Modal */}
      <AntModal
        open={cropModalOpen}
        onCancel={handleCropCancel}
        onOk={handleCropConfirm}
        okText="Crop & Use"
        centered
        destroyOnClose
        width={720}
      >
        <div style={{ position: 'relative', width: '100%', height: 400, background: '#1e293b', borderRadius: 8, overflow: 'hidden' }}>
          {rawImageUrl && (
            <Cropper
              image={rawImageUrl}
              crop={crop}
              zoom={zoom}
              minZoom={0.4}
              maxZoom={3}
              aspect={ASPECT_RATIO}
              cropSize={{
                width: Math.round(CROP_CONTAINER_WIDTH * cropScale),
                height: Math.round(CROP_CONTAINER_HEIGHT * cropScale)
              }}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
              restrictPosition={false}
              showGrid
            />
          )}
        </div>
        <div style={{ marginTop: 16 }}>
          <div style={{ marginBottom: 6, fontWeight: 600, color: '#475569' }}>Zoom Adjustment</div>
          <Slider min={0.4} max={3} step={0.01} value={zoom} onChange={setZoom} />
        </div>
      </AntModal>
    </div>
  );
};

export default UpdateProduct;
