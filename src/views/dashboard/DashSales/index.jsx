import React from 'react';
import { Row, Col, Card } from 'react-bootstrap';
import Chart from 'react-apexcharts';
import {
  UserOutlined,
  DollarOutlined,
  ShoppingOutlined,
  RiseOutlined,
  CheckCircleOutlined,
  SmileOutlined
} from '@ant-design/icons';

import FlatCard from 'components/Widgets/Statistic/FlatCard';
import ProductCard from 'components/Widgets/Statistic/ProductCard';
import FeedTable from 'components/Widgets/FeedTable';
import { SalesCustomerSatisfactionChartData } from './chart/sales-customer-satisfication-chart';
import { SalesAccountChartData } from './chart/sales-account-chart';
import { SalesSupportChartData } from './chart/sales-support-chart';
import { SalesSupportChartData1 } from './chart/sales-support-chart1';
import feedData from 'data/feedData';

export default function DashSales() {
  return (
    <div className="page-container">
      {/* Executive Dashboard Header */}
      <div className="page-header-card">
        <div className="header-title-block">
          <h2>GoGreen Operations Dashboard</h2>
          <p>Real-time quick-commerce analytics, order revenue, active customer growth, and store operations summary.</p>
        </div>
      </div>

      {/* Primary KPI Stats Grid */}
      <div className="page-stats-grid">
        <div className="page-stat-card">
          <div className="stat-meta">
            <div className="stat-label">Total Customers</div>
            <div className="stat-number">1,248</div>
          </div>
          <div className="stat-icon" style={{ background: '#e0f2fe', color: '#0284c7' }}>
            <UserOutlined />
          </div>
        </div>

        <div className="page-stat-card">
          <div className="stat-meta">
            <div className="stat-label">Total Revenue</div>
            <div className="stat-number">₹1,25,480</div>
          </div>
          <div className="stat-icon" style={{ background: '#dcfce7', color: '#088b46' }}>
            <DollarOutlined />
          </div>
        </div>

        <div className="page-stat-card">
          <div className="stat-meta">
            <div className="stat-label">Total Orders</div>
            <div className="stat-number">3,550</div>
          </div>
          <div className="stat-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
            <ShoppingOutlined />
          </div>
        </div>

        <div className="page-stat-card">
          <div className="stat-meta">
            <div className="stat-label">Monthly Growth</div>
            <div className="stat-number">+24.5%</div>
          </div>
          <div className="stat-icon" style={{ background: '#f3e8ff', color: '#9333ea' }}>
            <RiseOutlined />
          </div>
        </div>
      </div>

      {/* Analytics Charts & Detail Cards */}
      <Row className="g-4">
        {/* Sales Chart Section */}
        <Col md={12} xl={6}>
          <div className="page-content-card" style={{ height: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, borderBottom: '1px solid #f1f5f9', paddingBottom: 12 }}>
              <h4 style={{ margin: 0, fontWeight: 700, color: '#0f172a', fontSize: '16px' }}>Monthly Sales Analytics</h4>
              <span style={{ fontSize: 13, color: '#088b46', fontWeight: 600 }}>₹21,356 Total Sales</span>
            </div>
            <Row className="pb-2">
              <div className="col-auto m-b-10">
                <h3 className="mb-1" style={{ fontWeight: 700, color: '#0f172a' }}>₹21,356.46</h3>
                <span style={{ fontSize: 12, color: '#64748b' }}>Total Gross Sales</span>
              </div>
              <div className="col-auto m-b-10">
                <h3 className="mb-1" style={{ fontWeight: 700, color: '#088b46' }}>₹1,935.60</h3>
                <span style={{ fontSize: 12, color: '#64748b' }}>Daily Average</span>
              </div>
            </Row>
            <Chart {...SalesAccountChartData()} />
          </div>
        </Col>

        {/* Customer Satisfaction Chart */}
        <Col md={12} xl={6}>
          <div className="page-content-card" style={{ height: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, borderBottom: '1px solid #f1f5f9', paddingBottom: 12 }}>
              <h4 style={{ margin: 0, fontWeight: 700, color: '#0f172a', fontSize: '16px' }}>Customer Satisfaction</h4>
              <SmileOutlined style={{ fontSize: 20, color: '#088b46' }} />
            </div>
            <p style={{ fontSize: 13, color: '#64748b', marginBottom: 16 }}>
              Internal & external order satisfaction index based on delivered order feedback ratings.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 220 }}>
              <Chart type="pie" {...SalesCustomerSatisfactionChartData()} />
            </div>
          </div>
        </Col>

        {/* Recent Activity Feed */}
        <Col md={12} xl={6}>
          <div className="page-content-card">
            <FeedTable {...feedData} />
          </div>
        </Col>

        {/* Conversion & Delivery Metrics */}
        <Col md={12} xl={6}>
          <div className="page-content-card">
            <Row className="g-3">
              <Col md={6}>
                <Card className="support-bar overflow-hidden border-0 shadow-sm" style={{ background: '#f8fafc', borderRadius: 12 }}>
                  <Card.Body className="pb-0">
                    <h2 className="m-0" style={{ fontWeight: 800, color: '#088b46' }}>53.94%</h2>
                    <span style={{ fontWeight: 600, color: '#0f172a' }}>Conversion Rate</span>
                    <p style={{ fontSize: 12, color: '#64748b', margin: '8px 0' }}>Order conversions vs store visitors.</p>
                  </Card.Body>
                  <Chart {...SalesSupportChartData()} />
                </Card>
              </Col>
              <Col md={6}>
                <Card className="support-bar overflow-hidden border-0 shadow-sm" style={{ background: '#f8fafc', borderRadius: 12 }}>
                  <Card.Body className="pb-0">
                    <h2 className="m-0" style={{ fontWeight: 800, color: '#0284c7' }}>1,432</h2>
                    <span style={{ fontWeight: 600, color: '#0f172a' }}>Delivered Orders</span>
                    <p style={{ fontSize: 12, color: '#64748b', margin: '8px 0' }}>Successfully fulfilled customer orders.</p>
                  </Card.Body>
                  <Chart type="bar" {...SalesSupportChartData1()} />
                </Card>
              </Col>
            </Row>
          </div>
        </Col>
      </Row>
    </div>
  );
}
