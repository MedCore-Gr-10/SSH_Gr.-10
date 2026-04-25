import { Routes, Route, Outlet } from "react-router-dom";
import Header from "../../components/layout/Header.jsx";
import Sidebar from "../../components/layout/Sidebar.jsx";
import Home from "./Home.jsx";
import About from "./About.jsx";
import Contact from "./Contact.jsx";
import Login from "../auth/login.jsx";
import Register from "../auth/register.jsx";
import Dashboard from "../patient/Dashboard.jsx";
import "../CSSpages/App.css";

function MainLayout() {
  return (
    <div className="App">
      <div className="sidebar-container">
        <Sidebar />
      </div>
      <div className="content-header-container">
        <div className="header-container">
          <Header />
        </div>
        <div className="content-container">
          <div className="content">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/main" element={<MainLayout />}>
        <Route index element={<Home />} />
        <Route path="about" element={<About />} />
        <Route path="contact" element={<Contact />} />
        <Route path="dashboard" element={<Dashboard />} />
      </Route>
    </Routes>
  );
}
