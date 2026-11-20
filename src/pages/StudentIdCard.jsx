import { useRef, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";

const COLLEGE_NAME = "STUDENT PORTAL COLLEGE";

function escapeXml(value) {
  return String(value ?? "").replace(/[<>&'"]/g, (character) => ({
    "<": "&lt;",
    ">": "&gt;",
    "&": "&amp;",
    "'": "&apos;",
    "\"": "&quot;",
  })[character]);
}

function StudentIdCard({
  students,
  selectedStudentId,
  onSelectStudent,
  onNavigate,
  user,
  notifications = [],
}) {
  const qrContainerRef = useRef(null);
  const [feedback, setFeedback] = useState("");
  const student = students.find((item) => item.id === selectedStudentId) || students[0];

  function downloadCard() {
    const qrSvg = qrContainerRef.current?.querySelector("svg");
    if (!qrSvg) {
      setFeedback("The QR code is not ready yet. Please try again.");
      return;
    }

    const viewBox = escapeXml(qrSvg.getAttribute("viewBox"));
    const qrMarkup = `
      <svg xmlns="http://www.w3.org/2000/svg" x="786" y="242"
        width="150" height="150" viewBox="${viewBox}">
        ${qrSvg.innerHTML}
      </svg>`;
    const imageMarkup = student.photo
      ? `<image x="72" y="200" width="180" height="220"
          href="${escapeXml(student.photo)}" preserveAspectRatio="xMidYMid slice"
          clip-path="url(#student-photo-clip)" />`
      : `<text x="162" y="320" text-anchor="middle" dominant-baseline="middle"
          font-family="Arial, sans-serif" font-size="54" font-weight="700"
          fill="#6d28d9">${escapeXml(
            String(student.name || "S").trim().charAt(0).toUpperCase()
          )}</text>`;

    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="1000" height="630"
        viewBox="0 0 1000 630">
        <defs>
          <linearGradient id="card-background" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stop-color="#ffffff" />
            <stop offset="100%" stop-color="#faf8ff" />
          </linearGradient>
          <clipPath id="student-photo-clip">
            <rect x="72" y="200" width="180" height="220" rx="18" />
          </clipPath>
        </defs>
        <rect width="1000" height="630" rx="30" fill="url(#card-background)" />
        <path d="M30 0h940a30 30 0 0 1 30 30v125H0V30A30 30 0 0 1 30 0Z"
          fill="#1e1b4b" />
        <circle cx="82" cy="78" r="36" fill="#7c3aed" />
        <text x="82" y="88" text-anchor="middle" font-family="Arial, sans-serif"
          font-size="28" font-weight="700" fill="#ffffff">SP</text>
        <text x="140" y="70" font-family="Arial, sans-serif" font-size="28"
          font-weight="700" fill="#ffffff">${escapeXml(COLLEGE_NAME)}</text>
        <text x="140" y="104" font-family="Arial, sans-serif" font-size="16"
          letter-spacing="3" fill="#ddd6fe">STUDENT IDENTIFICATION CARD</text>
        ${imageMarkup}
        <rect x="72" y="200" width="180" height="220" rx="18" fill="none"
          stroke="#ddd6fe" stroke-width="4" />
        <text x="300" y="238" font-family="Arial, sans-serif" font-size="14"
          font-weight="700" letter-spacing="2" fill="#7c3aed">STUDENT NAME</text>
        <text x="300" y="282" font-family="Arial, sans-serif" font-size="32"
          font-weight="700" fill="#1e1b4b">${escapeXml(student.name)}</text>
        <text x="300" y="330" font-family="Arial, sans-serif" font-size="14"
          font-weight="700" letter-spacing="2" fill="#7c3aed">REGISTER NUMBER</text>
        <text x="300" y="362" font-family="Arial, sans-serif" font-size="23"
          font-weight="600" fill="#334155">${escapeXml(student.registerNo)}</text>
        <text x="300" y="402" font-family="Arial, sans-serif" font-size="14"
          font-weight="700" letter-spacing="2" fill="#7c3aed">DEPARTMENT</text>
        <text x="300" y="432" font-family="Arial, sans-serif" font-size="20"
          fill="#334155">${escapeXml(student.department)}</text>
        <text x="300" y="472" font-family="Arial, sans-serif" font-size="14"
          font-weight="700" letter-spacing="2" fill="#7c3aed">COURSE</text>
        <text x="300" y="502" font-family="Arial, sans-serif" font-size="18"
          fill="#334155">${escapeXml(student.course)}</text>
        <rect x="760" y="215" width="205" height="225" rx="18" fill="#f3e8ff" />
        ${qrMarkup}
        <text x="862" y="420" text-anchor="middle" font-family="Arial, sans-serif"
          font-size="13" font-weight="600" fill="#5b21b6">SCAN TO IDENTIFY</text>
        <path d="M0 570h1000v30a30 30 0 0 1-30 30H30A30 30 0 0 1 0 600Z"
          fill="#6d28d9" />
        <text x="72" y="608" font-family="Arial, sans-serif" font-size="16"
          font-weight="600" fill="#ffffff">${escapeXml(student.year)} · ${escapeXml(student.status)}</text>
        <text x="928" y="608" text-anchor="end" font-family="Arial, sans-serif"
          font-size="14" fill="#ede9fe">${escapeXml(COLLEGE_NAME)}</text>
      </svg>`;

    const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
    const downloadUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const safeRegisterNumber = String(student.registerNo || "student")
      .replace(/[^a-z0-9_-]/gi, "-");
    link.href = downloadUrl;
    link.download = `student-id-${safeRegisterNumber}.svg`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 0);
    setFeedback("Student ID card downloaded.");
  }

  function printCard() {
    window.print();
  }

  return (
    <div className="student-id-page">
      <Navbar onNavigate={onNavigate} user={user} notifications={notifications} />
      <div className="dashboard-layout">
        <Sidebar activePage="id-card" onNavigate={onNavigate} role={user?.role} />
        <main className="dashboard-content">
          <div className="id-card-page-heading">
            <div>
              <p className="welcome-small">STUDENT SERVICES</p>
              <h1>Student ID Card</h1>
              <p>Generate, download, or print a student identification card.</p>
            </div>
            {students.length > 1 && (
              <label className="profile-student-picker">
                <span>Select student</span>
                <select
                  value={student?.id ?? ""}
                  onChange={(event) => {
                    onSelectStudent(event.target.value);
                    setFeedback("");
                  }}
                >
                  {students.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name} — {item.registerNo}
                    </option>
                  ))}
                </select>
              </label>
            )}
          </div>

          {!student ? (
            <section className="profile-empty">
              <span aria-hidden="true">🪪</span>
              <h2>No student records available</h2>
              <p>Register a student before generating an ID card.</p>
              <button
                type="button"
                className="quick-action primary"
                onClick={() => onNavigate?.("register")}
              >
                Register Student
              </button>
            </section>
          ) : (
            <>
              <article className="student-id-card">
                <header className="id-card-header">
                  <span className="college-logo" aria-label="Student Portal College logo">SP</span>
                  <div className="college-brand">
                    <h2>{COLLEGE_NAME}</h2>
                    <p>STUDENT IDENTIFICATION CARD</p>
                  </div>
                  <span className="id-card-academic-year">{student.year}</span>
                </header>

                <div className="id-card-content">
                  <div className="id-card-photo">
                    {student.photo ? (
                      <img src={student.photo} alt={`${student.name}'s student photograph`} />
                    ) : (
                      <span aria-hidden="true">
                        {String(student.name || "S").trim().charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>

                  <div className="id-card-student-info">
                    <p className="id-card-label">STUDENT NAME</p>
                    <h3>{student.name}</h3>
                    <p className="id-card-label">REGISTER NUMBER</p>
                    <p className="id-card-value">{student.registerNo}</p>
                    <p className="id-card-label">DEPARTMENT</p>
                    <p className="id-card-value">{student.department}</p>
                    <p className="id-card-label">COURSE</p>
                    <p className="id-card-value">{student.course}</p>
                  </div>

                  <div className="id-card-qr-panel">
                    <div className="id-card-qr" ref={qrContainerRef}>
                      <QRCodeSVG
                        value={student.registerNo}
                        size={132}
                        level="M"
                        title={`QR code for ${student.registerNo}`}
                      />
                    </div>
                    <p>Scan to identify</p>
                  </div>
                </div>

                <footer className="id-card-footer">
                  <span>OFFICIAL STUDENT IDENTIFICATION</span>
                  <span className={`id-card-status ${student.status === "Active" ? "active" : ""}`}>
                    {student.status}
                  </span>
                </footer>
              </article>

              <div className="id-card-actions">
                <button type="button" className="quick-action secondary" onClick={printCard}>
                  Print ID Card
                </button>
                <button type="button" className="quick-action primary" onClick={downloadCard}>
                  Download ID Card
                </button>
              </div>
              <p className="id-card-qr-note">
                The QR code contains the student’s register number for identification.
              </p>
            </>
          )}

          {feedback && <p className="student-list-feedback" role="status">{feedback}</p>}
        </main>
      </div>
      <Footer />
    </div>
  );
}

export default StudentIdCard;
