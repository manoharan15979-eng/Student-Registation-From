import { useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";

function Reports({ students, onNavigate, user, notifications = [] }) {
  const [feedback, setFeedback] = useState(null);
  const totalStudents = students.length;
  const activeStudents = students.filter((student) => student.status === "Active").length;
  const inactiveStudents = students.filter((student) => student.status === "Inactive").length;
  const currentDate = new Date();

  const departmentStats = Object.entries(
    students.reduce((counts, student) => {
      const department = student.department || "Unassigned";
      if (!counts[department]) counts[department] = { total: 0, active: 0, inactive: 0 };
      counts[department].total += 1;
      if (student.status === "Active") counts[department].active += 1;
      if (student.status === "Inactive") counts[department].inactive += 1;
      return counts;
    }, {})
  )
    .map(([department, counts]) => ({ department, ...counts }))
    .sort((first, second) => second.total - first.total);

  const yearStats = Object.entries(
    students.reduce((counts, student) => {
      const year = student.year || "Unassigned";
      if (!counts[year]) counts[year] = { total: 0, active: 0, inactive: 0 };
      counts[year].total += 1;
      if (student.status === "Active") counts[year].active += 1;
      if (student.status === "Inactive") counts[year].inactive += 1;
      return counts;
    }, {})
  )
    .map(([year, counts]) => ({ year, ...counts }))
    .sort((first, second) => first.year.localeCompare(second.year));

  const monthlyStats = Array.from({ length: 6 }, (_, index) => {
    const month = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() - 5 + index,
      1
    );
    const count = students.filter((student) => {
      const registrationDate = new Date(student.registeredAt || "");
      return (
        !Number.isNaN(registrationDate.getTime()) &&
        registrationDate.getFullYear() === month.getFullYear() &&
        registrationDate.getMonth() === month.getMonth()
      );
    }).length;

    return {
      month: month.toLocaleDateString(undefined, { month: "short", year: "numeric" }),
      count,
    };
  });

  const thisMonthCount = monthlyStats[monthlyStats.length - 1].count;
  const sixMonthCount = monthlyStats.reduce((sum, month) => sum + month.count, 0);
  const statusStats = [
    { status: "Active", count: activeStudents },
    { status: "Inactive", count: inactiveStudents },
  ];

  function showExportError(format, error) {
    const reason = error instanceof Error ? error.message : "Unknown export error";
    console.error(`${format} report export failed:`, error);
    setFeedback({ type: "error", text: `${format} export failed: ${reason}` });
  }

  async function exportExcel() {
    try {
      const { default: ExcelJS } = await import("exceljs");
      const workbook = new ExcelJS.Workbook();
      workbook.creator = "Student Portal";
      workbook.created = new Date();

      function addWorksheet(name, headers, rows) {
        const worksheet = workbook.addWorksheet(name);
        worksheet.addRow(headers);
        rows.forEach((row) => worksheet.addRow(row));
        worksheet.views = [{ state: "frozen", ySplit: 1 }];
        worksheet.autoFilter = {
          from: { row: 1, column: 1 },
          to: { row: 1, column: headers.length },
        };
        worksheet.getRow(1).height = 24;
        worksheet.getRow(1).eachCell((cell) => {
          cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FF6D28D9" },
          };
        });
        worksheet.columns = headers.map((header) => ({
          width: Math.max(16, Math.min(32, String(header).length + 8)),
        }));
        return worksheet;
      }

      addWorksheet("Summary", ["Metric", "Value"], [
        ["Total students", totalStudents],
        ["Active students", activeStudents],
        ["Inactive students", inactiveStudents],
        ["Registrations this month", thisMonthCount],
        ["Registrations in last six months", sixMonthCount],
      ]);

      addWorksheet(
        "Departments",
        ["Department", "Total students", "Active", "Inactive"],
        departmentStats.map((item) => [
          item.department,
          item.total,
          item.active,
          item.inactive,
        ])
      );

      addWorksheet(
        "Academic years",
        ["Academic year", "Total students", "Active", "Inactive"],
        yearStats.map((item) => [item.year, item.total, item.active, item.inactive])
      );

      addWorksheet(
        "Status",
        ["Status", "Students", "Share"],
        statusStats.map((item) => [
          item.status,
          item.count,
          totalStudents ? `${((item.count / totalStudents) * 100).toFixed(1)}%` : "0%",
        ])
      );

      addWorksheet(
        "Monthly registrations",
        ["Month", "New registrations"],
        monthlyStats.map((item) => [item.month, item.count])
      );

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = "student-reports.xlsx";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 0);
      setFeedback({ type: "success", text: "Excel report downloaded." });
    } catch (error) {
      showExportError("Excel", error);
    }
  }

  async function exportPdf() {
    try {
      const { jsPDF } = await import("jspdf");
      const document = new jsPDF({ orientation: "landscape" });
      const margin = 14;
      const pageWidth = document.internal.pageSize.getWidth();
      const pageHeight = document.internal.pageSize.getHeight();
      const tableWidth = pageWidth - margin * 2;
      let y = 18;

      document.setTextColor(30, 27, 75);
      document.setFontSize(20);
      document.text("Student Reports & Analytics", margin, y);
      y += 8;
      document.setTextColor(100, 116, 139);
      document.setFontSize(9);
      document.text(`Generated ${new Date().toLocaleString()}`, margin, y);
      y += 10;

      function addTable(title, headers, rows) {
        const columnWidth = tableWidth / headers.length;
        const headerHeight = 9;

        if (y + 22 > pageHeight - margin) {
          document.addPage();
          y = margin;
        }

        document.setTextColor(76, 29, 149);
        document.setFontSize(13);
        document.text(title, margin, y);
        y += 5;

        function drawHeader() {
          document.setFillColor(109, 40, 217);
          document.rect(margin, y, tableWidth, headerHeight, "F");
          document.setTextColor(255, 255, 255);
          document.setFontSize(8);
          headers.forEach((header, index) => {
            document.text(
              String(header),
              margin + index * columnWidth + 2,
              y + 6
            );
          });
          y += headerHeight;
        }

        drawHeader();

        rows.forEach((row, rowIndex) => {
          const cellLines = row.map((value) =>
            document.splitTextToSize(String(value ?? ""), columnWidth - 4)
          );
          const rowHeight = Math.max(
            8,
            ...cellLines.map((lines) => lines.length * 4 + 3)
          );

          if (y + rowHeight > pageHeight - margin) {
            document.addPage();
            y = margin;
            drawHeader();
          }

          document.setFillColor(
            ...(rowIndex % 2 === 0 ? [250, 248, 255] : [255, 255, 255])
          );
          document.rect(margin, y, tableWidth, rowHeight, "F");
          document.setTextColor(51, 65, 85);
          document.setFontSize(8);
          cellLines.forEach((lines, index) => {
            document.text(lines, margin + index * columnWidth + 2, y + 5);
          });
          y += rowHeight;
        });

        y += 9;
      }

      addTable("Registration summary", ["Metric", "Value"], [
        ["Total students", totalStudents],
        ["Active students", activeStudents],
        ["Inactive students", inactiveStudents],
        ["Registrations this month", thisMonthCount],
        ["Registrations in last six months", sixMonthCount],
      ]);
      addTable(
        "Department-wise report",
        ["Department", "Total students", "Active", "Inactive"],
        departmentStats.map((item) => [
          item.department,
          item.total,
          item.active,
          item.inactive,
        ])
      );
      addTable(
        "Academic year report",
        ["Academic year", "Total students", "Active", "Inactive"],
        yearStats.map((item) => [item.year, item.total, item.active, item.inactive])
      );
      addTable(
        "Monthly registrations",
        ["Month", "New registrations"],
        monthlyStats.map((item) => [item.month, item.count])
      );
      document.save("student-reports.pdf");
      setFeedback({ type: "success", text: "PDF report downloaded." });
    } catch (error) {
      showExportError("PDF", error);
    }
  }

  return (
    <div>
      <Navbar onNavigate={onNavigate} user={user} notifications={notifications} />
      <div className="dashboard-layout">
        <Sidebar activePage="reports" onNavigate={onNavigate} role={user?.role} />
        <main className="dashboard-content reports-page">
          <div className="reports-page-heading">
            <div>
              <p className="welcome-small">STUDENT MANAGEMENT</p>
              <h1>Reports &amp; Analytics</h1>
              <p>Review enrollment, status, and registration trends.</p>
            </div>
            <div className="report-export-actions">
              <button type="button" className="report-export secondary" onClick={exportExcel}>
                Export Excel
              </button>
              <button type="button" className="report-export primary" onClick={exportPdf}>
                Export PDF
              </button>
            </div>
          </div>

          {feedback && (
            <p className={`report-feedback report-feedback--${feedback.type}`} role="status">
              {feedback.text}
            </p>
          )}

          <section className="report-summary-grid" aria-label="Registration summary">
            <article className="report-summary-card">
              <span aria-hidden="true">♙</span>
              <div><p>Total Students</p><strong>{totalStudents}</strong></div>
            </article>
            <article className="report-summary-card">
              <span aria-hidden="true">✓</span>
              <div><p>Active Students</p><strong>{activeStudents}</strong></div>
            </article>
            <article className="report-summary-card">
              <span aria-hidden="true">Ⅱ</span>
              <div><p>Inactive Students</p><strong>{inactiveStudents}</strong></div>
            </article>
            <article className="report-summary-card">
              <span aria-hidden="true">↗</span>
              <div><p>Registered This Month</p><strong>{thisMonthCount}</strong></div>
            </article>
          </section>

          <div className="reports-grid">
            <section className="report-panel">
              <header>
                <h2>Department-wise Students</h2>
                <p>Enrollment and status by department</p>
              </header>
              <div className="report-table-wrap">
                <table className="report-table">
                  <thead>
                    <tr><th>Department</th><th>Total</th><th>Active</th><th>Inactive</th></tr>
                  </thead>
                  <tbody>
                    {departmentStats.length ? departmentStats.map((item) => (
                      <tr key={item.department}>
                        <td>{item.department}</td>
                        <td>{item.total}</td>
                        <td>{item.active}</td>
                        <td>{item.inactive}</td>
                      </tr>
                    )) : (
                      <tr><td colSpan="4">No department data available.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="report-panel">
              <header>
                <h2>Year-wise Students</h2>
                <p>Enrollment and status by academic year</p>
              </header>
              <div className="report-table-wrap">
                <table className="report-table">
                  <thead>
                    <tr><th>Academic Year</th><th>Total</th><th>Active</th><th>Inactive</th></tr>
                  </thead>
                  <tbody>
                    {yearStats.length ? yearStats.map((item) => (
                      <tr key={item.year}>
                        <td>{item.year}</td>
                        <td>{item.total}</td>
                        <td>{item.active}</td>
                        <td>{item.inactive}</td>
                      </tr>
                    )) : (
                      <tr><td colSpan="4">No academic year data available.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="report-panel status-report">
              <header>
                <h2>Registration Status</h2>
                <p>Current active and inactive student records</p>
              </header>
              {statusStats.map((item) => (
                <div className="status-report-row" key={item.status}>
                  <span className={`status-dot ${item.status.toLowerCase()}`} />
                  <span>{item.status}</span>
                  <strong>{item.count}</strong>
                  <small>
                    {totalStudents
                      ? `${((item.count / totalStudents) * 100).toFixed(1)}%`
                      : "0%"}
                  </small>
                </div>
              ))}
            </section>

            <section className="report-panel monthly-report">
              <header>
                <h2>Registration Statistics</h2>
                <p>New registrations during the last six months</p>
              </header>
              <div className="report-month-list">
                {monthlyStats.map((month) => (
                  <div className="report-month-row" key={month.month}>
                    <span>{month.month}</span>
                    <div className="report-month-track">
                      <span
                        style={{
                          width: `${sixMonthCount
                            ? (month.count / Math.max(...monthlyStats.map((item) => item.count), 1)) * 100
                            : 0}%`,
                        }}
                      />
                    </div>
                    <strong>{month.count}</strong>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}

export default Reports;
