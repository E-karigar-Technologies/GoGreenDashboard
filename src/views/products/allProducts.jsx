import React, { useCallback, useState } from "react";
import { Modal, Button, Form, Card, Divider, Table, Select, Input, Row, Col, Switch, Button as AntButton, Drawer, Grid, Upload, Tag, Tooltip, Image, Badge } from 'antd';
import { PlusOutlined, ShoppingCartOutlined, StarOutlined, FireOutlined, EyeOutlined, EditOutlined, DeleteOutlined, FilterOutlined, ShopOutlined } from '@ant-design/icons';
import useProductTable from './hooks/producthook';
import MobileProductSheet from './components/MobileProductSheet';
import FilterControls from './components/FilterControls';
import { useNavigate } from 'react-router-dom';
import { formatPrice } from "../../services/utils/gen_utility";

const { useBreakpoint } = Grid;

export const productTableColumns = (BASE_URL, handleUpdate, handleDelete, pagination, handleToggleFeatured, handleToggleTodayDeal, handlePreview, navigate, handleMobileSheet, vendorMap = {}) => [
  {
    title: '#',
    dataIndex: 'index',
    key: 'index',
    width: 60,
    align: 'center',
    render: (text, record, index) => <span style={{ fontWeight: 600, color: '#64748b' }}>#{(pagination.pageSize * (pagination.current - 1)) + index + 1}</span>,
  },
  {
    title: 'Product Name',
    dataIndex: 'name',
    sorter: true,
    render: (text, record) => {
      const storeName =
        record.store_name ||
        record.vendor_name ||
        record.vendor?.store_name ||
        record.vendor?.name ||
        record.store?.store_name ||
        record.store?.name ||
        (typeof record.store === 'string' ? record.store : null) ||
        (record.vendor_id ? vendorMap[record.vendor_id] : null) ||
        (record.vendor ? vendorMap[record.vendor] : null);

      return (
        <div>
          {storeName && (
            <div style={{ marginBottom: 4 }}>
              <Tag
                icon={<ShopOutlined style={{ fontSize: 11 }} />}
                color="cyan"
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  borderRadius: '4px',
                  padding: '1px 8px',
                  marginRight: 0,
                  border: '1px solid #bae6fd',
                  backgroundColor: '#f0f9ff',
                  color: '#0284c7',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
                }}
              >
                {storeName}
              </Tag>
            </div>
          )}
          <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '14.5px' }}>{record.name || 'Unnamed Product'}</div>
          {record.description && (
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
              {record.description.length > 45 ? record.description.slice(0, 45) + '...' : record.description}
            </div>
          )}
        </div>
      );
    },
  },
  {
    title: 'Store / Vendor',
    dataIndex: 'store_name',
    key: 'store_name',
    width: 160,
    sorter: (a, b) => {
      const nameA = a.store_name || a.vendor_name || a.vendor?.store_name || (a.vendor_id ? vendorMap[a.vendor_id] : '') || '';
      const nameB = b.store_name || b.vendor_name || b.vendor?.store_name || (b.vendor_id ? vendorMap[b.vendor_id] : '') || '';
      return nameA.localeCompare(nameB);
    },
    render: (_, record) => {
      const storeName =
        record.store_name ||
        record.vendor_name ||
        record.vendor?.store_name ||
        record.vendor?.name ||
        record.store?.store_name ||
        record.store?.name ||
        (typeof record.store === 'string' ? record.store : null) ||
        (record.vendor_id ? vendorMap[record.vendor_id] : null) ||
        (record.vendor ? vendorMap[record.vendor] : null);

      return storeName ? (
        <Tag
          icon={<ShopOutlined />}
          color="cyan"
          style={{
            borderRadius: '6px',
            fontWeight: 600,
            fontSize: '12px',
            padding: '3px 8px',
            border: '1px solid #bae6fd',
            backgroundColor: '#f0f9ff',
            color: '#0284c7'
          }}
        >
          {storeName}
        </Tag>
      ) : (
        <span style={{ color: '#94a3b8', fontSize: '13px', fontStyle: 'italic' }}>N/A</span>
      );
    },
  },
  {
    title: 'Category',
    dataIndex: 'category_name',
    sorter: true,
    width: 150,
    render: (cat) => <Tag color="blue" style={{ borderRadius: '6px', fontWeight: 500 }}>{cat || 'General'}</Tag>,
  },
  {
    title: 'Price',
    dataIndex: 'price',
    sorter: true,
    width: 140,
    render: (price, record) => {
      const hasDiscount = record.discount_percent > 0 && record.discounted_value && Number(record.discounted_value) < Number(price);
      return (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ color: '#088b46', fontWeight: 700, fontSize: '16px' }}>
            {hasDiscount ? formatPrice(record.discounted_value) : formatPrice(price)}
          </span>
          {hasDiscount && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ color: '#94a3b8', textDecoration: 'line-through', fontSize: '12px' }}>
                {formatPrice(price)}
              </span>
              <Tag color="red" style={{ fontSize: '10px', padding: '0 4px', margin: 0 }}>
                {record.discount_percent}% OFF
              </Tag>
            </div>
          )}
        </div>
      );
    }
  },
  {
    title: 'Stock',
    dataIndex: 'stock',
    sorter: true,
    width: 100,
    align: 'center',
    render: (stock) => (
      <Badge
        count={stock || 0}
        overflowCount={9999}
        style={{ backgroundColor: Number(stock) > 0 ? '#0284c7' : '#ef4444' }}
      />
    ),
  },
  {
    title: 'Featured',
    dataIndex: 'is_featured',
    align: 'center',
    render: (val, record) => (
      <Switch
        checked={val === 1}
        onChange={(checked) => handleToggleFeatured(record.id, checked ? 1 : 0)}
      />
    ),
    width: 110,
  },
  {
    title: 'Today Deal',
    dataIndex: 'is_today_deal',
    align: 'center',
    render: (val, record) => (
      <Switch
        checked={val === 1}
        onChange={(checked) => handleToggleTodayDeal(record.id, checked ? 1 : 0)}
      />
    ),
    width: 110,
  },
  {
    title: 'Image',
    dataIndex: 'featured_image',
    align: 'center',
    render: (img) => img ? (
      <Image
        src={`${BASE_URL}${img}`}
        alt="Product"
        width={50}
        height={50}
        style={{ borderRadius: 8, objectFit: 'cover', border: '1px solid #e2e8f0' }}
      />
    ) : <Tag color="default">No Image</Tag>,
    width: 90,
  },
  {
    title: 'Action',
    key: 'action',
    width: 120,
    align: 'center',
    render: (_, record) => (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
        <Tooltip title="View Product Details">
          <Button
            type="text"
            icon={<EyeOutlined style={{ color: '#088b46', fontSize: 16 }} />}
            onClick={() => handleMobileSheet(record.id)}
          />
        </Tooltip>
        <Tooltip title="Edit Product">
          <Button
            type="text"
            icon={<EditOutlined style={{ color: '#0284c7', fontSize: 16 }} />}
            onClick={() => navigate(`/products/update/${record.id}`)}
          />
        </Tooltip>
        <Tooltip title="Delete Product">
          <Button
            type="text"
            icon={<DeleteOutlined style={{ color: '#ef4444', fontSize: 16 }} />}
            onClick={() => handleDelete(record)}
          />
        </Tooltip>
      </div>
    ),
  },
];

