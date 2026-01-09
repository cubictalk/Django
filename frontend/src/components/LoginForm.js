import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// ✅ Vercel / 로컬 공통 API Base URL
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

function LoginForm({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      // 🔥 핵심: localhost 하드코딩 제거
      const response = await axios.post(
        `${API_BASE_URL}/api/token/`,
        { email, password },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("서버 응답:", response.data);
      console.log("API BASE URL:", API_BASE_URL);

      const { access, refresh, role } = response.data;

      if (!access || !role) {
        throw new Error("토큰 또는 role 없음");
      }

      // ✅ 토큰 저장
      localStorage.setItem("access", access);
      localStorage.setItem("refresh", refresh);
      localStorage.setItem("role", role);

      // ✅ 상위 App에 role 전달
      onLogin(role);

      // ✅ 역할별 대시보드 이동
      switch (role) {
        case "owner":
          navigate("/owner/dashboard");
          break;
        case "teacher":
          navigate("/teacher/dashboard");
          break;
        case "student":
          navigate("/student/dashboard");
          break;
        case "parent":
          navigate("/parent/dashboard");
          break;
        default:
          navigate("/login");
      }
    } catch (err) {
      console.error("로그인 에러:", err);
      setError("로그인 실패. 이메일 또는 비밀번호를 확인하세요.");
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "auto" }}>
      <h2>로그인</h2>

      <form onSubmit={handleLogin}>
        <div>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit">로그인</button>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}

export default LoginForm;
