import React from 'react';
import { Button, Form, Input, Select } from 'antd';
import './AddVehicle.css';

const AddVehicle = () => {
  const [form] = Form.useForm();

  const onFinish = (values) => {
    console.log('Form values:', values);
  };

  return (
    <div className="add-vehicle-container">
      <div className="add-vehicle-header">
        <h2>Add New Vehicle</h2>
      </div>
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        className="add-vehicle-form"
      >
        <Form.Item
          name="licensePlate"
          label="License Plate Number"
          rules={[{ required: true, pattern: /^[A-Z]{2}-[A-Z]{2}-[A-Z]{2}-\d{4}$/, message: 'Please enter valid format (XX-XX-XX-XXXX)' }]}
        >
          <Input placeholder="XX-XX-XX-XXXX" />
        </Form.Item>

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

        {/* Add other form fields here */}

        <Form.Item>
          <Button type="primary" htmlType="submit">
            Add Vehicle
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default AddVehicle;