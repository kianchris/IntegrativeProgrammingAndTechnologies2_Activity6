import { usersModel } from './usersModel';

// --- Domain Model (OOP: Abstraction + Encapsulation + Inheritance/Polymorphism)
export type UserRole = usersModel['role'];

export type UserInput = {
  username: string;
  email: string;
  password: string;
  role: UserRole;
};

export abstract class User {
  protected constructor(
    protected username: string,
    protected email: string,
    protected password: string,
    protected role: UserRole
  ) {}

  public getUsername(): string {
    return this.username;
  }

  public getEmail(): string {
    return this.email;
  }

  public getPassword(): string {
    return this.password;
  }

  public getRole(): UserRole {
    return this.role;
  }

  // OOP: Polymorphism (subclasses provide role-specific behavior)
  public abstract getRoleLabel(): string;

  // OOP: Encapsulation (model knows how to match itself for search)
  public matches(query: string): boolean {
    const q = (query ?? '').trim().toLowerCase();
    if (!q) return true;

    return (
      this.username.toLowerCase().includes(q) ||
      this.email.toLowerCase().includes(q) ||
      this.getRoleLabel().toLowerCase().includes(q) ||
      this.role.toLowerCase().includes(q)
    );
  }

  public toModel(): usersModel {
    return {
      username: this.username,
      email: this.email,
      password: this.password,
      role: this.role
    };
  }
}

export class StudentUser extends User {
  public constructor(username: string, email: string, password: string, role: UserRole) {
    // Role is fixed for StudentUser; keep param only to satisfy factory typing.
    super(username, email, password, role);
  }

  public getRoleLabel(): string {
    return 'Student';
  }
}

export class InstructorUser extends User {
  public constructor(username: string, email: string, password: string, role: UserRole) {
    // Role is fixed for InstructorUser; keep param only to satisfy factory typing.
    super(username, email, password, role);
  }

  public getRoleLabel(): string {
    return 'Instructor';
  }
}

// OOP: Abstraction (factory creates the right subclass)
export class UserFactory {
  public static create(input: UserInput): User {
    const { username, email, password, role } = input;

    if (role === 'student') {
      return new StudentUser(username, email, password, role);
    }

    return new InstructorUser(username, email, password, role);
  }

  public static fromModel(model: usersModel): User {
    return UserFactory.create(model);
  }
}

