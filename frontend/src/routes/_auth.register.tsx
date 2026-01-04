import { createFileRoute, Link } from '@tanstack/react-router';
import { RegisterForm } from '@/features/auth/components/register-form';

export const Route = createFileRoute('/_auth/register')({
  component: RegisterPage,
});

function RegisterPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold">Create account</h1>
        <p className="mt-2 text-[hsl(var(--foreground-muted))]">Get started with Pinge</p>
      </div>

      {/* Form */}
      <RegisterForm />

      {/* Footer */}
      <p className="text-center text-sm text-[hsl(var(--foreground-muted))]">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-[hsl(var(--primary))] hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
