import React from 'react';
import { Row, Col } from 'react-bootstrap';
import { Breadcrumb as AntBreadcrumb, Typography } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import { Link, useLocation } from 'react-router-dom';
import { BASE_TITLE } from 'config/constant';

const { Title } = Typography;

// Helper to format route slugs like "all-unverified-customers" into "All Unverified Customers"
const formatSegment = (segment) => {
  if (!segment) return '';
  return segment
    .replace(/-/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export default function ModernBreadcrumb() {
  const location = useLocation();
  const { pathname } = location;

  const pathSegments = pathname.split('/').filter(Boolean);

  const breadcrumbItems = [
    {
      title: (
        <Link to="/dashboard" style={{ color: '#64748b', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          <HomeOutlined style={{ fontSize: 14, color: '#088b46' }} />
          <span>Home</span>
        </Link>
      ),
      path: '/dashboard',
    },
    ...pathSegments.map((segment, idx) => {
      const url = '/' + pathSegments.slice(0, idx + 1).join('/');
      const formatted = formatSegment(segment);
      const isLast = idx === pathSegments.length - 1;
      return {
        title: isLast ? (
          <span style={{ color: '#088b46', fontWeight: 600 }}>{formatted}</span>
        ) : (
          <Link to={url} style={{ color: '#64748b', textDecoration: 'none' }}>{formatted}</Link>
        ),
        path: url,
      };
    })
  ];

  const lastSegment = pathSegments[pathSegments.length - 1];
  const pageTitle = lastSegment ? formatSegment(lastSegment) : 'Dashboard';
  document.title = pageTitle + ' | ' + BASE_TITLE;

  return (
    <div className="custom-header-breadcrumb">
      <div className="d-flex flex-column justify-content-center">
        <h1 style={{
          fontSize: '20px',
          fontWeight: 700,
          color: '#0f172a',
          margin: 0,
          lineHeight: 1.2,
          letterSpacing: '-0.3px'
        }}>
          {pageTitle}
        </h1>
        <AntBreadcrumb
          items={breadcrumbItems}
          separator={<span style={{ color: '#cbd5e1', margin: '0 4px' }}>/</span>}
          style={{ fontSize: '13px', marginTop: 3 }}
        />
      </div>
    </div>
  );
}