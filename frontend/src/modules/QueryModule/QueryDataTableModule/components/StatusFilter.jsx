import { Select } from 'antd';
import useLanguage from '@/locale/useLanguage';
import { tagColor } from '@/utils/statusTagColor';

const { Option } = Select;

export default function StatusFilter({ onStatusChange, currentStatus }) {
  const translate = useLanguage();

  const statusOptions = [
    { value: '', label: translate('All Status') },
    { value: 'open', label: translate('open') },
    { value: 'in-progress', label: translate('in_progress') },
    { value: 'resolved', label: translate('resolved') },
    { value: 'closed', label: translate('closed') },
  ];

  const handleChange = (value) => {
    onStatusChange(value);
  };

  return (
    <Select
      placeholder={translate('Filter by Status')}
      value={currentStatus}
      onChange={handleChange}
      style={{ width: 160 }}
      allowClear
    >
      {statusOptions.map((option) => {
        const colorObj = tagColor(option.value);
        return (
          <Option key={option.value} value={option.value}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {option.value && (
                <span
                  style={{
                    display: 'inline-block',
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: colorObj.color || '#d9d9d9',
                  }}
                />
              )}
              {option.label}
            </span>
          </Option>
        );
      })}
    </Select>
  );
}
