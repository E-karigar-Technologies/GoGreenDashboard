import React, { useState, useEffect } from 'react';
import {
  Table,
  Input,
  Select,
  Button,
  Space,
  Modal,
  Form,
  Upload,
  Switch,
  Tag,
  Tooltip,
  Image,
  Row,
  Col
} from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  MinusOutlined,
  SearchOutlined,
  TagOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  AppstoreOutlined,
  ReloadOutlined,
  EyeOutlined,
  InfoCircleOutlined,
  ShoppingOutlined,
  PictureOutlined
} from '@ant-design/icons';
import useBrandHook from './usebrandhook';
import { useNavigate } from 'react-router-dom';
import '../../assets/scss/pages/productbrand.scss';

const { Option } = Select;

// Fallback SVG data-URI for zero broken icons or overflowing alt text
const FALLBACK_NO_IMAGE =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60"><rect width="60" height="60" fill="%23f8fafc" rx="8"/><rect width="58" height="58" x="1" y="1" fill="none" stroke="%23cbd5e1" stroke-dasharray="3,3" rx="8"/><text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" fill="%2394a3b8" font-size="9" font-family="sans-serif" font-weight="600">No Image</text></svg>';

// Fail-safe Logo Component that displays 'No Image' if missing or broken
const BrandLogo = ({ src, size = 38, isExpanded = false }) => {
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    setLoadFailed(false);
  }, [src]);

  const isValidSrc =
    src &&
    typeof src === 'string' &&
    src.trim() !== '' &&
    src.trim() !== 'null' &&
    src.trim() !== 'undefined' &&
    !src.endsWith('/null') &&
    !src.endsWith('/undefined');

  if (!isValidSrc || loadFailed) {
    if (isExpanded) {
      return (
        <div
          style={{
            width: size,
            height: size,
            margin: '0 auto',
            borderRadius: 10,
            background: '#f8fafc',
            border: '1px dashed #cbd5e1',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#64748b',
            fontWeight: 600,
            fontSize: '11px',
            textAlign: 'center',
            padding: 4,
          }}
        >
          <PictureOutlined style={{ fontSize: 20, color: '#94a3b8', marginBottom: 4 }} />
          <span>No Image</span>
        </div>
      );
    }

    return (
      <div
        style={{
          width: size,
          height: size,
          borderRadius: 8,
          background: '#f8fafc',
          border: '1px dashed #cbd5e1',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#64748b',
          fontWeight: 600,
          fontSize: '8.5px',
          lineHeight: 1,
          flexShrink: 0,
          userSelect: 'none',
        }}
        title="No image available"
      >
        <PictureOutlined style={{ fontSize: 13, color: '#94a3b8', marginBottom: 2 }} />
        <span>No Image</span>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt=""
      fallback={FALLBACK_NO_IMAGE}
      width={size}
      height={size}
      onError={() => setLoadFailed(true)}
      style={{
        objectFit: 'contain',
        borderRadius: 8,
        border: '1px solid #e2e8f0',
        background: '#ffffff',
        padding: 2,
      }}
      preview={{ mask: <EyeOutlined style={{ fontSize: 13 }} /> }}
    />
  );
};

