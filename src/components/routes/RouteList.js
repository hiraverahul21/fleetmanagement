import React from 'react';
import { Table, Button, Space } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import './RouteList.css';

const RouteList = () => {
  const columns = [
    { title: 'Route ID', dataIndex: 'route_id', key: 'route_id' },
    { title: 'Route Name', dataIndex: 'route_name', key: 'route_name' },
    { title: 'Start Location', dataIndex: 'start_location', key: 'start_location' },
    { title: 'End Location', dataIndex: 'end_location', key: 'end_location' },
    { title: 'Distance (KM)', dataIndex: 'distance', key: 'distance' },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button type="primary" icon={<EditOutlined />}>Edit</Button>
          <Button type="primary" danger icon={<DeleteOutlined />}>Delete</Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="route-list-container">
      <div className="route-header">
        <h2>Route Management</h2>
        <Button type="primary" icon={<PlusOutlined />}>
          Add Route
        </Button>
      </div>
      <Table 
        columns={columns} 
        dataSource={[]}
        rowKey="route_id"
      />
    </div>
  );
};

export default RouteList;