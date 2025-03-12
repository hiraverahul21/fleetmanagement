import React, { useState } from 'react';
import { Table, Button, Input, Space, Form } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import './AddRoute.css';

const AddRoute = () => {
  const [pickupPoints, setPickupPoints] = useState([]);
  const [form] = Form.useForm();

  const columns = [
    {
      title: 'Pickup Point',
      dataIndex: 'location',
      key: 'location',
      width: '30%',
    },
    {
      title: 'Arrival Time',
      dataIndex: 'arrivalTime',
      key: 'arrivalTime',
      width: '20%',
    },
    {
      title: 'Expected Load',
      dataIndex: 'expectedLoad',
      key: 'expectedLoad',
      width: '20%',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record, index) => (
        <Button 
          type="text" 
          danger 
          icon={<DeleteOutlined />}
          onClick={() => handleDeletePoint(index)}
        />
      ),
    },
  ];

  const handleAddPoint = () => {
    const values = form.getFieldsValue();
    setPickupPoints([...pickupPoints, {
      key: pickupPoints.length,
      location: values.location || '',
      arrivalTime: values.arrivalTime || '',
      expectedLoad: values.expectedLoad || '',
    }]);
    form.resetFields();
  };

  const handleDeletePoint = (index) => {
    setPickupPoints(pickupPoints.filter((_, i) => i !== index));
  };

  return (
    <div className="add-route-container">
      <h2>Route Management</h2>
      <div className="route-content">
        <div className="map-container">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m24!1m12!1m3!1d60575.94133977527!2d73.81958919999999!3d18.542643499999998!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!4m9!4e0!4m3!3m2!1d18.629781099999998!2d73.7997094!4m3!3m2!1d18.508934!2d73.9259102!5e0!3m2!1sen!2sin!4v1709561245310!5m2!1sen!2sin"
            width="100%"
            height="400"
            style={{ border: 0, borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
            allowFullScreen={true}
            loading="lazy"
          ></iframe>
        </div>
        
        <div className="pickup-points-section">
          <h3>Pickup Points</h3>
          <Form form={form} layout="inline" className="add-point-form">
            <Form.Item name="location">
              <Input placeholder="Location" />
            </Form.Item>
            <Form.Item name="arrivalTime">
              <Input placeholder="Arrival Time" />
            </Form.Item>
            <Form.Item name="expectedLoad">
              <Input placeholder="Expected Load" />
            </Form.Item>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAddPoint}>
              Add Point
            </Button>
          </Form>
          
          <Table 
            columns={columns} 
            dataSource={pickupPoints}
            pagination={false}
            className="pickup-points-table"
          />
        </div>

        <div className="form-actions">
          <Button type="primary" size="large">
            Save Route
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AddRoute;