import React from "react";
import { Routes, Route, Link } from "react-router-dom";
import Home from "./components/Home.js";
import Map from "./components/WildFireMap.js";
import "./components/FireForesight.css";
export default function App() {
  return (
    <div className="app-container">
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/map" element={<Map />} />
        </Routes>
      </main>
    </div>
  );
}
