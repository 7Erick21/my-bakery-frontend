import { Layout } from '@/presentation/layout/Layout';
import { NotFound } from '@/views/NotFound';

export default function RootNotFound() {
  return (
    <Layout variant='minimal'>
      <NotFound />
    </Layout>
  );
}
