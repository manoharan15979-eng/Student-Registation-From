import { useState } from "react";

import Dashboard from "./pages/Dashboard";
import Registration from "./pages/Registration";
import StudentList from "./pages/StudentList";
import Profile from "./pages/Profile";
import StudentIdCard from "./pages/StudentIdCard";
import Reports from "./pages/Reports";
import StudentServices from "./pages/StudentServices";
import { initialStudents } from "./Data/students";

import "./App.css";

const localAdmin = { email: "Admin", role: "admin" };

function getNextRegisterNumber(students) {
  const prefix = `STU${new Date().getFullYear()}`;
  const usedNumbers = new Set(
    students.map((student) => String(student.registerNo || "").toUpperCase())
  );
  let sequence = 1;
  let registerNumber = `${prefix}${String(sequence).padStart(3, "0")}`;

  while (usedNumbers.has(registerNumber)) {
    sequence += 1;
    registerNumber = `${prefix}${String(sequence).padStart(3, "0")}`;
  }
  return registerNumber;
}

function App() {
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [students, setStudents] = useState(() =>
    initialStudents.map((student) => ({ ...student, id: String(student.id) }))
  );
  const [attendance, setAttendance] = useState([]);
  const [fees, setFees] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState(
    String(initialStudents[0]?.id ?? "")
  );
  const nextRegisterNumber = getNextRegisterNumber(students);

  function addStudent(studentData) {
    const details = { ...studentData };
    delete details.photoFile;
    delete details.password;
    const student = {
      ...details,
      id: globalThis.crypto?.randomUUID?.() || String(Date.now()),
      registeredAt: new Date().toISOString(),
    };
    setStudents((current) => [...current, student]);
    return getNextRegisterNumber([...students, student]);
  }

  function updateStudent(studentId, updatedStudent) {
    const details = { ...updatedStudent };
    delete details.photoFile;
    delete details.password;
    setStudents((current) => current.map((student) =>
      student.id === studentId
        ? {
            ...student,
            ...details,
            id: student.id,
            registerNo: student.registerNo,
            registeredAt: student.registeredAt,
          }
        : student
    ));
    return true;
  }

  function deleteStudent(studentId) {
    setStudents((current) => current.filter((student) => student.id !== studentId));
    setAttendance((current) => current.filter((record) => record.studentId !== studentId));
    setFees((current) => current.filter((fee) => fee.studentId !== studentId));
    setDocuments((current) => current.filter((document) => document.studentId !== studentId));
    setNotifications((current) => current.filter((notification) => notification.studentId !== studentId));
    if (selectedStudentId === studentId) setSelectedStudentId(null);
  }

  function showStudentProfile(studentId) {
    setSelectedStudentId(studentId);
    setCurrentPage("profile");
  }

  function restoreLocalData(data) {
    const restoredStudents = data.students.map((student, index) => ({
      ...student,
      id: String(student.id ?? index + 1),
    }));
    setStudents(restoredStudents);
    setAttendance(data.attendance);
    setFees(data.fees);
    setDocuments(data.documents);
    setNotifications(data.notifications);
    setSelectedStudentId(restoredStudents[0]?.id ?? null);
  }

  function renderPage() {
    const shared = {
      user: localAdmin,
      onNavigate: setCurrentPage,
      notifications,
    };
    switch (currentPage) {
      case "register":
        return (
          <Registration
            {...shared}
            onRegister={addStudent}
            students={students}
            nextRegisterNumber={nextRegisterNumber}
          />
        );
      case "students":
        return (
          <StudentList
            {...shared}
            students={students}
            onViewStudent={showStudentProfile}
            onUpdateStudent={updateStudent}
            onDeleteStudent={deleteStudent}
          />
        );
      case "profile":
        return (
          <Profile
            {...shared}
            students={students}
            selectedStudentId={selectedStudentId}
            onSelectStudent={setSelectedStudentId}
            onUpdateStudent={updateStudent}
          />
        );
      case "id-card":
        return (
          <StudentIdCard
            {...shared}
            students={students}
            selectedStudentId={selectedStudentId}
            onSelectStudent={setSelectedStudentId}
          />
        );
      case "reports":
        return <Reports {...shared} students={students} />;
      case "attendance":
      case "fees":
      case "documents":
      case "notifications":
      case "backup":
        return (
          <StudentServices
            {...shared}
            page={currentPage}
            students={students}
            attendance={attendance}
            setAttendance={setAttendance}
            fees={fees}
            setFees={setFees}
            documents={documents}
            setDocuments={setDocuments}
            notifications={notifications}
            setNotifications={setNotifications}
            onRestore={restoreLocalData}
          />
        );
      case "dashboard":
      default:
        return <Dashboard {...shared} students={students} />;
    }
  }

  return <div className="app">{renderPage()}</div>;
}

export default App;
