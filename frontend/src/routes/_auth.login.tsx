import { createFileRoute, Link } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLogin } from '@/features/auth/hooks';
import { loginSchema, type LoginFormData } from '@/features/auth/schemas';

export const Route = createFileRoute('/_auth/login')({
  component: LoginPage,
});

function LoginPage() {
  const login = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = (data: LoginFormData) => {
    login.mutate(data);
  };

  return (
    <div className="w-full">
      {/* Card container */}
      <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-[1.75rem] p-8 sm:p-10 shadow-xl">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="relative w-[4.5rem] h-[4.5rem] rounded-[1.375rem] bg-gradient-primary flex items-center justify-center">
            <div className="absolute inset-[3px] rounded-[1.2rem] bg-[hsl(var(--card))]" />
            <span className="relative text-2xl font-extrabold gradient-text">P</span>
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-[1.75rem] font-bold mb-2">Welcome to Pinge</h1>
          <p className="text-[hsl(var(--foreground-muted))]">Sign in to continue</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Email field */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-[hsl(var(--foreground-secondary))]">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              autoComplete="email"
              className="h-12 px-4 rounded-xl bg-[hsl(var(--secondary))] border-[hsl(var(--border))] focus:border-[hsl(var(--primary))] focus:ring-[hsl(var(--primary))]"
              {...register('email')}
            />
            {errors.email && (
              <p className="text-sm text-[hsl(var(--destructive))]">{errors.email.message}</p>
            )}
          </div>

          {/* Password field */}
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium text-[hsl(var(--foreground-secondary))]">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              autoComplete="current-password"
              className="h-12 px-4 rounded-xl bg-[hsl(var(--secondary))] border-[hsl(var(--border))] focus:border-[hsl(var(--primary))] focus:ring-[hsl(var(--primary))]"
              {...register('password')}
            />
            {errors.password && (
              <p className="text-sm text-[hsl(var(--destructive))]">{errors.password.message}</p>
            )}
            <div className="flex justify-end">
              <Link
                to="/forgot-password"
                className="text-sm text-[hsl(var(--primary))] hover:underline"
              >
                Forgot password?
              </Link>
            </div>
          </div>

          {/* Submit button */}
          <Button
            type="submit"
            className="w-full h-12 rounded-xl bg-gradient-primary hover:opacity-90 text-white font-semibold text-base transition-all duration-200 hover:shadow-lg hover:shadow-[hsl(var(--primary)/0.3)]"
            disabled={login.isPending}
          >
            {login.isPending && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
            Sign In
          </Button>
        </form>

        {/* Footer */}
        <p className="text-center text-sm text-[hsl(var(--foreground-muted))] mt-8">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="font-semibold text-[hsl(var(--primary))] hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
