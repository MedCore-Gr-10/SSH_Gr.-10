function SidebarMainListOfButtons() {
  return (
    <ul>
      <li><SidebarButton label="Home" onClick={() => console.log("Home clicked")} /></li>
      <li><SidebarButton label="Settings" onClick={() => console.log("Settings clicked")} /></li>
      <li><SidebarButton label="Logout" onClick={() => console.log("Logout clicked")} /></li>
    </ul>
  );
}

export default SidebarMainListOfButtons;