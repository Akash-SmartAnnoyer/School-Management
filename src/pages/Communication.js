import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  Grid,
  Typography,
  Button,
  Dialog,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Send as SendIcon,
  Event as EventIcon
} from '@mui/icons-material';
import {
  getAnnouncements,
  addAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  getMessages,
  sendMessage,
  deleteMessage,
  getEvents,
  addEvent,
  updateEvent,
  deleteEvent,
  getUsers
} from '../firebase/services';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SendOutlined,
  NotificationOutlined,
  MessageOutlined,
  CalendarOutlined,
  UserOutlined,
  BankOutlined
} from '@ant-design/icons';
import {
  Tabs,
  List,
  Avatar,
  Tag,
  Modal,
  Form,
  Input,
  DatePicker,
  TimePicker,
  Space,
  message
} from 'antd';

const { Title, Text } = Typography;
const { Option } = Select;

const Communication = () => {
  const [activeTab, setActiveTab] = useState('1');
  const [announcements, setAnnouncements] = useState([]);
  const [messages, setMessages] = useState([]);
  const [events, setEvents] = useState([]);
  const [users, setUsers] = useState([]);
  
  // Modal states
  const [announcementModalVisible, setAnnouncementModalVisible] = useState(false);
  const [messageModalVisible, setMessageModalVisible] = useState(false);
  const [eventModalVisible, setEventModalVisible] = useState(false);
  
  // Form instances
  const [announcementForm] = Form.useForm();
  const [messageForm] = Form.useForm();
  const [eventForm] = Form.useForm();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [announcementsData, messagesData, eventsData, usersData] = await Promise.all([
        getAnnouncements(),
        getMessages(),
        getEvents(),
        getUsers()
      ]);
      
      setAnnouncements(announcementsData);
      setMessages(messagesData);
      setEvents(eventsData);
      setUsers(usersData);
    } catch (error) {
      console.error('Error loading data:', error);
      message.error('Error loading data');
    }
  };

  const handleAddAnnouncement = async (values) => {
    try {
      await addAnnouncement(values);
      setAnnouncementModalVisible(false);
      announcementForm.resetFields();
      loadData();
      message.success('Announcement added successfully');
    } catch (error) {
      console.error('Error adding announcement:', error);
      message.error('Error adding announcement');
    }
  };

  const handleAddMessage = async (values) => {
    try {
      await sendMessage(values);
      setMessageModalVisible(false);
      messageForm.resetFields();
      loadData();
      message.success('Message sent successfully');
    } catch (error) {
      console.error('Error sending message:', error);
      message.error('Error sending message');
    }
  };

  const handleAddEvent = async (values) => {
    try {
      await addEvent(values);
      setEventModalVisible(false);
      eventForm.resetFields();
      loadData();
      message.success('Event added successfully');
    } catch (error) {
      console.error('Error adding event:', error);
      message.error('Error adding event');
    }
  };

  const handleDeleteAnnouncement = async (announcementId) => {
    try {
      await deleteAnnouncement(announcementId);
      loadData();
      message.success('Announcement deleted successfully');
    } catch (error) {
      console.error('Error deleting announcement:', error);
      message.error('Error deleting announcement');
    }
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      await deleteMessage(messageId);
      loadData();
      message.success('Message deleted successfully');
    } catch (error) {
      console.error('Error deleting message:', error);
      message.error('Error deleting message');
    }
  };

  const handleDeleteEvent = async (eventId) => {
    try {
      await deleteEvent(eventId);
      loadData();
      message.success('Event deleted successfully');
    } catch (error) {
      console.error('Error deleting event:', error);
      message.error('Error deleting event');
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'red';
      case 'medium': return 'orange';
      default: return 'green';
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>Communication</Title>

      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <Tabs.TabPane
          tab={
            <span>
              <NotificationOutlined />
              Announcements
            </span>
          }
          key="1"
        >
          <Space style={{ marginBottom: 16 }}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setAnnouncementModalVisible(true)}
            >
              Add Announcement
            </Button>
          </Space>
          <List
            itemLayout="horizontal"
            dataSource={announcements}
            renderItem={announcement => (
              <List.Item
                actions={[
                  <Button type="text" icon={<EditOutlined />} />,
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleDeleteAnnouncement(announcement.id)}
                  />
                ]}
              >
                <List.Item.Meta
                  avatar={
                    <Avatar icon={<NotificationOutlined />} />
                  }
                  title={
                    <Space>
                      <Text strong>{announcement.title}</Text>
                      <Tag color={getPriorityColor(announcement.priority)}>
                        {announcement.priority}
                      </Tag>
                    </Space>
                  }
                  description={
                    <>
                      <Text>{announcement.content}</Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        {new Date(announcement.createdAt).toLocaleString()}
                      </Text>
                    </>
                  }
                />
              </List.Item>
            )}
          />
        </Tabs.TabPane>

        <Tabs.TabPane
          tab={
            <span>
              <MessageOutlined />
              Messages
            </span>
          }
          key="2"
        >
          <Space style={{ marginBottom: 16 }}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setMessageModalVisible(true)}
            >
              New Message
            </Button>
          </Space>
          <List
            itemLayout="horizontal"
            dataSource={messages}
            renderItem={message => (
              <List.Item
                actions={[
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleDeleteMessage(message.id)}
                  />
                ]}
              >
                <List.Item.Meta
                  avatar={
                    <Avatar icon={<UserOutlined />} />
                  }
                  title={
                    <Space>
                      <Text strong>{message.subject}</Text>
                      <Tag color={message.status === 'read' ? 'green' : 'blue'}>
                        {message.status}
                      </Tag>
                    </Space>
                  }
                  description={
                    <>
                      <Text>{message.content}</Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        From: {message.sender} | {new Date(message.createdAt).toLocaleString()}
                      </Text>
                    </>
                  }
                />
              </List.Item>
            )}
          />
        </Tabs.TabPane>

        <Tabs.TabPane
          tab={
            <span>
              <CalendarOutlined />
              Events
            </span>
          }
          key="3"
        >
          <Space style={{ marginBottom: 16 }}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setEventModalVisible(true)}
            >
              Add Event
            </Button>
          </Space>
          <List
            grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 3, xl: 4, xxl: 4 }}
            dataSource={events}
            renderItem={event => (
              <List.Item>
                <Card
                  actions={[
                    <Button type="text" icon={<EditOutlined />} />,
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => handleDeleteEvent(event.id)}
                    />
                  ]}
                >
                  <Card.Meta
                    title={event.title}
                    description={
                      <>
                        <Text>{event.description}</Text>
                        <br />
                        <Space>
                          <CalendarOutlined />
                          <Text type="secondary">
                            {new Date(event.date).toLocaleDateString()} at {event.time}
                          </Text>
                        </Space>
                        <br />
                        <Space>
                          <BankOutlined />
                          <Text type="secondary">{event.location}</Text>
                        </Space>
                        <br />
                        <Tag color="blue">{event.type}</Tag>
                      </>
                    }
                  />
                </Card>
              </List.Item>
            )}
          />
        </Tabs.TabPane>
      </Tabs>

      {/* Add Announcement Modal */}
      <Modal
        title="Add New Announcement"
        open={announcementModalVisible}
        onCancel={() => setAnnouncementModalVisible(false)}
        footer={null}
      >
        <Form
          form={announcementForm}
          layout="vertical"
          onFinish={handleAddAnnouncement}
        >
          <Form.Item
            name="title"
            label="Title"
            rules={[{ required: true, message: 'Please input announcement title!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="content"
            label="Content"
            rules={[{ required: true, message: 'Please input announcement content!' }]}
          >
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item
            name="priority"
            label="Priority"
            rules={[{ required: true, message: 'Please select priority!' }]}
          >
            <Select>
              <Option value="high">High</Option>
              <Option value="medium">Medium</Option>
              <Option value="normal">Normal</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="targetAudience"
            label="Target Audience"
            rules={[{ required: true, message: 'Please select target audience!' }]}
          >
            <Select>
              <Option value="all">All</Option>
              <Option value="students">Students</Option>
              <Option value="teachers">Teachers</Option>
              <Option value="parents">Parents</Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Space>
              <Button onClick={() => setAnnouncementModalVisible(false)}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit">
                Add
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Add Message Modal */}
      <Modal
        title="New Message"
        open={messageModalVisible}
        onCancel={() => setMessageModalVisible(false)}
        footer={null}
      >
        <Form
          form={messageForm}
          layout="vertical"
          onFinish={handleAddMessage}
        >
          <Form.Item
            name="recipient"
            label="Recipient"
            rules={[{ required: true, message: 'Please select recipient!' }]}
          >
            <Select>
              {users.map((user) => (
                <Option key={user.id} value={user.id}>
                  {user.name} ({user.role})
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="subject"
            label="Subject"
            rules={[{ required: true, message: 'Please input subject!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="content"
            label="Message"
            rules={[{ required: true, message: 'Please input message content!' }]}
          >
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button onClick={() => setMessageModalVisible(false)}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit" icon={<SendOutlined />}>
                Send
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Add Event Modal */}
      <Modal
        title="Add New Event"
        open={eventModalVisible}
        onCancel={() => setEventModalVisible(false)}
        footer={null}
      >
        <Form
          form={eventForm}
          layout="vertical"
          onFinish={handleAddEvent}
        >
          <Form.Item
            name="title"
            label="Title"
            rules={[{ required: true, message: 'Please input event title!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: 'Please input event description!' }]}
          >
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item
            name="date"
            label="Date"
            rules={[{ required: true, message: 'Please select date!' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="time"
            label="Time"
            rules={[{ required: true, message: 'Please select time!' }]}
          >
            <TimePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="location"
            label="Location"
            rules={[{ required: true, message: 'Please input location!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="type"
            label="Event Type"
            rules={[{ required: true, message: 'Please select event type!' }]}
          >
            <Select>
              <Option value="academic">Academic</Option>
              <Option value="sports">Sports</Option>
              <Option value="cultural">Cultural</Option>
              <Option value="holiday">Holiday</Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Space>
              <Button onClick={() => setEventModalVisible(false)}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit">
                Add
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Communication; 