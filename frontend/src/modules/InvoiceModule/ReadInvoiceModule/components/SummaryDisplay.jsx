import { Alert, Typography } from 'antd';
import { FileTextOutlined } from '@ant-design/icons';
import useLanguage from '@/locale/useLanguage';

const { Text, Paragraph } = Typography;

const SummaryDisplay = ({ currentErp }) => {
  const translate = useLanguage();

  if (!currentErp.notesSummary) {
    return null;
  }

  return (
    <Alert
      message={translate('Notes Summary')}
      description={
        <div>
          <Paragraph style={{ marginBottom: 8 }}>{currentErp.notesSummary}</Paragraph>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {translate('Generated on')}: {new Date(currentErp.summaryGeneratedAt).toLocaleString()}
          </Text>
        </div>
      }
      type="info"
      icon={<FileTextOutlined />}
      style={{ marginBottom: 16 }}
    />
  );
};

export default SummaryDisplay;
