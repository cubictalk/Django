import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import StudentManager from "./StudentManager";
import CourseManager from "./CourseManager";
import SubjectManager from "./SubjectManager";
import TeacherManager from "./TeacherManager";
import EnrollmentManager from "./EnrollmentManager";

function DashboardOwner() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("students");

  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("role");
    navigate("/login");
  };

  const renderTab = () => {
    switch (activeTab) {
      case "students":
        return <StudentManager />;
      case "teachers":
        return <TeacherManager />;
      case "subjects":
        return <SubjectManager />;
      case "courses":
        return <CourseManager />;
      case "enrollments":
        return <EnrollmentManager />;
      default:
        return <StudentManager />;
    }
  };

  return (
    <div style={{ maxWidth: "900px", margin: "auto", padding: "20px" }}>
      <h1>📊 Owner Dashboard</h1>

      {/* ✅ Updated Menu: Student / Teacher / Subject / Course */}
      <nav style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        {["students", "teachers", "subjects", "courses", "enrollments"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: "8px 16px",
              borderRadius: "8px",
              border: "none",
              background: activeTab === tab ? "#007bff" : "#ddd",
              color: activeTab === tab ? "#fff" : "#333",
              cursor: "pointer",
            }}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
        <button
          onClick={handleLogout}
          style={{
            marginLeft: "auto",
            background: "#e74c3c",
            color: "white",
            border: "none",
            borderRadius: "8px",
            padding: "8px 16px",
          }}
        >
          로그아웃
        </button>
      </nav>

      <div style={{ background: "#fafafa", padding: 20, borderRadius: 10 }}>
        {renderTab()}
      </div>
    </div>
  );
}

export default DashboardOwner;
