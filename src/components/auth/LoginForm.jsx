import { useState, useContext } from "react";
import { LockIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { AuthContext } from "./../../context/AuthContext";

export default function LoginForm() {
  const { login, authError } = useContext(AuthContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setFormError("Por favor, completa todos los campos.");
      return;
    }

    try {
      const success = await login(email, password);
      if (success) {
        setFormError(null);
        navigate("/dashboard");
      } else {
        setFormError("Credenciales incorrectas, por favor verifica.");
      }
    } catch (err) {
      setFormError(
        err instanceof Error
          ? err.message
          : "Ocurrió un error al iniciar sesión."
      );
    }
  };

  return (
    <div className="dashboard-container">
      <div className="login-background"></div>

      <div className="card" style={{ textAlign: "center" }}>
        <div
          style={{
            backgroundColor: "var(--secondary)",
            padding: "1em",
            borderRadius: "50%",
            display: "inline-block",
            marginBottom: "1em",
          }}
        >
          <LockIcon
            style={{ color: "var(--primary)", width: "32px", height: "32px" }}
          />
        </div>

        <h1 className="card-title">Iniciar Sesión</h1>

        {authError && (
          <p style={{ color: "red", marginBottom: "1em" }}>{authError}</p>
        )}

        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "1em" }}
        >
          <Input
            type="email"
            id="email"
            placeholder="Correo Electrónico"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            type="password"
            id="password"
            placeholder="Contraseña"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {formError && (
            <p style={{ color: "red", fontSize: "0.9em" }}>{formError}</p>
          )}

          <Button type="submit">Iniciar Sesión</Button>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "0.9em",
            }}
          >
            <Button variant="link" size="sm">
              ¿Olvidaste tu contraseña?
            </Button>
            <Button
              variant="link"
              size="sm"
              onClick={() => navigate("/register")}
            >
              Regístrate aquí
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
