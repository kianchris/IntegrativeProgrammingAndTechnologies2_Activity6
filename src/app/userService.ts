import { Inject, Injectable } from '@angular/core';
import { usersModel } from './Models/usersModel';
import { IUserRepository, USER_REPOSITORY } from './userRepository';
import { UserFactory, UserInput } from './Models/User';
import { UserValidationErrors, UserValidator } from './userValidator';

type ServiceErrorResult = {
  ok: false;
  errors: UserValidationErrors;
  message: string;
};

type ServiceSuccessResult = {
  ok: true;
  message: string;
};

export type RegisterResult = ServiceErrorResult | ServiceSuccessResult;

// OOP: Composition + SOLID
// - SRP: validator handles rules, repository handles storage, service orchestrates use-cases
// - DIP: service depends on IUserRepository abstraction (injected via USER_REPOSITORY token)
@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly validator: UserValidator;

  constructor(
    @Inject(USER_REPOSITORY) private readonly repo: IUserRepository
  ) {
    this.validator = new UserValidator();
  }

  public getAllUsers(): usersModel[] {
    return this.repo.getAll();
  }

  public findUserByEmail(email: string): usersModel | undefined {
    return this.repo.findByEmail(email);
  }

  public searchUsers(query: string): usersModel[] {
    const q = (query ?? '').trim();
    const allModels = this.repo.getAll();

    if (!q) return allModels;

    // OOP: Polymorphism (User.matches() behavior differs by role)
    return allModels
      .map(model => UserFactory.fromModel(model))
      .filter(u => u.matches(q))
      .map(u => u.toModel());
  }

  public registerUser(input: UserInput): RegisterResult {
    const errors = this.validator.validate(input);
    if (errors.email || errors.username || errors.password || errors.role) {
      return { ok: false, errors, message: 'Please fix the validation errors.' };
    }

    if (this.repo.emailExists(input.email)) {
      return {
        ok: false,
        errors: { ...errors, email: 'This email is already registered.' },
        message: 'Email already exists.'
      };
    }

    const user = UserFactory.create(input);
    this.repo.add(user);
    return { ok: true, message: 'Registration successful' };
  }

  public updateUser(originalEmail: string, input: UserInput): RegisterResult {
    const errors = this.validator.validate(input);
    if (errors.email || errors.username || errors.password || errors.role) {
      return { ok: false, errors, message: 'Please fix the validation errors.' };
    }

    const existing = this.repo.findByEmail(originalEmail);
    if (!existing) {
      return {
        ok: false,
        errors: { ...errors, email: '' },
        message: 'User not found.'
      };
    }

    const emailChanged = input.email !== originalEmail;
    if (emailChanged && this.repo.emailExists(input.email)) {
      return {
        ok: false,
        errors: { ...errors, email: 'This email is already registered.' },
        message: 'Email already exists.'
      };
    }

    const updatedUser = UserFactory.create(input);
    const updated = this.repo.update(originalEmail, updatedUser);
    if (!updated) {
      return {
        ok: false,
        errors: { ...errors, email: '' },
        message: 'Update failed.'
      };
    }

    return { ok: true, message: 'Update successful' };
  }

  public deleteUser(email: string): { ok: boolean; message: string } {
    const deleted = this.repo.deleteByEmail(email);
    return deleted ? { ok: true, message: 'User deleted.' } : { ok: false, message: 'User not found.' };
  }
}

