// // react-bootstrap
// import { Row, Col, Card } from 'react-bootstrap';

// // third party
// import Chart from 'react-apexcharts';

// // project imports
// import FlatCard from 'components/Widgets/Statistic/FlatCard';
// import ProductCard from 'components/Widgets/Statistic/ProductCard';
// import FeedTable from 'components/Widgets/FeedTable';
// import ProductTable from 'components/Widgets/ProductTable';
// import { SalesCustomerSatisfactionChartData } from '../../DashSales/chart/sales-customer-satisfication-chart';
// import { SalesAccountChartData } from '../../DashSales/chart/sales-account-chart';
// import { SalesSupportChartData } from '../../DashSales/chart/sales-support-chart';

// import feedData from 'data/feedData';
// import productData from 'data/productTableData';
// import { SalesSupportChartData1 } from '../../DashSales/chart/sales-support-chart1';

// // -----------------------|| DASHBOARD SALES ||-----------------------//
// export default function SingleVendor() {
//   return (
//     <Row className='p2'>
//       <Col md={12} xl={6}>
//         <Card className="flat-card">
//           <div className="row-table">
//             <Card.Body className="col-sm-6 br">
//               <FlatCard params={{ title: 'Customers', iconClass: 'text-primary mb-1', icon: 'group', value: '1000' }} />
//             </Card.Body>
//             <Card.Body className="col-sm-6 d-none d-md-table-cell d-lg-table-cell d-xl-table-cell card-body br">
//               <FlatCard params={{ title: 'Revenue', iconClass: 'text-primary mb-1', icon: 'language', value: '1252' }} />
//             </Card.Body>
//             <Card.Body className="col-sm-6 card-bod">
//               <FlatCard params={{ title: 'Growth', iconClass: 'text-primary mb-1', icon: 'unarchive', value: '600' }} />
//             </Card.Body>
//           </div>
//           <div className="row-table">
//             <Card.Body className="col-sm-6 br">
//               <FlatCard
//                 params={{
//                   title: 'Returns',
//                   iconClass: 'text-primary mb-1',
//                   icon: 'swap_horizontal_circle',
//                   value: '3550'
//                 }}
//               />
//             </Card.Body>
//             <Card.Body className="col-sm-6 d-none d-md-table-cell d-lg-table-cell d-xl-table-cell card-body br">
//               <FlatCard params={{ title: 'Downloads', iconClass: 'text-primary mb-1', icon: 'cloud_download', value: '3550' }} />
//             </Card.Body>
//             <Card.Body className="col-sm-6 card-bod">
//               <FlatCard params={{ title: 'Order', iconClass: 'text-primary mb-1', icon: 'shopping_cart', value: '100%' }} />
//             </Card.Body>
//           </div>
//         </Card>
//         <Row>
//           <Col md={6}>
//             <Card className="support-bar overflow-hidden">
//               <Card.Body className="pb-0">
//                 <h2 className="m-0">53.94%</h2>
//                 <span className="text-primary">Conversion Rate</span>
//                 <p className="mb-3 mt-3">Number of conversions divided by the total visitors. </p>
//               </Card.Body>
//               <Chart {...SalesSupportChartData()} />
//               <Card.Footer className="border-0 bg-primary text-white background-pattern-white">
//                 <Row className="text-center">
//                   <Col>
//                     <h4 className="m-0 text-white">10</h4>
//                     <span>2018</span>
//                   </Col>
//                   <Col>
//                     <h4 className="m-0 text-white">15</h4>
//                     <span>2017</span>
//                   </Col>
//                   <Col>
//                     <h4 className="m-0 text-white">13</h4>
//                     <span>2016</span>
//                   </Col>
//                 </Row>
//               </Card.Footer>
//             </Card>
//           </Col>
//           <Col md={6}>
//             <Card className="support-bar overflow-hidden">
//               <Card.Body className="pb-0">
//                 <h2 className="m-0">1432</h2>
//                 <span className="text-primary">Order Delivered</span>
//                 <p className="mb-3 mt-3">Number of conversions divided by the total visitors. </p>
//               </Card.Body>
//               <Card.Footer className="border-0">
//                 <Row className="text-center">
//                   <Col>
//                     <h4 className="m-0">130</h4>
//                     <span>May</span>
//                   </Col>
//                   <Col>
//                     <h4 className="m-0">251</h4>
//                     <span>June</span>
//                   </Col>
//                   <Col>
//                     <h4 className="m-0 ">235</h4>
//                     <span>July</span>
//                   </Col>
//                 </Row>
//               </Card.Footer>
//               <Chart type="bar" {...SalesSupportChartData1()} />
//             </Card>
//           </Col>
//         </Row>
//       </Col>
//       <Col md={12} xl={6}>
//         <Card>
//           <Card.Header>
//             <h5>Department wise monthly sales report</h5>
//           </Card.Header>
//           <Card.Body>
//             <Row className="pb-2">
//               <div className="col-auto m-b-10">
//                 <h3 className="mb-1">$21,356.46</h3>
//                 <span>Total Sales</span>
//               </div>
//               <div className="col-auto m-b-10">
//                 <h3 className="mb-1">$1935.6</h3>
//                 <span>Average</span>
//               </div>
//             </Row>
//             <Chart {...SalesAccountChartData()} />
//           </Card.Body>
//         </Card>
//       </Col>
//       <Col md={12} xl={6}>
//         <Card>
//           <Card.Body>
//             <h6>Customer Satisfaction</h6>
//             <span>It takes continuous effort to maintain high customer satisfaction levels Internal and external.</span>
//             <Row className="d-flex justify-content-center align-items-center">
//               <Col>
//                 <Chart type="pie" {...SalesCustomerSatisfactionChartData()} />
//               </Col>
//             </Row>
//           </Card.Body>
//         </Card>
//         {/* Product Table */}
//         <ProductTable {...productData} />
//       </Col>
//       <Col md={12} xl={6}>
//         <Row>
//           <Col sm={6}>
//             <ProductCard params={{ title: 'Total Profit', primaryText: '$1,783', icon: 'card_giftcard' }} />
//           </Col>
//           <Col sm={6}>
//             <ProductCard params={{ variant: 'primary', title: 'Total Orders', primaryText: '15,830', icon: 'local_mall' }} />
//           </Col>
//           <Col sm={6}>
//             <ProductCard params={{ variant: 'primary', title: 'Average Price', primaryText: '$6,780', icon: 'monetization_on' }} />
//           </Col>
//           <Col sm={6}>
//             <ProductCard params={{ title: 'Product Sold', primaryText: '6,784', icon: 'local_offer' }} />
//           </Col>
//         </Row>
//         {/* Feed Table */}
//         <FeedTable {...feedData} />
//       </Col>
//     </Row>
//   );
// }







import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Tabs, Badge, Button, Statistic, Table, Progress, DatePicker, message, Spin, Image, Select, Typography, Avatar, Divider, Space, Tag, Input, Modal, Alert } from 'antd';
import { SearchOutlined, FilterOutlined, EyeOutlined, ReloadOutlined, EnvironmentOutlined, StopOutlined, CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import DateRangeSelector from '../../../../components/DateRangeSelector';
import { useParams, useNavigate } from 'react-router-dom';
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
  TrendingUp,
  TrendingDown,
  Star,
  Eye,
  Calendar,
  CreditCard,
  CheckCircle,
  Clock,
  BarChart2,
  PieChart as PieChartIcon,
  Activity,
  Users,
  Truck,
  AlertCircle,
  Award,
  Layers,
  Wallet,
  ArrowDownLeft,
  ArrowUpRight
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area, Legend, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import dayjs from 'dayjs';
import { 
  getVendorAnalytics, 
  getVendorById, 
  updateVendorStatus, 
  updateVendorDeactivateStatus,
  getVendorShares,
  getVendorWithdrawalsById,
  getVendorWithdrawals
} from '../../../../services/apiService';
import { convertTimeRange, formatPhone } from '../../../../services/utils/gen_utility';

const { TabPane } = Tabs;
const { Title, Text } = Typography;

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

// Custom styles
const styles = {
  pageHeader: {
    padding: '16px 0',
    background: THEME.cardBackground,
    borderRadius: '8px',
    marginBottom: '24px',
    boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
  },
  statCard: {
    height: '100%',
    borderRadius: '8px',
    boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
  },
  chartCard: {
    marginBottom: '24px',
    borderRadius: '8px',
    boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
  },
  tabsContainer: {
    marginBottom: '24px',
    background: THEME.cardBackground,
    borderRadius: '8px',
    padding: '16px',
    boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
  },
  iconWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    marginRight: '16px'
  }
};

