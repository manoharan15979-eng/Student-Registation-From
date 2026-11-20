import "../styles/ProfileCard.css";

function ProfileCard({ student }) {
  if (!student) return null;

  const dateOfBirth = student.dateOfBirth || student.dob;
  const formattedDateOfBirth = dateOfBirth
    ? new Date(dateOfBirth).toLocaleDateString()
    : "Not provided";
  const registeredAt = student.registeredAt
    ? new Date(student.registeredAt).toLocaleDateString()
    : "Not provided";

  return (
    <article className="profile-card">
      <header className="profile-card-header">
        {student.photo ? (
          <img src={student.photo} alt={`${student.name}'s photograph`} />
        ) : (
          <span className="profile-photo-placeholder" aria-hidden="true">🎓</span>
        )}
        <div>
          <p className="welcome-small">STUDENT PROFILE</p>
          <h2>{student.name}</h2>
          <p className="profile-register-number">{student.registerNo}</p>
          <span className={
            student.status === "Active"
              ? "status-active"
              : "status-inactive"
          }>
            {student.status}
          </span>
        </div>
      </header>

      <div className="profile-information-grid">
        <section>
          <h3>Personal Information</h3>
          <dl>
            <div><dt>Date of birth</dt><dd>{formattedDateOfBirth}</dd></div>
            <div><dt>Gender</dt><dd>{student.gender || "Not provided"}</dd></div>
          </dl>
        </section>

        <section>
          <h3>Academic Information</h3>
          <dl>
            <div><dt>Department</dt><dd>{student.department || "Not provided"}</dd></div>
            <div><dt>Course</dt><dd>{student.course || "Not provided"}</dd></div>
            <div><dt>Academic year</dt><dd>{student.year || "Not provided"}</dd></div>
            <div><dt>Registration date</dt><dd>{registeredAt}</dd></div>
          </dl>
        </section>

        <section className="profile-contact-section">
          <h3>Contact Information</h3>
          <dl>
            <div>
              <dt>Email address</dt>
              <dd>
                {student.email
                  ? <a href={`mailto:${student.email}`}>{student.email}</a>
                  : "Not provided"}
              </dd>
            </div>
            <div>
              <dt>Phone number</dt>
              <dd>
                {student.phone
                  ? <a href={`tel:${student.phone}`}>{student.phone}</a>
                  : "Not provided"}
              </dd>
            </div>
            <div className="profile-address">
              <dt>Residential address</dt>
              <dd>{student.address || "Not provided"}</dd>
            </div>
          </dl>
        </section>
      </div>
    </article>
  );
}

export default ProfileCard;
