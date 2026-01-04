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
import { useRegister } from '../hooks';
import { registerSchema, GENDER_OPTIONS, type RegisterFormData } from '../schemas';

/**
 * Registration form component
 */
function RegisterForm() {
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Username field */}
      <div className="space-y-2">
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          type="text"
          placeholder="johndoe"
          autoComplete="username"
          {...register('username')}
        />
        {errors.username && (
          <p className="text-sm text-[hsl(var(--destructive))]">{errors.username.message}</p>
        )}
      </div>

      {/* Email field */}
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          {...register('email')}
        />
        {errors.email && <p className="text-sm text-[hsl(var(--destructive))]">{errors.email.message}</p>}
      </div>

      {/* Password field */}
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="Create a strong password"
          autoComplete="new-password"
          {...register('password')}
        />
        {errors.password && (
          <p className="text-sm text-[hsl(var(--destructive))]">{errors.password.message}</p>
        )}
        <p className="text-xs text-[hsl(var(--foreground-muted))]">
          At least 8 characters with uppercase, lowercase, and number
        </p>
      </div>

      {/* Gender field */}
      <div className="space-y-2">
        <Label htmlFor="gender">Gender</Label>
        <Select
          value={selectedGender}
          onValueChange={(value) => setValue('gender', value as RegisterFormData['gender'])}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select gender" />
          </SelectTrigger>
          <SelectContent>
            {GENDER_OPTIONS.map((gender) => (
              <SelectItem key={gender} value={gender}>
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
        <Label htmlFor="country">Country</Label>
        <Input
          id="country"
          type="text"
          placeholder="Enter your country"
          {...register('country')}
        />
        {errors.country && (
          <p className="text-sm text-[hsl(var(--destructive))]">{errors.country.message}</p>
        )}
      </div>

      {/* Submit button */}
      <Button type="submit" className="w-full" disabled={registerMutation.isPending}>
        {registerMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Create account
      </Button>
    </form>
  );
}

export { RegisterForm };
