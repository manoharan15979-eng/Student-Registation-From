import { useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import "../styles/StudentServices.css";

const pageDetails = {
  attendance: ["Attendance", "Attendance history and daily marking."],
  fees: ["Fees", "Fee balances, due dates, and payments."],
  documents: ["Student Documents", "Upload and manage student documents."],
  notifications: ["Notifications", "Important updates for students."],
  backup: ["Data Backup & Restore", "Download or restore a local JSON backup."],
};

let idSequence = 0;

function createId() {
  idSequence += 1;
  return `local-${Date.now()}-${idSequence}`;
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") resolve(reader.result);
      else reject(new Error("The selected document could not be read."));
    };
    reader.onerror = () => reject(new Error("The selected document could not be read."));
    reader.readAsDataURL(file);
  });
}

function StudentServices({
  page,
  students,
  user,
  onNavigate,
  attendance,
  setAttendance,
  fees,
  setFees,
  documents,
  setDocuments,
  notifications,
  setNotifications,
  onRestore,
}) {
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");
  const [busy, setBusy] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [status, setStatus] = useState("Present");
  const [note, setNote] = useState("");
  const [feeTitle, setFeeTitle] = useState("");
  const [feeAmount, setFeeAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [notificationTitle, setNotificationTitle] = useState("");
  const [notificationMessage, setNotificationMessage] = useState("");
  const [notifyAll, setNotifyAll] = useState(true);
  const [file, setFile] = useState(null);
  const [restoreFile, setRestoreFile] = useState(null);
  const [confirmation, setConfirmation] = useState("");

  const title = pageDetails[page]?.[0] || "Student Services";
  const description = pageDetails[page]?.[1] || "";
  const studentOptions = useMemo(() => students || [], [students]);
  const studentId = studentOptions.some((student) => student.id === selectedStudentId)
    ? selectedStudentId
    : studentOptions[0]?.id || "";
  const records = {
    attendance,
    fees,
    documents,
    notifications,
  }[page] || [];

  async function perform(action, successMessage) {
    setBusy(true);
    setError("");
    setFeedback("");
    try {
      await action();
      setFeedback(successMessage);
      return true;
    } catch (actionError) {
      setError(actionError.message);
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function saveAttendance(event) {
    event.preventDefault();
    if (!studentId) {
      setError("Select a student before recording attendance.");
      return;
    }
    await perform(() => {
      const student = studentOptions.find((item) => item.id === studentId);
      const existing = attendance.find((record) =>
        record.studentId === studentId && record.date === date
      );
      const record = {
        id: existing?.id || createId(),
        studentId,
        studentName: student?.name || "Student",
        registerNo: student?.registerNo || "",
        date,
        status,
        note,
      };
      setAttendance((current) => [
        ...current.filter((item) => item.id !== record.id),
        record,
      ]);
    }, "Attendance saved for this session.");
  }

  async function createFee(event) {
    event.preventDefault();
    const amount = Number(feeAmount);
    if (!studentId || !feeTitle.trim() || !Number.isFinite(amount) || amount <= 0) {
      setError("Choose a student and enter a fee name and a valid amount.");
      return;
    }
    const saved = await perform(() => {
      const student = studentOptions.find((item) => item.id === studentId);
      setFees((current) => [...current, {
        id: createId(),
        studentId,
        studentName: student?.name || "Student",
        title: feeTitle.trim(),
        amount,
        paidAmount: 0,
        dueDate,
      }]);
    }, "Fee record added for this session.");
    if (saved) {
      setFeeTitle("");
      setFeeAmount("");
      setDueDate("");
    }
  }

  async function updatePayment(fee) {
    const value = window.prompt(
      `Enter total paid amount (maximum ${fee.amount}):`,
      String(fee.paidAmount)
    );
    if (value === null) return;
    const paidAmount = Number(value);
    if (!Number.isFinite(paidAmount) || paidAmount < 0 || paidAmount > fee.amount) {
      setError(`Enter a payment between 0 and ${fee.amount}.`);
      return;
    }
    await perform(() => {
      setFees((current) => current.map((item) =>
        item.id === fee.id ? { ...item, paidAmount } : item
      ));
    }, "Payment updated for this session.");
  }

  async function uploadDocument(event) {
    event.preventDefault();
    if (!file || !studentId) {
      setError("Choose a student and a document to upload.");
      return;
    }
    if (!["image/jpeg", "image/png", "image/webp", "application/pdf"].includes(file.type)) {
      setError("Choose a JPG, PNG, WebP, or PDF document.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("Documents must be 10 MB or smaller.");
      return;
    }
    await perform(async () => {
      const student = studentOptions.find((item) => item.id === studentId);
      const url = await readFileAsDataUrl(file);
      setDocuments((current) => [...current, {
        id: createId(),
        studentId,
        studentName: student?.name || "Student",
        fileName: file.name,
        url,
        mimeType: file.type,
        createdAt: new Date().toISOString(),
      }]);
      setFile(null);
      event.target.reset();
    }, "Document added for this session.");
  }

  async function deleteDocument(documentId) {
    await perform(() => {
      setDocuments((current) => current.filter((item) => item.id !== documentId));
    }, "Document deleted from this session.");
  }

  async function sendNotification(event) {
    event.preventDefault();
    const recipients = notifyAll
      ? studentOptions
      : studentOptions.filter((student) => student.id === studentId);
    if (!recipients.length) {
      setError("Choose at least one student to notify.");
      return;
    }
    if (!notificationTitle.trim() || !notificationMessage.trim()) {
      setError("Enter a notification title and message.");
      return;
    }
    const sent = await perform(() => {
      setNotifications((current) => [
        ...current,
        ...recipients.map((student) => ({
          id: createId(),
          studentId: student.id,
          studentName: student.name,
          title: notificationTitle.trim(),
          message: notificationMessage.trim(),
          createdAt: new Date().toISOString(),
          readAt: null,
        })),
      ]);
    }, "Notification added for this session.");
    if (sent) {
      setNotificationTitle("");
      setNotificationMessage("");
    }
  }

  async function markRead(notificationId) {
    await perform(() => {
      setNotifications((current) => current.map((item) =>
        item.id === notificationId ? { ...item, readAt: new Date().toISOString() } : item
      ));
    }, "Notification marked as read.");
  }

  async function downloadBackup() {
    await perform(() => {
      const backup = {
        version: 1,
        createdAt: new Date().toISOString(),
        data: { students, attendance, fees, documents, notifications },
      };
      const url = URL.createObjectURL(new Blob([JSON.stringify(backup, null, 2)], {
        type: "application/json",
      }));
      const link = document.createElement("a");
      link.href = url;
      link.download = `student-portal-backup-${new Date().toISOString().slice(0, 10)}.json`;
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    }, "Local data backup downloaded.");
  }

  async function restoreBackup(event) {
    event.preventDefault();
    if (!restoreFile || confirmation !== "RESTORE ALL DATA") {
      setError('Select a backup and type "RESTORE ALL DATA" to continue.');
      return;
    }
    await perform(async () => {
      const backup = JSON.parse(await restoreFile.text());
      const data = backup?.data;
      if (
        backup?.version !== 1 ||
        !Array.isArray(data?.students) ||
        !Array.isArray(data?.attendance) ||
        !Array.isArray(data?.fees) ||
        !Array.isArray(data?.documents) ||
        !Array.isArray(data?.notifications)
      ) {
        throw new Error("Backup file is invalid or uses an unsupported format.");
      }
      onRestore(data);
      setRestoreFile(null);
      setConfirmation("");
    }, "Local data restored.");
  }

  function renderStudentPicker() {
    return (
      <label className="service-field">
        <span>Student</span>
        <select value={studentId} onChange={(event) => setSelectedStudentId(event.target.value)} required>
          <option value="">Select student</option>
          {studentOptions.map((student) => (
            <option key={student.id} value={student.id}>
              {student.name} — {student.registerNo}
            </option>
          ))}
        </select>
      </label>
    );
  }

  function renderContent() {
    if (page === "attendance") {
      return (
        <>
          <form className="service-form" onSubmit={saveAttendance}>
            {renderStudentPicker()}
            <label className="service-field"><span>Date</span><input type="date" value={date} onChange={(event) => setDate(event.target.value)} required /></label>
            <label className="service-field"><span>Status</span><select value={status} onChange={(event) => setStatus(event.target.value)}><option>Present</option><option>Absent</option><option>Late</option></select></label>
            <label className="service-field"><span>Note</span><input value={note} onChange={(event) => setNote(event.target.value)} maxLength="500" /></label>
            <button className="quick-action primary" disabled={busy}>Save Attendance</button>
          </form>
          <div className="service-table-wrap"><table className="service-table">
            <thead><tr><th>Date</th><th>Student</th><th>Status</th><th>Note</th></tr></thead>
            <tbody>{records.length ? records.map((record) => (
              <tr key={record.id}><td>{record.date}</td><td>{record.studentName}</td><td>{record.status}</td><td>{record.note || "—"}</td></tr>
            )) : <tr><td colSpan="4">No attendance records yet.</td></tr>}</tbody>
          </table></div>
        </>
      );
    }

    if (page === "fees") {
      return (
        <>
          <form className="service-form" onSubmit={createFee}>
            {renderStudentPicker()}
            <label className="service-field"><span>Fee name</span><input value={feeTitle} onChange={(event) => setFeeTitle(event.target.value)} maxLength="120" required /></label>
            <label className="service-field"><span>Amount</span><input type="number" min="0.01" step="0.01" value={feeAmount} onChange={(event) => setFeeAmount(event.target.value)} required /></label>
            <label className="service-field"><span>Due date</span><input type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} /></label>
            <button className="quick-action primary" disabled={busy}>Add Fee</button>
          </form>
          <div className="service-table-wrap"><table className="service-table">
            <thead><tr><th>Student</th><th>Fee</th><th>Amount</th><th>Paid</th><th>Due</th><th>Action</th></tr></thead>
            <tbody>{records.length ? records.map((fee) => (
              <tr key={fee.id}><td>{fee.studentName}</td><td>{fee.title}</td><td>{fee.amount}</td><td>{fee.paidAmount}</td><td>{fee.dueDate ? new Date(`${fee.dueDate}T00:00:00`).toLocaleDateString() : "—"}</td><td><button className="service-link" onClick={() => updatePayment(fee)}>Update payment</button></td></tr>
            )) : <tr><td colSpan="6">No fee records yet.</td></tr>}</tbody>
          </table></div>
        </>
      );
    }

    if (page === "documents") {
      return (
        <>
          <form className="service-form" onSubmit={uploadDocument}>
            {renderStudentPicker()}
            <label className="service-field"><span>Document (JPG, PNG, WebP or PDF; max 10 MB)</span><input type="file" accept=".jpg,.jpeg,.png,.webp,.pdf" onChange={(event) => setFile(event.target.files?.[0] || null)} required /></label>
            <button className="quick-action primary" disabled={busy}>Add Document</button>
          </form>
          <ul className="service-document-list">{records.map((document) => (
            <li key={document.id}>
              <div><a href={document.url} target="_blank" rel="noreferrer" download={document.fileName}>{document.fileName}</a><span>{document.studentName}</span></div>
              <button className="service-link danger" onClick={() => deleteDocument(document.id)}>Delete</button>
            </li>
          ))}</ul>
          {!records.length && <p className="service-empty">No documents added yet.</p>}
        </>
      );
    }

    if (page === "notifications") {
      return (
        <>
          <form className="service-form service-form--stacked" onSubmit={sendNotification}>
            <label className="service-field"><span>Title</span><input value={notificationTitle} onChange={(event) => setNotificationTitle(event.target.value)} maxLength="120" required /></label>
            <label className="service-field"><span>Message</span><textarea value={notificationMessage} onChange={(event) => setNotificationMessage(event.target.value)} maxLength="2000" rows="3" required /></label>
            <label className="service-check"><input type="checkbox" checked={notifyAll} onChange={(event) => setNotifyAll(event.target.checked)} /> Send to all students</label>
            {!notifyAll && renderStudentPicker()}
            <button className="quick-action primary" disabled={busy}>Send Notification</button>
          </form>
          <ul className="service-notifications">{records.map((notification) => (
            <li key={notification.id} className={notification.readAt ? "read" : ""}>
              <div><strong>{notification.title}</strong><p>{notification.message}</p><small>{notification.studentName} · {new Date(notification.createdAt).toLocaleString()}</small></div>
              {!notification.readAt && <button className="service-link" onClick={() => markRead(notification.id)}>Mark read</button>}
            </li>
          ))}</ul>
          {!records.length && <p className="service-empty">No notifications to display.</p>}
        </>
      );
    }

    return (
      <div className="service-backup">
        <section>
          <h2>Download backup</h2>
          <p>Downloads the student, attendance, fee, document, and notification data currently held in this browser session.</p>
          <button type="button" className="quick-action primary" disabled={busy} onClick={downloadBackup}>Download JSON Backup</button>
          <p className="service-warning">The JSON file can contain personal details and uploaded documents. Store it privately.</p>
        </section>
        <section>
          <h2>Restore backup</h2>
          <p>Restore replaces the data currently held in this browser session. Data is not saved to a database.</p>
          <form className="service-form service-form--stacked" onSubmit={restoreBackup}>
            <label className="service-field"><span>Backup JSON file</span><input type="file" accept="application/json,.json" onChange={(event) => setRestoreFile(event.target.files?.[0] || null)} required /></label>
            <label className="service-field"><span>Type RESTORE ALL DATA to confirm</span><input value={confirmation} onChange={(event) => setConfirmation(event.target.value)} required /></label>
            <button type="submit" className="quick-action danger" disabled={busy}>Replace Session Data</button>
          </form>
        </section>
      </div>
    );
  }

  return (
    <div className="student-services-page">
      <Navbar onNavigate={onNavigate} user={user} notifications={notifications} />
      <div className="dashboard-layout">
        <Sidebar activePage={page} onNavigate={onNavigate} role={user?.role} />
        <main className="dashboard-content">
          <header className="service-heading"><p className="welcome-small">STUDENT PORTAL</p><h1>{title}</h1><p>{description}</p></header>
          {error && <p className="service-message error" role="alert">{error}</p>}
          {feedback && <p className="service-message success" role="status">{feedback}</p>}
          {renderContent()}
        </main>
      </div>
      <Footer />
    </div>
  );
}

export default StudentServices;
