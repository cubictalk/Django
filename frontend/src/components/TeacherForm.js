// src/components/TeacherForm.js
import React, { useState } from "react";
import axios from "axios";

const TeacherForm = ({ onTeacherAdded, subjects = [] }) => {
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    subject: "",   // ✅ NEW: subject 추가
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post(
        "/api/teachers/",
        {
          full_name: formData.full_name,
          email: formData.email,
          password: formData.password,
          subject: formData.subject || null, // subject 추가
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("access")}` },
        }
      );

      alert("교사가 등록되었습니다!");

      setFormData({
        full_name: "",
        email: "",
        password: "",
        subject: "",  // reset
      });

      if (onTeacherAdded) onTeacherAdded();
    } catch (error) {
      console.error(error);
      alert("교사 등록 실패");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        name="full_name"
        placeholder="교사 이름"
        value={formData.full_name}
        onChange={handleChange}
        required
      />

      <input
        type="email"
        name="email"
        placeholder="이메일"
        value={formData.email}
        onChange={handleChange}
        required
      />

      <input
        type="password"
        name="password"
        placeholder="비밀번호"
        value={formData.password}
        onChange={handleChange}
        required
      />

      {/* ⭐ NEW: Subject 선택 */}
      <select
        name="subject"
        value={formData.subject}
        onChange={handleChange}
      >
        <option value="">과목 선택</option>
        {subjects.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </select>

      <button type="submit">교사 등록</button>
    </form>
  );
};

export default TeacherForm;
