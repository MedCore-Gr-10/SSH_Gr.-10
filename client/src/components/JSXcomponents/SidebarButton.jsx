import React from 'react';
import '../CSScomponents/SidebarButton.css';

function SidebarButton({ label, onClick }) {
  return (
    <button className="sidebar-button" onClick={onClick}>
      {label}
    </button>
  );
}

export default SidebarButton;