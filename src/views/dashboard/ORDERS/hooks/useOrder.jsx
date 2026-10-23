import { useState, useEffect, useCallback, useTransition } from 'react';
import { useSearchParams } from 'react-router-dom';
import dayjs from 'dayjs';
import { getOrdersList } from '../../../../services/apiService';

export const parseOrderTime = (record) => {
  if (!record) return 0;
  const val = record.created_at || record.createdAt || record.order_date || record.date;
  if (!val) return 0;
  if (typeof val === 'number') return val;
  const str = String(val).trim();
  const isoStr = str.replace(' ', 'T');
  const timestamp = Date.parse(isoStr);
  if (!isNaN(timestamp)) return timestamp;
  const dVal = dayjs(val).valueOf();
  return isNaN(dVal) ? 0 : dVal;
};

export const parseOrderIdNum = (record) => {
  if (!record) return 0;
  const val = record.order_id || record.id || record._id;
  if (!val) return 0;
  if (typeof val === 'number') return val;
  const digits = String(val).replace(/\D/g, '');
  return digits ? parseInt(digits, 10) : 0;
};

export const calculateOrderFinancials = (record) => {
  if (!record) return { itemsPrice: 0, deliveryCharge: 0, fastDeliveryCharge: 0, tip: 0, tipPct: 0, overall: 0 };

  const extra = record.extra_details || {};

  const itemsPrice = Number(extra.items_price ?? record.items_price ?? record.total_price ?? 0);
  const deliveryCharge = Number(extra.rider_deliveryCharge ?? record.rider_deliveryCharge ?? record.delivery_charge ?? 0);
  const fastDeliveryCharge = Number(extra.fast_delivery_charges ?? record.fast_delivery_charges ?? 0);

  let tip = Number(extra.tip_amount ?? record.tip_amount ?? 0);
  const tipPct = Number(extra.tip_percentage ?? record.tip_percentage ?? 0);

  if (tip === 0 && tipPct > 0 && itemsPrice > 0) {
    tip = (itemsPrice * tipPct) / 100;
  }

  let overall = Number(extra.overall_amount ?? record.overall_amount ?? 0);
  const calculatedSum = itemsPrice + deliveryCharge + fastDeliveryCharge + tip;

  if (!overall || overall <= 0) {
    overall = calculatedSum;
  }

  return {
    itemsPrice,
    deliveryCharge,
    fastDeliveryCharge,
    tip,
    tipPct,
    overall
  };
};

export const getOrderStatus = (status) => {
  const num = status === null || status === undefined ? 0 : Number(status);
  switch (num) {
    case 0: return { text: 'Pending', color: 'orange' };
    case 1: return { text: 'Confirmed', color: 'blue' };
    case 2: return { text: 'Delivery Assigned', color: 'purple' };
    case 3: return { text: 'Order Rejected', color: 'red' };
    case 4: return { text: 'Order Delivered', color: 'green' };
    case 5: return { text: 'Order Rejected', color: 'red' };
    default: return { text: 'Unknown', color: 'gray' };
  }
};

