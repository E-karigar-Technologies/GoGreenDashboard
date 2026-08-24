import React from "react";
import { Drawer, Descriptions, Spin, Typography, Empty } from "antd";
import { MapPin, ExternalLink } from "lucide-react";

const { Text } = Typography;

const buildOsmEmbedUrl = (lat, lng) => {
  const delta = 0.005;
  const minLon = Number(lng) - delta;
  const minLat = Number(lat) - delta;
  const maxLon = Number(lng) + delta;
  const maxLat = Number(lat) + delta;
  return `https://www.openstreetmap.org/export/embed.html?bbox=${minLon}%2C${minLat}%2C${maxLon}%2C${maxLat}&layer=mapnik&marker=${lat}%2C${lng}`;
};

const buildOsmLinkUrl = (lat, lng) =>
  `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=17/${lat}/${lng}`;

/**
 * Generic map drawer.
 *
 * Props:
 *  - open: boolean
 *  - onClose: () => void
 *  - title?: string                  (drawer header)
 *  - lat, lng: number | string       (coordinates)
 *  - items?: Array<{ label, value }> (extra key/value rows shown above the map)
 *  - resolvedAddress?: string        (reverse-geocoded address)
 *  - addressLoading?: boolean
 *  - addressError?: string
 *  - width?: number                  (default 520)
 *  - zIndex?: number                 (default 1500, sits above parent drawer)
 */
const MapDrawer = ({
  open,
  onClose,
  title = "Location",
  lat,
  lng,
  items = [],
  resolvedAddress,
  addressLoading,
  addressError,
  width = 480,
  zIndex = 2000,
}) => {
  const hasCoords =
    lat !== null && lat !== undefined && lat !== "" &&
    lng !== null && lng !== undefined && lng !== "";

  return (
    <Drawer
      title={
        <span>
          <MapPin size={16} style={{ verticalAlign: -3, marginRight: 6 }} />
          {title}
        </span>
      }
      placement="right"
      width={width}
      open={open}
      onClose={onClose}
      zIndex={zIndex}
      extra={
        hasCoords ? (
          <a
            href={buildOsmLinkUrl(lat, lng)}
            target="_blank"
            rel="noreferrer"
            style={{ fontSize: 12 }}
          >
            Open in OSM <ExternalLink size={12} style={{ verticalAlign: -2 }} />
          </a>
        ) : null
      }
    >
      {items.length > 0 && (
        <Descriptions
          column={1}
          size="small"
          bordered
          style={{ marginBottom: 16 }}
        >
          {items
            .filter((it) => it && it.label !== undefined)
            .map((it, idx) => (
              <Descriptions.Item key={`${it.label}-${idx}`} label={it.label}>
                {it.value === null || it.value === undefined || it.value === ""
                  ? "—"
                  : it.value}
              </Descriptions.Item>
            ))}
        </Descriptions>
      )}

      {hasCoords ? (
        <>
          <div
            style={{
              border: "1px solid #f0f0f0",
              borderRadius: 6,
              overflow: "hidden",
            }}
          >
            <iframe
              title={`map-${lat}-${lng}`}
              src={buildOsmEmbedUrl(lat, lng)}
              width="100%"
              height="320px"
              style={{ border: 0, display: "block" }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
          <div style={{ marginTop: 10, fontSize: 12, color: "#666" }}>
            <div>
              <Text type="secondary">Coordinates: </Text>
              {Number(lat).toFixed(6)}, {Number(lng).toFixed(6)}
            </div>
            <div style={{ marginTop: 6 }}>
              <Text type="secondary">Resolved address: </Text>
              {addressLoading ? (
                <Spin size="small" />
              ) : addressError ? (
                <Text type="danger">{String(addressError)}</Text>
              ) : resolvedAddress ? (
                <span>{resolvedAddress}</span>
              ) : (
                <Text type="secondary">—</Text>
              )}
            </div>
          </div>
        </>
      ) : (
        <Empty
          description="No coordinates available"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      )}
    </Drawer>
  );
};

export default MapDrawer;
