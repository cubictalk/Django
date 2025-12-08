import React, { useState } from "react";
import axios from "axios";

const StudentForm = () => {
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/api/students/", formData, 
        {
        headers: { Authorization: `Bearer ${localStorage.getItem("access")}` },
      });
      alert("학생이 등록되었습니다!");
      setFormData({ full_name: "", email: "", password: "" });
    } catch (error) {
      console.error(error);
      alert("학생 등록 실패");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        name="full_name"
        placeholder="학생 이름"
        value={formData.full_name}
        onChange={handleChange}
      />
      <input
        type="email"
        name="email"
        placeholder="이메일"
        value={formData.email}
        onChange={handleChange}
      />
      <input
        type="password"
        name="password"
        placeholder="비밀번호"
        value={formData.password}
        onChange={handleChange}
      />
      <button type="submit">학생 등록</button>
    </form>
  );
};

export default StudentForm;
