// TeacherManager.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import TeacherForm from "../../components/TeacherForm";

function TeacherManager() {
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [editData, setEditData] = useState({});

  // Load teachers
  const fetchTeachers = async () => {
    try {
      const res = await axios.get("/api/teachers/", {
        headers: { Authorization: `Bearer ${localStorage.getItem("access")}` },
      });
      setTeachers(res.data);
    } catch (error) {
      console.error("교사 목록 불러오기 실패:", error);
    }
  };

  // Load subjects
  const fetchSubjects = async () => {
    try {
      const res = await axios.get("/api/subjects/", {
        headers: { Authorization: `Bearer ${localStorage.getItem("access")}` },
      });
      setSubjects(res.data);
    } catch (error) {
      console.error("과목 목록 불러오기 실패:", error);
    }
  };

  useEffect(() => {
    fetchTeachers();
    fetchSubjects();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;

    try {
      await axios.delete(`/api/teachers/${id}/`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("access")}` },
      });
      fetchTeachers();
    } catch (error) {
      console.error("삭제 실패:", error);
    }
  };

  // NOTE: backend returns teacher.subjects as an ARRAY
  const handleEdit = (teacher) => {
    setEditingTeacher(teacher.id);

    setEditData({
      full_name: teacher.user?.full_name || "",
      email: teacher.user?.email || "",
      // Use first subject in the array if exists
      subject: teacher.subjects && teacher.subjects.length
        ? String(teacher.subjects[0].id)
        : "",
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({
      ...prev,
      // keep subject as string for controlled <select>
      [name]: name === "subject" ? String(value) : value,
    }));
  };

  const handleEditSubmit = async (id) => {
    try {
      await axios.patch(
        `/api/teachers/${id}/`,
        {
          user: {
            full_name: editData.full_name,
            email: editData.email,
          },
          // send number or null; backend accepts single subject
          subject: editData.subject ? Number(editData.subject) : null,
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("access")}` },
        }
      );

      setEditingTeacher(null);
      // refresh list to reflect DB changes
      fetchTeachers();
      alert("✅ 수정 완료");
    } catch (error) {
      console.error("수정 실패:", error);
      alert("❌ 수정 실패");
    }
  };

  return (
    <section>
      <h3>교사 등록</h3>
      <TeacherForm onTeacherAdded={fetchTeachers} subjects={subjects} />

      <h3 style={{ marginTop: 24 }}>교사 목록</h3>

      <table border="1" cellPadding="8" style={{ width: "100%", marginTop: 10 }}>
        <thead>
          <tr>
            <th>이름</th>
            <th>이메일</th>
            <th>과목</th>
            <th>관리</th>
          </tr>
        </thead>

        <tbody>
          {teachers.map((t) => (
            <tr key={t.id}>
              {editingTeacher === t.id ? (
                <>
                  <td>
                    <input
                      type="text"
                      name="full_name"
                      value={editData.full_name}
                      onChange={handleEditChange}
                    />
                  </td>

                  <td>
                    <input
                      type="email"
                      name="email"
                      value={editData.email}
                      onChange={handleEditChange}
                    />
                  </td>

                  <td>
                    <select
                      name="subject"
                      value={editData.subject}
                      onChange={handleEditChange}
                    >
                      <option value="">과목 선택</option>
                      {subjects.map((s) => (
                        // option value must be string to match editData.subject
                        <option key={s.id} value={String(s.id)}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </td>

                  <td>
                    <button onClick={() => handleEditSubmit(t.id)}>확인</button>
                    <button onClick={() => setEditingTeacher(null)}>취소</button>
                  </td>
                </>
              ) : (
                <>
                  <td>{t.user?.full_name}</td>
                  <td>{t.user?.email}</td>

                  {/* Show the first subject name (if any) */}
                  <td>{t.subjects?.[0]?.name || "과목 없음"}</td>

                  <td>
                    <button onClick={() => handleEdit(t)}>수정</button>
                    <button onClick={() => handleDelete(t.id)}>삭제</button>
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

export default TeacherManager;
