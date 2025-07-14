import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { ClipboardList, FilePenLine, LogOut } from "lucide-react";
import cupcakeIcon from "../assets/icons/cupcake.png";
import { Button } from "../components/ui/Button";

export default function Dashboard() {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  if (showSplash) {
    return (
      <div className="splash-screen">
        <img src={cupcakeIcon} alt="Cupcake" className="cupcake-icon" />
        <h1 className="splash-title">Meraki App</h1>
      </div>
    );
  }

  return (
    <div className="dashboard-content">
      <div className="card">
        <h1 className="card-title">¡Bienvenido, Merakier!</h1>
        <p
          className="card-description"
          style={{ textAlign: "center", marginBottom: "1.5em" }}
        >
          Gestiona tus recetas, ingredientes y crea dulces inolvidables 🍩
        </p>

        <div className="button-stack">
          <Button
            className="dashboard-button"
            onClick={() => navigate("/ingredients")}
          >
            <ClipboardList className="dashboard-icon" />
            <span>Lista de Ingredientes</span>
          </Button>

          <Button
            className="dashboard-button"
            onClick={() => navigate("/edit-recipes")}
          >
            <FilePenLine className="dashboard-icon" />
            <span>Recetas</span>
          </Button>

          <Button className="dashboard-button" onClick={handleLogout}>
            <LogOut className="dashboard-icon" />
            <span>Cerrar Sesión</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
