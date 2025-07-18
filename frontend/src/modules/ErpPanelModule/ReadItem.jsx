import { useState, useEffect } from 'react';
import { Divider, Alert, Typography } from 'antd';

import { Button, Row, Col, Descriptions, Statistic, Tag } from 'antd';
import { PageHeader } from '@ant-design/pro-layout';
import {
  EditOutlined,
  FilePdfOutlined,
  CloseCircleOutlined,
  RetweetOutlined,
  MailOutlined,
  FileTextOutlined,
} from '@ant-design/icons';

import { useSelector, useDispatch } from 'react-redux';
import useLanguage from '@/locale/useLanguage';
import { erp } from '@/redux/erp/actions';

import { generate as uniqueId } from 'shortid';

import { selectCurrentItem } from '@/redux/erp/selectors';

import { DOWNLOAD_BASE_URL } from '@/config/serverApiConfig';
import { useMoney, useDate } from '@/settings';
import useMail from '@/hooks/useMail';
import { useNavigate } from 'react-router-dom';

const { Text, Paragraph } = Typography;

const Item = ({ item, currentErp, showItemNotes = false }) => {
  const { moneyFormatter } = useMoney();
  const translate = useLanguage();

  return (
    <>
      <Row gutter={[12, 0]} key={item._id}>
        <Col className="gutter-row" span={showItemNotes ? 7 : 11}>
          <p style={{ marginBottom: 5 }}>
            <strong>{item.itemName}</strong>
          </p>
          <p>{item.description}</p>
        </Col>
        <Col className="gutter-row" span={showItemNotes ? 3 : 4}>
          <p
            style={{
              textAlign: 'right',
            }}
          >
            {moneyFormatter({ amount: item.price, currency_code: currentErp.currency })}
          </p>
        </Col>
        <Col className="gutter-row" span={showItemNotes ? 3 : 4}>
          <p
            style={{
              textAlign: 'right',
            }}
          >
            {item.quantity}
          </p>
        </Col>
        <Col className="gutter-row" span={showItemNotes ? 4 : 5}>
          <p
            style={{
              textAlign: 'right',
              fontWeight: '700',
            }}
          >
            {moneyFormatter({ amount: item.total, currency_code: currentErp.currency })}
          </p>
        </Col>
        {showItemNotes && (
          <Col className="gutter-row" span={7}>
            <p
              style={{
                fontSize: '12px',
                color: '#666',
                wordBreak: 'break-word',
                textAlign: 'left',
                minHeight: '20px',
                margin: 0,
              }}
            >
              {item.notes || '-'}
            </p>
          </Col>
        )}
      </Row>

      <Divider dashed style={{ marginTop: 0, marginBottom: 15 }} />
    </>
  );
};

const SummaryDisplay = ({ currentErp, translate }) => {
  if (!currentErp.notesSummary) {
    return null;
  }

  return (
    <>
      <Alert
        message={translate('Notes Summary')}
        description={
          <div>
            <Paragraph style={{ marginBottom: 8 }}>{currentErp.notesSummary}</Paragraph>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {translate('Generated on')}:{' '}
              {new Date(currentErp.summaryGeneratedAt).toLocaleString()}
            </Text>
          </div>
        }
        type="info"
        icon={<FileTextOutlined />}
        style={{ marginBottom: 16 }}
      />
      <Divider />
    </>
  );
};