const ProductList = () => {
  const navigate = useNavigate();
  const {
    nameFilter, setNameFilter,
    categoryFilter, setCategoryFilter,
    subCategoryFilter, setSubCategoryFilter,
    vendorFilter, setVendorFilter,
    isFeaturedFilter, setIsFeaturedFilter,
    isTodayDealFilter, setIsTodayDealFilter,
    data, loading, pagination, onTableChange, error,
    show, selectedUser, showDeleteModal, formState, categories, brands, subCategories, vendors, vendorMap, previewImage, previewImages,
    handleUpdate, handleDelete, handleClose, handleCloseDeleteModal, handleSave, confirmDelete, handleFormChange,
    handleImageChange, handleGalleryImagesChange, handleDeleteFeaturedImage, handleDeleteGalleryImage,
    handleToggleFeatured, handleToggleTodayDeal,
  } = useProductTable();

  const BASE_URL = import.meta.env.VITE_IMAGE_BASE_URL;
  const screens = useBreakpoint();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showMobileSheet, setShowMobileSheet] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null);

  const handleMobileSheet = (productId) => {
    setSelectedProductId(productId);
    setShowMobileSheet(true);
  };

  const handleCloseMobileSheet = useCallback(() => {
    setShowMobileSheet(false);
    setSelectedProductId(null);
  }, []);

  const columns = productTableColumns(
    BASE_URL, handleUpdate, handleDelete, pagination, handleToggleFeatured, handleToggleTodayDeal, null, navigate, handleMobileSheet, vendorMap
  );

  const handleResetFilters = () => {
    setNameFilter("");
    setCategoryFilter([]);
    setSubCategoryFilter([]);
    setVendorFilter([]);
    setIsFeaturedFilter(undefined);
    setIsTodayDealFilter(undefined);
  };

  // Stat calculations
  const totalProducts = pagination.total || data.length;
  const featuredCount = data.filter(p => p.is_featured === 1).length;
  const todayDealsCount = data.filter(p => p.is_today_deal === 1).length;

  return (
    <div className="page-container">
      {/* Header Card */}
      <div className="page-header-card">
        <div className="header-title-block">
          <h2>Product Inventory Management</h2>
          <p>Create, update, organize categories, manage pricing, discounts, and inventory stock levels.</p>
        </div>
        <Button
          type="primary"
          className="btn-primary-gogreen"
          icon={<PlusOutlined />}
          style={{ height: 42, padding: '0 20px' }}
          onClick={() => navigate('/add-Products')}
        >
          Add New Product
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="page-stats-grid">
        <div className="page-stat-card">
          <div className="stat-meta">
            <div className="stat-label">Total Catalog Products</div>
            <div className="stat-number">{totalProducts}</div>
          </div>
          <div className="stat-icon" style={{ background: '#e0f2fe', color: '#0284c7' }}>
            <ShoppingCartOutlined />
          </div>
        </div>

        <div className="page-stat-card">
          <div className="stat-meta">
            <div className="stat-label">Featured Items</div>
            <div className="stat-number">{featuredCount}</div>
          </div>
          <div className="stat-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
            <StarOutlined />
          </div>
        </div>

        <div className="page-stat-card">
          <div className="stat-meta">
            <div className="stat-label">Today's Hot Deals</div>
            <div className="stat-number">{todayDealsCount}</div>
          </div>
          <div className="stat-icon" style={{ background: '#fef2f2', color: '#ef4444' }}>
            <FireOutlined />
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="page-content-card">
        <div style={{ marginBottom: 20 }}>
          {screens.md ? (
            <FilterControls
              nameFilter={nameFilter}
              setNameFilter={setNameFilter}
              categoryFilter={categoryFilter}
              setCategoryFilter={setCategoryFilter}
              subCategoryFilter={subCategoryFilter}
              setSubCategoryFilter={setSubCategoryFilter}
              vendorFilter={vendorFilter}
              setVendorFilter={setVendorFilter}
              isFeaturedFilter={isFeaturedFilter}
              setIsFeaturedFilter={setIsFeaturedFilter}
              isTodayDealFilter={isTodayDealFilter}
              setIsTodayDealFilter={setIsTodayDealFilter}
              categories={categories}
              subCategories={subCategories}
              vendors={vendors}
              handleResetFilters={handleResetFilters}
            />
          ) : (
            <>
              <AntButton icon={<FilterOutlined />} onClick={() => setDrawerOpen(true)}>
                Filter Catalog
              </AntButton>
              <Drawer
                title="Filter Inventory"
                placement="right"
                onClose={() => setDrawerOpen(false)}
                open={drawerOpen}
                width={320}
              >
                <FilterControls
                  nameFilter={nameFilter}
                  setNameFilter={setNameFilter}
                  categoryFilter={categoryFilter}
                  setCategoryFilter={setCategoryFilter}
                  subCategoryFilter={subCategoryFilter}
                  setSubCategoryFilter={setSubCategoryFilter}
                  vendorFilter={vendorFilter}
                  setVendorFilter={setVendorFilter}
                  isFeaturedFilter={isFeaturedFilter}
                  setIsFeaturedFilter={setIsFeaturedFilter}
                  isTodayDealFilter={isTodayDealFilter}
                  setIsTodayDealFilter={setIsTodayDealFilter}
                  categories={categories}
                  subCategories={subCategories}
                  vendors={vendors}
                  handleResetFilters={handleResetFilters}
                  vertical
                />
              </Drawer>
            </>
          )}
        </div>

        <Table
          columns={columns}
          dataSource={data}
          loading={loading}
          pagination={{
            ...pagination,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} products`,
          }}
          onChange={onTableChange}
          rowKey={(record) => record.id || record._id}
          scroll={{ x: 'max-content' }}
        />
      </div>

      {/* Delete Modal */}
      <Modal
        open={showDeleteModal}
        onCancel={handleCloseDeleteModal}
        title="Confirm Product Deletion"
        onOk={confirmDelete}
        okText="Yes, Delete Product"
        okButtonProps={{ danger: true }}
        cancelText="Cancel"
        centered
      >
        <p style={{ margin: '16px 0', color: '#475569' }}>
          Are you sure you want to delete this product? This action will permanently remove it from the catalog.
        </p>
      </Modal>

      {/* Mobile Product Sheet */}
      <MobileProductSheet
        open={showMobileSheet}
        onClose={handleCloseMobileSheet}
        productId={selectedProductId}
        BASE_URL={BASE_URL}
      />
    </div>
  );
};

export default ProductList;
