import React, { useState, useEffect } from 'react';
import { Card, Calendar, Modal, Form, Input, DatePicker, Select, Button, List, Tag, message, Row, Col, Typography, Space } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, CalendarOutlined } from '@ant-design/icons';
import moment from 'moment';
import './AcademicCalendar.css';
import { getCalendarEvents, addCalendarEvent, updateCalendarEvent, deleteCalendarEvent, initializeSampleData } from '../services/localStorage';

const { Option } = Select;
const { Title } = Typography;

const AcademicCalendar = () => {
  const [events, setEvents] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingEvent, setEditingEvent] = useState(null);

  useEffect(() => {
    // Initialize sample data if needed
    initializeSampleData();
    // Load events from local storage
    setEvents(getCalendarEvents());
  }, []);

  const handleAddEvent = () => {
    setEditingEvent(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEditEvent = (event) => {
    setEditingEvent(event);
    form.setFieldsValue({
      title: event.title,
      date: moment(event.date),
      type: event.type,
      description: event.description
    });
    setIsModalVisible(true);
  };

  const handleDeleteEvent = (eventId) => {
    const updatedEvents = deleteCalendarEvent(eventId);
    setEvents(updatedEvents);
    message.success('Event deleted successfully');
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      const eventData = {
        title: values.title,
        date: values.date.toDate(),
        type: values.type,
        description: values.description
      };

      let updatedEvents;
      if (editingEvent) {
        updatedEvents = updateCalendarEvent(editingEvent.id, eventData);
        message.success('Event updated successfully');
      } else {
        updatedEvents = addCalendarEvent(eventData);
        message.success('Event added successfully');
      }

      setEvents(updatedEvents);
      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      message.error('Error saving event: ' + error.message);
    }
  };

  const dateCellRender = (value) => {
    const date = value.format('YYYY-MM-DD');
    const dayEvents = events.filter(event => 
      moment(event.date).format('YYYY-MM-DD') === date
    );

    return (
      <ul className="events">
        {dayEvents.map(event => (
          <li key={event.id}>
            <Tag color={
              event.type === 'HOLIDAY' ? 'red' :
              event.type === 'EXAM' ? 'blue' :
              'green'
            }>
              {event.title}
            </Tag>
          </li>
        ))}
      </ul>
    );
  };

  const getNextHoliday = () => {
    const today = moment();
    const upcomingHolidays = events
      .filter(event => event.type === 'HOLIDAY' && moment(event.date).isAfter(today))
      .sort((a, b) => moment(a.date).diff(moment(b.date)));

    return upcomingHolidays[0];
  };

  const nextHoliday = getNextHoliday();

  return (
    <div style={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column', 
      padding: '0', 
      overflow: 'hidden', 
      margin: '0',
      borderRadius: '16px',
      background: '#ffffff',
      boxShadow: '0 4px 20px rgba(159, 179, 223, 0.15)',
      border: '1px solid rgba(159, 179, 223, 0.2)'
    }}>
      <Row justify="space-between" align="middle" style={{ padding: '16px 24px' }}>
        <Col>
          <Title level={3} style={{ 
            color: '#7B83EB',
            margin: 0,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <CalendarOutlined style={{ fontSize: '24px', color: '#7B83EB' }} />
            Academic Calendar
          </Title>
        </Col>
        <Col>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAddEvent}
            style={{
              height: '32px',
              borderRadius: '6px',
              boxShadow: '0 2px 6px rgba(159, 179, 223, 0.15)',
              background: '#7B83EB',
              border: 'none',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              transition: 'all 0.3s ease',
              padding: '0 12px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(159, 179, 223, 0.25)';
              e.currentTarget.style.background = '#8ba1d1';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 6px rgba(159, 179, 223, 0.15)';
              e.currentTarget.style.background = '#7B83EB';
            }}
          >
            Add Event
          </Button>
        </Col>
      </Row>

      <Card
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          borderRadius: '12px',
          boxShadow: '0 4px 16px rgba(159, 179, 223, 0.2)',
          overflow: 'hidden',
          background: '#ffffff',
          border: '1px solid rgba(159, 179, 223, 0.3)',
          margin: '0 16px 16px 16px',
          padding: 0
        }}
        bodyStyle={{ padding: 0, height: '100%' }}
      >
        <Row gutter={[16, 16]} style={{ padding: '16px' }}>
          <Col xs={24} lg={16}>
            <Card 
              style={{ 
                borderRadius: '12px',
                boxShadow: '0 4px 16px rgba(159, 179, 223, 0.2)',
                border: '1px solid rgba(159, 179, 223, 0.3)'
              }}
            >
              <Calendar
                dateCellRender={dateCellRender}
                fullscreen={false}
                style={{ background: '#fff' }}
                className="custom-calendar"
              />
            </Card>
          </Col>
          <Col xs={24} lg={8}>
            <Card 
              title="Upcoming Events" 
              style={{ 
                borderRadius: '12px',
                boxShadow: '0 4px 16px rgba(159, 179, 223, 0.2)',
                border: '1px solid rgba(159, 179, 223, 0.3)',
                marginBottom: '16px'
              }}
            >
              <List
                dataSource={events
                  .filter(event => moment(event.date).isAfter(moment()))
                  .sort((a, b) => moment(a.date).diff(moment(b.date)))
                  .slice(0, 5)}
                renderItem={event => (
                  <List.Item
                    actions={[
                      <Button
                        type="text"
                        icon={<EditOutlined style={{ color: '#7B83EB' }} />}
                        onClick={() => handleEditEvent(event)}
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '6px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.3s ease',
                          background: '#f5f5f5'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#f0f0f0';
                          e.currentTarget.style.transform = 'scale(1.1)';
                          e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.08)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = '#f5f5f5';
                          e.currentTarget.style.transform = 'scale(1)';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      />,
                      <Button
                        type="text"
                        icon={<DeleteOutlined style={{ color: '#ff4d4f' }} />}
                        onClick={() => handleDeleteEvent(event.id)}
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '6px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.3s ease',
                          background: '#fff1f0'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#ffccc7';
                          e.currentTarget.style.transform = 'scale(1.1)';
                          e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.08)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = '#fff1f0';
                          e.currentTarget.style.transform = 'scale(1)';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      />
                    ]}
                  >
                    <List.Item.Meta
                      title={
                        <Space>
                          <Tag color={
                            event.type === 'HOLIDAY' ? 'red' :
                            event.type === 'EXAM' ? 'blue' :
                            'green'
                          }>
                            {event.type}
                          </Tag>
                          <span style={{ color: '#595959' }}>{event.title}</span>
                        </Space>
                      }
                      description={moment(event.date).format('MMMM D, YYYY')}
                    />
                  </List.Item>
                )}
              />
            </Card>
            
            {nextHoliday && (
              <Card 
                title="Next Holiday" 
                style={{ 
                  borderRadius: '12px',
                  boxShadow: '0 4px 16px rgba(159, 179, 223, 0.2)',
                  border: '1px solid rgba(159, 179, 223, 0.3)',
                  background: 'linear-gradient(135deg, #7B83EB 0%, #8ba1d1 100%)',
                  color: 'white'
                }}
              >
                <div style={{ textAlign: 'center', padding: '16px' }}>
                  <h3 style={{ margin: '0 0 8px 0', fontSize: '20px', fontWeight: 500, color: 'white' }}>
                    {nextHoliday.title}
                  </h3>
                  <p style={{ margin: '4px 0', fontSize: '16px', opacity: 0.9, color: 'white' }}>
                    {moment(nextHoliday.date).format('MMMM D, YYYY')}
                  </p>
                  <p style={{ margin: '4px 0', fontSize: '16px', opacity: 0.9, color: 'white' }}>
                    {moment(nextHoliday.date).diff(moment(), 'days')} days remaining
                  </p>
                </div>
              </Card>
            )}
          </Col>
        </Row>
      </Card>

      <Modal
        title={
          <Space>
            <CalendarOutlined style={{ fontSize: '20px', color: '#7B83EB' }} />
            <Typography.Title level={5} style={{ margin: 0 }}>
              {editingEvent ? 'Edit Event' : 'Add Event'}
            </Typography.Title>
          </Space>
        }
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="title"
            label="Event Title"
            rules={[{ required: true, message: 'Please enter event title' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="date"
            label="Date"
            rules={[{ required: true, message: 'Please select date' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="type"
            label="Event Type"
            rules={[{ required: true, message: 'Please select event type' }]}
          >
            <Select>
              <Option value="HOLIDAY">Holiday</Option>
              <Option value="EXAM">Exam</Option>
              <Option value="EVENT">Event</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="description"
            label="Description"
          >
            <Input.TextArea rows={4} />
          </Form.Item>
        </Form>
      </Modal>

      <style>
        {`
          .custom-calendar .ant-picker-calendar {
            background: transparent;
          }

          .custom-calendar .ant-picker-calendar-date {
            height: 80px;
          }

          .custom-calendar .ant-picker-calendar-date-content {
            height: 40px;
          }

          .custom-calendar .ant-picker-calendar-date-value {
            font-size: 14px;
          }

          .custom-calendar .ant-picker-calendar-header {
            padding: 12px;
            background: rgba(159, 179, 223, 0.1);
            border-radius: 8px;
            margin-bottom: 16px;
          }

          .custom-calendar .ant-picker-calendar-header .ant-picker-calendar-mode-switch {
            margin-top: 0;
          }

          .custom-calendar .ant-picker-calendar-header .ant-picker-calendar-mode-switch label {
            color: #7B83EB;
          }

          .custom-calendar .ant-picker-calendar-header .ant-picker-calendar-mode-switch label.ant-radio-button-wrapper-checked {
            background: #7B83EB;
            border-color: #7B83EB;
          }

          .custom-calendar .ant-picker-cell {
            padding: 4px;
          }

          .custom-calendar .ant-picker-cell-in-view {
            background: #ffffff;
            border-radius: 8px;
            transition: all 0.3s ease;
          }

          .custom-calendar .ant-picker-cell-in-view:hover {
            background: rgba(159, 179, 223, 0.05);
          }

          .custom-calendar .ant-picker-cell-selected .ant-picker-calendar-date {
            background: rgba(159, 179, 223, 0.1);
          }

          .custom-calendar .ant-picker-cell-today .ant-picker-calendar-date {
            border: 1px solid #7B83EB;
          }

          .custom-calendar .ant-picker-calendar-date {
            border-radius: 8px;
            transition: all 0.3s ease;
          }

          .custom-calendar .ant-picker-calendar-date:hover {
            background: rgba(159, 179, 223, 0.05);
          }

          .custom-calendar .ant-picker-calendar-date-value {
            color: #595959;
          }

          .custom-calendar .ant-picker-calendar-date-content {
            color: #595959;
          }

          .custom-calendar .ant-picker-calendar-date-today .ant-picker-calendar-date-value {
            color: #7B83EB;
            font-weight: 600;
          }

          .events {
            margin: 0;
            padding: 0;
            list-style: none;
          }

          .events li {
            margin-bottom: 4px;
          }

          .events .ant-tag {
            margin: 0;
            padding: 0 6px;
            font-size: 12px;
            height: 20px;
            line-height: 18px;
            border-radius: 4px;
          }

          .ant-modal-content {
            border-radius: 12px;
            overflow: hidden;
          }

          .ant-modal-header {
            background: rgba(159, 179, 223, 0.1);
            border-bottom: 1px solid rgba(159, 179, 223, 0.2);
            padding: 16px 24px;
          }

          .ant-modal-title {
            color: #7B83EB;
          }

          .ant-modal-body {
            padding: 24px;
          }

          .ant-modal-footer {
            border-top: 1px solid rgba(159, 179, 223, 0.2);
            padding: 16px 24px;
          }

          .ant-form-item-label > label {
            color: #595959;
          }

          .ant-input,
          .ant-picker,
          .ant-select-selector {
            border-color: rgba(159, 179, 223, 0.3) !important;
            border-radius: 6px !important;
          }

          .ant-input:hover,
          .ant-picker:hover,
          .ant-select:hover .ant-select-selector {
            border-color: #7B83EB !important;
          }

          .ant-input:focus,
          .ant-picker-focused,
          .ant-select-focused .ant-select-selector {
            border-color: #7B83EB !important;
            box-shadow: 0 0 0 2px rgba(159, 179, 223, 0.2) !important;
          }

          .ant-btn-primary {
            background: #7B83EB !important;
            border-color: #7B83EB !important;
          }

          .ant-btn-primary:hover {
            background: #8ba1d1 !important;
            border-color: #8ba1d1 !important;
          }

          .ant-btn-default {
            border-color: rgba(159, 179, 223, 0.3) !important;
            color: #7B83EB !important;
          }

          .ant-btn-default:hover {
            border-color: #7B83EB !important;
            color: #8ba1d1 !important;
          }
        `}
      </style>
    </div>
  );
};

export default AcademicCalendar; 