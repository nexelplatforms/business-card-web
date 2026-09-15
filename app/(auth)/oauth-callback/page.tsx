'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import api from '@/lib/api';

function OAuthCallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const error = searchParams.get('error');

    if (error) {
      console.error('OAuth callback error:', error);
      router.replace('/login?error=oauth_failed');
      return;
    }

    const token = searchParams.get('token');
    const userParam = searchParams.get('user');

    if (token) {
      try {
        localStorage.setItem('token', token);
        if (userParam) {
          try {
            const user = JSON.parse(decodeURIComponent(userParam));
            localStorage.setItem('user', JSON.stringify(user));
          } catch (pe) {
            console.warn('Could not parse user param:', pe);
          }
        }
        window.dispatchEvent(new Event('auth-change'));
        const redirectTarget = searchParams.get('redirect') || '/dashboard';
        router.replace(redirectTarget);
      } catch (e) {
        console.error('Failed to store OAuth callback session:', e);
        router.replace('/login?error=oauth_failed');
      }
      return;
    }

    const fetchSession = async () => {
      try {
        const response = await api.get('/profile');
        const user = response.data?.data || response.data;

        if (user) {
          localStorage.setItem('user', JSON.stringify(user));
          window.dispatchEvent(new Event('auth-change'));
          router.replace('/dashboard');
        } else {
          router.replace('/login?error=oauth_failed');
        }
      } catch (e) {
        console.error('Failed to fetch session after OAuth:', e);
        router.replace('/login?error=oauth_failed');
      }
    };

    fetchSession();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-muted-foreground text-sm">Completing sign-in…</p>
    </div>
  );
}

export default function OAuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <OAuthCallbackHandler />
    </Suspense>
  );
}
