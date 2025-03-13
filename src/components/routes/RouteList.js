import moment from 'moment';
import React, { useState, useEffect } from 'react';
import { Table, Button, Tag, Space, Modal, Form, Input, TimePicker, Select, message } from 'antd';
import { PlusOutlined, EnvironmentOutlined, MinusCircleOutlined } from '@ant-design/icons';
import axios from 'axios';
import './RouteList.css';

const RouteList = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [mainRouteData, setMainRouteData] = useState([]);
  const [routeStopsData, setRouteStopsData] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState(null);

  useEffect(() => {
    fetchRouteData();
  }, []);

  const fetchRouteData = async () => {
    try {
      setLoading(true);
      const [mainRoutes, stops] = await Promise.all([
        axios.get('http://localhost:5000/api/routes'),
        axios.get('http://localhost:5000/api/route-stops')
      ]);
      setMainRouteData(mainRoutes.data);
      setRouteStopsData(stops.data);
    } catch (error) {
      message.error('Failed to fetch route data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddRoute = async (values) => {
    try {
      setLoading(true);
      const totalKms = values.stops.reduce((sum, stop) => sum + Number(stop.stop_kms), 0);
      
      const routeData = {
        mainRoute: {
          company_id: 1,
          company_route_id: values.company_route_id,
          route_name: `${values.route_from} - ${values.route_to}`,
          route_from: values.route_from,
          route_to: values.route_to,
          route_total_kms: totalKms,
          status: values.status
        },
        stops: values.stops.map((stop, index) => ({
          ...stop,
          stop_srno: index + 1,
          start_time: stop.start_time?.format('HH:mm:ss'),
          end_time: stop.end_time?.format('HH:mm:ss')
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

  const handleEditClick = async (record) => {
    try {
      const stops = routeStopsData.filter(stop => stop.route_id === record.route_id);
      const formattedStops = stops.map(stop => ({
        ...stop,
        start_time: stop.start_time ? moment(stop.start_time, 'HH:mm') : null,
        end_time: stop.end_time ? moment(stop.end_time, 'HH:mm') : null,
      }));

      form.setFieldsValue({
        company_route_id: record.company_route_id,
        route_from: record.route_from,
        route_to: record.route_to,
        status: record.status || 'active',
        stops: formattedStops
      });

      setSelectedRoute(record);
      setIsEditMode(true);
      setIsModalVisible(true);
    } catch (error) {
      message.error('Failed to load route details');
    }
  };

  const handleEditRoute = async (values) => {
    try {
      setLoading(true);
      const totalKms = values.stops.reduce((sum, stop) => sum + Number(stop.stop_kms), 0);
      
      const routeData = {
        mainRoute: {
          company_id: selectedRoute.company_id,
          company_route_id: values.company_route_id,
          route_name: `${values.route_from} - ${values.route_to}`,
          route_from: values.route_from,
          route_to: values.route_to,
          route_total_kms: totalKms,
          status: values.status
        },
        stops: values.stops.map((stop, index) => ({
          ...stop,
          route_id: selectedRoute.route_id,
          stop_srno: index + 1,
          start_time: stop.start_time?.format('HH:mm:ss'),
          end_time: stop.end_time?.format('HH:mm:ss')
        }))
      };
    
      await axios.put(`http://localhost:5000/api/routes/${selectedRoute.route_id}`, routeData);
      message.success('Route updated successfully');
      setIsModalVisible(false);
      setIsEditMode(false);
      setSelectedRoute(null);
      form.resetFields();
      fetchRouteData();
    } catch (error) {
      message.error('Failed to update route');
    } finally {
      setLoading(false);
    }
  };

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
      title: 'Company Route ID',
      dataIndex: 'company_route_id',
      key: 'company_route_id',
      width: '15%'
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: '10%',
      render: (status) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status?.toUpperCase() || 'ACTIVE'}
        </Tag>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      width: '10%',
      render: (_, record) => (
        <Space>
          <Button 
            type="primary" 
            size="small" 
            onClick={() => handleEditClick(record)}
          >
            Edit
          </Button>
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
    },
    { 
      title: 'Start Time',
      dataIndex: 'start_time',
      key: 'start_time',
      width: '15%'
    },
    { 
      title: 'End Time',
      dataIndex: 'end_time',
      key: 'end_time',
      width: '15%'
    }
  ];

  // Update the Modal title and form onFinish
  const addRouteModal = (
    <Modal
      title={isEditMode ? "Edit Route" : "Add New Route"}
      visible={isModalVisible}
      onCancel={() => {
        setIsModalVisible(false);
        setIsEditMode(false);
        setSelectedRoute(null);
        form.resetFields();
      }}
      footer={null}
      width={800}
    >
      <Form
        form={form}
        onFinish={isEditMode ? handleEditRoute : handleAddRoute}
        layout="vertical"
      >
      <Form.Item
        name="company_route_id"
        label="Company Route ID"
        rules={[{ required: true }]}
      >
        <Input placeholder="Enter company route ID" />
      </Form.Item>

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

      <Form.Item
        name="status"
        label="Status"
        initialValue="active"
        rules={[{ required: true }]}
      >
        <Select>
          <Select.Option value="active">Active</Select.Option>
          <Select.Option value="inactive">Inactive</Select.Option>
        </Select>
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

                <Form.Item
                  {...field}
                  label="Start Time"
                  name={[field.name, 'start_time']}
                  rules={[{ required: true }]}
                >
                  <TimePicker format="HH:mm" />
                </Form.Item>

                <Form.Item
                  {...field}
                  label="End Time"
                  name={[field.name, 'end_time']}
                  rules={[{ required: true }]}
                >
                  <TimePicker format="HH:mm" />
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