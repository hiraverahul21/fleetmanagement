import React, { useEffect } from 'react';
import { Form, Input, Button, Select, Row, Col, Card, message } from 'antd';
import { addPartner, updatePartner } from '../../services/partnerService';
import './AddPartner.css';

const AddPartner = ({ onSuccess, initialValues }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (initialValues) {
      // Map database field names to form field names
      const mappedValues = {
        name: initialValues.name,
        contactPerson: initialValues.contact_person,
        email: initialValues.email,
        phone: initialValues.phone,
        status: initialValues.status,
        accountName: initialValues.account_name,
        bankName: initialValues.bank_name,
        bankBranch: initialValues.bank_branch,
        ifscCode: initialValues.ifsc_code,
        paymentTerms: initialValues.payment_terms
      };
      form.setFieldsValue(mappedValues);
    }
  }, [initialValues, form]);

  const onFinish = async (values) => {
    try {
      // Map form field names back to database field names
      const mappedValues = {
        name: values.name,
        contact_person: values.contactPerson,
        email: values.email,
        phone: values.phone,
        status: values.status,
        account_name: values.accountName,
        bank_name: values.bankName,
        bank_branch: values.bankBranch,
        ifsc_code: values.ifscCode,
        payment_terms: values.paymentTerms
      };

      if (initialValues) {
        await updatePartner(initialValues.id, mappedValues);
      } else {
        await addPartner(mappedValues);
      }
      if (onSuccess) {
        onSuccess();
      }
      form.resetFields();
    } catch (error) {
      message.error('Failed to save partner');
      console.error('Error:', error);
    }
  };

  return (
    <div className="add-partner-container">
      <h2>Add New Partner</h2>
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
      >
        <Card title="Basic Information" className="form-section">
          <Row gutter={24}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="name"
                label="Partner Name"
                rules={[{ required: true, message: 'Please enter partner name' }]}
              >
                <Input placeholder="Enter partner name" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="contactPerson"
                label="Contact Person"
                rules={[{ required: true, message: 'Please enter contact person' }]}
              >
                <Input placeholder="Enter contact person name" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: 'Please enter email' },
                  { type: 'email', message: 'Please enter a valid email' }
                ]}
              >
                <Input placeholder="Enter email address" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="phone"
                label="Phone"
                rules={[{ required: true, message: 'Please enter phone number' }]}
              >
                <Input placeholder="Enter phone number" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="status"
                label="Status"
                rules={[{ required: true, message: 'Please select status' }]}
              >
                <Select placeholder="Select status">
                  <Select.Option value="active">Active</Select.Option>
                  <Select.Option value="inactive">Inactive</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Card>

        <Card title="Bank Details" className="form-section">
          <Row gutter={24}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="accountName"
                label="Account Name"
                rules={[{ required: true, message: 'Please enter account name' }]}
              >
                <Input placeholder="Enter account name" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="bankName"
                label="Bank Name"
                rules={[{ required: true, message: 'Please enter bank name' }]}
              >
                <Input placeholder="Enter bank name" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="bankBranch"
                label="Bank Branch"
                rules={[{ required: true, message: 'Please enter bank branch' }]}
              >
                <Input placeholder="Enter bank branch" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="ifscCode"
                label="IFSC Code"
                rules={[{ required: true, message: 'Please enter IFSC code' }]}
              >
                <Input placeholder="Enter IFSC code" />
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item
                name="paymentTerms"
                label="Payment Terms"
                rules={[{ required: true, message: 'Please enter payment terms' }]}
              >
                <Input.TextArea 
                  rows={4} 
                  placeholder="Enter payment terms and conditions" 
                />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        <Form.Item className="form-actions">
          <Button type="primary" htmlType="submit">
            Add Partner
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default AddPartner;