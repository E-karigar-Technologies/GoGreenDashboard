import React, { useState, useEffect } from "react";
import { Table, Button, Input, Space, Tag, Tooltip, Select, DatePicker, Dropdown } from "antd";
import {
  SearchOutlined,
  SafetyCertificateOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  EyeOutlined,
  CloseCircleOutlined,
  EnvironmentOutlined,
  ReloadOutlined,
  DownOutlined,
  MailOutlined,
  PhoneOutlined,
  AppstoreOutlined,
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
    statusFilter,
    setStatusFilter,
    sortOrder,
    setSortOrder,
    dateFilterType,
    setDateFilterType,
    singleDate,
    setSingleDate,
    rangeDates,
    setRangeDates,
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

  const [isSmallScreen, setIsSmallScreen] = useState(
    typeof window !== "undefined" ? window.innerWidth < 992 : false
  );

  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < 992);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const pendingCount = (filteredUsers || []).filter(u => u.is_verified !== 1).length;
  const verifiedCount = (filteredUsers || []).filter(u => u.is_verified === 1).length;

  const columns = [
    {
      title: userType === "vendors" ? "Vendor / Store Details" : "Rider Details",
      dataIndex: "name",
      key: "name",
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
          <div style={{ padding: "4px 0", minWidth: 180 }}>
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
            <div style={{ fontWeight: 700, color: "#0f172a", fontSize: "14px", letterSpacing: "-0.2px", lineHeight: 1.3 }}>
              {titleText}
            </div>

            {/* Address with Tooltip & View Map Button */}
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4, flexWrap: "wrap" }}>
              <Tooltip title={storeAddress} placement="top">
                <span style={{
                  fontSize: "12px",
                  color: "#64748b",
                  maxWidth: "220px",
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
                    padding: "0 6px",
                    height: "20px",
                    lineHeight: "18px",
                    fontSize: "10.5px",
                    color: "#088b46",
                    fontWeight: 600,
                    background: "#f0fdf4",
                    borderRadius: "10px",
                    border: "1px solid #bbf7d0",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "2px"
                  }}
                  onClick={() => handleOpenMap(u)}
                >
                  Map
                </Button>
              )}
            </div>

            {/* Store Timings */}
            {userType === "vendors" && (startTime || closeTime) && (
              <div style={{
                fontSize: "11px",
                color: "#047857",
                marginTop: 4,
                fontWeight: 600,
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                background: "#ecfdf5",
                padding: "1px 6px",
                borderRadius: "4px",
                border: "1px solid #a7f3d0"
              }}>
                <ClockCircleOutlined style={{ fontSize: 10 }} />
                <span>Timings: <strong>{startTime || "—"} - {closeTime || "—"}</strong></span>
              </div>
            )}
          </div>
        );
      },
    },
    ...(!isSmallScreen
      ? [
          {
            title: "Email Address",
            dataIndex: "email",
            key: "email",
            width: 180,
            render: (email) => (
              <span style={{ color: "#334155", fontWeight: 500, fontSize: "13px", wordBreak: "break-all" }}>
                {email || "—"}
              </span>
            ),
          },
          {
            title: "Phone Number",
            dataIndex: "phonenumber",
            key: "phonenumber",
            width: 130,
            render: (_, u) => (
              <span style={{ fontWeight: 600, color: "#0f172a", fontSize: "13px", whiteSpace: "nowrap" }}>
                {formatPhone(u.phonenumber, u.prefix)}
              </span>
            ),
          },
        ]
      : [
          {
            title: "Rest of Columns",
            key: "more_columns",
            width: 135,
            align: "center",
            render: (_, u) => {
              const storeAddress = userType === "vendors"
                ? (u.store_address || u.storeaddress || u.address || "No store address provided")
                : (u.address || "No address provided");
              const lat = u.vendor_lat ?? u.lat ?? u.store_lat ?? u.customer_lat ?? u.rider_lat;
              const lng = u.vendor_lng ?? u.lng ?? u.store_lng ?? u.customer_lng ?? u.rider_lng;
              const hasCoords = lat !== null && lat !== undefined && lat !== "" && lng !== null && lng !== "";
              const startTime = u.vendor_start_time || u.start_time;
              const closeTime = u.vendor_close_time || u.close_time;

              return (
                <Dropdown
                  trigger={["click"]}
                  placement="bottomRight"
                  dropdownRender={() => (
                    <div
                      style={{
                        background: "#ffffff",
                        padding: "14px 16px",
                        borderRadius: "10px",
                        boxShadow: "0 10px 28px rgba(0,0,0,0.14)",
                        border: "1px solid #e2e8f0",
                        minWidth: "260px",
                        maxWidth: "320px",
                      }}
                    >
                      <div
                        style={{
                          fontWeight: 700,
                          fontSize: "12px",
                          color: "#088b46",
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                          marginBottom: 10,
                          paddingBottom: 6,
                          borderBottom: "1px solid #f1f5f9",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <span>Additional Columns</span>
                        <Tag color="green" style={{ fontSize: "10px", margin: 0, fontWeight: 600 }}>
                          Rest of Fields
                        </Tag>
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "12px" }}>
                        <div>
                          <div style={{ color: "#64748b", fontWeight: 600, fontSize: "11px", marginBottom: 2 }}>
                            📧 EMAIL ADDRESS
                          </div>
                          <div style={{ color: "#1e293b", fontWeight: 500, wordBreak: "break-all" }}>
                            {u.email || "—"}
                          </div>
                        </div>

                        <div>
                          <div style={{ color: "#64748b", fontWeight: 600, fontSize: "11px", marginBottom: 2 }}>
                            📞 PHONE NUMBER
                          </div>
                          <div style={{ color: "#1e293b", fontWeight: 600 }}>
                            {formatPhone(u.phonenumber, u.prefix)}
                          </div>
                        </div>

                        {userType === "vendors" && (startTime || closeTime) && (
                          <div>
                            <div style={{ color: "#64748b", fontWeight: 600, fontSize: "11px", marginBottom: 2 }}>
                              ⏰ STORE TIMINGS
                            </div>
                            <div style={{ color: "#047857", fontWeight: 600 }}>
                              {startTime || "—"} - {closeTime || "—"}
                            </div>
                          </div>
                        )}

                        <div>
                          <div style={{ color: "#64748b", fontWeight: 600, fontSize: "11px", marginBottom: 2 }}>
                            📍 LOCATION ADDRESS
                          </div>
                          <div style={{ color: "#334155", fontSize: "12px", lineHeight: "1.4" }}>
                            {storeAddress}
                          </div>
                          {hasCoords && (
                            <Button
                              type="link"
                              size="small"
                              icon={<EnvironmentOutlined />}
                              style={{ padding: 0, height: "auto", fontSize: "11px", color: "#088b46", marginTop: 4 }}
                              onClick={() => handleOpenMap(u)}
                            >
                              Open Map
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                >
                  <Button
                    size="small"
                    style={{
                      borderRadius: "6px",
                      borderColor: "#088b46",
                      color: "#088b46",
                      fontSize: "11.5px",
                      fontWeight: 600,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                      background: "#f0fdf4",
                    }}
                  >
                    <span>Columns</span>
                    <DownOutlined style={{ fontSize: 9 }} />
                  </Button>
                </Dropdown>
              );
            },
          },
        ]),
    {
      title: "Status",
      dataIndex: "is_verified",
      key: "is_verified",
      width: 110,
      align: "center",
      render: (val) => {
        const badge = getBadgeStatus(val);
        return (
          <Tag color={badge.color} style={{ borderRadius: "12px", padding: "2px 10px", fontWeight: 700, fontSize: "11.5px" }}>
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
          <Space size={4} wrap>
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
                style={{ borderRadius: "6px", background: "#088b46", border: "none", fontWeight: 600, fontSize: "12px" }}
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
                style={{ borderRadius: "6px", fontSize: "12px" }}
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
        <div style={{ marginBottom: 20, display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', justifyContent: 'space-between' }}>
          <Space wrap size={12}>
            {/* Search Input */}
            <Input
              prefix={<SearchOutlined style={{ color: "#94a3b8" }} />}
              placeholder={userType === "vendors" ? "Search store, name, email, phone..." : "Search rider, name, email, phone..."}
              value={search}
              onChange={e => setSearch(e.target.value)}
              allowClear
              style={{ width: 280, borderRadius: 8, height: 40 }}
            />

            {/* Alphabetical / Order Sort */}
            <Select
              value={sortOrder || ''}
              onChange={(v) => setSortOrder(v)}
              style={{ width: 170, height: 40 }}
              options={[
                { value: '', label: '🕐 Latest First' },
                { value: 'a-z', label: '🔤 Name A → Z' },
                { value: 'z-a', label: '🔤 Name Z → A' },
              ]}
            />

            {/* Date Presets & Modes */}
            <Select
              value={dateFilterType}
              onChange={(v) => setDateFilterType(v)}
              style={{ width: 150, height: 40 }}
              options={[
                { value: 'all', label: '📅 All Dates' },
                { value: 'today', label: '📅 Today' },
                { value: 'yesterday', label: '📅 Yesterday' },
                { value: 'single', label: '📅 Single Date' },
                { value: 'range', label: '📅 Date Range' },
              ]}
            />

            {/* Single Date Picker */}
            {dateFilterType === 'single' && (
              <DatePicker
                value={singleDate}
                onChange={(date) => setSingleDate(date)}
                format="YYYY-MM-DD"
                allowClear={false}
                style={{ height: 40, borderRadius: 8 }}
                placeholder="Select date"
              />
            )}

            {/* Date Range Picker */}
            {dateFilterType === 'range' && (
              <DatePicker.RangePicker
                value={rangeDates}
                onChange={(dates) => setRangeDates(dates)}
                format="YYYY-MM-DD"
                allowClear={false}
                style={{ height: 40, borderRadius: 8 }}
              />
            )}

            {/* Status Filter */}
            <Select
              allowClear
              placeholder="Filter by Status"
              value={statusFilter}
              onChange={(v) => setStatusFilter(v ?? null)}
              style={{ width: 160, height: 40 }}
              options={[
                { value: 0, label: '⏳ Pending' },
                { value: 1, label: '✅ Verified' },
                { value: 2, label: '❌ Rejected' },
                { value: 3, label: '🔍 In Review' },
              ]}
            />

            {/* Refresh Button */}
            <Tooltip title="Refresh data">
              <Button
                icon={<ReloadOutlined />}
                onClick={() => fetchUsers(null, true)}
                loading={loading}
                style={{ height: 40, borderRadius: 8 }}
              />
            </Tooltip>

            {/* Reset Filters */}
            <Button
              onClick={resetFilters}
              style={{ height: 40, borderRadius: 8 }}
            >
              Reset Filters
            </Button>

            {/* Columns Overview Dropdown */}
            <Dropdown
              trigger={["click"]}
              placement="bottomRight"
              dropdownRender={() => (
                <div
                  style={{
                    background: "#ffffff",
                    padding: "14px 16px",
                    borderRadius: "10px",
                    boxShadow: "0 10px 28px rgba(0,0,0,0.12)",
                    border: "1px solid #e2e8f0",
                    minWidth: "240px",
                  }}
                >
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: "12px",
                      color: "#088b46",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      marginBottom: 10,
                      paddingBottom: 6,
                      borderBottom: "1px solid #f1f5f9",
                    }}
                  >
                    Table Columns
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "12.5px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <CheckCircleOutlined style={{ color: "#088b46" }} />
                      <span>{userType === "vendors" ? "Vendor / Store Details" : "Rider Details"}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <CheckCircleOutlined style={{ color: "#088b46" }} />
                      <span>Email Address</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <CheckCircleOutlined style={{ color: "#088b46" }} />
                      <span>Phone Number</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <CheckCircleOutlined style={{ color: "#088b46" }} />
                      <span>Status</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <CheckCircleOutlined style={{ color: "#088b46" }} />
                      <span>Action Buttons (Review / Reject / Map)</span>
                    </div>
                  </div>
                  <div
                    style={{
                      marginTop: 10,
                      paddingTop: 8,
                      borderTop: "1px solid #f1f5f9",
                      fontSize: "11px",
                      color: "#64748b",
                      lineHeight: "1.4",
                    }}
                  >
                    {isSmallScreen
                      ? "📱 On small screens, columns adapt into each row's 'Columns ▾' dropdown so no details are hidden."
                      : "💻 All columns are displayed directly on screen without horizontal scroll."}
                  </div>
                </div>
              )}
            >
              <Button
                style={{ height: 40, borderRadius: 8, display: "inline-flex", alignItems: "center", gap: 6 }}
                icon={<AppstoreOutlined />}
              >
                <span>Columns</span>
                <DownOutlined style={{ fontSize: 10 }} />
              </Button>
            </Dropdown>
          </Space>
        </div>

        <Table
          key={`${userType}_${search || ''}`}
          columns={columns}
          dataSource={filteredUsers}
          loading={loading}
          rowKey={(record, index) => record.custom_id || record.user_id || record.id || record.email || `row-${index}`}
          pagination={{
            pageSize: 10,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} verification requests`,
          }}
          className="responsive-table-no-scroll"
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
