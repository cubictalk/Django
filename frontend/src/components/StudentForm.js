import React, { useState } from "react";
import axios from "axios";

/**
 * StudentForm
 * 최종 수정일: 2026-01-12
 *
 * [수정 이유]
 * - Vercel 배포 환경에서 axios 상대경로("/api/...") 사용 시
 *   프론트 도메인으로 요청이 나가 405 Method Not Allowed 발생
 * - Django(Fly.io) API 서버로 정확히 요청을 보내기 위해
 *   REACT_APP_API_BASE_URL 환경변수를 사용하도록 수정
 */

const StudentForm = () => {
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
  });

  // ✅ 2026-01-12
  // 환경별(API 서버 분리) 대응을 위해 base URL을 환경변수에서 가져옴
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // ✅ 2026-01-12
      // 기존 상대경로("/api/students/") → 절대경로(API 서버)로 수정
      await axios.post(
        `${API_BASE_URL}/api/students/`,
        formData,
        {
          headers: {
            // 기존 JWT 인증 로직 유지
            Authorization: `Bearer ${localStorage.getItem("access")}`,
            "Content-Type": "application/json",
          },
        }
      );

      alert("학생이 등록되었습니다!");
      setFormData({ full_name: "", email: "", password: "" });
    } catch (error) {
      console.error("학생 등록 오류:", error);
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
