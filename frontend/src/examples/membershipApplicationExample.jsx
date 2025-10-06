/**
 * @fileoverview Ejemplo de uso del componente MembershipApplicationPage
 * @version 1.0.0
 * @author EXACTUM-dev
 */
import React from "react";
import MembershipApplicationPage from "./pages/membershipApplication";

// Ejemplo de cómo usar el componente en una aplicación
export default function App() {
  return (
    <div className="App">
      <MembershipApplicationPage />
    </div>
  );
}

// Para usar en el router de React Router:
/*
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MembershipApplicationPage from './pages/membershipApplication';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/solicitud-membresia" element={<MembershipApplicationPage />} />
      </Routes>
    </Router>
  );
}
*/
