import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Button,
  Row,
  Col,
  Tag,
  Divider,
  Typography,
  Card,
  List,
  Avatar,
  Space,
  Popconfirm,
  Modal,
  Form,
  Input,
  message,
  Spin,
} from 'antd';
import { PageHeader } from '@ant-design/pro-layout';
import {
  EditOutlined,
  CloseCircleOutlined,
  DeleteOutlined,
  PlusOutlined,
  UserOutlined,
  CalendarOutlined,
  MailOutlined,
} from '@ant-design/icons';

import { useSelector, useDispatch } from 'react-redux';
import { erp } from '@/redux/erp/actions';
import useLanguage from '@/locale/useLanguage';
import { useDate } from '@/settings';
import { tagColor } from '@/utils/statusTagColor';
import { request } from '@/request';

import { generate as uniqueId } from 'shortid';
import { selectReadItem } from '@/redux/erp/selectors';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

export default function ReadQueryDetails({ config }) {
  const translate = useLanguage();
  const { entity, ENTITY_NAME } = config;
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { dateFormat } = useDate();
  const { id } = useParams();
  const [form] = Form.useForm();

  const { result: currentResult, isLoading, isSuccess } = useSelector(selectReadItem);

  const resetQuery = {
    customerName: '',
    email: '',
    description: '',
    status: 'open',
    resolution: '',
    notes: [],
    createdBy: null,
    createdAt: null,
    updatedAt: null,
  };

  const [currentQuery, setCurrentQuery] = useState(resetQuery);
  const [isAddNoteModalVisible, setIsAddNoteModalVisible] = useState(false);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [deletingNoteId, setDeletingNoteId] = useState(null);

  useEffect(() => {
    if (id) {
      dispatch(erp.read({ entity, id }));
    }
  }, [id, entity, dispatch]);

  useEffect(() => {
    if (isSuccess && currentResult) {
      setCurrentQuery(currentResult);
    }
    return () => {
      setCurrentQuery(resetQuery);
    };
  }, [currentResult, isSuccess]);

  const getStatusColor = (status) => {
    const colorObj = tagColor(status);
    return colorObj.color || 'default';
  };

  const handleAddNote = async (values) => {
    setIsAddingNote(true);
    try {
      const response = await request.addNote({
        entity,
        id,
        jsonData: { content: values.content },
      });

      if (response.success) {
        message.success(translate('Note added successfully'));
        setCurrentQuery(response.result);
        setIsAddNoteModalVisible(false);
        form.resetFields();
      }
    } catch (error) {
      message.error(translate('Failed to add note'));
    } finally {
      setIsAddingNote(false);
    }
  };

  const handleDeleteNote = async (noteId) => {
    setDeletingNoteId(noteId);
    try {
      const response = await request.deleteNote({
        entity,
        id,
        noteId,
      });

      if (response.success) {
        message.success(translate('Note deleted successfully'));
        setCurrentQuery(response.result);
      }
    } catch (error) {
      message.error(translate('Failed to delete note'));
    } finally {
      setDeletingNoteId(null);
    }
  };

  const showAddNoteModal = () => {
    setIsAddNoteModalVisible(true);
  };

  const handleAddNoteCancel = () => {
    setIsAddNoteModalVisible(false);
    form.resetFields();
  };

  if (isLoading) {
    return (
      <div style={{ padding: '50px', textAlign: 'center' }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>
          <Text>{translate('Loading...')}</Text>
        </div>
      </div>
    );
  }

  if (!isLoading && !currentQuery._id) {
    return (
      <div style={{ padding: '50px', textAlign: 'center' }}>
        <Text type="danger">{translate('Query not found')}</Text>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        onBack={() => {
          navigate(`/${entity.toLowerCase()}`);
        }}
        title={`${ENTITY_NAME} - ${currentQuery.customerName}`}
        subTitle={`#${currentQuery._id || ''}`}
        ghost={false}
        tags={[
          <Tag
            key="status"
            color={getStatusColor(currentQuery.status)}
            style={{ textTransform: 'capitalize' }}
          >
            {translate(currentQuery.status?.replace('-', '_') || 'open')}
          </Tag>,
        ]}
        extra={[
          <Button
            key={`${uniqueId()}`}
            onClick={() => {
              navigate(`/${entity.toLowerCase()}`);
            }}
            icon={<CloseCircleOutlined />}
          >
            {translate('Close')}
          </Button>,
          <Button
            key={`${uniqueId()}`}
            onClick={() => {
              dispatch(
                erp.currentAction({
                  actionType: 'update',
                  data: currentQuery,
                })
              );
              navigate(`/${entity.toLowerCase()}/update/${currentQuery._id}`);
            }}
            type="primary"
            icon={<EditOutlined />}
          >
            {translate('Edit')}
          </Button>,
        ]}
        style={{
          padding: '20px 0px',
        }}
      >
        <Row gutter={[16, 16]}>
          <Col span={6}>
            <div>
              <Text type="secondary">{translate('Customer Name')}</Text>
              <div style={{ fontSize: '16px', fontWeight: '500' }}>{currentQuery.customerName}</div>
            </div>
          </Col>
          <Col span={6}>
            <div>
              <Text type="secondary">{translate('Email')}</Text>
              <div style={{ fontSize: '16px' }}>
                <MailOutlined style={{ marginRight: 8 }} />
                {currentQuery.email}
              </div>
            </div>
          </Col>
          <Col span={6}>
            <div>
              <Text type="secondary">{translate('Created At')}</Text>
              <div style={{ fontSize: '16px' }}>
                <CalendarOutlined style={{ marginRight: 8 }} />
                {currentQuery.createdAt ? dayjs(currentQuery.createdAt).format(dateFormat) : '-'}
              </div>
            </div>
          </Col>
          <Col span={6}>
            <div>
              <Text type="secondary">{translate('Created By')}</Text>
              <div style={{ fontSize: '16px' }}>
                <UserOutlined style={{ marginRight: 8 }} />
                {currentQuery.createdBy
                  ? `${currentQuery.createdBy.name || ''} ${
                      currentQuery.createdBy.surname || ''
                    }`.trim()
                  : '-'}
              </div>
            </div>
          </Col>
        </Row>
      </PageHeader>

      <Divider dashed />

      <Card title={translate('Query Description')} style={{ marginBottom: 24 }}>
        <Paragraph style={{ fontSize: '16px', lineHeight: 1.6 }}>
          {currentQuery.description || translate('No description provided')}
        </Paragraph>
      </Card>

      {currentQuery.resolution && (
        <Card title={translate('Resolution')} style={{ marginBottom: 24 }}>
          <Paragraph style={{ fontSize: '16px', lineHeight: 1.6 }}>
            {currentQuery.resolution}
          </Paragraph>
        </Card>
      )}

      <Card
        title={
          <Space>
            {translate('Notes')}
            <Text type="secondary">({currentQuery.notes?.length || 0})</Text>
          </Space>
        }
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={showAddNoteModal}>
            {translate('Add Note')}
          </Button>
        }
      >
        {currentQuery.notes?.length > 0 ? (
          <List
            itemLayout="vertical"
            dataSource={currentQuery.notes}
            renderItem={(note) => (
              <List.Item
                actions={[
                  <Popconfirm
                    key="delete"
                    title={translate('Are you sure to delete this note?')}
                    onConfirm={() => handleDeleteNote(note._id)}
                    okText={translate('Yes')}
                    cancelText={translate('No')}
                  >
                    <Button
                      type="link"
                      danger
                      icon={<DeleteOutlined />}
                      size="small"
                      loading={deletingNoteId === note._id}
                      disabled={deletingNoteId === note._id}
                    >
                      {translate('Delete')}
                    </Button>
                  </Popconfirm>,
                ]}
              >
                <List.Item.Meta
                  avatar={<Avatar icon={<UserOutlined />} />}
                  title={
                    <Space>
                      <Text strong>
                        {note.createdBy
                          ? `${note.createdBy.name || ''} ${note.createdBy.surname || ''}`.trim()
                          : translate('Unknown User')}
                      </Text>
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        {note.createdAt ? dayjs(note.createdAt).format(`${dateFormat} HH:mm`) : ''}
                      </Text>
                    </Space>
                  }
                  description={
                    <Paragraph style={{ marginBottom: 0, whiteSpace: 'pre-wrap' }}>
                      {note.content}
                    </Paragraph>
                  }
                />
              </List.Item>
            )}
          />
        ) : (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>
            <Text type="secondary">{translate('No notes yet')}</Text>
          </div>
        )}
      </Card>

      <Modal
        title={translate('Add Note')}
        open={isAddNoteModalVisible}
        onCancel={handleAddNoteCancel}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleAddNote} autoComplete="off">
          <Form.Item
            name="content"
            label={translate('Note Content')}
            rules={[
              {
                required: true,
                message: translate('Note content is required'),
              },
              {
                min: 1,
                message: translate('Note content cannot be empty'),
              },
              {
                max: 500,
                message: translate('Note content cannot exceed 500 characters'),
              },
            ]}
          >
            <TextArea
              rows={4}
              placeholder={translate('Enter note content...')}
              maxLength={500}
              showCount
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={handleAddNoteCancel}>{translate('Cancel')}</Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={isAddingNote}
                disabled={isAddingNote}
              >
                {translate('Add Note')}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
