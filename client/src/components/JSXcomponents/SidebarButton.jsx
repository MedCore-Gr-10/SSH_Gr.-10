import React from 'react';
import '../CSScomponents/SidebarButton.css';

function SidebarButton({ label }) {
  return (
    <div className="sidebar-button">
      {label}
    </div>
  );
}

export default SidebarButton;