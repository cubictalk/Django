// src/pages/CourseManager.js
// ✅ Updated: 2025-11-22
import React, { useEffect, useState } from "react";
import axios from "axios";
import { normalizeList } from "../../utils/api"; // ✅ 2026-01-15 공통 map 방어 유틸

function CourseManager() {
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);

  const [editId, setEditId] = useState(null); // course being edited
  const [form, setForm] = useState({
    name: "",
    description: "",
    level: "",
    duration_minutes: "",
    subject: "", // subject id (number or empty string)
    teacher: "", // teacher id (number or empty string)
    is_active: true,
  });

  // ✅ 2026-01-15
  // SubjectManager / TeacherManager 와 동일:
  // 배포 환경(Vercel)에서 상대경로 문제 방지를 위한 API Base URL
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  // -------------------------
  // Fetch helpers
  // -------------------------
  const fetchCourses = async () => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/api/courses/`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("access")}` },
        }
      );
      console.log("[fetchCourses] raw response:", res.data);

      // ✅ 2026-01-15: pagination / 비정상 응답 방어
      setCourses(normalizeList(res.data));
    } catch (error) {
      console.error("❌ Failed to fetch courses:", error);
      setCourses([]); // ✅ 2026-01-15 추가 방어
    }
  };

  const fetchSubjects = async () => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/api/subjects/`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("access")}` },
        }
      );
      console.log("[fetchSubjects] raw response:", res.data);

      // ✅ 2026-01-15
      setSubjects(normalizeList(res.data));
    } catch (error) {
      console.error("❌ Failed to fetch subjects:", error);
      setSubjects([]); // ✅ 방어
    }
  };

  const fetchTeachers = async () => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/api/teachers/`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("access")}` },
        }
      );
      console.log("[fetchTeachers] raw response:", res.data);

      // ✅ 2026-01-15
      setTeachers(normalizeList(res.data));
    } catch (error) {
      console.error("❌ Failed to fetch teachers:", error);
      setTeachers([]); // ✅ 방어
    }
  };

  useEffect(() => {
    fetchCourses();
    fetchSubjects();
    fetchTeachers();
  }, []);

  // -------------------------
  // Util: resolve names (handles different API shapes)
  // -------------------------
  const resolveSubjectName = (course) => {
    const s = course.subject;
    if (!s) return null;
    if (typeof s === "object") return s.name || s.title || null;
    const found = subjects.find((sub) => Number(sub.id) === Number(s));
    return found ? found.name : null;
  };

  const resolveTeacherName = (course) => {
    const t = course.teacher;
    if (!t) return null;
    if (typeof t === "object") {
      if (t.user && t.user.full_name) return t.user.full_name;
      if (t.full_name) return t.full_name;
      return t.id ? String(t.id) : null;
    }
    const found = teachers.find((th) => Number(th.id) === Number(t));
    if (found) {
      return (
        (found.user && found.user.full_name) ||
        found.user_full_name ||
        found.email ||
        String(found.id)
      );
    }
    return null;
  };

  // -------------------------
  // Form changes
  // -------------------------
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // -------------------------
  // CREATE COURSE
  // -------------------------
  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: form.name,
        description: form.description,
        level: form.level,
        duration_minutes: form.duration_minutes
          ? Number(form.duration_minutes)
          : undefined,
        subject: form.subject ? Number(form.subject) : null,
        teacher: form.teacher ? Number(form.teacher) : null,
        is_active: form.is_active,
      };

      console.log("[handleCreate] payload:", payload);

      await axios.post(
        `${API_BASE_URL}/api/courses/`,
        payload,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("access")}` },
        }
      );

      alert("✅ Course created!");
      setForm({
        name: "",
        description: "",
        level: "",
        duration_minutes: "",
        subject: "",
        teacher: "",
        is_active: true,
      });
      fetchCourses();
    } catch (error) {
      console.error("❌ Course creation failed:", error.response || error);
      alert("Course creation failed. See console for details.");
    }
  };

  // -------------------------
  // DELETE COURSE
  // -------------------------
  const handleDelete = async (id) => {
    if (!window.confirm("정말 이 강좌를 삭제하시겠습니까?")) return;
    try {
      await axios.delete(
        `${API_BASE_URL}/api/courses/${id}/`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("access")}` },
        }
      );
      fetchCourses();
    } catch (error) {
      console.error("❌ Course deletion failed:", error);
    }
  };

  // -------------------------
  // EDIT / UPDATE
  // -------------------------
  const startEdit = (course) => {
    setEditId(course.id);
    setForm({
      name: course.name || "",
      description: course.description || "",
      level: course.level || "",
      duration_minutes: course.duration_minutes || "",
      subject: course.subject
        ? String(course.subject.id ?? course.subject)
        : "",
      teacher: course.teacher
        ? String(course.teacher.id ?? course.teacher)
        : "",
      is_active: course.is_active ?? true,
    });
  };

  const cancelEdit = () => {
    setEditId(null);
    setForm({
      name: "",
      description: "",
      level: "",
      duration_minutes: "",
      subject: "",
      teacher: "",
      is_active: true,
    });
  };

  const handleUpdate = async (id) => {
    try {
      const payload = {
        name: form.name,
        description: form.description,
        level: form.level,
        duration_minutes: form.duration_minutes
          ? Number(form.duration_minutes)
          : undefined,
        subject: form.subject ? Number(form.subject) : null,
        teacher: form.teacher ? Number(form.teacher) : null,
        is_active: form.is_active,
      };

      console.log("[handleUpdate] id:", id, "payload:", payload);

      await axios.patch(
        `${API_BASE_URL}/api/courses/${id}/`,
        payload,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("access")}` },
        }
      );

      alert("✅ Course updated!");
      setEditId(null);
      fetchCourses();
    } catch (error) {
      console.error("❌ Course update failed:", error.response || error);
      alert("Update failed. See console.");
    }
  };

  // -------------------------
  // Render
  // -------------------------
  return (
    <section>
      <h3>📘 Course Management</h3>

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
        <h4>New Course</h4>
        <div style={{ display: "grid", gap: "8px" }}>
          <input name="name" placeholder="Course Name" value={form.name} onChange={handleChange} required />
          <textarea name="description" placeholder="Description" value={form.description} onChange={handleChange} />
          <input name="level" placeholder="Level (e.g. beginner)" value={form.level} onChange={handleChange} />
          <input type="number" name="duration_minutes" placeholder="Duration (minutes)" value={form.duration_minutes} onChange={handleChange} />

          <select name="subject" value={form.subject} onChange={handleChange} required>
            <option value="">Select Subject</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>

          <select name="teacher" value={form.teacher} onChange={handleChange} required>
            <option value="">Select Teacher</option>
            {teachers.map((t) => {
              const name =
                (t.user && t.user.full_name) ||
                t.user_full_name ||
                t.email ||
                `#${t.id}`;
              return (
                <option key={t.id} value={t.id}>{name}</option>
              );
            })}
          </select>

          <label>
            <input type="checkbox" name="is_active" checked={form.is_active} onChange={handleChange} />
            Active
          </label>

          <button type="submit">➕ Add Course</button>
        </div>
      </form>

      {/* COURSE LIST */}
      <h4>Course List</h4>
      {courses.length === 0 ? (
        <p>No courses yet.</p>
      ) : (
        courses.map((course) => (
          <div key={course.id} style={{ border: "1px solid #ddd", padding: 12, marginBottom: 10 }}>
            {editId === course.id ? (
              <>
                <input name="name" value={form.name} onChange={handleChange} />
                <textarea name="description" value={form.description} onChange={handleChange} />
                <input name="level" value={form.level} onChange={handleChange} />
                <input type="number" name="duration_minutes" value={form.duration_minutes} onChange={handleChange} />

                <select name="subject" value={form.subject} onChange={handleChange}>
                  <option value="">Select Subject</option>
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>

                <select name="teacher" value={form.teacher} onChange={handleChange}>
                  <option value="">Select Teacher</option>
                  {teachers.map((t) => {
                    const name =
                      (t.user && t.user.full_name) ||
                      t.user_full_name ||
                      t.email ||
                      `#${t.id}`;
                    return (
                      <option key={t.id} value={t.id}>{name}</option>
                    );
                  })}
                </select>

                <label>
                  <input type="checkbox" name="is_active" checked={form.is_active} onChange={handleChange} />
                  Active
                </label>

                <div style={{ marginTop: 8 }}>
                  <button onClick={() => handleUpdate(course.id)}>💾 Save</button>
                  <button onClick={cancelEdit} style={{ marginLeft: 8 }}>❌ Cancel</button>
                </div>
              </>
            ) : (
              <>
                <strong>{course.name}</strong> — {course.level}
                <br />
                Subject: {resolveSubjectName(course) || "None"}
                <br />
                Teacher: {resolveTeacherName(course) || "None"}
                <br />
                <button onClick={() => startEdit(course)} style={{ marginRight: 8 }}>✏ Update</button>
                <button onClick={() => handleDelete(course.id)}>🗑 Delete</button>
              </>
            )}
          </div>
        ))
      )}
    </section>
  );
}

export default CourseManager;