const VendorDashboard = () => {
  // State management
  const [activeTab, setActiveTab] = useState("5");
  const [analyticsView, setAnalyticsView] = useState('daily');
  const [rangeLoading, setRangeLoading] = useState(false);
  const [selectedStart, setSelectedStart] = useState(null);
  const [selectedEnd, setSelectedEnd] = useState(null);
  const [tempStart, setTempStart] = useState(null);
  const [tempEnd, setTempEnd] = useState(null);
  const [rangeData, setRangeData] = useState([]);
  const [rangeTotals, setRangeTotals] = useState({ earnings: 0, orders: 0, customers: 0 });
  const [rangePreviousTotals, setRangePreviousTotals] = useState({ earnings: 0, orders: 0, customers: 0 });
  const [overviewTotals, setOverviewTotals] = useState({ earnings: 0, orders: 0, customers: 0 });
  const [overviewPreviousTotals, setOverviewPreviousTotals] = useState({ earnings: 0, orders: 0, customers: 0 });
  const [overviewLoading, setOverviewLoading] = useState(false);
  const [overviewData, setOverviewData] = useState([]);
  const [datePreset, setDatePreset] = useState('all');
  // Using AntD Image built-in preview; no custom modal
  
  // Local DateRangeSelector component has been removed in favor of the imported one
  

  const params = useParams();
  const navigate = useNavigate();
  const routeVendorId = params?.vendorId || params?.id || window.location.pathname.split('/').pop();
  const vendorIdNumber = Number(routeVendorId);

  // Vendor data (fetched dynamically)
  const [vendorData, setVendorData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Block & Unblock Modal States
  const [blockModalVisible, setBlockModalVisible] = useState(false);
  const [blockReason, setBlockReason] = useState('Policy Violation');
  const [blockRemarks, setBlockRemarks] = useState('');
  const [blockLoading, setBlockLoading] = useState(false);

  const [unblockModalVisible, setUnblockModalVisible] = useState(false);
  const [unblockLoading, setUnblockLoading] = useState(false);

  const handleConfirmBlock = async () => {
    setBlockLoading(true);
    const finalRemark = blockReason === 'Other' && blockRemarks.trim()
      ? blockRemarks.trim()
      : [blockReason, blockRemarks.trim()].filter(Boolean).join(' - ');

    const res = await updateVendorDeactivateStatus(vendorIdNumber, 1, finalRemark);
    setBlockLoading(false);
    if (res && res.success !== false) {
      message.success('Vendor has been blocked successfully.');
      setVendorData((prev) => (prev ? { ...prev, deactivate_status: 1, remark: finalRemark } : prev));
      setBlockModalVisible(false);
    } else {
      message.error(res?.error?.message || res?.error || 'Failed to block vendor');
    }
  };

  const handleConfirmUnblock = async () => {
    setUnblockLoading(true);
    const res = await updateVendorDeactivateStatus(vendorIdNumber, 0, 'Reactivated by Admin');
    setUnblockLoading(false);
    if (res && res.success !== false) {
      message.success('Vendor has been unblocked and reactivated.');
      setVendorData((prev) => (prev ? { ...prev, deactivate_status: 0, remark: '' } : prev));
      setUnblockModalVisible(false);
    } else {
      message.error(res?.error?.message || res?.error || 'Failed to unblock vendor');
    }
  };

  // Vendor orders filter state
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [orderDateRange, setOrderDateRange] = useState(null);
  const [selectedVendorOrder, setSelectedVendorOrder] = useState(null);

  // Vendor Wallet & Transactions state
  const [walletLoading, setWalletLoading] = useState(false);
  const [walletWithdrawals, setWalletWithdrawals] = useState([]);
  const [vendorSharesData, setVendorSharesData] = useState(null);
  const [selectedWithdrawalDetail, setSelectedWithdrawalDetail] = useState(null);
  const [walletTypeFilter, setWalletTypeFilter] = useState('all');
  const [walletStatusFilter, setWalletStatusFilter] = useState('all');
  const [walletSearch, setWalletSearch] = useState('');
  const [walletDateRange, setWalletDateRange] = useState(null);

  // Status helper
  const getVendorOrderStatus = (status) => {
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

  // Filtered and DESC sorted orders
  const vendorOrders = React.useMemo(() => {
    const rawOrders = Array.isArray(vendorData?.orders) ? [...vendorData.orders] : [];
    
    // Sort DESC (newest first based on order_date or created_at)
    rawOrders.sort((a, b) => {
      const dateA = a.order_date || a.created_at;
      const dateB = b.order_date || b.created_at;
      const timeA = dateA ? new Date(dateA).getTime() : (a.id || 0);
      const timeB = dateB ? new Date(dateB).getTime() : (b.id || 0);
      return timeB - timeA;
    });

    return rawOrders.filter(order => {
      // 1. Status filter
      if (orderStatusFilter !== 'all') {
        const targetStatus = Number(orderStatusFilter);
        const currentStatus = order.order_status === null || order.order_status === undefined ? 0 : Number(order.order_status);
        if (currentStatus !== targetStatus) return false;
      }

      // 2. Date Range filter
      const dateVal = order.order_date || order.created_at;
      if (orderDateRange && orderDateRange[0] && orderDateRange[1]) {
        if (!dateVal) return false;
        const orderTime = dayjs(dateVal);
        const start = dayjs(orderDateRange[0]).startOf('day');
        const end = dayjs(orderDateRange[1]).endOf('day');
        if (orderTime.isBefore(start) || orderTime.isAfter(end)) return false;
      }

      // 3. Search query filter
      if (orderSearch.trim()) {
        const query = orderSearch.toLowerCase().trim();
        const uid = (order.order_uid || '').toLowerCase();
        const idStr = String(order.id || '');
        const custName = [order.customer?.firstname, order.customer?.lastname].filter(Boolean).join(' ').toLowerCase();
        const custEmail = (order.customer?.email || '').toLowerCase();
        const custPhone = (order.customer?.phonenumber || '').toLowerCase();
        const addr = (typeof order.address === 'string' ? order.address : order.address?.address || '').toLowerCase();
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
  }, [vendorData?.orders, orderStatusFilter, orderDateRange, orderSearch]);

  const vendorOrderColumns = [
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
        const phone = [cust.prefix || record.prefix, cust.phonenumber || record.phonenumber].filter(Boolean).join(' ');
        const email = cust.email || record.email;
        const addrText = typeof record.address === 'string' ? record.address : record.address?.address;

        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '13.5px' }}>
              {custName}
            </div>
            {(phone || email) && (
              <div style={{ fontSize: '11.5px', color: '#64748b' }}>
                {phone && <span>{phone}</span>}
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
      title: 'Vendor Share (Payout)',
      key: 'vendor_share',
      width: 180,
      sorter: (a, b) => Number(a.vendor_share || a.total_price || 0) - Number(b.vendor_share || b.total_price || 0),
      render: (_, record) => {
        const totalAmt = Number(record.overall_amount || record.total_price || 0);
        const vendorShare = Number(record.vendor_share !== undefined && record.vendor_share !== null ? record.vendor_share : totalAmt);
        const adminCommission = Math.max(0, totalAmt - vendorShare);

        return (
          <div>
            <div style={{ fontWeight: 700, color: '#088b46', fontSize: '14.5px' }}>
              ${vendorShare.toFixed(2)}
              <span style={{ fontSize: '10px', color: '#16a34a', marginLeft: 4, fontWeight: 600 }}>
                (Vendor Payout)
              </span>
            </div>
            <div style={{ fontSize: '11px', color: '#64748b', marginTop: 1 }}>
              Total: <strong>${totalAmt.toFixed(2)}</strong>
              {adminCommission > 0 && (
                <span style={{ color: '#d97706', marginLeft: 4 }}>
                  • Comm: <strong>${adminCommission.toFixed(2)}</strong>
                </span>
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
        const s = getVendorOrderStatus(statusVal);
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
          onClick={() => setSelectedVendorOrder(record)}
        >
          View
        </Button>
      ),
    },
  ];

  // Fetch Vendor Wallet data (Shares & Withdrawals)
  const fetchWalletData = React.useCallback(async () => {
    if (!vendorIdNumber) return;
    setWalletLoading(true);
    try {
      const [sharesRes, withdrawalsRes] = await Promise.allSettled([
        getVendorShares(vendorIdNumber),
        getVendorWithdrawalsById(vendorIdNumber),
      ]);

      if (sharesRes.status === 'fulfilled' && sharesRes.value?.success) {
        setVendorSharesData(sharesRes.value.data);
      }

      let wList = [];
      if (withdrawalsRes.status === 'fulfilled' && withdrawalsRes.value?.success && Array.isArray(withdrawalsRes.value.data)) {
        wList = withdrawalsRes.value.data;
      }

      // If specific vendor withdrawals endpoint returns empty, check all-vendor-withdrawals as fallback
      if (!wList || wList.length === 0) {
        try {
          const allWdrRes = await getVendorWithdrawals('all');
          if (allWdrRes?.success && Array.isArray(allWdrRes.data)) {
            wList = allWdrRes.data.filter(w => Number(w.vendor_id) === vendorIdNumber || Number(w.vendor?.id) === vendorIdNumber);
          }
        } catch (e) {
          console.warn('Fallback fetch of all vendor withdrawals failed:', e);
        }
      }

      setWalletWithdrawals(wList || []);
    } catch (err) {
      console.error('Error fetching wallet data:', err);
    } finally {
      setWalletLoading(false);
    }
  }, [vendorIdNumber]);

  useEffect(() => {
    fetchWalletData();
  }, [fetchWalletData]);

  // Wallet summary metrics & transaction ledger
  const walletSummary = React.useMemo(() => {
    const ordersList = Array.isArray(vendorSharesData?.orders) && vendorSharesData.orders.length > 0
      ? vendorSharesData.orders
      : (Array.isArray(vendorData?.orders) ? vendorData.orders : []);

    let totalDeliveredEarnings = 0;
    let deliveredOrdersCount = 0;
    const earningTransactions = [];

    ordersList.forEach(order => {
      const isDelivered = Number(order.order_status) === 4;
      const totalAmt = Number(order.overall_amount || order.total_price || 0);
      const vendorShare = Number(order.vendor_share !== undefined && order.vendor_share !== null ? order.vendor_share : totalAmt);

      if (isDelivered) {
        totalDeliveredEarnings += vendorShare;
        deliveredOrdersCount += 1;

        const custName = [order.customer?.firstname, order.customer?.lastname].filter(Boolean).join(' ') || order.firstname || 'Customer';
        const dateVal = order.order_date || order.created_at;

        earningTransactions.push({
          key: `order-${order.id}`,
          id: order.id,
          uid: order.order_uid || `ORD#${order.id}`,
          type: 'earning',
          typeLabel: 'Order Earning',
          title: `Delivered Order #${order.order_uid || order.id}`,
          subtitle: `${order.products?.length || 0} item(s) • Customer: ${custName}`,
          date: dateVal,
          amount: vendorShare,
          status: 'completed',
          statusLabel: 'Credited',
          statusColor: 'green',
          rawRecord: order,
          category: 'order',
        });
      }
    });

    let totalCompletedWithdrawals = 0;
    let totalPendingWithdrawals = 0;
    let completedWithdrawalsCount = 0;
    let pendingWithdrawalsCount = 0;
    const withdrawalTransactions = [];

    (walletWithdrawals || []).forEach(w => {
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

      const bankName = w.bank_name || w.bank_details?.bank_name || vendorData?.bank_name || 'Bank Account';
      const accNo = w.account_number || w.bank_details?.account_number || vendorData?.account_number;
      const maskedAcc = accNo ? `••••${String(accNo).slice(-4)}` : '';
      const dateVal = w.created_at || w.date || w.requested_at;

      withdrawalTransactions.push({
        key: `wdr-${w.id || Math.random()}`,
        id: w.id,
        uid: w.withdrawal_uid || (w.id ? `WDR#${w.id}` : 'WDR'),
        type: 'withdrawal',
        typeLabel: 'Withdrawal',
        title: `Payout Request ${w.withdrawal_uid || (w.id ? `#${w.id}` : '')}`,
        subtitle: `To: ${bankName} ${maskedAcc} ${w.transaction_reference ? `• Ref: ${w.transaction_reference}` : ''}`.trim(),
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

    const allTransactions = [...earningTransactions, ...withdrawalTransactions];
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
  }, [vendorSharesData, vendorData, walletWithdrawals]);

  // Filtered wallet transactions
  const filteredWalletTransactions = React.useMemo(() => {
    return walletSummary.allTransactions.filter(item => {
      if (walletTypeFilter !== 'all' && item.type !== walletTypeFilter) {
        return false;
      }

      if (walletStatusFilter !== 'all') {
        if (walletStatusFilter === 'completed' && !['completed', 'approved', 'success', 'paid'].includes(item.status)) return false;
        if (walletStatusFilter === 'pending' && item.status !== 'pending') return false;
        if (walletStatusFilter === 'rejected' && !['rejected', 'failed', 'cancelled', 'canceled'].includes(item.status)) return false;
      }

      if (walletDateRange && walletDateRange[0] && walletDateRange[1]) {
        if (!item.date) return false;
        const itemTime = dayjs(item.date);
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
  }, [walletSummary.allTransactions, walletTypeFilter, walletStatusFilter, walletDateRange, walletSearch]);

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
            {record.type === 'earning' ? (
              <Tag color="green" style={{ borderRadius: 10, fontSize: 11, padding: '1px 8px', fontWeight: 600 }}>
                <TrendingUp size={11} style={{ marginRight: 4, display: 'inline', verticalAlign: '-1px' }} /> Earning
              </Tag>
            ) : (
              <Tag color="red" style={{ borderRadius: 10, fontSize: 11, padding: '1px 8px', fontWeight: 600 }}>
                <TrendingDown size={11} style={{ marginRight: 4, display: 'inline', verticalAlign: '-1px' }} /> Withdrawal
              </Tag>
            )}
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
        return record.date ? (
          <div>
            <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '12.5px' }}>
              {dayjs(record.date).format('DD MMM YYYY')}
            </div>
            <div style={{ fontSize: '11px', color: '#64748b' }}>
              {dayjs(record.date).format('hh:mm A')}
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
      render: (_, record) => {
        const isCredit = record.type === 'earning';
        return (
          <div>
            <div
              style={{
                fontWeight: 700,
                fontSize: '15px',
                color: isCredit ? '#088b46' : '#dc2626',
              }}
            >
              {isCredit ? `+$${Number(record.amount).toFixed(2)}` : `-$${Number(record.amount).toFixed(2)}`}
            </div>
            <div style={{ fontSize: '11px', color: '#94a3b8' }}>
              {isCredit ? 'Credit to Wallet' : 'Debit / Payout'}
            </div>
          </div>
        );
      },
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
            background: record.type === 'earning' ? '#088b46' : '#2563eb',
            border: 'none',
          }}
          onClick={() => {
            if (record.category === 'order') {
              setSelectedVendorOrder(record.rawRecord);
            } else {
              setSelectedWithdrawalDetail(record.rawRecord);
            }
          }}
        >
          View
        </Button>
      ),
    },
  ];

  const [analyticsSearch, setAnalyticsSearch] = useState('');
  const [analyticsStatusFilter, setAnalyticsStatusFilter] = useState('all');
  const [analyticsTypeFilter, setAnalyticsTypeFilter] = useState('all');

  // Analytics revenue & orders calculation hook
  const vendorAnalyticsMetrics = React.useMemo(() => {
    const rawOrders = Array.isArray(vendorData?.orders) ? vendorData.orders : [];

    // Filter orders by selectedStart & selectedEnd date range
    const filteredOrders = rawOrders.filter(o => {
      const dateVal = o.order_date || o.created_at;
      if (!selectedStart || !selectedEnd) return true;
      if (!dateVal) return true;
      const orderDate = dayjs(dateVal);
      return (orderDate.isAfter(selectedStart.startOf('day')) || orderDate.isSame(selectedStart.startOf('day'))) &&
             (orderDate.isBefore(selectedEnd.endOf('day')) || orderDate.isSame(selectedEnd.endOf('day')));
    });

    let totalDeliveredVendorShare = 0; // Final amount received by vendor for delivered orders
    let pendingVendorShare = 0;        // Final amount for pending orders
    let totalAdminCommission = 0;      // Total commission assigned to admin
    let grossTotalOrderPrice = 0;      // Gross total order value

    let deliveredCount = 0;
    let pendingCount = 0;
    let confirmedCount = 0;
    let pickedUpCount = 0;
    let rejectedCount = 0;

    const dailyMap = {};

    filteredOrders.forEach(o => {
      const totalAmt = Number(o.overall_amount || o.total_price || 0);
      const vendorShare = Number(o.vendor_share !== undefined && o.vendor_share !== null ? o.vendor_share : totalAmt);
      const adminCommission = Math.max(0, totalAmt - vendorShare);
      const status = o.order_status === null || o.order_status === undefined ? 0 : Number(o.order_status);
      const dateVal = o.order_date || o.created_at;
      const dateKey = dateVal ? dayjs(dateVal).format('MMM DD') : 'Other';

      if (!dailyMap[dateKey]) {
        dailyMap[dateKey] = { label: dateKey, deliveredRevenue: 0, pendingRevenue: 0, vendorShare: 0, adminCommission: 0, orders: 0 };
      }
      dailyMap[dateKey].orders += 1;
      grossTotalOrderPrice += totalAmt;

      if (status === 4) {
        // Delivered
        totalDeliveredVendorShare += vendorShare;
        totalAdminCommission += adminCommission;
        deliveredCount++;
        dailyMap[dateKey].deliveredRevenue += vendorShare;
        dailyMap[dateKey].adminCommission += adminCommission;
      } else if (status === 3 || status === 5) {
        // Rejected
        rejectedCount++;
      } else {
        // Pending / Processing
        pendingVendorShare += vendorShare;
        dailyMap[dateKey].pendingRevenue += vendorShare;
        if (status === 1) confirmedCount++;
        else pendingCount++;
      }
    });

    // Compute table filtered orders
    const tableOrders = filteredOrders.filter(order => {
      const status = order.order_status === null || order.order_status === undefined ? 0 : Number(order.order_status);
      const totalAmt = Number(order.overall_amount || order.total_price || 0);
      const vendorShare = Number(order.vendor_share !== undefined && order.vendor_share !== null ? order.vendor_share : totalAmt);
      const comm = Math.max(0, totalAmt - vendorShare);

      // 1. Status Filter
      if (analyticsStatusFilter !== 'all' && status !== Number(analyticsStatusFilter)) {
        return false;
      }

      // 2. Revenue Type Filter
      if (analyticsTypeFilter === 'delivered' && status !== 4) return false;
      if (analyticsTypeFilter === 'pending' && (status === 4 || status === 5)) return false;
      if (analyticsTypeFilter === 'commission' && comm <= 0) return false;
      if (analyticsTypeFilter === 'rejected' && status !== 5) return false;

      // 3. Search Filter
      if (analyticsSearch.trim()) {
        const query = analyticsSearch.toLowerCase().trim();
        const uid = (order.order_uid || '').toLowerCase();
        const idStr = String(order.id || '');
        const custName = [order.customer?.firstname, order.customer?.lastname].filter(Boolean).join(' ').toLowerCase();
        const custEmail = (order.customer?.email || '').toLowerCase();
        const custPhone = (order.customer?.phonenumber || '').toLowerCase();
        const addr = (typeof order.address === 'string' ? order.address : order.address?.address || '').toLowerCase();
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

    // Sort DESC (newest orders first)
    tableOrders.sort((a, b) => {
      const dateA = a.order_date || a.created_at;
      const dateB = b.order_date || b.created_at;
      const timeA = dateA ? new Date(dateA).getTime() : Number(a.id || 0);
      const timeB = dateB ? new Date(dateB).getTime() : Number(b.id || 0);
      return timeB - timeA;
    });

    const grossVendorShare = totalDeliveredVendorShare + pendingVendorShare;
    const totalOrdersCount = filteredOrders.length;
    const avgOrderValue = totalOrdersCount > 0 ? (grossTotalOrderPrice / totalOrdersCount) : 0;
    const chartTrendData = Object.values(dailyMap);

    const statusDistribution = [
      { name: 'Delivered Payout', value: totalDeliveredVendorShare, color: '#52c41a' },
      { name: 'Pending Payout', value: pendingVendorShare, color: '#faad14' },
      { name: 'Admin Commission', value: totalAdminCommission, color: '#722ed1' },
    ].filter(item => item.value > 0);

    return {
      filteredOrders,
      tableOrders,
      totalOrdersCount,
      grossTotalOrderPrice,
      grossVendorShare,
      totalDeliveredVendorShare,
      pendingVendorShare,
      totalAdminCommission,
      deliveredCount,
      pendingCount: pendingCount + confirmedCount + pickedUpCount,
      rejectedCount,
      avgOrderValue,
      chartTrendData,
      statusDistribution
    };
  }, [vendorData?.orders, selectedStart, selectedEnd, analyticsSearch, analyticsStatusFilter, analyticsTypeFilter]);

  useEffect(() => {
    const loadVendor = async () => {
      if (!vendorIdNumber) return;
      setLoading(true);
      try {
        const res = await getVendorById(vendorIdNumber);
        if (res?.success && res?.data) {
          setVendorData(res.data);
        } else {
          message.error(res?.message || 'Failed to fetch vendor');
        }
      } catch (error) {
        message.error('Error fetching vendor data');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    loadVendor();
  }, [vendorIdNumber]);

  // Sample analytics data
  const analyticsData = {
    daily: [
      { period: '2025-07-12', earnings: 1250, orders: 18, customers: 15 },
      { period: '2025-07-13', earnings: 1890, orders: 25, customers: 22 },
      { period: '2025-07-14', earnings: 2100, orders: 31, customers: 28 },
      { period: '2025-07-15', earnings: 1650, orders: 20, customers: 18 },
      { period: '2025-07-16', earnings: 2350, orders: 35, customers: 32 },
      { period: '2025-07-17', earnings: 1980, orders: 28, customers: 25 },
      { period: '2025-07-18', earnings: 2450, orders: 38, customers: 35 }
    ],
    weekly: [
      { period: 'Week 1', earnings: 8950, orders: 142, customers: 128 },
      { period: 'Week 2', earnings: 12400, orders: 186, customers: 165 },
      { period: 'Week 3', earnings: 15200, orders: 225, customers: 198 },
      { period: 'Week 4', earnings: 18750, orders: 267, customers: 235 },
      { period: 'Week 5', earnings: 21300, orders: 298, customers: 268 },
      { period: 'Week 6', earnings: 19800, orders: 278, customers: 245 }
    ],
    monthly: [
      { period: 'Jan', earnings: 45200, orders: 650, customers: 580 },
      { period: 'Feb', earnings: 52800, orders: 720, customers: 645 },
      { period: 'Mar', earnings: 48900, orders: 695, customers: 612 },
      { period: 'Apr', earnings: 56700, orders: 785, customers: 698 },
      { period: 'May', earnings: 62400, orders: 865, customers: 756 },
      { period: 'Jun', earnings: 58900, orders: 825, customers: 724 },
      { period: 'Jul', earnings: 65200, orders: 892, customers: 798 }
    ],
    quarterly: [
      { period: 'Q1 2024', earnings: 146900, orders: 2065, customers: 1837 },
      { period: 'Q2 2024', earnings: 178000, orders: 2475, customers: 2178 },
      { period: 'Q3 2024', earnings: 195400, orders: 2698, customers: 2385 },
      { period: 'Q4 2024', earnings: 212800, orders: 2856, customers: 2534 },
      { period: 'Q1 2025', earnings: 189100, orders: 2582, customers: 2298 }
    ]
  };

  const categoryData = [
    { name: 'Electronics', value: 35, color: '#1890ff' },
    { name: 'Clothing', value: 25, color: '#52c41a' },
    { name: 'Home & Garden', value: 20, color: '#faad14' },
    { name: 'Books', value: 12, color: '#f5222d' },
    { name: 'Sports', value: 8, color: '#722ed1' }
  ];

  const isSameDay = selectedStart && selectedEnd && selectedStart.isSame(selectedEnd, 'day');
  const getCurrentData = () => analyticsData[analyticsView];

  const fetchAnalytics = async (start, end) => {
    if (!start || !end) return;
    setRangeLoading(true);
    const res = await getVendorAnalytics(
      vendorIdNumber,
      start.format('YYYY-MM-DD'),
      end.format('YYYY-MM-DD')
    );
    if (res.success) {
      const dataArray = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res?.data?.data)
          ? res.data.data
          : [];
      const totalsObj = (res.totals ?? res?.data?.totals) || { earnings: 0, orders: 0, customers: 0 };
      const previousTotalsObj = (res.previousTotals ?? res?.data?.previousTotals) || { earnings: 0, orders: 0, customers: 0 };

     console.log(res,totalsObj, previousTotalsObj);
     

      setRangeData(dataArray);
      setRangeTotals({
        earnings: Number(totalsObj.earnings || 0),
        orders: Number(totalsObj.orders || 0),
        customers: Number(totalsObj.customers || 0),
      });
      setRangePreviousTotals({
        earnings: Number(previousTotalsObj.earnings || 0),
        orders: Number(previousTotalsObj.orders || 0),
        customers: Number(previousTotalsObj.customers || 0),
      });
    } else {
      message.error(res.error?.message || 'Failed to load analytics');
      setRangeData([]);
      setRangeTotals({ earnings: 0, orders: 0, customers: 0 });
      setRangePreviousTotals({ earnings: 0, orders: 0, customers: 0 });
    }
    setRangeLoading(false);
  };

  // Initial load
  useEffect(() => {
    fetchAnalytics(selectedStart, selectedEnd);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vendorIdNumber]);

  // Fetch current week for Overview tab
  useEffect(() => {
    const fetchOverview = async () => {
      if (!vendorIdNumber) return;
      setOverviewLoading(true);
      const start = dayjs().startOf('week');
      const end = dayjs().endOf('week');
      try {
        const res = await getVendorAnalytics(
          vendorIdNumber,
          start.format('YYYY-MM-DD'),
          end.format('YYYY-MM-DD')
        );
        if (res?.success) {
          const dataArray = Array.isArray(res.data)
            ? res.data
            : Array.isArray(res?.data?.data)
              ? res.data.data
              : [];
          setOverviewData(dataArray);
          const totalsObj = (res.totals ?? res?.data?.totals) || { earnings: 0, orders: 0, customers: 0 };
          const previousTotalsObj = (res.previousTotals ?? res?.data?.previousTotals) || { earnings: 0, orders: 0, customers: 0 };
          setOverviewTotals({
            earnings: Number(totalsObj.earnings || 0),
            orders: Number(totalsObj.orders || 0),
            customers: Number(totalsObj.customers || 0),
          });
          setOverviewPreviousTotals({
            earnings: Number(previousTotalsObj.earnings || 0),
            orders: Number(previousTotalsObj.orders || 0),
            customers: Number(previousTotalsObj.customers || 0),
          });
        } else {
          setOverviewData([]);
          setOverviewTotals({ earnings: 0, orders: 0, customers: 0 });
          setOverviewPreviousTotals({ earnings: 0, orders: 0, customers: 0 });
        }
      } catch (error) {
        message.error('Error fetching overview data');
        console.error(error);
        setOverviewData([]);
        setOverviewTotals({ earnings: 0, orders: 0, customers: 0 });
        setOverviewPreviousTotals({ earnings: 0, orders: 0, customers: 0 });
      } finally {
        setOverviewLoading(false);
      }
    };
    fetchOverview();
  }, [vendorIdNumber]);

  const mappedOverviewData = overviewData.map((d) => ({
    label: dayjs(d.order_date).format('ddd DD'),
    earnings: Number(d.total_earning || 0),
    orders: Number(d.total_orders || 0),
    customers: Number(d.total_customers || 0),
  }));

  // presetsTreeData removed; handled by reusable DateRangeSelector

  const mappedRangeData = (isSameDay ? rangeData.map((d) => ({
    label: `${d.order_hour}:00`,
    earnings: Number(d.total_earning || 0),
    orders: Number(d.total_orders || 0),
    customers: Number(d.total_customers || 0),
  })) : rangeData.map((d) => ({
    label: dayjs(d.order_date).format('YYYY-MM-DD'),
    earnings: Number(d.total_earning || 0),
    orders: Number(d.total_orders || 0),
    customers: Number(d.total_customers || 0),
  })));
  
  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };
  
  // Format number with commas
  const formatNumber = (value) => {
    return new Intl.NumberFormat('en-US').format(value);
  };

  const rangeSummary = {
    totalEarnings: mappedRangeData.reduce((s, x) => s + x.earnings, 0),
    totalOrders: mappedRangeData.reduce((s, x) => s + x.orders, 0),
    totalCustomers: mappedRangeData.reduce((s, x) => s + x.customers, 0),
  };

  // Prefer API totals; if they are zero but we have chart data, fallback to computed summary
  const hasApiTotals = (rangeTotals.earnings || rangeTotals.orders || rangeTotals.customers);
  const effectiveTotals = hasApiTotals ? rangeTotals : {
    earnings: Number(rangeSummary.totalEarnings || 0),
    orders: Number(rangeSummary.totalOrders || 0),
    customers: Number(rangeSummary.totalCustomers || 0),
  };

  const calculateTrend = (current = 0, previous = 0) => {
    const safeCurrent = Number(current || 0);
    const safePrevious = Number(previous || 0);
    const delta = safeCurrent - safePrevious;
    const trend = delta >= 0 ? 'up' : 'down';
    // Show percentage change relative to previous: (current - previous) / previous * 100
    let changePercent = 0;
    if (safePrevious > 0) {
      changePercent = (delta / safePrevious) * 100;
    } else {
      // If previous is 0: any positive current is +100%, otherwise 0%
      changePercent = safeCurrent > 0 ? 100 : 0;
    }
    return { trend, percentText: `${changePercent.toFixed(1)}%` };
  };
  
  // Stat Card Component
  const StatCard = ({ title, value, icon, trend, trendValue, color = THEME.primary, suffix = "" }) => {
    return (
      <Card style={styles.statCard}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ ...styles.iconWrapper, backgroundColor: `${color}15` }}>
            {icon}
          </div>
          <div>
            <Text type="secondary">{title}</Text>
            <Title level={4} style={{ margin: 0 }}>
              {value}{suffix}
              {trend && (
                <span style={{ 
                  fontSize: '14px', 
                  marginLeft: '8px',
                  color: trend === 'up' ? THEME.success : THEME.danger 
                }}>
                  {trend === 'up' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                  {trendValue}
                </span>
              )}
            </Title>
          </div>
        </div>
      </Card>
    );
  };

  const computeRangeFromPreset = (presetKey) => {
    const today = dayjs();
    switch (presetKey) {
      case 'today':
        return { start: today.startOf('day'), end: today.endOf('day') };
      case 'yesterday': {
        const y = today.subtract(1, 'day');
        return { start: y.startOf('day'), end: y.endOf('day') };
      }
      case 'this_week':
        return { start: today.startOf('week'), end: today.endOf('week') };
      case 'last_week': {
        const start = today.startOf('week').subtract(1, 'week');
        const end = today.endOf('week').subtract(1, 'week');
        return { start, end };
      }
      case 'this_month':
        return { start: today.startOf('month'), end: today.endOf('month') };
      case 'current_financial_year': {
        // Assuming financial year starts on April 1
        const year = today.month() >= 3 ? today.year() : today.year() - 1;
        const start = dayjs(`${year}-04-01`).startOf('day');
        const end = dayjs(`${year + 1}-03-31`).endOf('day');
        return { start, end };
      }
      case 'custom':
      default:
        return { start: tempStart, end: tempEnd };
    }
  };

  const getTotalEarnings = () => {
    return getCurrentData().reduce((sum, item) => sum + item.earnings, 0);
  };

  const getTotalOrders = () => {
    return getCurrentData().reduce((sum, item) => sum + item.orders, 0);
  };

  // Document status data
  const documentColumns = [
    {
      title: 'Document Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Badge 
          status={status === 'Uploaded' ? 'success' : 'warning'} 
          text={status}
        />
      ),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        record.url ? (
          <Image
            src={record.url}
            width={64}
            height={40}
            style={{ objectFit: 'cover', borderRadius: 4 }}
            preview={{
              zIndex: 3000,
            }}
          />
        ) : (
          <span style={{ color: '#999' }}>Upload</span>
        )
      ),
    },
  ];

  // documentData computed inline in Table to avoid null access before fetch

  // const StatCard = ({ title, value, icon, trend, trendValue, color = THEME.primary, suffix = "" }) => (
  //   <Card className="mb-2" style={{ borderLeft: `4px solid ${color}`, padding: '4px 8px' }}>
  //     <Statistic
  //       title={title}
  //       value={value}
  //       suffix={suffix}
  //       prefix={icon}
  //       valueStyle={{ color: '#000', fontWeight: 700 }}
  //     />
  //     {trend && (
  //       <div className="mt-2">
  //         <span style={{ color: trend === 'up' ? THEME.primary : THEME.danger, }}>
  //           {trend === 'up' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
  //           {' '}{trendValue}
  //         </span>
  //       </div>
  //     )}
  //   </Card>
  // );

  // The duplicate StatCard component has been completely removed
  
  
  
  

  const InfoRow = ({ icon, label, value }) => (
    <div className="d-flex align-items-center mb-3">
      <div className="me-3" style={{ color: THEME.primary }}>
        {icon}
      </div>
      <div>
        <div className="fw-bold">{value}</div>
        <small className="text-muted">{label}</small>
      </div>
    </div>
  );

  return (
    <div className='p2' style={{ backgroundColor: '#f0f2f5',  }}>
      {/* Header */}
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
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}
              >
                {vendorData?.store_image || vendorData?.profile_pic ? (
                  <img src={vendorData.store_image || vendorData.profile_pic} alt="Store Profile" style={{ width: '68px', height: '68px', objectFit: 'cover' }} />
                ) : (
                  <span>{vendorData?.store_name?.[0]?.toUpperCase() || vendorData?.firstname?.[0]?.toUpperCase()}</span>
                )}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <h3 className="mb-0" style={{ fontWeight: 700, color: '#0f172a' }}>{vendorData?.store_name || 'Vendor Store'}</h3>
                  {vendorData?.username && (
                    <Tag color="cyan" style={{ borderRadius: 6, fontWeight: 600 }}>@{vendorData.username}</Tag>
                  )}
                  {vendorData?.custom_id && (
                    <Tag color="blue" style={{ borderRadius: 6, fontWeight: 600 }}>ID: {vendorData.custom_id}</Tag>
                  )}
                </div>
                <p className="text-muted mb-1" style={{ fontSize: 13, marginTop: 2 }}>
                  👤 Owner: <strong>{`${vendorData?.firstname || ''} ${vendorData?.lastname || ''}`.trim() || 'N/A'}</strong>
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', fontSize: 12, color: '#475569' }}>
                  {vendorData?.phonenumber && <span>📞 {formatPhone(vendorData.phonenumber, vendorData.prefix)}</span>}
                  {vendorData?.email && <span>✉️ {vendorData.email}</span>}
                  {vendorData?.vendor_start_time && vendorData?.vendor_close_time && (
                    <span>⏱️ {convertTimeRange(vendorData.vendor_start_time, vendorData.vendor_close_time)}</span>
                  )}
                </div>
              </div>
            </div>
          </Col>
          <Col xs={24} md={8} style={{ textAlign: 'right' }}>
            <Space direction="vertical" align="end" size={6}>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <Badge 
                  status={vendorData?.is_verified === 1 ? 'success' : 'warning'}
                  text={<span style={{ fontWeight: 600 }}>{vendorData?.is_verified === 1 ? 'Verified' : 'Pending Verification'}</span>}
                />
                <Badge 
                  status={vendorData?.status === 1 ? 'processing' : 'default'}
                  text={<span style={{ fontWeight: 600 }}>{vendorData?.status === 1 ? 'Active' : 'Inactive'}</span>}
                />
                {vendorData?.deactivate_status === 1 && (
                  <Badge 
                    status="error"
                    text={<span style={{ fontWeight: 700, color: '#dc2626' }}>Blocked</span>}
                  />
                )}
              </div>
              {vendorData?.deactivate_status === 1 && vendorData?.remark && (
                <div style={{ fontSize: 11.5, color: '#dc2626' }}>
                  <strong>Remark:</strong> {vendorData.remark}
                </div>
              )}
              {vendorData?.business_reg_number && (
                <div style={{ fontSize: 12, color: '#64748b' }}>
                  Reg: <strong>{vendorData.business_reg_number}</strong>
                </div>
              )}
              <Button
                size="small"
                danger={vendorData?.deactivate_status !== 1}
                icon={vendorData?.deactivate_status === 1 ? <CheckCircleOutlined /> : <StopOutlined />}
                style={{
                  borderRadius: 6,
                  fontWeight: 600,
                  marginTop: 4,
                  backgroundColor: vendorData?.deactivate_status === 1 ? '#16a34a' : undefined,
                  color: vendorData?.deactivate_status === 1 ? '#ffffff' : undefined,
                  borderColor: vendorData?.deactivate_status === 1 ? '#16a34a' : undefined,
                }}
                onClick={() => (vendorData?.deactivate_status === 1 ? setUnblockModalVisible(true) : setBlockModalVisible(true))}
              >
                {vendorData?.deactivate_status === 1 ? 'Unblock Vendor' : 'Block Vendor'}
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Main Content */}
      <div className="contai44ner-fluid">
        <Tabs activeKey={activeTab} onChange={setActiveTab} tabBarStyle={{backgroundColor:"white",paddingLeft:10}} size="large">
          {/* Owner & Store Details Tab */}
          <TabPane tab={<span><User size={16} /> Owner & Store Details</span>} key="2">
            <Row gutter={[16, 16]}>
              <Col xs={24} lg={12}>
                <Card title="Personal Information" className="h-100">
                  <InfoRow 
                    icon={<User size={16} />}
                    label="Full Name"
                    value={`${vendorData?.firstname || ''} ${vendorData?.lastname || ''}`.trim() || 'N/A'}
                  />
                  <InfoRow 
                    icon={<User size={16} />}
                    label="Username"
                    value={vendorData?.username ? `@${vendorData.username}` : 'N/A'}
                  />
                  <InfoRow 
                    icon={<Mail size={16} />}
                    label="Email Address"
                    value={vendorData?.email || 'N/A'}
                  />
                  <InfoRow 
                    icon={<Phone size={16} />}
                    label="Phone Number"
                    value={formatPhone(vendorData?.phonenumber, vendorData?.prefix)}
                  />
                  <InfoRow 
                    icon={<FileText size={16} />}
                    label="SIN Code"
                    value={vendorData?.sin_code || 'Not Provided'}
                  />
                  <InfoRow 
                    icon={<Calendar size={16} />}
                    label="Registration Date"
                    value={vendorData?.created_at ? new Date(vendorData.created_at).toLocaleDateString() : 'N/A'}
                  />
                </Card>
              </Col>

              <Col xs={24} lg={12}>
                <Card title="Store Information" className="h-100">
                  <InfoRow 
                    icon={<Package size={16} />}
                    label="Store Name"
                    value={vendorData?.store_name || 'N/A'}
                  />
                  <InfoRow 
                    icon={<MapPin size={16} />}
                    label="Store Address"
                    value={vendorData?.store_address || 'N/A'}
                  />
                  <InfoRow 
                    icon={<Clock size={16} />}
                    label="Operating Hours"
                    value={(vendorData?.vendor_start_time && vendorData?.vendor_close_time && convertTimeRange(vendorData.vendor_start_time, vendorData.vendor_close_time)) || 'N/A'}
                  />
                  <InfoRow 
                    icon={<FileText size={16} />}
                    label="Business Registration Number"
                    value={vendorData?.business_reg_number || 'Not Provided'}
                  />
                  <InfoRow 
                    icon={<FileText size={16} />}
                    label="GST Number"
                    value={vendorData?.gst_number || 'Not Provided'}
                  />
                  <InfoRow 
                    icon={<MapPin size={16} />}
                    label="Store Coordinates (Lat / Lng)"
                    value={vendorData?.vendor_lat && vendorData?.vendor_lng ? `${vendorData.vendor_lat}, ${vendorData.vendor_lng}` : 'Not Provided'}
                  />
                </Card>
              </Col>
            </Row>
            
            <Row gutter={[16, 16]} className="mt-4">
              <Col xs={24}>
                <Card title="Verification & Legal Documents">
                  <Table 
                    columns={documentColumns} 
                    dataSource={vendorData ? [
                      { key: '1', name: 'Business License', status: (vendorData?.bussiness_license_number || vendorData?.bussiness_license_number_pic) ? 'Uploaded' : 'Pending', url: vendorData?.bussiness_license_number_pic || null },
                      { key: '2', name: 'GST Certificate', status: vendorData?.gst_number_pic ? 'Uploaded' : 'Pending', url: vendorData?.gst_number_pic || null },
                      { key: '3', name: 'Identity Proof', status: vendorData?.identity_proof ? 'Uploaded' : 'Pending', url: vendorData?.identity_proof || null },
                      { key: '4', name: 'Insurance Certificate', status: vendorData?.vendor_insurance_certificate ? 'Uploaded' : 'Pending', url: vendorData?.vendor_insurance_certificate || null },
                      { key: '5', name: 'Health Inspection Certificate', status: vendorData?.health_inspection_certificate ? 'Uploaded' : 'Pending', url: vendorData?.health_inspection_certificate || null },
                      { key: '6', name: 'Food Certificate', status: vendorData?.food_certificate ? 'Uploaded' : 'Pending', url: vendorData?.food_certificate || null },
                      { key: '7', name: 'Void Cheque', status: vendorData?.void_cheque ? 'Uploaded' : 'Pending', url: vendorData?.void_cheque || null },
                      { key: '8', name: 'Store Image', status: vendorData?.store_image ? 'Uploaded' : 'Pending', url: vendorData?.store_image || null },
                      { key: '9', name: 'Profile Picture', status: vendorData?.profile_pic ? 'Uploaded' : 'Pending', url: vendorData?.profile_pic || null },
                    ] : []} 
                    pagination={false}
                    size="small"
                  />
                </Card>
              </Col>
            </Row>
          </TabPane>

          {/* Bank Details Tab */}
          <TabPane tab={<span><Banknote size={16} /> Bank Details</span>} key="4">
            <Row gutter={[16, 16]}>
              <Col xs={24} lg={12}>
                <Card title="Bank Account Information" className="h-100">
                  <InfoRow 
                    icon={<Banknote size={16} />}
                    label="Bank Name"
                    value={vendorData?.bank_name || 'Not Provided'}
                  />
                  <InfoRow 
                    icon={<User size={16} />}
                    label="Account Holder Name"
                    value={vendorData?.account_holder_name || `${vendorData?.firstname || ''} ${vendorData?.lastname || ''}`.trim() || 'Not Provided'}
                  />
                  <InfoRow 
                    icon={<FileText size={16} />}
                    label="Account Number"
                    value={vendorData?.account_number || 'Not Provided'}
                  />
                  <InfoRow 
                    icon={<FileText size={16} />}
                    label="Transit Number"
                    value={vendorData?.transit_number || 'Not Provided'}
                  />
                  <InfoRow 
                    icon={<FileText size={16} />}
                    label="Institution Number"
                    value={vendorData?.institution_number || 'Not Provided'}
                  />
                </Card>
              </Col>

              <Col xs={24} lg={12}>
                <Card title="Void Cheque Document" className="h-100">
                  {vendorData?.void_cheque ? (
                    <div style={{ textAlign: 'center', padding: '16px' }}>
                      <Image
                        src={vendorData.void_cheque}
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

          {/* Wallet & Transactions Tab (Next to Bank Details) */}
          <TabPane tab={<span><Wallet size={16} /> Wallet & Transactions</span>} key="wallet">
            {/* Header & Quick Refresh */}
            <Card bodyStyle={{ padding: '16px 20px' }} style={{ borderRadius: 8, marginBottom: 16 }}>
              <div className="d-flex align-items-center justify-content-between flex-md-row flex-column gap-3">
                <div>
                  <h4 className="mb-0" style={{ fontWeight: 700, color: '#0f172a' }}>
                    Vendor Wallet & Transaction Ledger
                  </h4>
                  <p className="text-muted mb-0" style={{ fontSize: 12 }}>
                    Real-time vendor balance, order earnings credited, withdrawal payout requests, and complete financial ledger.
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
                    <div style={{ ...styles.iconWrapper, width: 36, height: 36, borderRadius: 8, background: '#088b4618', margin: 0 }}>
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
                    <div style={{ ...styles.iconWrapper, width: 36, height: 36, borderRadius: 8, background: '#2563eb18', margin: 0 }}>
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
                    <div style={{ ...styles.iconWrapper, width: 36, height: 36, borderRadius: 8, background: '#dc262618', margin: 0 }}>
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
                    <div style={{ ...styles.iconWrapper, width: 36, height: 36, borderRadius: 8, background: '#d9770618', margin: 0 }}>
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
                <Col xs={24} md={8}>
                  <Input
                    placeholder="Search by ID, Order UID, Txn Ref, or notes..."
                    prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
                    value={walletSearch}
                    onChange={(e) => setWalletSearch(e.target.value)}
                    allowClear
                    style={{ borderRadius: 6 }}
                  />
                </Col>

                <Col xs={12} md={4}>
                  <Select
                    value={walletTypeFilter}
                    onChange={setWalletTypeFilter}
                    style={{ width: '100%' }}
                    options={[
                      { label: 'All Types', value: 'all' },
                      { label: '+ Earnings (Credits)', value: 'earning' },
                      { label: '- Withdrawals (Debits)', value: 'withdrawal' },
                    ]}
                  />
                </Col>

                <Col xs={12} md={4}>
                  <Select
                    value={walletStatusFilter}
                    onChange={setWalletStatusFilter}
                    style={{ width: '100%' }}
                    options={[
                      { label: 'All Statuses', value: 'all' },
                      { label: 'Completed / Credited', value: 'completed' },
                      { label: 'Pending', value: 'pending' },
                      { label: 'Rejected / Cancelled', value: 'rejected' },
                    ]}
                  />
                </Col>

                <Col xs={24} md={5}>
                  <DatePicker.RangePicker
                    value={walletDateRange}
                    onChange={setWalletDateRange}
                    style={{ width: '100%', borderRadius: 6 }}
                    placeholder={['Start Date', 'End Date']}
                  />
                </Col>

                <Col xs={24} md={3} style={{ textAlign: 'right' }}>
                  <Button
                    onClick={() => {
                      setWalletSearch('');
                      setWalletTypeFilter('all');
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
                Showing <strong>{filteredWalletTransactions.length}</strong> of <strong>{walletSummary.allTransactions.length}</strong> total transactions
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
                  showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} transactions`,
                }}
              />
            </Card>
          </TabPane>

          {/* Vendor Orders & Analytics Tab */}
          <TabPane tab={<span><ShoppingCart size={16} /> All Orders & Analytics ({vendorData?.orders?.length || 0})</span>} key="5">
            {/* Filter Header & Controls */}
            <Card bodyStyle={{ padding: '16px 20px' }} style={{ borderRadius: 8, marginBottom: 16 }}>
              <div className="d-flex align-items-center justify-content-between flex-md-row flex-column gap-3 mb-3">
                <div>
                  <h4 className="mb-0" style={{ fontWeight: 700, color: '#0f172a' }}>All Orders, Revenue & Analytics</h4>
                  <p className="text-muted mb-0" style={{ fontSize: 12 }}>
                    Real-time revenue metrics, delivered payout, admin commission, pending orders, and full order history.
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
                      fetchAnalytics(start, end);
                    }}
                  />
                </div>
              </div>

              {/* Filter Controls Bar */}
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                <Input
                  prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
                  placeholder="Search order UID, customer, phone, address, product..."
                  value={analyticsSearch}
                  onChange={(e) => setAnalyticsSearch(e.target.value)}
                  allowClear
                  style={{ width: 300, borderRadius: 8 }}
                />

                <Select
                  value={analyticsStatusFilter}
                  onChange={setAnalyticsStatusFilter}
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
                  value={analyticsTypeFilter}
                  onChange={setAnalyticsTypeFilter}
                  style={{ width: 190 }}
                >
                  <Select.Option value="all">All Revenue Types</Select.Option>
                  <Select.Option value="delivered">Delivered Payout Only</Select.Option>
                  <Select.Option value="pending">Pending Payout Only</Select.Option>
                  <Select.Option value="commission">Admin Commission Only</Select.Option>
                  <Select.Option value="rejected">Rejected Loss Only</Select.Option>
                </Select>

                {(analyticsSearch || analyticsStatusFilter !== 'all' || analyticsTypeFilter !== 'all') && (
                  <Button
                    onClick={() => {
                      setAnalyticsSearch('');
                      setAnalyticsStatusFilter('all');
                      setAnalyticsTypeFilter('all');
                    }}
                  >
                    Reset Filters
                  </Button>
                )}

                <div style={{ fontSize: 13, color: '#64748b', marginLeft: 'auto' }}>
                  Showing <strong>{vendorAnalyticsMetrics?.tableOrders?.length || 0}</strong> of {vendorData?.orders?.length || 0} orders
                </div>
              </div>
            </Card>

            {/* Financial Stat Cards Grid */}
            <Row gutter={[16, 16]} className="mb-4">
              <Col xs={24} sm={12} md={8} lg={4}>
                <Card bodyStyle={{ padding: 16 }} style={{ borderRadius: 8, height: '100%', borderLeft: `4px solid ${THEME.primary}` }}>
                  <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Net Vendor Share (Payout)</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: '#088b46', marginTop: 4 }}>
                    ${(vendorAnalyticsMetrics?.totalDeliveredVendorShare || 0).toFixed(2)}
                  </div>
                  <div style={{ fontSize: 11, color: '#16a34a', marginTop: 4 }}>
                    {vendorAnalyticsMetrics?.deliveredCount || 0} Delivered Orders
                  </div>
                </Card>
              </Col>

              <Col xs={24} sm={12} md={8} lg={4}>
                <Card bodyStyle={{ padding: 16 }} style={{ borderRadius: 8, height: '100%', borderLeft: '4px solid #faad14' }}>
                  <div style={{ fontSize: 12, color: '#d97706', fontWeight: 600 }}>Pending Vendor Payout</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: '#d97706', marginTop: 4 }}>
                    ${(vendorAnalyticsMetrics?.pendingVendorShare || 0).toFixed(2)}
                  </div>
                  <div style={{ fontSize: 11, color: '#d97706', marginTop: 4 }}>
                    {vendorAnalyticsMetrics?.pendingCount || 0} Pending Orders
                  </div>
                </Card>
              </Col>

              <Col xs={24} sm={12} md={8} lg={4}>
                <Card bodyStyle={{ padding: 16 }} style={{ borderRadius: 8, height: '100%', borderLeft: '4px solid #722ed1' }}>
                  <div style={{ fontSize: 12, color: '#722ed1', fontWeight: 600 }}>Admin Commission</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: '#722ed1', marginTop: 4 }}>
                    ${(vendorAnalyticsMetrics?.totalAdminCommission || 0).toFixed(2)}
                  </div>
                  <div style={{ fontSize: 11, color: '#722ed1', marginTop: 4 }}>
                    Commission Retained
                  </div>
                </Card>
              </Col>

              <Col xs={24} sm={12} md={8} lg={4}>
                <Card bodyStyle={{ padding: 16 }} style={{ borderRadius: 8, height: '100%', borderLeft: '4px solid #0284c7' }}>
                  <div style={{ fontSize: 12, color: '#0284c7', fontWeight: 600 }}>Gross Order Value</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: '#0284c7', marginTop: 4 }}>
                    ${(vendorAnalyticsMetrics?.grossTotalOrderPrice || 0).toFixed(2)}
                  </div>
                  <div style={{ fontSize: 11, color: '#0284c7', marginTop: 4 }}>
                    {vendorAnalyticsMetrics?.totalOrdersCount || 0} Total Orders
                  </div>
                </Card>
              </Col>

              <Col xs={24} sm={12} md={8} lg={4}>
                <Card bodyStyle={{ padding: 16 }} style={{ borderRadius: 8, height: '100%', borderLeft: '4px solid #8b5cf6' }}>
                  <div style={{ fontSize: 12, color: '#7c3aed', fontWeight: 600 }}>Avg Order Value</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: '#7c3aed', marginTop: 4 }}>
                    ${(vendorAnalyticsMetrics?.avgOrderValue || 0).toFixed(2)}
                  </div>
                  <div style={{ fontSize: 11, color: '#7c3aed', marginTop: 4 }}>
                    Per Order Average
                  </div>
                </Card>
              </Col>

              <Col xs={24} sm={12} md={8} lg={4}>
                <Card bodyStyle={{ padding: 16 }} style={{ borderRadius: 8, height: '100%', borderLeft: '4px solid #f5222d' }}>
                  <div style={{ fontSize: 12, color: '#dc2626', fontWeight: 600 }}>Rejected Orders</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: '#dc2626', marginTop: 4 }}>
                    {vendorAnalyticsMetrics?.rejectedCount || 0}
                  </div>
                  <div style={{ fontSize: 11, color: '#dc2626', marginTop: 4 }}>
                    Cancelled Orders
                  </div>
                </Card>
              </Col>
            </Row>

            {/* Analytics Charts */}
            <Row gutter={[16, 16]} className="mb-4">
              <Col xs={24} lg={14}>
                <Card title="Vendor Payout & Pending Trend" className="h-100">
                  <ResponsiveContainer width="100%" height={320}>
                    <AreaChart data={vendorAnalyticsMetrics?.chartTrendData?.length > 0 ? vendorAnalyticsMetrics.chartTrendData : mappedRangeData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="label" />
                      <YAxis />
                      <Tooltip formatter={(value) => `$${Number(value).toFixed(2)}`} />
                      <Legend />
                      <Area type="monotone" dataKey="deliveredRevenue" name="Delivered Vendor Share" stroke="#52c41a" fill="#52c41a" fillOpacity={0.2} />
                      <Area type="monotone" dataKey="pendingRevenue" name="Pending Vendor Share" stroke="#faad14" fill="#faad14" fillOpacity={0.2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </Card>
              </Col>

              <Col xs={24} lg={10}>
                <Card title="Order Status Breakdown" className="h-100">
                  <ResponsiveContainer width="100%" height={320}>
                    <PieChart>
                      <Pie
                        data={vendorAnalyticsMetrics?.statusDistribution?.length > 0 ? vendorAnalyticsMetrics.statusDistribution : categoryData}
                        cx="50%"
                        cy="50%"
                        outerRadius={90}
                        dataKey="value"
                        label={({ name, value }) => `${name}: $${Number(value).toFixed(2)}`}
                      >
                        {(vendorAnalyticsMetrics?.statusDistribution?.length > 0 ? vendorAnalyticsMetrics.statusDistribution : categoryData).map((entry, index) => (
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
            <Card title="Order History, Commission & Revenue Breakdown" style={{ borderRadius: 8, marginBottom: 16 }}>
              <Table
                columns={vendorOrderColumns}
                dataSource={vendorAnalyticsMetrics?.tableOrders || []}
                rowKey={(record) => record.id || record.order_uid}
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} orders`,
                }}
                scroll={{ x: 'max-content' }}
              />
            </Card>

            {rangeLoading && (
              <div className="d-flex justify-content-center align-items-center mt-3 mb-3">
                <Spin size="small" />
                <span className="ms-2">Loading...</span>
              </div>
            )}
          </TabPane>
        </Tabs>
      </div>

      {/* Detailed View Modal for Vendor Order */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontWeight: 700, fontSize: 16 }}>
              Order #{selectedVendorOrder?.order_uid || selectedVendorOrder?.id}
            </span>
            {selectedVendorOrder && (
              <Tag color={getVendorOrderStatus(selectedVendorOrder.order_status).color} style={{ borderRadius: 12, fontWeight: 600 }}>
                {getVendorOrderStatus(selectedVendorOrder.order_status).text}
              </Tag>
            )}
          </div>
        }
        open={!!selectedVendorOrder}
        onCancel={() => setSelectedVendorOrder(null)}
        footer={null}
        width={750}
        style={{ top: 40 }}
      >
        {selectedVendorOrder && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingTop: 8 }}>
            {/* Customer & Address Details */}
            <Card size="small" title="Customer & Order Details" style={{ borderRadius: 8, background: '#f8fafc' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13 }}>
                <div><strong>Order Date & Time:</strong> {selectedVendorOrder.order_date || selectedVendorOrder.created_at ? dayjs(selectedVendorOrder.order_date || selectedVendorOrder.created_at).format('DD MMM YYYY, hh:mm A') : '-'}</div>
                <div><strong>Customer Name:</strong> {[selectedVendorOrder.customer?.firstname, selectedVendorOrder.customer?.lastname].filter(Boolean).join(' ') || selectedVendorOrder.firstname || '-'}</div>
                <div><strong>Email:</strong> {selectedVendorOrder.customer?.email || selectedVendorOrder.email || '-'}</div>
                <div><strong>Phone:</strong> {[selectedVendorOrder.customer?.prefix || selectedVendorOrder.prefix, selectedVendorOrder.customer?.phonenumber || selectedVendorOrder.phonenumber].filter(Boolean).join(' ') || '-'}</div>
                <div><strong>Delivery Address:</strong> {typeof selectedVendorOrder.address === 'string' ? selectedVendorOrder.address : selectedVendorOrder.address?.address || '-'}</div>
              </div>
            </Card>

            {/* Product Table */}
            <Card size="small" title="Order Items" style={{ borderRadius: 8 }}>
              <Table
                dataSource={selectedVendorOrder.products || []}
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

            {/* Price & Payout Breakdown */}
            {(() => {
              const totalAmt = Number(selectedVendorOrder.overall_amount || selectedVendorOrder.total_price || 0);
              const vendorShare = Number(selectedVendorOrder.vendor_share !== undefined && selectedVendorOrder.vendor_share !== null ? selectedVendorOrder.vendor_share : totalAmt);
              const adminCommission = Math.max(0, totalAmt - vendorShare);
              const fastDelCharge = Number(selectedVendorOrder.fast_delivery_charges || 0);
              let tipAmt = Number(selectedVendorOrder.tip_amount || 0);
              const tipPct = Number(selectedVendorOrder.tip_percentage || 0);
              if (tipAmt === 0 && tipPct > 0 && totalAmt > 0) {
                tipAmt = (totalAmt * tipPct) / 100;
              }

              return (
                <Card size="small" title="Payout & Commission Breakdown" style={{ borderRadius: 8, background: '#f0fdf4' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Gross Total Amount (overall_amount):</span>
                      <strong>${totalAmt.toFixed(2)}</strong>
                    </div>
                    {Number(selectedVendorOrder.rider_deliveryCharge || 0) > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                        <span>🛵 Rider Delivery Charge (rider_deliveryCharge):</span>
                        <span>${Number(selectedVendorOrder.rider_deliveryCharge || 0).toFixed(2)}</span>
                      </div>
                    )}
                    {fastDelCharge > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#0284c7' }}>
                        <span>⚡ Fast Delivery Charges:</span>
                        <strong>+${fastDelCharge.toFixed(2)}</strong>
                      </div>
                    )}
                    {tipAmt > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#088b46' }}>
                        <span>🎁 Tip Amount {tipPct > 0 ? `(${tipPct}%)` : ''}:</span>
                        <strong>+${tipAmt.toFixed(2)}</strong>
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#d97706' }}>
                      <span>Admin Commission (Deducted):</span>
                      <strong>-${adminCommission.toFixed(2)}</strong>
                    </div>
                    <Divider style={{ margin: '6px 0' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 17, fontWeight: 700, color: '#088b46' }}>
                      <span>Net Vendor Share (Payout Received):</span>
                      <span>${vendorShare.toFixed(2)}</span>
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
              Withdrawal Details #{selectedWithdrawalDetail?.withdrawal_uid || selectedWithdrawalDetail?.id}
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

            <Card size="small" title="Vendor Bank Account Details" style={{ marginBottom: 16, borderRadius: 8 }}>
              <Row gutter={[12, 12]}>
                <Col span={12}>
                  <div style={{ fontSize: 11, color: '#64748b' }}>Bank Name</div>
                  <div style={{ fontWeight: 600, color: '#1e293b' }}>
                    {selectedWithdrawalDetail.bank_name || selectedWithdrawalDetail.bank_details?.bank_name || vendorData?.bank_name || 'Not Provided'}
                  </div>
                </Col>
                <Col span={12}>
                  <div style={{ fontSize: 11, color: '#64748b' }}>Account Holder</div>
                  <div style={{ fontWeight: 600, color: '#1e293b' }}>
                    {selectedWithdrawalDetail.account_holder_name || selectedWithdrawalDetail.bank_details?.account_holder_name || vendorData?.account_holder_name || `${vendorData?.firstname || ''} ${vendorData?.lastname || ''}`.trim() || 'Not Provided'}
                  </div>
                </Col>
                <Col span={12}>
                  <div style={{ fontSize: 11, color: '#64748b' }}>Account Number</div>
                  <div style={{ fontWeight: 600, color: '#1e293b' }}>
                    {selectedWithdrawalDetail.account_number || selectedWithdrawalDetail.bank_details?.account_number || vendorData?.account_number || 'Not Provided'}
                  </div>
                </Col>
                <Col span={12}>
                  <div style={{ fontSize: 11, color: '#64748b' }}>Transit / Branch No</div>
                  <div style={{ fontWeight: 600, color: '#1e293b' }}>
                    {selectedWithdrawalDetail.transit_number || selectedWithdrawalDetail.bank_details?.transit_number || vendorData?.transit_number || 'Not Provided'}
                  </div>
                </Col>
                <Col span={12}>
                  <div style={{ fontSize: 11, color: '#64748b' }}>Institution Number</div>
                  <div style={{ fontWeight: 600, color: '#1e293b' }}>
                    {selectedWithdrawalDetail.institution_number || selectedWithdrawalDetail.bank_details?.institution_number || vendorData?.institution_number || 'Not Provided'}
                  </div>
                </Col>
                {(selectedWithdrawalDetail.ifsc_code || selectedWithdrawalDetail.bank_details?.ifsc_code) && (
                  <Col span={12}>
                    <div style={{ fontSize: 11, color: '#64748b' }}>IFSC Code</div>
                    <div style={{ fontWeight: 600, color: '#1e293b' }}>
                      {selectedWithdrawalDetail.ifsc_code || selectedWithdrawalDetail.bank_details?.ifsc_code}
                    </div>
                  </Col>
                )}
                {(selectedWithdrawalDetail.upi_id || selectedWithdrawalDetail.bank_details?.upi_id) && (
                  <Col span={12}>
                    <div style={{ fontSize: 11, color: '#64748b' }}>UPI ID</div>
                    <div style={{ fontWeight: 600, color: '#1e293b' }}>
                      {selectedWithdrawalDetail.upi_id || selectedWithdrawalDetail.bank_details?.upi_id}
                    </div>
                  </Col>
                )}
              </Row>
            </Card>

            <Card size="small" title="Transaction & Processing Details" style={{ borderRadius: 8 }}>
              <Row gutter={[12, 10]}>
                <Col span={24}>
                  <div style={{ fontSize: 11, color: '#64748b' }}>Transaction / UTR Reference</div>
                  <div style={{ fontWeight: 600, color: '#1e293b', marginTop: 2 }}>
                    {selectedWithdrawalDetail.transaction_reference ? (
                      <Tag color="blue">{selectedWithdrawalDetail.transaction_reference}</Tag>
                    ) : (
                      <span style={{ color: '#94a3b8' }}>None recorded</span>
                    )}
                  </div>
                </Col>
                {selectedWithdrawalDetail.notes && (
                  <Col span={24}>
                    <div style={{ fontSize: 11, color: '#64748b' }}>Vendor Notes</div>
                    <div style={{ color: '#334155', background: '#f1f5f9', padding: '6px 10px', borderRadius: 6, fontSize: 12, marginTop: 2 }}>
                      {selectedWithdrawalDetail.notes}
                    </div>
                  </Col>
                )}
                {selectedWithdrawalDetail.admin_remarks && (
                  <Col span={24}>
                    <div style={{ fontSize: 11, color: '#64748b' }}>Admin Remarks</div>
                    <div style={{ color: '#334155', background: '#fef3c7', padding: '6px 10px', borderRadius: 6, fontSize: 12, border: '1px solid #fde68a', marginTop: 2 }}>
                      {selectedWithdrawalDetail.admin_remarks}
                    </div>
                  </Col>
                )}
              </Row>
            </Card>
          </div>
        )}
      </Modal>

      {/* Block Vendor Modal Form */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#dc2626' }}>
            <StopOutlined style={{ fontSize: 18 }} />
            <span>Block Vendor</span>
          </div>
        }
        open={blockModalVisible}
        onCancel={() => {
          if (!blockLoading) {
            setBlockModalVisible(false);
          }
        }}
        footer={[
          <Button key="cancel" onClick={() => setBlockModalVisible(false)} disabled={blockLoading}>
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            danger
            loading={blockLoading}
            onClick={handleConfirmBlock}
            icon={<StopOutlined />}
            style={{ fontWeight: 600 }}
          >
            Confirm & Block Vendor
          </Button>,
        ]}
        destroyOnClose
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ padding: '10px 14px', background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
            <div style={{ fontWeight: 600, color: '#0f172a', fontSize: 14 }}>
              {vendorData?.store_name || 'Unnamed Store'}
            </div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
              Owner: <strong>{[vendorData?.firstname, vendorData?.lastname].filter(Boolean).join(' ') || 'N/A'}</strong>
              {' • '}ID: <strong>{vendorData?.custom_id || `VEN#${vendorIdNumber}`}</strong>
            </div>
          </div>

          <Alert
            type="warning"
            showIcon
            message="Vendor store will be blocked"
            description="Blocking this vendor will deactivate their store and hide products from customer ordering."
            style={{ fontSize: 12.5 }}
          />

          <div>
            <label style={{ display: 'block', fontWeight: 600, fontSize: 13, marginBottom: 6 }}>
              Reason for Blocking: <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <Select
              value={blockReason}
              onChange={setBlockReason}
              style={{ width: '100%' }}
              options={[
                { label: 'Policy Violation (Breach of Platform Terms)', value: 'Policy Violation' },
                { label: 'Fraudulent Activity / Suspicious Transactions', value: 'Fraudulent Activity' },
                { label: 'High Order Cancellation Rate', value: 'High Order Cancellation Rate' },
                { label: 'Customer Complaints & Low Ratings', value: 'Customer Complaints' },
                { label: 'Quality / Food Hygiene Issues', value: 'Quality/Hygiene Issues' },
                { label: 'Unsettled Fees / Payment Disputes', value: 'Payment Dispute' },
                { label: 'Vendor Requested Temporary Block', value: 'Vendor Requested' },
                { label: 'Other', value: 'Other' },
              ]}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: 600, fontSize: 13, marginBottom: 6 }}>
              Additional Remarks / Details:
            </label>
            <Input.TextArea
              rows={3}
              placeholder="Enter details about why this vendor is being blocked..."
              value={blockRemarks}
              onChange={(e) => setBlockRemarks(e.target.value)}
            />
          </div>
        </div>
      </Modal>

      {/* Unblock Vendor Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#16a34a' }}>
            <CheckCircleOutlined style={{ fontSize: 18 }} />
            <span>Unblock & Reactivate Vendor</span>
          </div>
        }
        open={unblockModalVisible}
        onCancel={() => {
          if (!unblockLoading) {
            setUnblockModalVisible(false);
          }
        }}
        footer={[
          <Button key="cancel" onClick={() => setUnblockModalVisible(false)} disabled={unblockLoading}>
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={unblockLoading}
            onClick={handleConfirmUnblock}
            icon={<CheckCircleOutlined />}
            style={{ backgroundColor: '#16a34a', borderColor: '#16a34a', fontWeight: 600 }}
          >
            Reactivate Vendor
          </Button>,
        ]}
      >
        <p style={{ margin: 0, fontSize: 13.5 }}>
          Are you sure you want to unblock and reactivate <strong>{vendorData?.store_name}</strong>?
          Their store will be marked active and their products will be visible to customers again.
        </p>
      </Modal>
    </div>
  );
};

export default VendorDashboard;