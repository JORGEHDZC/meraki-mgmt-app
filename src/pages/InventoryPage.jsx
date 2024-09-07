// src/pages/InventoryPage.jsx

import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Button,
  TextField,
  Snackbar,
  Alert,
} from "@mui/material";
import { AddCircle, ArrowForward, ArrowBack } from "@mui/icons-material";
import { useNavigate } from "react-router-dom"; // Importar useNavigate

// Función para normalizar los nombres de ingredientes
const normalizeIngredient = (ingredient) => {
  return ingredient
    .toLowerCase()
    .normalize("NFD") // Normaliza los caracteres acentuados
    .replace(/[\u0300-\u036f]/g, "") // Elimina los acentos
    .trim(); // Elimina espacios adicionales
};

const InventoryPage = () => {
  const [ingredients, setIngredients] = useState([]);
  const [newIngredient, setNewIngredient] = useState("");
  const [inputColor, setInputColor] = useState("");
  const [isIngredientNew, setIsIngredientNew] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const navigate = useNavigate(); // Inicializar useNavigate

  // Cargar ingredientes desde localStorage al montar el componente
  useEffect(() => {
    const savedIngredients =
      JSON.parse(localStorage.getItem("ingredients")) || [];
    setIngredients(savedIngredients);
  }, []);

  // Guardar ingredientes en localStorage
  const saveIngredientsToLocalStorage = (newIngredients) => {
    localStorage.setItem("ingredients", JSON.stringify(newIngredients));
    setIngredients(newIngredients);
  };

  // Función para manejar el cambio en el input y verificar si el ingrediente existe
  const handleInputChange = (e) => {
    const value = e.target.value;
    setNewIngredient(value);

    const savedIngredients =
      JSON.parse(localStorage.getItem("ingredients")) || [];

    // Normalizar el nuevo ingrediente
    const normalizedNewIngredient = normalizeIngredient(value);

    // Verificar si el ingrediente ya existe en localStorage (búsqueda parcial)
    const ingredientExists = savedIngredients.some((ingredient) =>
      normalizeIngredient(ingredient).includes(normalizedNewIngredient)
    );

    if (ingredientExists) {
      // Si existe, cambiar el color a rojo y deshabilitar el botón
      setInputColor("red");
      setIsIngredientNew(false);
    } else {
      // Si no existe, cambiar el color a verde y habilitar el botón
      setInputColor("green");
      setIsIngredientNew(true);
    }
  };

  // Función para agregar un nuevo ingrediente
  const addIngredient = () => {
    if (isIngredientNew && newIngredient.trim()) {
      const updatedIngredients = [...ingredients, newIngredient.trim()];
      saveIngredientsToLocalStorage(updatedIngredients);
      setNewIngredient(""); // Limpiar el input
      setInputColor(""); // Restablecer el color del input
      setIsIngredientNew(false); // Deshabilitar el botón después de guardar
      setSnackbarMessage(`${newIngredient.trim()} fue ingresado correctamente`);
      setSnackbarOpen(true);
    } else if (!isIngredientNew && newIngredient.trim()) {
      setSnackbarMessage(`${newIngredient.trim()} ya existe`);
      setSnackbarOpen(true);
    }
  };

  // Función para manejar el evento de tecla Enter
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      addIngredient();
    }
  };

  // Función para cerrar el Snackbar
  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Gestión de Inventario
      </Typography>

      {/* Input para nuevo ingrediente */}
      <TextField
        label="Nuevo Ingrediente"
        variant="outlined"
        fullWidth
        margin="normal"
        value={newIngredient}
        onChange={handleInputChange}
        onKeyPress={handleKeyPress} // Añadir manejador de tecla Enter
        style={{ borderColor: inputColor, color: inputColor }} // Cambia el color del borde y el texto según el estado
        inputProps={{
          style: {
            color: inputColor,
          },
        }}
      />

      {/* Botón para agregar ingrediente */}
      <Button
        onClick={addIngredient}
        variant="contained"
        color="primary"
        startIcon={<AddCircle />}
        disabled={!isIngredientNew} // Deshabilitar si el ingrediente ya existe
      >
        Guardar Ingrediente
      </Button>

      {/* Botón para ir a la página de gestión */}
      <Button
        onClick={() => navigate("/manage-inventory")}
        variant="contained"
        color="secondary"
        startIcon={<ArrowForward />}
        style={{ marginTop: "20px" }}
      >
        Ir a Gestionar Inventario
      </Button>

      {/* Botón para regresar al Dashboard */}
      <Button
        onClick={() => navigate("/dashboard")}
        variant="outlined"
        color="default"
        startIcon={<ArrowBack />}
        style={{ marginTop: "20px" }}
      >
        Regresar al Dashboard
      </Button>

      {/* Snackbar para mostrar mensajes */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert onClose={handleSnackbarClose} severity="info">
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default InventoryPage;
