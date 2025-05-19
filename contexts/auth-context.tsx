"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import AuthService from "@/services/auth-service";
import type { LoginRequest, RegisterRequest, User, Role, DecodedJwtPayload } from "@/types/auth";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => void;
  hasRole: (roles: Role[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem("token");
        if (token) {
          try {
            const decodedToken = jwtDecode<DecodedJwtPayload>(token);
            if (decodedToken.exp * 1000 < Date.now()) {
              console.log("Token expired during initAuth.");
              localStorage.removeItem("token");
              localStorage.removeItem("user");
              setUser(null);
            } else {
              console.log("Token found and is valid, attempting to fetch user data with /me endpoint.");
              try {
                const userData = await AuthService.getMe();
                setUser(userData);
                localStorage.setItem("user", JSON.stringify(userData));
              } catch (error) {
                console.error("Failed to fetch user data with /me endpoint during initAuth:", error);
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                setUser(null);
              }
            }
          } catch (error) {
            console.error("Auth initialization error (invalid token format):", error);
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            setUser(null);
          }
        } else {
          setUser(null);
          localStorage.removeItem("user");
        }
      } catch (error) {
        console.error("An unexpected error occurred during auth initialization:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, [router]);

  const login = async (credentials: LoginRequest) => {
    setIsLoading(true);
    try {
      const response = await AuthService.login(credentials);
      localStorage.setItem("token", response.token);
      localStorage.setItem("user", JSON.stringify(response.user));
      setUser(response.user);
      router.push("/dashboard");
    } catch (error: any) {
      console.error("Login error in AuthContext:", error);
      if (error.response && error.response.data && error.response.data.message) {
        throw new Error(error.response.data.message);
      } else if (error.message) {
        throw new Error(error.message);
      } else {
        throw new Error("An unknown error occurred during login.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterRequest) => {
    setIsLoading(true);
    try {
      const response = await AuthService.register(userData);
      localStorage.setItem("token", response.token);
      localStorage.setItem("user", JSON.stringify(response.user));
      setUser(response.user);
      router.push("/dashboard");
    } catch (error: any) {
      console.error("Registration error in AuthContext:", error);
      if (error.response && error.response.data && error.response.data.message) {
        throw new Error(error.response.data.message);
      } else if (error.message) {
        throw new Error(error.message);
      } else {
        throw new Error("An unknown error occurred during registration.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    router.push("/");
  };

  const hasRole = (roles: Role[]) => {
    return user !== null && user.role !== null && roles.includes(user.role);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
