'use client';

import { useEffect, useState } from 'react';

import { createClient } from '@/lib/supabase/client';
import type { UserRole } from '@/lib/supabase/types';

interface AuthUser {
  id: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
  role: UserRole;
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    async function getUser() {
      const {
        data: { user: authUser }
      } = await supabase.auth.getUser();

      if (authUser) {
        const { data } = await supabase
          .from('profiles')
          .select('role, full_name, avatar_url')
          .eq('id', authUser.id)
          .single();

        const profile = data as {
          role: UserRole;
          full_name: string | null;
          avatar_url: string | null;
        } | null;

        setUser({
          id: authUser.id,
          email: authUser.email!,
          fullName:
            profile?.full_name ??
            (authUser.user_metadata?.full_name as string | undefined) ??
            null,
          avatarUrl:
            profile?.avatar_url ??
            (authUser.user_metadata?.avatar_url as string | undefined) ??
            null,
          role: profile?.role ?? 'user'
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    }

    getUser();

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        getUser();
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return { user, loading };
}
