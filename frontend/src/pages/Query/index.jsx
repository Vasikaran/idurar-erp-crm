import dayjs from 'dayjs';
import { Tag } from 'antd';
import useLanguage from '@/locale/useLanguage';
import { tagColor } from '@/utils/statusTagColor';
import { useDate } from '@/settings';
import QueryDataTableModule from '@/modules/QueryModule/QueryDataTableModule';

export default function Query() {
  const translate = useLanguage();
  const { dateFormat } = useDate();
  const entity = 'query';

  const deleteModalLabels = ['customerName', 'email'];

  const dataTableColumns = [
    {
      title: translate('Customer Name'),
      dataIndex: 'customerName',
      key: 'customerName',
    },
    {
      title: translate('Email'),
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: translate('Description'),
      dataIndex: 'description',
      key: 'description',
      render: (text) => {
        return text?.length > 50 ? `${text.substring(0, 50)}...` : text;
      },
    },
    {
      title: translate('Status'),
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        if (!status) return '-';

        const colorObj = tagColor(status);

        return (
          <Tag
            color={colorObj.color || 'default'}
            style={{
              textTransform: 'capitalize',
              fontWeight: '500',
            }}
          >
            {colorObj.icon} {translate(status.replace('-', '_'))}
          </Tag>
        );
      },
    },
    {
      title: translate('Created At'),
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => {
        return date ? dayjs(date).format(dateFormat) : '-';
      },
    },
    {
      title: translate('Created By'),
      dataIndex: ['createdBy', 'name'],
      key: 'createdBy',
      render: (_, record) => {
        const createdBy = record.createdBy;
        if (!createdBy) return '-';
        return `${createdBy.name || ''} ${createdBy.surname || ''}`.trim();
      },
    },
  ];

  const Labels = {
    PANEL_TITLE: translate('query'),
    DATATABLE_TITLE: translate('query_list'),
    ADD_NEW_ENTITY: translate('add_new_query'),
    ENTITY_NAME: translate('query'),
  };

  const configPage = {
    entity,
    ...Labels,
  };

  const config = {
    ...configPage,
    dataTableColumns,
    deleteModalLabels,
    disableSearch: true,
    disableDownload: true,
  };

  return <QueryDataTableModule config={config} />;
}
