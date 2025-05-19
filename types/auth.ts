export enum Role {
  ADMIN = "ADMIN",
  ORGANIZER = "ORGANIZER",
  USER = "USER",
}

export interface User {
  id: string;
  username: string;
  email: string;
  phoneNumber: string;
  role: Role;
  balance: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  phoneNumber: string;
  password: string;
  role?: Role;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface UserUpdateRequest {
  username?: string;
  email?: string;
  phoneNumber?: string;
}

export interface JwtPayload {
  sub: string;
  exp: number;
  role?: Role;
  iat?: number;
}

export interface DecodedJwtPayload {
  sub: string;
  exp: number;
  iat?: number;
}
