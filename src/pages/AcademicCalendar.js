import React, { useState, useEffect } from 'react';
import { Card, Calendar, Modal, Form, Input, DatePicker, Select, Button, List, Tag, message, Row, Col, Typography, Space, Descriptions, Tabs } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, CalendarOutlined, EyeOutlined, FieldTimeOutlined, TagOutlined, FileTextOutlined, CheckCircleOutlined, UserOutlined, ClockCircleOutlined } from '@ant-design/icons';
import moment from 'moment';
import './AcademicCalendar.css';
import { eventAPI } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import StyledModal from '../components/StyledModal';

const { Option } = Select;
const { Title } = Typography;

const AcademicCalendar = () => {
  const [events, setEvents] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [form] = Form.useForm();
  const [editingEvent, setEditingEvent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showCustomType, setShowCustomType] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const mountedRef = React.useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    
    const loadEvents = async () => {
      if (mountedRef.current) {
        await fetchEvents();
      }
    };
    
    loadEvents();

    // Listen for custom event from header button
    const handleHeaderAddEvent = () => {
      handleAddEvent();
    };

    window.addEventListener('academicCalendarAddEvent', handleHeaderAddEvent);

    return () => {
      mountedRef.current = false;
      window.removeEventListener('academicCalendarAddEvent', handleHeaderAddEvent);
    };
  }, []);

  const fetchEvents = async () => {
    console.log('Fetching events...');
    try {
      setLoading(true);
      const response = await eventAPI.getEvents();
      if (mountedRef.current) {
        setEvents(response.data.results || []);
      }
    } catch (error) {
      if (mountedRef.current) {
        message.error('Failed to fetch events: ' + error.message);
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  };

  const handleAddEvent = () => {
    setEditingEvent(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEditEvent = (event) => {
    setEditingEvent(event);
    const isCustomType = !['holiday', 'sports', 'school'].includes(event.event_type);
    
    form.setFieldsValue({
      event_title: event.event_title,
      start_datetime: moment(event.start_datetime),
      end_datetime: moment(event.end_datetime),
      event_type: isCustomType ? 'other' : event.event_type,
      custom_type: isCustomType ? event.event_type : undefined,
      description: event.description,
      status: event.status
    });
    setShowCustomType(isCustomType);
    setIsModalVisible(true);
  };

  const handleViewEvent = (event) => {
    setSelectedEvent(event);
    setIsViewModalVisible(true);
  };

  const handleDeleteEvent = async (eventId) => {
    Modal.confirm({
      title: 'Are you sure you want to delete this event?',
      content: 'This action cannot be undone.',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk: async () => {
        try {
          await eventAPI.deleteEvent(eventId);
          message.success('Event deleted successfully');
          fetchEvents();
        } catch (error) {
          message.error('Failed to delete event: ' + error.message);
        }
      }
    });
  };

  const handleModalOk = async () => {
    try {
      setSubmitting(true);
      const values = await form.validateFields();
      const eventData = {
        event_title: values.event_title,
        start_datetime: values.start_datetime.toISOString(),
        end_datetime: values.end_datetime.toISOString(),
        event_type: values.event_type === 'other' ? values.custom_type : values.event_type,
        description: values.description,
        status: values.status
      };

      if (editingEvent) {
        await eventAPI.updateEvent(editingEvent.id, eventData);
        message.success('Event updated successfully');
      } else {
        await eventAPI.createEvent(eventData);
        message.success('Event added successfully');
      }

      setIsModalVisible(false);
      form.resetFields();
      setShowCustomType(false);
      fetchEvents();
    } catch (error) {
      message.error('Error saving event: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEventTypeChange = (value) => {
    setShowCustomType(value === 'other');
    if (value !== 'other') {
      form.setFieldsValue({ custom_type: undefined });
    }
  };

  const dateCellRender = (value) => {
    const date = value.format('YYYY-MM-DD');
    const dayEvents = events.filter(event => 
      moment(event.start_datetime).format('YYYY-MM-DD') === date
    );

    return (
      <ul className="events">
        {dayEvents.map(event => (
          <li key={event.id}>
            <StatusBadge type="event" value={event.event_type} />
          </li>
        ))}
      </ul>
    );
  };

  const getNextHoliday = () => {
    const today = moment();
    const upcomingHolidays = events
      .filter(event => event.event_type === 'holiday' && moment(event.start_datetime).isAfter(today))
      .sort((a, b) => moment(a.start_datetime).diff(moment(b.start_datetime)));

    return upcomingHolidays[0];
  };

  const nextHoliday = getNextHoliday();

  return (
    <div className="academic-calendar">
      <Card 
        style={{ 
          borderRadius: '12px',
          boxShadow: '0 4px 16px rgba(159, 179, 223, 0.2)',
          border: '1px solid rgba(159, 179, 223, 0.3)',
          marginBottom: '16px'
        }}
      >
        <Calendar dateCellRender={dateCellRender} />
      </Card>

      <div className="events-list-container">
        <Tabs defaultActiveKey="upcoming">
          <Tabs.TabPane tab="Upcoming" key="upcoming">
            <List
              loading={loading}
              dataSource={events
                .filter(event => moment(event.start_datetime).isAfter(moment()))
                .sort((a, b) => moment(a.start_datetime).diff(moment(b.start_datetime)))}
              renderItem={event => (
                <List.Item
                  actions={[
                    <Button
                      type="text"
                      icon={<EyeOutlined style={{ color: '#7B83EB' }} />}
                      onClick={() => handleViewEvent(event)}
                    />,
                    <Button
                      type="text"
                      icon={<EditOutlined style={{ color: '#7B83EB' }} />}
                      onClick={() => handleEditEvent(event)}
                    />,
                    <Button
                      type="text"
                      icon={<DeleteOutlined style={{ color: '#ff4d4f' }} />}
                      onClick={() => handleDeleteEvent(event.id)}
                    />
                  ]}
                >
                  <List.Item.Meta
                    title={
                      <Space>
                        <StatusBadge type="event" value={event.event_type} />
                        <span style={{ color: '#595959' }}>{event.event_title}</span>
                      </Space>
                    }
                    description={
                      <Space direction="vertical" size={0}>
                        <span>{moment(event.start_datetime).format('MMMM D, YYYY')}</span>
                        <span style={{ color: '#8c8c8c', fontSize: '12px' }}>
                          {moment(event.start_datetime).format('h:mm A')} - {moment(event.end_datetime).format('h:mm A')}
                        </span>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </Tabs.TabPane>

          <Tabs.TabPane tab="Ongoing" key="ongoing">
            <List
              loading={loading}
              dataSource={events
                .filter(event => 
                  moment().isBetween(moment(event.start_datetime), moment(event.end_datetime))
                )
                .sort((a, b) => moment(a.start_datetime).diff(moment(b.start_datetime)))}
              renderItem={event => (
                <List.Item
                  actions={[
                    <Button
                      type="text"
                      icon={<EyeOutlined style={{ color: '#7B83EB' }} />}
                      onClick={() => handleViewEvent(event)}
                    />,
                    <Button
                      type="text"
                      icon={<EditOutlined style={{ color: '#7B83EB' }} />}
                      onClick={() => handleEditEvent(event)}
                    />,
                    <Button
                      type="text"
                      icon={<DeleteOutlined style={{ color: '#ff4d4f' }} />}
                      onClick={() => handleDeleteEvent(event.id)}
                    />
                  ]}
                >
                  <List.Item.Meta
                    title={
                      <Space>
                        <StatusBadge type="event" value={event.event_type} />
                        <span style={{ color: '#595959' }}>{event.event_title}</span>
                      </Space>
                    }
                    description={
                      <Space direction="vertical" size={0}>
                        <span>{moment(event.start_datetime).format('MMMM D, YYYY')}</span>
                        <span style={{ color: '#8c8c8c', fontSize: '12px' }}>
                          {moment(event.start_datetime).format('h:mm A')} - {moment(event.end_datetime).format('h:mm A')}
                        </span>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </Tabs.TabPane>

          <Tabs.TabPane tab="Completed" key="completed">
            <List
              loading={loading}
              dataSource={events
                .filter(event => moment(event.end_datetime).isBefore(moment()))
                .sort((a, b) => moment(b.start_datetime).diff(moment(a.start_datetime)))}
              renderItem={event => (
                <List.Item
                  actions={[
                    <Button
                      type="text"
                      icon={<EyeOutlined style={{ color: '#7B83EB' }} />}
                      onClick={() => handleViewEvent(event)}
                    />,
                    <Button
                      type="text"
                      icon={<EditOutlined style={{ color: '#7B83EB' }} />}
                      onClick={() => handleEditEvent(event)}
                    />,
                    <Button
                      type="text"
                      icon={<DeleteOutlined style={{ color: '#ff4d4f' }} />}
                      onClick={() => handleDeleteEvent(event.id)}
                    />
                  ]}
                >
                  <List.Item.Meta
                    title={
                      <Space>
                        <StatusBadge type="event" value={event.event_type} />
                        <span style={{ color: '#595959' }}>{event.event_title}</span>
                      </Space>
                    }
                    description={
                      <Space direction="vertical" size={0}>
                        <span>{moment(event.start_datetime).format('MMMM D, YYYY')}</span>
                        <span style={{ color: '#8c8c8c', fontSize: '12px' }}>
                          {moment(event.start_datetime).format('h:mm A')} - {moment(event.end_datetime).format('h:mm A')}
                        </span>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </Tabs.TabPane>

          <Tabs.TabPane tab="Cancelled" key="cancelled">
            <List
              loading={loading}
              dataSource={events
                .filter(event => event.status === 'cancelled')
                .sort((a, b) => moment(b.start_datetime).diff(moment(a.start_datetime)))}
              renderItem={event => (
                <List.Item
                  actions={[
                    <Button
                      type="text"
                      icon={<EyeOutlined style={{ color: '#7B83EB' }} />}
                      onClick={() => handleViewEvent(event)}
                    />
                  ]}
                >
                  <List.Item.Meta
                    title={
                      <Space>
                        <StatusBadge type="event" value={event.event_type} />
                        <span style={{ color: '#595959' }}>{event.event_title}</span>
                      </Space>
                    }
                    description={
                      <Space direction="vertical" size={0}>
                        <span>{moment(event.start_datetime).format('MMMM D, YYYY')}</span>
                        <span style={{ color: '#8c8c8c', fontSize: '12px' }}>
                          {moment(event.start_datetime).format('h:mm A')} - {moment(event.end_datetime).format('h:mm A')}
                        </span>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </Tabs.TabPane>
        </Tabs>
      </div>

      <StyledModal
        visible={isViewModalVisible}
        onClose={() => setIsViewModalVisible(false)}
        width={500}
      >
        {selectedEvent && (
          <div className="event-details">
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <Space direction="vertical" size={16} style={{ width: '100%' }}>
                  <div className="event-header">
                    <Space>
                      <CalendarOutlined style={{ fontSize: '20px', color: '#7B83EB' }} />
                      <Typography.Title level={5} style={{ margin: 0 }}>
                        Event Details
                      </Typography.Title>
                    </Space>
                  </div>

                  <div className="event-content">
                    <Row gutter={[16, 16]}>
                      <Col span={24}>
                        <div className="event-title">
                          <StatusBadge type="event" value={selectedEvent.event_type} />
                          <Typography.Title level={4} style={{ margin: '8px 0' }}>
                            {selectedEvent.event_title}
                          </Typography.Title>
                        </div>
                      </Col>

                      <Col span={24}>
                        <div className="event-timeline">
                          <Row gutter={[16, 8]}>
                            <Col span={12}>
                              <Space>
                                <CalendarOutlined style={{ color: '#7B83EB', fontSize: '16px' }} />
                                <div>
                                  <div className="timeline-label">Start</div>
                                  <div className="timeline-value">
                                    {moment(selectedEvent.start_datetime).format('MMM D, h:mm A')}
                                  </div>
                                </div>
                              </Space>
                            </Col>
                            <Col span={12}>
                              <Space>
                                <FieldTimeOutlined style={{ color: '#7B83EB', fontSize: '16px' }} />
                                <div>
                                  <div className="timeline-label">End</div>
                                  <div className="timeline-value">
                                    {moment(selectedEvent.end_datetime).format('MMM D, h:mm A')}
                                  </div>
                                </div>
                              </Space>
                            </Col>
                          </Row>
                        </div>
                      </Col>

                      {selectedEvent.description && (
                        <Col span={24}>
                          <div className="event-description">
                            <Space direction="vertical" size={4} style={{ width: '100%' }}>
                              <div className="description-label">
                                <FileTextOutlined style={{ color: '#7B83EB', marginRight: '8px' }} />
                                Description
                              </div>
                              <div className="description-content">
                                {selectedEvent.description}
                              </div>
                            </Space>
                          </div>
                        </Col>
                      )}

                      <Col span={24}>
                        <div className="event-meta">
                          <Row gutter={[16, 8]}>
                            <Col span={8}>
                              <Space>
                                <UserOutlined style={{ color: '#7B83EB', fontSize: '16px' }} />
                                <div>
                                  <div className="meta-label">Created By</div>
                                  <div className="meta-value">{selectedEvent.created_by}</div>
                                </div>
                              </Space>
                            </Col>
                            <Col span={8}>
                              <Space>
                                <ClockCircleOutlined style={{ color: '#7B83EB', fontSize: '16px' }} />
                                <div>
                                  <div className="meta-label">Created</div>
                                  <div className="meta-value">
                                    {moment(selectedEvent.created_at).format('MMM D')}
                                  </div>
                                </div>
                              </Space>
                            </Col>
                            <Col span={8}>
                              <Space>
                                <ClockCircleOutlined style={{ color: '#7B83EB', fontSize: '16px' }} />
                                <div>
                                  <div className="meta-label">Updated</div>
                                  <div className="meta-value">
                                    {moment(selectedEvent.updated_at).format('MMM D')}
                                  </div>
                                </div>
                              </Space>
                            </Col>
                          </Row>
                        </div>
                      </Col>
                    </Row>
                  </div>

                  <div className="event-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                    <Button 
                      type="primary" 
                      onClick={() => {
                        setIsViewModalVisible(false);
                        handleEditEvent(selectedEvent);
                      }}
                      icon={<EditOutlined />}
                      style={{
                        background: '#7B83EB',
                        borderColor: '#7B83EB',
                      }}
                    >
                      Edit Event
                    </Button>
                    <Button onClick={() => setIsViewModalVisible(false)}>
                      Close
                    </Button>
                  </div>
                </Space>
              </Col>
            </Row>
          </div>
        )}
      </StyledModal>

      <StyledModal
        visible={isModalVisible}
        onClose={() => {
          setIsModalVisible(false);
          setShowCustomType(false);
        }}
        width={500}
      >
        <Form
          form={form}
          layout="vertical"
          className="event-form"
        >
          <Row gutter={[16, 12]}>
            <Col span={24}>
              <Form.Item
                name="event_title"
                label={
                  <Space>
                    <UserOutlined style={{ color: '#7B83EB' }} />
                    <span>Event Title</span>
                  </Space>
                }
                rules={[{ required: true, message: 'Please enter event title' }]}
              >
                <Input placeholder="Enter event title" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="start_datetime"
                label={
                  <Space>
                    <CalendarOutlined style={{ color: '#7B83EB' }} />
                    <span>Start</span>
                  </Space>
                }
                rules={[{ required: true, message: 'Please select start date and time' }]}
              >
                <DatePicker 
                  showTime 
                  style={{ width: '100%' }}
                  format="MMM D, h:mm A"
                  placeholder="Select start"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="end_datetime"
                label={
                  <Space>
                    <FieldTimeOutlined style={{ color: '#7B83EB' }} />
                    <span>End</span>
                  </Space>
                }
                rules={[{ required: true, message: 'Please select end date and time' }]}
              >
                <DatePicker 
                  showTime 
                  style={{ width: '100%' }}
                  format="MMM D, h:mm A"
                  placeholder="Select end"
                />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item
                name="event_type"
                label={
                  <Space>
                    <TagOutlined style={{ color: '#7B83EB' }} />
                    <span>Event Type</span>
                  </Space>
                }
                rules={[{ required: true, message: 'Please select event type' }]}
              >
                <Select
                  placeholder="Select event type"
                  onChange={handleEventTypeChange}
                >
                  <Option value="holiday">Holiday</Option>
                  <Option value="sports">Sports</Option>
                  <Option value="school">School Event</Option>
                  <Option value="other">Other</Option>
                </Select>
              </Form.Item>
            </Col>

            {showCustomType && (
              <Col span={24}>
                <Form.Item
                  name="custom_type"
                  label={
                    <Space>
                      <TagOutlined style={{ color: '#7B83EB' }} />
                      <span>Custom Type</span>
                    </Space>
                  }
                  rules={[{ required: true, message: 'Please enter custom event type' }]}
                >
                  <Input placeholder="Enter custom event type" />
                </Form.Item>
              </Col>
            )}

            <Col span={24}>
              <Form.Item
                name="description"
                label={
                  <Space>
                    <FileTextOutlined style={{ color: '#7B83EB' }} />
                    <span>Description</span>
                  </Space>
                }
              >
                <Input.TextArea 
                  rows={2} 
                  placeholder="Enter event description"
                  showCount
                  maxLength={200}
                />
              </Form.Item>
            </Col>
          </Row>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '24px' }}>
            <Button onClick={() => {
              setIsModalVisible(false);
              setShowCustomType(false);
            }}>
              Cancel
            </Button>
            <Button
              type="primary"
              onClick={handleModalOk}
              loading={submitting}
              style={{
                background: '#7B83EB',
                borderColor: '#7B83EB',
              }}
            >
              {editingEvent ? "Update" : "Create"}
            </Button>
          </div>
        </Form>
      </StyledModal>
    </div>
  );
};

export default AcademicCalendar; 