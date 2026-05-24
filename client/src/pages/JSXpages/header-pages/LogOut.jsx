import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

/** Legacy route — redirect; logout confirm is a header popup. */
export default function LogOut() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/main/home", { replace: true });
  }, [navigate]);

  return null;
}
