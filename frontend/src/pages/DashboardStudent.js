// src/pages/DashboardStudent.js
// 변경일: 2025-10-04
// ✅ 학생 대시보드: 에세이 작성 + 에세이 목록/보기 통합 버전

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function DashboardStudent() {
  const navigate = useNavigate();
  const [view, setView] = useState("write"); // "write" | "list" | "detail"
  const [essay, setEssay] = useState("");
  const [studentName, setStudentName] = useState("");
  const [level, setLevel] = useState("");
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(true);

  // 🆕 2025-10-04 추가 상태
  const [feedback, setFeedback] = useState(null);
  const [essays, setEssays] = useState([]); // 에세이 목록
  const [selectedEssay, setSelectedEssay] = useState(null); // 선택된 에세이

  // ✅ 로그인 후 사용자 정보 및 dummy title 불러오기
  useEffect(() => {
    const token = localStorage.getItem("access");
    if (!token) {
      navigate("/login");
      return;
    }

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
        .catch((err) => console.error("에세이 타이틀 불러오기 실패:", err))
        .finally(() => setLoading(false));
    } catch (e) {
      console.error("토큰 파싱 실패:", e);
      setStudentName("학생");
      setLoading(false);
    }
  }, [navigate]);

  // ✅ 에세이 제출
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
      setFeedback(res.data.feedback);
      alert("에세이가 제출되었습니다!");
      setEssay("");
    } catch (err) {
      console.error("에세이 제출 실패:", err);
      alert("제출 실패. 다시 시도해주세요.");
    }
  };

  // ✅ 에세이 목록 불러오기
  const loadEssayList = async () => {
    const token = localStorage.getItem("access");
    try {
      const res = await axios.get("http://localhost:8000/my-essays/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEssays(res.data);
    } catch (err) {
      console.error("에세이 목록 불러오기 실패:", err);
    }
  };

  // ✅ 에세이 상세 보기
  const loadEssayDetail = async (essayId) => {
    const token = localStorage.getItem("access");
    try {
      const res = await axios.get(`http://localhost:8000/essay/${essayId}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSelectedEssay(res.data);
      setView("detail");
    } catch (err) {
      console.error("에세이 상세 불러오기 실패:", err);
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
    <div style={{ display: "flex", height: "100vh" }}>
      {/* ✅ 왼쪽 사이드바 */}
      <aside
        style={{
          width: "220px",
          backgroundColor: "#f4f4f4",
          padding: "20px",
          borderRight: "1px solid #ddd",
        }}
      >
        <h2>📘 메뉴</h2>
        <ul style={{ listStyle: "none", padding: 0 }}>
          <li
            style={{ cursor: "pointer", margin: "10px 0" }}
            onClick={() => setView("write")}
          >
            ✍️ 에세이 작성
          </li>
          <li
            style={{ cursor: "pointer", margin: "10px 0" }}
            onClick={() => {
              setView("list");
              loadEssayList();
            }}
          >
            📄 에세이 목록
          </li>
          <li
            style={{
              cursor: "pointer",
              marginTop: "20px",
              color: "gray",
              fontSize: "0.9em",
            }}
            onClick={handleLogout}
          >
            🚪 로그아웃
          </li>
        </ul>
      </aside>

      {/* ✅ 오른쪽 콘텐츠 영역 */}
      <main style={{ flex: 1, padding: "30px" }}>
        <h1>학생 대시보드</h1>
        <p>
          안녕하세요, <strong>{studentName}</strong>님 👋
        </p>

        {view === "write" && (
          <>
            <section
              style={{
                marginTop: "20px",
                padding: "15px",
                border: "1px solid #ddd",
              }}
            >
              <p>
                <strong>📖 Level:</strong> {level}
              </p>
              <p>
                <strong>📝 Essay Title:</strong> {title}
              </p>
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
                제출
              </button>
            </section>

            {feedback && (
              <section
                style={{
                  marginTop: "30px",
                  padding: "15px",
                  border: "1px solid #ddd",
                }}
              >
                <h3>📢 Feedback</h3>
                <p>
                  <strong>💬 Comments:</strong> {feedback.comments}
                </p>
                {feedback.score && (
                  <p>
                    <strong>📊 Score:</strong> Grammar{" "}
                    {feedback.score.grammar}, Vocabulary{" "}
                    {feedback.score.vocab}
                  </p>
                )}
              </section>
            )}
          </>
        )}

        {view === "list" && (
          <>
            <h3>📄 내가 쓴 에세이 목록</h3>
            {essays.length === 0 ? (
              <p>아직 작성한 에세이가 없습니다.</p>
            ) : (
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  marginTop: "10px",
                }}
              >
                <thead>
                  <tr style={{ backgroundColor: "#f0f0f0" }}>
                    <th style={{ border: "1px solid #ddd", padding: "8px" }}>
                      제목
                    </th>
                    <th style={{ border: "1px solid #ddd", padding: "8px" }}>
                      상태
                    </th>
                    <th style={{ border: "1px solid #ddd", padding: "8px" }}>
                      날짜
                    </th>
                    <th style={{ border: "1px solid #ddd", padding: "8px" }}>
                      보기
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {essays.map((e) => (
                    <tr key={e.id}>
                      <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                        {e.title}
                      </td>
                      <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                        {e.status}
                      </td>
                      <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                        {new Date(e.created_at).toLocaleDateString()}
                      </td>
                      <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                        <button onClick={() => loadEssayDetail(e.id)}>
                          보기
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </>
        )}

        {view === "detail" && selectedEssay && (
          <>
            <button
              onClick={() => setView("list")}
              style={{ marginBottom: "15px" }}
            >
              ← 목록으로
            </button>
            <h3>📝 {selectedEssay.title}</h3>
            <p style={{ whiteSpace: "pre-line" }}>{selectedEssay.content}</p>

            {selectedEssay.feedback && (
              <section
                style={{
                  marginTop: "20px",
                  padding: "15px",
                  border: "1px solid #ddd",
                }}
              >
                <h4>📢 피드백</h4>
                <p>
                  <strong>💬 Comments:</strong>{" "}
                  {selectedEssay.feedback.comments}
                </p>
                {selectedEssay.feedback.score && (
                  <p>
                    <strong>📊 Score:</strong> Grammar{" "}
                    {selectedEssay.feedback.score.grammar}, Vocabulary{" "}
                    {selectedEssay.feedback.score.vocab}
                  </p>
                )}
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default DashboardStudent;
