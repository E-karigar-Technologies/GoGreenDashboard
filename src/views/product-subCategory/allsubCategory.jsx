import React from "react";
import { Table, Input, Select, Switch, Button, Space, Modal, Form, Upload, Tag, Tooltip, Image } from "antd";
import { EditOutlined, DeleteOutlined, PlusOutlined, SearchOutlined, BranchesOutlined, CheckCircleOutlined, StopOutlined, AppstoreOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import useSubcategoryHook from "./usesubcatagory";

const { Option } = Select;

const AllSubCategory = () => {
  const navigate = useNavigate();
  const {
    data,
    loading,
    error,
    pagination,
    sorter,
    search,
    setSearch,
    parentFilter,
    setParentFilter,
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
  } = useSubcategoryHook();

  const [form] = Form.useForm();
  const [editFileList, setEditFileList] = React.useState([]);
  const [editPreview, setEditPreview] = React.useState("");

  React.useEffect(() => {
    if (editModal && selectedSubcategory) {
      setEditPreview(previewImage);
      setEditFileList([]);
      form.setFieldsValue({
        name: selectedSubcategory.name,
        description: selectedSubcategory.description,
        category_id: selectedSubcategory.category_id,
        status: selectedSubcategory.status === 1,
      });
    }
  }, [editModal, selectedSubcategory, previewImage, form]);

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

  const totalSubcategories = pagination.total || data.length;
  const activeSubcategories = data.filter(s => s.status === 1).length;
  const inactiveSubcategories = data.filter(s => s.status !== 1).length;

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
      dataIndex: 'subcategory_logo',
      key: 'subcategory_logo',
      width: 90,
      align: 'center',
      render: (logo) =>
        logo ? (
          <Image
            src={logo.startsWith('http') ? logo : `${import.meta.env.VITE_IMAGE_BASE_URL}${logo}`}
            alt="Subcategory Logo"
            width={48}
            height={48}
            style={{ objectFit: 'cover', borderRadius: 8, border: '1px solid #e2e8f0' }}
          />
        ) : (
          <Tag color="default">No Image</Tag>
        ),
    },
    {
      title: 'Subcategory Name',
      dataIndex: 'name',
      key: 'name',
      sorter: true,
      render: (text) => <span style={{ fontWeight: 600, color: '#0f172a', fontSize: '14.5px' }}>{text}</span>,
    },
    {
      title: 'Parent Category',
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
          loading={statusLoading[record?.id]}
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
    <div className="page-container">
      {/* Header Card */}
      <div className="page-header-card">
        <div className="header-title-block">
          <h2>Product Sub-Categories Directory</h2>
          <p>Organize secondary product groupings, associate with parent categories, and manage store sub-level section logos.</p>
        </div>
        <Button
          type="primary"
          className="btn-primary-gogreen"
          icon={<PlusOutlined />}
          style={{ height: 42, padding: '0 20px' }}
          onClick={() => navigate('/add-subcategory')}
        >
          Add Subcategory
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="page-stats-grid">
        <div className="page-stat-card">
          <div className="stat-meta">
            <div className="stat-label">Total Subcategories</div>
            <div className="stat-number">{totalSubcategories}</div>
          </div>
          <div className="stat-icon" style={{ background: '#e0f2fe', color: '#0284c7' }}>
            <BranchesOutlined />
          </div>
        </div>

        <div className="page-stat-card">
          <div className="stat-meta">
            <div className="stat-label">Active Subcategories</div>
            <div className="stat-number">{activeSubcategories}</div>
          </div>
          <div className="stat-icon" style={{ background: '#dcfce7', color: '#088b46' }}>
            <CheckCircleOutlined />
          </div>
        </div>

        <div className="page-stat-card">
          <div className="stat-meta">
            <div className="stat-label">Parent Categories</div>
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
            placeholder="Search subcategory name..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            allowClear
            style={{ width: 260, borderRadius: 8, height: 40 }}
          />
          <Select
            placeholder="Filter by Parent Category"
            value={parentFilter || undefined}
            onChange={val => setParentFilter(val)}
            allowClear
            showSearch
            style={{ width: 240, height: 40 }}
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
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} subcategories`,
          }}
          onChange={onTableChange}
          rowKey={record => record?.id}
          scroll={{ x: 'max-content' }}
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
            onFinish={values => handleEditSave(values, editFileList[0]?.originFileObj)}
            initialValues={{
              name: selectedSubcategory.name,
              description: selectedSubcategory.description,
              category_id: selectedSubcategory.category_id,
              status: selectedSubcategory.status === 1,
            }}
          >
            <Form.Item label="Subcategory Name" name="name" rules={[{ required: true, message: 'Please enter subcategory name' }]}> 
              <Input placeholder="Enter subcategory name" />
            </Form.Item>

            <Form.Item label="Parent Category" name="category_id" rules={[{ required: true, message: 'Please select a parent category' }]}> 
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
              <Input.TextArea rows={3} placeholder="Enter subcategory description" />
            </Form.Item>

            <Form.Item label="Subcategory Logo">
              <Upload.Dragger
                name="file"
                accept="image/*"
                multiple={false}
                showUploadList={false}
                beforeUpload={() => false}
                onChange={handleEditLogoChange}
                fileList={editFileList}
              >
                <p className="ant-upload-text">Click or drag subcategory logo image to upload</p>
              </Upload.Dragger>
              {editPreview && (
                <div className="mt-2">
                  <img src={editPreview} alt="Subcategory Preview" style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8, border: '1px solid #eee' }} />
                </div>
              )}
            </Form.Item>

            <Form.Item label="Status" name="status" valuePropName="checked">
              <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
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
