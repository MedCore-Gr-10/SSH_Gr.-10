import React, { useState, useEffect } from 'react';
import "../../CSSpages/superuser/SystemOverview.css"; 

export default function SystemOverview() {
  const [stats, setStats] = useState({
    // Widgeti i parë i madh (Llogaritë dhe Rolet - Dinamike)
    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0,
    superusers: 0,
    directors: 0,
    doctors: 0,
    nurses: 0,
    patients: 0,

    hospitals: 0, 
    departments: 0,     
    specializations: 0,
    hospitalRating: 'Err',
    totalRatings: 'Err',
    appointments: 'Err',

    totalRequests: 'Err'
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Hook-u për të tërhequr të dhënat live nga kontrolluesi i ri i System Overview
  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Thirrja e rrugës së re të dedikuar në backend
        const response = await fetch('/api/system-overview'); 
        const result = await response.json();

        if (result.success) {
          setStats(prevStats => ({
            ...prevStats,
            totalUsers: result.data.totalUsers,
            activeUsers: result.data.activeUsers,
            inactiveUsers: result.data.inactiveUsers,
            superusers: result.data.superusers,
            directors: result.data.directors,
            doctors: result.data.doctors,
            nurses: result.data.nurses,
            patients: result.data.patients,
            hospitals: result.data.hospitals,
            departments: result.data.departments,          
            specializations: result.data.specializations,
            appointments: result.data.totalAppointments,
            //totalRequests: result.data.totalRequests
          }));
        } else {
          setError(result.error || "Nuk u mundësua ngarkimi i të dhënave.");
        }
      } catch (err) {
        console.error("Gabim gjatë fetch:", err);
        setError("Gabim në lidhje! Sigurohuni që backend-i është i ndezur.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  if (error) {
    return (
      <div className="page-container">
        <div style={{ color: '#e53e3e', backgroundColor: '#fff5f5', padding: '16px', borderRadius: '8px', border: '1px solid #fed7d7' }}>
          ⚠️ {error}
        </div>
      </div>
    );
  }

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
        <div className="system-overview-content">
          
          {/* =========================================================
              WIDGETI I MADH 1: USER & ROLE MANAGEMENT (Dinamik)
             ========================================================= */}
          <div className="main-dashboard-widget">
            
            {/* Rreshti 1: Totali dhe Statuset */}
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
                  <span className="subcount-label">🟢 Enabled Users</span>
                  <h4 className="subcount-value">{stats.activeUsers.toLocaleString()}</h4>
                </div>
                <div className="subcount-box status-inactive">
                  <span className="subcount-label">🔴 Disabled Users</span>
                  <h4 className="subcount-value">{stats.inactiveUsers.toLocaleString()}</h4>
                </div>
              </div>
            </div>

            {/* Rreshti 2: Shpërndarja sipas roleve (5 Kartela të Pastra) */}
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

                <div className="role-subcard role-patient">
                  <span className="role-icon">🤕</span>
                  <span className="role-label">Patients</span>
                  <h3 className="role-value">{stats.patients.toLocaleString()}</h3>
                </div>

              </div>
            </div>
          </div>

          {/* =========================================================
              WIDGETI I MADH 2: HOSPITAL & INFRASTRUCTURE MANAGEMENT
             ========================================================= */}
          <div className="main-dashboard-widget">
            
            {/* Rreshti 1: Hospitals kryesore */}
            <div className="widget-row row-overview">
              <div className="main-user-count">
                <div className="big-icon hospital-main-icon">🏥</div>
                <div className="count-details">
                  <span className="widget-label">Registered Hospitals</span>
                  <h1 className="widget-big-value">{stats.hospitals}</h1>
                </div>
              </div>
            </div>

            {/* Rreshti 2: Detajet e infrastrukturës (5 Kartela) */}
            <div className="widget-row row-roles">
              <h4 className="roles-section-title">Hospital Analytics & Core Structure</h4>
              <div className="roles-inner-grid">
                
                <div className="role-subcard infra-card-dept">
                  <span className="role-icon">🗂️</span>
                  <span className="role-label">Existing Departments</span>
                  <h3 className="role-value">{stats.departments}</h3>
                </div>

                <div className="role-subcard infra-card-spec">
                  <span className="role-icon">📚</span>
                  <span className="role-label">Existing Specialties</span>
                  <h3 className="role-value">{stats.specializations}</h3> {/* 🌟 Ndryshuar këtu në stats.specializations */}
                </div>

                <div className="role-subcard infra-card-appointments">
                  <span className="role-icon">📅</span>
                  <span className="role-label">Total Appointments Made</span>
                  <h3 className="role-value">{stats.appointments.toLocaleString()}</h3>
                </div>

              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}