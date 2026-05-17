import React, { createContext, useContext, useEffect, useReducer, ReactNode } from "react";
import axios from "axios";

// ---------- Types ----------
export type UserRole = "admin" | "teacher" | "student" | "parent";

export interface User {
  id: string;
  _id?: string;
  name?: string;
  username?: string;
  email: string;
  role: UserRole;
  avatar?: string;
  department?: string;
  phone?: string;
  address?: string;
}

export interface Notification {
  id: string;
  message: string;
  time: string;
  read: boolean;
  type: "info" | "warning" | "success";
}

export interface Message {
  id: string;
  from: string;
  fromRole: string;
  to: string;
  subject: string;
  body: string;
  time: string;
  read: boolean;
  type: "inbox" | "sent";
}

interface AuthState {
  isAuthenticated: boolean;
  isInitialised: boolean;
  user: User | null;
}

interface AuthContextType extends AuthState {
  login: (identifier: string, password: string) => Promise<any>;
  logout: () => void;
  register: (userData: any) => Promise<void>;
  notifications: Notification[];
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;
  messages: Message[];
  sendMessage: (to: string, subject: string, body: string) => void;
  markMessageRead: (id: string) => void;
}

// ---------- Helpers ----------
const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

const isValidToken = (jwtToken: string | null): boolean => {
  if (!jwtToken) return false;
  if (jwtToken === "mock-jwt-token") return true;
  try {
    const payload = JSON.parse(atob(jwtToken.split(".")[1]));
    return payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
};

const setSession = (jwtToken: string | null) => {
  if (jwtToken) {
    localStorage.setItem("jwtToken", jwtToken);
    axios.defaults.headers.common.Authorization = `Bearer ${jwtToken}`;
  } else {
    localStorage.removeItem("jwtToken");
    delete axios.defaults.headers.common.Authorization;
  }
};

// ---------- Reducer ----------
type AuthAction =
  | { type: "INIT"; payload: { isAuthenticated: boolean; user: User | null } }
  | { type: "LOGIN"; payload: { user: User } }
  | { type: "LOGOUT" }
  | { type: "REGISTER"; payload: { user: User } };

const initialState: AuthState = {
  isAuthenticated: false,
  isInitialised: false,
  user: null,
};

const reducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case "INIT":
      return { ...state, isAuthenticated: action.payload.isAuthenticated, isInitialised: true, user: action.payload.user };
    case "LOGIN":
      return { ...state, isAuthenticated: true, user: action.payload.user };
    case "LOGOUT":
      return { ...state, isAuthenticated: false, user: null };
    case "REGISTER":
      return { ...state, isAuthenticated: true, user: action.payload.user };
    default:
      return state;
  }
};

// ---------- Default data ----------
const defaultNotifications: Notification[] = [];

const defaultMessages: Message[] = [];

