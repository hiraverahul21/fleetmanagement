import React, { useEffect } from 'react';
import { Button, Form, Input, Select, Row, Col } from 'antd';
import './AddVehicle.css';
import { message } from 'antd';

const AddVehicle = ({ onSuccess, initialValues }) => {
  const [form] = Form.useForm();

  const vehicleTypes = ['Sedan', 'SUV', 'Van', 'Truck', 'Bus'];
  const fuelTypes = ['Petrol', 'Diesel', 'Electric', 'Hybrid', 'CNG'];
  const statusOptions = ['Active', 'Maintenance', 'Out of Service'];

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue(initialValues);
    }
  }, [initialValues, form]);

  const onFinish = async (values) => {
    try {
      const url = initialValues 
        ? `http://localhost:5000/api/vehicles/${initialValues.id}`
        : 'http://localhost:5000/api/vehicles';
  
      const method = initialValues ? 'PUT' : 'POST';
  
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });
      
      if (response.ok) {
        message.success(`Vehicle ${initialValues ? 'updated' : 'added'} successfully`);
        form.resetFields();
        if (onSuccess) {
          onSuccess();
        }
      }
    } catch (error) {
      message.error(`Error ${initialValues ? 'updating' : 'adding'} vehicle`);
      console.error('Error:', error);
    }
  };
  
  return (
    <div className="add-vehicle-container">
      {!onSuccess && ( // Only show header in standalone mode
        <div className="add-vehicle-header">
          <h2>Add New Vehicle</h2>
        </div>
      )}
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        className="add-vehicle-form"
      >
        <Row gutter={24}>
          <Col xs={24} sm={12} lg={8}>
            <Form.Item
              name="licensePlate"
              label="License Plate"
              rules={[{ 
                required: true, 
                pattern: /^[A-Z]{2}-(?:\d{1,3})-[A-Z]{2}-\d{4}$/, 
                message: 'Please enter valid format (e.g., MH-14-FG-0711, MH-140-FG-0711)' 
              }]}
            >
              <Input placeholder="MH-14-FG-0711" />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} lg={8}>
            <Form.Item
              name="make"
              label="Make"
              rules={[{ required: true }]}
            >
              <Select placeholder="Select manufacturer">
                <Select.Option value="TATA">TATA</Select.Option>
                <Select.Option value="MAHINDRA">MAHINDRA</Select.Option>
                <Select.Option value="Toyota">Toyota</Select.Option>
                <Select.Option value="Ford">Ford</Select.Option>
              </Select>
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} lg={8}>
            <Form.Item
              name="model"
              label="Model"
              rules={[{ required: true }]}
            >
              <Input placeholder="Enter model" />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} lg={8}>
            <Form.Item
              name="year"
              label="Year"
              rules={[{ required: true }]}
            >
              <Input type="number" placeholder="Enter year" />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} lg={8}>
            <Form.Item
              name="color"
              label="Color"
              rules={[{ required: true }]}
            >
              <Input placeholder="Enter color" />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} lg={8}>
            <Form.Item
              name="vehicleType"
              label="Vehicle Type"
              rules={[{ required: true }]}
            >
              <Select placeholder="Select vehicle type">
                {vehicleTypes.map(type => (
                  <Select.Option key={type} value={type}>{type}</Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} lg={8}>
            <Form.Item
              name="fuelType"
              label="Fuel Type"
              rules={[{ required: true }]}
            >
              <Select placeholder="Select fuel type">
                {fuelTypes.map(type => (
                  <Select.Option key={type} value={type}>{type}</Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} lg={8}>
            <Form.Item
              name="engineNumber"
              label="Engine Number"
              rules={[{ required: true }]}
            >
              <Input placeholder="Enter engine number" />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} lg={8}>
            <Form.Item
              name="chassisNumber"
              label="Chassis Number"
              rules={[{ required: true }]}
            >
              <Input placeholder="Enter chassis number" />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} lg={8}>
            <Form.Item
              name="status"
              label="Status"
              rules={[{ required: true }]}
            >
              <Select placeholder="Select status">
                {statusOptions.map(status => (
                  <Select.Option key={status} value={status}>{status}</Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item className="form-actions">
          <Button type="primary" htmlType="submit">
            Add Vehicle
          </Button>
          {onSuccess && (
            <Button onClick={() => onSuccess()} style={{ marginLeft: 8 }}>
              Cancel
            </Button>
          )}
        </Form.Item>
      </Form>
    </div>
  );
};

export default AddVehicle;