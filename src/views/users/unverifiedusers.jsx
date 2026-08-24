import React from "react";
import { Table, Button, Input, Space, Tag, Tooltip } from "antd";
import { SearchOutlined, SafetyCertificateOutlined, CheckCircleOutlined, ClockCircleOutlined, EyeOutlined, CloseCircleOutlined } from "@ant-design/icons";
import useUnverifiedUsers from "./unverifieduserhook";
import UserPreview from "./components/UserPreview";
import { formatPhone } from "../../services/utils/gen_utility";

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

  const pendingCount = (filteredUsers || []).filter(u => u.is_verified !== 1).length;
  const verifiedCount = (filteredUsers || []).filter(u => u.is_verified === 1).length;

  const columns = [
    {
      title: "#",
      dataIndex: "sr",
      key: "sr",
      render: (text, record, index) => <span style={{ fontWeight: 600, color: "#64748b" }}>#{index + 1}</span>,
      width: 60,
      align: "center",
    },
    {
      title: userType === "vendors" ? "Vendor Store Name" : "Rider Name",
      dataIndex: "name",
      key: "name",
      render: (_, u) => {
        const titleText = userType === "vendors"
          ? u.storename || `${u.firstname || ''} ${u.lastname || ''}`.trim()
          : `${u.firstname || ''} ${u.lastname || ''}`.trim() || 'Unnamed Applicant';
        return (
          <div>
            <div style={{ fontWeight: 600, color: "#0f172a", fontSize: "14.5px" }}>
              {titleText}
            </div>
            <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
              📍 {u.address || "No address provided"}
            </div>
          </div>
        );
      },
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      render: (email) => <span style={{ color: "#334155", fontWeight: 500 }}>{email || "-"}</span>,
    },
    {
      title: "Phone Number",
      dataIndex: "phonenumber",
      key: "phonenumber",
      render: (_, u) => <span style={{ fontWeight: 500, color: "#0f172a" }}>{formatPhone(u.phonenumber, u.prefix)}</span>,
    },
    {
      title: "Verification Status",
      dataIndex: "is_verified",
      key: "is_verified",
      render: (val) => {
        const badge = getBadgeStatus(val);
        return <Tag color={badge.color} style={{ borderRadius: "12px", padding: "2px 10px", fontWeight: 600 }}>{badge.text}</Tag>;
      },
    },
    {
      title: "Actions",
      key: "action",
      align: "center",
      render: (_, u) => (
        <Space>
          <Tooltip title="Review Documents & Verify">
            <Button
              type="primary"
              size="small"
              icon={<EyeOutlined />}
              style={{ borderRadius: "6px", background: "#088b46", border: "none" }}
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
      ),
    },
  ];

  const userTypeTitle = userType === "vendors" ? "Vendor Verification Requests" : "Rider Verification Requests";

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
            placeholder="Search by applicant name, email..."
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
          rowKey={record => record.user_id}
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
    </div>
  );
};

export default UnverifiedUsers;
