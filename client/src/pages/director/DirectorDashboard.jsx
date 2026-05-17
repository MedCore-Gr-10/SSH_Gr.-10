import React from "react";
import "./DirectorDashboard.css";

export default function DirectorDashboard() {
	return (
		<div className="director-dashboard">
			<div className="dd-header">
				<h1>Director Dashboard</h1>
				<p className="dd-sub">Overview of hospital metrics and recent activity</p>
			</div>

			<div className="dd-cards">
				<div className="dd-card">
					<h3>Total Staff</h3>
					<p className="dd-value">--</p>
				</div>
				<div className="dd-card">
					<h3>Total Patients</h3>
					<p className="dd-value">--</p>
				</div>
				<div className="dd-card">
					<h3>Upcoming Appointments</h3>
					<p className="dd-value">--</p>
				</div>
			</div>

			<section className="dd-section">
				<h2>Recent Activities</h2>
				<ul className="dd-activities">
					<li>No activities yet.</li>
				</ul>
			</section>
		</div>
	);
}
