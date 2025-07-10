import { useState } from 'react';
import { Button, Modal, Typography, Alert } from 'antd';
import { BulbOutlined } from '@ant-design/icons';
import useLanguage from '@/locale/useLanguage';
import { request } from '@/request';

const { Text, Paragraph } = Typography;

const GenerateSummaryButton = ({
  entity,
  currentErp,
  itemslist = [],
  onSummaryGenerated = () => {},
}) => {
  const translate = useLanguage();

  const [summaryModalVisible, setSummaryModalVisible] = useState(false);
  const [summaryData, setSummaryData] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);

  const hasNotes = () => {
    return itemslist.some((item) => item.notes && item.notes.trim() !== '');
  };

  const handleGenerateSummary = async () => {
    if (!hasNotes()) {
      Modal.warning({
        title: translate('No Notes Found'),
        content: translate('There are no notes in the invoice items to summarize.'),
      });
      return;
    }

    setSummaryLoading(true);
    try {
      const response = await request.generateSummary({
        entity: entity.toLowerCase(),
        id: currentErp._id,
      });

      if (response.success) {
        setSummaryData(response.result);
        setSummaryModalVisible(true);
        onSummaryGenerated({
          notesSummary: response.result.summary,
          summaryGeneratedAt: response.result.generatedAt,
        });
      }
    } catch (error) {
      console.error('Error generating summary:', error);
    } finally {
      setSummaryLoading(false);
    }
  };

  if (!currentErp || !currentErp._id) {
    return null;
  }

  return (
    <>
      <Button
        key={`generate-summary-${currentErp._id}`}
        onClick={handleGenerateSummary}
        loading={summaryLoading}
        icon={<BulbOutlined />}
        type="default"
        style={{
          backgroundColor: hasNotes() ? '#f0f8ff' : '#f5f5f5',
          borderColor: hasNotes() ? '#1890ff' : '#d9d9d9',
          color: hasNotes() ? '#1890ff' : '#999',
        }}
        disabled={!hasNotes()}
      >
        {translate('Generate Summary')}
      </Button>

      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <BulbOutlined style={{ marginRight: 8, color: '#1890ff' }} />
            {translate('Generated Summary')}
          </div>
        }
        open={summaryModalVisible}
        onCancel={() => setSummaryModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setSummaryModalVisible(false)}>
            {translate('Close')}
          </Button>,
        ]}
        width={600}
      >
        {summaryData && (
          <div>
            <Alert
              message={translate('Summary Generated Successfully')}
              description={
                <div>
                  <Text type="secondary">
                    {translate('Based on')} {summaryData.notesCount}{' '}
                    {translate('notes from invoice items')}
                  </Text>
                </div>
              }
              type="success"
              showIcon
              style={{ marginBottom: 16 }}
            />
            <div
              style={{
                background: '#f8f9fa',
                padding: '16px',
                borderRadius: '6px',
                border: '1px solid #e9ecef',
              }}
            >
              <Paragraph style={{ marginBottom: 0, lineHeight: '1.6' }}>
                {summaryData.summary}
              </Paragraph>
            </div>
            <div style={{ marginTop: 12, textAlign: 'right' }}>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                {translate('Generated on')}: {new Date(summaryData.generatedAt).toLocaleString()}
              </Text>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};

export default GenerateSummaryButton;
