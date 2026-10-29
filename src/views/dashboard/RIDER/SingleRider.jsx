import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Tabs, Badge, Button, Table, Image, Select, Typography, Avatar, Divider, Space, Tag, Input, Spin, message, Modal, DatePicker } from 'antd';
import DateRangeSelector from '../../../components/DateRangeSelector';
import { useParams } from 'react-router-dom';
import {
  DollarSign,
  ShoppingCart,
  User,
  Package,
  Phone,
  Mail,
  MapPin,
  FileText,
  Banknote,
  Eye,
  Calendar,
  CreditCard,
  Clock,
  Car,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  Wallet,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { EyeOutlined, SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import { ResponsiveContainer, Tooltip, AreaChart, Area, CartesianGrid, XAxis, YAxis, Legend, PieChart, Pie, Cell } from 'recharts';
import dayjs from 'dayjs';
import { getRiderById, getRiderShares, getRiderWithdrawalsById, getRiderWithdrawals } from '../../../services/apiService';
import { formatPhone } from '../../../services/utils/gen_utility';

const { TabPane } = Tabs;

// Theme palette
const THEME = {
  primary: '#088B46',
  secondary: '#0AA95A',
  warning: '#faad14',
  danger: '#f5222d',
  success: '#52c41a',
  info: '#1890ff',
  background: '#f0f2f5',
  cardBackground: '#ffffff',
  textPrimary: '#000000',
  textSecondary: '#8c8c8c',
  border: '#f0f0f0'
};

const InfoRow = ({ icon, label, value }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#64748b', fontSize: 13 }}>
      {icon}
      <span>{label}</span>
    </div>
    <div style={{ fontWeight: 600, color: '#0f172a', fontSize: 13, textAlign: 'right' }}>
      {value || 'N/A'}
    </div>
  </div>
);

const iconWrapperStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 36,
  height: 36,
  borderRadius: 8,
  margin: 0,
};

export const computeOrderFinancials = (order) => {
  if (!order) return { itemsPrice: 0, delCharge: 0, fastDelCharge: 0, tipAmt: 0, tipPct: 0, overallAmt: 0, baseRiderShare: 0, totalRiderShare: 0, vendorShare: 0 };

  const itemsPrice = Number(order.items_price || order.total_price || 0);
  const delCharge = Number(order.rider_deliveryCharge || 0);
  const fastDelCharge = Number(order.fast_delivery_charges || 0);

  let tipAmt = Number(order.tip_amount || 0);
  const tipPct = Number(order.tip_percentage || 0);

  if (tipAmt === 0 && tipPct > 0 && itemsPrice > 0) {
    tipAmt = (itemsPrice * tipPct) / 100;
  }

  let overallAmt = Number(order.overall_amount || 0);
  const calculatedSum = itemsPrice + delCharge + fastDelCharge + tipAmt;

  if (!overallAmt || overallAmt <= 0) {
    overallAmt = calculatedSum;
  }

  const baseRiderShare = Number(order.rider_share !== undefined && order.rider_share !== null ? order.rider_share : 0);
  const totalRiderShare = baseRiderShare + tipAmt;
  const vendorShare = Number(order.vendor_share || 0);

  return {
    itemsPrice,
    delCharge,
    fastDelCharge,
    tipAmt,
    tipPct,
    overallAmt,
    baseRiderShare,
    totalRiderShare,
    vendorShare
  };
};

const RiderDashboard = () => {
  // State management - default active tab set to "5" (All Orders & Analytics)
  const [activeTab, setActiveTab] = useState("5");
  const [selectedStart, setSelectedStart] = useState(null);
  const [selectedEnd, setSelectedEnd] = useState(null);
  const [tempStart, setTempStart] = useState(null);
  const [tempEnd, setTempEnd] = useState(null);
  const [datePreset, setDatePreset] = useState('all');

  const params = useParams();
  const routeRiderId = params?.riderId || params?.id || window.location.pathname.split('/').pop();
  const riderIdNumber = Number(routeRiderId);

  // Rider data (fetched dynamically)
  const [riderData, setRiderData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Rider orders filter state
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [orderTypeFilter, setOrderTypeFilter] = useState('all');
  const [selectedRiderOrder, setSelectedRiderOrder] = useState(null);

  // Rider Wallet & Transactions state
  const [walletLoading, setWalletLoading] = useState(false);
  const [walletWithdrawals, setWalletWithdrawals] = useState([]);
  const [riderSharesData, setRiderSharesData] = useState(null);
  const [selectedWithdrawalDetail, setSelectedWithdrawalDetail] = useState(null);
  const [walletStatusFilter, setWalletStatusFilter] = useState('all');
  const [walletSearch, setWalletSearch] = useState('');
  const [walletDateRange, setWalletDateRange] = useState(null);

  // Fetch Rider Wallet data (Shares & Withdrawals)
  const fetchWalletData = React.useCallback(async () => {
    if (!riderIdNumber) return;
    setWalletLoading(true);
    try {
      const [sharesRes, withdrawalsRes] = await Promise.allSettled([
        getRiderShares(riderIdNumber),
        getRiderWithdrawalsById(riderIdNumber),
      ]);

      if (sharesRes.status === 'fulfilled' && sharesRes.value?.success) {
        const rawShares = sharesRes.value.data;
        const sharesPayload =
          rawShares?.data && typeof rawShares.data === 'object' && !Array.isArray(rawShares.data)
            ? rawShares.data
            : rawShares;
        setRiderSharesData(sharesPayload);
      }

      let wList = [];
      if (
        withdrawalsRes.status === 'fulfilled' &&
        withdrawalsRes.value?.success &&
        Array.isArray(withdrawalsRes.value.data)
      ) {
        wList = withdrawalsRes.value.data;
      }

      // If specific rider withdrawals endpoint returns empty, check all-rider-withdrawals as fallback
      if (!wList || wList.length === 0) {
        try {
          const allWdrRes = await getRiderWithdrawals('all');
          if (allWdrRes?.success && Array.isArray(allWdrRes.data)) {
            wList = allWdrRes.data.filter(
              (w) =>
                Number(w.rider_id) === riderIdNumber ||
                Number(w.rider?.id) === riderIdNumber
            );
          }
        } catch (e) {
          console.warn('Fallback fetch of all rider withdrawals failed:', e);
        }
      }

      setWalletWithdrawals(wList || []);
    } catch (err) {
      console.error('Error fetching rider wallet data:', err);
    } finally {
      setWalletLoading(false);
    }
  }, [riderIdNumber]);

  useEffect(() => {
    fetchWalletData();
  }, [fetchWalletData]);

  // Wallet summary metrics & withdrawal transaction ledger
  const walletSummary = React.useMemo(() => {
    const sharesOrders = Array.isArray(riderSharesData?.orders) ? riderSharesData.orders : null;
    const riderOrders = Array.isArray(riderData?.orders) ? riderData.orders : [];
    const isFromSharesApi = !!sharesOrders && sharesOrders.length > 0;
    const ordersList = isFromSharesApi ? sharesOrders : riderOrders;

    let computedTotalEarnings = 0;
    let computedDeliveredCount = 0;

    ordersList.forEach((order) => {
      const isDelivered = isFromSharesApi ? true : Number(order.order_status) === 4;
      if (isDelivered) {
        let orderEarnings = 0;
        if (order.rider_share !== undefined && order.rider_share !== null) {
          const base = Number(order.rider_share || 0);
          let tip = Number(order.tip_amount || 0);
          const tipPct = Number(order.tip_percentage || 0);
          if (tip === 0 && tipPct > 0) {
            const items = Number(order.items_price || order.total_price || 0);
            tip = (items * tipPct) / 100;
          }
          orderEarnings = base + tip;
        } else {
          const { totalRiderShare } = computeOrderFinancials(order);
          orderEarnings = totalRiderShare;
        }

        computedTotalEarnings += orderEarnings;
        computedDeliveredCount += 1;
      }
    });

    // Use total_rider_share & total_orders_count from /order/getvendorshares API as source of truth
    const totalDeliveredEarnings =
      riderSharesData &&
      riderSharesData.total_rider_share !== undefined &&
      riderSharesData.total_rider_share !== null
        ? Number(riderSharesData.total_rider_share)
        : computedTotalEarnings;

    const deliveredOrdersCount =
      riderSharesData &&
      riderSharesData.total_orders_count !== undefined &&
      riderSharesData.total_orders_count !== null
        ? Number(riderSharesData.total_orders_count)
        : computedDeliveredCount;

    let totalCompletedWithdrawals = 0;
    let totalPendingWithdrawals = 0;
    let completedWithdrawalsCount = 0;
    let pendingWithdrawalsCount = 0;
    const withdrawalTransactions = [];

    (walletWithdrawals || []).forEach((w) => {
      const amt = Number(w.amount || w.requested_amount || 0);
      const rawStatus = String(w.status || w.withdrawal_status || 'pending').toLowerCase().trim();
      const isCompleted = ['completed', 'approved', 'success', 'paid'].includes(rawStatus);
      const isPending = rawStatus === 'pending';

      if (isCompleted) {
        totalCompletedWithdrawals += amt;
        completedWithdrawalsCount += 1;
      } else if (isPending) {
        totalPendingWithdrawals += amt;
        pendingWithdrawalsCount += 1;
      }

      let statusColor = 'orange';
      let statusLabel = 'Pending';
      if (isCompleted) {
        statusColor = 'green';
        statusLabel = 'Completed';
      } else if (['rejected', 'failed', 'cancelled', 'canceled'].includes(rawStatus)) {
        statusColor = 'red';
        statusLabel = rawStatus.charAt(0).toUpperCase() + rawStatus.slice(1);
      }

      const bankName = w.bank_name || w.bank_details?.bank_name || riderData?.bank_name || 'Bank Account';
      const accNo = w.account_number || w.bank_details?.account_number || riderData?.account_number;
      const maskedAcc = accNo ? `••••${String(accNo).slice(-4)}` : '';
      const dateVal = w.created_at || w.date || w.requested_at;
      const ref = w.transaction_ref || w.transaction_reference;

      withdrawalTransactions.push({
        key: `wdr-${w.id || w.payout_id || Math.random()}`,
        id: w.id,
        uid: w.payout_id || (w.id ? `WDR#${w.id}` : 'WDR'),
        type: 'withdrawal',
        typeLabel: 'Withdrawal',
        title: `Payout Request ${w.payout_id || (w.id ? `#${w.id}` : '')}`,
        subtitle: `To: ${bankName} ${maskedAcc} ${ref ? `• Ref: ${ref}` : ''}`.trim(),
        date: dateVal,
        amount: amt,
        status: rawStatus,
        statusLabel,
        statusColor,
        rawRecord: w,
        category: 'withdrawal',
      });
    });

    const availableBalance = Math.max(0, totalDeliveredEarnings - totalCompletedWithdrawals);

    const allTransactions = [...withdrawalTransactions];
    allTransactions.sort((a, b) => {
      const timeA = a.date ? new Date(a.date).getTime() : 0;
      const timeB = b.date ? new Date(b.date).getTime() : 0;
      return timeB - timeA;
    });

    return {
      totalDeliveredEarnings,
      deliveredOrdersCount,
      totalCompletedWithdrawals,
      completedWithdrawalsCount,
      totalPendingWithdrawals,
      pendingWithdrawalsCount,
      availableBalance,
      allTransactions,
    };
  }, [riderSharesData, riderData, walletWithdrawals]);

  // Filtered wallet withdrawal transactions
  const filteredWalletTransactions = React.useMemo(() => {
    return walletSummary.allTransactions.filter((item) => {
      if (walletStatusFilter !== 'all') {
        if (walletStatusFilter === 'completed' && !['completed', 'approved', 'success', 'paid'].includes(item.status)) return false;
        if (walletStatusFilter === 'pending' && item.status !== 'pending') return false;
        if (walletStatusFilter === 'rejected' && !['rejected', 'failed', 'cancelled', 'canceled'].includes(item.status)) return false;
      }

      if (walletDateRange && walletDateRange[0] && walletDateRange[1]) {
        if (!item.date) return false;
        const itemTime = dayjs(item.date);
        if (!itemTime.isValid()) return false;
        const start = dayjs(walletDateRange[0]).startOf('day');
        const end = dayjs(walletDateRange[1]).endOf('day');
        if (itemTime.isBefore(start) || itemTime.isAfter(end)) return false;
      }

      if (walletSearch.trim()) {
        const query = walletSearch.toLowerCase().trim();
        const matchesUid = String(item.uid || '').toLowerCase().includes(query);
        const matchesTitle = String(item.title || '').toLowerCase().includes(query);
        const matchesSubtitle = String(item.subtitle || '').toLowerCase().includes(query);
        const matchesAmount = String(item.amount || '').includes(query);
        if (!matchesUid && !matchesTitle && !matchesSubtitle && !matchesAmount) return false;
      }

      return true;
    });
  }, [walletSummary.allTransactions, walletStatusFilter, walletDateRange, walletSearch]);

  const walletTableColumns = [
    {
      title: 'Reference / ID',
      key: 'uid',
      width: 175,
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '13.5px' }}>
            {record.uid}
          </div>
          <div style={{ marginTop: 3 }}>
            <Tag color="red" style={{ borderRadius: 10, fontSize: 11, padding: '1px 8px', fontWeight: 600 }}>
              <TrendingDown size={11} style={{ marginRight: 4, display: 'inline', verticalAlign: '-1px' }} /> Withdrawal
            </Tag>
          </div>
        </div>
      ),
    },
    {
      title: 'Details & Description',
      key: 'description',
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 600, color: '#1e293b', fontSize: '13px' }}>
            {record.title}
          </div>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: 2 }}>
            {record.subtitle}
          </div>
        </div>
      ),
    },
    {
      title: 'Date & Time',
      key: 'date',
      width: 160,
      sorter: (a, b) => (new Date(a.date).getTime() || 0) - (new Date(b.date).getTime() || 0),
      render: (_, record) => {
        const d = record.date ? dayjs(record.date) : null;
        return d && d.isValid() ? (
          <div>
            <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '12.5px' }}>
              {d.format('DD MMM YYYY')}
            </div>
            <div style={{ fontSize: '11px', color: '#64748b' }}>
              {d.format('hh:mm A')}
            </div>
          </div>
        ) : <span style={{ color: '#94a3b8' }}>-</span>;
      },
    },
    {
      title: 'Amount',
      key: 'amount',
      width: 160,
      sorter: (a, b) => a.amount - b.amount,
      render: (_, record) => (
        <div>
          <div
            style={{
              fontWeight: 700,
              fontSize: '15px',
              color: '#dc2626',
            }}
          >
            -${Number(record.amount).toFixed(2)}
          </div>
          <div style={{ fontSize: '11px', color: '#94a3b8' }}>
            Debit / Payout
          </div>
        </div>
      ),
    },
    {
      title: 'Status',
      key: 'status',
      width: 130,
      render: (_, record) => (
        <Tag color={record.statusColor} style={{ borderRadius: 12, padding: '2px 10px', fontWeight: 600 }}>
          {record.statusLabel}
        </Tag>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      width: 90,
      align: 'center',
      render: (_, record) => (
        <Button
          type="primary"
          size="small"
          icon={<EyeOutlined />}
          style={{
            borderRadius: '6px',
            background: '#2563eb',
            border: 'none',
          }}
          onClick={() => {
            setSelectedWithdrawalDetail(record.rawRecord);
          }}
        >
          View
        </Button>
      ),
    },
  ];

  useEffect(() => {
    const loadRider = async () => {
      if (!riderIdNumber) return;
      setLoading(true);
      try {
        const res = await getRiderById(riderIdNumber);
        if (res?.success && res?.data) {
          setRiderData(res.data);
        } else {
          message.error(res?.message || 'Failed to fetch rider data');
        }
      } catch (error) {
        message.error('Error fetching rider data');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    loadRider();
  }, [riderIdNumber]);

  // Order status helper
  const getRiderOrderStatus = (status) => {
    if (status === null || status === undefined) {
      return { text: 'Pending', color: 'orange' };
    }
    switch (Number(status)) {
      case 0: return { text: 'Pending', color: 'orange' };
      case 1: return { text: 'Confirmed', color: 'blue' };
      case 2: return { text: 'Delivery Assigned', color: 'purple' };
      case 3: return { text: 'Order Rejected', color: 'red' };
      case 4: return { text: 'Order Delivered', color: 'green' };
      case 5: return { text: 'Order Rejected', color: 'red' };
      default: return { text: 'Pending', color: 'orange' };
    }
  };

  // Analytics & Orders Calculation Memo
  const riderAnalyticsMetrics = React.useMemo(() => {
    const rawOrders = Array.isArray(riderData?.orders) ? riderData.orders : [];

    // 1. Filter orders by selected date range
    const filteredOrders = rawOrders.filter(o => {
      const dateVal = o.order_date || o.created_at;
      if (!selectedStart || !selectedEnd) return true;
      if (!dateVal) return true;
      const orderDate = dayjs(dateVal);
      return (orderDate.isAfter(selectedStart.startOf('day')) || orderDate.isSame(selectedStart.startOf('day'))) &&
             (orderDate.isBefore(selectedEnd.endOf('day')) || orderDate.isSame(selectedEnd.endOf('day')));
    });

    let totalDeliveredRiderShare = 0; // Net earnings for delivered orders
    let pendingRiderShare = 0;          // Pending earnings for active orders
    let grossTotalOrderPrice = 0;       // Gross customer total

    let deliveredCount = 0;
    let pendingCount = 0;
    let confirmedCount = 0;
    let pickedUpCount = 0;
    let rejectedCount = 0;

    const dailyMap = {};

    filteredOrders.forEach(o => {
      const { overallAmt, totalRiderShare } = computeOrderFinancials(o);
      const status = o.order_status === null || o.order_status === undefined ? 0 : Number(o.order_status);
      const dateVal = o.order_date || o.created_at;
      const dateKey = dateVal ? dayjs(dateVal).format('MMM DD') : 'Other';

      if (!dailyMap[dateKey]) {
        dailyMap[dateKey] = { label: dateKey, deliveredEarnings: 0, pendingEarnings: 0, grossTotal: 0, orders: 0 };
      }
      dailyMap[dateKey].orders += 1;
      dailyMap[dateKey].grossTotal += overallAmt;
      grossTotalOrderPrice += overallAmt;

      if (status === 4) {
        // Delivered
        totalDeliveredRiderShare += totalRiderShare;
        deliveredCount++;
        dailyMap[dateKey].deliveredEarnings += totalRiderShare;
      } else if (status === 3 || status === 5) {
        // Rejected
        rejectedCount++;
      } else {
        // Pending / Processing / Assigned
        pendingRiderShare += totalRiderShare;
        dailyMap[dateKey].pendingEarnings += totalRiderShare;
        if (status === 1) confirmedCount++;
        else pendingCount++;
      }
    });

    // 2. Filter & Sort Table Orders strictly DESC (newest first)
    const tableOrders = filteredOrders.filter(order => {
      const { totalRiderShare } = computeOrderFinancials(order);
      const status = order.order_status === null || order.order_status === undefined ? 0 : Number(order.order_status);

      // Status filter
      if (orderStatusFilter !== 'all' && status !== Number(orderStatusFilter)) {
        return false;
      }

      // Revenue/Earnings type filter
      if (orderTypeFilter === 'delivered' && status !== 4) return false;
      if (orderTypeFilter === 'pending' && (status === 4 || status === 5)) return false;
      if (orderTypeFilter === 'zero_share' && totalRiderShare > 0) return false;
      if (orderTypeFilter === 'rejected' && status !== 5) return false;

      // Search query filter
      if (orderSearch.trim()) {
        const query = orderSearch.toLowerCase().trim();
        const uid = (order.order_uid || '').toLowerCase();
        const idStr = String(order.id || '');
        const custName = [order.customer?.firstname, order.customer?.lastname].filter(Boolean).join(' ').toLowerCase();
        const custEmail = (order.customer?.email || '').toLowerCase();
        const custPhone = (order.customer?.phonenumber || '').toLowerCase();
        const addr = (typeof order.customer?.address === 'string' ? order.customer.address : (typeof order.address === 'string' ? order.address : order.address?.address || '')).toLowerCase();
        const prodNames = (order.products || []).map(p => (p.product_name || '').toLowerCase()).join(' ');

        const matches = uid.includes(query) ||
                        idStr.includes(query) ||
                        custName.includes(query) ||
                        custEmail.includes(query) ||
                        custPhone.includes(query) ||
                        addr.includes(query) ||
                        prodNames.includes(query);
        if (!matches) return false;
      }

      return true;
    });

    // Sort DESC (newest orders at the top)
    tableOrders.sort((a, b) => {
      const dateA = a.order_date || a.created_at;
      const dateB = b.order_date || b.created_at;
      const timeA = dateA ? new Date(dateA).getTime() : Number(a.id || 0);
      const timeB = dateB ? new Date(dateB).getTime() : Number(b.id || 0);
      return timeB - timeA;
    });

    const totalOrdersCount = filteredOrders.length;
    const avgEarningsPerOrder = deliveredCount > 0 ? (totalDeliveredRiderShare / deliveredCount) : 0;
    const chartTrendData = Object.values(dailyMap);

    const statusDistribution = [
      { name: 'Delivered Earnings', value: totalDeliveredRiderShare, color: '#52c41a' },
      { name: 'Pending Earnings', value: pendingRiderShare, color: '#faad14' },
    ].filter(item => item.value > 0);

    return {
      filteredOrders,
      tableOrders,
      totalOrdersCount,
      grossTotalOrderPrice,
      totalDeliveredRiderShare,
      pendingRiderShare,
      deliveredCount,
      pendingCount: pendingCount + confirmedCount + pickedUpCount,
      rejectedCount,
      avgEarningsPerOrder,
      chartTrendData,
      statusDistribution
    };
  }, [riderData?.orders, selectedStart, selectedEnd, orderSearch, orderStatusFilter, orderTypeFilter]);

  // Unified Rider Orders Table Columns
  const riderOrderColumns = [
    {
      title: 'Order ID',
      key: 'order_id',
      width: 170,
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '13.5px' }}>
            {record.order_uid || record.id || '-'}
          </div>
          {record.id && (
            <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 500 }}>
              ID: #{record.id}
            </span>
          )}
        </div>
      ),
    },
    {
      title: 'Customer & Address',
      key: 'customer',
      width: 250,
      render: (_, record) => {
        const cust = record.customer || {};
        const custName = [cust.firstname, cust.lastname].filter(Boolean).join(' ') || record.firstname || 'Customer';
        const phone = cust.phonenumber || record.phonenumber;
        const email = cust.email || record.email;
        const addrText = typeof cust.address === 'string' ? cust.address : (typeof record.address === 'string' ? record.address : record.address?.address);

        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '13.5px' }}>
              {custName}
            </div>
            {(phone || email) && (
              <div style={{ fontSize: '11.5px', color: '#64748b' }}>
                {phone && <span>📞 {phone}</span>}
                {phone && email && <span style={{ margin: '0 4px' }}>•</span>}
                {email && <span style={{ wordBreak: 'break-all' }}>{email}</span>}
              </div>
            )}
            {addrText && (
              <div style={{ fontSize: '11.5px', color: '#475569', marginTop: 2, lineHeight: 1.3 }}>
                📍 {addrText.length > 40 ? `${addrText.slice(0, 40)}...` : addrText}
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: 'Items & Products',
      key: 'products',
      render: (_, record) => {
        const prods = record.products || [];
        if (!prods.length) return <span style={{ color: '#94a3b8' }}>No items</span>;
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {prods.map((p, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '12px' }}>
                {p.product_image ? (
                  <img src={p.product_image} alt="Prod" style={{ width: 24, height: 24, borderRadius: 4, objectFit: 'cover' }} />
                ) : (
                  <Package size={16} color="#0284c7" />
                )}
                <span style={{ fontWeight: 600, color: '#1e293b' }}>{p.product_name}</span>
                <Tag color="blue" style={{ fontSize: '10px', padding: '0 4px', margin: 0 }}>x{p.product_quantity}</Tag>
                <span style={{ color: '#64748b' }}>${Number(p.single_item_price || 0).toFixed(2)}</span>
              </div>
            ))}
          </div>
        );
      },
    },
    {
      title: 'Qty',
      dataIndex: 'total_quantity',
      key: 'total_quantity',
      align: 'center',
      width: 65,
      render: (qty) => <Badge count={qty || 0} style={{ backgroundColor: '#0284c7' }} />,
    },
    {
      title: 'Overall Amount',
      key: 'overall_amount',
      width: 140,
      align: 'right',
      sorter: (a, b) => computeOrderFinancials(a).overallAmt - computeOrderFinancials(b).overallAmt,
      render: (_, record) => {
        const { overallAmt } = computeOrderFinancials(record);
        return (
          <strong style={{ color: '#0f172a', fontSize: '14.5px' }}>
            ${overallAmt.toFixed(2)}
          </strong>
        );
      },
    },
    {
      title: 'Rider Share (Earnings)',
      key: 'rider_share',
      width: 220,
      align: 'right',
      sorter: (a, b) => computeOrderFinancials(a).totalRiderShare - computeOrderFinancials(b).totalRiderShare,
      render: (_, record) => {
        const { totalRiderShare, delCharge, fastDelCharge, tipAmt, tipPct } = computeOrderFinancials(record);
        return (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
            <strong style={{ color: record.order_status === 4 ? '#16a34a' : (record.order_status === 3 || record.order_status === 5) ? '#dc2626' : '#d97706', fontSize: '15px' }}>
              ${totalRiderShare.toFixed(2)}
            </strong>
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'flex-end', marginTop: 2 }}>
              {delCharge > 0 && (
                <Tag color="cyan" style={{ fontSize: '10.5px', padding: '0 5px', margin: 0, fontWeight: 600 }}>
                  Del: ${delCharge.toFixed(2)}
                </Tag>
              )}
              {fastDelCharge > 0 && (
                <Tag color="purple" style={{ fontSize: '10.5px', padding: '0 5px', margin: 0, fontWeight: 600 }}>
                  ⚡ Fast: ${fastDelCharge.toFixed(2)}
                </Tag>
              )}
              {tipAmt > 0 && (
                <Tag color="gold" style={{ fontSize: '10.5px', padding: '0 5px', margin: 0, fontWeight: 600 }}>
                  🎁 Tip: ${tipAmt.toFixed(2)} {tipPct > 0 ? `(${tipPct}%)` : ''}
                </Tag>
              )}
            </div>
          </div>
        );
      },
    },
    {
      title: 'Status',
      dataIndex: 'order_status',
      key: 'order_status',
      width: 140,
      render: (statusVal) => {
        const s = getRiderOrderStatus(statusVal);
        return <Tag color={s.color} style={{ borderRadius: '12px', padding: '2px 10px', fontWeight: 600 }}>{s.text}</Tag>;
      },
    },
    {
      title: 'Order Date',
      key: 'order_date',
      width: 160,
      sorter: (a, b) => {
        const dateA = a.order_date || a.created_at;
        const dateB = b.order_date || b.created_at;
        return (new Date(dateA).getTime() || 0) - (new Date(dateB).getTime() || 0);
      },
      render: (_, record) => {
        const dateVal = record.order_date || record.created_at;
        return dateVal ? (
          <div>
            <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '12.5px' }}>
              {dayjs(dateVal).format('DD MMM YYYY')}
            </div>
            <div style={{ fontSize: '11px', color: '#64748b' }}>
              {dayjs(dateVal).format('hh:mm A')}
            </div>
          </div>
        ) : '-';
      },
    },
    {
      title: 'Action',
      key: 'action',
      width: 80,
      align: 'center',
      render: (_, record) => (
        <Button
          type="primary"
          size="small"
          icon={<EyeOutlined />}
          style={{ borderRadius: '6px', background: '#088b46', border: 'none' }}
          onClick={() => setSelectedRiderOrder(record)}
        >
          View
        </Button>
      ),
    },
  ];

  // Document Verification columns
  const documentColumns = [
    {
      title: 'Document Name',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <span style={{ fontWeight: 600, color: '#0f172a' }}>{text}</span>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Badge
          status={status === 'Uploaded' ? 'success' : 'warning'}
          text={<span style={{ fontWeight: 600, color: status === 'Uploaded' ? '#16a34a' : '#d97706' }}>{status}</span>}
        />
      ),
    },
    {
      title: 'Action / Preview',
      key: 'action',
      align: 'right',
      render: (_, record) => (
        record.url ? (
          <Image
            src={record.url}
            alt={record.name}
            style={{ width: 44, height: 32, objectFit: 'cover', borderRadius: 4, cursor: 'pointer', border: '1px solid #e2e8f0' }}
            preview={{ zIndex: 3000 }}
          />
        ) : (
          <span style={{ fontSize: 12, color: '#94a3b8' }}>Not Uploaded</span>
        )
      ),
    },
  ];

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <Spin size="large" tip="Loading Rider Details..." />
      </div>
    );
  }

  const riderName = `${riderData?.firstname || ''} ${riderData?.lastname || ''}`.trim() || 'Rider';

  return (
    <div style={{ backgroundColor: '#f0f2f5', padding: '16px 24px', minHeight: '100vh' }}>
      {/* Header Hero Card */}
      <Card bodyStyle={{ padding: 16 }} style={{ borderRadius: 8, marginBottom: 16 }}>
        <Row align="middle" justify="space-between" gutter={[16, 16]}>
          <Col xs={24} md={16}>
            <div className="d-flex align-items-center flex-wrap gap-3">
              <div
                className="d-flex align-items-center justify-content-center"
                style={{
                  width: '68px',
                  height: '68px',
                  backgroundColor: THEME.primary,
                  borderRadius: '12px',
                  color: 'white',
                  fontSize: '22px',
                  fontWeight: 'bold',
                  overflow: 'hidden',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  flexShrink: 0,
                }}
              >
                {riderData?.profile_pic ? (
                  <img src={riderData.profile_pic} alt="Rider Profile" style={{ width: '68px', height: '68px', objectFit: 'cover' }} />
                ) : (
                  <span>{riderData?.firstname?.[0]?.toUpperCase() || 'R'}</span>
                )}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <h3 className="mb-0" style={{ fontWeight: 700, color: '#0f172a' }}>{riderName}</h3>
                  {riderData?.username && (
                    <Tag color="cyan" style={{ borderRadius: 6, fontWeight: 600 }}>@{riderData.username}</Tag>
                  )}
                  {(riderData?.custom_id || riderData?.rider_id) && (
                    <Tag color="blue" style={{ borderRadius: 6, fontWeight: 600 }}>
                      Rider ID: {riderData?.custom_id || riderData?.rider_id}
                    </Tag>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', fontSize: 12, color: '#475569', marginTop: 4 }}>
                  {riderData?.phonenumber && <span>📞 {formatPhone(riderData.phonenumber, riderData.prefix)}</span>}
                  {riderData?.email && <span>✉️ {riderData.email}</span>}
                  {riderData?.license_number && <span>🪪 License: <strong>{riderData.license_number}</strong></span>}
                  {riderData?.vehicle_registration_number && <span>🛵 Vehicle Reg: <strong>{riderData.vehicle_registration_number}</strong></span>}
                </div>
              </div>
            </div>
          </Col>
          <Col xs={24} md={8} style={{ textAlign: 'right' }}>
            <Space direction="vertical" align="end" size={6}>
              <div style={{ display: 'flex', gap: 8 }}>
                <Badge
                  status={riderData?.is_verified === 1 ? 'success' : 'warning'}
                  text={<span style={{ fontWeight: 600 }}>{riderData?.is_verified === 1 ? 'Verified Rider' : 'Pending Verification'}</span>}
                />
                <Badge
                  status={riderData?.status === 1 ? 'processing' : 'default'}
                  text={<span style={{ fontWeight: 600 }}>{riderData?.status === 1 ? 'Active' : 'Inactive'}</span>}
                />
              </div>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Main Tabs Container */}
      <div>
        <Tabs activeKey={activeTab} onChange={setActiveTab} tabBarStyle={{ backgroundColor: 'white', paddingLeft: 16, borderRadius: '8px 8px 0 0', margin: 0 }} size="large">
          
          {/* Default Active Tab: All Orders & Delivery Analytics */}
          <TabPane tab={<span><ShoppingCart size={16} /> All Orders & Delivery Analytics ({riderData?.orders?.length || 0})</span>} key="5">
            {/* Filter Header & Controls */}
            <Card bodyStyle={{ padding: '16px 20px' }} style={{ borderRadius: '0 0 8px 8px', marginBottom: 16 }}>
              <div className="d-flex align-items-center justify-content-between flex-md-row flex-column gap-3 mb-3">
                <div>
                  <h4 className="mb-0" style={{ fontWeight: 700, color: '#0f172a' }}>Delivery Orders & Earnings Analytics</h4>
                  <p className="text-muted mb-0" style={{ fontSize: 12 }}>
                    Real-time delivery earnings, pending payouts, order status, and complete order history.
                  </p>
                </div>
                <div className="d-flex align-items-center" style={{ gap: 12 }}>
                  <DateRangeSelector
                    preset={datePreset}
                    start={tempStart}
                    end={tempEnd}
                    onChange={({ preset, start, end }) => {
                      setDatePreset(preset);
                      setTempStart(start);
                      setTempEnd(end);
                      setSelectedStart(start);
                      setSelectedEnd(end);
                    }}
                  />
                </div>
              </div>

              {/* Filter Controls Bar */}
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                <Input
                  prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
                  placeholder="Search order UID, customer, phone, address, product..."
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  allowClear
                  style={{ width: 300, borderRadius: 8 }}
                />

                <Select
                  value={orderStatusFilter}
                  onChange={setOrderStatusFilter}
                  style={{ width: 170 }}
                >
                  <Select.Option value="all">All Order Statuses</Select.Option>
                  <Select.Option value="4">Delivered</Select.Option>
                  <Select.Option value="0">Pending</Select.Option>
                  <Select.Option value="1">Confirmed</Select.Option>
                  <Select.Option value="2">Delivery Assigned</Select.Option>
                  <Select.Option value="3">Order Picked Up</Select.Option>
                  <Select.Option value="5">Rejected</Select.Option>
                </Select>

                <Select
                  value={orderTypeFilter}
                  onChange={setOrderTypeFilter}
                  style={{ width: 190 }}
                >
                  <Select.Option value="all">All Earnings Types</Select.Option>
                  <Select.Option value="delivered">Delivered Earnings Only</Select.Option>
                  <Select.Option value="pending">Pending Payout Only</Select.Option>
                  <Select.Option value="zero_share">Zero Share Orders</Select.Option>
                  <Select.Option value="rejected">Rejected Orders Only</Select.Option>
                </Select>

                {(orderSearch || orderStatusFilter !== 'all' || orderTypeFilter !== 'all') && (
                  <Button
                    onClick={() => {
                      setOrderSearch('');
                      setOrderStatusFilter('all');
                      setOrderTypeFilter('all');
                    }}
                  >
                    Reset Filters
                  </Button>
                )}

                <div style={{ fontSize: 13, color: '#64748b', marginLeft: 'auto' }}>
                  Showing <strong>{riderAnalyticsMetrics?.tableOrders?.length || 0}</strong> of {riderData?.orders?.length || 0} orders
                </div>
              </div>
            </Card>

            {/* Financial Stat Cards Grid */}
            <Row gutter={[16, 16]} className="mb-4">
              <Col xs={24} sm={12} md={8} lg={4}>
                <Card bodyStyle={{ padding: 16 }} style={{ borderRadius: 8, height: '100%', borderLeft: `4px solid ${THEME.primary}` }}>
                  <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Net Rider Earnings</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: '#088b46', marginTop: 4 }}>
                    ${(riderAnalyticsMetrics?.totalDeliveredRiderShare || 0).toFixed(2)}
                  </div>
                  <div style={{ fontSize: 11, color: '#16a34a', marginTop: 4 }}>
                    {riderAnalyticsMetrics?.deliveredCount || 0} Delivered Orders
                  </div>
                </Card>
              </Col>

              <Col xs={24} sm={12} md={8} lg={4}>
                <Card bodyStyle={{ padding: 16 }} style={{ borderRadius: 8, height: '100%', borderLeft: '4px solid #faad14' }}>
                  <div style={{ fontSize: 12, color: '#d97706', fontWeight: 600 }}>Pending Rider Payout</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: '#d97706', marginTop: 4 }}>
                    ${(riderAnalyticsMetrics?.pendingRiderShare || 0).toFixed(2)}
                  </div>
                  <div style={{ fontSize: 11, color: '#d97706', marginTop: 4 }}>
                    {riderAnalyticsMetrics?.pendingCount || 0} Pending Orders
                  </div>
                </Card>
              </Col>

              <Col xs={24} sm={12} md={8} lg={4}>
                <Card bodyStyle={{ padding: 16 }} style={{ borderRadius: 8, height: '100%', borderLeft: '4px solid #0284c7' }}>
                  <div style={{ fontSize: 12, color: '#0284c7', fontWeight: 600 }}>Gross Order Value</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: '#0284c7', marginTop: 4 }}>
                    ${(riderAnalyticsMetrics?.grossTotalOrderPrice || 0).toFixed(2)}
                  </div>
                  <div style={{ fontSize: 11, color: '#0284c7', marginTop: 4 }}>
                    {riderAnalyticsMetrics?.totalOrdersCount || 0} Total Orders
                  </div>
                </Card>
              </Col>

              <Col xs={24} sm={12} md={8} lg={4}>
                <Card bodyStyle={{ padding: 16 }} style={{ borderRadius: 8, height: '100%', borderLeft: '4px solid #7c3aed' }}>
                  <div style={{ fontSize: 12, color: '#7c3aed', fontWeight: 600 }}>Avg Earnings / Order</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: '#7c3aed', marginTop: 4 }}>
                    ${(riderAnalyticsMetrics?.avgEarningsPerOrder || 0).toFixed(2)}
                  </div>
                  <div style={{ fontSize: 11, color: '#7c3aed', marginTop: 4 }}>
                    Per Delivered Order
                  </div>
                </Card>
              </Col>

              <Col xs={24} sm={12} md={8} lg={4}>
                <Card bodyStyle={{ padding: 16 }} style={{ borderRadius: 8, height: '100%', borderLeft: '4px solid #52c41a' }}>
                  <div style={{ fontSize: 12, color: '#16a34a', fontWeight: 600 }}>Completed Deliveries</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: '#16a34a', marginTop: 4 }}>
                    {riderAnalyticsMetrics?.deliveredCount || 0}
                  </div>
                  <div style={{ fontSize: 11, color: '#16a34a', marginTop: 4 }}>
                    Successfully Delivered
                  </div>
                </Card>
              </Col>

              <Col xs={24} sm={12} md={8} lg={4}>
                <Card bodyStyle={{ padding: 16 }} style={{ borderRadius: 8, height: '100%', borderLeft: '4px solid #f5222d' }}>
                  <div style={{ fontSize: 12, color: '#dc2626', fontWeight: 600 }}>Rejected Orders</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: '#dc2626', marginTop: 4 }}>
                    {riderAnalyticsMetrics?.rejectedCount || 0}
                  </div>
                  <div style={{ fontSize: 11, color: '#dc2626', marginTop: 4 }}>
                    Cancelled Deliveries
                  </div>
                </Card>
              </Col>
            </Row>

            {/* Analytics Charts */}
            <Row gutter={[16, 16]} className="mb-4">
              <Col xs={24} lg={14}>
                <Card title="Rider Earnings & Pending Trend" className="h-100">
                  <ResponsiveContainer width="100%" height={320}>
                    <AreaChart data={riderAnalyticsMetrics?.chartTrendData || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="label" />
                      <YAxis />
                      <Tooltip formatter={(value) => `$${Number(value).toFixed(2)}`} />
                      <Legend />
                      <Area type="monotone" dataKey="deliveredEarnings" name="Delivered Rider Share" stroke="#52c41a" fill="#52c41a" fillOpacity={0.2} />
                      <Area type="monotone" dataKey="pendingEarnings" name="Pending Rider Share" stroke="#faad14" fill="#faad14" fillOpacity={0.2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </Card>
              </Col>

              <Col xs={24} lg={10}>
                <Card title="Earnings Breakdown" className="h-100">
                  <ResponsiveContainer width="100%" height={320}>
                    <PieChart>
                      <Pie
                        data={riderAnalyticsMetrics?.statusDistribution?.length > 0 ? riderAnalyticsMetrics.statusDistribution : [{ name: 'No Earnings', value: 1, color: '#e2e8f0' }]}
                        cx="50%"
                        cy="50%"
                        outerRadius={90}
                        dataKey="value"
                        label={({ name, value }) => `${name}: $${Number(value).toFixed(2)}`}
                      >
                        {(riderAnalyticsMetrics?.statusDistribution || []).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(val) => `$${Number(val).toFixed(2)}`} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </Card>
              </Col>
            </Row>

            {/* Unified Orders Table */}
            <Card title="Delivery History, Earnings & Order Breakdown" style={{ borderRadius: 8, marginBottom: 16 }}>
              <Table
                columns={riderOrderColumns}
                dataSource={riderAnalyticsMetrics?.tableOrders || []}
                rowKey={(record) => record.id || record.order_uid}
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} orders`,
                }}
                scroll={{ x: 'max-content' }}
              />
            </Card>
          </TabPane>

          {/* Personal & Vehicle Details Tab */}
          <TabPane tab={<span><User size={16} /> Personal & Vehicle Details</span>} key="2">
            <Row gutter={[16, 16]}>
              <Col xs={24} lg={12}>
                <Card title="Personal Information" className="h-100">
                  <InfoRow
                    icon={<User size={16} />}
                    label="Full Name"
                    value={riderName}
                  />
                  <InfoRow
                    icon={<User size={16} />}
                    label="Username"
                    value={riderData?.username ? `@${riderData.username}` : 'N/A'}
                  />
                  <InfoRow
                    icon={<Mail size={16} />}
                    label="Email Address"
                    value={riderData?.email || 'N/A'}
                  />
                  <InfoRow
                    icon={<Phone size={16} />}
                    label="Phone Number"
                    value={formatPhone(riderData?.phonenumber, riderData?.prefix)}
                  />
                  <InfoRow
                    icon={<FileText size={16} />}
                    label="SIN Code"
                    value={riderData?.sin_code || 'Not Provided'}
                  />
                  <InfoRow
                    icon={<Calendar size={16} />}
                    label="Registration Date"
                    value={riderData?.created_at ? new Date(riderData.created_at).toLocaleDateString() : 'N/A'}
                  />
                </Card>
              </Col>

              <Col xs={24} lg={12}>
                <Card title="Vehicle & License Information" className="h-100">
                  <InfoRow
                    icon={<Car size={16} />}
                    label="Vehicle Registration Number"
                    value={riderData?.vehicle_registration_number || 'Not Registered'}
                  />
                  <InfoRow
                    icon={<FileText size={16} />}
                    label="Driver License Number"
                    value={riderData?.license_number || 'Not Provided'}
                  />
                  <InfoRow
                    icon={<MapPin size={16} />}
                    label="Rider Current Coordinates"
                    value={riderData?.rider_lat && riderData?.rider_lng ? `${riderData.rider_lat}, ${riderData.rider_lng}` : 'Not Provided'}
                  />
                  <InfoRow
                    icon={<ShieldCheck size={16} />}
                    label="Verification Status"
                    value={riderData?.is_verified === 1 ? 'Verified' : 'Pending Verification'}
                  />
                </Card>
              </Col>
            </Row>

            <Row gutter={[16, 16]} className="mt-4">
              <Col xs={24}>
                <Card title="Verification & Legal Documents">
                  <Table
                    columns={documentColumns}
                    dataSource={riderData ? [
                      { key: '1', name: 'Identity Proof', status: riderData?.identity_proof ? 'Uploaded' : 'Pending', url: riderData?.identity_proof || null },
                      { key: '2', name: 'Driver License Image', status: riderData?.rider_license_image ? 'Uploaded' : 'Pending', url: riderData?.rider_license_image || null },
                      { key: '3', name: 'Vehicle Registration Document', status: riderData?.registration_doc ? 'Uploaded' : 'Pending', url: riderData?.registration_doc || null },
                      { key: '4', name: 'Void Cheque', status: riderData?.void_cheque ? 'Uploaded' : 'Pending', url: riderData?.void_cheque || null },
                      { key: '5', name: 'Profile Picture', status: riderData?.profile_pic ? 'Uploaded' : 'Pending', url: riderData?.profile_pic || null },
                    ] : []}
                    pagination={false}
                    size="small"
                  />
                </Card>
              </Col>
            </Row>
          </TabPane>

          {/* Wallet & Transactions Tab (Next to Bank Details) */}
          <TabPane tab={<span><Wallet size={16} /> Wallet & Transactions</span>} key="wallet">
            {/* Header & Quick Refresh */}
            <Card bodyStyle={{ padding: '16px 20px' }} style={{ borderRadius: 8, marginBottom: 16 }}>
              <div className="d-flex align-items-center justify-content-between flex-md-row flex-column gap-3">
                <div>
                  <h4 className="mb-0" style={{ fontWeight: 700, color: '#0f172a' }}>
                    Rider Wallet & Withdrawals
                  </h4>
                  <p className="text-muted mb-0" style={{ fontSize: 12 }}>
                    Real-time rider balance, delivery order earnings credited, and withdrawal payout transaction history.
                  </p>
                </div>
                <div className="d-flex align-items-center" style={{ gap: 10 }}>
                  <Button
                    icon={<ReloadOutlined spin={walletLoading} />}
                    onClick={fetchWalletData}
                    style={{ borderRadius: 6 }}
                  >
                    Refresh Ledger
                  </Button>
                </div>
              </div>
            </Card>

            {/* Financial Summary Metric Cards */}
            <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
              <Col xs={24} sm={12} xl={6}>
                <Card bodyStyle={{ padding: 16 }} style={{ borderRadius: 8, height: '100%', borderLeft: `4px solid ${THEME.primary}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>Available Wallet Balance</span>
                    <div style={{ ...iconWrapperStyle, background: '#088b4618' }}>
                      <Wallet size={18} color="#088b46" />
                    </div>
                  </div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: '#088b46' }}>
                    ${walletSummary.availableBalance.toFixed(2)}
                  </div>
                  <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>
                    Total Delivered Payout - Total Withdrawn
                  </div>
                </Card>
              </Col>

              <Col xs={24} sm={12} xl={6}>
                <Card bodyStyle={{ padding: 16 }} style={{ borderRadius: 8, height: '100%', borderLeft: '4px solid #2563eb' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>Total Earnings (Delivered)</span>
                    <div style={{ ...iconWrapperStyle, background: '#2563eb18' }}>
                      <TrendingUp size={18} color="#2563eb" />
                    </div>
                  </div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: '#2563eb' }}>
                    ${walletSummary.totalDeliveredEarnings.toFixed(2)}
                  </div>
                  <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>
                    From {walletSummary.deliveredOrdersCount} delivered orders credited
                  </div>
                </Card>
              </Col>

              <Col xs={24} sm={12} xl={6}>
                <Card bodyStyle={{ padding: 16 }} style={{ borderRadius: 8, height: '100%', borderLeft: '4px solid #dc2626' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>Total Withdrawn (Paid)</span>
                    <div style={{ ...iconWrapperStyle, background: '#dc262618' }}>
                      <TrendingDown size={18} color="#dc2626" />
                    </div>
                  </div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: '#dc2626' }}>
                    ${walletSummary.totalCompletedWithdrawals.toFixed(2)}
                  </div>
                  <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>
                    {walletSummary.completedWithdrawalsCount} payout transfers completed
                  </div>
                </Card>
              </Col>

              <Col xs={24} sm={12} xl={6}>
                <Card bodyStyle={{ padding: 16 }} style={{ borderRadius: 8, height: '100%', borderLeft: '4px solid #d97706' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>Pending Withdrawals</span>
                    <div style={{ ...iconWrapperStyle, background: '#d9770618' }}>
                      <Clock size={18} color="#d97706" />
                    </div>
                  </div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: '#d97706' }}>
                    ${walletSummary.totalPendingWithdrawals.toFixed(2)}
                  </div>
                  <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>
                    {walletSummary.pendingWithdrawalsCount} request(s) awaiting processing
                  </div>
                </Card>
              </Col>
            </Row>

            {/* Filter & Search Bar */}
            <Card bodyStyle={{ padding: 16 }} style={{ borderRadius: 8, marginBottom: 16 }}>
              <Row gutter={[12, 12]} align="middle">
                <Col xs={24} md={10}>
                  <Input
                    placeholder="Search by ID, Txn Ref, bank, notes..."
                    prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
                    value={walletSearch}
                    onChange={(e) => setWalletSearch(e.target.value)}
                    allowClear
                    style={{ borderRadius: 6 }}
                  />
                </Col>

                <Col xs={12} md={5}>
                  <Select
                    value={walletStatusFilter}
                    onChange={setWalletStatusFilter}
                    style={{ width: '100%' }}
                    options={[
                      { label: 'All Statuses', value: 'all' },
                      { label: 'Completed / Paid', value: 'completed' },
                      { label: 'Pending', value: 'pending' },
                      { label: 'Rejected / Cancelled', value: 'rejected' },
                    ]}
                  />
                </Col>

                <Col xs={24} md={6}>
                  <DatePicker.RangePicker
                    value={walletDateRange}
                    onChange={setWalletDateRange}
                    style={{ width: '100%', borderRadius: 6 }}
                    placeholder={['Start Date', 'End Date']}
                  />
                </Col>

                <Col xs={12} md={3} style={{ textAlign: 'right' }}>
                  <Button
                    onClick={() => {
                      setWalletSearch('');
                      setWalletStatusFilter('all');
                      setWalletDateRange(null);
                    }}
                    style={{ borderRadius: 6, width: '100%' }}
                  >
                    Reset Filters
                  </Button>
                </Col>
              </Row>
              <div style={{ marginTop: 10, fontSize: 12, color: '#64748b', textAlign: 'right' }}>
                Showing <strong>{filteredWalletTransactions.length}</strong> of <strong>{walletSummary.allTransactions.length}</strong> total withdrawal transactions
              </div>
            </Card>

            {/* Transactions Ledger Table */}
            <Card bodyStyle={{ padding: 0 }} style={{ borderRadius: 8, overflow: 'hidden' }}>
              <Table
                columns={walletTableColumns}
                dataSource={filteredWalletTransactions}
                rowKey="key"
                loading={walletLoading}
                scroll={{ x: 800 }}
                pagination={{
                  pageSize: 15,
                  showSizeChanger: true,
                  pageSizeOptions: ['10', '15', '30', '50'],
                  showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} withdrawals`,
                }}
              />
            </Card>
          </TabPane>

          {/* Bank Details Tab */}
          <TabPane tab={<span><Banknote size={16} /> Bank Details</span>} key="4">
            <Row gutter={[16, 16]}>
              <Col xs={24} lg={12}>
                <Card title="Bank Account Information" className="h-100">
                  <InfoRow
                    icon={<Banknote size={16} />}
                    label="Bank Name"
                    value={riderData?.bank_name || 'Not Provided'}
                  />
                  <InfoRow
                    icon={<User size={16} />}
                    label="Account Holder Name"
                    value={riderData?.account_holder_name || riderName}
                  />
                  <InfoRow
                    icon={<FileText size={16} />}
                    label="Account Number"
                    value={riderData?.account_number || 'Not Provided'}
                  />
                  <InfoRow
                    icon={<FileText size={16} />}
                    label="Transit Number"
                    value={riderData?.transit_number || 'Not Provided'}
                  />
                  <InfoRow
                    icon={<FileText size={16} />}
                    label="Institution Number"
                    value={riderData?.institution_number || 'Not Provided'}
                  />
                </Card>
              </Col>

              <Col xs={24} lg={12}>
                <Card title="Void Cheque Document" className="h-100">
                  {riderData?.void_cheque ? (
                    <div style={{ textAlign: 'center', padding: '16px' }}>
                      <Image
                        src={riderData.void_cheque}
                        alt="Void Cheque"
                        style={{ maxWidth: '100%', maxHeight: 220, borderRadius: 8, border: '1px solid #e2e8f0' }}
                        preview={{ zIndex: 3000 }}
                      />
                      <div style={{ marginTop: 8, fontSize: 12, color: '#64748b' }}>Click image to preview full resolution void cheque</div>
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8' }}>
                      <FileText size={36} />
                      <div style={{ marginTop: 8 }}>No Void Cheque Document Uploaded</div>
                    </div>
                  )}
                </Card>
              </Col>
            </Row>
          </TabPane>
        </Tabs>
      </div>

      {/* Itemized Order View Modal for Rider */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontWeight: 700, fontSize: 16 }}>
              Order #{selectedRiderOrder?.order_uid || selectedRiderOrder?.id}
            </span>
            {selectedRiderOrder && (
              <Tag color={getRiderOrderStatus(selectedRiderOrder.order_status).color} style={{ borderRadius: 12, fontWeight: 600 }}>
                {getRiderOrderStatus(selectedRiderOrder.order_status).text}
              </Tag>
            )}
          </div>
        }
        open={!!selectedRiderOrder}
        onCancel={() => setSelectedRiderOrder(null)}
        footer={null}
        width={750}
        style={{ top: 40 }}
      >
        {selectedRiderOrder && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingTop: 8 }}>
            {/* Customer & Address Details */}
            <Card size="small" title="Customer Details" style={{ borderRadius: 8, background: '#f8fafc' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13 }}>
                <div><strong>Order Date & Time:</strong> {selectedRiderOrder.order_date || selectedRiderOrder.created_at ? dayjs(selectedRiderOrder.order_date || selectedRiderOrder.created_at).format('DD MMM YYYY, hh:mm A') : '-'}</div>
                <div><strong>Customer Name:</strong> {[selectedRiderOrder.customer?.firstname, selectedRiderOrder.customer?.lastname].filter(Boolean).join(' ') || selectedRiderOrder.firstname || '-'}</div>
                <div><strong>Email:</strong> {selectedRiderOrder.customer?.email || selectedRiderOrder.email || '-'}</div>
                <div><strong>Phone:</strong> {[selectedRiderOrder.customer?.prefix || selectedRiderOrder.prefix, selectedRiderOrder.customer?.phonenumber || selectedRiderOrder.phonenumber].filter(Boolean).join(' ') || '-'}</div>
                <div><strong>Delivery Address:</strong> {typeof selectedRiderOrder.customer?.address === 'string' ? selectedRiderOrder.customer.address : (typeof selectedRiderOrder.address === 'string' ? selectedRiderOrder.address : selectedRiderOrder.address?.address || '-')}</div>
              </div>
            </Card>

            {/* Product Table */}
            <Card size="small" title="Order Items" style={{ borderRadius: 8 }}>
              <Table
                dataSource={selectedRiderOrder.products || []}
                rowKey={(p, idx) => idx}
                pagination={false}
                size="small"
                columns={[
                  {
                    title: 'Item',
                    dataIndex: 'product_name',
                    render: (text, record) => (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {record.product_image && (
                          <img src={record.product_image} alt="Product" style={{ width: 36, height: 36, borderRadius: 6, objectFit: 'cover' }} />
                        )}
                        <span style={{ fontWeight: 600 }}>{text}</span>
                      </div>
                    ),
                  },
                  {
                    title: 'Qty',
                    dataIndex: 'product_quantity',
                    align: 'center',
                    render: (q) => <Tag color="blue">{q}</Tag>,
                  },
                  {
                    title: 'Unit Price',
                    dataIndex: 'single_item_price',
                    align: 'right',
                    render: (p) => `$${Number(p || 0).toFixed(2)}`,
                  },
                  {
                    title: 'Total',
                    dataIndex: 'total_item_price',
                    align: 'right',
                    render: (p) => <strong style={{ color: '#088b46' }}>${Number(p || 0).toFixed(2)}</strong>,
                  },
                ]}
              />
            </Card>

            {/* Rider Payout Breakdown */}
            {(() => {
              const { itemsPrice, delCharge, fastDelCharge, tipAmt, tipPct, overallAmt, vendorShare, totalRiderShare } = computeOrderFinancials(selectedRiderOrder);
              return (
                <Card size="small" title="Financial & Earnings Breakdown" style={{ borderRadius: 8, background: '#f0fdf4' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Items Subtotal:</span>
                      <strong>${itemsPrice.toFixed(2)}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#0284c7' }}>
                      <span>🛵 Rider Delivery Charge (rider_deliveryCharge):</span>
                      <strong>${delCharge.toFixed(2)}</strong>
                    </div>
                    {fastDelCharge > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#0284c7' }}>
                        <span>⚡ Express Fast Delivery Charge:</span>
                        <strong>+${fastDelCharge.toFixed(2)}</strong>
                      </div>
                    )}
                    {tipAmt > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#088b46' }}>
                        <span>🎁 Customer Tip {tipPct > 0 ? `(${tipPct}%)` : ''}:</span>
                        <strong>+${tipAmt.toFixed(2)}</strong>
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#334155', fontWeight: 600 }}>
                      <span>Overall Total Amount:</span>
                      <strong>${overallAmt.toFixed(2)}</strong>
                    </div>
                    <Divider style={{ margin: '6px 0' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 17, fontWeight: 700, color: '#088b46' }}>
                      <span>Net Rider Share (Earnings):</span>
                      <span>
                        ${totalRiderShare.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </Card>
              );
            })()}
          </div>
        )}
      </Modal>

      {/* Withdrawal Details Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Wallet size={18} color="#088b46" />
            <span style={{ fontWeight: 700 }}>
              Withdrawal Details #{selectedWithdrawalDetail?.payout_id || selectedWithdrawalDetail?.withdrawal_uid || selectedWithdrawalDetail?.id}
            </span>
            {selectedWithdrawalDetail && (
              <Tag
                color={
                  ['completed', 'approved', 'success', 'paid'].includes(String(selectedWithdrawalDetail.status || selectedWithdrawalDetail.withdrawal_status || '').toLowerCase())
                    ? 'green'
                    : String(selectedWithdrawalDetail.status || selectedWithdrawalDetail.withdrawal_status || '').toLowerCase() === 'pending'
                    ? 'orange'
                    : 'red'
                }
                style={{ borderRadius: 12, fontWeight: 600, marginLeft: 8 }}
              >
                {String(selectedWithdrawalDetail.status || selectedWithdrawalDetail.withdrawal_status || 'Pending').toUpperCase()}
              </Tag>
            )}
          </div>
        }
        open={!!selectedWithdrawalDetail}
        onCancel={() => setSelectedWithdrawalDetail(null)}
        footer={[
          <Button key="close" type="primary" onClick={() => setSelectedWithdrawalDetail(null)} style={{ background: '#088b46', borderColor: '#088b46' }}>
            Close
          </Button>,
        ]}
        width={620}
      >
        {selectedWithdrawalDetail && (
          <div>
            <div style={{ background: '#f8fafc', padding: '16px 20px', borderRadius: 8, marginBottom: 16, border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: 13, color: '#64748b' }}>Requested Amount</div>
              <div style={{ fontSize: 26, fontWeight: 700, color: '#059669', marginTop: 2 }}>
                ${Number(selectedWithdrawalDetail.amount || selectedWithdrawalDetail.requested_amount || 0).toFixed(2)}
              </div>
              <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>
                Requested on:{' '}
                {selectedWithdrawalDetail.created_at || selectedWithdrawalDetail.date
                  ? dayjs(selectedWithdrawalDetail.created_at || selectedWithdrawalDetail.date).format('DD MMMM YYYY, hh:mm A')
                  : 'N/A'}
              </div>
            </div>

            <Card size="small" title="Rider Bank Account Details" style={{ marginBottom: 16, borderRadius: 8 }}>
              <Row gutter={[12, 12]}>
                <Col span={12}>
                  <div style={{ fontSize: 11, color: '#64748b' }}>Bank Name</div>
                  <div style={{ fontWeight: 600, color: '#1e293b' }}>
                    {selectedWithdrawalDetail.bank_name || selectedWithdrawalDetail.bank_details?.bank_name || riderData?.bank_name || 'Not Provided'}
                  </div>
                </Col>
                <Col span={12}>
                  <div style={{ fontSize: 11, color: '#64748b' }}>Account Holder</div>
                  <div style={{ fontWeight: 600, color: '#1e293b' }}>
                    {selectedWithdrawalDetail.account_holder_name || selectedWithdrawalDetail.bank_details?.account_holder_name || riderData?.account_holder_name || riderName || 'Not Provided'}
                  </div>
                </Col>
                <Col span={12}>
                  <div style={{ fontSize: 11, color: '#64748b' }}>Account Number</div>
                  <div style={{ fontWeight: 600, color: '#1e293b' }}>
                    {selectedWithdrawalDetail.account_number || selectedWithdrawalDetail.bank_details?.account_number || riderData?.account_number || 'Not Provided'}
                  </div>
                </Col>
                <Col span={12}>
                  <div style={{ fontSize: 11, color: '#64748b' }}>Transit / Branch No</div>
                  <div style={{ fontWeight: 600, color: '#1e293b' }}>
                    {selectedWithdrawalDetail.transit_number || riderData?.transit_number || 'Not Provided'}
                  </div>
                </Col>
                <Col span={12}>
                  <div style={{ fontSize: 11, color: '#64748b' }}>Institution Number</div>
                  <div style={{ fontWeight: 600, color: '#1e293b' }}>
                    {selectedWithdrawalDetail.institution_number || riderData?.institution_number || 'Not Provided'}
                  </div>
                </Col>
                <Col span={12}>
                  <div style={{ fontSize: 11, color: '#64748b' }}>Transaction Ref</div>
                  <div style={{ fontWeight: 600, color: '#1e293b' }}>
                    {selectedWithdrawalDetail.transaction_ref || selectedWithdrawalDetail.transaction_reference || 'N/A'}
                  </div>
                </Col>
              </Row>
            </Card>

            {(selectedWithdrawalDetail.notes || selectedWithdrawalDetail.admin_remarks) && (
              <Card size="small" title="Notes & Remarks" style={{ borderRadius: 8 }}>
                {selectedWithdrawalDetail.notes && (
                  <div style={{ marginBottom: 6 }}>
                    <div style={{ fontSize: 11, color: '#64748b' }}>Rider Notes:</div>
                    <div style={{ fontSize: 13, color: '#1e293b' }}>{selectedWithdrawalDetail.notes}</div>
                  </div>
                )}
                {selectedWithdrawalDetail.admin_remarks && (
                  <div>
                    <div style={{ fontSize: 11, color: '#64748b' }}>Admin Remarks:</div>
                    <div style={{ fontSize: 13, color: '#1e293b', fontWeight: 500 }}>{selectedWithdrawalDetail.admin_remarks}</div>
                  </div>
                )}
              </Card>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default RiderDashboard;