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
  MoreVertical,
  Check,
  X,
  Eye,
  RefreshCw,
  UserCircle2,
  Search,
} from "lucide-react";
import useCustomers from "./hooks/useCustomers";
import CustomerDetailDrawer from "./components/CustomerDetailDrawer";

const statusTag = (status) => {
  const s = Number(status);
  if (s === 1) return <Tag color="green">Active</Tag>;
  if (s === 2) return <Tag color="red">Rejected</Tag>;
  return <Tag>Inactive</Tag>;
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

  const getRowMenu = (record) => ({
    items: [
      {
        key: "view",
        label: "View Details",
        icon: <Eye size={16} />,
        onClick: () => openDrawer(record),
      },
      {
        key: "approve",
        label: "Approve",
        icon: <Check size={16} color="#088B46" />,
        disabled: Number(record.active) === 1,
        onClick: () => handleApprove(record),
      },
      {
        key: "reject",
        label: "Reject",
        icon: <X size={16} color="#ff4d4f" />,
        danger: true,
        disabled: Number(record.active) === 2,
        onClick: () => handleReject(record),
      },
    ],
  });

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
      render: (_, __, index) =>
        (pagination.current - 1) * pagination.pageSize + index + 1,
    },
    {
      title: "User",
      key: "user",
      render: (_, record) => {
        const fullName =
          `${record.first_name || ""} ${record.last_name || ""}`.trim() || "—";
        const avatar = record.profile_image || record.avatar || null;
        return (
          <Space>
            <Avatar src={avatar} icon={<UserCircle2 size={20} />} />
            <div>
              <div style={{ fontWeight: 600 }}>{fullName}</div>
              <div style={{ fontSize: 12, color: "#888" }}>ID: {record.id}</div>
            </div>
          </Space>
        );
      },
    },
    {
      title: "Email",
      dataIndex: "email",
      render: (v) => v || "—",
    },
    {
      title: "Phone",
      dataIndex: "phone_number",
      render: (v) => v || "—",
    },
    {
      title: "Gender",
      dataIndex: "gender",
      width: 100,
      render: (v) => v || "—",
    },
    {
      title: "Active",
      dataIndex: "active",
      width: 90,
      align: "center",
      render: (val, record) => {
        const isRejected = Number(val) === 2;
        return (
          <Tooltip
            title={
              isRejected
                ? "Rejected — use the three-dot menu to change"
                : Number(val) === 1
                ? "Active"
                : "Inactive"
            }
          >
            <Switch
              checked={Number(val) === 1}
              disabled={isRejected}
              loading={actionLoadingId === record.id}
              style={{
                backgroundColor: Number(val) === 1 ? "#088B46" : undefined,
              }}
              onChange={(checked) => handleToggleActive(record, checked)}
            />
          </Tooltip>
        );
      },
    },
    {
      title: "Status",
      dataIndex: "active",
      width: 110,
      render: (val) => statusTag(val),
      filters: [
        { text: "Active", value: 1 },
        { text: "Inactive", value: 0 },
        { text: "Rejected", value: 2 },
      ],
      onFilter: (value, record) => Number(record.active) === Number(value),
    },
    {
      title: "Action",
      key: "action",
      width: 80,
      align: "center",
      render: (_, record) => (
        <Dropdown
          menu={getRowMenu(record)}
          trigger={["click"]}
          placement="bottomRight"
        >
          <Button
            type="text"
            icon={<MoreVertical size={18} />}
            loading={actionLoadingId === record.id}
          />
        </Dropdown>
      ),
    },
  ];

  return (
    <div className="p2">
      <div
        className="pb-2 p-2 bg-white"
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 12,
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Space wrap>
          <Input
            allowClear
            prefix={<Search size={14} />}
            placeholder="Search name, email, phone, id"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 280 }}
          />
          <Select
            allowClear
            placeholder="Status"
            value={statusFilter}
            onChange={(v) => setStatusFilter(v)}
            style={{ width: 160 }}
            options={[
              { value: 1, label: "Active" },
              { value: 0, label: "Inactive" },
              { value: 2, label: "Rejected" },
            ]}
          />
          <Button onClick={resetFilters}>Reset</Button>
        </Space>
        <Space>
          <Button icon={<RefreshCw size={16} />} onClick={refresh}>
            Refresh
          </Button>
        </Space>
      </div>

      <div className="p-2 bg-white">
        <Table
          rowKey={(record) => record.id || record._id}
          columns={columns}
          dataSource={data}
          loading={loading}
          pagination={pagination}
          onChange={onTableChange}
          size="small"
          scroll={{ x: "max-content", y: "66vh" }}
        />
      </div>

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
