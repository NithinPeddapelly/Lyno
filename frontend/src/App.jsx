import "./App.css";
import { AuthProvider } from "./contexts/authContext";
import Authentication from "./pages/authentication";
import LandingPage from "./pages/landing";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import VideoMeetComponent from "./pages/videoMeet";
import HomeComponent from "./pages/home";
import History from "./pages/history";

function App() {
  return (
    <div className="App">
      <Router>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<Authentication />} />
            <Route path="/:url" element={<VideoMeetComponent />} />
            <Route path="/home" element={<HomeComponent />} />
            <Route path="/history" element={<History/>} />
          </Routes>
        </AuthProvider>
      </Router>
    </div>
  );
}

export default App;
