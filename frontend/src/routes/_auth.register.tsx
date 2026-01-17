import { createFileRoute, Link } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useRegister } from '@/features/auth/hooks';
import { registerSchema, GENDER_OPTIONS, type RegisterFormData } from '@/features/auth/schemas';

export const Route = createFileRoute('/_auth/register')({
  component: RegisterPage,
});

function RegisterPage() {
  const registerMutation = useRegister();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      gender: undefined,
      country: '',
    },
  });

  const selectedGender = watch('gender');

  const onSubmit = (data: RegisterFormData) => {
    registerMutation.mutate(data);
  };

  return (
    <div className="w-full">
      {/* Card container */}
      <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-[1.75rem] p-8 sm:p-10 shadow-xl">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="relative w-[4rem] h-[4rem] rounded-[1.25rem] bg-gradient-primary flex items-center justify-center">
            <div className="absolute inset-[3px] rounded-[1.1rem] bg-[hsl(var(--card))]" />
            <span className="relative text-xl font-extrabold gradient-text">P</span>
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl sm:text-[1.75rem] font-bold mb-2">Create Account</h1>
          <p className="text-[hsl(var(--foreground-muted))]">Join Pinge today</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Username field */}
          <div className="space-y-2">
            <Label htmlFor="username" className="text-sm font-medium text-[hsl(var(--foreground-secondary))]">
              Username
            </Label>
            <Input
              id="username"
              type="text"
              placeholder="Choose a username"
              autoComplete="username"
              className="h-12 px-4 rounded-xl bg-[hsl(var(--secondary))] border-[hsl(var(--border))] focus:border-[hsl(var(--primary))] focus:ring-[hsl(var(--primary))]"
              {...register('username')}
            />
            {errors.username && (
              <p className="text-sm text-[hsl(var(--destructive))]">{errors.username.message}</p>
            )}
          </div>

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
              placeholder="Create a strong password"
              autoComplete="new-password"
              className="h-12 px-4 rounded-xl bg-[hsl(var(--secondary))] border-[hsl(var(--border))] focus:border-[hsl(var(--primary))] focus:ring-[hsl(var(--primary))]"
              {...register('password')}
            />
            {errors.password && (
              <p className="text-sm text-[hsl(var(--destructive))]">{errors.password.message}</p>
            )}
            <p className="text-xs text-[hsl(var(--foreground-muted))]">
              At least 8 characters with uppercase, lowercase, and number
            </p>
          </div>

          {/* Gender and Country in a row on larger screens */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Gender field */}
            <div className="space-y-2">
              <Label htmlFor="gender" className="text-sm font-medium text-[hsl(var(--foreground-secondary))]">
                Gender
              </Label>
              <Select
                value={selectedGender}
                onValueChange={(value) => setValue('gender', value as RegisterFormData['gender'])}
              >
                <SelectTrigger className="h-12 px-4 rounded-xl bg-[hsl(var(--secondary))] border-[hsl(var(--border))] focus:border-[hsl(var(--primary))] focus:ring-[hsl(var(--primary))]">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-[hsl(var(--border))]">
                  {GENDER_OPTIONS.map((gender) => (
                    <SelectItem key={gender} value={gender} className="rounded-lg">
                      {gender}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.gender && (
                <p className="text-sm text-[hsl(var(--destructive))]">{errors.gender.message}</p>
              )}
            </div>

            {/* Country field */}
            <div className="space-y-2">
              <Label htmlFor="country" className="text-sm font-medium text-[hsl(var(--foreground-secondary))]">
                Country
              </Label>
              <Input
                id="country"
                type="text"
                placeholder="Your country"
                className="h-12 px-4 rounded-xl bg-[hsl(var(--secondary))] border-[hsl(var(--border))] focus:border-[hsl(var(--primary))] focus:ring-[hsl(var(--primary))]"
                {...register('country')}
              />
              {errors.country && (
                <p className="text-sm text-[hsl(var(--destructive))]">{errors.country.message}</p>
              )}
            </div>
          </div>

          {/* Submit button */}
          <Button
            type="submit"
            className="w-full h-12 rounded-xl bg-gradient-primary hover:opacity-90 text-white font-semibold text-base transition-all duration-200 hover:shadow-lg hover:shadow-[hsl(var(--primary)/0.3)] mt-2"
            disabled={registerMutation.isPending}
          >
            {registerMutation.isPending && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
            Create Account
          </Button>
        </form>

        {/* Footer */}
        <p className="text-center text-sm text-[hsl(var(--foreground-muted))] mt-6">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-[hsl(var(--primary))] hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
