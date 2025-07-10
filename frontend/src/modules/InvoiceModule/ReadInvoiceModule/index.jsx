import NotFound from '@/components/NotFound';
import { ErpLayout } from '@/layout';
import ReadItem from '@/modules/ErpPanelModule/ReadItem';

import PageLoader from '@/components/PageLoader';
import { erp } from '@/redux/erp/actions';
import { selectReadItem } from '@/redux/erp/selectors';
import { useLayoutEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import GenerateSummaryButton from './components/GenerateSummaryButton';

export default function ReadInvoiceModule({ config }) {
  const dispatch = useDispatch();
  const { id } = useParams();
  const [itemslist, setItemsList] = useState([]);

  useLayoutEffect(() => {
    dispatch(erp.read({ entity: config.entity, id }));
  }, [id]);

  const { result: currentResult, isSuccess, isLoading = true } = useSelector(selectReadItem);

  useLayoutEffect(() => {
    if (currentResult) {
      const { items, invoice } = currentResult;
      if (items) {
        setItemsList(items);
      } else if (invoice?.items) {
        setItemsList(invoice.items);
      }
    }
  }, [currentResult]);

  if (isLoading) {
    return (
      <ErpLayout>
        <PageLoader />
      </ErpLayout>
    );
  }

  const customButtons = [
    <GenerateSummaryButton
      key="generate-summary"
      entity={config.entity}
      currentErp={currentResult}
      itemslist={itemslist}
    />,
  ];

  return (
    <ErpLayout>
      {isSuccess ? (
        <ReadItem
          config={config}
          selectedItem={currentResult}
          showItemNotes={true}
          showSummary={true}
          customButtons={customButtons}
        />
      ) : (
        <NotFound entity={config.entity} />
      )}
    </ErpLayout>
  );
}
