import "../../CSSpages/header-pages/About.css";

export default function About() {
  return (
    <div className="about-container">
      <h3>MedCore</h3>
      <p>
         is a comprehensive healthcare management platform designed to 
        bridge the gap between patients and healthcare providers. Our mission is to 
        streamline the medical appointment process and make healthcare accessible to everyone.
      </p>

      <h3>Our Services</h3>
      <ul>
        <li>
          <strong>For Patients:</strong> Easily browse through a curated list of top-rated 
          hospitals and medical centers. Secure your spot by booking appointments with 
          specialists in just a few clicks.
        </li>
        <li>
          <strong>For Hospitals:</strong> Manage schedules, staff, and patient records 
          efficiently through our integrated dashboard.
        </li>
      </ul>

      <h3>Why MedCore?</h3>
      <p>
        We believe that scheduling a doctor's visit should be stress-free. By centralizing 
        hospital listings and real-time availability, MedCore ensures that you spend less 
        time waiting and more time receiving the care you deserve.
      </p>
      
      <h3>Our Vision</h3>
      <p>
        To become the digital backbone of the healthcare industry, fostering a 
        transparent and efficient environment for both medical professionals and the 
        communities they serve.
      </p>
    </div>
  );
}