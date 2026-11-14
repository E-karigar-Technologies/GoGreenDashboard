import React, { useEffect, useState } from 'react';
import {
  Table,
  Button,
  Switch,
  Space,
  Modal,
  Form,
  Input,
  Upload,
  Tag,
  Tooltip,
  Image,
  Select,
  Row,
  Col
} from 'antd';
import { useNavigate } from 'react-router-dom';
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  MinusOutlined,
  SearchOutlined,
  AppstoreOutlined,
  CheckCircleOutlined,
  StopOutlined,
  ReloadOutlined,
  EyeOutlined,
  ShoppingOutlined,
  PictureOutlined
} from '@ant-design/icons';
import useCatagoryHook from './useCatagoryHook';

const { Dragger } = Upload;
const { Option } = Select;

// Fallback SVG data-URI for zero broken icons or overflowing alt text
const FALLBACK_NO_IMAGE =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60"><rect width="60" height="60" fill="%23f8fafc" rx="8"/><rect width="58" height="58" x="1" y="1" fill="none" stroke="%23cbd5e1" stroke-dasharray="3,3" rx="8"/><text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" fill="%2394a3b8" font-size="9" font-family="sans-serif" font-weight="600">No Image</text></svg>';

// Fail-safe Logo Component that displays 'No Image' if missing or broken
const CategoryLogo = ({ src, size = 38, isExpanded = false }) => {
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

const AllCategory = () => {
  const {
    data,
    loading,
    pagination,
    onTableChange,
    handleToggleActive,
    editModal,
    openEditModal,
    closeEditModal,
    selectedCategory,
    previewImage,
    handleImageChange,
    handleSave,
    formLoading,
    deleteModal,
    openDeleteModal,
    closeDeleteModal,
    handleDelete,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    handleResetFilters,
    isFiltered,
    totalCategoriesCount,
    activeCategoriesCount,
    inactiveCategoriesCount,
    fetchAllCategories,
  } = useCatagoryHook();

  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [editFileList, setEditFileList] = useState([]);
  const [editPreview, setEditPreview] = useState('');

  useEffect(() => {
    if (editModal && selectedCategory) {
      setEditPreview(previewImage);
      setEditFileList([]);
      form.setFieldsValue({
        name: selectedCategory.name,
        description: selectedCategory.description,
        status: Number(selectedCategory.status) === 1,
      });
    }
  }, [editModal, selectedCategory, previewImage, form]);

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

  const onEditFinish = (values) => {
    handleSave({
      ...selectedCategory,
      ...values,
      status: values.status ? 1 : 0,
      category_logo: editFileList[0]?.originFileObj || selectedCategory.category_logo,
    });
  };

  // Render expanded row containing secondary details & quick actions
  const renderExpandedRow = (record) => {
    const logoUrl = record.category_logo
      ? record.category_logo.startsWith('http')
        ? record.category_logo
        : `${import.meta.env.VITE_IMAGE_BASE_URL}${record.category_logo}`
      : null;

    return (
      <div
        style={{
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: 10,
          padding: '16px 20px',
          margin: '6px 0',
          boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.02)',
        }}
      >
        <Row gutter={[20, 16]}>
          {/* Col 1: Identity & Status */}
          <Col xs={24} sm={12} md={7}>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: 700, color: '#64748b', marginBottom: 8 }}>
              Category Identity & Status
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px dashed #e2e8f0', fontSize: '12.5px' }}>
              <span style={{ color: '#64748b', fontWeight: 500 }}>Category ID</span>
              <span style={{ color: '#0f172a', fontWeight: 600 }}>#{record.id}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px dashed #e2e8f0', fontSize: '12.5px' }}>
              <span style={{ color: '#64748b', fontWeight: 500 }}>Category Name</span>
              <span style={{ color: '#0f172a', fontWeight: 600 }}>{record.name}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '12.5px' }}>
              <span style={{ color: '#64748b', fontWeight: 500 }}>Current Status</span>
              <span>
                {Number(record.status) === 1 ? (
                  <Tag color="success" style={{ margin: 0, fontWeight: 600 }}>Active</Tag>
                ) : (
                  <Tag color="default" style={{ margin: 0, fontWeight: 600 }}>Inactive</Tag>
                )}
              </span>
            </div>
          </Col>

          {/* Col 2: Full Description */}
          <Col xs={24} sm={12} md={9}>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: 700, color: '#64748b', marginBottom: 8 }}>
              Full Description & Notes
            </div>
            <div
              style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: 8,
                padding: '12px 14px',
                color: '#334155',
                fontSize: 13,
                lineHeight: 1.5,
                maxHeight: 110,
                overflowY: 'auto',
              }}
            >
              {record.description ? (
                record.description
              ) : (
                <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>
                  No description provided for this category.
                </span>
              )}
            </div>
          </Col>

          {/* Col 3: Logo Asset Preview */}
          <Col xs={24} sm={12} md={4} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: 700, color: '#64748b', marginBottom: 8, textAlign: 'left' }}>
              Category Asset
            </div>
            <CategoryLogo src={logoUrl} size={72} isExpanded={true} />
          </Col>

          {/* Col 4: Quick Actions */}
          <Col xs={24} sm={12} md={4}>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: 700, color: '#64748b', marginBottom: 8 }}>
              Manage Category
            </div>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button
                type="default"
                size="small"
                icon={<EditOutlined style={{ color: '#0284c7' }} />}
                onClick={() => openEditModal(record)}
                style={{ width: '100%', borderRadius: 6, fontWeight: 500 }}
              >
                Edit Category
              </Button>
              <Button
                danger
                size="small"
                icon={<DeleteOutlined />}
                onClick={() => openDeleteModal(record)}
                style={{ width: '100%', borderRadius: 6, fontWeight: 500 }}
              >
                Delete Category
              </Button>
              <Button
                type="link"
                size="small"
                icon={<ShoppingOutlined />}
                onClick={() => navigate(`/products?category_id=${record.id}`)}
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

  // Primary Table Columns - ZERO Horizontal Scroll on all screen sizes
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
      title: 'Category',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => (a.name || '').localeCompare(b.name || ''),
      render: (name, record) => {
        const logoUrl = record.category_logo
          ? record.category_logo.startsWith('http')
            ? record.category_logo
            : `${import.meta.env.VITE_IMAGE_BASE_URL}${record.category_logo}`
          : null;

        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <CategoryLogo src={logoUrl} size={38} isExpanded={false} />
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
                    maxWidth: 280,
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
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
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
          <Tooltip title="Edit Category">
            <Button
              type="text"
              size="small"
              icon={<EditOutlined style={{ color: '#0284c7', fontSize: 16 }} />}
              onClick={() => openEditModal(record)}
            />
          </Tooltip>
          <Tooltip title="Delete Category">
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
      {/* Header Card */}
      <div className="page-header-card">
        <div className="header-title-block">
          <h2>Product Categories Directory</h2>
          <p>Organize top-level product classifications, store section listings, and custom store logos.</p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <Button
            icon={<ReloadOutlined spin={loading} />}
            onClick={fetchAllCategories}
            style={{ height: 40, borderRadius: 8, fontWeight: 600 }}
          >
            Refresh
          </Button>
          <Button
            type="primary"
            className="btn-primary-gogreen"
            icon={<PlusOutlined />}
            style={{ height: 40, padding: '0 20px', borderRadius: 8, fontWeight: 600 }}
            onClick={() => navigate('/add-category')}
          >
            Add Category
          </Button>
        </div>
      </div>

      {/* Stats Overview Cards */}
      <div className="page-stats-grid">
        <div className="page-stat-card">
          <div className="stat-meta">
            <div className="stat-label">Total Categories</div>
            <div className="stat-number">{totalCategoriesCount}</div>
          </div>
          <div className="stat-icon" style={{ background: '#e0f2fe', color: '#0284c7' }}>
            <AppstoreOutlined />
          </div>
        </div>

        <div className="page-stat-card">
          <div className="stat-meta">
            <div className="stat-label">Active Categories</div>
            <div className="stat-number">{activeCategoriesCount}</div>
          </div>
          <div className="stat-icon" style={{ background: '#dcfce7', color: '#088b46' }}>
            <CheckCircleOutlined />
          </div>
        </div>

        <div className="page-stat-card">
          <div className="stat-meta">
            <div className="stat-label">Inactive Categories</div>
            <div className="stat-number">{inactiveCategoriesCount}</div>
          </div>
          <div className="stat-icon" style={{ background: '#fef2f2', color: '#dc2626' }}>
            <StopOutlined />
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
              placeholder="Search category name, description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              allowClear
              style={{ width: 280, borderRadius: 8, height: 38 }}
            />

            {/* Status Filter */}
            <Select
              placeholder="Filter by Status"
              value={statusFilter}
              onChange={(val) => setStatusFilter(val)}
              style={{ width: 160, height: 38 }}
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
              {pagination.total} Categories Found
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
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} categories`,
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
                title={expanded ? 'Collapse Details' : 'Expand Category Details & Actions'}
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
        title="Edit Category Details"
        footer={null}
        destroyOnClose
        centered
        width={600}
      >
        {selectedCategory && (
          <Form
            form={form}
            layout="vertical"
            onFinish={onEditFinish}
            initialValues={{
              name: selectedCategory.name,
              description: selectedCategory.description,
              status: Number(selectedCategory.status) === 1,
            }}
          >
            <Form.Item
              label="Category Name"
              name="name"
              rules={[{ required: true, message: 'Please enter category name' }]}
            >
              <Input placeholder="Enter category name" />
            </Form.Item>

            <Form.Item label="Description" name="description">
              <Input.TextArea rows={3} placeholder="Enter category description" />
            </Form.Item>

            <Form.Item label="Category Logo">
              <Dragger
                name="file"
                accept="image/*"
                multiple={false}
                showUploadList={false}
                beforeUpload={() => false}
                onChange={handleEditLogoChange}
                fileList={editFileList}
              >
                <p className="ant-upload-text">Click or drag category image to upload</p>
              </Dragger>
              {editPreview && (
                <div className="mt-2" style={{ textAlign: 'center' }}>
                  <img
                    src={editPreview}
                    alt="Category Preview"
                    style={{
                      width: 80,
                      height: 80,
                      objectFit: 'contain',
                      borderRadius: 8,
                      border: '1px solid #eee',
                      background: '#fff',
                      padding: 4,
                    }}
                  />
                </div>
              )}
            </Form.Item>

            <Form.Item label="Status" name="status" valuePropName="checked">
              <Switch
                checkedChildren="Active"
                unCheckedChildren="Inactive"
              />
            </Form.Item>

            <div style={{ textAlign: 'right', marginTop: 16 }}>
              <Button onClick={closeEditModal} style={{ marginRight: 8 }}>
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={formLoading}
                className="btn-primary-gogreen"
              >
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
        title="Confirm Category Deletion"
        onOk={handleDelete}
        okText="Yes, Delete"
        okButtonProps={{ danger: true }}
        cancelText="Cancel"
        confirmLoading={formLoading}
        centered
      >
        <p style={{ margin: '16px 0', color: '#475569' }}>
          Are you sure you want to delete this category? This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
};

export default AllCategory;
