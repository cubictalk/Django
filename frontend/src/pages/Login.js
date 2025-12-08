import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Login({ onLogin }) {
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

      const { access, refresh } = response.data;

      // JWT 저장
      localStorage.setItem("access", access);
      localStorage.setItem("refresh", refresh);

      // JWT payload 디코딩 (role 확인)
      const base64Url = access.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const payload = JSON.parse(atob(base64));

      const userRole = payload.role;

      if (userRole === "owner") {
        localStorage.setItem("role", userRole);
        onLogin(userRole);
        navigate("/owner/dashboard"); // ✅ Owner 대시보드로 이동
      } else {
        setError("이 로그인은 Owner만 가능합니다.");
      }
    } catch (err) {
      setError("로그인 실패. 이메일/비밀번호를 확인하세요.");
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "auto" }}>
      <h2>Owner 로그인</h2>
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

export default Login;
