import React, { useCallback, useState } from "react";
import {
  Modal,
  Button,
  Table,
  Row,
  Col,
  Switch,
  Button as AntButton,
  Drawer,
  Grid,
  Tag,
  Tooltip,
  Image,
  Badge,
  Card
} from 'antd';
import {
  PlusOutlined,
  MinusOutlined,
  ShoppingCartOutlined,
  StarOutlined,
  FireOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  FilterOutlined,
  ShopOutlined,
  AppstoreOutlined,
  InfoCircleOutlined,
  TagOutlined,
  CalendarOutlined
} from '@ant-design/icons';
import useProductTable from './hooks/producthook';
import MobileProductSheet from './components/MobileProductSheet';
import FilterControls from './components/FilterControls';
import { useNavigate } from 'react-router-dom';
import { formatPrice } from "../../services/utils/gen_utility";

const { useBreakpoint } = Grid;

/**
 * Primary Decent Columns:
 * Kept clean and compact so the table NEVER requires a horizontal scrollbar.
 * Secondary details and marketing toggles are accessible via the expandable '+' row button.
 */
export const productTableColumns = (
  BASE_URL,
  handleUpdate,
  handleDelete,
  pagination,
  handlePreview,
  navigate,
  handleMobileSheet,
  vendorMap = {}
) => [
  {
    title: '#',
    dataIndex: 'index',
    key: 'index',
    width: 55,
    align: 'center',
    render: (text, record, index) => (
      <span style={{ fontWeight: 600, color: '#64748b', fontSize: '12px' }}>
        #{pagination.pageSize * (pagination.current - 1) + index + 1}
      </span>
    ),
  },
  {
    title: 'Image',
    dataIndex: 'featured_image',
    key: 'image',
    width: 70,
    align: 'center',
    render: (img) =>
      img ? (
        <Image
          src={`${BASE_URL}${img}`}
          alt=""
          width={44}
          height={44}
          fallback="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='44' height='44' viewBox='0 0 44 44'><rect width='44' height='44' fill='%23f1f5f9' rx='8'/><text x='50%' y='55%' text-anchor='middle' fill='%2394a3b8' font-size='9' font-weight='600' font-family='sans-serif'>No Image</text></svg>"
          style={{
            borderRadius: 8,
            objectFit: 'cover',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
          }}
        />
      ) : (
        <Tag color="default" style={{ margin: 0, fontSize: 10, borderRadius: 4 }}>
          No Img
        </Tag>
      ),
  },
  {
    title: 'Product Name',
    dataIndex: 'name',
    key: 'name',
    sorter: true,
    render: (text, record) => {
      const storeName =
        record.store_name ||
        record.vendor_name ||
        record.vendor?.store_name ||
        record.vendor?.name ||
        (record.vendor_id ? vendorMap[record.vendor_id] : null);

      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '14px', lineHeight: 1.3 }}>
            {record.name || 'Unnamed Product'}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginTop: 2 }}>
            {storeName && (
              <Tag
                icon={<ShopOutlined style={{ fontSize: 10 }} />}
                color="cyan"
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  borderRadius: '4px',
                  padding: '0 6px',
                  margin: 0,
                  lineHeight: '18px',
                  border: '1px solid #bae6fd',
                  backgroundColor: '#f0f9ff',
                  color: '#0284c7'
                }}
              >
                {storeName}
              </Tag>
            )}
            {record.brand_name && (
              <span style={{ fontSize: '11.5px', color: '#64748b' }}>
                Brand: <strong style={{ color: '#334155' }}>{record.brand_name}</strong>
              </span>
            )}
            {record.is_featured === 1 && (
              <Tag color="gold" style={{ fontSize: '10px', padding: '0 4px', margin: 0, lineHeight: '18px' }}>
                Featured
              </Tag>
            )}
            {record.is_today_deal === 1 && (
              <Tag color="volcano" style={{ fontSize: '10px', padding: '0 4px', margin: 0, lineHeight: '18px' }}>
                Deal
              </Tag>
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
    width: 140,
    render: (cat, record) => (
      <div>
        <Tag color="blue" style={{ borderRadius: '6px', fontWeight: 600, margin: 0, fontSize: '12px' }}>
          {cat || record.category || 'General'}
        </Tag>
        {record.sub_category_name && (
          <div style={{ fontSize: '11px', color: '#64748b', marginTop: 2 }}>
            {record.sub_category_name}
          </div>
        )}
      </div>
    ),
  },
  {
    title: 'Price',
    dataIndex: 'price',
    key: 'price',
    sorter: true,
    width: 130,
    render: (price, record) => {
      const hasDiscount =
        record.discount_percent > 0 &&
        record.discounted_value &&
        Number(record.discounted_value) < Number(price);

      return (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ color: '#088b46', fontWeight: 700, fontSize: '15px' }}>
            {hasDiscount ? formatPrice(record.discounted_value) : formatPrice(price)}
          </span>
          {hasDiscount && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ color: '#94a3b8', textDecoration: 'line-through', fontSize: '11px' }}>
                {formatPrice(price)}
              </span>
              <Tag color="red" style={{ fontSize: '10px', padding: '0 4px', margin: 0, lineHeight: '16px' }}>
                {record.discount_percent}% OFF
              </Tag>
            </div>
          )}
        </div>
      );
    },
  },
  {
    title: 'Stock',
    dataIndex: 'stock',
    key: 'stock',
    sorter: true,
    width: 95,
    align: 'center',
    render: (stock) => {
      const s = Number(stock || 0);
      return (
        <Tag
          color={s > 10 ? 'green' : s > 0 ? 'orange' : 'red'}
          style={{ fontWeight: 700, borderRadius: 12, padding: '2px 8px', margin: 0, fontSize: '11px' }}
        >
          {s > 0 ? `${s} left` : 'Out of Stock'}
        </Tag>
      );
    },
  },
  {
    title: 'Action',
    key: 'action',
    width: 110,
    align: 'center',
    render: (_, record) => (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
        <Tooltip title="View Product Details">
          <Button
            type="text"
            size="small"
            icon={<EyeOutlined style={{ color: '#088b46', fontSize: 16 }} />}
            onClick={() => handleMobileSheet(record.id)}
          />
        </Tooltip>
        <Tooltip title="Edit Product">
          <Button
            type="text"
            size="small"
            icon={<EditOutlined style={{ color: '#0284c7', fontSize: 16 }} />}
            onClick={() => navigate(`/products/update/${record.id}`)}
          />
        </Tooltip>
        <Tooltip title="Delete Product">
          <Button
            type="text"
            size="small"
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
    nameFilter,
    setNameFilter,
    categoryFilter,
    setCategoryFilter,
    subCategoryFilter,
    setSubCategoryFilter,
    vendorFilter,
    setVendorFilter,
    isFeaturedFilter,
    setIsFeaturedFilter,
    isTodayDealFilter,
    setIsTodayDealFilter,
    data,
    loading,
    pagination,
    onTableChange,
    error,
    categories,
    subCategories,
    vendors,
    vendorMap,
    handleDelete,
    showDeleteModal,
    handleCloseDeleteModal,
    confirmDelete,
    handleToggleFeatured,
    handleToggleTodayDeal,
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
    BASE_URL,
    null,
    handleDelete,
    pagination,
    null,
    navigate,
    handleMobileSheet,
    vendorMap
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
  const featuredCount = data.filter((p) => p.is_featured === 1).length;
  const todayDealsCount = data.filter((p) => p.is_today_deal === 1).length;

  // Render expanded row containing secondary columns & details
  const renderExpandedRow = (record) => {
    const storeName =
      record.store_name ||
      record.vendor_name ||
      record.vendor?.store_name ||
      record.vendor?.name ||
      (record.vendor_id ? vendorMap[record.vendor_id] : null);

    return (
      <div
        style={{
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: 8,
          padding: '16px 20px',
          margin: '4px 0',
          boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.02)'
        }}
      >
        <Row gutter={[16, 16]}>
          {/* Col 1: Store & Vendor Info */}
          <Col xs={24} sm={12} md={6}>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: 700, color: '#64748b', marginBottom: 6 }}>
              Store & Vendor
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <ShopOutlined style={{ color: '#0284c7' }} />
              <span style={{ fontWeight: 600, color: '#0f172a' }}>{storeName || 'N/A'}</span>
            </div>
            {record.store_address && (
              <div style={{ fontSize: '12px', color: '#64748b', marginBottom: 4 }}>
                {record.store_address}
              </div>
            )}
            <div style={{ fontSize: '12px', color: '#475569', marginTop: 4 }}>
              <strong>Subcategory:</strong> {record.sub_category_name || record.sub_category || 'N/A'}
            </div>
            <div style={{ fontSize: '12px', color: '#475569', marginTop: 2 }}>
              <strong>Brand:</strong> {record.brand_name || 'N/A'}
            </div>
          </Col>

          {/* Col 2: Marketing & Visibility Switches */}
          <Col xs={24} sm={12} md={6}>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: 700, color: '#64748b', marginBottom: 6 }}>
              Marketing & Deals
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: '#ffffff',
                padding: '6px 12px',
                borderRadius: 6,
                border: '1px solid #e2e8f0',
                marginBottom: 8
              }}
            >
              <span style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155', display: 'flex', alignItems: 'center', gap: 6 }}>
                <StarOutlined style={{ color: '#d97706' }} /> Featured
              </span>
              <Switch
                checked={record.is_featured === 1}
                onChange={(checked) => handleToggleFeatured(record.id, checked)}
                size="small"
              />
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: '#ffffff',
                padding: '6px 12px',
                borderRadius: 6,
                border: '1px solid #e2e8f0'
              }}
            >
              <span style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155', display: 'flex', alignItems: 'center', gap: 6 }}>
                <FireOutlined style={{ color: '#ef4444' }} /> Today's Deal
              </span>
              <Switch
                checked={record.is_today_deal === 1}
                onChange={(checked) => handleToggleTodayDeal(record.id, checked)}
                size="small"
              />
            </div>
          </Col>

          {/* Col 3: Inventory & Variants */}
          <Col xs={24} sm={12} md={6}>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: 700, color: '#64748b', marginBottom: 6 }}>
              Inventory & Variants
            </div>
            <div style={{ fontSize: '12.5px', color: '#475569', marginBottom: 4 }}>
              <strong>Product ID / SKU:</strong> #{record.id || 'N/A'}
            </div>
            <div style={{ fontSize: '12.5px', color: '#475569', marginBottom: 6 }}>
              <strong>In Stock:</strong> {record.stock || 0} units
            </div>
            {record.variants && record.variants.length > 0 && (
              <div>
                <span style={{ fontSize: '11.5px', fontWeight: 600, color: '#334155' }}>
                  Variants ({record.variants.length}):
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
                  {record.variants.map((v, i) => (
                    <Tag key={i} color="geekblue" style={{ fontSize: '11px', margin: 0, padding: '1px 6px' }}>
                      {v.value || v.type}: ${v.price || record.price}
                    </Tag>
                  ))}
                </div>
              </div>
            )}
          </Col>

          {/* Col 4: Description & Details */}
          <Col xs={24} sm={12} md={6}>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: 700, color: '#64748b', marginBottom: 6 }}>
              Product Description
            </div>
            <div style={{ fontSize: '12px', color: '#475569', lineHeight: 1.45, maxHeight: 80, overflowY: 'auto' }}>
              {record.description || (
                <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>No detailed description provided.</span>
              )}
            </div>
            {record.created_at && (
              <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                <CalendarOutlined /> Added on {new Date(record.created_at).toLocaleDateString()}
              </div>
            )}
          </Col>
        </Row>
      </div>
    );
  };

  return (
    <div className="page-container">
      {/* Header Card */}
      <div className="page-header-card">
        <div className="header-title-block">
          <h2>Product Inventory Management</h2>
          <p>Organize catalog products, filter dynamically by store/category, and manage stock levels.</p>
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
        {/* Dynamic Filter Section */}
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

        {/* Responsive Table with '+' Expansion - ZERO Horizontal Scroll */}
        <Table
          columns={columns}
          dataSource={data}
          loading={loading}
          pagination={{
            ...pagination,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} products`,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50', '100'],
          }}
          onChange={onTableChange}
          rowKey={(record) => record.id || record._id}
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
                  cursor: 'pointer'
                }}
                onClick={(e) => onExpand(record, e)}
                title={expanded ? 'Collapse Details' : 'Expand More Columns & Details'}
              >
                {expanded ? <MinusOutlined style={{ fontSize: 11 }} /> : <PlusOutlined style={{ fontSize: 11 }} />}
              </Button>
            ),
          }}
        />
      </div>

      {/* Delete Confirmation Modal */}
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
