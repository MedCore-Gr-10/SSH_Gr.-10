import React from 'react';
import './SidebarButton.css';

function SidebarButton({ label }) {
  return (
    <div className="sidebar-button">
      {label}
    </div>
  );
}

export default SidebarButton;
