import React, { useState, useEffect } from 'react';
import { Card, Calendar, Modal, Form, Input, DatePicker, Select, Button, List, Tag, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import moment from 'moment';
import './AcademicCalendar.css';
import { Row, Col } from 'antd';
import { getCalendarEvents, addCalendarEvent, updateCalendarEvent, deleteCalendarEvent, initializeSampleData } from '../services/localStorage';

const { Option } = Select;

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
    <div className="academic-calendar-container">
      <div className="calendar-header">
        <h1>Academic Calendar</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAddEvent}>
          Add Event
        </Button>
      </div>

      <div className="calendar-content">
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={16}>
            <Card className="calendar-card">
              <Calendar
                dateCellRender={dateCellRender}
                fullscreen={false}
                style={{ background: '#fff' }}
              />
            </Card>
          </Col>
          <Col xs={24} lg={8}>
            <Card title="Upcoming Events" className="events-card">
              <List
                dataSource={events
                  .filter(event => moment(event.date).isAfter(moment()))
                  .sort((a, b) => moment(a.date).diff(moment(b.date)))
                  .slice(0, 5)}
                renderItem={event => (
                  <List.Item
                    actions={[
                      <EditOutlined key="edit" onClick={() => handleEditEvent(event)} />,
                      <DeleteOutlined key="delete" onClick={() => handleDeleteEvent(event.id)} />
                    ]}
                  >
                    <List.Item.Meta
                      title={
                        <span>
                          <Tag color={
                            event.type === 'HOLIDAY' ? 'red' :
                            event.type === 'EXAM' ? 'blue' :
                            'green'
                          }>
                            {event.type}
                          </Tag>
                          {event.title}
                        </span>
                      }
                      description={moment(event.date).format('MMMM D, YYYY')}
                    />
                  </List.Item>
                )}
              />
            </Card>
            {nextHoliday && (
              <Card title="Next Holiday" className="next-holiday-card">
                <div className="next-holiday-info">
                  <h3>{nextHoliday.title}</h3>
                  <p>{moment(nextHoliday.date).format('MMMM D, YYYY')}</p>
                  <p>{moment(nextHoliday.date).diff(moment(), 'days')} days remaining</p>
                </div>
              </Card>
            )}
          </Col>
        </Row>
      </div>

      <Modal
        title={editingEvent ? 'Edit Event' : 'Add Event'}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
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
    </div>
  );
};

export default AcademicCalendar; 