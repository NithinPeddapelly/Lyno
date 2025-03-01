import "./App.css";
import { AuthProvider } from "./contexts/authContext";
import Authentication from "./pages/authentication";
import LandingPage from "./pages/landing";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

function App() {
  return (
    <div className = "App"> 

    <Router>

      <AuthProvider>
        
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<Authentication />} /> 
      </Routes>

      </AuthProvider>
      
    </Router>

    </div>
    
  );
}

export default App;
