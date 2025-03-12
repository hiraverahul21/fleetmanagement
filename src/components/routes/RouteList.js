import React, { useState, useEffect } from 'react';
import { Table, Button, Tag, Space, Modal, Form, Input, message } from 'antd';
import { PlusOutlined, EnvironmentOutlined, MinusCircleOutlined } from '@ant-design/icons';
import axios from 'axios';
import './RouteList.css';

const RouteList = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  
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

  const handleAddRoute = async (values) => {
    try {
      setLoading(true);
      const totalKms = values.stops.reduce((sum, stop) => sum + Number(stop.stop_kms), 0);
      
      const routeData = {
        mainRoute: {
          company_id: 1, // You might want to make this dynamic
          route_name: `${values.route_from} - ${values.route_to}`,
          route_from: values.route_from,
          route_to: values.route_to,
          route_total_kms: totalKms
        },
        stops: values.stops.map((stop, index) => ({
          ...stop,
          stop_srno: index + 1
        }))
      };

      await axios.post('http://localhost:5000/api/routes', routeData);
      message.success('Route added successfully');
      setIsModalVisible(false);
      form.resetFields();
      fetchRouteData();
    } catch (error) {
      message.error('Failed to add route');
    } finally {
      setLoading(false);
    }
  };

  // Add this JSX before the main Table component
  const addRouteModal = (
    <Modal
      title="Add New Route"
      visible={isModalVisible}
      onCancel={() => setIsModalVisible(false)}
      footer={null}
      width={800}
    >
      <Form
        form={form}
        onFinish={handleAddRoute}
        layout="vertical"
      >
        <Form.Item
          name="route_from"
          label="Start Point"
          rules={[{ required: true }]}
        >
          <Input placeholder="Enter start point" />
        </Form.Item>

        <Form.Item
          name="route_to"
          label="End Point"
          rules={[{ required: true }]}
        >
          <Input placeholder="Enter end point" />
        </Form.Item>

        <Form.List name="stops">
          {(fields, { add, remove }) => (
            <>
              {fields.map((field, index) => (
                <Space key={field.key} align="baseline">
                  <Form.Item
                    {...field}
                    label="Start From"
                    name={[field.name, 'start_from']}
                    rules={[{ required: true }]}
                  >
                    <Input placeholder="Start location" />
                  </Form.Item>

                  <Form.Item
                    {...field}
                    label="End To"
                    name={[field.name, 'end_to']}
                    rules={[{ required: true }]}
                  >
                    <Input placeholder="End location" />
                  </Form.Item>

                  <Form.Item
                    {...field}
                    label="Distance (KM)"
                    name={[field.name, 'stop_kms']}
                    rules={[{ required: true }]}
                  >
                    <Input type="number" placeholder="Distance" />
                  </Form.Item>

                  <MinusCircleOutlined onClick={() => remove(field.name)} />
                </Space>
              ))}

              <Form.Item>
                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                  Add Stop
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            Save Route
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );

  // Update the Add Route button onClick handler
  return (
    <div className="route-list-container">
      <div className="route-header">
        <h2>Route Management</h2>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={() => setIsModalVisible(true)}
        >
          Add Route
        </Button>
      </div>
      {addRouteModal}

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