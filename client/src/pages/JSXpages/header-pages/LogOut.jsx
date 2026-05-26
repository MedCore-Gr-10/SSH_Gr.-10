import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function LogOut() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/main/home", { replace: true });
  }, [navigate]);

  return null;
}
