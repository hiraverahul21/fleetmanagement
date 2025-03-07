import React from 'react';
import { Card, Row, Col, Statistic, Progress, Table } from 'antd';
import { CarOutlined, ToolOutlined, ExclamationCircleOutlined, DollarOutlined } from '@ant-design/icons';
import { LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import './Overview.css';

const Overview = () => {
  const stats = {
    totalVehicles: 45,
    activeVehicles: 38,
    maintenanceCount: 7,
    monthlyExpenses: 25000
  };

  const vehicleStatus = [
    { name: 'Active', value: 38, color: '#52c41a' },
    { name: 'Maintenance', value: 5, color: '#faad14' },
    { name: 'Inactive', value: 2, color: '#ff4d4f' }
  ];

  const recentActivities = [
    { key: '1', vehicle: 'TN-01-AB-1234', activity: 'Maintenance Completed', date: '2024-01-15' },
    { key: '2', vehicle: 'TN-02-CD-5678', activity: 'Fuel Refill', date: '2024-01-14' },
    { key: '3', vehicle: 'TN-03-EF-9012', activity: 'Inspection Due', date: '2024-01-13' }
  ];

  const columns = [
    { title: 'Vehicle', dataIndex: 'vehicle', key: 'vehicle' },
    { title: 'Activity', dataIndex: 'activity', key: 'activity' },
    { title: 'Date', dataIndex: 'date', key: 'date' }
  ];

  return (
    <div className="overview-container">
      <h2>Dashboard Overview</h2>
      
      <Row gutter={[16, 16]} className="stats-cards">
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card">
            <Statistic
              title="Total Vehicles"
              value={stats.totalVehicles}
              prefix={<CarOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card">
            <Statistic
              title="Active Vehicles"
              value={stats.activeVehicles}
              prefix={<CarOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card">
            <Statistic
              title="In Maintenance"
              value={stats.maintenanceCount}
              prefix={<ToolOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card">
            <Statistic
              title="Monthly Expenses"
              value={stats.monthlyExpenses}
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} className="dashboard-charts">
        <Col xs={24} lg={12}>
          <Card title="Vehicle Status" className="chart-card">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={vehicleStatus}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  label
                >
                  {vehicleStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Recent Activities" className="table-card">
            <Table 
              columns={columns} 
              dataSource={recentActivities}
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Overview;