import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import dayjs from 'dayjs';
import { getAllUnverifiedUsers, verifyUser } from '../../services/apiService';

export default function useUnverifiedUsers(user) {
  const [searchParams, setSearchParams] = useSearchParams();

  const [vendors, setVendors] = useState([]);
  const [deliveryPartners, setDeliveryPartners] = useState([]);
  const [userType, setUserType] = useState(user || 'vendors');
  const [loading, setLoading] = useState(false);

  // Initialize filters from URL searchParams
  const initSort = searchParams.get('sort') || '';
  const initSearch = searchParams.get('search') || '';
  const initDate = searchParams.get('date') || '';
  const initStartDate = searchParams.get('startDate') || '';
  const initEndDate = searchParams.get('endDate') || '';

  let initDateType = 'all';
  let initSingleDate = null;
  let initRangeDates = null;

  if (initStartDate && initEndDate) {
    initDateType = 'range';
    initRangeDates = [dayjs(initStartDate), dayjs(initEndDate)];
  } else if (initDate === 'today' || initDate === 'yesterday') {
    initDateType = initDate;
  } else if (initDate) {
    initDateType = 'single';
    initSingleDate = dayjs(initDate);
  }

  // Filter states
  const [search, setSearch] = useState(initSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(initSearch);
  const [sortOrder, setSortOrder] = useState(initSort); // 'a-z' | 'z-a' | ''
  const [statusFilter, setStatusFilter] = useState(null); // null = all, 0 = Pending, 1 = Verified, 2 = Rejected, 3 = In Review

  const [dateFilterType, setDateFilterType] = useState(initDateType); // 'all' | 'today' | 'yesterday' | 'single' | 'range'
  const [singleDate, setSingleDate] = useState(initSingleDate);
  const [rangeDates, setRangeDates] = useState(initRangeDates);

  const [selectedUser, setSelectedUser] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewLoading, setViewLoading] = useState(false);

  // Cache key ref to prevent repeated API calls when nothing has changed
  const lastFetchedParamsRef = useRef(null);

  // Debounce search input changes by 500ms, only if value actually changed
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch((prev) => {
        const nextVal = (search || '').trim();
        return prev === nextVal ? prev : nextVal;
      });
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  // Core API fetcher - guarded against duplicate calls
  const fetchUsers = useCallback(async (customParams, force = false) => {
    let params = customParams;
    if (!params) {
      params = {};
      if (sortOrder === 'a-z' || sortOrder === 'z-a') {
        params.sort = sortOrder;
      }
      if (debouncedSearch) {
        params.search = debouncedSearch;
      }
      if (dateFilterType === 'today') {
        params.date = 'today';
      } else if (dateFilterType === 'yesterday') {
        params.date = 'yesterday';
      } else if (dateFilterType === 'single' && singleDate) {
        params.date = dayjs(singleDate).format('YYYY-MM-DD');
      } else if (dateFilterType === 'range' && rangeDates?.[0] && rangeDates?.[1]) {
        params.startDate = dayjs(rangeDates[0]).format('YYYY-MM-DD');
        params.endDate = dayjs(rangeDates[1]).format('YYYY-MM-DD');
      }
    }

    const cacheKey = JSON.stringify({ userType, ...params });
    if (!force && lastFetchedParamsRef.current === cacheKey) {
      // Do not hit the API again if nothing changed!
      return;
    }
    lastFetchedParamsRef.current = cacheKey;

    setLoading(true);
    try {
      const response = await getAllUnverifiedUsers(params);
      if (response?.success) {
        setVendors(response.vendors || []);
        setDeliveryPartners(response.delivery_partners || []);
      } else {
        setVendors([]);
        setDeliveryPartners([]);
      }
    } catch (error) {
      console.error('Error fetching unverified users:', error);
      setVendors([]);
      setDeliveryPartners([]);
    } finally {
      setLoading(false);
    }
  }, [sortOrder, debouncedSearch, dateFilterType, singleDate, rangeDates, userType]);

  // Sync state to URL searchParams and fetch from API ONLY when filters change
  useEffect(() => {
    const params = {};
    const newSearchParams = new URLSearchParams();

    if (sortOrder === 'a-z' || sortOrder === 'z-a') {
      params.sort = sortOrder;
      newSearchParams.set('sort', sortOrder);
    }

    if (debouncedSearch) {
      params.search = debouncedSearch;
      newSearchParams.set('search', debouncedSearch);
    }

    if (dateFilterType === 'today') {
      params.date = 'today';
      newSearchParams.set('date', 'today');
    } else if (dateFilterType === 'yesterday') {
      params.date = 'yesterday';
      newSearchParams.set('date', 'yesterday');
    } else if (dateFilterType === 'single' && singleDate) {
      const dStr = dayjs(singleDate).format('YYYY-MM-DD');
      params.date = dStr;
      newSearchParams.set('date', dStr);
    } else if (dateFilterType === 'range' && rangeDates?.[0] && rangeDates?.[1]) {
      const sStr = dayjs(rangeDates[0]).format('YYYY-MM-DD');
      const eStr = dayjs(rangeDates[1]).format('YYYY-MM-DD');
      params.startDate = sStr;
      params.endDate = eStr;
      newSearchParams.set('startDate', sStr);
      newSearchParams.set('endDate', eStr);
    }

    // Only update if searchParams differs to avoid router re-triggers
    if (newSearchParams.toString() !== searchParams.toString()) {
      setSearchParams(newSearchParams, { replace: true });
    }

    fetchUsers(params);
  }, [sortOrder, debouncedSearch, dateFilterType, singleDate, rangeDates, userType]);

  // Handle route/prop change between vendors and riders
  useEffect(() => {
    setUserType(user);
  }, [user]);

  // Date handlers
  const handleDateFilterTypeChange = (type) => {
    setDateFilterType(type);
    if (type === 'today' || type === 'yesterday' || type === 'all') {
      setSingleDate(null);
      setRangeDates(null);
    } else if (type === 'single') {
      if (!singleDate) setSingleDate(dayjs());
      setRangeDates(null);
    } else if (type === 'range') {
      if (!rangeDates) setRangeDates([dayjs().subtract(7, 'day'), dayjs()]);
      setSingleDate(null);
    }
  };

  const handleSingleDateChange = (date) => {
    setSingleDate(date ? dayjs(date) : null);
  };

  const handleRangeDatesChange = (dates) => {
    if (dates && dates[0] && dates[1]) {
      setRangeDates([dayjs(dates[0]), dayjs(dates[1])]);
    } else {
      setRangeDates(null);
    }
  };

  // Reset all filters
  const resetFilters = () => {
    setSearch('');
    setDebouncedSearch('');
    setStatusFilter(null);
    setSortOrder('');
    setDateFilterType('all');
    setSingleDate(null);
    setRangeDates(null);
    setSearchParams(new URLSearchParams(), { replace: true });
    // Clear cache ref to allow clean reload
    lastFetchedParamsRef.current = null;
    fetchUsers({}, true);
  };

  // Helper: get sortable display name for a record
  const getDisplayName = (u, type) => {
    if (type === 'vendors') {
      return (u.storename || u.store_name || `${u.firstname || ''} ${u.lastname || ''}`.trim() || '');
    }
    return (`${u.firstname || ''} ${u.lastname || ''}`.trim() || '');
  };

  // Filtered list
  const filteredUsers = useMemo(() => {
    const rawList = userType === 'vendors' ? vendors : deliveryPartners;
    let list = Array.isArray(rawList) ? [...rawList] : [];

    // Ensure role integrity (no vendors on riders page, no riders on vendors page)
    if (userType === 'delivery_partners') {
      list = list.filter((u) => {
        const cid = String(u.custom_id || '').toUpperCase();
        return !cid.startsWith('VEN');
      });
    } else if (userType === 'vendors') {
      list = list.filter((u) => {
        const cid = String(u.custom_id || '').toUpperCase();
        return !cid.startsWith('RID');
      });
    }

    // Deduplicate records by unique identifier
    const seen = new Set();
    list = list.filter((u) => {
      const uid = u.custom_id || u.user_id || u.id || u.email;
      if (!uid) return true;
      if (seen.has(uid)) return false;
      seen.add(uid);
      return true;
    });

    // Filter strictly by search query (name, store name, email, phone, ID)
    const q = (search || debouncedSearch || '').trim().toLowerCase();
    if (q) {
      list = list.filter((u) => {
        const firstName = String(u.firstname || '').toLowerCase();
        const lastName = String(u.lastname || '').toLowerCase();
        const fullName = `${firstName} ${lastName}`.trim();
        const storeName = String(u.storename || u.store_name || '').toLowerCase();
        const email = String(u.email || '').toLowerCase();
        const phone = String(u.phonenumber || u.phone || u.mobile || '').toLowerCase();
        const customId = String(u.custom_id || u.user_id || u.id || '').toLowerCase();

        return (
          fullName.includes(q) ||
          firstName.includes(q) ||
          lastName.includes(q) ||
          storeName.includes(q) ||
          email.includes(q) ||
          phone.includes(q) ||
          customId.includes(q)
        );
      });
    }

    // Filter by status if selected
    if (statusFilter !== null && statusFilter !== undefined) {
      list = list.filter((u) => u.is_verified === statusFilter);
    }

    // Client-side alphabetical sorting guarantee
    if (sortOrder === 'a-z') {
      list = [...list].sort((a, b) =>
        getDisplayName(a, userType).localeCompare(getDisplayName(b, userType), undefined, { sensitivity: 'base' })
      );
    } else if (sortOrder === 'z-a') {
      list = [...list].sort((a, b) =>
        getDisplayName(b, userType).localeCompare(getDisplayName(a, userType), undefined, { sensitivity: 'base' })
      );
    }

    return list;
  }, [vendors, deliveryPartners, userType, search, debouncedSearch, statusFilter, sortOrder]);

  // Open view modal and set status to 'in review' (3)
  const handleView = async (user) => {
    setSelectedUser(user);
    setShowViewModal(true);
    setViewLoading(true);
    try {
      await verifyUser(user.user_id, 3);
      const updateStatus = (arr) => arr.map(u => u.user_id === user.user_id ? { ...u, is_verified: 3 } : u);
      if (userType === 'vendors') setVendors(updateStatus);
      else setDeliveryPartners(updateStatus);
    } catch (error) {
      console.error("Failed to set in-review status:", error);
    }
    setViewLoading(false);
  };

  // Approve (set status 1)
  const handleApprove = async () => {
    if (!selectedUser) return;
    setViewLoading(true);
    try {
      await verifyUser(selectedUser.user_id, 1);
      const updateStatus = (arr) => arr.map(u => u.user_id === selectedUser.user_id ? { ...u, is_verified: 1 } : u);
      if (userType === 'vendors') setVendors(updateStatus);
      else setDeliveryPartners(updateStatus);
      setShowViewModal(false);
      setSelectedUser(null);
    } catch (error) {
      console.error("Failed to approve user:", error);
    }
    setViewLoading(false);
  };

  // Reject (set status 2)
  const handleReject = async (user) => {
    if (!user) return;
    setViewLoading(true);
    try {
      await verifyUser(user.user_id, 2);
      const updateStatus = (arr) => arr.map(u => u.user_id === user.user_id ? { ...u, is_verified: 2 } : u);
      if (userType === 'vendors') setVendors(updateStatus);
      else setDeliveryPartners(updateStatus);
      setShowViewModal(false);
      setSelectedUser(null);
    } catch (error) {
      console.error("Failed to reject user:", error);
    }
    setViewLoading(false);
  };

  // Close modal
  const handleCloseModal = () => {
    setShowViewModal(false);
    setSelectedUser(null);
  };

  // Badge status
  const getBadgeStatus = (is_verified) => {
    switch (is_verified) {
      case 0: return { text: 'Pending', color: 'orange' };
      case 1: return { text: 'Verified', color: 'green' };
      case 2: return { text: 'Rejected', color: 'red' };
      case 3: return { text: 'In Review', color: 'blue' };
      default: return { text: 'Unknown', color: 'gray' };
    }
  };

  return {
    userType,
    setUserType,
    loading,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    sortOrder,
    setSortOrder,
    dateFilterType,
    setDateFilterType: handleDateFilterTypeChange,
    singleDate,
    setSingleDate: handleSingleDateChange,
    rangeDates,
    setRangeDates: handleRangeDatesChange,
    filteredUsers,
    showViewModal,
    selectedUser,
    handleView,
    handleApprove,
    handleReject,
    handleCloseModal,
    getBadgeStatus,
    viewLoading,
    fetchUsers,
    resetFilters,
  };
}
