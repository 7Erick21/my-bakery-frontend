import { getAllCouponsAdmin } from '@/server/actions/coupons';

import { CouponsList } from '@/views/Dashboard/Coupons';

export default async function DashboardCouponsPage() {
  const coupons = await getAllCouponsAdmin();

  return <CouponsList coupons={coupons} />;
}
