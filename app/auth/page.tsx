import { Layout } from '@/presentation/layout/Layout';
import { LoginPage } from '@/views/Auth/LoginPage';

export default function Auth() {
  return (
    <Layout variant='minimal'>
      <LoginPage />
    </Layout>
  );
}
