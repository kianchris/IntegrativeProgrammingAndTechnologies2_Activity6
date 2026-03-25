import { UserInput } from './Models/User';

export type UserValidationErrors = {
  email: string;
  username: string;
  password: string;
  role: string;
};

// OOP: Encapsulation (dedicated validator class)
export class UserValidator {
  private isValidEmail(value: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((value ?? '').trim());
  }

  private isValidPassword(value: string): boolean {
    const v = value ?? '';
    return v.length >= 5 && v.length <= 8;
  }

  private getUsernameError(value: string): string {
    const v = (value ?? '').trim();
    if (!v) return 'Username is required.';
    return '';
  }

  private getEmailError(value: string): string {
    const v = (value ?? '').trim();
    if (!v) return 'Email is required.';
    if (!this.isValidEmail(v)) return 'Enter a valid email.';
    return '';
  }

  private getPasswordError(value: string): string {
    const v = value ?? '';
    if (!v) return 'Password is required.';
    if (!this.isValidPassword(v)) return 'Password must be 5-8 characters.';
    return '';
  }

  private getRoleError(value: string): string {
    if (value !== 'student' && value !== 'instructor') return 'Role is required.';
    return '';
  }

  public validate(input: UserInput): UserValidationErrors {
    return {
      email: this.getEmailError(input.email),
      username: this.getUsernameError(input.username),
      password: this.getPasswordError(input.password),
      role: this.getRoleError(input.role)
    };
  }
}

