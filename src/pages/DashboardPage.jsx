import React, { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Container, Typography, Button, Grid } from "@mui/material";
import "./DashboardPage.css";

const DashboardPage = () => {
  const { user, logout } = useContext(AuthContext); // Obtenemos el contexto de autenticación
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/"); // Redirigimos al login después del logout
  };

  return (
    <Container className="container">
      <Typography variant="h4" gutterBottom>
        Bienvenido al Dashboard, {user ? "Usuario" : "Invitado"}!
      </Typography>

      <Typography variant="body1" paragraph>
        Este es tu panel principal donde puedes gestionar tus recetas,
        ingredientes, y más.
      </Typography>

      {/* Sección de botones o enlaces para navegar por las diferentes secciones */}
      <Grid
        container
        spacing={2}
        justifyContent="center"
        className="grid-buttons"
      >
        <Grid item>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate("/create-recipe")}
          >
            Crear Nueva Receta
          </Button>
        </Grid>
        <Grid item>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => navigate("/manage-inventory")}
          >
            Gestionar Inventario
          </Button>
        </Grid>
        <Grid item>
          <Button
            variant="contained"
            color="success"
            onClick={() => navigate("/recipe-detail")}
          >
            Ver Recetas
          </Button>
        </Grid>
        
      </Grid>

      {/* Botón de cerrar sesión */}
      <Grid container justifyContent="flex-end" style={{ marginTop: "20px" }}>
        <Grid item>
          <Button variant="outlined" color="error" onClick={handleLogout}>
            Cerrar Sesión
          </Button>
        </Grid>
      </Grid>
    </Container>
  );
};

export default DashboardPage;
