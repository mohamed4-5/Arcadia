import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Landing from "./pages/Landing";
import Games from "./pages/Games";
import XO from "./pages/games/XO";
import SUS from "./pages/games/SUS";
import Shooter from "./pages/games/Shooter";
import Piano from "./pages/games/Piano";
import WhackMonster from "./pages/games/WhackMonster";
import DodgeMonsters from "./pages/games/DodgeMonster";
import ShootBlocks from "./pages/games/AliensShooter";
import Jumper from "./pages/games/Jumper";
import HowToPlay from "./pages/HowToPlay";
import { useState } from "react";
// 👇👇 استدعاء ملف الاسبلاش سكرين (تأكد ان المسار صح)
import SplashScreen from "./pages/SplashScreen";


export default function App() {
  const location = useLocation();
  const [showSplash, setShowSplash] = useState(true);

  // 👇👇 الشرط ده بيقول: لو لسه في البداية، اعرض الاسبلاش بس
  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  // 👇👇 لما الاسبلاش يخلص (يتحول لـ false)، الموقع هيظهر عادي
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Landing />} />
        <Route path="games" element={<Games />} />
        <Route path="XO" element={<XO />} />
        <Route path="sus" element={<SUS />} />
        <Route path="shooter" element={<Shooter />} />
        <Route path="piano" element={<Piano />} />
        <Route path="whack monsters" element={<WhackMonster />} />
        <Route path="dodge monsters" element={<DodgeMonsters />} />
        <Route path="aliens shooter" element={<ShootBlocks />} />
        <Route path="the jumper" element={<Jumper />} />
        <Route path="how-to-play" element={<HowToPlay />} />
      </Routes>
    </AnimatePresence>
  );
}