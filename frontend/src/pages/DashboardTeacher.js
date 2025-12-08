import React, { useEffect, useState } from "react";
import axios from "axios";

function DashboardTeacher() {
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);

  useEffect(() => {
    fetchMyCourses();
  }, []);

  const fetchMyCourses = async () => {
    try {
      const res = await axios.get("/api/courses/my_courses/", {
        headers: { Authorization: `Bearer ${localStorage.getItem("access")}` },
      });
      setCourses(res.data || []);
    } catch (err) {
      console.error("Failed to load teacher courses:", err);
    }
  };

  const fetchStudents = async (courseId) => {
    try {
      const res = await axios.get(
        `/api/enrollments/students_by_course/?course_id=${courseId}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("access")}` },
        }
      );
      setStudents(res.data);
      setSelectedCourse(courseId);
    } catch (err) {
      console.error("Failed to load students:", err);
    }
  };

  const handleLogout = () => {
    // ⭐ NEW: Clear tokens & logout
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    window.location.href = "/login"; // redirect
  };

  return (
    <section>

      {/* ⭐ NEW: Header bar with logout aligned to right */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between", // right-align logout
          alignItems: "center",
          marginBottom: 20,
          padding: "10px 0",
        }}
      >
        <h2>👩‍🏫 Teacher Dashboard</h2>

        <button
          onClick={handleLogout}
          style={{
            padding: "6px 12px",
            background: "#e63946",
            color: "#fff",
            border: "none",
            borderRadius: 4,
            cursor: "pointer",
          }}
        >
          Logout
        </button>
      </div>

      <h3>My Courses</h3>

      {courses.length === 0 ? (
        <p>No assigned courses.</p>
      ) : (
        courses.map((course) => (
          <div
            key={course.id}
            style={{ border: "1px solid #ccc", padding: 10, marginBottom: 10 }}
          >
            <strong>{course.name}</strong>
            <br />
            <button onClick={() => fetchStudents(course.id)}>View Students</button>
          </div>
        ))
      )}

      {selectedCourse && (
        <>
          <h3>Students Enrolled</h3>
          {students.length === 0 ? (
            <p>No students enrolled.</p>
          ) : (
            <ul>
              {students.map((st) => (
                <li key={st.student_id}>
                  {st.full_name} ({st.email})
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </section>
  );
}

export default DashboardTeacher;
