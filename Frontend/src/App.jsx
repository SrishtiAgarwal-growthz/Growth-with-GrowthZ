import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";  // Changed from "./pages/HomePage"
import LoginPage from "./pages/LoginPage"; 
import Genius from "./pages/Genius"; 
import Rainbow from "./pages/Rainbow"; 
import Privacy from "./pages/PrivacyPolicy"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/genius" element={<Genius />} />
        <Route path="/rainbow" element={<Rainbow key={window.location.pathname} />} /> {/* Add key */}
        <Route path="/privacy_policy" element={<Privacy />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;