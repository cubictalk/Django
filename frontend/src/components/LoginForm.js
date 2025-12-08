import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function LoginForm({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post("http://127.0.0.1:8000/api/token/", {
        email,
        password,
      });
      
      console.log("서버 응답:", response.data);  // 응답 확인
      
      const { access, refresh, role } = response.data;

       // role 값이 없으면 에러 표시
      if (!role) {
        console.error("⚠️ 서버 응답에 role 없음!");
      }
      // 로컬스토리지에 저장
      localStorage.setItem("access", access);
      localStorage.setItem("refresh", refresh);
      localStorage.setItem("role", role);

      // 상위 App에 role 전달
      onLogin(role);

      // 로그인 후 자동 리다이렉트
      if (role === "owner") navigate("/owner/dashboard");
      else if (role === "teacher") navigate("/teacher/dashboard");
      else if (role === "student") navigate("/student/dashboard");
      else if (role === "parent") navigate("/parent/dashboard");
      else navigate("/login");

    } catch (err) {
      setError("로그인 실패. 이메일/비밀번호를 확인하세요.");
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "auto" }}>
      <h2>로그인</h2>
      <form onSubmit={handleLogin}>
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Password:</label>
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
