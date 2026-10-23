import React, { useState } from 'react';
import { Input, Select, Button, Drawer, Grid, DatePicker, Tag, Space, Tooltip, Badge } from 'antd';
import {
  FilterOutlined,
  ReloadOutlined,
  CalendarOutlined,
  ShopOutlined,
  CarOutlined,
  UserOutlined,
  SortAscendingOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { getOrderStatus } from './hooks/useOrder';
import styles from './orders.module.scss';

const { useBreakpoint } = Grid;

const OrderFilters = ({
  searchInput,
  onSearchInputChange,
  onSearchSubmit,
  dateType = 'month',
  onDateTypeChange,
  singleDate = null,
  onSingleDateChange,
  rangeDates = null,
  onRangeDatesChange,
  status = null,
  onStatusChange,
  vendorId = '',
  onVendorChange,
  riderId = '',
  onRiderChange,
  userId = '',
  onUserChange,
  sort = 'latest',
  onSortChange,
  onReset,
  vendors = [],
  riders = [],
  customers = [],
  filterOptionsLoading = {},
}) => {
  const screens = useBreakpoint();
  const isMobile = !!screens.xs && !screens.md;

  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  // Temporary drawer state for mobile
  const [drawerFilters, setDrawerFilters] = useState({
    searchInput: searchInput || '',
    dateType,
    singleDate,
    rangeDates,
    status,
    vendorId,
    riderId,
    userId,
    sort,
  });

  const handleOpenDrawer = () => {
    setDrawerFilters({
      searchInput: searchInput || '',
      dateType,
      singleDate,
      rangeDates,
      status,
      vendorId,
      riderId,
      userId,
      sort,
    });
    setFilterDrawerOpen(true);
  };

  const handleApplyDrawerFilters = () => {
    onSearchInputChange?.(drawerFilters.searchInput);
    onSearchSubmit?.(drawerFilters.searchInput);
    onDateTypeChange?.(drawerFilters.dateType);
    onSingleDateChange?.(drawerFilters.singleDate);
    onRangeDatesChange?.(drawerFilters.rangeDates);
    onStatusChange?.(drawerFilters.status);
    onVendorChange?.(drawerFilters.vendorId);
    onRiderChange?.(drawerFilters.riderId);
    onUserChange?.(drawerFilters.userId);
    onSortChange?.(drawerFilters.sort);
    setFilterDrawerOpen(false);
  };

  const handleResetDrawerFilters = () => {
    const defaultState = {
      searchInput: '',
      dateType: 'month',
      singleDate: null,
      rangeDates: null,
      status: null,
      vendorId: '',
      riderId: '',
      userId: '',
      sort: 'latest',
    };
    setDrawerFilters(defaultState);
    onReset?.();
    setFilterDrawerOpen(false);
  };

  // Calculate active filter count
  let activeFilterCount = 0;
  if (searchInput) activeFilterCount++;
  if (dateType && dateType !== 'all') activeFilterCount++;
  if (status !== null && status !== undefined && status !== '') activeFilterCount++;
  if (vendorId) activeFilterCount++;
  if (riderId) activeFilterCount++;
  if (userId) activeFilterCount++;
  if (sort && sort !== 'latest') activeFilterCount++;

  const selectedVendor = vendors.find(v => String(v.id) === String(vendorId));
  const selectedRider = riders.find(r => String(r.id) === String(riderId));
  const selectedCustomer = customers.find(c => String(c.id) === String(userId));

  return (
    <div className={styles.filtersContainer}>
      {/* Mobile Trigger Button */}
      {isMobile ? (
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', width: '100%' }}>
          <Input.Search
            placeholder="Search orders (ID, address, customer)..."
            value={searchInput}
            onChange={e => onSearchInputChange?.(e.target.value)}
            onSearch={val => onSearchSubmit?.(val)}
            allowClear
            style={{ flex: 1 }}
          />
          <Badge count={activeFilterCount} offset={[-4, 4]}>
            <Button
              type="primary"
              icon={<FilterOutlined />}
              onClick={handleOpenDrawer}
            >
              Filters
            </Button>
          </Badge>
        </div>
      ) : (
        <>
          {/* Row 1: Search, Date preset/picker, Status, Sort */}
          <div className={styles.filterHeaderRow}>
            {/* Search */}
            <div className={styles.searchItem}>
              <Input.Search
                placeholder="Search by order ID, customer name, phone, city..."
                value={searchInput}
                onChange={e => onSearchInputChange?.(e.target.value)}
                onSearch={val => onSearchSubmit?.(val)}
                allowClear
              />
            </div>

            {/* Date Filters: Preset + DatePicker */}
            <div className={styles.dateRangeContainer}>
              <Select
                value={dateType}
                onChange={val => onDateTypeChange?.(val)}
                style={{ width: 140 }}
                suffixIcon={<CalendarOutlined style={{ color: '#0284c7' }} />}
                options={[
                  { label: 'All Time', value: 'all' },
                  { label: 'Today', value: 'today' },
                  { label: 'Yesterday', value: 'yesterday' },
                  { label: 'This Week', value: 'week' },
                  { label: 'This Month', value: 'month' },
                  { label: 'Specific Date', value: 'single' },
                  { label: 'Custom Range', value: 'range' },
                ]}
              />

              {dateType === 'single' && (
                <DatePicker
                  value={singleDate}
                  onChange={date => onSingleDateChange?.(date)}
                  format="YYYY-MM-DD"
                  placeholder="Select Date"
                  allowClear={false}
                  style={{ width: 140 }}
                />
              )}

              {dateType === 'range' && (
                <DatePicker.RangePicker
                  value={rangeDates}
                  onChange={dates => onRangeDatesChange?.(dates)}
                  format="YYYY-MM-DD"
                  allowClear={false}
                  style={{ width: 230 }}
                />
              )}
            </div>

            {/* Order Status */}
            <div className={styles.filterItem} style={{ width: 160 }}>
              <Select
                allowClear
                placeholder="Status: All"
                value={status}
                onChange={val => onStatusChange?.(val ?? null)}
                className={styles.statusSelect}
                style={{ width: '100%' }}
              >
                {[0, 1, 2, 3, 4, 5].map(statusCode => {
                  const s = getOrderStatus(statusCode);
                  return (
                    <Select.Option key={statusCode} value={statusCode}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                        <span
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            backgroundColor:
                              statusCode === 4
                                ? '#22c55e'
                                : statusCode === 0
                                ? '#f59e0b'
                                : statusCode === 1
                                ? '#3b82f6'
                                : statusCode === 2
                                ? '#a855f7'
                                : '#ef4444',
                          }}
                        />
                        {s.text}
                      </span>
                    </Select.Option>
                  );
                })}
              </Select>
            </div>

            {/* Sort Filter */}
            <div className={styles.filterItem} style={{ width: 160 }}>
              <Select
                value={sort || 'latest'}
                onChange={val => onSortChange?.(val)}
                style={{ width: '100%' }}
                suffixIcon={<SortAscendingOutlined style={{ color: '#088b46' }} />}
                options={[
                  { label: 'Latest First', value: 'latest' },
                  { label: 'Oldest First', value: 'oldest' },
                  { label: 'Highest Amount', value: 'amount_desc' },
                ]}
              />
            </div>
          </div>

          {/* Row 2: Entity Filters (Vendor, Rider, Customer) & Reset */}
          <div className={styles.filterSecondaryRow}>
            {/* Vendor Selector */}
            <div className={styles.filterItem} style={{ flex: '1 1 200px' }}>
              <Select
                showSearch
                allowClear
                loading={filterOptionsLoading.vendors}
                placeholder="Filter by Vendor"
                value={vendorId || undefined}
                onChange={val => onVendorChange?.(val || '')}
                optionFilterProp="children"
                filterOption={(input, option) =>
                  (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
                style={{ width: '100%' }}
                suffixIcon={<ShopOutlined style={{ color: '#d97706' }} />}
                options={vendors.map(v => ({
                  value: String(v.id),
                  label: v.name,
                }))}
              />
            </div>

            {/* Rider Selector */}
            <div className={styles.filterItem} style={{ flex: '1 1 200px' }}>
              <Select
                showSearch
                allowClear
                loading={filterOptionsLoading.riders}
                placeholder="Filter by Rider"
                value={riderId || undefined}
                onChange={val => onRiderChange?.(val || '')}
                optionFilterProp="children"
                filterOption={(input, option) =>
                  (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
                style={{ width: '100%' }}
                suffixIcon={<CarOutlined style={{ color: '#9333ea' }} />}
                options={riders.map(r => ({
                  value: String(r.id),
                  label: `${r.name}${r.customId ? ` (${r.customId})` : ''}`,
                }))}
              />
            </div>

            {/* Customer / User Selector */}
            <div className={styles.filterItem} style={{ flex: '1 1 220px' }}>
              <Select
                showSearch
                allowClear
                loading={filterOptionsLoading.customers}
                placeholder="Filter by Customer / User"
                value={userId || undefined}
                onChange={val => onUserChange?.(val || '')}
                optionFilterProp="children"
                filterOption={(input, option) =>
                  (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
                style={{ width: '100%' }}
                suffixIcon={<UserOutlined style={{ color: '#0284c7' }} />}
                options={customers.map(c => ({
                  value: String(c.id),
                  label: `${c.name}${c.customId ? ` (${c.customId})` : c.phone ? ` (${c.phone})` : ''}`,
                }))}
              />
            </div>

            {/* Reset Filters button */}
            <Button
              icon={<ReloadOutlined />}
              onClick={onReset}
              disabled={activeFilterCount === 0 && dateType === 'month' && sort === 'latest'}
              style={{ borderRadius: 6 }}
            >
              Reset Filters
            </Button>
          </div>
        </>
      )}

      {/* Active Filter Tags Row */}
      {activeFilterCount > 0 && (
        <div className={styles.filterActiveTagsRow}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}>Active Filters:</span>

          {searchInput && (
            <Tag
              closable
              onClose={() => {
                onSearchInputChange?.('');
                onSearchSubmit?.('');
              }}
              color="blue"
            >
              Search: {searchInput}
            </Tag>
          )}

          {dateType && dateType !== 'all' && (
            <Tag
              closable
              onClose={() => onDateTypeChange?.('all')}
              color="cyan"
            >
              Date:{' '}
              {dateType === 'today'
                ? 'Today'
                : dateType === 'yesterday'
                ? 'Yesterday'
                : dateType === 'week'
                ? 'This Week'
                : dateType === 'month'
                ? 'This Month'
                : dateType === 'single' && singleDate
                ? dayjs(singleDate).format('YYYY-MM-DD')
                : dateType === 'range' && rangeDates && rangeDates[0] && rangeDates[1]
                ? `${dayjs(rangeDates[0]).format('YYYY-MM-DD')} to ${dayjs(rangeDates[1]).format('YYYY-MM-DD')}`
                : dateType}
            </Tag>
          )}

          {status !== null && status !== undefined && status !== '' && (
            <Tag
              closable
              onClose={() => onStatusChange?.(null)}
              color="orange"
            >
              Status: {getOrderStatus(status).text}
            </Tag>
          )}

          {vendorId && (
            <Tag
              closable
              onClose={() => onVendorChange?.('')}
              color="gold"
            >
              Vendor: {selectedVendor ? selectedVendor.name : `#${vendorId}`}
            </Tag>
          )}

          {riderId && (
            <Tag
              closable
              onClose={() => onRiderChange?.('')}
              color="purple"
            >
              Rider: {selectedRider ? selectedRider.name : `#${riderId}`}
            </Tag>
          )}

          {userId && (
            <Tag
              closable
              onClose={() => onUserChange?.('')}
              color="geekblue"
            >
              Customer: {selectedCustomer ? selectedCustomer.name : `#${userId}`}
            </Tag>
          )}

          {sort && sort !== 'latest' && (
            <Tag
              closable
              onClose={() => onSortChange?.('latest')}
              color="green"
            >
              Sort: {sort === 'oldest' ? 'Oldest First' : sort === 'amount_desc' ? 'Highest Amount' : sort}
            </Tag>
          )}

          <Button
            type="link"
            size="small"
            onClick={onReset}
            style={{ fontSize: '11.5px', padding: 0, height: 'auto', color: '#ef4444' }}
          >
            Clear all
          </Button>
        </div>
      )}

      {/* Mobile Drawer */}
      <Drawer
        title="Filter & Sort Orders"
        placement="right"
        onClose={() => setFilterDrawerOpen(false)}
        open={filterDrawerOpen}
        width={340}
        className={styles.filterSheet}
      >
        <div className={styles.sheetFilterItem}>
          <label>Search Orders</label>
          <Input.Search
            placeholder="Search orders"
            value={drawerFilters.searchInput}
            onChange={e => setDrawerFilters({ ...drawerFilters, searchInput: e.target.value })}
            allowClear
          />
        </div>

        <div className={styles.sheetFilterItem}>
          <label>Date Filter</label>
          <Select
            value={drawerFilters.dateType}
            onChange={val =>
              setDrawerFilters({
                ...drawerFilters,
                dateType: val,
                singleDate: val === 'single' ? drawerFilters.singleDate || dayjs() : null,
                rangeDates: val === 'range' ? drawerFilters.rangeDates || [dayjs().startOf('month'), dayjs()] : null,
              })
            }
            style={{ width: '100%', marginBottom: 8 }}
            options={[
              { label: 'All Time', value: 'all' },
              { label: 'Today', value: 'today' },
              { label: 'Yesterday', value: 'yesterday' },
              { label: 'This Week', value: 'week' },
              { label: 'This Month', value: 'month' },
              { label: 'Specific Date', value: 'single' },
              { label: 'Custom Range', value: 'range' },
            ]}
          />
          {drawerFilters.dateType === 'single' && (
            <DatePicker
              value={drawerFilters.singleDate}
              onChange={date => setDrawerFilters({ ...drawerFilters, singleDate: date })}
              format="YYYY-MM-DD"
              style={{ width: '100%' }}
              allowClear={false}
            />
          )}
          {drawerFilters.dateType === 'range' && (
            <DatePicker.RangePicker
              value={drawerFilters.rangeDates}
              onChange={dates => setDrawerFilters({ ...drawerFilters, rangeDates: dates })}
              format="YYYY-MM-DD"
              style={{ width: '100%' }}
              allowClear={false}
            />
          )}
        </div>

        <div className={styles.sheetFilterItem}>
          <label>Order Status</label>
          <Select
            allowClear
            placeholder="Filter by Status"
            value={drawerFilters.status}
            onChange={val => setDrawerFilters({ ...drawerFilters, status: val ?? null })}
            style={{ width: '100%' }}
          >
            {[0, 1, 2, 3, 4, 5].map(statusCode => {
              const s = getOrderStatus(statusCode);
              return (
                <Select.Option key={statusCode} value={statusCode}>
                  {s.text}
                </Select.Option>
              );
            })}
          </Select>
        </div>

        <div className={styles.sheetFilterItem}>
          <label>Sort Order</label>
          <Select
            value={drawerFilters.sort || 'latest'}
            onChange={val => setDrawerFilters({ ...drawerFilters, sort: val })}
            style={{ width: '100%' }}
            options={[
              { label: 'Latest First', value: 'latest' },
              { label: 'Oldest First', value: 'oldest' },
              { label: 'Highest Amount', value: 'amount_desc' },
            ]}
          />
        </div>

        <div className={styles.sheetFilterItem}>
          <label>Vendor</label>
          <Select
            showSearch
            allowClear
            loading={filterOptionsLoading.vendors}
            placeholder="Select Vendor"
            value={drawerFilters.vendorId || undefined}
            onChange={val => setDrawerFilters({ ...drawerFilters, vendorId: val || '' })}
            style={{ width: '100%' }}
            optionFilterProp="children"
            options={vendors.map(v => ({
              value: String(v.id),
              label: v.name,
            }))}
          />
        </div>

        <div className={styles.sheetFilterItem}>
          <label>Rider</label>
          <Select
            showSearch
            allowClear
            loading={filterOptionsLoading.riders}
            placeholder="Select Rider"
            value={drawerFilters.riderId || undefined}
            onChange={val => setDrawerFilters({ ...drawerFilters, riderId: val || '' })}
            style={{ width: '100%' }}
            optionFilterProp="children"
            options={riders.map(r => ({
              value: String(r.id),
              label: `${r.name}${r.customId ? ` (${r.customId})` : ''}`,
            }))}
          />
        </div>

        <div className={styles.sheetFilterItem}>
          <label>Customer / User</label>
          <Select
            showSearch
            allowClear
            loading={filterOptionsLoading.customers}
            placeholder="Select Customer"
            value={drawerFilters.userId || undefined}
            onChange={val => setDrawerFilters({ ...drawerFilters, userId: val || '' })}
            style={{ width: '100%' }}
            optionFilterProp="children"
            options={customers.map(c => ({
              value: String(c.id),
              label: `${c.name}${c.customId ? ` (${c.customId})` : c.phone ? ` (${c.phone})` : ''}`,
            }))}
          />
        </div>

        <div className={styles.sheetActions}>
          <Button onClick={handleResetDrawerFilters} style={{ flex: 1 }}>Reset</Button>
          <Button type="primary" onClick={handleApplyDrawerFilters} style={{ flex: 1 }}>Apply Filters</Button>
        </div>
      </Drawer>
    </div>
  );
};

export default OrderFilters;
