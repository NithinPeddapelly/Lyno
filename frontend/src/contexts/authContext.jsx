import { createContext, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// Create a context to store authentication-related data and functions
export const AuthContext = createContext({});

// Configure Axios with the base URL for API requests
const client = axios.create({
  baseURL: "http://localhost:8000/api/v1/users",
});

export const AuthProvider = ({ children }) => {
  // State to store user data after authentication
  const [userData, setUserData] = useState(null);

  // Hook for programmatic navigation
  const router = useNavigate();

  // Function to handle user registration
  const handleRegister = async (name, username, password) => {
    try {
      const response = await client.post("/register", {
        name,
        username,
        password,
      });

      // Check if registration was successful
      if (response.status === 201) {
        console.log("User Registered:", request.data.message);
        return response.data.message; // Return success message
      }
    } catch (err) {
      console.error("Registration Error:", err);
      throw err;
    }
  };

  // Function to handle user login
  const handleLogin = async (username, password) => {
    try {
      const response = await client.post("/login", {
        username,
        password,
      });

      // Check if login was successful
      if (response.status === 200) {
        localStorage.setItem("token", response.data.token); // Store authentication token
        setUserData(response.data.user); // Save user data in state
        router("/dashboard"); // Redirect user to dashboard after login
      }
    } catch (err) {
      console.error("Login Error:", err);
      throw err;
    }
  };

  // Provide authentication-related data and functions to child components
  const data = {
    userData,
    setUserData,
    handleRegister,
    handleLogin,
  };

  return <AuthContext.Provider value={data}>{children}</AuthContext.Provider>;
};
