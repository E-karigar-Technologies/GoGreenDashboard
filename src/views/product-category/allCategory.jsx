import React from 'react';
import { Table, Button, Switch, Space, Modal, Form, Input, Upload, message, Tag, Tooltip, Image } from 'antd';
import { useNavigate } from 'react-router-dom';
import { EditOutlined, DeleteOutlined, PlusOutlined, SearchOutlined, AppstoreOutlined, CheckCircleOutlined, StopOutlined } from '@ant-design/icons';
import useCatagoryHook from './useCatagoryHook';

const { Dragger } = Upload;

const AllCategory = () => {
  const {
    data,
    loading,
    pagination,
    sorter,
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
  } = useCatagoryHook();

  const [form] = Form.useForm();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (editModal && selectedCategory) {
      form.setFieldsValue({
        name: selectedCategory.name,
        description: selectedCategory.description,
        status: selectedCategory.status,
      });
    }
  }, [editModal, selectedCategory, form]);

  const totalCategories = pagination.total || data.length;
  const activeCategories = data.filter(c => c.status === 1).length;
  const inactiveCategories = data.filter(c => c.status !== 1).length;

  const columns = [
    {
      title: '#',
      dataIndex: 'sr',
      key: 'sr',
      width: 60,
      align: 'center',
      render: (_, __, idx) => <span style={{ fontWeight: 600, color: '#64748b' }}>#{(pagination.current - 1) * pagination.pageSize + idx + 1}</span>,
    },
    {
      title: 'Logo',
      dataIndex: 'category_logo',
      key: 'category_logo',
      width: 90,
      align: 'center',
      render: (logo) =>
        logo && typeof logo === 'string' ? (
          <Image
            src={logo?.startsWith('http') ? logo : `${import.meta.env.VITE_IMAGE_BASE_URL}${logo}`}
            alt="Category Logo"
            width={48}
            height={48}
            style={{ objectFit: 'cover', borderRadius: 8, border: '1px solid #e2e8f0' }}
          />
        ) : (
          <Tag color="default">No Image</Tag>
        ),
    },
    {
      title: 'Category Name',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <span style={{ fontWeight: 600, color: '#0f172a', fontSize: '14.5px' }}>{text}</span>,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (text) => (
        <span style={{ color: '#475569', fontSize: 13 }} title={text}>
          {text || 'No description provided'}
        </span>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      align: 'center',
      render: (status, record) => (
        <Switch
          checked={status === 1}
          checkedChildren="Active"
          unCheckedChildren="Inactive"
          onChange={checked => handleToggleActive(record.id, checked ? 1 : 0)}
        />
      ),
    },
    {
      title: 'Actions',
      key: 'action',
      width: 110,
      align: 'center',
      render: (_, record) => (
        <Space>
          <Tooltip title="Edit Category">
            <Button
              type="text"
              icon={<EditOutlined style={{ color: '#0284c7', fontSize: 16 }} />}
              onClick={() => openEditModal(record)}
            />
          </Tooltip>
          <Tooltip title="Delete Category">
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

  const onEditFinish = (values) => {
    handleSave({ ...selectedCategory, ...values });
  };

  return (
    <div className="page-container">
      {/* Header Card */}
      <div className="page-header-card">
        <div className="header-title-block">
          <h2>Product Categories Directory</h2>
          <p>Organize top-level product classifications, store section listings, and custom store logos.</p>
        </div>
        <Button
          type="primary"
          className="btn-primary-gogreen"
          icon={<PlusOutlined />}
          style={{ height: 42, padding: '0 20px' }}
          onClick={() => navigate('/add-category')}
        >
          Add Category
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="page-stats-grid">
        <div className="page-stat-card">
          <div className="stat-meta">
            <div className="stat-label">Total Categories</div>
            <div className="stat-number">{totalCategories}</div>
          </div>
          <div className="stat-icon" style={{ background: '#e0f2fe', color: '#0284c7' }}>
            <AppstoreOutlined />
          </div>
        </div>

        <div className="page-stat-card">
          <div className="stat-meta">
            <div className="stat-label">Active Categories</div>
            <div className="stat-number">{activeCategories}</div>
          </div>
          <div className="stat-icon" style={{ background: '#dcfce7', color: '#088b46' }}>
            <CheckCircleOutlined />
          </div>
        </div>

        <div className="page-stat-card">
          <div className="stat-meta">
            <div className="stat-label">Inactive Categories</div>
            <div className="stat-number">{inactiveCategories}</div>
          </div>
          <div className="stat-icon" style={{ background: '#f1f5f9', color: '#64748b' }}>
            <StopOutlined />
          </div>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="page-content-card">
        <div style={{ marginBottom: 20 }}>
          <Input
            prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
            placeholder="Search category name..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            allowClear
            style={{ width: 280, borderRadius: 8, height: 40 }}
          />
        </div>

        <Table
          columns={columns}
          dataSource={data}
          loading={loading}
          pagination={{
            ...pagination,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} categories`,
          }}
          onChange={onTableChange}
          rowKey={record => record.id}
          scroll={{ x: 'max-content' }}
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
              status: selectedCategory.status,
            }}
          >
            <Form.Item label="Category Name" name="name" rules={[{ required: true, message: 'Please enter category name' }]}> 
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
                beforeUpload={file => {
                  handleImageChange(file);
                  return false;
                }}
              >
                <p className="ant-upload-text">Click or drag category image to upload</p>
              </Dragger>
              {previewImage && (
                <div className="mt-2">
                  <img src={previewImage} alt="Category Preview" style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8, border: '1px solid #eee' }} />
                </div>
              )}
            </Form.Item>

            <Form.Item label="Status" name="status" valuePropName="checked">
              <Switch
                checkedChildren="Active"
                unCheckedChildren="Inactive"
                checked={form.getFieldValue('status') === 1}
                onChange={checked => form.setFieldsValue({ status: checked ? 1 : 0 })}
              />
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
        title="Confirm Deletion"
        onOk={handleDelete}
        okText="Yes, Delete"
        okButtonProps={{ danger: true }}
        cancelText="Cancel"
        confirmLoading={formLoading}
        centered
      >
        <p style={{ margin: '16px 0', color: '#475569' }}>
          Are you sure you want to delete this category?
        </p>
      </Modal>
    </div>
  );
};

export default AllCategory;
