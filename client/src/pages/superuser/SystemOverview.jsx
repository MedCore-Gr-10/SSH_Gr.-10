import React, { useState, useEffect } from 'react';
import "./../CSSpages/superuser/SystemOverview.css"; 

export default function SystemOverview() {
  const [stats, setStats] = useState({
    // Widgeti i madh (Llogaritë dhe Rolet)
    totalUsers: 1240,
    activeUsers: 1020,
    inactiveUsers: 220,
    superusers: 5,
    directors: 12,
    doctors: 145,
    nurses: 280,
    patients: 408,
    insuredPatients: 315,
    uninsuredPatients: 93,

    // Widgetet poshtë (Infrastruktura, Angazhimi & Performanca)
    hospitals: 12,
    departments: 48,
    specialties: 32,
    appointments: 5420,
    hospitalRating: 4.7,
    totalRequests: 340, // SHTUAR: Numri total i kërkesave (p.sh. llogari të reja, transferte, etj.)
    totalRatings: 850   // SHTUAR: Sa vlerësime janë bërë në total nga pacientët
  });
  
  const [loading, setLoading] = useState(false);

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="header-left">
          <h2 className="page-title">System Overview</h2>
          <p className="page-subtitle">Real-time platform statistics and infrastructure metrics</p>
        </div>
      </div>

      {loading ? (
        <div className="page-loading">Loading system metrics...</div>
      ) : (
        <div className="dashboard-content">
          
          {/* =========================================================
              WIDGETI I MADH (CEPI NË CEP): USER & ROLE MANAGEMENT
             ========================================================= */}
          <div className="main-dashboard-widget">
            
            {/* RRESHTI I PARË: Totali dhe Statuset */}
            <div className="widget-row row-overview">
              <div className="main-user-count">
                <div className="big-icon">👥</div>
                <div className="count-details">
                  <span className="widget-label">All Users</span>
                  <h1 className="widget-big-value">{stats.totalUsers.toLocaleString()}</h1>
                </div>
              </div>
              
              <div className="status-subcounts">
                <div className="subcount-box status-active">
                  <span className="subcount-label">🟢 Active Users</span>
                  <h4 className="subcount-value">{stats.activeUsers.toLocaleString()}</h4>
                </div>
                <div className="subcount-box status-inactive">
                  <span className="subcount-label">🔴 Inactive Users</span>
                  <h4 className="subcount-value">{stats.inactiveUsers.toLocaleString()}</h4>
                </div>
              </div>
            </div>

            {/* RRESHTI I DYTË: Shpërndarja sipas roleve specifike */}
            <div className="widget-row row-roles">
              <h4 className="roles-section-title">User Roles Distribution</h4>
              <div className="roles-inner-grid">
                
                <div className="role-subcard role-superuser">
                  <span className="role-icon">⚡</span>
                  <span className="role-label">Superusers</span>
                  <h3 className="role-value">{stats.superusers}</h3>
                </div>

                <div className="role-subcard role-director">
                  <span className="role-icon">🔑</span>
                  <span className="role-label">Directors</span>
                  <h3 className="role-value">{stats.directors}</h3>
                </div>

                <div className="role-subcard role-doctor">
                  <span className="role-icon">🩺</span>
                  <span className="role-label">Doctors</span>
                  <h3 className="role-value">{stats.doctors}</h3>
                </div>

                <div className="role-subcard role-nurse">
                  <span className="role-icon">🧑‍⚕️</span>
                  <span className="role-label">Nurses</span>
                  <h3 className="role-value">{stats.nurses}</h3>
                </div>

                <div className="role-subcard role-patient patient-extended-card">
                  <div className="patient-main-info">
                    <span className="role-icon">🤕</span>
                    <span className="role-label">Patients</span>
                    <h3 className="role-value">{stats.patients.toLocaleString()}</h3>
                  </div>
                  
                  <div className="patient-insurance-split">
                    <div className="insurance-badge insured">
                      Insured: <strong>{stats.insuredPatients}</strong>
                    </div>
                    <div className="insurance-badge uninsured">
                      Uninsured: <strong>{stats.uninsuredPatients}</strong>
                    </div>
                  </div>
                </div>

              </div>
            </div>

          </div>

          {/* =========================================================
              WIDGETET POSHTË: METRIKAT E TJERA TË SISTEMIT
             ========================================================= */}
          <div className="infrastructure-grid">
            
            {/* Kartela: Appointments */}
            <div className="infra-card border-appointments">
              <div className="infra-icon icon-bg-appointments">📅</div>
              <div className="infra-info">
                <span className="infra-label">Total Appointments</span>
                <h3 className="infra-value">{stats.appointments.toLocaleString()}</h3>
              </div>
            </div>

            {/* Kartela e re: System Requests */}
            <div className="infra-card border-requests">
              <div className="infra-icon icon-bg-requests">📩</div>
              <div className="infra-info">
                <span className="infra-label">System Requests</span>
                <h3 className="infra-value">{stats.totalRequests.toLocaleString()}</h3>
              </div>
            </div>

            {/* Kartela: Avg Hospital Rating */}
            <div className="infra-card border-rating">
              <div className="infra-icon icon-bg-rating">⭐</div>
              <div className="infra-info">
                <span className="infra-label">Avg Hospital Rating</span>
                <h3 className="infra-value">
                  {stats.hospitalRating} <span className="rating-max">/ 5.0 ({stats.totalRatings})</span>
                </h3>
              </div>
            </div>

            {/* Kartela: Hospitals */}
            <div className="infra-card border-hospitals">
              <div className="infra-icon">🏥</div>
              <div className="infra-info">
                <span className="infra-label">Registered Hospitals</span>
                <h3 className="infra-value">{stats.hospitals}</h3>
              </div>
            </div>

            {/* Kartela: Departments */}
            <div className="infra-card border-departments">
              <div className="infra-icon">🗂️</div>
              <div className="infra-info">
                <span className="infra-label">Total Departments</span>
                <h3 className="infra-value">{stats.departments}</h3>
              </div>
            </div>

            {/* Kartela: Specialties */}
            <div className="infra-card border-specialties">
              <div className="infra-icon">📚</div>
              <div className="infra-info">
                <span className="infra-label">Medical Specialties</span>
                <h3 className="infra-value">{stats.specialties}</h3>
              </div>
            </div>

          </div>
          
        </div>
      )}
    </div>
  );
}