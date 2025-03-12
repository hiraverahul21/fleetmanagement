import React from 'react';
import { Table, Button, Tag, Space } from 'antd';
import { PlusOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import './RouteList.css';

const RouteList = () => {
  const navigate = useNavigate();

  const mainRouteData = [
    {
      route_id: 1,
      company_id: 1,
      route_name: 'Pune - Hinjewadi',
      route_from: 'Pune',
      route_to: 'Hinjewadi',
      route_total_kms: 29
    }
  ];

  const routeStopsData = [
    { route_id: 1, stop_srno: 1, start_from: 'Pune', end_to: 'PCMC', stop_kms: 3 },
    { route_id: 1, stop_srno: 2, start_from: 'PCMC', end_to: 'Univercity', stop_kms: 12 },
    { route_id: 1, stop_srno: 3, start_from: 'Univercity', end_to: 'Aundh', stop_kms: 6 },
    { route_id: 1, stop_srno: 4, start_from: 'Aundh', end_to: 'Hinjewadi', stop_kms: 8 }
  ];

  const mainColumns = [
    {
      title: 'Route ID',
      dataIndex: 'route_id',
      key: 'route_id',
      width: '10%'
    },
    {
      title: 'Route Name',
      dataIndex: 'route_name',
      key: 'route_name',
      width: '25%'
    },
    {
      title: 'From',
      dataIndex: 'route_from',
      key: 'route_from',
      width: '20%',
      render: (text) => (
        <Tag icon={<EnvironmentOutlined />} color="blue">
          {text}
        </Tag>
      )
    },
    {
      title: 'To',
      dataIndex: 'route_to',
      key: 'route_to',
      width: '20%',
      render: (text) => (
        <Tag icon={<EnvironmentOutlined />} color="green">
          {text}
        </Tag>
      )
    },
    {
      title: 'Total Distance (KM)',
      dataIndex: 'route_total_kms',
      key: 'route_total_kms',
      width: '15%'
    },
    {
      title: 'Actions',
      key: 'actions',
      width: '10%',
      render: (_, record) => (
        <Space>
          <Button type="primary" size="small">Edit</Button>
          <Button type="primary" danger size="small">Delete</Button>
        </Space>
      ),
    }
  ];

  const stopColumns = [
    { 
      title: 'Stop No',
      dataIndex: 'stop_srno',
      key: 'stop_srno',
      width: '10%'
    },
    { 
      title: 'Start From',
      dataIndex: 'start_from',
      key: 'start_from',
      width: '30%'
    },
    { 
      title: 'End To',
      dataIndex: 'end_to',
      key: 'end_to',
      width: '30%'
    },
    { 
      title: 'Stop Distance (KM)',
      dataIndex: 'stop_kms',
      key: 'stop_kms',
      width: '20%'
    }
  ];

  return (
    <div className="route-list-container">
      <div className="route-header">
        <h2>Route Management</h2>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={() => navigate('/dashboard/routes/add')}
        >
          Add Route
        </Button>
      </div>

      <Table 
        className="routes-table"
        dataSource={mainRouteData}
        columns={mainColumns}
        expandable={{
          expandedRowRender: (record) => {
            const stops = routeStopsData.filter(stop => stop.route_id === record.route_id);
            return (
              <div className="route-stops-detail">
                <h4>Route Stops</h4>
                <Table 
                  columns={stopColumns}
                  dataSource={stops}
                  pagination={false}
                  size="small"
                />
              </div>
            );
          },
        }}
        rowKey="route_id"
      />
    </div>
  );
};

export default RouteList;