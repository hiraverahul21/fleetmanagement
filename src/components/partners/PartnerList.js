import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Modal, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { getPartners } from '../../services/partnerService';
import AddPartner from './AddPartner';
import './PartnerList.css';

const PartnerList = () => {
  const [partners, setPartners] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingPartner, setEditingPartner] = useState(null);

  const fetchPartners = async () => {
    try {
      setLoading(true);
      const data = await getPartners();
      setPartners(data);
    } catch (error) {
      message.error('Failed to fetch partners');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPartners();
  }, []);

  const handleEdit = (record) => {
    setEditingPartner(record);
    setIsModalVisible(true);
  };

  const handleAddSuccess = () => {
    setIsModalVisible(false);
    setEditingPartner(null);
    fetchPartners();
    message.success(editingPartner ? 'Partner updated successfully' : 'Partner added successfully');
  };

  const columns = [
    { title: 'Partner Name', dataIndex: 'name', key: 'name' },
    { title: 'Contact Person', dataIndex: 'contact_person', key: 'contact_person' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Phone', dataIndex: 'phone', key: 'phone' },
    { title: 'Status', dataIndex: 'status', key: 'status' },
    { 
      title: 'Bank Details',
      children: [
        { title: 'Account Name', dataIndex: 'account_name', key: 'account_name' },
        { title: 'Bank Name', dataIndex: 'bank_name', key: 'bank_name' },
        { title: 'Branch', dataIndex: 'bank_branch', key: 'bank_branch' },
        { title: 'IFSC Code', dataIndex: 'ifsc_code', key: 'ifsc_code' },
      ]
    },
    { 
      title: 'Payment Terms', 
      dataIndex: 'payment_terms', 
      key: 'payment_terms',
      ellipsis: true,
      width: 200
    },
    {
      title: 'Actions',
      key: 'actions',
      fixed: 'right',
      width: 120,
      render: (_, record) => (
        <Space>
          <Button type="link" onClick={() => handleEdit(record)}>Edit</Button>
          <Button type="link" danger>Delete</Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="partner-list-container">
      <div className="partner-list-header">
        <h2>Partner Management</h2>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={() => {
            setEditingPartner(null);
            setIsModalVisible(true);
          }}
        >
          Add Partner
        </Button>
      </div>

      <Table 
        columns={columns} 
        dataSource={partners}
        rowKey="id"
        scroll={{ x: 1500 }}
        loading={loading}
        bordered
        rowClassName={(record) => record.status === 'active' ? 'active-row' : 'inactive-row'}
      />

      <Modal
        title={editingPartner ? "Edit Partner" : "Add New Partner"}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setEditingPartner(null);
        }}
        width={1000}
        footer={null}
      >
        <AddPartner onSuccess={handleAddSuccess} initialValues={editingPartner} />
      </Modal>
    </div>
  );
};

export default PartnerList;