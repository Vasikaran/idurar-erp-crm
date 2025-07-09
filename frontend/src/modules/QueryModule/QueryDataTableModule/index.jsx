import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ErpLayout } from '@/layout';
import ErpPanel from '@/modules/ErpPanelModule';
import StatusFilter from './components/StatusFilter';
import { erp } from '@/redux/erp/actions';
import { selectListItems } from '@/redux/erp/selectors';

export default function QueryDataTableModule({ config }) {
  const dispatch = useDispatch();
  const [statusFilter, setStatusFilter] = useState('');
  const { result: listResult } = useSelector(selectListItems);

  const handleStatusChange = (status) => {
    setStatusFilter(status);

    const options = {
      page: 1,
      items: listResult?.pagination?.limit || 10,
    };

    if (status) {
      options.status = status;
    }

    dispatch(erp.list({ entity: config.entity, options }));
  };

  const headerExtraComponents = [
    <StatusFilter
      key="status-filter"
      onStatusChange={handleStatusChange}
      currentStatus={statusFilter}
    />,
  ];

  const extraConfig = {
    ...config,
    currentStatusFilter: statusFilter,
  };

  return (
    <ErpLayout>
      <ErpPanel config={extraConfig} headerExtra={headerExtraComponents} />
    </ErpLayout>
  );
}
