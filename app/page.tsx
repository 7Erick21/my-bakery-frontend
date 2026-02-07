import { Layout } from '@/presentation/layout/Layout';
import { About } from '@/views/HomePage/About';
import { Contact } from '@/views/HomePage/Contact';
import { Home } from '@/views/HomePage/Home';
import { Products } from '@/views/HomePage/Products';

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
