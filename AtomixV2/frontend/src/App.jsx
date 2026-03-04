import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

import { GameProvider } from "./GameContext";
import { StartScreen } from "./pages/StartScreen";
import { GameScreen } from "./pages/GameScreen";
import { ElementDetailsPage } from "./pages/ElementDetailsPage";

export default function App() {
  return (
    <GameProvider>
      <BrowserRouter>
        <AnimatedRoutes />
      </BrowserRouter>
    </GameProvider>
  );
}

// We extract this to a separate component so animations work correctly
function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>

        {/* 1. START SCREEN (Home) */}
        <Route path="/" element={<StartScreen />} />

        {/* 2. GAME SCREEN (This is the route you were missing!) */}
        <Route path="/game" element={<GameScreen />} />

        {/* 3. DETAILS PAGE */}
        <Route path="/element/:name" element={<ElementDetailsPage />} />

      </Routes>
    </AnimatePresence>
  );
}