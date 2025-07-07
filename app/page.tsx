import { Layout } from '@/presentation/layout/Layout';
import { Home } from '@/views/Home';

export default function RootPage() {
  return (
    <Layout>
      <Home />
      <Home />
      <Home />
      <Home />
    </Layout>
  );
}
