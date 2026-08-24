import React from "react";
import { Table, Input, Select, Button, Space, Modal, Form, Upload, Switch, Tag, Tooltip, Image } from "antd";
import { EditOutlined, DeleteOutlined, PlusOutlined, SearchOutlined, TagOutlined, CheckCircleOutlined, AppstoreOutlined } from "@ant-design/icons";
import useBrandHook from "./usebrandhook";
import { useNavigate } from "react-router-dom";
import "../../assets/scss/pages/productbrand.scss";

const { Option } = Select;

const AllBrands = () => {
  const navigate = useNavigate();
  const {
    data,
    loading,
    error,
    pagination,
    sorter,
    search,
    setSearch,
    categoryFilter,
    setCategoryFilter,
    categories,
    onTableChange,
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
  const [editFileList, setEditFileList] = React.useState([]);
  const [editPreview, setEditPreview] = React.useState("");

  React.useEffect(() => {
    if (editModal && selectedBrand) {
      setEditPreview(previewImage);
      setEditFileList([]);
      form.setFieldsValue({
        name: selectedBrand.name,
        description: selectedBrand.description,
        categoryid: selectedBrand.categoryid,
        status: selectedBrand.status === 1,
      });
    }
  }, [editModal, selectedBrand, previewImage, form]);

  const handleEditLogoChange = info => {
    let newFileList = info.fileList.slice(-1);
    setEditFileList(newFileList);
    const fileObj = newFileList[0]?.originFileObj;
    if (info.file.status === "removed" || !fileObj) {
      setEditPreview("");
      handleImageChange(null);
      return;
    }
    setEditPreview(URL.createObjectURL(fileObj));
    handleImageChange(fileObj);
  };

  const handleToggleActive = (brandId, isActive) => {
    const brand = data.find(b => b.id === brandId);
    if (brand) {
      updateStatus(brandId, isActive);
    }
  };

  const totalBrands = pagination.total || data.length;
  const activeBrands = data.filter(b => b.status === 1).length;

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
      title: 'Brand Name',
      dataIndex: 'name',
      key: 'name',
      sorter: true,
      render: (text) => <span style={{ fontWeight: 600, color: '#0f172a', fontSize: '14.5px' }}>{text}</span>,
    },
    {
      title: 'Category',
      dataIndex: 'category_name',
      key: 'category_name',
      sorter: true,
      width: 160,
      render: (cat) => <Tag color="blue" style={{ borderRadius: '6px', fontWeight: 500 }}>{cat || 'General'}</Tag>,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      width: 260,
      render: (text) => (
        <span style={{ color: '#475569', fontSize: 13 }} title={text}>
          {text || 'No description available'}
        </span>
      ),
    },
    {
      title: 'Logo',
      dataIndex: 'brand_logo',
      key: 'brand_logo',
      width: 90,
      align: 'center',
      render: (logo) =>
        logo ? (
          <Image
            src={logo.startsWith('http') ? logo : `${import.meta.env.VITE_IMAGE_BASE_URL}${logo}`}
            alt="Brand Logo"
            width={48}
            height={48}
            style={{ objectFit: 'cover', borderRadius: 8, border: '1px solid #e2e8f0' }}
          />
        ) : (
          <Tag color="default">No Image</Tag>
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
          <Tooltip title="Edit Brand">
            <Button
              type="text"
              icon={<EditOutlined style={{ color: '#0284c7', fontSize: 16 }} />}
              onClick={() => openEditModal(record)}
            />
          </Tooltip>
          <Tooltip title="Delete Brand">
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
    <div className="page-container">
      {/* Page Header */}
      <div className="page-header-card">
        <div className="header-title-block">
          <h2>Product Brands Management</h2>
          <p>Organize, add, edit, and classify manufacturer product brands across product categories.</p>
        </div>
        <Button
          type="primary"
          className="btn-primary-gogreen"
          icon={<PlusOutlined />}
          style={{ height: 42, padding: '0 20px' }}
          onClick={() => navigate('/add-Product-Brand')}
        >
          Add New Brand
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="page-stats-grid">
        <div className="page-stat-card">
          <div className="stat-meta">
            <div className="stat-label">Total Brands</div>
            <div className="stat-number">{totalBrands}</div>
          </div>
          <div className="stat-icon" style={{ background: '#e0f2fe', color: '#0284c7' }}>
            <TagOutlined />
          </div>
        </div>

        <div className="page-stat-card">
          <div className="stat-meta">
            <div className="stat-label">Active Brands</div>
            <div className="stat-number">{activeBrands}</div>
          </div>
          <div className="stat-icon" style={{ background: '#dcfce7', color: '#088b46' }}>
            <CheckCircleOutlined />
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

      {/* Main Content Card */}
      <div className="page-content-card">
        <Space style={{ marginBottom: 20, flexWrap: 'wrap' }}>
          <Input
            prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
            placeholder="Search brand name..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            allowClear
            style={{ width: 260, borderRadius: 8, height: 40 }}
          />
          <Select
            placeholder="Filter by Category"
            value={categoryFilter || undefined}
            onChange={val => setCategoryFilter(val)}
            allowClear
            showSearch
            style={{ width: 220, height: 40 }}
            filterOption={(input, option) =>
              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
          >
            {categories.map(cat => (
              <Option key={cat.id} value={cat.id}>{cat.name}</Option>
            ))}
          </Select>
        </Space>

        <Table
          columns={columns}
          dataSource={data}
          loading={loading}
          pagination={{
            ...pagination,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} brands`,
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
            onFinish={values => handleEditSave(values, editFileList[0]?.originFileObj)}
            initialValues={{
              name: selectedBrand.name,
              description: selectedBrand.description,
              categoryid: selectedBrand.categoryid,
              status: selectedBrand.status === 1,
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
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
              >
                {categories.map(cat => (
                  <Option key={cat.id} value={cat.id}>{cat.name}</Option>
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
                <div className="mt-2">
                  <img src={editPreview} alt="Brand Preview" style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8, border: '1px solid #eee' }} />
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
