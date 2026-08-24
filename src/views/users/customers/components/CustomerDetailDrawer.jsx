import React, { useState } from "react";
import {
  Drawer,
  Descriptions,
  Tag,
  Button,
  Space,
  Avatar,
} from "antd";
import {
  Check,
  X,
  UserCircle2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  User as UserIcon,
} from "lucide-react";
import MapDrawer from "./MapDrawer";

const statusTag = (status) => {
  const s = Number(status);
  if (s === 1) return <Tag color="green">Active</Tag>;
  if (s === 2) return <Tag color="red">Rejected</Tag>;
  return <Tag>Inactive</Tag>;
};

const formatDate = (val) => {
  if (!val) return "—";
  const d = new Date(val);
  if (Number.isNaN(d.getTime())) return val;
  return d.toLocaleDateString();
};

const formatDateTime = (val) => {
  if (!val) return "—";
  const d = new Date(val);
  if (Number.isNaN(d.getTime())) return val;
  return d.toLocaleString();
};

const CustomerDetailDrawer = ({
  open,
  user,
  onClose,
  onApprove,
  onReject,
  loading,
  resolvedAddress,
  addressLoading,
  addressError,
}) => {
  const [mapOpen, setMapOpen] = useState(false);

  const fullName = user
    ? `${user.first_name || ""} ${user.last_name || ""}`.trim() || "—"
    : "—";
  const email = user?.email || "—";
  const phone = user?.phone_number || "—";
  const address = user?.address || "—";
  const gender = user?.gender || "—";
  const dob = formatDate(user?.dob);
  const created = formatDateTime(user?.created_at);
  const avatar = user?.profile_image || user?.avatar || null;

  const lat = user?.lat;
  const lng = user?.lng;
  const hasCoords =
    lat !== null && lat !== undefined && lat !== "" &&
    lng !== null && lng !== undefined && lng !== "";

  const isApproved = Number(user?.active) === 1;
  const isRejected = Number(user?.active) === 2;

  const handleCloseAll = () => {
    setMapOpen(false);
    onClose && onClose();
  };

  const mapItems = user
    ? [
        { label: "Customer", value: fullName },
        { label: "Customer ID", value: user.id },
        { label: "Phone", value: phone },
        { label: "Email", value: email },
        { label: "Saved Address", value: address },
      ]
    : [];

  return (
    <Drawer
      title="User Details"
      placement="right"
      width={480}
      zIndex={2000}
      onClose={handleCloseAll}
      open={open}
      push={false}
      extra={user ? statusTag(user.active) : null}
      footer={
        user ? (
          <Space style={{ width: "100%", justifyContent: "flex-end" }}>
            <Button
              danger
              icon={<X size={16} />}
              onClick={() => onReject(user)}
              loading={loading}
              disabled={isRejected}
            >
              Reject
            </Button>
            <Button
              type="primary"
              style={{ background: "#088B46", borderColor: "#088B46" }}
              icon={<Check size={16} />}
              onClick={() => onApprove(user)}
              loading={loading}
              disabled={isApproved}
            >
              Approve
            </Button>
          </Space>
        ) : null
      }
    >
      {user && (
        <>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 16,
            }}
          >
            <Avatar size={64} src={avatar} icon={<UserCircle2 size={36} />} />
            <div>
              <div style={{ fontSize: 18, fontWeight: 600 }}>{fullName}</div>
              <div style={{ color: "#888", fontSize: 13 }}>ID: {user.id}</div>
            </div>
          </div>

          <Descriptions column={1} size="small" bordered>
            <Descriptions.Item
              label={
                <span>
                  <Mail size={14} style={{ verticalAlign: -2, marginRight: 6 }} />
                  Email
                </span>
              }
            >
              {email}
            </Descriptions.Item>
            <Descriptions.Item
              label={
                <span>
                  <Phone size={14} style={{ verticalAlign: -2, marginRight: 6 }} />
                  Phone
                </span>
              }
            >
              {phone}
            </Descriptions.Item>
            <Descriptions.Item
              label={
                <span>
                  <UserIcon size={14} style={{ verticalAlign: -2, marginRight: 6 }} />
                  Gender
                </span>
              }
            >
              {gender}
            </Descriptions.Item>
            <Descriptions.Item
              label={
                <span>
                  <Calendar size={14} style={{ verticalAlign: -2, marginRight: 6 }} />
                  Date of Birth
                </span>
              }
            >
              {dob}
            </Descriptions.Item>
            <Descriptions.Item
              label={
                <span>
                  <MapPin size={14} style={{ verticalAlign: -2, marginRight: 6 }} />
                  Address
                </span>
              }
            >
              {address}
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              {statusTag(user.active)}
            </Descriptions.Item>
            <Descriptions.Item label="Created">{created}</Descriptions.Item>
          </Descriptions>

          <div style={{ marginTop: 16 }}>
            <Button
              type="default"
              icon={<MapPin size={16} />}
              onClick={() => setMapOpen(true)}
              disabled={!hasCoords}
              block
            >
              {hasCoords ? "Open in Map" : "Location not available"}
            </Button>
          </div>
        </>
      )}

      <MapDrawer
        open={mapOpen}
        onClose={() => setMapOpen(false)}
        title={user ? `${fullName} — Location` : "Location"}
        lat={lat}
        lng={lng}
        items={mapItems}
        resolvedAddress={resolvedAddress}
        addressLoading={addressLoading}
        addressError={addressError}
      />
    </Drawer>
  );
};

export default CustomerDetailDrawer;
