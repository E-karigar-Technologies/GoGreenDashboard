import { useCallback, useEffect, useMemo, useState } from "react";
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
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState();

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

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAllUserDetails();
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
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const filteredData = useMemo(() => {
    let list = Array.isArray(data) ? [...data] : [];
    if (searchText && searchText.trim()) {
      const q = searchText.trim().toLowerCase();
      list = list.filter((u) => {
        const fullName = `${u.first_name || u.firstname || ""} ${u.last_name || u.lastname || ""}`
          .trim()
          .toLowerCase();
        const email = (u.email || "").toLowerCase();
        const phone = String(u.phone_number || u.phonenumber || u.phone || u.mobile || "");
        return (
          fullName.includes(q) ||
          email.includes(q) ||
          phone.includes(q) ||
          String(u.id || "").includes(q)
        );
      });
    }
    if (statusFilter !== undefined && statusFilter !== null && statusFilter !== "") {
      list = list.filter((u) => {
        const val = u.is_verified !== undefined ? u.is_verified : u.active;
        return Number(val) === Number(statusFilter);
      });
    }
    return list;
  }, [data, searchText, statusFilter]);

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
    const lat = selectedUser.customer_lat ?? selectedUser.lat ?? selectedUser.rider_lat ?? selectedUser.latitude;
    const lng = selectedUser.customer_lng ?? selectedUser.lng ?? selectedUser.rider_lng ?? selectedUser.longitude;
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

  const handleChangeStatus = useCallback(
    async (user, nextStatus) => {
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
            prev && prev.id === user.id ? { ...prev, is_verified: nextStatus, active: nextStatus } : prev
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
    },
    []
  );

  const handleApprove = (user) => handleChangeStatus(user, STATUS.ACTIVE);
  const handleReject = (user) => handleChangeStatus(user, STATUS.REJECTED);
  const handleDeactivate = (user) => handleChangeStatus(user, STATUS.INACTIVE);

  const resetFilters = () => {
    setSearchText("");
    setStatusFilter(undefined);
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

    refresh: fetchUsers,
    STATUS,
  };
}
