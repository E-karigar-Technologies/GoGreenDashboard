import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import dayjs from "dayjs";
import { message } from "antd";
import {
  getAllUserDetails,
  updateUserActiveStatus,
  reverseGeocode,
} from "../../../../services/apiService";

const STATUS = {
  INACTIVE: 0,
  ACTIVE: 1,
  REJECTED: 2,
};

export default function useCustomers() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Initialize filters from URL searchParams
  const initSort = searchParams.get("sort") || "";
  const initSearch = searchParams.get("search") || "";
  const initDate = searchParams.get("date") || "";
  const initStartDate = searchParams.get("startDate") || "";
  const initEndDate = searchParams.get("endDate") || "";

  let initDateType = "all";
  let initSingleDate = null;
  let initRangeDates = null;

  if (initStartDate && initEndDate) {
    initDateType = "range";
    initRangeDates = [dayjs(initStartDate), dayjs(initEndDate)];
  } else if (initDate === "today" || initDate === "yesterday" || initDate === "month") {
    initDateType = initDate;
  } else if (initDate) {
    initDateType = "single";
    initSingleDate = dayjs(initDate);
  }

  // Filter states
  const [searchText, setSearchText] = useState(initSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(initSearch);
  const [statusFilter, setStatusFilter] = useState();
  const [sortOrder, setSortOrder] = useState(initSort); // 'a-z' | 'z-a' | ''

  const [dateFilterType, setDateFilterType] = useState(initDateType); // 'all' | 'today' | 'yesterday' | 'month' | 'single' | 'range'
  const [singleDate, setSingleDate] = useState(initSingleDate);
  const [rangeDates, setRangeDates] = useState(initRangeDates);

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
    showSizeChanger: true,
  });

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const [resolvedAddress, setResolvedAddress] = useState("");
  const [addressLoading, setAddressLoading] = useState(false);
  const [addressError, setAddressError] = useState(null);

  // Cache key to prevent duplicate API triggers
  const lastFetchedParamsRef = useRef(null);

  // Debounce search text input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch((prev) => {
        const nextVal = (searchText || "").trim();
        return prev === nextVal ? prev : nextVal;
      });
    }, 450);
    return () => clearTimeout(timer);
  }, [searchText]);

  // Core API fetcher
  const fetchUsers = useCallback(
    async (customParams, force = false) => {
      let params = customParams;
      if (!params) {
        params = {};
        if (sortOrder === "a-z" || sortOrder === "z-a") {
          params.sort = sortOrder;
        }
        if (debouncedSearch) {
          params.search = debouncedSearch;
        }
        if (dateFilterType === "today") {
          params.date = "today";
        } else if (dateFilterType === "yesterday") {
          params.date = "yesterday";
        } else if (dateFilterType === "month") {
          params.date = "month";
        } else if (dateFilterType === "single" && singleDate) {
          params.date = dayjs(singleDate).format("YYYY-MM-DD");
        } else if (dateFilterType === "range" && rangeDates?.[0] && rangeDates?.[1]) {
          params.startDate = dayjs(rangeDates[0]).format("YYYY-MM-DD");
          params.endDate = dayjs(rangeDates[1]).format("YYYY-MM-DD");
        }
      }

      const cacheKey = JSON.stringify(params);
      if (!force && lastFetchedParamsRef.current === cacheKey) {
        return;
      }
      lastFetchedParamsRef.current = cacheKey;

      setLoading(true);
      setError(null);
      try {
        const res = await getAllUserDetails(params);
        if (res.success) {
          setData(res.data || []);
        } else {
          setData([]);
          setError(res.error || "Failed to fetch users");
        }
      } catch (e) {
        setError(e.message || "Failed to fetch users");
      } finally {
        setLoading(false);
      }
    },
    [sortOrder, debouncedSearch, dateFilterType, singleDate, rangeDates]
  );

  // Sync state to URL searchParams and query API when filters change
  useEffect(() => {
    const params = {};
    const newSearchParams = new URLSearchParams();

    if (sortOrder === "a-z" || sortOrder === "z-a") {
      params.sort = sortOrder;
      newSearchParams.set("sort", sortOrder);
    }

    if (debouncedSearch) {
      params.search = debouncedSearch;
      newSearchParams.set("search", debouncedSearch);
    }

    if (dateFilterType === "today") {
      params.date = "today";
      newSearchParams.set("date", "today");
    } else if (dateFilterType === "yesterday") {
      params.date = "yesterday";
      newSearchParams.set("date", "yesterday");
    } else if (dateFilterType === "month") {
      params.date = "month";
      newSearchParams.set("date", "month");
    } else if (dateFilterType === "single" && singleDate) {
      const dStr = dayjs(singleDate).format("YYYY-MM-DD");
      params.date = dStr;
      newSearchParams.set("date", dStr);
    } else if (dateFilterType === "range" && rangeDates?.[0] && rangeDates?.[1]) {
      const sStr = dayjs(rangeDates[0]).format("YYYY-MM-DD");
      const eStr = dayjs(rangeDates[1]).format("YYYY-MM-DD");
      params.startDate = sStr;
      params.endDate = eStr;
      newSearchParams.set("startDate", sStr);
      newSearchParams.set("endDate", eStr);
    }

    if (newSearchParams.toString() !== searchParams.toString()) {
      setSearchParams(newSearchParams, { replace: true });
    }

    fetchUsers(params);
  }, [sortOrder, debouncedSearch, dateFilterType, singleDate, rangeDates]);

  // Date handlers
  const handleDateFilterTypeChange = (type) => {
    setDateFilterType(type);
    if (type === "today" || type === "yesterday" || type === "month" || type === "all") {
      setSingleDate(null);
      setRangeDates(null);
    } else if (type === "single") {
      if (!singleDate) setSingleDate(dayjs());
      setRangeDates(null);
    } else if (type === "range") {
      if (!rangeDates) setRangeDates([dayjs().subtract(7, "day"), dayjs()]);
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

  // Filtered & sorted data
  const filteredData = useMemo(() => {
    let list = Array.isArray(data) ? [...data] : [];

    // Deduplicate records by unique id
    const seen = new Set();
    list = list.filter((u) => {
      const uid = u.id || u.user_id || u._id || u.email;
      if (!uid) return true;
      if (seen.has(uid)) return false;
      seen.add(uid);
      return true;
    });

    // Client-side search matching for instant response
    const q = (searchText || debouncedSearch || "").trim().toLowerCase();
    if (q) {
      list = list.filter((u) => {
        const firstName = String(u.first_name || u.firstname || "").toLowerCase();
        const lastName = String(u.last_name || u.lastname || "").toLowerCase();
        const fullName = `${firstName} ${lastName}`.trim();
        const email = String(u.email || "").toLowerCase();
        const phone = String(u.phone_number || u.phonenumber || u.phone || u.mobile || "");
        const uid = String(u.id || u.user_id || "");

        return (
          fullName.includes(q) ||
          firstName.includes(q) ||
          lastName.includes(q) ||
          email.includes(q) ||
          phone.includes(q) ||
          uid.includes(q)
        );
      });
    }

    // Status filter
    if (statusFilter !== undefined && statusFilter !== null && statusFilter !== "") {
      list = list.filter((u) => {
        const val = u.is_verified !== undefined ? u.is_verified : u.active;
        return Number(val) === Number(statusFilter);
      });
    }

    // Sort order guarantee
    if (sortOrder === "a-z") {
      list = [...list].sort((a, b) => {
        const nameA = `${a.first_name || a.firstname || ""} ${a.last_name || a.lastname || ""}`
          .trim()
          .toLowerCase();
        const nameB = `${b.first_name || b.firstname || ""} ${b.last_name || b.lastname || ""}`
          .trim()
          .toLowerCase();
        return nameA.localeCompare(nameB, undefined, { sensitivity: "base" });
      });
    } else if (sortOrder === "z-a") {
      list = [...list].sort((a, b) => {
        const nameA = `${a.first_name || a.firstname || ""} ${a.last_name || a.lastname || ""}`
          .trim()
          .toLowerCase();
        const nameB = `${b.first_name || b.firstname || ""} ${b.last_name || b.lastname || ""}`
          .trim()
          .toLowerCase();
        return nameB.localeCompare(nameA, undefined, { sensitivity: "base" });
      });
    } else {
      // Default: latest first
      list.sort((a, b) => {
        const dateA = new Date(a.created_at || a.createdAt || a.created_on || 0).getTime();
        const dateB = new Date(b.created_at || b.createdAt || b.created_on || 0).getTime();
        if (dateA && dateB && !isNaN(dateA) && !isNaN(dateB) && dateA !== dateB) {
          return dateB - dateA;
        }
        const idA = Number(a.id || a.user_id || 0);
        const idB = Number(b.id || b.user_id || 0);
        return idB - idA;
      });
    }

    return list;
  }, [data, searchText, debouncedSearch, statusFilter, sortOrder]);

  useEffect(() => {
    setPagination((p) => ({ ...p, total: filteredData.length, current: 1 }));
  }, [filteredData.length]);

  const onTableChange = (newPagination) => {
    setPagination((p) => ({
      ...p,
      current: newPagination.current,
      pageSize: newPagination.pageSize,
    }));
  };

  const openDrawer = (user) => {
    setSelectedUser(user);
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setSelectedUser(null);
    setResolvedAddress("");
    setAddressError(null);
  };

  useEffect(() => {
    if (!drawerOpen || !selectedUser) return;
    const lat =
      selectedUser.customer_lat ??
      selectedUser.lat ??
      selectedUser.rider_lat ??
      selectedUser.latitude;
    const lng =
      selectedUser.customer_lng ??
      selectedUser.lng ??
      selectedUser.rider_lng ??
      selectedUser.longitude;
    if (lat == null || lng == null || lat === "" || lng === "") {
      setResolvedAddress("");
      setAddressError(null);
      return;
    }
    let cancelled = false;
    (async () => {
      setAddressLoading(true);
      setAddressError(null);
      const res = await reverseGeocode(lat, lng);
      if (cancelled) return;
      if (res.success) {
        setResolvedAddress(res.displayName || "");
      } else {
        setResolvedAddress("");
        setAddressError(
          (res.error && (res.error.message || res.error)) ||
            "Could not resolve location"
        );
      }
      setAddressLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [drawerOpen, selectedUser]);

  const handleChangeStatus = useCallback(async (user, nextStatus) => {
    if (!user || user.id == null) return;
    setActionLoadingId(user.id);
    try {
      const res = await updateUserActiveStatus(user.id, nextStatus);
      if (res.success) {
        setData((prev) =>
          prev.map((u) =>
            u.id === user.id ? { ...u, is_verified: nextStatus, active: nextStatus } : u
          )
        );
        setSelectedUser((prev) =>
          prev && prev.id === user.id
            ? { ...prev, is_verified: nextStatus, active: nextStatus }
            : prev
        );
        const labelMap = {
          [STATUS.ACTIVE]: "approved",
          [STATUS.REJECTED]: "rejected",
          [STATUS.INACTIVE]: "marked inactive",
        };
        message.success(`User ${labelMap[nextStatus] || "updated"} successfully`);
      } else {
        message.error(
          (res.error && (res.error.message || res.error)) ||
            "Failed to update user status"
        );
      }
    } catch (e) {
      message.error(e.message || "Failed to update user status");
    } finally {
      setActionLoadingId(null);
    }
  }, []);

  const handleApprove = (user) => handleChangeStatus(user, STATUS.ACTIVE);
  const handleReject = (user) => handleChangeStatus(user, STATUS.REJECTED);
  const handleDeactivate = (user) => handleChangeStatus(user, STATUS.INACTIVE);

  const resetFilters = () => {
    setSearchText("");
    setDebouncedSearch("");
    setStatusFilter(undefined);
    setSortOrder("");
    setDateFilterType("all");
    setSingleDate(null);
    setRangeDates(null);
    setSearchParams(new URLSearchParams(), { replace: true });
    lastFetchedParamsRef.current = null;
    fetchUsers({}, true);
  };

  return {
    data: filteredData,
    rawData: data,
    loading,
    error,
    pagination,
    onTableChange,

    searchText,
    setSearchText,
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
    resetFilters,

    drawerOpen,
    selectedUser,
    openDrawer,
    closeDrawer,

    resolvedAddress,
    addressLoading,
    addressError,

    actionLoadingId,
    handleApprove,
    handleReject,
    handleDeactivate,

    refresh: (force = true) => fetchUsers(null, force),
    STATUS,
  };
}