const AllBrands = () => {
  const navigate = useNavigate();
  const {
    data,
    loading,
    error,
    pagination,
    onTableChange,
    search,
    setSearch,
    categoryFilter,
    setCategoryFilter,
    statusFilter,
    setStatusFilter,
    handleResetFilters,
    isFiltered,
    totalBrandsCount,
    activeBrandsCount,
    inactiveBrandsCount,
    categories,
    fetchAllData,
    editModal,
    openEditModal,
    closeEditModal,
    selectedBrand,
    previewImage,
    handleImageChange,
    formLoading,
    deleteModal,
    openDeleteModal,
    closeDeleteModal,
    handleEditSave,
    handleDelete,
    updateStatus,
  } = useBrandHook();

  const [form] = Form.useForm();
  const [editFileList, setEditFileList] = useState([]);
  const [editPreview, setEditPreview] = useState('');

  useEffect(() => {
    if (editModal && selectedBrand) {
      setEditPreview(previewImage);
      setEditFileList([]);
      form.setFieldsValue({
        name: selectedBrand.name,
        description: selectedBrand.description,
        categoryid: selectedBrand.categoryid,
        status: Number(selectedBrand.status) === 1,
      });
    }
  }, [editModal, selectedBrand, previewImage, form]);

  const handleEditLogoChange = (info) => {
    const newFileList = info.fileList.slice(-1);
    setEditFileList(newFileList);
    const fileObj = newFileList[0]?.originFileObj;
    if (info.file.status === 'removed' || !fileObj) {
      setEditPreview('');
      handleImageChange(null);
      return;
    }
    setEditPreview(URL.createObjectURL(fileObj));
    handleImageChange(fileObj);
  };

  const handleToggleActive = (brandId, isActive) => {
    updateStatus(brandId, isActive);
  };

  // Render Expanded Row containing full description, larger logo preview, metadata & actions
  const renderExpandedRow = (record) => {
    const logoUrl = record.brand_logo
      ? record.brand_logo.startsWith('http')
        ? record.brand_logo
        : `${import.meta.env.VITE_IMAGE_BASE_URL}${record.brand_logo}`
      : null;

    return (
      <div className="brand-expanded-card">
        <Row gutter={[20, 16]}>
          {/* Col 1: Brand Info & Identity */}
          <Col xs={24} sm={12} md={7}>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: 700, color: '#64748b', marginBottom: 8 }}>
              Brand Identity & Category
            </div>
            <div className="brand-meta-item">
              <span className="meta-title">Brand ID</span>
              <span className="meta-value">#{record.id}</span>
            </div>
            <div className="brand-meta-item">
              <span className="meta-title">Brand Name</span>
              <span className="meta-value">{record.name}</span>
            </div>
            <div className="brand-meta-item">
              <span className="meta-title">Category</span>
              <span className="meta-value">
                <Tag color="blue" style={{ margin: 0, fontWeight: 600 }}>
                  <AppstoreOutlined style={{ marginRight: 4 }} />
                  {record.category_name || 'General'}
                </Tag>
              </span>
            </div>
            <div className="brand-meta-item">
              <span className="meta-title">Status</span>
              <span className="meta-value">
                {Number(record.status) === 1 ? (
                  <Tag color="success" style={{ margin: 0, fontWeight: 600 }}>Active</Tag>
                ) : (
                  <Tag color="default" style={{ margin: 0, fontWeight: 600 }}>Inactive</Tag>
                )}
              </span>
            </div>
          </Col>

          {/* Col 2: Description */}
          <Col xs={24} sm={12} md={9}>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: 700, color: '#64748b', marginBottom: 8 }}>
              Full Description & Notes
            </div>
            <div className="brand-desc-box">
              {record.description ? (
                record.description
              ) : (
                <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>
                  No description provided for this brand.
                </span>
              )}
            </div>
          </Col>

          {/* Col 3: Logo Preview */}
          <Col xs={24} sm={12} md={4} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: 700, color: '#64748b', marginBottom: 8, textAlign: 'left' }}>
              Logo Asset
            </div>
            <BrandLogo src={logoUrl} size={72} isExpanded={true} />
          </Col>

          {/* Col 4: Quick Actions */}
          <Col xs={24} sm={12} md={4}>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: 700, color: '#64748b', marginBottom: 8 }}>
              Manage Brand
            </div>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button
                type="default"
                size="small"
                icon={<EditOutlined style={{ color: '#0284c7' }} />}
                onClick={() => openEditModal(record)}
                style={{ width: '100%', borderRadius: 6, fontWeight: 500 }}
              >
                Edit Brand
              </Button>
              <Button
                danger
                size="small"
                icon={<DeleteOutlined />}
                onClick={() => openDeleteModal(record)}
                style={{ width: '100%', borderRadius: 6, fontWeight: 500 }}
              >
                Delete Brand
              </Button>
              <Button
                type="link"
                size="small"
                icon={<ShoppingOutlined />}
                onClick={() => navigate(`/products?search_string=${encodeURIComponent(record.name)}`)}
                style={{ padding: 0, fontSize: '12px', color: '#088b46', fontWeight: 600 }}
              >
                View Catalog Items &rarr;
              </Button>
            </Space>
          </Col>
        </Row>
      </div>
    );
  };

  // Primary Table Columns - ZERO Horizontal Scroll on all screens
  const columns = [
    {
      title: '#',
      dataIndex: 'sr',
      key: 'sr',
      width: 55,
      align: 'center',
      render: (_, __, idx) => (
        <span style={{ fontWeight: 600, color: '#64748b', fontSize: '12.5px' }}>
          #{(pagination.current - 1) * pagination.pageSize + idx + 1}
        </span>
      ),
    },
    {
      title: 'Brand',
      dataIndex: 'name',
      key: 'name',
      sorter: true,
      render: (name, record) => {
        const logoUrl = record.brand_logo
          ? record.brand_logo.startsWith('http')
            ? record.brand_logo
            : `${import.meta.env.VITE_IMAGE_BASE_URL}${record.brand_logo}`
          : null;

        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <BrandLogo src={logoUrl} size={38} isExpanded={false} />
            <div style={{ minWidth: 0 }}>
              <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '13.5px', display: 'block' }}>
                {name}
              </span>
              {record.description && (
                <span
                  style={{
                    fontSize: '11.5px',
                    color: '#64748b',
                    display: '-webkit-box',
                    WebkitLineClamp: 1,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    maxWidth: 260
                  }}
                  title={record.description}
                >
                  {record.description}
                </span>
              )}
            </div>
          </div>
        );
      },
    },
    {
      title: 'Category',
      dataIndex: 'category_name',
      key: 'category_name',
      sorter: true,
      width: 150,
      render: (cat) => (
        <Tag color="blue" style={{ borderRadius: '6px', fontWeight: 600, fontSize: '12px' }}>
          <AppstoreOutlined style={{ marginRight: 4 }} />
          {cat || 'General'}
        </Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 110,
      align: 'center',
      render: (status, record) => (
        <Switch
          checked={Number(status) === 1}
          checkedChildren="Active"
          unCheckedChildren="Inactive"
          onChange={(checked) => handleToggleActive(record.id, checked ? 1 : 0)}
        />
      ),
    },
    {
      title: 'Actions',
      key: 'action',
      width: 95,
      align: 'center',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Edit Brand">
            <Button
              type="text"
              size="small"
              icon={<EditOutlined style={{ color: '#0284c7', fontSize: 16 }} />}
              onClick={() => openEditModal(record)}
            />
          </Tooltip>
          <Tooltip title="Delete Brand">
            <Button
              type="text"
              size="small"
              icon={<DeleteOutlined style={{ color: '#ef4444', fontSize: 16 }} />}
              onClick={() => openDeleteModal(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="page-container">
      {/* Page Header */}
      <div className="page-header-card">
        <div className="header-title-block">
          <h2>Product Brands Management</h2>
          <p>Organize, add, edit, and classify manufacturer product brands across product categories.</p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <Button
            icon={<ReloadOutlined spin={loading} />}
            onClick={fetchAllData}
            style={{ height: 40, borderRadius: 8, fontWeight: 600 }}
          >
            Refresh
          </Button>
          <Button
            type="primary"
            className="btn-primary-gogreen"
            icon={<PlusOutlined />}
            style={{ height: 40, padding: '0 20px', borderRadius: 8, fontWeight: 600 }}
            onClick={() => navigate('/add-Product-Brand')}
          >
            Add New Brand
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="page-stats-grid">
        <div className="page-stat-card">
          <div className="stat-meta">
            <div className="stat-label">Total Brands</div>
            <div className="stat-number">{totalBrandsCount}</div>
          </div>
          <div className="stat-icon" style={{ background: '#e0f2fe', color: '#0284c7' }}>
            <TagOutlined />
          </div>
        </div>

        <div className="page-stat-card">
          <div className="stat-meta">
            <div className="stat-label">Active Brands</div>
            <div className="stat-number">{activeBrandsCount}</div>
          </div>
          <div className="stat-icon" style={{ background: '#dcfce7', color: '#088b46' }}>
            <CheckCircleOutlined />
          </div>
        </div>

        <div className="page-stat-card">
          <div className="stat-meta">
            <div className="stat-label">Inactive Brands</div>
            <div className="stat-number">{inactiveBrandsCount}</div>
          </div>
          <div className="stat-icon" style={{ background: '#fef2f2', color: '#dc2626' }}>
            <CloseCircleOutlined />
          </div>
        </div>

        <div className="page-stat-card">
          <div className="stat-meta">
            <div className="stat-label">Associated Categories</div>
            <div className="stat-number">{categories.length}</div>
          </div>
          <div className="stat-icon" style={{ background: '#f3e8ff', color: '#9333ea' }}>
            <AppstoreOutlined />
          </div>
        </div>
      </div>

      {/* Main Content Card with Comprehensive Filter Bar */}
      <div className="page-content-card">
        {/* Modern Filter Toolbar */}
        <div
          style={{
            background: '#f8fafc',
            padding: '14px 16px',
            borderRadius: 10,
            border: '1px solid #e2e8f0',
            marginBottom: 20,
            display: 'flex',
            flexWrap: 'wrap',
            gap: 12,
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', flex: 1 }}>
            {/* Search Input */}
            <Input
              prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
              placeholder="Search brand name, description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              allowClear
              style={{ width: 280, borderRadius: 8, height: 38 }}
            />

            {/* Category Filter */}
            <Select
              placeholder="All Categories"
              value={categoryFilter || undefined}
              onChange={(val) => setCategoryFilter(val || '')}
              allowClear
              showSearch
              style={{ minWidth: 200, height: 38 }}
              filterOption={(input, option) =>
                (option?.children || '').toLowerCase().includes(input.toLowerCase())
              }
            >
              {categories.map((cat) => (
                <Option key={cat.id} value={cat.id}>
                  {cat.name}
                </Option>
              ))}
            </Select>

            {/* Status Filter */}
            <Select
              placeholder="Filter by Status"
              value={statusFilter}
              onChange={(val) => setStatusFilter(val)}
              style={{ width: 150, height: 38 }}
            >
              <Option value="all">All Status</Option>
              <Option value="active">Active Only</Option>
              <Option value="inactive">Inactive Only</Option>
            </Select>

            {/* Reset Filters Button */}
            {isFiltered && (
              <Button
                icon={<ReloadOutlined />}
                onClick={handleResetFilters}
                style={{ borderRadius: 8, height: 38, fontWeight: 600 }}
              >
                Reset Filters
              </Button>
            )}
          </div>

          {/* Result Count Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Tag color="cyan" style={{ borderRadius: 12, padding: '4px 12px', fontWeight: 600, fontSize: '12px', margin: 0 }}>
              {pagination.total} Brands Found
            </Tag>
          </div>
        </div>

        {/* Responsive Table with '+' Expansion - ZERO Horizontal Scroll */}
        <Table
          columns={columns}
          dataSource={data}
          loading={loading}
          pagination={{
            ...pagination,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} brands`,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50', '100'],
          }}
          onChange={onTableChange}
          rowKey={(record) => record.id}
          expandable={{
            expandedRowRender: renderExpandedRow,
            rowExpandable: () => true,
            expandIcon: ({ expanded, onExpand, record }) => (
              <Button
                type="text"
                size="small"
                style={{
                  border: '1px solid #cbd5e1',
                  borderRadius: '50%',
                  width: 24,
                  height: 24,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 0,
                  background: expanded ? '#e0f2fe' : '#ffffff',
                  color: expanded ? '#0284c7' : '#64748b',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                }}
                onClick={(e) => onExpand(record, e)}
                title={expanded ? 'Collapse Details' : 'Expand Brand Details & Actions'}
              >
                {expanded ? <MinusOutlined style={{ fontSize: 11 }} /> : <PlusOutlined style={{ fontSize: 11 }} />}
              </Button>
            ),
          }}
        />
      </div>

      {/* Edit Modal */}
      <Modal
        open={editModal}
        onCancel={closeEditModal}
        title="Edit Brand Details"
        footer={null}
        destroyOnClose
        width={650}
        centered
      >
        {selectedBrand && (
          <Form
            form={form}
            layout="vertical"
            onFinish={(values) => handleEditSave(values, editFileList[0]?.originFileObj)}
            initialValues={{
              name: selectedBrand.name,
              description: selectedBrand.description,
              categoryid: selectedBrand.categoryid,
              status: Number(selectedBrand.status) === 1,
            }}
          >
            <Form.Item label="Brand Name" name="name" rules={[{ required: true, message: 'Please enter brand name' }]}>
              <Input placeholder="Enter brand name" />
            </Form.Item>

            <Form.Item label="Category" name="categoryid" rules={[{ required: true, message: 'Please select a category' }]}>
              <Select
                placeholder="Select Category"
                showSearch
                filterOption={(input, option) =>
                  (option?.children || '').toLowerCase().includes(input.toLowerCase())
                }
              >
                {categories.map((cat) => (
                  <Option key={cat.id} value={cat.id}>
                    {cat.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item label="Description" name="description">
              <Input.TextArea rows={3} placeholder="Enter brand description" />
            </Form.Item>

            <Form.Item label="Brand Logo">
              <Upload.Dragger
                name="file"
                accept="image/*"
                multiple={false}
                showUploadList={false}
                beforeUpload={() => false}
                onChange={handleEditLogoChange}
                fileList={editFileList}
              >
                <p className="ant-upload-text">Click or drag brand logo image to upload</p>
              </Upload.Dragger>
              {editPreview && (
                <div className="mt-2" style={{ textAlign: 'center' }}>
                  <img
                    src={editPreview}
                    alt="Brand Preview"
                    style={{ width: 80, height: 80, objectFit: 'contain', borderRadius: 8, border: '1px solid #eee', background: '#fff', padding: 4 }}
                  />
                </div>
              )}
            </Form.Item>

            <div style={{ textAlign: 'right', marginTop: 16 }}>
              <Button onClick={closeEditModal} style={{ marginRight: 8 }}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit" loading={formLoading} className="btn-primary-gogreen">
                Save Changes
              </Button>
            </div>
          </Form>
        )}
      </Modal>

      {/* Delete Modal */}
      <Modal
        open={deleteModal}
        onCancel={closeDeleteModal}
        title="Confirm Brand Deletion"
        onOk={handleDelete}
        okText="Yes, Delete Brand"
        okButtonProps={{ danger: true }}
        cancelText="Cancel"
        confirmLoading={formLoading}
        centered
      >
        <p style={{ margin: '16px 0', color: '#475569' }}>
          Are you sure you want to delete this product brand? This action cannot be undone.
        </p>
      </Modal>

      {error && <div style={{ color: 'red', marginTop: 16 }}>{error}</div>}
    </div>
  );
};

export default AllBrands;
