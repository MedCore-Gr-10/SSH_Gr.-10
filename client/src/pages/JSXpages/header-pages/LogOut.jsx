import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/authContext.jsx";

export default function LogOut() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    logout();
    navigate("/", { replace: true });
  }, [logout, navigate]);

  return <p>Signing out…</p>;
}
