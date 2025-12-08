// src/pages/EnrollmentManager.js
// FINAL VERSION — 2025-11-28
// Changes:
// 1️⃣ Student dropdown fixed to use s.user.full_name
// 2️⃣ POST/PATCH payload keys corrected to match serializer (student_id / course_id)

import React, { useEffect, useState } from "react";
import axios from "axios";

function EnrollmentManager() {
  const [enrollments, setEnrollments] = useState([]);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);

  const [editId, setEditId] = useState(null);

  const [form, setForm] = useState({
    student: "",
    course: "",
  });

  // -------------------------
  // Fetch helpers
  // -------------------------
  const fetchEnrollments = async () => {
    try {
      const res = await axios.get("/api/enrollments/", {
        headers: { Authorization: `Bearer ${localStorage.getItem("access")}` },
      });
      setEnrollments(res.data || []);
    } catch (error) {
      console.error("❌ Failed to fetch enrollments:", error);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await axios.get("/api/students/", {
        headers: { Authorization: `Bearer ${localStorage.getItem("access")}` },
      });
      setStudents(res.data || []);
    } catch (error) {
      console.error("❌ Failed to fetch students:", error);
    }
  };

  const fetchCourses = async () => {
    try {
      const res = await axios.get("/api/courses/", {
        headers: { Authorization: `Bearer ${localStorage.getItem("access")}` },
      });
      setCourses(res.data || []);
    } catch (error) {
      console.error("❌ Failed to fetch courses:", error);
    }
  };

  useEffect(() => {
    fetchEnrollments();
    fetchStudents();
    fetchCourses();
  }, []);

  // -------------------------
  // Resolve names
  // -------------------------
  const resolveStudentName = (enr) => {
    const s = enr.student;
    if (!s) return "Unknown";

    if (typeof s === "object") {
      return s.user?.full_name || s.user?.email || `Student#${s.id}`;
    }
    const found = students.find((st) => Number(st.id) === Number(s));
    return found ? (found.user?.full_name || found.user?.email) : `Student#${s}`;
  };

  const resolveCourseName = (enr) => {
    const c = enr.course;
    if (!c) return "Unknown";

    if (typeof c === "object") return c.name || `Course#${c.id}`;

    const found = courses.find((co) => Number(co.id) === Number(c));
    return found ? found.name : `Course#${c}`;
  };

  // -------------------------
  // Form events
  // -------------------------
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // -------------------------
  // CREATE
  // -------------------------
  const handleCreate = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        // 🔹 Changed keys to match backend serializer
        student_id: Number(form.student),
        course_id: Number(form.course),
      };

      await axios.post("/api/enrollments/", payload, {
        headers: { Authorization: `Bearer ${localStorage.getItem("access")}` },
      });

      alert("✅ Enrollment created!");
      setForm({ student: "", course: "" });
      fetchEnrollments();
    } catch (error) {
      console.error("❌ Enrollment creation failed:", error.response || error);
      alert("Failed. See console.");
    }
  };

  // -------------------------
  // DELETE
  // -------------------------
  const handleDelete = async (id) => {
    if (!window.confirm("정말 이 수강 등록을 삭제하시겠습니까?")) return;

    try {
      await axios.delete(`/api/enrollments/${id}/`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("access")}` },
      });
      fetchEnrollments();
    } catch (error) {
      console.error("❌ Enrollment delete failed:", error);
    }
  };

  // -------------------------
  // EDIT
  // -------------------------
  const startEdit = (enr) => {
    setEditId(enr.id);
    setForm({
      student: enr.student?.id ? String(enr.student.id) : String(enr.student),
      course: enr.course?.id ? String(enr.course.id) : String(enr.course),
    });
  };

  const cancelEdit = () => {
    setEditId(null);
    setForm({ student: "", course: "" });
  };

  // -------------------------
  // UPDATE
  // -------------------------
  const handleUpdate = async (id) => {
    try {
      const payload = {
        // 🔹 Changed keys to match backend serializer
        student_id: Number(form.student),
        course_id: Number(form.course),
      };

      await axios.patch(`/api/enrollments/${id}/`, payload, {
        headers: { Authorization: `Bearer ${localStorage.getItem("access")}` },
      });

      alert("✅ Enrollment updated!");
      setEditId(null);
      fetchEnrollments();
    } catch (error) {
      console.error("❌ Enrollment update failed:", error.response || error);
      alert("Update failed. See console.");
    }
  };

  // -------------------------
  // UI Render
  // -------------------------
  return (
    <section>
      <h3>🎓 Enrollment Management</h3>

      {/* CREATE FORM */}
      <form
        onSubmit={handleCreate}
        style={{
          background: "#f9f9f9",
          padding: "15px",
          borderRadius: "8px",
          marginBottom: "20px",
        }}
      >
        <h4>New Enrollment</h4>

        <div style={{ display: "grid", gap: "8px" }}>
          {/* 🔹 Student dropdown fixed to use user.full_name */}
          <select name="student" value={form.student} onChange={handleChange} required>
            <option value="">Select Student</option>
            {students.map((s) => {
              const label = s.user?.full_name || s.user?.email || `Student #${s.id}`;
              return (
                <option key={s.id} value={s.id}>
                  {label}
                </option>
              );
            })}
          </select>

          {/* Course dropdown — unchanged */}
          <select name="course" value={form.course} onChange={handleChange} required>
            <option value="">Select Course</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <button type="submit">➕ Enroll</button>
        </div>
      </form>

      {/* LIST */}
      <h4>Enrollment List</h4>

      {enrollments.length === 0 ? (
        <p>No enrollments yet.</p>
      ) : (
        enrollments.map((enr) => (
          <div key={enr.id} style={{ border: "1px solid #ddd", padding: 12, marginBottom: 10 }}>
            {editId === enr.id ? (
              <>
                {/* 🔹 Edit mode student dropdown fixed */}
                <select name="student" value={form.student} onChange={handleChange}>
                  <option value="">Select Student</option>
                  {students.map((s) => {
                    const label = s.user?.full_name || s.user?.email || `Student #${s.id}`;
                    return (
                      <option key={s.id} value={s.id}>
                        {label}
                      </option>
                    );
                  })}
                </select>

                {/* Edit mode course dropdown */}
                <select name="course" value={form.course} onChange={handleChange}>
                  <option value="">Select Course</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>

                <div style={{ marginTop: 8 }}>
                  <button onClick={() => handleUpdate(enr.id)}>💾 Save</button>
                  <button onClick={cancelEdit} style={{ marginLeft: 8 }}>
                    ❌ Cancel
                  </button>
                </div>
              </>
            ) : (
              <>
                <strong>{resolveStudentName(enr)}</strong> → {resolveCourseName(enr)}
                <br />
                <small>Enrolled: {enr.enrolled_at}</small>
                <br />

                <button onClick={() => startEdit(enr)} style={{ marginRight: 8 }}>
                  ✏ Update
                </button>

                <button onClick={() => handleDelete(enr.id)}>🗑 Delete</button>
              </>
            )}
          </div>
        ))
      )}
    </section>
  );
}

export default EnrollmentManager;
