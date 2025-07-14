import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const navigate = useNavigate();

  const user = {
    name: "Jorge Pastelero",
    email: "jorge@pasteleria.com",
    avatar: "https://cdn-icons-png.flaticon.com/512/638/638136.png",
    recipes: 12,
    ingredients: 34,
    badge: "Maestro Pastelero",
  };

  const handleEdit = () => {
    alert("Función de edición aún no implementada 🍰");
  };

  const handleLogout = () => {
    navigate("/");
  };

  const handleBackToDashboard = () => {
    navigate("/dashboard");
  };

  return (
    <div className="dashboard-container">
      <div className="card profile-card">
        <img
          src={user.avatar}
          alt="Avatar del usuario"
          className="profile-avatar"
        />
        <h1 className="profile-name">{user.name}</h1>
        <p className="profile-email">{user.email}</p>
        <span className="profile-badge">{user.badge}</span>

        <div className="profile-stats">
          <div>🍰 Recetas: {user.recipes}</div>
          <div>🧂 Ingredientes: {user.ingredients}</div>
        </div>

        <div className="profile-actions">
          <button onClick={handleEdit}>Editar Perfil</button>
          <button onClick={handleLogout}>Cerrar Sesión</button>
        </div>

        {/* 🔙 Botón para regresar al dashboard */}
        <div style={{ marginTop: "1.5em" }}>
          <button onClick={handleBackToDashboard}>
            ← Regresar al Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
