  import React, { useState } from 'react';
  import './Sidebar.css';
  import SidebarButton from '../JSXcomponents/SidebarButton.jsx'; 
  const Sidebar = () => {
    return (
      <div className="fixed-sidebar">
        <img src="../../../../public/LOGO_final.png" alt="Logo" className='sidebar-logo' />
        <nav>
          <ul>
            <li><SidebarButton label="Dashboard" onClick={() => console.log("Dashboard clicked")} /></li>
            <li><SidebarButton label="Settings" onClick={() => console.log("Settings clicked")} /></li>
            <li><SidebarButton label="etc" onClick={() => console.log("etc clicked")} /></li>
          </ul>
        </nav>

      </div>
    );
  }

  export default Sidebar;