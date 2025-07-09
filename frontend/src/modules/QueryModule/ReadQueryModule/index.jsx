import { ErpLayout } from '@/layout';
import ReadQueryDetails from './components/ReadQueryDetails';

export default function ReadQueryModule({ config }) {
  return (
    <ErpLayout>
      <ReadQueryDetails config={config} />
    </ErpLayout>
  );
}
