import { createFileRoute, Link } from '@tanstack/react-router';
import { LoginForm } from '@/features/auth/components/login-form';

export const Route = createFileRoute('/_auth/login')({
  component: LoginPage,
});

function LoginPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold">Welcome back</h1>
        <p className="mt-2 text-[hsl(var(--foreground-muted))]">Sign in to your account</p>
      </div>

      {/* Form */}
      <LoginForm />

      {/* Footer */}
      <p className="text-center text-sm text-[hsl(var(--foreground-muted))]">
        Don&apos;t have an account?{' '}
        <Link to="/register" className="font-medium text-[hsl(var(--primary))] hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}
