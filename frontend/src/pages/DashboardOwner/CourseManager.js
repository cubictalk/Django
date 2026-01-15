// src/pages/CourseManager.js
// ✅ Updated: 2025-11-22
// ✅ Updated: 2026-01-13
// - API_BASE_URL 환경 분리
// - pagination / non-array map 방어 코드 추가

import React, { useEffect, useState } from "react";
import axios from "axios";

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
    subject: "",
    teacher: "",
    is_active: true,
  });

  // ✅ 2026-01-13
  // SubjectManager 와 동일한 환경별 API 분리
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  // -------------------------
  // Util: pagination / non-array 방어
  // -------------------------
  // ✅ 2026-01-13
  const normalizeList = (data) => {
    if (Array.isArray(data)) return data;
    if (data?.results && Array.isArray(data.results)) return data.results;
    return [];
  };

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
      setCourses(normalizeList(res.data)); // ✅ 2026-01-13 map 방어
    } catch (error) {
      console.error("❌ Failed to fetch courses:", error);
      setCourses([]); // ✅ 2026-01-13 추가 방어
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
      setSubjects(normalizeList(res.data)); // ✅ 2026-01-13
    } catch (error) {
      console.error("❌ Failed to fetch subjects:", error);
      setSubjects([]); // ✅ 2026-01-13
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
      setTeachers(normalizeList(res.data)); // ✅ 2026-01-13
    } catch (error) {
      console.error("❌ Failed to fetch teachers:", error);
      setTeachers([]); // ✅ 2026-01-13
    }
  };

  useEffect(() => {
    fetchCourses();
    fetchSubjects();
    fetchTeachers();
  }, []);

  // -------------------------
  // Util: resolve names
  // -------------------------
  const resolveSubjectName = (course) => {
    const s = course.subject;
    if (!s) return null;
    if (typeof s === "object") return s.name || null;
    const found = subjects.find((sub) => Number(sub.id) === Number(s));
    return found ? found.name : null;
  };

  const resolveTeacherName = (course) => {
    const t = course.teacher;
    if (!t) return null;
    if (typeof t === "object") {
      if (t.user?.full_name) return t.user.full_name;
      if (t.full_name) return t.full_name;
      return t.id ? String(t.id) : null;
    }
    const found = teachers.find((th) => Number(th.id) === Number(t));
    return found
      ? found.user?.full_name || found.user_full_name || found.email || `#${found.id}`
      : null;
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
  // CREATE
  // -------------------------
  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: form.name,
        description: form.description,
        level: form.level,
        duration_minutes: form.duration_minutes ? Number(form.duration_minutes) : undefined,
        subject: form.subject ? Number(form.subject) : null,
        teacher: form.teacher ? Number(form.teacher) : null,
        is_active: form.is_active,
      };

      await axios.post(
        `${API_BASE_URL}/api/courses/`,
        payload,
        { headers: { Authorization: `Bearer ${localStorage.getItem("access")}` } }
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
      alert("Course creation failed.");
    }
  };

  // -------------------------
  // DELETE
  // -------------------------
  const handleDelete = async (id) => {
    if (!window.confirm("정말 이 강좌를 삭제하시겠습니까?")) return;
    try {
      await axios.delete(
        `${API_BASE_URL}/api/courses/${id}/`,
        { headers: { Authorization: `Bearer ${localStorage.getItem("access")}` } }
      );
      fetchCourses();
    } catch (error) {
      console.error("❌ Course deletion failed:", error);
    }
  };

  // -------------------------
  // EDIT
  // -------------------------
  const startEdit = (course) => {
    setEditId(course.id);
    setForm({
      name: course.name || "",
      description: course.description || "",
      level: course.level || "",
      duration_minutes: course.duration_minutes || "",
      subject: course.subject ? String(course.subject.id ?? course.subject) : "",
      teacher: course.teacher ? String(course.teacher.id ?? course.teacher) : "",
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
        duration_minutes: form.duration_minutes ? Number(form.duration_minutes) : undefined,
        subject: form.subject ? Number(form.subject) : null,
        teacher: form.teacher ? Number(form.teacher) : null,
        is_active: form.is_active,
      };

      await axios.patch(
        `${API_BASE_URL}/api/courses/${id}/`,
        payload,
        { headers: { Authorization: `Bearer ${localStorage.getItem("access")}` } }
      );

      alert("✅ Course updated!");
      setEditId(null);
      fetchCourses();
    } catch (error) {
      console.error("❌ Course update failed:", error.response || error);
      alert("Update failed.");
    }
  };

  // -------------------------
  // Render
  // -------------------------
  return (
    <section>
      <h3>📘 Course Management</h3>

      {/* CREATE FORM */}
      <form onSubmit={handleCreate}>
        <input name="name" value={form.name} onChange={handleChange} placeholder="Course Name" required />
        <button type="submit">➕ Add Course</button>
      </form>

      {/* COURSE LIST */}
      <h4>Course List</h4>
      {courses.length === 0 ? (
        <p>No courses yet.</p>
      ) : (
        courses.map((course) => (
          <div key={course.id}>
            <strong>{course.name}</strong> — {course.level}
            <br />
            Subject: {resolveSubjectName(course) || "None"}
            <br />
            Teacher: {resolveTeacherName(course) || "None"}
            <br />
            <button onClick={() => startEdit(course)}>✏ Update</button>
            <button onClick={() => handleDelete(course.id)}>🗑 Delete</button>
          </div>
        ))
      )}
    </section>
  );
}

export default CourseManager;