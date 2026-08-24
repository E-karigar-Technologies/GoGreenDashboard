import React from "react";
import { Table, Modal, Button, Form, Input, Select, Switch, Upload, message, Slider, Tag, Tooltip, Image, Badge, Card } from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  PictureOutlined,
  CheckCircleOutlined,
  StopOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  ExclamationCircleOutlined
} from "@ant-design/icons";
import useBannerTable from "./bannerhook";
import AddBanner from "./addappbanner";
import UpdateBanner from "./updatebanner";
import Cropper from "react-easy-crop";
import imageCompression from "browser-image-compression";
import "./allappbanner.scss";

const { Option } = Select;

const AllBanners = () => {
  const {
    banners,
    loading,
    error,
    pagination,
    show,
    selectedBanner,
    showDeleteModal,
    formState,
    previewImage,
    onTableChange,
    handleUpdate,
    handleDelete,
    handleClose,
    handleCloseDeleteModal,
    handleSave,
    confirmDelete,
    handleFormChange,
    handleImageChange,
    handleFeatureToggle,
    handleTodayDealToggle,
    handleStatusToggle,
    fetchBanners,
  } = useBannerTable();

  const [showAddModal, setShowAddModal] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  
  // Update cropper state
  const [updateCropOpen, setUpdateCropOpen] = React.useState(false);
  const [updateRawUrl, setUpdateRawUrl] = React.useState(null);
  const [updateCrop, setUpdateCrop] = React.useState({ x: 0, y: 0 });
  const [updateZoom, setUpdateZoom] = React.useState(1);
  const [updateCroppedPixels, setUpdateCroppedPixels] = React.useState(null);
  const UPDATE_ASPECT_RATIO = 157 / 64;

  // Debounce search
  React.useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(handler);
  }, [search]);

  // Handler to refresh banners after add
  const handleAddSuccess = () => {
    setShowAddModal(false);
    fetchBanners();
  };

  const BASE_URL = import.meta.env.VITE_IMAGE_BASE_URL;

  // Filter banners by title
  const filteredBanners = React.useMemo(() => {
    if (!debouncedSearch) return banners;
    return banners.filter(
      (b) => b.title && b.title.toLowerCase().includes(debouncedSearch.toLowerCase())
    );
  }, [banners, debouncedSearch]);

  // Calculate statistics
  const totalBanners = banners.length;
  const activeBanners = banners.filter((b) => b.status === 1).length;
  const inactiveBanners = banners.filter((b) => b.status !== 1).length;

  const columns = [
    {
      title: '#',
      dataIndex: 'index',
      key: 'index',
      render: (text, record, index) => (
        <span style={{ fontWeight: 600, color: '#64748b' }}>#{index + 1}</span>
      ),
      width: 60,
      align: 'center',
    },
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '14.5px' }}>{text || 'Untitled Banner'}</div>
          <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>ID: #{record.id || record._id}</div>
        </div>
      ),
    },
    {
      title: 'Banner Image',
      dataIndex: 'image_url',
      key: 'image_url',
      render: (img) =>
        img ? (
          <div className="banner-thumb-container">
            <Image
              src={`${BASE_URL}${img}`}
              alt="Banner"
              preview={{
                mask: (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#fff' }}>
                    <EyeOutlined /> Preview
                  </div>
                ),
              }}
            />
          </div>
        ) : (
          <Tag color="default">No Image</Tag>
        ),
      width: 240,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (val, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Switch
            checked={val === 1}
            checkedChildren="Active"
            unCheckedChildren="Inactive"
            onChange={(checked) => handleStatusToggle(record, checked)}
          />
          <Tag color={val === 1 ? 'success' : 'default'} style={{ borderRadius: '12px', padding: '0 10px' }}>
            {val === 1 ? 'Active' : 'Inactive'}
          </Tag>
        </div>
      ),
      width: 180,
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <div className="action-btn-group">
          <Tooltip title="Edit Banner">
            <Button
              type="text"
              className="btn-action-edit"
              icon={<EditOutlined />}
              onClick={() => handleUpdate(record)}
            />
          </Tooltip>
          <Tooltip title="Delete Banner">
            <Button
              type="text"
              className="btn-action-delete"
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record)}
            />
          </Tooltip>
        </div>
      ),
      width: 110,
      align: 'center',
    },
  ];

  const onUpdateCropComplete = React.useCallback((_, croppedPixels) => {
    setUpdateCroppedPixels(croppedPixels);
  }, []);

  const getCroppedBlob = (imageSrc, cropPixels) => {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.crossOrigin = "anonymous";
      image.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas not supported"));
          return;
        }
        const { width, height, x, y } = cropPixels;
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(image, x, y, width, height, 0, 0, width, height);
        canvas.toBlob((blob) => {
          if (!blob) return reject(new Error("Canvas is empty"));
          resolve(blob);
        }, "image/jpeg", 0.92);
      };
      image.onerror = reject;
      image.src = imageSrc;
    });
  };

  const confirmUpdateCrop = async () => {
    try {
      if (!updateRawUrl || !updateCroppedPixels) return;
      const croppedBlob = await getCroppedBlob(updateRawUrl, updateCroppedPixels);
      const compressedBlob = await imageCompression(croppedBlob, {
        maxSizeMB: 0.5,
        useWebWorker: true,
        maxWidthOrHeight: 2000,
      });
      const compressedFile = new File([compressedBlob], "banner.jpg", { type: "image/jpeg" });
      handleImageChange(compressedFile);
      setUpdateCropOpen(false);
      URL.revokeObjectURL(updateRawUrl);
      setUpdateRawUrl(null);
    } catch (err) {
      message.error("Failed to process image. Try another file.");
    }
  };

  const cancelUpdateCrop = () => {
    if (updateRawUrl) URL.revokeObjectURL(updateRawUrl);
    setUpdateRawUrl(null);
    setUpdateCropOpen(false);
  };

  return (
    <div className="banners-page-container">
      {/* Top Page Header */}
      <div className="page-header-wrapper">
        <div className="header-title-block">
          <h4>App Banners Management</h4>
          <p>Upload, organize, and manage promotional marketing banners shown across mobile apps.</p>
        </div>
        <Button
          type="primary"
          className="btn-add-banner"
          icon={<PlusOutlined style={{ fontSize: 16 }} />}
          onClick={() => setShowAddModal(true)}
        >
          Add New Banner
        </Button>
      </div>

      {/* KPI Stats Cards */}
      <div className="banner-stats-grid">
        <div className="banner-stat-card stat-total">
          <div className="stat-meta">
            <div className="stat-label">Total Banners</div>
            <div className="stat-number">{totalBanners}</div>
          </div>
          <div className="stat-icon-wrapper">
            <PictureOutlined />
          </div>
        </div>

        <div className="banner-stat-card stat-active">
          <div className="stat-meta">
            <div className="stat-label">Active Banners</div>
            <div className="stat-number">{activeBanners}</div>
          </div>
          <div className="stat-icon-wrapper">
            <CheckCircleOutlined />
          </div>
        </div>

        <div className="banner-stat-card stat-inactive">
          <div className="stat-meta">
            <div className="stat-label">Inactive Banners</div>
            <div className="stat-number">{inactiveBanners}</div>
          </div>
          <div className="stat-icon-wrapper">
            <StopOutlined />
          </div>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="banners-table-card">
        <div className="banners-toolbar">
          <Input
            className="search-box-input"
            prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
            placeholder="Search by banner title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            allowClear
          />
          <Badge count={`Showing ${filteredBanners.length} of ${banners.length}`} style={{ backgroundColor: '#f1f5f9', color: '#475569', fontWeight: 600, border: '1px solid #cbd5e1' }} />
        </div>

        <Table
          columns={columns}
          dataSource={filteredBanners}
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            pageSizeOptions: ['5', '10', '20', '50'],
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} banners`,
          }}
          onChange={onTableChange}
          rowKey={(record) => record.id || record._id}
        />
      </div>

      {/* Add Banner Modal */}
      <Modal
        open={showAddModal}
        onCancel={() => setShowAddModal(false)}
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 18, fontWeight: 700 }}>
            <PlusOutlined style={{ color: '#088b46' }} /> Add New Banner
          </div>
        }
        footer={null}
        centered
        width={620}
        destroyOnClose
        style={{ borderRadius: 12, overflow: 'hidden' }}
      >
        <AddBanner onSuccess={handleAddSuccess} onCancel={() => setShowAddModal(false)} />
      </Modal>

      {/* Update Modal */}
      <Modal
        open={show}
        onCancel={handleClose}
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 18, fontWeight: 700 }}>
            <EditOutlined style={{ color: '#0284c7' }} /> Update Banner Details
          </div>
        }
        footer={null}
        centered
        width={620}
        destroyOnClose
      >
        {selectedBanner && (
          <UpdateBanner
            banner={selectedBanner}
            onSuccess={() => {
              handleClose();
              fetchBanners();
            }}
            onCancel={handleClose}
          />
        )}
      </Modal>

      {/* Delete Modal */}
      <Modal
        open={showDeleteModal}
        onCancel={handleCloseDeleteModal}
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#ef4444', fontSize: 18, fontWeight: 700 }}>
            <ExclamationCircleOutlined /> Confirm Deletion
          </div>
        }
        onOk={confirmDelete}
        okText="Yes, Delete Banner"
        okButtonProps={{ danger: true, style: { borderRadius: 6 } }}
        cancelText="Cancel"
        cancelButtonProps={{ style: { borderRadius: 6 } }}
        centered
      >
        <p style={{ fontSize: 15, color: '#475569', margin: '16px 0' }}>
          Are you sure you want to delete this banner? This action cannot be undone.
        </p>
      </Modal>

      {/* Cropper Modal */}
      <Modal
        open={updateCropOpen}
        onCancel={cancelUpdateCrop}
        onOk={confirmUpdateCrop}
        okText="Crop & Use Image"
        centered
        destroyOnClose
        width={720}
      >
        <div style={{ position: 'relative', width: '100%', height: 400, background: '#1e293b', borderRadius: 8, overflow: 'hidden' }}>
          {updateRawUrl && (
            <Cropper
              image={updateRawUrl}
              crop={updateCrop}
              zoom={updateZoom}
              minZoom={0.5}
              maxZoom={3}
              aspect={UPDATE_ASPECT_RATIO}
              onCropChange={setUpdateCrop}
              onZoomChange={setUpdateZoom}
              onCropComplete={onUpdateCropComplete}
              restrictPosition={false}
              showGrid
            />
          )}
        </div>
        <div style={{ marginTop: 16 }}>
          <div style={{ marginBottom: 6, fontWeight: 600, color: '#475569' }}>Zoom Adjustment</div>
          <Slider min={0.5} max={3} step={0.01} value={updateZoom} onChange={setUpdateZoom} />
        </div>
      </Modal>
    </div>
  );
};

export default AllBanners;
