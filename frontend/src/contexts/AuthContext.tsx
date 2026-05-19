import axios from "axios";
import httpStatus from "http-status";
import { createContext, useState, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import server from "../environment";
import { AuthContextType, Meeting, User } from "../types";

export const AuthContext = createContext<AuthContextType>({} as AuthContextType);

const client = axios.create({
  baseURL: `${server}/api/v1/users`,
});

// Attach JWT to every request if present
client.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [userData, setUserData] = useState<User | null>(null);
  const navigate = useNavigate();

  const handleRegister = async (name: string, username: string, password: string): Promise<string> => {
    const response = await client.post("/register", { name, username, password });
    if (response.status === httpStatus.CREATED) {
      return response.data.message as string;
    }
    throw new Error(response.data.message);
  };

  const handleLogin = async (username: string, password: string): Promise<void> => {
    const response = await client.post("/login", { username, password });
    if (response.status === httpStatus.OK) {
      const { token, name, username: uname } = response.data as { token: string; name: string; username: string };
      localStorage.setItem("token", token);
      setUserData({ id: "", name, username: uname });
      navigate("/home");
    }
  };

  const getHistoryOfUser = async (): Promise<Meeting[]> => {
    const response = await client.get("/get_all_activity");
    return response.data as Meeting[];
  };

  const addToUserHistory = async (meetingCode: string): Promise<void> => {
    await client.post("/add_to_activity", { meeting_code: meetingCode });
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUserData(null);
    navigate("/auth");
  };

  return (
    <AuthContext.Provider value={{ userData, setUserData, handleRegister, handleLogin, getHistoryOfUser, addToUserHistory, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
