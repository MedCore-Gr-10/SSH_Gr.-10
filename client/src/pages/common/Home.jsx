import "./Home.css";
import { FaChartLine, FaShieldHalved, FaNetworkWired, FaChartPie } from "react-icons/fa6";


function Home() {
  return (
    <main className="hms-home-container">
      <section className="hms-home-hero">
        <article className="hms-home-hero-text">
          <span className="hms-home-badge">GLOBAL ENTERPRISE PLATFORM</span>
          <h1 className="hms-home-title">WELCOME TO MEDCORE</h1>
          <h2 className="hms-home-subtitle">
            The next generation of unified, multi-tenant clinical intelligence and hospital operations.
          </h2>
          <h3 className="hms-home-description">
            Connecting thousands of healthcare providers, administrative specialists, and patients across
            our secure network. MedCore delivers real-time data isolation, fully audited medical tracking,
            and automated scheduling workflows designed to maximize clinical efficiency and elevate patient care.
          </h3>
        </article>
      </section>

      <hr className="hms-home-divider" />


      <section className="hms-home-stats">
        <article className="hms-home-stat-card">
          <h2 className="hms-home-stat-number">99.99%</h2>
          <h3 className="hms-home-stat-label">System Uptime Reliability</h3>
        </article>
        <article className="hms-home-stat-card">
          <h2 className="hms-home-stat-number">150M+</h2>
          <h3 className="hms-home-stat-label">Secure Records Managed</h3>
        </article>
        <article className="hms-home-stat-card">
          <h2 className="hms-home-stat-number">450+</h2>
          <h3 className="hms-home-stat-label">Connected Hospitals & Clinics</h3>
        </article>
        <article className="hms-home-stat-card">
          <h2 className="hms-home-stat-number">&lt; 1.2s</h2>
          <h3 className="hms-home-stat-label">Average API Response Time</h3>
        </article>
      </section>


      <hr className="hms-home-divider" />


      <section className="hms-home-features">
        <header className="hms-home-features-header">
          <span className="hms-home-section-tag">WHY MEDICAL NETWORKS TRUST US</span>
          <h2 className="hms-home-section-title">Engineered for Modern Healthcare</h2>
        </header>


        <section className="hms-home-grid">
          <article className="hms-home-card">
            <header className="hms-home-card-icon"><FaChartLine /></header>
            <h3 className="hms-home-card-title">Unmatched Scale</h3>
            <h4 className="hms-home-card-text">
              Our advanced multi-tenant ledger processes millions of operations daily...
            </h4>
          </article>


          <article className="hms-home-card">
            <header className="hms-home-card-icon"><FaShieldHalved /></header>
            <h3 className="hms-home-card-title">Ironclad Data Security</h3>
            <h4 className="hms-home-card-text">
              With full on-premises network authorization algorithms...
            </h4>
          </article>


          <article className="hms-home-card">
            <header className="hms-home-card-icon"><FaNetworkWired /></header>
            <h3 className="hms-home-card-title">Unified Architecture</h3>
            <h4 className="hms-home-card-text">
              Bridging communication gaps between directors, nurses, doctors...
            </h4>
          </article>
        </section>
      </section>
    </main>
  );
}


export default Home;
