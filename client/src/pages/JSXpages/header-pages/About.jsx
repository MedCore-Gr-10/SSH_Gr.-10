import "../../CSSpages/header-pages/About.css";
import { LuUsers, LuBuilding2, LuEye } from "react-icons/lu";
import { FaLaptopCode } from "react-icons/fa6";


export default function About() {
  return (
    <main className="hms-about-container">
      {/* Hero Section */}
      <section className="hms-about-hero">
        <article className="hms-about-hero-text">
          <span className="hms-about-badge">OUR MISSION</span>
          <h1 className="hms-about-title">ABOUT MEDCORE</h1>
          <h2 className="hms-about-subtitle">
            Bridging the gap between global medical networks, clinical teams, and patients.
          </h2>
          <h3 className="hms-about-description">
            MedCore is a comprehensive healthcare ecosystem engineered to streamline clinical operations,
            simplify multi-tenant scheduling, and make healthcare architecture transparently accessible.
            By building the digital backbone for modern medical facilities, we ensure lower administrative
            overhead and premium patient coordination.
          </h3>
        </article>
      </section>


      {/* Visual Divider Line */}
      <hr className="hms-about-divider" />


      {/* Core Objectives Section */}
      <section className="hms-about-stats">
        <article className="hms-about-stat-card">
          <h2 className="hms-about-stat-number">Stress-Free</h2>
          <h3 className="hms-about-stat-label">Appointment Workflows</h3>
        </article>
        <article className="hms-about-stat-card">
          <h2 className="hms-about-stat-number">Centralized</h2>
          <h3 className="hms-about-stat-label">Hospital Registries</h3>
        </article>
        <article className="hms-about-stat-card">
          <h2 className="hms-about-stat-number">Real-Time</h2>
          <h3 className="hms-about-stat-label">Provider Availability</h3>
        </article>
      </section>


      {/* Visual Divider Line */}
      <hr className="hms-about-divider" />


      {/* Services Grid */}
      <section className="hms-about-features">
        <header className="hms-about-features-header">
          <span className="hms-about-section-tag">TAILORED SOLUTIONS</span>
          <h2 className="hms-about-section-title">Fostering Connected Medical Communities</h2>
        </header>


        <section className="hms-about-grid">
          <article className="hms-about-card">
            {/* Replaced Emojis with Icon Components */}
            <header className="hms-about-card-icon">
              <LuUsers />
            </header>
            <h3 className="hms-about-card-title">For Patients</h3>
            <h4 className="hms-about-card-text">
              Easily browse through a curated database of top-tier hospitals and medical centers. Secure your spot by booking appointments with specialized health professionals in just a few seamless clicks.
            </h4>
          </article>


          <article className="hms-about-card">
            <header className="hms-about-card-icon">
              <LuBuilding2 />
            </header>
            <h3 className="hms-about-card-title">For Hospitals</h3>
            <h4 className="hms-about-card-text">
              Manage operational templates, real-time shifts, department allocations, and patient records efficiently through our highly responsive, multi-tenant administrative dashboards.
            </h4>
          </article>


          <article className="hms-about-card">
            <header className="hms-about-card-icon">
              <LuEye />
            </header>
            <h3 className="hms-about-card-title">Our Vision</h3>
            <h4 className="hms-about-card-text">
              To operate as the premier global standard in health-tech delivery, creating an optimized, secure, and completely transparent platform for medical personnel and the communities they serve.
            </h4>
          </article>
        </section>
      </section>


      {/* Visual Divider Line */}
      <hr className="hms-about-divider" />


      {/* Developer Team Section */}
      <section className="hms-about-team">
        <header className="hms-about-features-header">
          <span className="hms-about-section-tag">THE BRAINS BEHIND MEDCORE</span>
          <h2 className="hms-about-section-title">Meet Our Engineering Team</h2>
        </header>


        <section className="hms-about-team-grid">
          {/* Member 1 */}
          <article className="hms-about-team-card">
            <header className="hms-about-avatar">
              <FaLaptopCode />
            </header>
            <h3 className="hms-about-member-name">Albison Bekaj</h3>
            <h4 className="hms-about-member-role">Full Stack Engineer</h4>
          </article>


          {/* Member 2 */}
          <article className="hms-about-team-card">
            <header className="hms-about-avatar">
              <FaLaptopCode />
            </header>
            <h3 className="hms-about-member-name">Ali Shoshi</h3>
            <h4 className="hms-about-member-role">Full Stack Engineer</h4>
          </article>


          {/* Member 3 */}
          <article className="hms-about-team-card">
            <header className="hms-about-avatar">
              <FaLaptopCode />
            </header>
            <h3 className="hms-about-member-name">Olsa Domi</h3>
            <h4 className="hms-about-member-role">Full Stack Engineer</h4>
          </article>


          {/* Member 4 */}
          <article className="hms-about-team-card">
            <header className="hms-about-avatar">
              <FaLaptopCode />
            </header>
            <h3 className="hms-about-member-name">Rreze Ejupi</h3>
            <h4 className="hms-about-member-role">Full Stack Engineer</h4>
          </article>


          {/* Member 5 */}
          <article className="hms-about-team-card">
            <header className="hms-about-avatar">
              <FaLaptopCode />
            </header>
            <h3 className="hms-about-member-name">Valmir Mustafa</h3>
            <h4 className="hms-about-member-role">Full Stack Engineer</h4>
          </article>
        </section>
      </section>
    </main>
  );
}
