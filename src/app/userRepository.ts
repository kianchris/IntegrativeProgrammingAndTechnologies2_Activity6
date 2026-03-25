import { Injectable, InjectionToken } from '@angular/core';
import { usersModel } from './Models/usersModel';
import { User } from './Models/User';

// OOP: Abstraction (define repository contract)
export interface IUserRepository {
  getAll(): usersModel[];
  add(user: User): void;
  update(originalEmail: string, updatedUser: User): boolean;
  deleteByEmail(email: string): boolean;
  findByEmail(email: string): usersModel | undefined;
  emailExists(email: string): boolean;
}

// OOP: Dependency Inversion (service depends on abstraction)
export const USER_REPOSITORY = new InjectionToken<IUserRepository>('USER_REPOSITORY');

@Injectable()
export class InMemoryUserRepository implements IUserRepository {
  private readonly users: User[] = [];

  public getAll(): usersModel[] {
    return this.users.map(u => u.toModel());
  }

  public add(user: User): void {
    this.users.push(user);
  }

  public update(originalEmail: string, updatedUser: User): boolean {
    const idx = this.users.findIndex(u => u.getEmail() === originalEmail);
    if (idx < 0) return false;

    this.users[idx] = updatedUser;
    return true;
  }

  public deleteByEmail(email: string): boolean {
    const idx = this.users.findIndex(u => u.getEmail() === email);
    if (idx < 0) return false;

    this.users.splice(idx, 1);
    return true;
  }

  public findByEmail(email: string): usersModel | undefined {
    const user = this.users.find(u => u.getEmail() === email);
    return user?.toModel();
  }

  public emailExists(email: string): boolean {
    return this.users.some(u => u.getEmail() === email);
  }
}

