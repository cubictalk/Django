import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import LoginForm from "./components/LoginForm";
//import DashboardOwner from "./pages/DashboardOwner"; 
import DashboardOwner from "./pages/DashboardOwner/DashboardOwner";
import DashboardTeacher from "./pages/DashboardTeacher";
import DashboardStudent from "./pages/DashboardStudent";
import DashboardParent from "./pages/DashboardParent";

function App() {
  const [role, setRole] = useState(localStorage.getItem("role") || null);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginForm onLogin={setRole} />} />

        <Route
          path="/owner/dashboard"
          element={role === "owner" ? <DashboardOwner /> : <Navigate to="/login" />}
        />
        <Route
          path="/teacher/dashboard"
          element={role === "teacher" ? <DashboardTeacher /> : <Navigate to="/login" />}
        />
        <Route
          path="/student/dashboard"
          element={role === "student" ? <DashboardStudent /> : <Navigate to="/login" />}
        />
        <Route
          path="/parent/dashboard"
          element={role === "parent" ? <DashboardParent /> : <Navigate to="/login" />}
        />

        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
