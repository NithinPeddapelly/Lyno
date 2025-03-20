import "./App.css";
import { createTheme } from "@mui/material/styles";
import LandingPage from "./pages/landing";
import Authentication from "./pages/authentication";
import { AuthProvider } from "./contexts/AuthContext";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import VideoMeetComponent from "./pages/VideoMeet.jsx";
import HomeComponent from "./pages/home";
import History from "./pages/history";


const theme = createTheme({
  palette: {
    primary: {
      main: "#574bff", 
    },
    secondary: {
      main: "#000000",
    },
  },
});

function App() {
  return (
    <div className="App">
      <Router>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<Authentication />} />
            <Route path="/home" s element={<HomeComponent />} />
            <Route path="/history" element={<History />} />
            <Route path="/:url" element={<VideoMeetComponent />} />
          </Routes>
        </AuthProvider>
      </Router>
    </div>
  );
}

export default App;
