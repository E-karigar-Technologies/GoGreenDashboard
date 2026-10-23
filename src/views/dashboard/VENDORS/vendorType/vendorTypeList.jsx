import React, { useState, useMemo } from 'react';
import {
  Table,
  Button,
  Input,
  Badge,
  Modal,
  Form,
  Upload,
  Switch,
  Space,
  Tag,
  Tooltip,
  Image,
  Drawer,
  Avatar,
  Empty,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  UploadOutlined,
  DeleteOutlined,
  SearchOutlined,
  ShopOutlined,
  CheckCircleOutlined,
  StopOutlined,
  ExclamationCircleOutlined,
  EyeOutlined,
  ArrowRightOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import useVendorType from './hooks/useVendorType';

const VendorTypeList = () => {
  const navigate = useNavigate();
  const [tablePagination, setTablePagination] = useState({ current: 1, pageSize: 10 });
  const [drawerSearch, setDrawerSearch] = useState('');
  const [drawerPagination, setDrawerPagination] = useState({ current: 1, pageSize: 10 });

  const {
    loading,
    search,
    setSearch,
    handleSearch,
    filteredVendorTypes,
    openAddModal,
    closeAddModal,
    addModalOpen,
    handleAdd,
    formValues,
    setFormValues,
    handleIconDrop,
    openEditModal,
    closeEditModal,
    editModalOpen,
    handleEdit,
    editRecord,
    handleStatusSwitch,
    deleteConfirmOpen,
    deletingId,
    requestDelete,
    cancelDelete,
    confirmDelete,
    // Vendor drawer state
    selectedVendorType,
    vendorsDrawerOpen,
    openVendorsDrawer,
    closeVendorsDrawer,
  } = useVendorType();

  const totalTypes = filteredVendorTypes.length;
  const activeTypes = filteredVendorTypes.filter((v) => v.status === 'active').length;
  const inactiveTypes = filteredVendorTypes.filter((v) => v.status !== 'active').length;

  // Vendors list for selected vendor type
  const rawVendors = useMemo(() => {
    if (!selectedVendorType) return [];
    return Array.isArray(selectedVendorType.vendors) ? selectedVendorType.vendors : [];
  }, [selectedVendorType]);

  const filteredDrawerVendors = useMemo(() => {
    if (!drawerSearch.trim()) return rawVendors;
    const q = drawerSearch.toLowerCase().trim();
    return rawVendors.filter((v) => {
      const store = String(v.store_name || v.name || '').toLowerCase();
      const vId = String(v.vendor_id || v.id || '');
      const uId = String(v.user_id || '');
      return store.includes(q) || vId.includes(q) || uId.includes(q);
    });
  }, [rawVendors, drawerSearch]);

  const columns = [
    {
      title: '#',
      key: 'srno',
      width: 60,
      align: 'center',
      render: (_, __, index) => (
        <span style={{ fontWeight: 600, color: '#64748b' }}>
          #{(tablePagination.current - 1) * tablePagination.pageSize + index + 1}
        </span>
      ),
    },
    {
      title: 'Icon',
      dataIndex: 'vendor_type_image',
      key: 'icon',
      width: 80,
      align: 'center',
      render: (icon) =>
        icon ? (
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 10,
              overflow: 'hidden',
              border: '1px solid #e2e8f0',
              background: '#f8fafc',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
            }}
          >
            <Image src={icon} alt="icon" width={32} height={32} style={{ objectFit: 'contain' }} />
          </div>
        ) : (
          <Tag color="default">No Icon</Tag>
        ),
    },
    {
      title: 'Vendor Type Name',
      dataIndex: 'vendor_type',
      key: 'vendor_type',
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '14.5px' }}>
            {text || 'Unnamed Type'}
          </div>
          <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>
            ID: #{record._id || record.id}
          </div>
        </div>
      ),
    },
    {
      title: 'Vendors Count',
      dataIndex: 'vendor_count',
      key: 'vendor_count',
      width: 160,
      align: 'center',
      sorter: (a, b) => {
        const countA = Number(a.vendor_count ?? a.count ?? (Array.isArray(a.vendors) ? a.vendors.length : 0));
        const countB = Number(b.vendor_count ?? b.count ?? (Array.isArray(b.vendors) ? b.vendors.length : 0));
        return countA - countB;
      },
      render: (_, record) => {
        const count =
          record.vendor_count !== undefined && record.vendor_count !== null
            ? Number(record.vendor_count)
            : record.count !== undefined && record.count !== null
            ? Number(record.count)
            : Array.isArray(record.vendors)
            ? record.vendors.length
            : 0;

        return (
          <Tooltip title={`Click to view all ${count} vendors of "${record.vendor_type}"`}>
            <Button
              type="link"
              onClick={() => {
                setDrawerSearch('');
                setDrawerPagination({ current: 1, pageSize: 10 });
                openVendorsDrawer(record);
              }}
              style={{ padding: 0, height: 'auto', fontWeight: 700 }}
            >
              <Tag
                color={count > 0 ? 'green' : 'default'}
                style={{
                  borderRadius: 12,
                  padding: '4px 12px',
                  fontWeight: 700,
                  fontSize: '12.5px',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  border: count > 0 ? '1px solid #86efac' : '1px solid #e2e8f0',
                  boxShadow: count > 0 ? '0 1px 3px rgba(8, 139, 70, 0.12)' : 'none',
                }}
              >
                <ShopOutlined />
                <span>{count} Vendors</span>
              </Tag>
            </Button>
          </Tooltip>
        );
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 150,
      align: 'center',
      render: (status, record) => (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <Switch
            checked={status === 'active'}
            onChange={() => handleStatusSwitch(record._id || record.id, status)}
            checkedChildren="Active"
            unCheckedChildren="Inactive"
          />
          <Tag color={status === 'active' ? 'success' : 'default'} style={{ borderRadius: 12, padding: '0 8px' }}>
            {status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Inactive'}
          </Tag>
        </div>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 140,
      align: 'center',
      render: (_, record) => (
        <Space>
          <Tooltip title="View Vendors in Category">
            <Button
              type="text"
              icon={<EyeOutlined style={{ color: '#088b46', fontSize: 16 }} />}
              onClick={() => {
                setDrawerSearch('');
                setDrawerPagination({ current: 1, pageSize: 10 });
                openVendorsDrawer(record);
              }}
            />
          </Tooltip>
          <Tooltip title="Edit Vendor Type">
            <Button
              type="text"
              icon={<EditOutlined style={{ color: '#0284c7', fontSize: 16 }} />}
              onClick={() => openEditModal(record)}
            />
          </Tooltip>
          <Tooltip title="Delete Vendor Type">
            <Button
              type="text"
              icon={<DeleteOutlined style={{ color: '#ef4444', fontSize: 16 }} />}
              loading={deletingId === (record._id || record.id)}
              onClick={() => requestDelete(record._id || record.id)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const uploadProps = {
    accept: 'image/*',
    showUploadList: false,
    beforeUpload: (file) => {
      handleIconDrop(file);
      return false;
    },
  };

  return (
    <div className="page-container">
      {/* Header Card */}
      <div className="page-header-card">
        <div className="header-title-block">
          <h2>Vendor Types Management</h2>
          <p>
            Configure business categories, store classification types, view total registered vendors count, and manage merchant availability.
          </p>
        </div>
        <Button
          type="primary"
          className="btn-primary-gogreen"
          icon={<PlusOutlined />}
          style={{ height: 42, padding: '0 20px', background: '#088b46', border: 'none', borderRadius: 8, fontWeight: 600 }}
          onClick={openAddModal}
        >
          Add Vendor Type
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="page-stats-grid">
        <div className="page-stat-card">
          <div className="stat-meta">
            <div className="stat-label">Total Vendor Types</div>
            <div className="stat-number">{totalTypes}</div>
          </div>
          <div className="stat-icon" style={{ background: '#e0f2fe', color: '#0284c7' }}>
            <ShopOutlined />
          </div>
        </div>

        <div className="page-stat-card">
          <div className="stat-meta">
            <div className="stat-label">Active Types</div>
            <div className="stat-number">{activeTypes}</div>
          </div>
          <div className="stat-icon" style={{ background: '#dcfce7', color: '#088b46' }}>
            <CheckCircleOutlined />
          </div>
        </div>

        <div className="page-stat-card">
          <div className="stat-meta">
            <div className="stat-label">Inactive Types</div>
            <div className="stat-number">{inactiveTypes}</div>
          </div>
          <div className="stat-icon" style={{ background: '#f1f5f9', color: '#64748b' }}>
            <StopOutlined />
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="page-content-card">
        <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <Input
            prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
            placeholder="Search by vendor type name..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              handleSearch(e.target.value);
            }}
            allowClear
            style={{ width: 300, borderRadius: 8, height: 40 }}
          />
          <Badge
            count={`Showing ${filteredVendorTypes.length} types`}
            style={{ backgroundColor: '#f1f5f9', color: '#475569', fontWeight: 600, border: '1px solid #cbd5e1' }}
          />
        </div>

        <Table
          columns={columns}
          dataSource={filteredVendorTypes}
          rowKey={(record) => record._id || record.id}
          loading={loading}
          pagination={{
            current: tablePagination.current,
            pageSize: tablePagination.pageSize,
            total: filteredVendorTypes.length,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50'],
            onChange: (page, pageSize) => setTablePagination({ current: page, pageSize }),
            onShowSizeChange: (current, size) => setTablePagination({ current: 1, pageSize: size }),
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} vendor types`,
          }}
        />
      </div>

      {/* Slide-over Drawer: List of Vendors for Selected Vendor Type */}
      <Drawer
        open={vendorsDrawerOpen}
        onClose={closeVendorsDrawer}
        width={620}
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {selectedVendorType?.vendor_type_image ? (
              <img
                src={selectedVendorType.vendor_type_image}
                alt="Type"
                style={{ width: 36, height: 36, borderRadius: 8, objectFit: 'contain', background: '#f8fafc', padding: 2 }}
              />
            ) : (
              <Avatar style={{ backgroundColor: '#088b46' }} icon={<ShopOutlined />} />
            )}
            <div>
              <div style={{ fontWeight: 800, fontSize: 16, color: '#0f172a' }}>
                {selectedVendorType?.vendor_type ? selectedVendorType.vendor_type.trim() : 'Vendor Type'} — Vendors
              </div>
              <div style={{ fontSize: 12, color: '#64748b' }}>
                Category ID: #{selectedVendorType?.id || selectedVendorType?._id} • Total: {rawVendors.length} vendors
              </div>
            </div>
          </div>
        }
        footer={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12.5, color: '#64748b' }}>
              Showing <strong>{filteredDrawerVendors.length}</strong> of <strong>{rawVendors.length}</strong> vendor{rawVendors.length === 1 ? '' : 's'}
            </span>
            <Button
              type="primary"
              icon={<ArrowRightOutlined />}
              onClick={() => {
                closeVendorsDrawer();
                navigate('/vendors');
              }}
              style={{ background: '#088b46', border: 'none', borderRadius: 6, fontWeight: 600 }}
            >
              Open Vendor Directory
            </Button>
          </div>
        }
      >
        {selectedVendorType && (
          <div>
            {/* Search within Drawer */}
            <div style={{ marginBottom: 16 }}>
              <Input
                placeholder="Search by store name, vendor ID, or user ID..."
                prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
                value={drawerSearch}
                onChange={(e) => {
                  setDrawerSearch(e.target.value);
                  setDrawerPagination((prev) => ({ ...prev, current: 1 }));
                }}
                allowClear
                style={{ borderRadius: 6, height: 38 }}
              />
            </div>

            {/* Vendors Table */}
            {filteredDrawerVendors.length === 0 ? (
              <Empty
                description={
                  <span style={{ color: '#94a3b8' }}>
                    {rawVendors.length === 0
                      ? `No vendors registered under "${selectedVendorType.vendor_type}".`
                      : 'No vendors match your search.'}
                  </span>
                }
                style={{ padding: '60px 0' }}
              />
            ) : (
              <Table
                dataSource={filteredDrawerVendors}
                rowKey={(v, idx) => v.vendor_id || v.id || idx}
                size="small"
                pagination={{
                  current: drawerPagination.current,
                  pageSize: drawerPagination.pageSize,
                  total: filteredDrawerVendors.length,
                  showSizeChanger: true,
                  pageSizeOptions: ['5', '10', '20'],
                  onChange: (page, pageSize) => setDrawerPagination({ current: page, pageSize }),
                  showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} vendors`,
                }}
                columns={[
                  {
                    title: '#',
                    key: 'index',
                    width: 50,
                    align: 'center',
                    render: (_, __, idx) => (
                      <span style={{ color: '#94a3b8', fontSize: 12 }}>
                        {(drawerPagination.current - 1) * drawerPagination.pageSize + idx + 1}
                      </span>
                    ),
                  },
                  {
                    title: 'Store Name',
                    key: 'store_name',
                    render: (_, v) => {
                      const targetId = v.user_id || v.vendor_id || v.id;
                      return (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <Avatar
                            size={34}
                            icon={<ShopOutlined />}
                            style={{ backgroundColor: '#088b46', flexShrink: 0 }}
                          />
                          <span
                            style={{
                              fontWeight: 600,
                              color: '#0f172a',
                              fontSize: 14,
                              cursor: 'pointer',
                            }}
                            onClick={() => {
                              closeVendorsDrawer();
                              navigate(`/vendors/${targetId}`);
                            }}
                          >
                            {v.store_name || 'Unnamed Store'}
                          </span>
                        </div>
                      );
                    },
                  },
                  {
                    title: 'Action',
                    key: 'action',
                    width: 90,
                    align: 'center',
                    render: (_, v) => {
                      const targetId = v.user_id || v.vendor_id || v.id;
                      return (
                        <Tooltip title="View Vendor Profile">
                          <Button
                            type="primary"
                            size="small"
                            icon={<EyeOutlined />}
                            onClick={() => {
                              closeVendorsDrawer();
                              navigate(`/vendors/${targetId}`);
                            }}
                            style={{
                              background: '#088b46',
                              border: 'none',
                              borderRadius: 6,
                              fontWeight: 600,
                              fontSize: 12,
                            }}
                          >
                            View
                          </Button>
                        </Tooltip>
                      );
                    },
                  },
                ]}
              />
            )}
          </div>
        )}
      </Drawer>

      {/* Add Modal */}
      <Modal
        open={addModalOpen}
        onCancel={closeAddModal}
        onOk={handleAdd}
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 18, fontWeight: 700 }}>
            <PlusOutlined style={{ color: '#088b46' }} /> Add Vendor Type
          </div>
        }
        okText="Create Type"
        okButtonProps={{ style: { background: '#088b46', border: 'none', borderRadius: 6 } }}
        cancelButtonProps={{ style: { borderRadius: 6 } }}
        centered
        destroyOnClose
        confirmLoading={loading}
        width={550}
      >
        <Form layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item label="Vendor Type Name" required>
            <Input
              value={formValues.vendor_type}
              onChange={(e) => setFormValues((fv) => ({ ...fv, vendor_type: e.target.value }))}
              placeholder="Enter type name (e.g. Grocery, Pharmacy, Electronics)"
            />
          </Form.Item>
          <Form.Item label="Type Icon Image" required>
            <Upload.Dragger {...uploadProps} style={{ padding: 12, borderRadius: 8 }}>
              {formValues.vendor_type_image ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                  <img
                    src={
                      typeof formValues.vendor_type_image === 'string'
                        ? formValues.vendor_type_image
                        : URL.createObjectURL(formValues.vendor_type_image)
                    }
                    alt="icon"
                    style={{ width: 54, height: 54, objectFit: 'contain', borderRadius: 8 }}
                  />
                  <span style={{ fontSize: 12, color: '#088b46' }}>Click or drag to change icon</span>
                </div>
              ) : (
                <>
                  <p className="ant-upload-drag-icon">
                    <UploadOutlined style={{ fontSize: 36, color: '#088b46' }} />
                  </p>
                  <p style={{ fontWeight: 500, margin: 0 }}>Click or drag image file to upload icon</p>
                </>
              )}
            </Upload.Dragger>
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        open={editModalOpen}
        onCancel={closeEditModal}
        onOk={handleEdit}
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 18, fontWeight: 700 }}>
            <EditOutlined style={{ color: '#0284c7' }} /> Edit Vendor Type
          </div>
        }
        okText="Update Type"
        okButtonProps={{ style: { background: '#088b46', border: 'none', borderRadius: 6 } }}
        cancelButtonProps={{ style: { borderRadius: 6 } }}
        centered
        destroyOnClose
        confirmLoading={loading}
        width={550}
      >
        <Form layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item label="Vendor Type Name" required>
            <Input
              value={formValues.vendor_type}
              onChange={(e) => setFormValues((fv) => ({ ...fv, vendor_type: e.target.value }))}
              placeholder="Enter type name"
            />
          </Form.Item>
          <Form.Item label="Type Icon Image">
            <Upload.Dragger {...uploadProps} style={{ padding: 12, borderRadius: 8 }}>
              {formValues.vendor_type_image ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                  <img
                    src={
                      typeof formValues.vendor_type_image === 'string'
                        ? formValues.vendor_type_image
                        : URL.createObjectURL(formValues.vendor_type_image)
                    }
                    alt="icon"
                    style={{ width: 54, height: 54, objectFit: 'contain', borderRadius: 8 }}
                  />
                  <span style={{ fontSize: 12, color: '#088b46' }}>Click or drag to update icon</span>
                </div>
              ) : (
                <p className="ant-upload-drag-icon">
                  <UploadOutlined style={{ fontSize: 36, color: '#088b46' }} />
                </p>
              )}
            </Upload.Dragger>
          </Form.Item>
          <Form.Item label="Status" required>
            <Switch
              checked={formValues.status === 'active'}
              checkedChildren="Active"
              unCheckedChildren="Inactive"
              onChange={(checked) => setFormValues((fv) => ({ ...fv, status: checked ? 'active' : 'inactive' }))}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal
        open={deleteConfirmOpen}
        onOk={confirmDelete}
        onCancel={cancelDelete}
        okText="Yes, Delete Type"
        okButtonProps={{ danger: true, loading: !!deletingId, style: { borderRadius: 6 } }}
        cancelButtonProps={{ style: { borderRadius: 6 } }}
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#ef4444', fontSize: 18, fontWeight: 700 }}>
            <ExclamationCircleOutlined /> Delete Vendor Type?
          </div>
        }
        centered
      >
        <p style={{ margin: '16px 0', color: '#475569', fontSize: 14 }}>
          Are you sure you want to delete this vendor type? This action cannot be reverted.
        </p>
      </Modal>
    </div>
  );
};

export default VendorTypeList;
