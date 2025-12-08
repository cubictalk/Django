// src/pages/DashboardStudent.js
// 변경일: 2025-10-04
// ✅ 학생이 에세이 제출하면 Django에서 내려온 feedback JSON을 받아서 화면에 표시

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function DashboardStudent() {
  const navigate = useNavigate();
  const [essay, setEssay] = useState("");
  const [studentName, setStudentName] = useState("");
  const [level, setLevel] = useState("");   
  const [title, setTitle] = useState("");   
  const [loading, setLoading] = useState(true);
  
  // 🆕 [2025-10-04] feedback 상태 추가
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("access");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setStudentName(payload.full_name || "학생");

        axios
          .get("http://localhost:8000/dummy-essay-title/", {
            headers: { Authorization: `Bearer ${token}` },
          })
          .then((res) => {
            setLevel(res.data.level);
            setTitle(res.data.title);
          })
          .catch((err) => {
            console.error("에세이 타이틀 불러오기 실패:", err);
          })
          .finally(() => setLoading(false));
      } catch (e) {
        console.error("토큰 파싱 실패:", e);
        setStudentName("학생");
        setLoading(false);
      }
    } else {
      navigate("/login");
    }
  }, [navigate]);

  // 🆕 [2025-10-04] 에세이 제출 후 feedback 저장 로직 추가
  const handleSend = async () => {
    if (!essay.trim()) {
      alert("에세이를 작성해주세요.");
      return;
    }

    const token = localStorage.getItem("access");

    try {
      const res = await axios.post(
        "http://localhost:8000/submit-essay/", 
        { title, content: essay },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("서버 응답:", res.data);

      // 🆕 [2025-10-04] 서버 응답에서 feedback 저장
      setFeedback(res.data.feedback);

      alert("에세이가 제출되었습니다!");
      setEssay(""); 
    } catch (err) {
      console.error("에세이 제출 실패:", err);
      alert("제출 실패. 다시 시도해주세요.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("role");
    navigate("/login");
  };

  if (loading) return <p>대시보드 불러오는 중...</p>;

  return (
    <div style={{ maxWidth: "800px", margin: "auto", padding: "20px" }}>
      <h1>학생 대시보드</h1>
      <p>
        안녕하세요, <strong>{studentName}</strong>님 👋
      </p>

      <section style={{ marginTop: "20px", padding: "15px", border: "1px solid #ddd" }}>
        <p><strong>📖 Level:</strong> {level}</p>
        <p><strong>📝 Essay Title:</strong> {title}</p>
      </section>

      <section style={{ marginTop: "20px" }}>
        <h3>✍️ 에세이 작성</h3>
        <textarea
          value={essay}
          onChange={(e) => setEssay(e.target.value)}
          placeholder="에세이를 작성하세요..."
          rows={8}
          style={{ width: "100%", padding: "10px" }}
        />
        <br />
        <button onClick={handleSend} style={{ marginTop: "10px" }}>
          Send
        </button>
      </section>

      {/* 🆕 [2025-10-04] 제출 후 Feedback 표시 */}
      {feedback && (
        <section style={{ marginTop: "30px", padding: "15px", border: "1px solid #ddd" }}>
          <h3>📢 Feedback</h3>
          <p><strong>💬 Comments:</strong> {feedback.comments}</p>
          {feedback.score && (
            <p>
              <strong>📊 Score:</strong>{" "}
              Grammar {feedback.score.grammar}, Vocabulary {feedback.score.vocab}
            </p>
          )}
        </section>
      )}

      <div style={{ marginTop: "30px" }}>
        <button onClick={handleLogout}>로그아웃</button>
      </div>
    </div>
  );
}

export default DashboardStudent;
