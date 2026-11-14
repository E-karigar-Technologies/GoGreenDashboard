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
  Col,
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
  BranchesOutlined,
  PictureOutlined,
} from '@ant-design/icons';
import useSubcategoryHook from './usesubcatagory';

const { Dragger } = Upload;
const { Option } = Select;

// Fallback SVG data-URI for zero broken icons or overflowing alt text
const FALLBACK_NO_IMAGE =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60"><rect width="60" height="60" fill="%23f8fafc" rx="8"/><rect width="58" height="58" x="1" y="1" fill="none" stroke="%23cbd5e1" stroke-dasharray="3,3" rx="8"/><text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" fill="%2394a3b8" font-size="9" font-family="sans-serif" font-weight="600">No Image</text></svg>';

// Bulletproof fail-safe Logo Component that displays 'No Image' if missing or broken
const SubcategoryLogo = ({ src, size = 38, isExpanded = false }) => {
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

const AllSubCategory = () => {
  const navigate = useNavigate();
  const {
    data,
    loading,
    error,
    pagination,
    search,
    setSearch,
    parentFilter,
    setParentFilter,
    statusFilter,
    setStatusFilter,
    handleResetFilters,
    isFiltered,
    totalSubcategoriesCount,
    activeSubcategoriesCount,
    inactiveSubcategoriesCount,
    categories,
    onTableChange,
    handleToggleActive,
    editModal,
    openEditModal,
    closeEditModal,
    selectedSubcategory,
    previewImage,
    handleImageChange,
    formLoading,
    deleteModal,
    openDeleteModal,
    closeDeleteModal,
    handleEditSave,
    handleDelete,
    statusLoading,
    deleteLoading,
    fetchAll,
  } = useSubcategoryHook();

  const [form] = Form.useForm();
  const [editFileList, setEditFileList] = useState([]);
  const [editPreview, setEditPreview] = useState('');

  useEffect(() => {
    if (editModal && selectedSubcategory) {
      setEditPreview(previewImage);
      setEditFileList([]);
      form.setFieldsValue({
        name: selectedSubcategory.name,
        description: selectedSubcategory.description,
        category_id: selectedSubcategory.category_id,
        status: Number(selectedSubcategory.status) === 1,
      });
    }
  }, [editModal, selectedSubcategory, previewImage, form]);

  const handleEditLogoChange = (info) => {
    let newFileList = info.fileList.slice(-1);
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

  // Expandable Row Renderer - Detail View for Mobile & Compact Screens
  const renderExpandedRow = (record) => {
    const logoUrl = record.subcategory_logo
      ? record.subcategory_logo.startsWith('http')
        ? record.subcategory_logo
        : `${import.meta.env.VITE_IMAGE_BASE_URL}${record.subcategory_logo}`
      : null;

    return (
      <div
        style={{
          background: '#f8fafc',
          padding: '16px 20px',
          borderRadius: 8,
          border: '1px solid #e2e8f0',
          margin: '4px 0',
        }}
      >
        <Row gutter={[20, 16]} align="middle">
          {/* Col 1: Identity & Parent Category */}
          <Col xs={24} sm={12} md={7}>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: 700, color: '#64748b', marginBottom: 6 }}>
              Subcategory Identity
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div>
                <Tag color="cyan" style={{ borderRadius: 4, fontWeight: 700, fontSize: '12px' }}>
                  ID #{record.id}
                </Tag>
                <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '14px', marginLeft: 6 }}>
                  {record.name}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '12.5px' }}>
                <span style={{ color: '#64748b', fontWeight: 500 }}>Parent Category:</span>
                <Tag color="blue" icon={<AppstoreOutlined />} style={{ borderRadius: 6, fontWeight: 600 }}>
                  {record.category_name || 'General'}
                </Tag>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '12.5px' }}>
                <span style={{ color: '#64748b', fontWeight: 500 }}>Status:</span>
                {Number(record.status) === 1 ? (
                  <Tag color="success" icon={<CheckCircleOutlined />}>Active</Tag>
                ) : (
                  <Tag color="error" icon={<StopOutlined />}>Inactive</Tag>
                )}
              </div>
            </div>
          </Col>

          {/* Col 2: Full Description */}
          <Col xs={24} sm={12} md={9}>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: 700, color: '#64748b', marginBottom: 6 }}>
              Full Description & Notes
            </div>
            <div
              style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: 8,
                padding: '10px 14px',
                color: '#334155',
                fontSize: '12.5px',
                lineHeight: 1.5,
                maxHeight: 100,
                overflowY: 'auto',
              }}
            >
              {record.description ? (
                record.description
              ) : (
                <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>
                  No description provided for this subcategory.
                </span>
              )}
            </div>
          </Col>

          {/* Col 3: Logo Asset Preview */}
          <Col xs={24} sm={12} md={4} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: 700, color: '#64748b', marginBottom: 6, textAlign: 'left' }}>
              Subcategory Logo
            </div>
            <SubcategoryLogo src={logoUrl} size={68} isExpanded={true} />
          </Col>

          {/* Col 4: Quick Actions */}
          <Col xs={24} sm={12} md={4}>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: 700, color: '#64748b', marginBottom: 6 }}>
              Quick Actions
            </div>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button
                type="default"
                size="small"
                icon={<EditOutlined style={{ color: '#0284c7' }} />}
                onClick={() => openEditModal(record)}
                style={{ width: '100%', borderRadius: 6, fontWeight: 500 }}
              >
                Edit Subcategory
              </Button>
              <Button
                danger
                size="small"
                icon={<DeleteOutlined />}
                onClick={() => openDeleteModal(record)}
                style={{ width: '100%', borderRadius: 6, fontWeight: 500 }}
              >
                Delete
              </Button>
              <Button
                type="link"
                size="small"
                icon={<ShoppingOutlined />}
                onClick={() => navigate(`/products?sub_category=${record.id}`)}
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
      title: 'Subcategory',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => (a.name || '').localeCompare(b.name || ''),
      render: (name, record) => {
        const logoUrl = record.subcategory_logo
          ? record.subcategory_logo.startsWith('http')
            ? record.subcategory_logo
            : `${import.meta.env.VITE_IMAGE_BASE_URL}${record.subcategory_logo}`
          : null;

        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <SubcategoryLogo src={logoUrl} size={38} isExpanded={false} />
            <div style={{ minWidth: 0, flex: 1 }}>
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
      title: 'Parent Category',
      dataIndex: 'category_name',
      key: 'category_name',
      width: 170,
      sorter: (a, b) => (a.category_name || '').localeCompare(b.category_name || ''),
      render: (cat) => (
        <Tag color="blue" icon={<AppstoreOutlined />} style={{ borderRadius: 6, fontWeight: 500, fontSize: '12px' }}>
          {cat || 'General'}
        </Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 115,
      align: 'center',
      render: (status, record) => (
        <Switch
          checked={Number(status) === 1}
          checkedChildren="Active"
          unCheckedChildren="Inactive"
          loading={statusLoading[record?.id]}
          onChange={(checked) => handleToggleActive(record.id, checked ? 1 : 0)}
        />
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      align: 'center',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Edit Subcategory">
            <Button
              type="text"
              icon={<EditOutlined style={{ color: '#0284c7', fontSize: 16 }} />}
              onClick={() => openEditModal(record)}
            />
          </Tooltip>
          <Tooltip title="Delete Subcategory">
            <Button
              type="text"
              icon={<DeleteOutlined style={{ color: '#ef4444', fontSize: 16 }} />}
              onClick={() => openDeleteModal(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="page-container" style={{ padding: '24px 28px', maxWidth: '100%', boxSizing: 'border-box' }}>
      {/* Header Card */}
      <div
        className="page-header-card"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
          marginBottom: 20,
        }}
      >
        <div className="header-title-block">
          <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 700, color: '#0f172a' }}>
            Product Subcategories
          </h2>
          <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '13px' }}>
            Organize secondary product groupings, associate with parent categories, and manage store sub-level section logos.
          </p>
        </div>
        <Space>
          <Tooltip title="Refresh subcategories">
            <Button icon={<ReloadOutlined spin={loading} />} onClick={fetchAll} style={{ borderRadius: 8, height: 40 }} />
          </Tooltip>
          <Button
            type="primary"
            className="btn-primary-gogreen"
            icon={<PlusOutlined />}
            style={{ height: 40, borderRadius: 8, fontWeight: 600, padding: '0 20px' }}
            onClick={() => navigate('/add-subcategory')}
          >
            Add Subcategory
          </Button>
        </Space>
      </div>

      {/* Stats Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: 16,
          marginBottom: 20,
        }}
      >
        <div
          style={{
            background: '#ffffff',
            padding: '16px 20px',
            borderRadius: 12,
            border: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <div style={{ color: '#64748b', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' }}>
              Total Subcategories
            </div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a', marginTop: 4 }}>
              {totalSubcategoriesCount}
            </div>
          </div>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 10,
              background: '#e0f2fe',
              color: '#0284c7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 20,
            }}
          >
            <BranchesOutlined />
          </div>
        </div>

        <div
          style={{
            background: '#ffffff',
            padding: '16px 20px',
            borderRadius: 12,
            border: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <div style={{ color: '#64748b', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' }}>
              Active Subcategories
            </div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#16a34a', marginTop: 4 }}>
              {activeSubcategoriesCount}
            </div>
          </div>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 10,
              background: '#dcfce7',
              color: '#16a34a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 20,
            }}
          >
            <CheckCircleOutlined />
          </div>
        </div>

        <div
          style={{
            background: '#ffffff',
            padding: '16px 20px',
            borderRadius: 12,
            border: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <div style={{ color: '#64748b', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' }}>
              Inactive Subcategories
            </div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#ef4444', marginTop: 4 }}>
              {inactiveSubcategoriesCount}
            </div>
          </div>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 10,
              background: '#fee2e2',
              color: '#ef4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 20,
            }}
          >
            <StopOutlined />
          </div>
        </div>

        <div
          style={{
            background: '#ffffff',
            padding: '16px 20px',
            borderRadius: 12,
            border: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <div style={{ color: '#64748b', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' }}>
              Parent Categories
            </div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#9333ea', marginTop: 4 }}>
              {categories.length}
            </div>
          </div>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 10,
              background: '#f3e8ff',
              color: '#9333ea',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 20,
            }}
          >
            <AppstoreOutlined />
          </div>
        </div>
      </div>

      {/* Filter and Content Card */}
      <div
        className="page-content-card"
        style={{
          background: '#ffffff',
          padding: '20px 24px',
          borderRadius: 12,
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
        }}
      >
        {/* Dynamic Filter Bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 12,
            marginBottom: 20,
          }}
        >
          <Space style={{ flexWrap: 'wrap', gap: 12 }}>
            <Input
              prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
              placeholder="Search subcategory name or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              allowClear
              style={{ width: 280, borderRadius: 8, height: 38 }}
            />

            <Select
              placeholder="Filter by Parent Category"
              value={parentFilter || undefined}
              onChange={(val) => setParentFilter(val || null)}
              allowClear
              showSearch
              style={{ width: 220, height: 38 }}
              filterOption={(input, option) =>
                option?.children?.toLowerCase().includes(input.toLowerCase())
              }
            >
              {categories.map((cat) => (
                <Option key={cat.id} value={cat.id}>
                  {cat.name}
                </Option>
              ))}
            </Select>

            <Select
              placeholder="Filter Status"
              value={statusFilter}
              onChange={(val) => setStatusFilter(val)}
              style={{ width: 150, height: 38 }}
            >
              <Option value="all">All Statuses</Option>
              <Option value="active">Active Only</Option>
              <Option value="inactive">Inactive Only</Option>
            </Select>

            {isFiltered && (
              <Button
                type="dashed"
                danger
                onClick={handleResetFilters}
                style={{ height: 38, borderRadius: 8, fontWeight: 500 }}
              >
                Reset Filters
              </Button>
            )}
          </Space>

          <div>
            <Tag color={isFiltered ? 'geekblue' : 'default'} style={{ padding: '4px 10px', borderRadius: 6, fontSize: '12px' }}>
              Showing {data.length} of {pagination.total} subcategories
            </Tag>
          </div>
        </div>

        {/* Clean Responsive Table with ZERO Horizontal Scroll */}
        <Table
          columns={columns}
          dataSource={data}
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50'],
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} subcategories`,
          }}
          onChange={onTableChange}
          rowKey={(record) => record?.id}
          expandable={{
            expandedRowRender: renderExpandedRow,
            rowExpandable: () => true,
            expandIcon: ({ expanded, onExpand, record }) => (
              <button
                type="button"
                onClick={(e) => onExpand(record, e)}
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: '50%',
                  border: expanded ? '1px solid #cbd5e1' : '1px solid #86efac',
                  background: expanded ? '#f1f5f9' : '#f0fdf4',
                  color: expanded ? '#64748b' : '#16a34a',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: 11,
                  padding: 0,
                  transition: 'all 0.2s',
                }}
                title={expanded ? 'Collapse row details' : 'Expand row details'}
              >
                {expanded ? <MinusOutlined /> : <PlusOutlined />}
              </button>
            ),
          }}
        />
      </div>

      {/* Edit Modal */}
      <Modal
        open={editModal}
        onCancel={closeEditModal}
        title="Edit Subcategory Details"
        footer={null}
        destroyOnClose
        centered
        width={600}
      >
        {selectedSubcategory && (
          <Form
            form={form}
            layout="vertical"
            onFinish={(values) => handleEditSave(values, editFileList[0]?.originFileObj)}
            initialValues={{
              name: selectedSubcategory.name,
              description: selectedSubcategory.description,
              category_id: selectedSubcategory.category_id,
              status: Number(selectedSubcategory.status) === 1,
            }}
          >
            <Form.Item
              label="Subcategory Name"
              name="name"
              rules={[{ required: true, message: 'Please enter subcategory name' }]}
            >
              <Input placeholder="Enter subcategory name" />
            </Form.Item>

            <Form.Item
              label="Parent Category"
              name="category_id"
              rules={[{ required: true, message: 'Please select a parent category' }]}
            >
              <Select
                placeholder="Select Category"
                showSearch
                filterOption={(input, option) =>
                  option?.children?.toLowerCase().includes(input.toLowerCase())
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
              <Input.TextArea rows={3} placeholder="Enter subcategory description" />
            </Form.Item>

            <Form.Item label="Subcategory Logo">
              <Dragger
                name="file"
                accept="image/*"
                multiple={false}
                showUploadList={false}
                beforeUpload={() => false}
                onChange={handleEditLogoChange}
                fileList={editFileList}
              >
                <p className="ant-upload-text">Click or drag subcategory logo image to upload</p>
              </Dragger>
              {editPreview && (
                <div style={{ marginTop: 12 }}>
                  <img
                    src={editPreview}
                    alt=""
                    style={{
                      width: 80,
                      height: 80,
                      objectFit: 'contain',
                      borderRadius: 8,
                      border: '1px solid #e2e8f0',
                      background: '#ffffff',
                    }}
                  />
                </div>
              )}
            </Form.Item>

            <Form.Item label="Status" name="status" valuePropName="checked">
              <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
            </Form.Item>

            <div style={{ textAlign: 'right', marginTop: 16 }}>
              <Button onClick={closeEditModal} style={{ marginRight: 8, borderRadius: 6 }}>
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={formLoading}
                className="btn-primary-gogreen"
                style={{ borderRadius: 6 }}
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
        title="Confirm Deletion"
        onOk={handleDelete}
        okText="Yes, Delete"
        okButtonProps={{ danger: true }}
        cancelText="Cancel"
        confirmLoading={deleteLoading}
        centered
      >
        <p style={{ margin: '16px 0', color: '#475569' }}>
          Are you sure you want to delete this subcategory?
        </p>
      </Modal>

      {error && <div style={{ color: 'red', marginTop: 16 }}>{error}</div>}
    </div>
  );
};

export default AllSubCategory;
