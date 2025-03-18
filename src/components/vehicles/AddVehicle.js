import React, { useEffect, useState } from 'react';
import { Button, Form, Input, Select, Row, Col } from 'antd';
import './AddVehicle.css';
import { message } from 'antd';

const AddVehicle = ({ onSuccess, initialValues }) => {
  const [form] = Form.useForm();
  const [partners, setPartners] = useState([]);
  const [petrolPumps, setPetrolPumps] = useState([]);
  const [vehicleCapacities, setVehicleCapacities] = useState([]);

  // Add fetchPetrolPumps function
  const fetchPetrolPumps = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/diesel-vendors');
      const data = await response.json();
      // Ensure we're setting an array
      setPetrolPumps(Array.isArray(data) ? data : []);
    } catch (error) {
      message.error('Failed to fetch petrol pumps');
      console.error('Error:', error);
      setPetrolPumps([]); // Set empty array on error
    }
  };

  // Add fetchVehicleCapacities function
  const fetchVehicleCapacities = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/vehicle-capacities');
      const data = await response.json();
      setVehicleCapacities(data);
    } catch (error) {
      message.error('Failed to fetch vehicle capacities');
      console.error('Error:', error);
    }
  };

  // Add fetchPartners function
  const fetchPartners = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/partners/names');
      const data = await response.json();
      setPartners(data);
    } catch (error) {
      message.error('Failed to fetch partners');
      console.error('Error:', error);
    }
  };

  useEffect(() => {
    fetchPartners();
    fetchPetrolPumps();
    fetchVehicleCapacities();
    if (initialValues) {
      form.setFieldsValue(initialValues);
    }
  }, [initialValues, form]);

  // Define these constants only once
  const vehicleTypes = ['Sedan', 'SUV', 'Van', 'Truck', 'Bus'];
  const fuelTypes = ['Petrol', 'Diesel', 'Electric', 'Hybrid', 'CNG'];
  const statusOptions = ['Active', 'Maintenance', 'Out of Service'];

  // Add handler for capacity change
  const handleCapacityChange = (value) => {
    const selectedCapacity = vehicleCapacities.find(cap => cap.id === value);
    if (selectedCapacity) {
      form.setFieldsValue({ vehicle_average: selectedCapacity.average });
    }
  };

  // Remove duplicate declarations and useEffect
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
          {/* Add Partner dropdown as first field */}
          <Col xs={24} sm={12} lg={8}>
            <Form.Item
              name="partner_id"
              label="Partner"
              rules={[{ required: true, message: 'Please select a partner' }]}
            >
              <Select placeholder="Select partner">
                {partners.map(partner => (
                  <Select.Option key={partner.partnerId} value={partner.partnerId}>
                    {partner.partnerName}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

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
              name="petrol_pump_id"
              label="Petrol Pump"
              rules={[{ required: true, message: 'Please select a petrol pump' }]}
            >
              <Select placeholder="Select petrol pump">
                {Array.isArray(petrolPumps) && petrolPumps.map(pump => (
                  <Select.Option key={pump.id} value={pump.id}>
                    {pump.name} {pump.address ? `- ${pump.address}` : ''}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} lg={8}>
            <Form.Item
              name="vehicle_capacity_id"
              label="Vehicle Capacity"
              rules={[{ required: true, message: 'Please select vehicle capacity' }]}
            >
              <Select 
                placeholder="Select capacity"
                onChange={handleCapacityChange}
              >
                {vehicleCapacities.map(capacity => (
                  <Select.Option key={capacity.id} value={capacity.id}>
                    {capacity.capacity}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} lg={8}>
            <Form.Item
              name="vehicle_average"
              label="Vehicle Average"
            >
              <Input 
                placeholder="Vehicle average" 
                readOnly 
                disabled
              />
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