import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { usersModel } from './Models/usersModel';
import { UserService } from './userService';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App {

  protected readonly title = signal('login');

  constructor(private readonly userService: UserService) {
    this.refreshUsers();
    this.applySearch();
  }

  // Template switch
  public isLogin: boolean = true;

  // Template-bound input values (because the template uses [value] + (input))
  public email: string = '';
  public password: string = '';
  public regEmail: string = '';
  public usernameReg: string = '';
  public regPassword: string = '';

  public role: usersModel['role'] = 'student';

  // Feedback + view state
  public message: string = '';
  public newuserList: usersModel[] = [];
  public filteredUserList: usersModel[] = [];
  // Used to show status message only (table is always visible in Register view)
  public hasValidated: boolean = false;

  public loginAttempted: boolean = false;
  public registerAttempted: boolean = false;

  // Registration CRUD UI state
  public searchQuery: string = '';
  public isEditing: boolean = false;
  public editingEmail: string = '';

  public loginErrors: { email: string; password: string } = { email: '', password: '' };
  public registerErrors: { email: string; username: string; password: string; role: string } = {
    email: '',
    username: '',
    password: '',
    role: ''
  };

  // Basic validation helpers (matches your original form constraints)
  private isValidEmail(value: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
  }

  private isValidPassword(value: string): boolean {
    const v = value ?? '';
    return v.length >= 5 && v.length <= 8;
  }

  private getEmailError(value: string): string {
    const v = value?.trim() ?? '';
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

  private getUsernameError(value: string): string {
    const v = value?.trim() ?? '';
    if (!v) return 'Username is required.';
    return '';
  }

  private getRoleError(value: string): string {
    if (value !== 'student' && value !== 'instructor') return 'Role is required.';
    return '';
  }

  switchForm(){
    this.isLogin = !this.isLogin;
    this.message = '';

    // Reset UI-bound values + reactive forms
    this.email = '';
    this.password = '';
    this.regEmail = '';
    this.usernameReg = '';
    this.regPassword = '';
    this.role = 'student';

    this.isEditing = false;
    this.editingEmail = '';

    // Reset validation state
    this.loginAttempted = false;
    this.registerAttempted = false;
    this.loginErrors = { email: '', password: '' };
    this.registerErrors = { email: '', username: '', password: '', role: '' };
  }

  // Login input handlers
  onEmailChange(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.email = value;
    if (this.loginAttempted) {
      this.loginErrors.email = this.getEmailError(this.email);
    }
  }

  onPasswordChange(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.password = value;
    if (this.loginAttempted) {
      this.loginErrors.password = this.getPasswordError(this.password);
    }
  }

  // Register input handlers
  onRegEmailChange(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.regEmail = value;
    if (this.registerAttempted) {
      this.registerErrors.email = this.getEmailError(this.regEmail);
    }
  }

  onUsernameRegChange(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.usernameReg = value;
    if (this.registerAttempted) {
      this.registerErrors.username = this.getUsernameError(this.usernameReg);
    }
  }

  onRegPasswordChange(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.regPassword = value;
    if (this.registerAttempted) {
      this.registerErrors.password = this.getPasswordError(this.regPassword);
    }
  }

  onRoleChange(event: Event) {
    const value = (event.target as HTMLSelectElement).value as usersModel['role'];
    this.role = value;
    if (this.registerAttempted) {
      this.registerErrors.role = this.getRoleError(this.role);
    }
  }

  public onSearchChange(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.searchQuery = value;
    this.applySearch();
  }

  public startEdit(user: usersModel) {
    this.isEditing = true;
    this.editingEmail = user.email;

    this.regEmail = user.email;
    this.usernameReg = user.username;
    this.regPassword = user.password;
    this.role = user.role;

    this.message = '';
    this.registerAttempted = false;
    this.registerErrors = { email: '', username: '', password: '', role: '' };
  }

  public cancelEdit() {
    this.isEditing = false;
    this.editingEmail = '';

    this.regEmail = '';
    this.usernameReg = '';
    this.regPassword = '';
    this.role = 'student';

    this.registerAttempted = false;
    this.registerErrors = { email: '', username: '', password: '', role: '' };
    this.message = '';
  }

  public deleteUser(email: string) {
    const result = this.userService.deleteUser(email);
    this.message = result.message;

    if (result.ok) {
      if (this.isEditing && this.editingEmail === email) this.cancelEdit();
      this.refreshUsers();
      this.applySearch();
      this.hasValidated = true;
    }
  }

  // Keeping the old template method name as a wrapper for safety.
  public register() {
    this.submit();
  }

  public submit() {
    this.registerAttempted = true;
    this.registerErrors = { email: '', username: '', password: '', role: '' };
    this.message = '';

    const input = {
      username: this.usernameReg.trim(),
      email: this.regEmail.trim(),
      password: this.regPassword,
      role: this.role
    };

    const result = this.isEditing
      ? this.userService.updateUser(this.editingEmail, input)
      : this.userService.registerUser(input);

    if (!result.ok) {
      this.registerErrors = result.errors;
      this.message = result.message;
      return;
    }

    this.message = result.message;
    this.hasValidated = true;

    // Clear form after successful add/update
    this.isEditing = false;
    this.editingEmail = '';

    this.regEmail = '';
    this.usernameReg = '';
    this.regPassword = '';
    this.role = 'student';

    this.registerAttempted = false;
    this.registerErrors = { email: '', username: '', password: '', role: '' };

    this.refreshUsers();
    this.applySearch();
  }

  Validate(){
    this.loginAttempted = true;
    this.loginErrors = { email: '', password: '' };
    this.message = '';

    const email = this.email.trim();
    const password = this.password;

    this.loginErrors.email = this.getEmailError(email);
    this.loginErrors.password = this.getPasswordError(password);

    if (this.loginErrors.email || this.loginErrors.password) {
      return;
    }

    const user = this.newuserList.find(u => u.email === email && u.password === password);

    if(!user) {
      this.message = "Invalid credentials";
      return;
    }

    this.message = user.role === 'student' ? 'Logged in as Student' : 'Logged in as Instructor';
  }

  private refreshUsers() {
    this.newuserList = this.userService.getAllUsers();
    this.hasValidated = this.newuserList.length > 0;
  }

  private applySearch() {
    this.filteredUserList = this.userService.searchUsers(this.searchQuery);
  }

}