const useOrder = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Parse initial values from URL searchParams
  const initSearch = searchParams.get('search') || '';
  const initVendorId = searchParams.get('vendor_id') || '';
  const initRiderId = searchParams.get('rider_id') || '';
  const initUserId = searchParams.get('user_id') || '';
  const initStatusStr = searchParams.get('status');
  const initStatus = initStatusStr !== null && initStatusStr !== '' ? Number(initStatusStr) : null;
  const initSort = searchParams.get('sort') || 'latest';
  const initPage = parseInt(searchParams.get('page') || '1', 10);
  const initLimit = parseInt(searchParams.get('limit') || '10', 10);

  // Date parsing
  const urlDate = searchParams.get('date');
  const urlStartDate = searchParams.get('startDate');
  const urlEndDate = searchParams.get('endDate');

  let initDateType = 'month';
  let initSingleDate = null;
  let initRangeDates = null;

  if (urlStartDate && urlEndDate) {
    initDateType = 'range';
    initRangeDates = [dayjs(urlStartDate), dayjs(urlEndDate)];
  } else if (urlDate) {
    if (['today', 'yesterday', 'week', 'month', 'all'].includes(urlDate)) {
      initDateType = urlDate;
    } else {
      initDateType = 'single';
      initSingleDate = dayjs(urlDate);
    }
  }

  // States
  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(initPage > 0 ? initPage : 1);
  const [limit, setLimit] = useState(initLimit > 0 ? initLimit : 10);
  const [search, setSearch] = useState(initSearch);
  const [vendorId, setVendorId] = useState(initVendorId);
  const [riderId, setRiderId] = useState(initRiderId);
  const [userId, setUserId] = useState(initUserId);
  const [status, setStatus] = useState(initStatus);
  const [sort, setSort] = useState(initSort);

  const [dateType, setDateType] = useState(initDateType);
  const [singleDate, setSingleDate] = useState(initSingleDate);
  const [rangeDates, setRangeDates] = useState(initRangeDates);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Synchronize state with URL search params
  const updateUrlParams = useCallback((newParams) => {
    const params = new URLSearchParams();
    if (newParams.search) params.set('search', newParams.search);
    if (newParams.status !== null && newParams.status !== undefined && newParams.status !== '') {
      params.set('status', newParams.status);
    }
    if (newParams.vendorId) params.set('vendor_id', newParams.vendorId);
    if (newParams.riderId) params.set('rider_id', newParams.riderId);
    if (newParams.userId) params.set('user_id', newParams.userId);
    if (newParams.sort && newParams.sort !== 'latest') params.set('sort', newParams.sort);

    // Date
    if (newParams.dateType === 'range' && newParams.rangeDates?.[0] && newParams.rangeDates?.[1]) {
      params.set('startDate', dayjs(newParams.rangeDates[0]).format('YYYY-MM-DD'));
      params.set('endDate', dayjs(newParams.rangeDates[1]).format('YYYY-MM-DD'));
    } else if (newParams.dateType === 'single' && newParams.singleDate) {
      params.set('date', dayjs(newParams.singleDate).format('YYYY-MM-DD'));
    } else if (['today', 'yesterday', 'week', 'month'].includes(newParams.dateType)) {
      params.set('date', newParams.dateType);
    }

    if (newParams.page > 1) params.set('page', newParams.page);
    if (newParams.limit !== 10) params.set('limit', newParams.limit);

    setSearchParams(params, { replace: true });
  }, [setSearchParams]);

  // Fetch orders
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const payload = {
        page,
        limit,
        sort: sort || 'latest',
      };

      if (search && search.trim()) {
        payload.search = search.trim();
      }
      if (status !== null && status !== undefined && status !== '') {
        payload.status = status;
      }
      if (vendorId) {
        payload.vendor_id = vendorId;
      }
      if (riderId) {
        payload.rider_id = riderId;
      }
      if (userId) {
        payload.user_id = userId;
      }

      // Date parameter mapping
      if (['today', 'yesterday', 'week', 'month'].includes(dateType)) {
        payload.date = dateType;
      } else if (dateType === 'single' && singleDate) {
        payload.date = dayjs(singleDate).format('YYYY-MM-DD');
      } else if (dateType === 'range' && rangeDates && rangeDates[0] && rangeDates[1]) {
        payload.startDate = dayjs(rangeDates[0]).format('YYYY-MM-DD');
        payload.endDate = dayjs(rangeDates[1]).format('YYYY-MM-DD');
      }

      const result = await getOrdersList(payload);

      if (result.success) {
        const rawOrders = result.data || [];
        setOrders(rawOrders);
        setTotal(result.total ?? rawOrders.length);
      } else {
        setError(result.error || 'Failed to fetch orders');
        setOrders([]);
        setTotal(0);
      }
    } catch (err) {
      setError(err?.message || 'Error occurred while loading orders');
      setOrders([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [search, page, limit, vendorId, riderId, userId, status, sort, dateType, singleDate, rangeDates]);

  useEffect(() => {
    fetchOrders();
    updateUrlParams({
      search,
      vendorId,
      riderId,
      userId,
      status,
      sort,
      dateType,
      singleDate,
      rangeDates,
      page,
      limit,
    });
  }, [fetchOrders, updateUrlParams]);

  // Reset page to 1 when any filter condition changes
  const handleSearchChange = useCallback((val) => {
    setSearch(val);
    setPage(1);
  }, []);

  const handleVendorChange = useCallback((val) => {
    setVendorId(val || '');
    setPage(1);
  }, []);

  const handleRiderChange = useCallback((val) => {
    setRiderId(val || '');
    setPage(1);
  }, []);

  const handleUserChange = useCallback((val) => {
    setUserId(val || '');
    setPage(1);
  }, []);

  const handleStatusChange = useCallback((val) => {
    setStatus(val);
    setPage(1);
  }, []);

  const handleSortChange = useCallback((val) => {
    setSort(val || 'latest');
    setPage(1);
  }, []);

  const handleDateTypeChange = useCallback((val) => {
    setDateType(val);
    if (val !== 'single') setSingleDate(null);
    if (val !== 'range') setRangeDates(null);
    setPage(1);
  }, []);

  const handleSingleDateChange = useCallback((val) => {
    setSingleDate(val);
    setPage(1);
  }, []);

  const handleRangeDatesChange = useCallback((vals) => {
    setRangeDates(vals);
    setPage(1);
  }, []);

  const resetFilters = useCallback(() => {
    setSearch('');
    setVendorId('');
    setRiderId('');
    setUserId('');
    setStatus(null);
    setSort('latest');
    setDateType('month');
    setSingleDate(null);
    setRangeDates(null);
    setPage(1);
  }, []);

  return {
    orders,
    total,
    page,
    limit,
    search,
    vendorId,
    riderId,
    userId,
    status,
    sort,
    dateType,
    singleDate,
    rangeDates,
    loading,
    error,
    setPage,
    setLimit,
    setSearch: handleSearchChange,
    setVendorId: handleVendorChange,
    setRiderId: handleRiderChange,
    setUserId: handleUserChange,
    setStatus: handleStatusChange,
    setSort: handleSortChange,
    setDateType: handleDateTypeChange,
    setSingleDate: handleSingleDateChange,
    setRangeDates: handleRangeDatesChange,
    resetFilters,
    refetch: fetchOrders,
  };
};

export default useOrder;
