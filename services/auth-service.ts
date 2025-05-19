import axiosInstance from "@/lib/authApi";
import type { AuthResponse, LoginRequest, RegisterRequest, User, UserUpdateRequest } from "@/types/auth";

const AuthService = {
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const response = await axiosInstance.post<AuthResponse>("/api/auth/login", credentials);
    return response.data;
  },

  register: async (userData: RegisterRequest): Promise<AuthResponse> => {
    const response = await axiosInstance.post<AuthResponse>("/api/auth/register", userData);
    return response.data;
  },

  getMe: async (): Promise<User> => {
    const response = await axiosInstance.get<User>("/api/users/me");
    return response.data;
  },

  getCurrentUserById: async (id: string): Promise<User> => {
    const response = await axiosInstance.get<User>(`/api/users/${id}`);
    return response.data;
  },

  updateUser: async (id: string, data: UserUpdateRequest): Promise<User> => {
    const response = await axiosInstance.put<User>(`/api/users/${id}`, data);
    return response.data;
  },

  getAllUsers: async (): Promise<User[]> => {
    const response = await axiosInstance.get<User[]>("/api/users");
    return response.data;
  },

  deleteUser: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/api/users/${id}`);
  },

  createAdminOrOrganizer: async (userData: RegisterRequest): Promise<User> => {
    const response = await axiosInstance.post<User>("/api/admin/create-account", userData);
    return response.data;
  },
};

export default AuthService;
