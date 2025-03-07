import React, { useState } from 'react';
import { Switch, Button, Table } from 'antd';
import { EditOutlined, PlusOutlined } from '@ant-design/icons';
import './VehicleList.css';

const VehicleList = () => {
  const [vehicles, setVehicles] = useState([
    {
      id: 1,
      licensePlate: 'KA-01-AB-1234',
      make: 'TATA',
      model: 'Nexon',
      year: '2023',
      color: 'White',
      vehicleType: 'SUV',
      fuelType: 'Petrol',
      engineNumber: 'ENG123456',
      chassisNumber: 'CHS123456',
      isActive: true,
    },
    // Add more sample data as needed
  ]);

  const columns = [
    {
      title: 'License Plate',
      dataIndex: 'licensePlate',
      key: 'licensePlate',
    },
    {
      title: 'Make',
      dataIndex: 'make',
      key: 'make',
    },
    {
      title: 'Model',
      dataIndex: 'model',
      key: 'model',
    },
    {
      title: 'Year',
      dataIndex: 'year',
      key: 'year',
    },
    {
      title: 'Color',
      dataIndex: 'color',
      key: 'color',
    },
    {
      title: 'Vehicle Type',
      dataIndex: 'vehicleType',
      key: 'vehicleType',
    },
    {
      title: 'Fuel Type',
      dataIndex: 'fuelType',
      key: 'fuelType',
    },
    {
      title: 'Engine Number',
      dataIndex: 'engineNumber',
      key: 'engineNumber',
    },
    {
      title: 'Chassis Number',
      dataIndex: 'chassisNumber',
      key: 'chassisNumber',
    },
    {
      title: 'Status',
      key: 'isActive',
      render: (_, record) => (
        <Switch
          checked={record.isActive}
          onChange={(checked) => handleStatusChange(record.id, checked)}
        />
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Button
          type="primary"
          icon={<EditOutlined />}
          onClick={() => handleEdit(record)}
        >
          Edit
        </Button>
      ),
    },
  ];

  const handleStatusChange = (id, status) => {
    setVehicles(vehicles.map(vehicle =>
      vehicle.id === id ? { ...vehicle, isActive: status } : vehicle
    ));
  };

  const handleEdit = (vehicle) => {
    // Handle edit action
    console.log('Edit vehicle:', vehicle);
  };

  const handleAddVehicle = () => {
    // Handle add vehicle action
    console.log('Add new vehicle');
  };

  return (
    <div className="vehicle-list-container">
      <div className="vehicle-list-header">
        <h2>Vehicle List</h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAddVehicle}
        >
          Add Vehicle
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={vehicles}
        rowKey="id"
        scroll={{ x: true }}
      />
    </div>
  );
};

export default VehicleList;