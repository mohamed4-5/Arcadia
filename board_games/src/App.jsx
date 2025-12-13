import { Routes,Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Landing from "./pages/Landing";
import Games from "./pages/Games";
import XO from "./pages/games/XO";
import SUS from "./pages/games/SUS";
import Shooter from "./pages/games/shooter/Shooter";

export default function App() {
  const location = useLocation();
  return (
  <AnimatePresence mode="wait">
    <Routes location={location} key={location.pathname}>
      <Route path="/" element={<Landing/>}/>
      <Route path="games" element={<Games/>}/>
      <Route path="XO" element={<XO/>}/>
      <Route path="sus" element={<SUS/>}/>
      <Route path="shooter" element={<Shooter/>}/>
    </Routes>
  </AnimatePresence>

  );
}