export default function ReadItem({
  config,
  selectedItem,
  showItemNotes = false,
  customButtons = [],
  showSummary = false,
}) {
  const translate = useLanguage();
  const { entity, ENTITY_NAME } = config;
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { moneyFormatter } = useMoney();
  const { send, isLoading: mailInProgress } = useMail({ entity });

  const { result: currentResult } = useSelector(selectCurrentItem);

  const resetErp = {
    status: '',
    client: {
      name: '',
      email: '',
      phone: '',
      address: '',
    },
    subTotal: 0,
    taxTotal: 0,
    taxRate: 0,
    total: 0,
    credit: 0,
    number: 0,
    year: 0,
  };

  const [itemslist, setItemsList] = useState([]);
  const [currentErp, setCurrentErp] = useState(selectedItem ?? resetErp);
  const [client, setClient] = useState({});

  useEffect(() => {
    if (currentResult) {
      const { items, invoice, ...others } = currentResult;

      if (items) {
        setItemsList(items);
        setCurrentErp(currentResult);
      } else if (invoice.items) {
        setItemsList(invoice.items);
        setCurrentErp({ ...invoice.items, ...others, ...invoice });
      }
    }
    return () => {
      setItemsList([]);
      setCurrentErp(resetErp);
    };
  }, [currentResult]);

  useEffect(() => {
    if (currentErp?.client) {
      setClient(currentErp.client);
    }
  }, [currentErp]);

  const updateCurrentErp = (newData) => {
    setCurrentErp((prev) => ({
      ...prev,
      ...newData,
    }));
  };

  return (
    <>
      <PageHeader
        onBack={() => {
          navigate(`/${entity.toLowerCase()}`);
        }}
        title={`${ENTITY_NAME} # ${currentErp.number}/${currentErp.year || ''}`}
        ghost={false}
        tags={[
          <span key="status">{currentErp.status && translate(currentErp.status)}</span>,
          currentErp.paymentStatus && (
            <span key="paymentStatus">
              {currentErp.paymentStatus && translate(currentErp.paymentStatus)}
            </span>
          ),
        ]}
        extra={[
          ...customButtons.map((button) =>
            button.key === 'generate-summary'
              ? { ...button, props: { ...button.props, onSummaryGenerated: updateCurrentErp } }
              : button
          ),
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
              window.open(
                `${DOWNLOAD_BASE_URL}${entity}/${entity}-${currentErp._id}.pdf`,
                '_blank'
              );
            }}
            icon={<FilePdfOutlined />}
          >
            {translate('Download PDF')}
          </Button>,
          <Button
            key={`${uniqueId()}`}
            loading={mailInProgress}
            onClick={() => {
              send(currentErp._id);
            }}
            icon={<MailOutlined />}
          >
            {translate('Send by Email')}
          </Button>,

          <Button
            key={`${uniqueId()}`}
            onClick={() => {
              dispatch(erp.convert({ entity, id: currentErp._id }));
            }}
            icon={<RetweetOutlined />}
            style={{ display: entity === 'quote' ? 'inline-block' : 'none' }}
          >
            {translate('Convert to Invoice')}
          </Button>,

          <Button
            key={`${uniqueId()}`}
            onClick={() => {
              dispatch(
                erp.currentAction({
                  actionType: 'update',
                  data: currentErp,
                })
              );
              navigate(`/${entity.toLowerCase()}/update/${currentErp._id}`);
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
        <Row>
          <Statistic title="Status" value={currentErp.status} />
          <Statistic
            title={translate('SubTotal')}
            value={moneyFormatter({
              amount: currentErp.subTotal,
              currency_code: currentErp.currency,
            })}
            style={{
              margin: '0 32px',
            }}
          />
          <Statistic
            title={translate('Total')}
            value={moneyFormatter({ amount: currentErp.total, currency_code: currentErp.currency })}
            style={{
              margin: '0 32px',
            }}
          />
          <Statistic
            title={translate('Paid')}
            value={moneyFormatter({
              amount: currentErp.credit,
              currency_code: currentErp.currency,
            })}
            style={{
              margin: '0 32px',
            }}
          />
        </Row>
      </PageHeader>
      <Divider dashed />
      <Descriptions title={`Client : ${currentErp.client.name}`}>
        <Descriptions.Item label={translate('Address')}>{client.address}</Descriptions.Item>
        <Descriptions.Item label={translate('email')}>{client.email}</Descriptions.Item>
        <Descriptions.Item label={translate('Phone')}>{client.phone}</Descriptions.Item>
      </Descriptions>
      <Divider />

      {showSummary && <SummaryDisplay currentErp={currentErp} translate={translate} />}

      <Row gutter={[12, 0]}>
        <Col className="gutter-row" span={showItemNotes ? 7 : 11}>
          <p>
            <strong>{translate('Product')}</strong>
          </p>
        </Col>
        <Col className="gutter-row" span={showItemNotes ? 3 : 4}>
          <p
            style={{
              textAlign: 'right',
            }}
          >
            <strong>{translate('Price')}</strong>
          </p>
        </Col>
        <Col className="gutter-row" span={showItemNotes ? 3 : 4}>
          <p
            style={{
              textAlign: 'right',
            }}
          >
            <strong>{translate('Quantity')}</strong>
          </p>
        </Col>
        <Col className="gutter-row" span={showItemNotes ? 4 : 5}>
          <p
            style={{
              textAlign: 'right',
            }}
          >
            <strong>{translate('Total')}</strong>
          </p>
        </Col>
        {showItemNotes && (
          <Col className="gutter-row" span={7}>
            <p
              style={{
                textAlign: 'right',
              }}
            >
              <strong>{translate('Notes')}</strong>
            </p>
          </Col>
        )}
        <Divider />
      </Row>

      {itemslist.map((item) => (
        <Item key={item._id} item={item} currentErp={currentErp} showItemNotes={showItemNotes} />
      ))}

      {/* Total Section */}
      <div
        style={{
          width: '300px',
          float: 'right',
          textAlign: 'right',
          fontWeight: '700',
        }}
      >
        <Row gutter={[12, -5]}>
          <Col className="gutter-row" span={12}>
            <p>{translate('Sub Total')} :</p>
          </Col>
          <Col className="gutter-row" span={12}>
            <p>
              {moneyFormatter({ amount: currentErp.subTotal, currency_code: currentErp.currency })}
            </p>
          </Col>
          <Col className="gutter-row" span={12}>
            <p>
              {translate('Tax Total')} ({currentErp.taxRate} %) :
            </p>
          </Col>
          <Col className="gutter-row" span={12}>
            <p>
              {moneyFormatter({ amount: currentErp.taxTotal, currency_code: currentErp.currency })}
            </p>
          </Col>
          <Col className="gutter-row" span={12}>
            <p>{translate('Total')} :</p>
          </Col>
          <Col className="gutter-row" span={12}>
            <p>
              {moneyFormatter({ amount: currentErp.total, currency_code: currentErp.currency })}
            </p>
          </Col>
        </Row>
      </div>
    </>
  );
}
