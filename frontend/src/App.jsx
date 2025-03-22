import "./App.css";
import { createTheme } from "@mui/material/styles";
import LandingPage from "./pages/landing.jsx";
import Authentication from "./pages/authentication.jsx";
import { AuthProvider } from "./contexts/AuthContext.jsx";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import VideoMeetComponent from "./pages/VideoMeet.jsx";
import HomeComponent from "./pages/home.jsx";
import History from "./pages/history.jsx";


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
