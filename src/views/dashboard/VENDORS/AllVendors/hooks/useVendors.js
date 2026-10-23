import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import { getAllVendors, updateVendorStatus, updateVendorDeactivateStatus } from '../../../../../services/apiService';
import useDebounce from '../../../../../hooks/useDebounce';

dayjs.extend(isBetween);

export default function useVendors() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Initial values from URL search params
  const urlSearch =
    searchParams.get('search') ||
    searchParams.get('store_name') ||
    searchParams.get('email') ||
    searchParams.get('phone') ||
    '';

  let urlSearchType = 'search';
  if (searchParams.get('store_name')) urlSearchType = 'store_name';
  else if (searchParams.get('email')) urlSearchType = 'email';
  else if (searchParams.get('phone')) urlSearchType = 'phone';

  const urlDate = searchParams.get('date');
  const urlStartDate = searchParams.get('startDate');
  const urlEndDate = searchParams.get('endDate');

  let initDateType = 'all';
  let initRangeDates = null;
  if (urlStartDate && urlEndDate) {
    initDateType = 'range';
    initRangeDates = [dayjs(urlStartDate), dayjs(urlEndDate)];
  } else if (urlDate) {
    initDateType = urlDate;
  }

  const urlStatus = searchParams.get('status') || (searchParams.get('filter') === 'active' ? '1' : 'all');
  const urlSort =
    searchParams.get('sort') ||
    (searchParams.get('sortBy') === 'store_name' && searchParams.get('order') === 'ASC' ? 'a-z' : 'newest');

  // Filter states
  const [searchInput, setSearchInput] = useState(urlSearch);
  const [searchType, setSearchType] = useState(urlSearchType);
  const debouncedSearch = useDebounce(searchInput, 400);

  const [dateType, setDateType] = useState(initDateType);
  const [rangeDates, setRangeDates] = useState(initRangeDates);

  const [status, setStatus] = useState(urlStatus);
  const [sort, setSort] = useState(urlSort);

  // Pagination states
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Data states
  const [allVendors, setAllVendors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Synchronize URL search params
  const updateUrlParams = useCallback(
    (params) => {
      const p = new URLSearchParams();
      if (params.search) {
        if (params.searchType === 'store_name') p.set('store_name', params.search);
        else if (params.searchType === 'email') p.set('email', params.search);
        else if (params.searchType === 'phone') p.set('phone', params.search);
        else p.set('search', params.search);
      }
      if (params.dateType === 'range' && params.rangeDates?.[0] && params.rangeDates?.[1]) {
        p.set('startDate', dayjs(params.rangeDates[0]).format('YYYY-MM-DD'));
        p.set('endDate', dayjs(params.rangeDates[1]).format('YYYY-MM-DD'));
      } else if (params.dateType && params.dateType !== 'all') {
        p.set('date', params.dateType);
      }
      if (params.status && params.status !== 'all') {
        p.set('status', params.status);
        if (params.status === '1') p.set('filter', 'active');
      }
      if (params.sort && params.sort !== 'newest') {
        p.set('sort', params.sort);
        if (params.sort === 'a-z') {
          p.set('sortBy', 'store_name');
          p.set('order', 'ASC');
        } else if (params.sort === 'z-a') {
          p.set('sortBy', 'store_name');
          p.set('order', 'DESC');
        }
      }
      setSearchParams(p, { replace: true });
    },
    [setSearchParams]
  );

  // Load vendors with API query params
  const fetchVendors = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const apiParams = {};

      if (debouncedSearch.trim()) {
        if (searchType === 'store_name') apiParams.store_name = debouncedSearch.trim();
        else if (searchType === 'email') apiParams.email = debouncedSearch.trim();
        else if (searchType === 'phone') apiParams.phone = debouncedSearch.trim();
        else apiParams.search = debouncedSearch.trim();
      }

      if (dateType === 'range' && rangeDates?.[0] && rangeDates?.[1]) {
        apiParams.startDate = dayjs(rangeDates[0]).format('YYYY-MM-DD');
        apiParams.endDate = dayjs(rangeDates[1]).format('YYYY-MM-DD');
      } else if (dateType && dateType !== 'all') {
        apiParams.date = dateType;
      }

      if (status === '1') {
        apiParams.status = 1;
        apiParams.filter = 'active';
      } else if (status === '0') {
        apiParams.status = 0;
      }

      if (sort === 'a-z') {
        apiParams.sort = 'a-z';
        apiParams.sortBy = 'store_name';
        apiParams.order = 'ASC';
      } else if (sort === 'z-a') {
        apiParams.sort = 'z-a';
        apiParams.sortBy = 'store_name';
        apiParams.order = 'DESC';
      } else if (sort === 'newest') {
        apiParams.sort = 'newest';
      } else if (sort === 'oldest') {
        apiParams.sort = 'oldest';
      }

      // Update URL
      updateUrlParams({
        search: debouncedSearch.trim(),
        searchType,
        dateType,
        rangeDates,
        status,
        sort,
      });

      const res = await getAllVendors(apiParams);
      if (res && res.success === false) {
        setError(res.message || 'Failed to fetch vendors');
        setAllVendors([]);
      } else {
        const vendorList = res?.data || res?.vendors || (Array.isArray(res) ? res : []);
        setAllVendors(vendorList);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch vendors');
      setAllVendors([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, searchType, dateType, rangeDates, status, sort, updateUrlParams]);

  useEffect(() => {
    fetchVendors();
  }, [fetchVendors]);

  // Client-side verification / fallback filtering & sorting
  const processedVendors = useMemo(() => {
    let list = [...allVendors];

    // Client-side fallback search filter if server returns full list
    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase().trim();
      list = list.filter((v) => {
        const store = (v.store_name || '').toLowerCase();
        const email = (v.email || '').toLowerCase();
        const phone = (v.phonenumber || '').toLowerCase();
        const customId = (v.custom_id || '').toLowerCase();
        const owner = `${v.firstname || ''} ${v.lastname || ''}`.toLowerCase();

        if (searchType === 'store_name') return store.includes(q);
        if (searchType === 'email') return email.includes(q);
        if (searchType === 'phone') return phone.includes(q);
        return (
          store.includes(q) ||
          email.includes(q) ||
          phone.includes(q) ||
          customId.includes(q) ||
          owner.includes(q)
        );
      });
    }

    // Client-side fallback date filter
    if (dateType === 'range' && rangeDates?.[0] && rangeDates?.[1]) {
      const start = dayjs(rangeDates[0]).startOf('day');
      const end = dayjs(rangeDates[1]).endOf('day');
      list = list.filter((v) => {
        const d = v.created_at || v.createdAt || v.date;
        if (!d) return true;
        const vDate = dayjs(d);
        return vDate.isAfter(start) && vDate.isBefore(end);
      });
    } else if (dateType && dateType !== 'all') {
      const now = dayjs();
      if (dateType === 'today') {
        list = list.filter((v) => {
          const d = v.created_at || v.createdAt || v.date;
          if (!d) return true;
          return dayjs(d).isSame(now, 'day');
        });
      } else if (dateType === 'yesterday') {
        const yest = now.subtract(1, 'day');
        list = list.filter((v) => {
          const d = v.created_at || v.createdAt || v.date;
          if (!d) return true;
          return dayjs(d).isSame(yest, 'day');
        });
      } else if (dateType === 'this_month' || dateType === 'month') {
        list = list.filter((v) => {
          const d = v.created_at || v.createdAt || v.date;
          if (!d) return true;
          return dayjs(d).isSame(now, 'month');
        });
      } else if (dateType === 'this_week' || dateType === 'week') {
        list = list.filter((v) => {
          const d = v.created_at || v.createdAt || v.date;
          if (!d) return true;
          return dayjs(d).isSame(now, 'week');
        });
      }
    }

    // Client-side fallback status filter
    if (status === '1') {
      list = list.filter((v) => v.status === 1);
    } else if (status === '0') {
      list = list.filter((v) => v.status !== 1);
    }

    // Client-side fallback sorting
    if (sort === 'a-z') {
      list.sort((a, b) => (a.store_name || '').localeCompare(b.store_name || ''));
    } else if (sort === 'z-a') {
      list.sort((a, b) => (b.store_name || '').localeCompare(a.store_name || ''));
    } else if (sort === 'newest') {
      list.sort((a, b) => (b.vendor_id || b.id || 0) - (a.vendor_id || a.id || 0));
    } else if (sort === 'oldest') {
      list.sort((a, b) => (a.vendor_id || a.id || 0) - (b.vendor_id || b.id || 0));
    }

    return list;
  }, [allVendors, debouncedSearch, searchType, dateType, rangeDates, status, sort]);

  // Total matching vendors
  const total = processedVendors.length;

  // Paginated slice
  const paginatedVendors = useMemo(() => {
    const start = (page - 1) * pageSize;
    return processedVendors.slice(start, start + pageSize);
  }, [processedVendors, page, pageSize]);

  // Toggle vendor status
  const handleToggleStatus = async (vendorId, newStatus, extra = {}) => {
    try {
      const res = await updateVendorStatus(vendorId, newStatus, extra);
      if (res && res.success !== false) {
        setAllVendors((prev) =>
          prev.map((v) =>
            v.vendor_id === vendorId || v.user_id === vendorId ? { ...v, status: newStatus } : v
          )
        );
        return { success: true, data: res.data };
      } else {
        const errorMsg = res?.error?.message || res?.error || 'Failed to update vendor status';
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (err) {
      const errorMsg = err.message || 'Failed to update vendor status';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  // Toggle vendor deactivate / block status (using deactivate_status and remark)
  const handleToggleDeactivateStatus = async (vendorId, deactivateStatus, remark = '') => {
    try {
      const res = await updateVendorDeactivateStatus(vendorId, deactivateStatus, remark);
      if (res && res.success !== false) {
        setAllVendors((prev) =>
          prev.map((v) =>
            v.vendor_id === vendorId || v.user_id === vendorId
              ? { ...v, deactivate_status: deactivateStatus, remark }
              : v
          )
        );
        return { success: true, data: res.data };
      } else {
        const errorMsg = res?.error?.message || res?.error || 'Failed to update deactivate status';
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (err) {
      const errorMsg = err.message || 'Failed to update deactivate status';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  // Reset all filters
  const resetFilters = () => {
    setSearchInput('');
    setSearchType('search');
    setDateType('all');
    setRangeDates(null);
    setStatus('all');
    setSort('newest');
    setPage(1);
  };

  const onPageChange = (newPage, newPageSize) => {
    setPage(newPage);
    setPageSize(newPageSize);
  };

  return {
    vendors: paginatedVendors,
    allVendors,
    loading,
    error,
    total,
    page,
    pageSize,
    onPageChange,
    handleToggleStatus,
    handleToggleDeactivateStatus,
    refetch: fetchVendors,
    // Filters
    searchInput,
    setSearchInput,
    searchType,
    setSearchType,
    dateType,
    setDateType,
    rangeDates,
    setRangeDates,
    status,
    setStatus,
    sort,
    setSort,
    resetFilters,
  };
}
