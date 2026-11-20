
import "../styles/StudentCard.css";

function StudentCard({ student }) {
  return (
    <div className="student-card">
      <img
        src={student.photo || "/images/default.png"}
        alt={student.name}
      />

      <h3>{student.name}</h3>
      <p>Register No: {student.registerNo}</p>
      <p>Department: {student.department}</p>
      <span>{student.status}</span>
    </div>
  );
}

export default StudentCard;
