import React, { useState } from 'react';
import { Button, Table, Modal,Space } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import AddVehicle from './AddVehicle';
import './VehicleList.css';

const VehicleList = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);

  const columns = [
    { title: 'License Plate', dataIndex: 'licensePlate', key: 'licensePlate' },
    { title: 'Make', dataIndex: 'make', key: 'make' },
    { title: 'Model', dataIndex: 'model', key: 'model' },
    { title: 'Year', dataIndex: 'year', key: 'year' },
    { title: 'Color', dataIndex: 'color', key: 'color' },
    { title: 'Vehicle Type', dataIndex: 'vehicleType', key: 'vehicleType' },
    { title: 'Fuel Type', dataIndex: 'fuelType', key: 'fuelType' },
    { title: 'Status', dataIndex: 'status', key: 'status' },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button type="link">Edit</Button>
          <Button type="link" danger>Delete</Button>
        </Space>
      ),
    },
  ];

  const data = []; // You'll populate this with your vehicle data

  return (
    <div className="vehicle-list-container">
      <div className="vehicle-list-header">
        <h2>Vehicle List</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalVisible(true)}>
          Add Vehicle
        </Button>
      </div>

      <Table 
        columns={columns} 
        dataSource={data}
        rowKey="licensePlate"
        scroll={{ x: true }}
      />

      <Modal
        title="Add New Vehicle"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        width={1000}
        footer={null}
      >
        <AddVehicle onSuccess={() => setIsModalVisible(false)} />
      </Modal>
    </div>
  );
};

export default VehicleList;