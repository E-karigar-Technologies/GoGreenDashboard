import React, { useState, useEffect } from "react";
import { Table, Button, Input, Space, Tag, Tooltip } from "antd";
import {
  SearchOutlined,
  SafetyCertificateOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  EyeOutlined,
  CloseCircleOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";
import useUnverifiedUsers from "./unverifieduserhook";
import UserPreview from "./components/UserPreview";
import MapDrawer from "./customers/components/MapDrawer";
import { formatPhone } from "../../services/utils/gen_utility";
import { reverseGeocode } from "../../services/apiService";

const UnverifiedUsers = ({ user = "vendors" }) => {
  const {
    userType,
    setUserType,
    loading,
    search,
    setSearch,
    filteredUsers,
    showViewModal,
    selectedUser,
    handleView,
    handleApprove,
    handleReject,
    handleCloseModal,
    getBadgeStatus,
    viewLoading,
  } = useUnverifiedUsers(user);

  const [mapUser, setMapUser] = useState(null);
  const [mapOpen, setMapOpen] = useState(false);
  const [resolvedAddress, setResolvedAddress] = useState("");
  const [addressLoading, setAddressLoading] = useState(false);
  const [addressError, setAddressError] = useState(null);

  const handleOpenMap = (u) => {
    setMapUser(u);
    setMapOpen(true);
  };

  const handleCloseMap = () => {
    setMapOpen(false);
    setMapUser(null);
    setResolvedAddress("");
    setAddressError(null);
  };

  useEffect(() => {
    if (!mapOpen || !mapUser) return;
    const lat = mapUser.vendor_lat ?? mapUser.lat ?? mapUser.store_lat ?? mapUser.customer_lat ?? mapUser.rider_lat;
    const lng = mapUser.vendor_lng ?? mapUser.lng ?? mapUser.store_lng ?? mapUser.customer_lng ?? mapUser.rider_lng;
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
          (res.error && (res.error.message || res.error)) || "Could not resolve location"
        );
      }
      setAddressLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [mapOpen, mapUser]);

  const pendingCount = (filteredUsers || []).filter(u => u.is_verified !== 1).length;
  const verifiedCount = (filteredUsers || []).filter(u => u.is_verified === 1).length;

  const columns = [
    {
      title: userType === "vendors" ? "Vendor / Store Details" : "Rider Details",
      dataIndex: "name",
      key: "name",
      width: 360,
      render: (_, u) => {
        const displayId = u.custom_id || u.user_id || u.id || "N/A";
        const titleText = userType === "vendors"
          ? u.storename || u.store_name || `${u.firstname || ''} ${u.lastname || ''}`.trim()
          : `${u.firstname || ''} ${u.lastname || ''}`.trim() || 'Unnamed Applicant';

        const storeAddress = userType === "vendors"
          ? (u.store_address || u.storeaddress || u.address || "No store address provided")
          : (u.address || "No address provided");

        const lat = u.vendor_lat ?? u.lat ?? u.store_lat ?? u.customer_lat ?? u.rider_lat;
        const lng = u.vendor_lng ?? u.lng ?? u.store_lng ?? u.customer_lng ?? u.rider_lng;
        const hasCoords = lat !== null && lat !== undefined && lat !== "" && lng !== null && lng !== "";

        const startTime = u.vendor_start_time || u.start_time;
        const closeTime = u.vendor_close_time || u.close_time;

        return (
          <div style={{ padding: "4px 0" }}>
            {/* Custom ID tag above store name */}
            <div style={{ marginBottom: 4 }}>
              <Tag style={{
                background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)",
                color: "#088b46",
                border: "1px solid #bbf7d0",
                borderRadius: "6px",
                fontWeight: 700,
                fontSize: "11px",
                padding: "1px 8px",
                letterSpacing: "0.3px",
                display: "inline-block",
                boxShadow: "0 1px 2px rgba(8, 139, 70, 0.05)"
              }}>
                #{displayId}
              </Tag>
            </div>

            {/* Store Name / Rider Name */}
            <div style={{ fontWeight: 700, color: "#0f172a", fontSize: "15px", letterSpacing: "-0.2px", lineHeight: 1.3 }}>
              {titleText}
            </div>

            {/* Address with Tooltip (truncation) & View Map Pill Button */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4, flexWrap: "wrap" }}>
              <Tooltip title={storeAddress} placement="top">
                <span style={{
                  fontSize: "12.5px",
                  color: "#64748b",
                  maxWidth: "240px",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  display: "inline-block",
                  verticalAlign: "middle"
                }}>
                  📍 {storeAddress}
                </span>
              </Tooltip>

              {hasCoords && (
                <Button
                  type="link"
                  size="small"
                  icon={<EnvironmentOutlined />}
                  style={{
                    padding: "0 8px",
                    height: "22px",
                    lineHeight: "20px",
                    fontSize: "11px",
                    color: "#088b46",
                    fontWeight: 600,
                    background: "#f0fdf4",
                    borderRadius: "12px",
                    border: "1px solid #bbf7d0",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "3px"
                  }}
                  onClick={() => handleOpenMap(u)}
                >
                  View Map
                </Button>
              )}
            </div>

            {/* Store Timings */}
            {userType === "vendors" && (startTime || closeTime) && (
              <div style={{
                fontSize: "11.5px",
                color: "#047857",
                marginTop: 6,
                fontWeight: 600,
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                background: "#ecfdf5",
                padding: "2px 8px",
                borderRadius: "6px",
                border: "1px solid #a7f3d0"
              }}>
                <ClockCircleOutlined style={{ fontSize: 11 }} />
                <span>Timings: <strong>{startTime || "—"} - {closeTime || "—"}</strong></span>
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: "Email Address",
      dataIndex: "email",
      key: "email",
      width: 220,
      render: (email) => <span style={{ color: "#334155", fontWeight: 500, fontSize: "13.5px" }}>{email || "-"}</span>,
    },
    {
      title: "Phone Number",
      dataIndex: "phonenumber",
      key: "phonenumber",
      width: 170,
      render: (_, u) => <span style={{ fontWeight: 600, color: "#0f172a", fontSize: "13.5px" }}>{formatPhone(u.phonenumber, u.prefix)}</span>,
    },
    {
      title: "Verification Status",
      dataIndex: "is_verified",
      key: "is_verified",
      width: 160,
      align: "center",
      render: (val) => {
        const badge = getBadgeStatus(val);
        return (
          <Tag color={badge.color} style={{ borderRadius: "14px", padding: "3px 12px", fontWeight: 700, fontSize: "12px" }}>
            {badge.text}
          </Tag>
        );
      },
    },
    {
      title: "Actions",
      key: "action",
      width: 140,
      align: "center",
      render: (_, u) => {
        const lat = u.vendor_lat ?? u.lat ?? u.store_lat ?? u.customer_lat ?? u.rider_lat;
        const lng = u.vendor_lng ?? u.lng ?? u.store_lng ?? u.customer_lng ?? u.rider_lng;
        const hasCoords = lat !== null && lat !== undefined && lat !== "" && lng !== null && lng !== "";

        return (
          <Space size={6}>
            {hasCoords && (
              <Tooltip title="View Location Map">
                <Button
                  type="default"
                  size="small"
                  icon={<EnvironmentOutlined style={{ color: "#088b46" }} />}
                  style={{ borderRadius: "6px", borderColor: "#cbd5e1" }}
                  onClick={() => handleOpenMap(u)}
                />
              </Tooltip>
            )}
            <Tooltip title="Review Documents & Verify">
              <Button
                type="primary"
                size="small"
                icon={<EyeOutlined />}
                style={{ borderRadius: "6px", background: "#088b46", border: "none", fontWeight: 600 }}
                onClick={() => handleView(u)}
                disabled={u.is_verified === 1}
              >
                Review
              </Button>
            </Tooltip>
            <Tooltip title="Reject Registration">
              <Button
                type="default"
                danger
                size="small"
                icon={<CloseCircleOutlined />}
                style={{ borderRadius: "6px" }}
                onClick={() => handleReject(u)}
                disabled={u.is_verified === 1}
              >
                Reject
              </Button>
            </Tooltip>
          </Space>
        );
      },
    },
  ];

  const userTypeTitle = userType === "vendors" ? "Vendor Verification Requests" : "Rider Verification Requests";

  const mapLat = mapUser ? (mapUser.vendor_lat ?? mapUser.lat ?? mapUser.store_lat ?? mapUser.customer_lat ?? mapUser.rider_lat) : null;
  const mapLng = mapUser ? (mapUser.vendor_lng ?? mapUser.lng ?? mapUser.store_lng ?? mapUser.customer_lng ?? mapUser.rider_lng) : null;
  const mapStoreName = mapUser ? (mapUser.storename || mapUser.store_name || `${mapUser.firstname || ''} ${mapUser.lastname || ''}`) : "";

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header-card">
        <div className="header-title-block">
          <h2>{userTypeTitle}</h2>
          <p>Review uploaded verification documents, business details, and approve or reject registration applications.</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="page-stats-grid">
        <div className="page-stat-card">
          <div className="stat-meta">
            <div className="stat-label">Pending Verifications</div>
            <div className="stat-number">{pendingCount}</div>
          </div>
          <div className="stat-icon" style={{ background: "#fef3c7", color: "#d97706" }}>
            <ClockCircleOutlined />
          </div>
        </div>

        <div className="page-stat-card">
          <div className="stat-meta">
            <div className="stat-label">Approved Accounts</div>
            <div className="stat-number">{verifiedCount}</div>
          </div>
          <div className="stat-icon" style={{ background: "#dcfce7", color: "#088b46" }}>
            <CheckCircleOutlined />
          </div>
        </div>

        <div className="page-stat-card">
          <div className="stat-meta">
            <div className="stat-label">Total Submissions</div>
            <div className="stat-number">{(filteredUsers || []).length}</div>
          </div>
          <div className="stat-icon" style={{ background: "#e0f2fe", color: "#0284c7" }}>
            <SafetyCertificateOutlined />
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="page-content-card">
        <div style={{ marginBottom: 20 }}>
          <Input
            prefix={<SearchOutlined style={{ color: "#94a3b8" }} />}
            placeholder="Search by applicant name, store, email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            allowClear
            style={{ width: 320, borderRadius: 8, height: 40 }}
          />
        </div>

        <Table
          columns={columns}
          dataSource={filteredUsers}
          loading={loading}
          rowKey={record => record.user_id || record.id}
          pagination={{
            pageSize: 10,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} verification requests`,
          }}
          scroll={{ x: 'max-content' }}
        />
      </div>

      {/* View Drawer handled inside UserPreview */}
      {selectedUser ? (
        <UserPreview 
          user={selectedUser} 
          userType={userType} 
          loading={viewLoading} 
          open={showViewModal}
          onClose={handleCloseModal}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      ) : null}

      {/* Map Drawer */}
      {mapUser && (
        <MapDrawer
          open={mapOpen}
          onClose={handleCloseMap}
          title={
            userType === "vendors"
              ? `${mapStoreName} — Store Location`
              : `${mapUser.firstname || ''} ${mapUser.lastname || ''} — Location`
          }
          lat={mapLat}
          lng={mapLng}
          items={[
            { label: userType === "vendors" ? "Store Name" : "Applicant Name", value: mapStoreName },
            { label: "Custom ID", value: mapUser.custom_id || mapUser.user_id || mapUser.id },
            { label: "Phone", value: formatPhone(mapUser.phonenumber, mapUser.prefix) },
            { label: "Email", value: mapUser.email },
            { label: "Store Address", value: mapUser.store_address || mapUser.storeaddress || mapUser.address },
            ...(mapUser.vendor_start_time || mapUser.vendor_close_time ? [{ label: "Store Timings", value: `${mapUser.vendor_start_time || '—'} - ${mapUser.vendor_close_time || '—'}` }] : []),
          ]}
          resolvedAddress={resolvedAddress}
          addressLoading={addressLoading}
          addressError={addressError}
        />
      )}
    </div>
  );
};

export default UnverifiedUsers;