// ---------- Context ----------
const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [notifications, setNotifications] = React.useState<Notification[]>(defaultNotifications);
  const [messages, setMessages] = React.useState<Message[]>(defaultMessages);

  // Initialize auth from localStorage on mount
  useEffect(() => {
    const initAuth = () => {
      const jwtToken = localStorage.getItem("jwtToken");
      const storedUser = localStorage.getItem("user");

      if (jwtToken && isValidToken(jwtToken) && storedUser) {
        setSession(jwtToken);
        try {
          const user = JSON.parse(storedUser);
          dispatch({ type: "INIT", payload: { isAuthenticated: true, user } });
        } catch {
          dispatch({ type: "INIT", payload: { isAuthenticated: false, user: null } });
        }
      } else {
        setSession(null);
        dispatch({ type: "INIT", payload: { isAuthenticated: false, user: null } });
      }
    };
    initAuth();
  }, []);

  const login = async (identifier: string, password: string) => {
    // Mock Login Fallback for testing
    if (identifier.includes("mock") || (identifier === "admin@example.com" && password === "admin123")) {
      let mockUser: User;
      if (identifier === "admin@example.com" || identifier.includes("admin")) {
        mockUser = {
          id: "mock-admin-id",
          _id: "mock-admin-id",
          username: "Admin (Mock)",
          name: "Mock Administrator",
          email: identifier,
          role: "admin",
        };
      } else if (identifier.includes("teacher")) {
        mockUser = {
          id: "mock-teacher-id",
          _id: "mock-teacher-id",
          username: "Teacher (Mock)",
          name: "Mock Teacher",
          email: identifier,
          role: "teacher",
        };
      } else {
        mockUser = {
          id: "mock-student-id",
          _id: "mock-student-id",
          username: "Student (Mock)",
          name: "Mock Student",
          email: identifier,
          role: "student",
        };
      }
      
      setSession("mock-jwt-token");
      localStorage.setItem("user", JSON.stringify(mockUser));
      localStorage.setItem("userCred", JSON.stringify(mockUser));
      localStorage.setItem("sessionId", "mock-session-id");
      dispatch({ type: "LOGIN", payload: { user: mockUser } });
      return { status: 200, data: { user: mockUser, token: "mock-jwt-token" } };
    }

    try {
      let response;

      try {
        response = await axios.post(`${apiUrl}/api/login`, { identifier, password });
      } catch (error: any) {
        const status = error?.response?.status;
        if (status !== 401 && status !== 500) throw error;

        response = await axios.post(`${apiUrl}/api/ad/login`, {
          email: identifier,
          identifier,
          password,
        });
      }

      const { token, user, session } = response.data;
      setSession(token);
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("userCred", JSON.stringify(user));
      if (session?._id) localStorage.setItem("sessionId", session._id);
      dispatch({ type: "LOGIN", payload: { user } });
      return response;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const register = async (userData: any) => {
    try {
      const response = await axios.post(`${apiUrl}/api/register`, userData);
      if (response.status === 201 || response.status === 200) {
        const { token, user } = response.data;
        if (token) {
          setSession(token);
          localStorage.setItem("user", JSON.stringify(user));
          dispatch({ type: "REGISTER", payload: { user } });
        }
      }
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  };

  const logout = () => {
    setSession(null);
    localStorage.removeItem("jwtToken");
    localStorage.removeItem("user");
    localStorage.removeItem("userCred");
    dispatch({ type: "LOGOUT" });
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const clearNotifications = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const sendMessage = (to: string, subject: string, body: string) => {
    const newMsg: Message = {
      id: `MSG${Date.now()}`,
      from: state.user?.username || state.user?.name || "Unknown",
      fromRole: state.user?.role || "",
      to,
      subject,
      body,
      time: new Date().toISOString().slice(0, 16).replace("T", " "),
      read: true,
      type: "sent",
    };
    setMessages((prev) => [newMsg, ...prev]);
  };

  const markMessageRead = (id: string) => {
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, read: true } : m)));
  };

  // Show loading while initialising
  if (!state.isInitialised) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        logout,
        register,
        notifications,
        markNotificationRead,
        clearNotifications,
        messages,
        sendMessage,
        markMessageRead,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// ---------- Exports for sidebar / role access ----------
export const roleLabels: Record<string, string> = {
  admin: "Admin",
  teacher: "Teacher",
  student: "Student",
  parent: "Parent",
};

export const roleAccess: Record<string, string[]> = {
  admin: [
    "dashboard", "admin", "inbox", "teacher-dashboard", "student-dashboard",
    "admit-student", "student-info", "student-promotion",
    "psycho-category", "psycho-report",
    "teacher", "subject", "notice", "parents",
    "class", "exam-list", "manage-marks", "exam-grades", "tabulation", "onscreen-marking",
    "onlinexam", "curriculum", "gen-questions", "bulk-student-upload",
    "studentAccounting", "studymaterial", "dailyattend", "settings",
  ],
  teacher: [
    "dashboard", "teacher-dashboard", "inbox",
    "teacher-subjects", "teacher-grades", "teacher-student-info",
    "manage-marks", "tabulation", "onscreen-marking", "onlinexam",
    "studymaterial", "dailyattend", "notice", "psycho-report",
  ],
  student: [
    "dashboard", "student-dashboard", "inbox",
    "student-results", "studymaterial", "notice", "onlinexam", "homework",
    "exam-list", "studentAccounting",
  ],
  parent: ["dashboard", "inbox", "notice", "parent-results", "parent-materials", "parent-homework"],
};

export default AuthContext;
