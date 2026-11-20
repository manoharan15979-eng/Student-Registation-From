
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import StatCard from "../components/StatCard";
import Footer from "../components/Footer";

function Dashboard({ students = [], user, onNavigate, notifications = [] }) {
  const totalStudents = students.length;

  const activeStudents = students.filter(
    (student) => student.status === "Active"
  ).length;

  const inactiveStudents = totalStudents - activeStudents;
  const recentStudents = [...students]
    .sort(
      (first, second) =>
        (Date.parse(second.registeredAt || "") || 0) -
        (Date.parse(first.registeredAt || "") || 0)
    )
    .slice(0, 5);

  const departments = Object.entries(
    students.reduce((counts, student) => {
      const department = student.department || "Unassigned";
      counts[department] = (counts[department] || 0) + 1;
      return counts;
    }, {})
  ).sort((first, second) => second[1] - first[1]);

  const now = new Date();
  const monthlyRegistrations = Array.from({ length: 6 }, (_, index) => {
    const month = new Date(now.getFullYear(), now.getMonth() - 5 + index, 1);
    const count = students.filter((student) => {
      const registrationDate = new Date(student.registeredAt || "");
      return (
        !Number.isNaN(registrationDate.getTime()) &&
        registrationDate.getFullYear() === month.getFullYear() &&
        registrationDate.getMonth() === month.getMonth()
      );
    }).length;

    return {
      label: month.toLocaleDateString(undefined, { month: "short" }),
      monthLabel: month.toLocaleDateString(undefined, {
        month: "long",
        year: "numeric",
      }),
      count,
    };
  });
  const maxMonthlyRegistrations = Math.max(
    1,
    ...monthlyRegistrations.map((month) => month.count)
  );

  return (
    <div className="dashboard-page">
      <Navbar onNavigate={onNavigate} user={user} notifications={notifications} />

      <div className="dashboard-layout">
        <Sidebar activePage="dashboard" onNavigate={onNavigate} role={user?.role} />

        <main className="dashboard-content">
          <section className="welcome-section">
            <div>
              <p className="welcome-small">STUDENT MANAGEMENT SYSTEM</p>
              <h1>Welcome to Dashboard 👋</h1>
              <p>Manage your students and registrations in one place.</p>
            </div>
            <div className="welcome-icon" aria-hidden="true">🎓</div>
          </section>

          <h2 className="section-heading">Overview</h2>

          <div className="stats-container">
            <StatCard
              title="Total Students"
              value={totalStudents}
              icon="users"
            />

            <StatCard
              title="Active Students"
              value={activeStudents}
              icon="active"
            />

            <StatCard
              title="Inactive Students"
              value={inactiveStudents}
              icon="inactive"
            />
          </div>

          <div className="dashboard-insights">
            <section className="insight-card department-section">
              <div className="insight-heading">
                <div>
                  <h2>Students by Department</h2>
                  <p>Enrollment distribution across departments</p>
                </div>
                <span className="insight-icon" aria-hidden="true">▤</span>
              </div>

              {departments.length ? (
                <ul className="department-list">
                  {departments.map(([department, count]) => (
                    <li key={department}>
                      <div className="department-label">
                        <span>{department}</span>
                        <strong>{count}</strong>
                      </div>
                      <div
                        className="department-track"
                        role="progressbar"
                        aria-label={`${department} student count`}
                        aria-valuemin="0"
                        aria-valuemax={totalStudents}
                        aria-valuenow={count}
                      >
                        <span
                          style={{
                            width: `${(count / totalStudents) * 100}%`,
                          }}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="empty-students">No department data available.</p>
              )}
            </section>

            <section className="insight-card monthly-section">
              <div className="insight-heading">
                <div>
                  <h2>Monthly Registrations</h2>
                  <p>New student registrations over the last six months</p>
                </div>
                <span className="insight-icon" aria-hidden="true">▥</span>
              </div>

              <div
                className="monthly-chart"
                role="img"
                aria-label={`Monthly registrations: ${monthlyRegistrations
                  .map((month) => `${month.monthLabel}: ${month.count}`)
                  .join(", ")}`}
              >
                {monthlyRegistrations.map((month) => (
                  <div className="chart-column" key={month.monthLabel}>
                    <span className="chart-value">{month.count || ""}</span>
                    <div className="chart-bar-area">
                      <span
                        className={`chart-bar ${month.count ? "" : "empty"}`}
                        style={{
                          height: month.count
                            ? `${Math.max(
                                (month.count / maxMonthlyRegistrations) * 100,
                                8
                              )}%`
                            : "4px",
                        }}
                      />
                    </div>
                    <span className="chart-month">{month.label}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <section className="quick-actions">
            <div>
              <h2>{user?.role === "admin" ? "Quick Actions" : "Student Services"}</h2>
              <p>{user?.role === "admin" ? "Common tasks for student administration" : "View your profile and student records"}</p>
            </div>
            <div className="quick-action-buttons">
              {user?.role === "admin" ? (
                <>
                  <button
                    type="button"
                    className="quick-action primary"
                    onClick={() => onNavigate?.("register")}
                  >
                    <span aria-hidden="true">＋</span> Register Student
                  </button>
                  <button
                    type="button"
                    className="quick-action secondary"
                    onClick={() => onNavigate?.("students")}
                  >
                    <span aria-hidden="true">▤</span> View All Students
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  className="quick-action primary"
                  onClick={() => onNavigate?.("profile")}
                >
                  <span aria-hidden="true">◉</span> View My Profile
                </button>
              )}
            </div>
          </section>

          <section className="recent-section">
            <div className="recent-heading">
              <div>
                <h2>Recent Students</h2>
                <p>Recently registered student details</p>
              </div>
              <span className="student-count">
                {totalStudents} {totalStudents === 1 ? "Student" : "Students"}
              </span>
            </div>

            {recentStudents.length > 0 ? (
              <div className="recent-table">
                <table>
                  <thead>
                    <tr>
                      <th>Register No</th>
                      <th>Student Name</th>
                      <th>Department</th>
                      <th>Year</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentStudents.map((student) => (
                      <tr key={student.id}>
                        <td>{student.registerNo}</td>
                        <td>{student.name}</td>
                        <td>{student.department}</td>
                        <td>{student.year}</td>
                        <td>
                          <span className={
                            student.status === "Active"
                              ? "status-active"
                              : "status-inactive"
                          }>
                            {student.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="empty-students">No students registered yet.</p>
            )}
          </section>
        </main>
      </div>

      <Footer />
    </div>
  );
}

export default Dashboard;
