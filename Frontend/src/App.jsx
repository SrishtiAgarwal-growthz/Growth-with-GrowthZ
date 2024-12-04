import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";  // Changed from "./pages/HomePage"
import LoginPage from "./pages/LoginPage"; 
import Genius from "./pages/Genius"; 

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/genius" element={<Genius />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;