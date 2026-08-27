import { useState, useEffect, useCallback } from 'react';
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

  const itemsPrice = Number(record.items_price || record.total_price || 0);
  const deliveryCharge = Number(record.rider_deliveryCharge || 0);
  const fastDeliveryCharge = Number(record.fast_delivery_charges || 0);

  let tip = Number(record.tip_amount || 0);
  const tipPct = Number(record.tip_percentage || 0);

  if (tip === 0 && tipPct > 0 && itemsPrice > 0) {
    tip = (itemsPrice * tipPct) / 100;
  }

  let overall = Number(record.overall_amount || 0);
  const calculatedSum = itemsPrice + deliveryCharge + fastDeliveryCharge + tip;

  if (!overall || overall <= 0) {
    overall = calculatedSum;
  } else {
    const baseTotal = itemsPrice + deliveryCharge + fastDeliveryCharge;
    if (tip > 0 && Math.abs(overall - baseTotal) < 0.1) {
      overall = baseTotal + tip;
    }
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
  switch (status) {
    case 0: return { text: 'Pending', color: 'orange' };
    case 1: return { text: 'Confirmed', color: 'blue' };
    case 2: return { text: 'Delivery Assigned', color: 'purple' };
    case 3: return { text: 'Order Picked Up', color: 'cyan' };
    case 4: return { text: 'Order Delivered', color: 'green' };
    case 5: return { text: 'Order Rejected', color: 'red' };
    default: return { text: 'Unknown', color: 'gray' };
  }
};

const useOrder = () => {
  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [vendorId, setVendorId] = useState('');
  const [status, setStatus] = useState(null);
  const [dateRange, setDateRange] = useState({
    preset: 'this_month',
    start: dayjs().startOf('month'),
    end: dayjs().endOf('month')
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const API_URL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem('token');

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const payload = {
        search: search || undefined,
        page,
        limit,
        vendor_id: vendorId || undefined,
        status: status !== null ? status : undefined,
        start_date: dateRange?.start ? dateRange.start.format('YYYY-MM-DD') : undefined,
        end_date: dateRange?.end ? dateRange.end.format('YYYY-MM-DD') : undefined,
        sort_order: 'DESC',
        sort_by: 'created_at',
      };
      const result = await getOrdersList(payload);
      if (result.success) {
        const rawOrders = result.data || [];
        const sortedOrders = [...rawOrders].sort((a, b) => {
          const timeA = parseOrderTime(a);
          const timeB = parseOrderTime(b);
          if (timeA !== timeB && timeA > 0 && timeB > 0) {
            return timeB - timeA;
          }
          const idA = parseOrderIdNum(a);
          const idB = parseOrderIdNum(b);
          if (idA !== idB && idA > 0 && idB > 0) {
            return idB - idA;
          }
          return String(b.order_id || b.id || '').localeCompare(String(a.order_id || a.id || ''), undefined, { numeric: true });
        });
        setOrders(sortedOrders);
        setTotal(result.total || sortedOrders.length);
      } else {
        setError(result.error || 'Failed to fetch orders');
      }
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [search, page, limit, vendorId, status, dateRange?.start, dateRange?.end]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Reset page to 1 when search, vendorId, status, or dateRange changes
  useEffect(() => {
    setPage(1);
  }, [search, vendorId, status, dateRange?.start, dateRange?.end]);

  return {
    orders,
    total,
    page,
    limit,
    search,
    vendorId,
    status,
    dateRange,
    loading,
    error,
    setPage,
    setLimit,
    setSearch,
    setVendorId,
    setStatus,
    setDateRange,
    refetch: fetchOrders,
  };
};

export default useOrder;
