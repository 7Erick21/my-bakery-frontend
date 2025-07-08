import { Layout } from '@/presentation/layout/Layout';
import { About } from '@/views/About';
import { Contact } from '@/views/Contact';
import { Home } from '@/views/Home';
import { Products } from '@/views/Products';

export default function RootPage() {
  return (
    <Layout>
      <Home />
      <Products />
      <About />
      <Contact />
    </Layout>
  );
}
