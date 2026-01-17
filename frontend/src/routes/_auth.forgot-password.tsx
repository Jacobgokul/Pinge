import { useState } from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, ArrowLeft, Mail, CheckCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export const Route = createFileRoute('/_auth/forgot-password')({
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsSubmitting(true);
    // Simulate API call - replace with actual forgot password mutation
    await new Promise((resolve) => setTimeout(resolve, 1500));
    console.log('Reset email sent to:', data.email);
    setIsSubmitting(false);
    setIsSubmitted(true);
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

        {!isSubmitted ? (
          <>
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-2xl sm:text-[1.75rem] font-bold mb-2">Forgot Password?</h1>
              <p className="text-[hsl(var(--foreground-muted))]">
                No worries, we'll send you reset instructions
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Email field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-[hsl(var(--foreground-secondary))]">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[hsl(var(--foreground-muted))]" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    autoComplete="email"
                    className="h-12 pl-12 pr-4 rounded-xl bg-[hsl(var(--secondary))] border-[hsl(var(--border))] focus:border-[hsl(var(--primary))] focus:ring-[hsl(var(--primary))]"
                    {...register('email')}
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-[hsl(var(--destructive))]">{errors.email.message}</p>
                )}
              </div>

              {/* Submit button */}
              <Button
                type="submit"
                className="w-full h-12 rounded-xl bg-gradient-primary hover:opacity-90 text-white font-semibold text-base transition-all duration-200 hover:shadow-lg hover:shadow-[hsl(var(--primary)/0.3)]"
                disabled={isSubmitting}
              >
                {isSubmitting && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                Reset Password
              </Button>
            </form>
          </>
        ) : (
          <>
            {/* Success State */}
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 rounded-full bg-[hsl(var(--success)/0.1)] flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-[hsl(var(--success))]" />
                </div>
              </div>
              <h2 className="text-2xl font-bold mb-2">Check your email</h2>
              <p className="text-[hsl(var(--foreground-muted))] mb-6">
                We've sent a password reset link to your email address. Please check your inbox.
              </p>
              <Button
                variant="outline"
                className="w-full h-12 rounded-xl border-[hsl(var(--border))] hover:bg-[hsl(var(--secondary))]"
                onClick={() => setIsSubmitted(false)}
              >
                Try another email
              </Button>
            </div>
          </>
        )}

        {/* Back to login */}
        <Link
          to="/login"
          className="flex items-center justify-center gap-2 mt-8 text-sm text-[hsl(var(--foreground-muted))] hover:text-[hsl(var(--foreground))] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Sign In
        </Link>
      </div>
    </div>
  );
}
