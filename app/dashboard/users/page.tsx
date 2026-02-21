import { getAllUsers } from '@/server/queries/users';

import { UsersList } from '@/views/Dashboard/Users';

export default async function DashboardUsersPage() {
  const users = await getAllUsers();

  return <UsersList users={users} />;
}
