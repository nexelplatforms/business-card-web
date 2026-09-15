'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  Loader2, 
  Mail, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck
} from 'lucide-react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { Input, Label } from '@/components/ui/form-elements';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [appleLoading, setAppleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (searchParams.get('verified') === 'true') {
      setSuccessMessage('Email verified successfully! You can now log in.');
    }
    if (searchParams.get('error') === 'oauth_failed') {
      setError('Google sign-in failed. Please try again.');
    }
  }, [searchParams]);

  const defaultEmail = searchParams.get('email') || '';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    defaultValues: {
      email: defaultEmail,
    },
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.post('/auth/login', data);
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      window.dispatchEvent(new Event('auth-change'));
      const target = searchParams.get('redirect') || '/dashboard';
      router.push(target);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to login. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError(null);
    try {
      const redirectTarget = searchParams.get('redirect');
      const callbackURL =
        window.location.origin +
        '/callback' +
        (redirectTarget ? `?redirect=${encodeURIComponent(redirectTarget)}` : '');

      const response = await api.post('/better-auth/sign-in/social', {
        provider: 'google',
        callbackURL,
      });

      const redirectUrl = response.data.url;
      if (redirectUrl) window.location.href = redirectUrl;
    } catch (err: any) {
      console.error('Google Sign-in error:', err);
      setError('Failed to initiate Google sign-in.');
      setGoogleLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    setAppleLoading(true);
    setError(null);
    try {
      const redirectTarget = searchParams.get('redirect');
      const callbackURL =
        window.location.origin +
        '/callback' +
        (redirectTarget ? `?redirect=${encodeURIComponent(redirectTarget)}` : '');

      const response = await api.post('/better-auth/sign-in/social', {
        provider: 'apple',
        callbackURL,
      });

      const redirectUrl = response.data.url;
      if (redirectUrl) {
        window.location.href = redirectUrl;
      } else {
        throw new Error('No redirect URL returned');
      }
    } catch (err: any) {
      console.error('Apple Sign-in error:', err);
      try {
        const clientId = process.env.NEXT_PUBLIC_APPLE_CLIENT_ID || 'com.lukewarm.app.si';
        const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://card-crm-api.lukewarm-api.workers.dev/api';
        const apiUrl = rawApiUrl.endsWith('/') ? rawApiUrl.slice(0, -1) : rawApiUrl;
        const callbackUrl = `${apiUrl}/auth/apple/callback`;
        const webOrigin = window.location.origin;
        const appleAuthUrl =
          `https://appleid.apple.com/auth/authorize?` +
          `client_id=${encodeURIComponent(clientId)}` +
          `&redirect_uri=${encodeURIComponent(callbackUrl)}` +
          `&response_type=code%20id_token` +
          `&response_mode=form_post` +
          `&scope=name%20email` +
          `&state=${encodeURIComponent('web:' + webOrigin)}`;

        window.location.href = appleAuthUrl;
      } catch (fallbackErr) {
        setError('Failed to initiate Apple sign-in.');
        setAppleLoading(false);
      }
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col lg:flex-row">
      
      {/* Left Pane - Brand Showcase */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#033F63] p-12 flex-col justify-between text-white overflow-hidden">

        {/* Top brand */}
        <Link href="/" className="relative z-10 flex items-center gap-2.5">
          <Image
            src="/logo.png"
            alt="Lukewarm Logo"
            width={38}
            height={31}
            className="h-8 w-auto object-contain"
          />
          <span className="font-display text-xl font-bold tracking-tight text-white">Lukewarm</span>
        </Link>

        {/* Center quote / feature badge */}
        <div className="relative z-10 max-w-md space-y-6">
          <p className="text-xs font-bold text-cyan-300 tracking-wider uppercase">
            Executive Contact Intelligence
          </p>

          <h2 className="font-display text-3xl sm:text-4xl font-extrabold leading-tight">
            &ldquo;The fastest way to turn conference handshakes into closed deals.&rdquo;
          </h2>

          <div className="space-y-3 text-sm text-slate-300">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="h-4 w-4 text-cyan-400" />
              <span>Sub-second continuous flash scanning</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="h-4 w-4 text-cyan-400" />
              <span>AI voice memos linked to contact records</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="h-4 w-4 text-cyan-400" />
              <span>Bi-directional Google Calendar meeting sync</span>
            </div>
          </div>
        </div>

        {/* Bottom footer badge */}
        <div className="relative z-10 flex items-center justify-between text-xs text-slate-400 pt-6 border-t border-white/10">
          <span className="flex items-center gap-1.5 font-mono">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            AES-256 Encrypted Storage
          </span>
          <span>© 2026 Lukewarm</span>
        </div>
      </div>

      {/* Right Pane - Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-background">
        <div className="w-full max-w-md animate-fade-in space-y-6">
          
          <div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-foreground">
              Sign In to Your Account
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Access your account, active events, and synced contacts.
            </p>
          </div>

          {/* Feedback messages */}
          {error && (
            <div className="flex items-center gap-2 rounded-2xl bg-destructive/10 p-4 text-xs font-semibold text-destructive border border-destructive/20">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {successMessage && (
            <div className="flex items-center gap-2 rounded-2xl bg-emerald-500/10 p-4 text-xs font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <p>{successMessage}</p>
            </div>
          )}

          {/* Social OAuth Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant="outline"
              className="w-full h-12 rounded-2xl flex items-center justify-center gap-2 font-semibold text-xs border-border hover:bg-secondary transition-all"
              onClick={handleGoogleSignIn}
              disabled={googleLoading || appleLoading || isLoading}
            >
              {googleLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
              )}
              <span>Google</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full h-12 rounded-2xl flex items-center justify-center gap-2 font-semibold text-xs border-border bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90 transition-all"
              onClick={handleAppleSignIn}
              disabled={appleLoading || googleLoading || isLoading}
            >
              {appleLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.85c.66-.8 1.11-1.92.99-3.04-.95.04-2.1.64-2.78 1.43-.61.71-1.14 1.86-1 2.97 1.07.08 2.13-.56 2.79-1.36z"/>
                </svg>
              )}
              <span>Apple</span>
            </Button>
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-mono">
              <span className="bg-background px-3 text-muted-foreground">Or sign in with email</span>
            </div>
          </div>

          {/* Email / Password Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  placeholder="name@company.com"
                  type="email"
                  className="pl-10 rounded-2xl h-11"
                  {...register('email')}
                />
              </div>
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Password
                </Label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-medium text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <PasswordInput
                id="password"
                className="rounded-2xl h-11"
                {...register('password')}
              />
              {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
            </div>

            <Button
              type="submit"
              className="w-full btn-primary-glow rounded-2xl h-12 font-bold text-xs"
              disabled={isLoading || googleLoading || appleLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing In...
                </>
              ) : (
                <span className="flex items-center gap-1.5">
                  <span>Sign In</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </span>
              )}
            </Button>
          </form>

          {/* Signup link */}
          <div className="pt-2 text-center text-xs text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="font-bold text-primary hover:underline">
              Create free account
            </Link>
          </div>
        </div>
      </div>

    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
