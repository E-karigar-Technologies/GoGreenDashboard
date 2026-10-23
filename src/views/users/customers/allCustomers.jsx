import React, { useState, useEffect } from "react";
import {
  Table,
  Input,
  Select,
  Button,
  Tag,
  Dropdown,
  Space,
  Avatar,
  Switch,
  Tooltip,
  DatePicker,
} from "antd";
import {
  SearchOutlined,
  ReloadOutlined,
  UserOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  MoreOutlined,
  EyeOutlined,
  DownOutlined,
  AppstoreOutlined,
} from "@ant-design/icons";
import useCustomers from "./hooks/useCustomers";
import CustomerDetailDrawer from "./components/CustomerDetailDrawer";
import { formatPhone } from "../../../services/utils/gen_utility";

const statusTag = (status) => {
  const s = Number(status);
  if (s === 1) return <Tag color="success" style={{ borderRadius: 12, padding: "2px 10px", fontWeight: 600 }}>Active</Tag>;
  if (s === 2) return <Tag color="error" style={{ borderRadius: 12, padding: "2px 10px", fontWeight: 600 }}>Rejected</Tag>;
  return <Tag color="default" style={{ borderRadius: 12, padding: "2px 10px", fontWeight: 600 }}>Inactive</Tag>;
};

const AllCustomers = () => {
  const {
    data,
    loading,
    pagination,
    onTableChange,
    searchText,
    setSearchText,
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
    refresh,
  } = useCustomers();

  const totalCustomers = pagination.total || data.length;
  const activeCustomers = data.filter(c => Number(c.is_verified ?? c.active) === 1).length;
  const inactiveCustomers = data.filter(c => Number(c.is_verified ?? c.active) !== 1).length;

  const getRowMenu = (record) => {
    const statusVal = record.is_verified !== undefined ? record.is_verified : record.active;
    return {
      items: [
        {
          key: "view",
          label: "View Details",
          icon: <EyeOutlined style={{ color: "#088b46" }} />,
          onClick: () => openDrawer(record),
        },
        {
          key: "approve",
          label: "Approve Account",
          icon: <CheckCircleOutlined style={{ color: "#088B46" }} />,
          disabled: Number(statusVal) === 1,
          onClick: () => handleApprove(record),
        },
        {
          key: "reject",
          label: "Reject Registration",
          icon: <CloseCircleOutlined style={{ color: "#ef4444" }} />,
          danger: true,
          disabled: Number(statusVal) === 2,
          onClick: () => handleReject(record),
        },
      ],
    };
  };

  const handleToggleActive = (record, checked) => {
    if (checked) {
      handleApprove(record);
    } else {
      handleDeactivate(record);
    }
  };

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

  const columns = [
    {
      title: "#",
      key: "index",
      width: 50,
      align: "center",
      render: (_, __, index) => (
        <span style={{ fontWeight: 600, color: "#64748b", fontSize: "12.5px" }}>
          #{(pagination.current - 1) * pagination.pageSize + index + 1}
        </span>
      ),
    },
    {
      title: "User Profile",
      key: "user",
      render: (_, record) => {
        const fullName =
          `${record.first_name || record.firstname || ""} ${record.last_name || record.lastname || ""}`.trim() || "Unnamed Customer";
        const avatar = record.profile_image || record.avatar || null;
        const lat = record.customer_lat ?? record.lat ?? record.rider_lat;
        const lng = record.customer_lng ?? record.lng ?? record.rider_lng;
        const locationStr = record.address || (lat && lng ? `${lat}, ${lng}` : null);
        return (
          <Space size={10} style={{ maxWidth: "100%" }}>
            <Avatar
              src={avatar}
              icon={<UserOutlined />}
              size={38}
              style={{ border: "2px solid #e2e8f0", flexShrink: 0 }}
            />
            <div style={{ minWidth: 0, overflow: "hidden" }}>
              <div style={{ fontWeight: 600, color: "#0f172a", fontSize: "13.5px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {fullName}
              </div>
              <div
                style={{ fontSize: 11.5, color: "#64748b", marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 200 }}
                title={locationStr || "No address provided"}
              >
                📍 {locationStr || "No address provided"}
              </div>
            </div>
          </Space>
        );
      },
    },
    ...(!isSmallScreen
      ? [
          {
            title: "Email Address",
            dataIndex: "email",
            key: "email",
            width: 170,
            render: (v) => (
              <span style={{ color: "#334155", fontWeight: 500, fontSize: "12.5px", wordBreak: "break-all" }}>
                {v || "—"}
              </span>
            ),
          },
          {
            title: "Phone Number",
            key: "phone_number",
            width: 130,
            render: (_, record) => {
              const phone = record.phone_number || record.phonenumber;
              return (
                <span style={{ fontWeight: 600, color: "#0f172a", fontSize: "12.5px", whiteSpace: "nowrap" }}>
                  {phone ? formatPhone(phone, record.prefix) : "—"}
                </span>
              );
            },
          },
          {
            title: "Gender",
            dataIndex: "gender",
            key: "gender",
            width: 85,
            align: "center",
            render: (v) => (
              <Tag color="cyan" style={{ borderRadius: "6px", textTransform: "capitalize", fontWeight: 500, fontSize: "11px", margin: 0 }}>
                {v || "—"}
              </Tag>
            ),
          },
        ]
      : [
          {
            title: "Rest of Columns",
            key: "more_columns",
            width: 135,
            align: "center",
            render: (_, record) => {
              const phone = record.phone_number || record.phonenumber;
              const lat = record.customer_lat ?? record.lat ?? record.rider_lat;
              const lng = record.customer_lng ?? record.lng ?? record.rider_lng;
              const locationStr = record.address || (lat && lng ? `${lat}, ${lng}` : null);

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
                        <span>Customer Columns</span>
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
                            {record.email || "—"}
                          </div>
                        </div>

                        <div>
                          <div style={{ color: "#64748b", fontWeight: 600, fontSize: "11px", marginBottom: 2 }}>
                            📞 PHONE NUMBER
                          </div>
                          <div style={{ color: "#1e293b", fontWeight: 600 }}>
                            {phone ? formatPhone(phone, record.prefix) : "—"}
                          </div>
                        </div>

                        <div>
                          <div style={{ color: "#64748b", fontWeight: 600, fontSize: "11px", marginBottom: 2 }}>
                            👤 GENDER
                          </div>
                          <div>
                            <Tag color="cyan" style={{ borderRadius: "6px", textTransform: "capitalize", fontWeight: 500, fontSize: "11px", margin: 0 }}>
                              {record.gender || "Unspecified"}
                            </Tag>
                          </div>
                        </div>

                        <div>
                          <div style={{ color: "#64748b", fontWeight: 600, fontSize: "11px", marginBottom: 2 }}>
                            📍 ADDRESS / LOCATION
                          </div>
                          <div style={{ color: "#334155", fontSize: "12px", lineHeight: "1.4" }}>
                            {locationStr || "No address provided"}
                          </div>
                        </div>
                      </div>

                      <div style={{ marginTop: 12, paddingTop: 8, borderTop: "1px solid #f1f5f9" }}>
                        <Button
                          type="primary"
                          size="small"
                          block
                          icon={<EyeOutlined />}
                          style={{ background: "#088b46", border: "none", borderRadius: "6px", fontWeight: 600 }}
                          onClick={() => openDrawer(record)}
                        >
                          View Full Profile
                        </Button>
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
      key: "status",
      width: 120,
      align: "center",
      render: (_, record) => {
        const statusVal = record.is_verified !== undefined ? record.is_verified : record.active;
        const isRejected = Number(statusVal) === 2;
        return (
          <Space direction="vertical" size={4} align="center">
            {statusTag(statusVal)}
            <Tooltip
              title={
                isRejected
                  ? "Account Rejected — use options menu to change"
                  : Number(statusVal) === 1
                  ? "Active Account"
                  : "Inactive Account"
              }
            >
              <Switch
                size="small"
                checked={Number(statusVal) === 1}
                disabled={isRejected}
                loading={actionLoadingId === record.id}
                style={{
                  backgroundColor: Number(statusVal) === 1 ? "#088B46" : undefined,
                }}
                onChange={(checked) => handleToggleActive(record, checked)}
              />
            </Tooltip>
          </Space>
        );
      },
    },
    {
      title: "Action",
      key: "action",
      width: 60,
      align: "center",
      render: (_, record) => (
        <Dropdown
          menu={getRowMenu(record)}
          trigger={["click"]}
          placement="bottomRight"
        >
          <Button
            type="text"
            size="small"
            icon={<MoreOutlined style={{ fontSize: 18, color: "#64748b" }} />}
            loading={actionLoadingId === record.id}
          />
        </Dropdown>
      ),
    },
  ];

  return (
    <div className="page-container">
      {/* Header Card */}
      <div className="page-header-card">
        <div className="header-title-block">
          <h2>Customer Directory & Verification</h2>
          <p>Manage consumer accounts, review credentials, check verification status, and resolve addresses.</p>
        </div>
        <Button
          type="default"
          icon={<ReloadOutlined />}
          style={{ height: 40, borderRadius: 8 }}
          onClick={refresh}
        >
          Refresh Directory
        </Button>
      </div>

      {/* Metric Stats Grid */}
      <div className="page-stats-grid">
        <div className="page-stat-card">
          <div className="stat-meta">
            <div className="stat-label">Total Customers</div>
            <div className="stat-number">{totalCustomers}</div>
          </div>
          <div className="stat-icon" style={{ background: "#e0f2fe", color: "#0284c7" }}>
            <UserOutlined />
          </div>
        </div>

        <div className="page-stat-card">
          <div className="stat-meta">
            <div className="stat-label">Active Customers</div>
            <div className="stat-number">{activeCustomers}</div>
          </div>
          <div className="stat-icon" style={{ background: "#dcfce7", color: "#088b46" }}>
            <CheckCircleOutlined />
          </div>
        </div>

        <div className="page-stat-card">
          <div className="stat-meta">
            <div className="stat-label">Inactive / Pending</div>
            <div className="stat-number">{inactiveCustomers}</div>
          </div>
          <div className="stat-icon" style={{ background: "#fef3c7", color: "#d97706" }}>
            <ClockCircleOutlined />
          </div>
        </div>
      </div>

      {/* Main Table Content Card */}
      <div className="page-content-card">
        <div style={{ marginBottom: 20, display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center", justifyContent: "space-between" }}>
          <Space wrap size={12}>
            {/* Search Input */}
            <Input
              allowClear
              prefix={<SearchOutlined style={{ color: "#94a3b8" }} />}
              placeholder="Search name, email, phone, id..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 280, borderRadius: 8, height: 40 }}
            />

            {/* Sort Select */}
            <Select
              value={sortOrder || ""}
              onChange={(v) => setSortOrder(v)}
              style={{ width: 170, height: 40 }}
              options={[
                { value: "", label: "🕐 Latest First" },
                { value: "a-z", label: "🔤 Name A → Z" },
                { value: "z-a", label: "🔤 Name Z → A" },
              ]}
            />

            {/* Date Preset & Mode Select */}
            <Select
              value={dateFilterType}
              onChange={(v) => setDateFilterType(v)}
              style={{ width: 150, height: 40 }}
              options={[
                { value: "all", label: "📅 All Dates" },
                { value: "today", label: "📅 Today" },
                { value: "yesterday", label: "📅 Yesterday" },
                { value: "month", label: "📅 This Month" },
                { value: "single", label: "📅 Single Date" },
                { value: "range", label: "📅 Date Range" },
              ]}
            />

            {/* Single Date Picker */}
            {dateFilterType === "single" && (
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
            {dateFilterType === "range" && (
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
              placeholder="Filter Status"
              value={statusFilter}
              onChange={(v) => setStatusFilter(v)}
              style={{ width: 160, height: 40 }}
              options={[
                { value: 1, label: "✅ Active" },
                { value: 0, label: "⏸️ Inactive" },
                { value: 2, label: "❌ Rejected" },
              ]}
            />

            {/* Refresh Button */}
            <Tooltip title="Refresh directory">
              <Button
                icon={<ReloadOutlined />}
                onClick={() => refresh(true)}
                loading={loading}
                style={{ height: 40, borderRadius: 8 }}
              />
            </Tooltip>

            {/* Reset Filters */}
            <Button onClick={resetFilters} style={{ height: 40, borderRadius: 8 }}>
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
                    Customer Columns
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "12.5px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <CheckCircleOutlined style={{ color: "#088b46" }} />
                      <span># Index</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <CheckCircleOutlined style={{ color: "#088b46" }} />
                      <span>User Profile (Avatar & Name)</span>
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
                      <span>Gender</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <CheckCircleOutlined style={{ color: "#088b46" }} />
                      <span>Status (Badge & Toggle Switch)</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <CheckCircleOutlined style={{ color: "#088b46" }} />
                      <span>Action Menu</span>
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
          key={`${searchText}_${sortOrder}_${dateFilterType}`}
          rowKey={(record, index) => record.id || record.user_id || record._id || `cust-row-${index}`}
          columns={columns}
          dataSource={data}
          loading={loading}
          pagination={{
            ...pagination,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} customers`,
          }}
          onChange={onTableChange}
          className="responsive-table-no-scroll"
        />
      </div>

      {/* Customer Details Drawer */}
      <CustomerDetailDrawer
        open={drawerOpen}
        user={selectedUser}
        onClose={closeDrawer}
        onApprove={handleApprove}
        onReject={handleReject}
        loading={selectedUser ? actionLoadingId === selectedUser.id : false}
        resolvedAddress={resolvedAddress}
        addressLoading={addressLoading}
        addressError={addressError}
      />
    </div>
  );
};

export default AllCustomers;
