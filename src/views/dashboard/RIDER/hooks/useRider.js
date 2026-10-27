import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import { getAllRiders, updateRiderStatus, updateRiderDeactivateStatus } from '../../../../services/apiService';
import useDebounce from '../../../../hooks/useDebounce';

dayjs.extend(isBetween);

export default function useRider() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Initial values from URL search params
  const urlSearch =
    searchParams.get('search') ||
    searchParams.get('name') ||
    searchParams.get('email') ||
    searchParams.get('phone') ||
    searchParams.get('vehicle_number') ||
    searchParams.get('license') ||
    '';

  let urlSearchType = 'search';
  if (searchParams.get('name')) urlSearchType = 'name';
  else if (searchParams.get('email')) urlSearchType = 'email';
  else if (searchParams.get('phone')) urlSearchType = 'phone';
  else if (searchParams.get('vehicle_number')) urlSearchType = 'vehicle_number';
  else if (searchParams.get('license')) urlSearchType = 'license';

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
  const urlDeactivateStatus = searchParams.get('deactivate_status') || 'all';
  const urlSort =
    searchParams.get('sort') ||
    (searchParams.get('sortBy') === 'name' && searchParams.get('order') === 'ASC' ? 'a-z' : 'newest');

  // Filter states
  const [searchInput, setSearchInput] = useState(urlSearch);
  const [searchType, setSearchType] = useState(urlSearchType);
  const debouncedSearch = useDebounce(searchInput, 400);

  const [dateType, setDateType] = useState(initDateType);
  const [rangeDates, setRangeDates] = useState(initRangeDates);

  const [status, setStatus] = useState(urlStatus);
  const [deactivateStatus, setDeactivateStatus] = useState(urlDeactivateStatus);
  const [sort, setSort] = useState(urlSort);

  // Pagination states
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Data states
  const [allRiders, setAllRiders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Synchronize URL search params
  const updateUrlParams = useCallback(
    (params) => {
      const p = new URLSearchParams();
      if (params.search) {
        if (params.searchType === 'name') p.set('name', params.search);
        else if (params.searchType === 'email') p.set('email', params.search);
        else if (params.searchType === 'phone') p.set('phone', params.search);
        else if (params.searchType === 'vehicle_number') p.set('vehicle_number', params.search);
        else if (params.searchType === 'license') p.set('license', params.search);
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
      }
      if (params.deactivateStatus && params.deactivateStatus !== 'all') {
        p.set('deactivate_status', params.deactivateStatus);
      }
      if (params.sort && params.sort !== 'newest') {
        p.set('sort', params.sort);
        if (params.sort === 'a-z') {
          p.set('sortBy', 'name');
          p.set('order', 'ASC');
        } else if (params.sort === 'z-a') {
          p.set('sortBy', 'name');
          p.set('order', 'DESC');
        }
      }
      setSearchParams(p, { replace: true });
    },
    [setSearchParams]
  );

  // Load riders with API query params
  const fetchRiders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const apiParams = {};

      if (debouncedSearch.trim()) {
        if (searchType === 'name') apiParams.name = debouncedSearch.trim();
        else if (searchType === 'email') apiParams.email = debouncedSearch.trim();
        else if (searchType === 'phone') apiParams.phone = debouncedSearch.trim();
        else if (searchType === 'vehicle_number') apiParams.vehicle_number = debouncedSearch.trim();
        else if (searchType === 'license') apiParams.license = debouncedSearch.trim();
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
      } else if (status === '0') {
        apiParams.status = 0;
      }

      if (deactivateStatus === '1') {
        apiParams.deactivate_status = 1;
      } else if (deactivateStatus === '0') {
        apiParams.deactivate_status = 0;
      }

      if (sort === 'a-z') {
        apiParams.sort = 'a-z';
        apiParams.sortBy = 'name';
        apiParams.order = 'ASC';
      } else if (sort === 'z-a') {
        apiParams.sort = 'z-a';
        apiParams.sortBy = 'name';
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
        deactivateStatus,
        sort,
      });

      const res = await getAllRiders(apiParams);
      if (res && res.success === false) {
        setError(res.message || 'Failed to fetch riders');
        setAllRiders([]);
      } else {
        const riderList = res?.data || res?.riders || (Array.isArray(res) ? res : []);
        setAllRiders(riderList);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch riders');
      setAllRiders([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, searchType, dateType, rangeDates, status, deactivateStatus, sort, updateUrlParams]);

  useEffect(() => {
    fetchRiders();
  }, [fetchRiders]);

  // Client-side verification / fallback filtering & sorting
  const processedRiders = useMemo(() => {
    let list = [...allRiders];

    // Client-side fallback search filter if server returns full list
    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase().trim();
      list = list.filter((r) => {
        const name = `${r.firstname || ''} ${r.lastname || ''}`.toLowerCase();
        const email = (r.email || '').toLowerCase();
        const phone = (r.phonenumber || '').toLowerCase();
        const customId = (r.custom_id || '').toLowerCase();
        const vehiclePlate = (r.vehicle_registration_number || '').toLowerCase();
        const license = (r.license_number || '').toLowerCase();

        if (searchType === 'name') return name.includes(q);
        if (searchType === 'email') return email.includes(q);
        if (searchType === 'phone') return phone.includes(q);
        if (searchType === 'vehicle_number') return vehiclePlate.includes(q);
        if (searchType === 'license') return license.includes(q);
        return (
          name.includes(q) ||
          email.includes(q) ||
          phone.includes(q) ||
          customId.includes(q) ||
          vehiclePlate.includes(q) ||
          license.includes(q)
        );
      });
    }

    // Client-side fallback date filter
    if (dateType === 'range' && rangeDates?.[0] && rangeDates?.[1]) {
      const start = dayjs(rangeDates[0]).startOf('day');
      const end = dayjs(rangeDates[1]).endOf('day');
      list = list.filter((r) => {
        const d = r.created_at || r.createdAt || r.date;
        if (!d) return true;
        const rDate = dayjs(d);
        return rDate.isAfter(start) && rDate.isBefore(end);
      });
    } else if (dateType && dateType !== 'all') {
      const now = dayjs();
      if (dateType === 'today') {
        list = list.filter((r) => {
          const d = r.created_at || r.createdAt || r.date;
          if (!d) return true;
          return dayjs(d).isSame(now, 'day');
        });
      } else if (dateType === 'yesterday') {
        const yest = now.subtract(1, 'day');
        list = list.filter((r) => {
          const d = r.created_at || r.createdAt || r.date;
          if (!d) return true;
          return dayjs(d).isSame(yest, 'day');
        });
      } else if (dateType === 'this_month' || dateType === 'month') {
        list = list.filter((r) => {
          const d = r.created_at || r.createdAt || r.date;
          if (!d) return true;
          return dayjs(d).isSame(now, 'month');
        });
      } else if (dateType === 'this_week' || dateType === 'week') {
        list = list.filter((r) => {
          const d = r.created_at || r.createdAt || r.date;
          if (!d) return true;
          return dayjs(d).isSame(now, 'week');
        });
      }
    }

    // Client-side fallback status filter
    if (status === '1') {
      list = list.filter((r) => r.status === 1);
    } else if (status === '0') {
      list = list.filter((r) => r.status !== 1);
    }

    // Client-side fallback deactivate / block status filter
    if (deactivateStatus === '1') {
      list = list.filter((r) => r.deactivate_status === 1);
    } else if (deactivateStatus === '0') {
      list = list.filter((r) => r.deactivate_status !== 1);
    }

    // Client-side fallback sorting
    if (sort === 'a-z') {
      list.sort((a, b) => {
        const nameA = `${a.firstname || ''} ${a.lastname || ''}`.trim();
        const nameB = `${b.firstname || ''} ${b.lastname || ''}`.trim();
        return nameA.localeCompare(nameB);
      });
    } else if (sort === 'z-a') {
      list.sort((a, b) => {
        const nameA = `${a.firstname || ''} ${a.lastname || ''}`.trim();
        const nameB = `${b.firstname || ''} ${b.lastname || ''}`.trim();
        return nameB.localeCompare(nameA);
      });
    } else if (sort === 'newest') {
      list.sort((a, b) => (b.rider_id || b.user_id || b.id || 0) - (a.rider_id || a.user_id || a.id || 0));
    } else if (sort === 'oldest') {
      list.sort((a, b) => (a.rider_id || a.user_id || a.id || 0) - (b.rider_id || b.user_id || b.id || 0));
    }

    return list;
  }, [allRiders, debouncedSearch, searchType, dateType, rangeDates, status, deactivateStatus, sort]);

  // Total matching riders
  const total = processedRiders.length;

  // Paginated slice
  const paginatedRiders = useMemo(() => {
    const start = (page - 1) * pageSize;
    return processedRiders.slice(start, start + pageSize);
  }, [processedRiders, page, pageSize]);

  // Toggle rider status (active/online vs inactive/offline)
  const handleToggleStatus = async (riderId, newStatus) => {
    try {
      const res = await updateRiderStatus(riderId, newStatus);
      if (res && res.success !== false) {
        setAllRiders((prev) =>
          prev.map((r) =>
            r.rider_id === riderId || r.user_id === riderId ? { ...r, status: newStatus } : r
          )
        );
        return { success: true, data: res.data };
      } else {
        const errorMsg = res?.error?.message || res?.error || 'Failed to update rider status';
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (err) {
      const errorMsg = err.message || 'Failed to update rider status';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  // Toggle rider deactivate / block status (using deactivate_status and remark)
  const handleToggleDeactivateStatus = async (riderId, deactivateStatusVal, remark = '') => {
    try {
      const res = await updateRiderDeactivateStatus(riderId, deactivateStatusVal, remark);
      if (res && res.success !== false) {
        setAllRiders((prev) =>
          prev.map((r) =>
            r.rider_id === riderId || r.user_id === riderId
              ? { ...r, deactivate_status: deactivateStatusVal, deactivate_remark: remark, remark }
              : r
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
    setDeactivateStatus('all');
    setSort('newest');
    setPage(1);
  };

  const onPageChange = (newPage, newPageSize) => {
    setPage(newPage);
    setPageSize(newPageSize);
  };

  return {
    riders: paginatedRiders,
    vendors: paginatedRiders, // Alias for backward compatibility
    allRiders,
    allVendors: allRiders, // Alias
    loading,
    error,
    total,
    page,
    pageSize,
    onPageChange,
    handleToggleStatus,
    handleToggleDeactivateStatus,
    refetch: fetchRiders,
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
    deactivateStatus,
    setDeactivateStatus,
    sort,
    setSort,
    resetFilters,
  };
}
