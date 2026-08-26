import React from 'react';
import { Input, Select, Button as AntButton, Row, Col } from 'antd';
import { ReloadOutlined, SearchOutlined } from '@ant-design/icons';

function FilterControls({
  nameFilter = "",
  setNameFilter = () => {},
  categoryFilter = [],
  setCategoryFilter = () => {},
  subCategoryFilter = [],
  setSubCategoryFilter = () => {},
  vendorFilter = [],
  setVendorFilter = () => {},
  isFeaturedFilter = undefined,
  setIsFeaturedFilter = () => {},
  isTodayDealFilter = undefined,
  setIsTodayDealFilter = () => {},
  categories = [],
  subCategories = [],
  vendors = [],
  handleResetFilters = () => {},
  vertical = false,
  setDrawerOpen,
}) {
  if (vertical) {
    // Mobile/Drawer: vertical stack
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: 4, display: 'block' }}>Search Product</label>
          <Input
            className="custom-filter-input"
            prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
            placeholder="Search product name..."
            value={nameFilter}
            onChange={e => setNameFilter(e.target.value)}
            allowClear
          />
        </div>

        <div>
          <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: 4, display: 'block' }}>Vendor / Store</label>
          <Select
            mode="multiple"
            allowClear
            showSearch
            filterOption={(input, option) =>
              String(option.children || '').toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
            placeholder="Select Vendor/Store"
            style={{ width: '100%' }}
            value={vendorFilter}
            onChange={setVendorFilter}
          >
            {vendors.map(v => {
              const vId = v.vendor_id || v.id || v._id;
              const vName = v.store_name || v.name || v.vendor_name || `Vendor #${vId}`;
              return (
                <Select.Option key={vId} value={vId}>
                  {vName}
                </Select.Option>
              );
            })}
          </Select>
        </div>

        <div>
          <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: 4, display: 'block' }}>Category</label>
          <Select
            mode="multiple"
            allowClear
            showSearch
            filterOption={(input, option) =>
              String(option.children || '').toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
            placeholder="Select Category"
            style={{ width: '100%' }}
            value={categoryFilter}
            onChange={setCategoryFilter}
          >
            {categories.map(cat => (
              <Select.Option key={cat.id} value={cat.id}>{cat.name}</Select.Option>
            ))}
          </Select>
        </div>

        <div>
          <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: 4, display: 'block' }}>Subcategory</label>
          <Select
            mode="multiple"
            allowClear
            showSearch
            filterOption={(input, option) =>
              String(option.children || '').toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
            placeholder="Select Subcategory"
            style={{ width: '100%' }}
            value={subCategoryFilter}
            onChange={setSubCategoryFilter}
          >
            {subCategories.map(sub => (
              <Select.Option key={sub.id} value={sub.id}>{sub.name}</Select.Option>
            ))}
          </Select>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: 4, display: 'block' }}>Featured</label>
            <Select
              allowClear
              placeholder="Featured"
              style={{ width: '100%' }}
              value={isFeaturedFilter}
              onChange={setIsFeaturedFilter}
            >
              <Select.Option value={1}>Yes</Select.Option>
              <Select.Option value={0}>No</Select.Option>
            </Select>
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: 4, display: 'block' }}>Today's Deal</label>
            <Select
              allowClear
              placeholder="Today Deal"
              style={{ width: '100%' }}
              value={isTodayDealFilter}
              onChange={setIsTodayDealFilter}
            >
              <Select.Option value={1}>Yes</Select.Option>
              <Select.Option value={0}>No</Select.Option>
            </Select>
          </div>
        </div>

        <AntButton
          size="middle"
          danger
          icon={<ReloadOutlined />}
          onClick={handleResetFilters}
          style={{ marginTop: 8 }}
        >
          Reset Filters
        </AntButton>
      </div>
    );
  }

  // Desktop layout
  return (
    <Row gutter={[12, 12]} align="middle">
      <Col xs={24} sm={12} md={5}>
        <Input
          className="custom-filter-input"
          prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
          placeholder="Search product..."
          value={nameFilter}
          onChange={e => setNameFilter(e.target.value)}
          allowClear
        />
      </Col>

      <Col xs={24} sm={12} md={4}>
        <Select
          mode="multiple"
          allowClear
          showSearch
          maxTagCount="responsive"
          filterOption={(input, option) =>
            String(option.children || '').toLowerCase().indexOf(input.toLowerCase()) >= 0
          }
          placeholder="Vendor / Store"
          style={{ width: '100%' }}
          value={vendorFilter}
          onChange={setVendorFilter}
        >
          {vendors.map(v => {
            const vId = v.vendor_id || v.id || v._id;
            const vName = v.store_name || v.name || v.vendor_name || `Vendor #${vId}`;
            return (
              <Select.Option key={vId} value={vId}>
                {vName}
              </Select.Option>
            );
          })}
        </Select>
      </Col>

      <Col xs={24} sm={12} md={4}>
        <Select
          mode="multiple"
          allowClear
          showSearch
          maxTagCount="responsive"
          filterOption={(input, option) =>
            String(option.children || '').toLowerCase().indexOf(input.toLowerCase()) >= 0
          }
          placeholder="Category"
          style={{ width: '100%' }}
          value={categoryFilter}
          onChange={setCategoryFilter}
        >
          {categories.map(cat => (
            <Select.Option key={cat.id} value={cat.id}>{cat.name}</Select.Option>
          ))}
        </Select>
      </Col>

      <Col xs={24} sm={12} md={4}>
        <Select
          mode="multiple"
          allowClear
          showSearch
          maxTagCount="responsive"
          filterOption={(input, option) =>
            String(option.children || '').toLowerCase().indexOf(input.toLowerCase()) >= 0
          }
          placeholder="Subcategory"
          style={{ width: '100%' }}
          value={subCategoryFilter}
          onChange={setSubCategoryFilter}
        >
          {subCategories.map(sub => (
            <Select.Option key={sub.id} value={sub.id}>{sub.name}</Select.Option>
          ))}
        </Select>
      </Col>

      <Col xs={12} sm={6} md={3}>
        <Select
          allowClear
          placeholder="Featured"
          style={{ width: '100%' }}
          value={isFeaturedFilter}
          onChange={setIsFeaturedFilter}
        >
          <Select.Option value={1}>Featured: Yes</Select.Option>
          <Select.Option value={0}>Featured: No</Select.Option>
        </Select>
      </Col>

      <Col xs={12} sm={6} md={3}>
        <Select
          allowClear
          placeholder="Today Deal"
          style={{ width: '100%' }}
          value={isTodayDealFilter}
          onChange={setIsTodayDealFilter}
        >
          <Select.Option value={1}>Deal: Yes</Select.Option>
          <Select.Option value={0}>Deal: No</Select.Option>
        </Select>
      </Col>

      <Col xs={24} sm={12} md={1} style={{ textAlign: 'right' }}>
        <AntButton
          size="middle"
          danger
          icon={<ReloadOutlined />}
          onClick={handleResetFilters}
          title="Reset Filters"
        />
      </Col>
    </Row>
  );
}

export default React.memo(FilterControls);
