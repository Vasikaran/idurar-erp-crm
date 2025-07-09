import { ErpLayout } from '@/layout';
import UpdateItem from '@/modules/ErpPanelModule/UpdateItem';
import QueryForm from '@/modules/QueryModule/Forms/QueryForm';

export default function UpdateQueryModule({ config }) {
  return (
    <ErpLayout>
      <UpdateItem config={config} UpdateForm={QueryForm} />
    </ErpLayout>
  );
}
