import { useState, useEffect } from 'react';
import { Form, Input, Select, Row, Col } from 'antd';
import useLanguage from '@/locale/useLanguage';

const { TextArea } = Input;

export default function QueryForm({ current = null }) {
  const translate = useLanguage();

  const statusOptions = [
    { value: 'open', label: translate('open') },
    { value: 'in-progress', label: translate('in_progress') },
    { value: 'resolved', label: translate('resolved') },
    { value: 'closed', label: translate('closed') },
  ];

  return (
    <>
      <Row gutter={[12, 0]}>
        <Col className="gutter-row" span={12}>
          <Form.Item
            name="customerName"
            label={translate('Customer Name')}
            rules={[
              {
                required: true,
                message: translate('Customer name is required'),
              },
              {
                min: 2,
                message: translate('Customer name must be at least 2 characters'),
              },
            ]}
          >
            <Input placeholder={translate('Enter customer name')} />
          </Form.Item>
        </Col>

        <Col className="gutter-row" span={12}>
          <Form.Item
            name="email"
            label={translate('Email')}
            rules={[
              {
                required: true,
                message: translate('Email is required'),
              },
              {
                type: 'email',
                message: translate('Please enter a valid email'),
              },
            ]}
          >
            <Input placeholder={translate('Enter email address')} />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={[12, 0]}>
        <Col className="gutter-row" span={12}>
          <Form.Item
            name="status"
            label={translate('Status')}
            initialValue="open"
            rules={[
              {
                required: true,
                message: translate('Status is required'),
              },
            ]}
          >
            <Select options={statusOptions} placeholder={translate('Select status')} />
          </Form.Item>
        </Col>

        <Col className="gutter-row" span={12}>
          <Form.Item name="resolution" label={translate('Resolution')}>
            <Input placeholder={translate('Enter resolution (optional)')} />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={[12, 0]}>
        <Col className="gutter-row" span={24}>
          <Form.Item
            name="description"
            label={translate('Description')}
            rules={[
              {
                required: true,
                message: translate('Description is required'),
              },
              {
                min: 10,
                message: translate('Description must be at least 10 characters'),
              },
            ]}
          >
            <TextArea
              rows={4}
              placeholder={translate('Enter query description')}
              maxLength={1000}
              showCount
            />
          </Form.Item>
        </Col>
      </Row>
    </>
  );
}
