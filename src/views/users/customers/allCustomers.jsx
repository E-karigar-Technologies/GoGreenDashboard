import React from "react";
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

  const columns = [
    {
      title: "#",
      key: "index",
      width: 60,
      align: "center",
      render: (_, __, index) => (
        <span style={{ fontWeight: 600, color: "#64748b" }}>
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
          <Space size={12}>
            <Avatar
              src={avatar}
              icon={<UserOutlined />}
              size={40}
              style={{ border: "2px solid #e2e8f0", boxShadow: "0 2px 6px rgba(0,0,0,0.04)" }}
            />
            <div>
              <div style={{ fontWeight: 600, color: "#0f172a", fontSize: "14px" }}>{fullName}</div>
              <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
                📍 {locationStr || "No address provided"}
              </div>
            </div>
          </Space>
        );
      },
    },
    {
      title: "Email Address",
      dataIndex: "email",
      key: "email",
      render: (v) => <span style={{ color: "#334155", fontWeight: 500, fontSize: 13.5 }}>{v || "—"}</span>,
    },
    {
      title: "Phone Number",
      key: "phone_number",
      render: (_, record) => {
        const phone = record.phone_number || record.phonenumber;
        return (
          <span style={{ fontWeight: 500, color: "#0f172a", fontSize: 13.5 }}>
            {phone ? formatPhone(phone, record.prefix) : "—"}
          </span>
        );
      },
    },
    {
      title: "Gender",
      dataIndex: "gender",
      key: "gender",
      width: 110,
      render: (v) => (
        <Tag color="cyan" style={{ borderRadius: "6px", textTransform: "capitalize", fontWeight: 500 }}>
          {v || "Unspecified"}
        </Tag>
      ),
    },
    {
      title: "Active Status",
      key: "active_switch",
      width: 120,
      align: "center",
      render: (_, record) => {
        const statusVal = record.is_verified !== undefined ? record.is_verified : record.active;
        const isRejected = Number(statusVal) === 2;
        return (
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
              checked={Number(statusVal) === 1}
              disabled={isRejected}
              loading={actionLoadingId === record.id}
              style={{
                backgroundColor: Number(statusVal) === 1 ? "#088B46" : undefined,
              }}
              onChange={(checked) => handleToggleActive(record, checked)}
            />
          </Tooltip>
        );
      },
    },
    {
      title: "Status Badge",
      key: "status",
      width: 120,
      align: "center",
      render: (_, record) => {
        const statusVal = record.is_verified !== undefined ? record.is_verified : record.active;
        return statusTag(statusVal);
      },
    },
    {
      title: "Action",
      key: "action",
      width: 90,
      align: "center",
      render: (_, record) => (
        <Dropdown
          menu={getRowMenu(record)}
          trigger={["click"]}
          placement="bottomRight"
        >
          <Button
            type="text"
            icon={<MoreOutlined style={{ fontSize: 20, color: "#64748b" }} />}
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
            <Input
              allowClear
              prefix={<SearchOutlined style={{ color: "#94a3b8" }} />}
              placeholder="Search name, email, phone, id..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 280, borderRadius: 8, height: 40 }}
            />
            <Select
              allowClear
              placeholder="Filter Status"
              value={statusFilter}
              onChange={(v) => setStatusFilter(v)}
              style={{ width: 160, height: 40 }}
              options={[
                { value: 1, label: "Active" },
                { value: 0, label: "Inactive" },
                { value: 2, label: "Rejected" },
              ]}
            />
            <Button onClick={resetFilters} style={{ height: 40, borderRadius: 8 }}>
              Reset Filters
            </Button>
          </Space>
        </div>

        <Table
          rowKey={(record) => record.id || record._id}
          columns={columns}
          dataSource={data}
          loading={loading}
          pagination={{
            ...pagination,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} customers`,
          }}
          onChange={onTableChange}
          scroll={{ x: "max-content" }}
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
