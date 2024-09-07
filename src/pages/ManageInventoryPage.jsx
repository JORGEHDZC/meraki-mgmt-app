// src/pages/ManageInventoryPage.jsx

import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Button,
  TextField,
  Select,
  MenuItem,
  IconButton,
  List,
  ListItem,
  ListItemText,
  InputAdornment,
  Snackbar,
  Alert,
} from "@mui/material";
import { Edit, Delete, AddCircle, ArrowBack } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const normalizeIngredient = (ingredient) => {
  return ingredient
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
};

const ManageInventoryPage = () => {
  const [ingredients, setIngredients] = useState([]);
  const [currentIngredient, setCurrentIngredient] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("gramos");
  const [cost, setCost] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [ingredientToEdit, setIngredientToEdit] = useState("");
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const savedIngredients =
      JSON.parse(localStorage.getItem("ingredients")) || [];
    const savedQuantities =
      JSON.parse(localStorage.getItem("ingredientQuantities")) || {};
    const savedCosts =
      JSON.parse(localStorage.getItem("ingredientCosts")) || {};

    const ingredientsFromStorage = savedIngredients.map((ing) => ({
      name: ing,
      quantity: savedQuantities[normalizeIngredient(ing)] || "",
      cost: savedCosts[normalizeIngredient(ing)] || "",
    }));

    console.log("Loaded ingredients:", ingredientsFromStorage); // Debugging line
    setIngredients(ingredientsFromStorage);
  }, []);

  const saveDataToLocalStorage = () => {
    const savedQuantities = {};
    const savedCosts = {};
    ingredients.forEach((ingredient) => {
      const normalizedIngredient = normalizeIngredient(ingredient.name);
      if (ingredient.quantity) {
        savedQuantities[normalizedIngredient] = ingredient.quantity;
      }
      if (ingredient.cost) {
        savedCosts[normalizedIngredient] = ingredient.cost;
      }
    });
    localStorage.setItem(
      "ingredientQuantities",
      JSON.stringify(savedQuantities)
    );
    localStorage.setItem("ingredientCosts", JSON.stringify(savedCosts));
  };

  const handleIngredientChange = (e) => {
    setCurrentIngredient(e.target.value);
  };

  const handleQuantityChange = (e) => {
    setQuantity(e.target.value);
  };

  const handleUnitChange = (e) => {
    setUnit(e.target.value);
  };

  const handleCostChange = (e) => {
    setCost(e.target.value);
  };

  const handleSaveIngredient = () => {
    if (!currentIngredient.trim()) {
      setSnackbarMessage("El nombre del ingrediente no puede estar vacío");
      setSnackbarOpen(true);
      return;
    }

    if (
      !quantity ||
      isNaN(parseInt(quantity, 10)) ||
      parseInt(quantity, 10) <= 0
    ) {
      setSnackbarMessage("La cantidad debe ser un número entero positivo");
      setSnackbarOpen(true);
      return;
    }

    if (isNaN(parseFloat(cost)) || parseFloat(cost) < 0) {
      setSnackbarMessage("El costo debe ser un número positivo");
      setSnackbarOpen(true);
      return;
    }

    const normalizedIngredient = normalizeIngredient(currentIngredient);
    const ingredientExists = ingredients.some(
      (ingredient) =>
        normalizeIngredient(ingredient.name) === normalizedIngredient
    );

    if (editMode) {
      setIngredients((prevIngredients) =>
        prevIngredients.map((ingredient) =>
          normalizeIngredient(ingredient.name) === normalizedIngredient
            ? {
                ...ingredient,
                quantity,
                cost,
              }
            : ingredient
        )
      );
      setSnackbarMessage(`${currentIngredient} actualizado correctamente`);
    } else {
      setIngredients((prevIngredients) => [
        ...prevIngredients,
        {
          name: currentIngredient.trim(),
          quantity,
          cost,
        },
      ]);
      setSnackbarMessage(`${currentIngredient} agregado correctamente`);
    }

    saveDataToLocalStorage();
    setCurrentIngredient("");
    setQuantity("");
    setCost("");
    setEditMode(false);
    setIngredientToEdit("");
    setSnackbarOpen(true);
  };

  const handleDeleteIngredient = (ingredient) => {
    setIngredients((prevIngredients) =>
      prevIngredients.filter(
        (ing) =>
          normalizeIngredient(ing.name) !== normalizeIngredient(ingredient.name)
      )
    );
    saveDataToLocalStorage();
    setSnackbarMessage(`${ingredient.name} eliminado correctamente`);
    setSnackbarOpen(true);
  };

  const handleEditIngredient = (ingredient) => {
    setCurrentIngredient(ingredient.name);
    setQuantity(ingredient.quantity || "");
    setCost(ingredient.cost || "");
    setUnit("gramos");
    setEditMode(true);
    setIngredientToEdit(ingredient.name);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Gestión de Inventario
      </Typography>

      <Button
        variant="outlined"
        color="secondary"
        startIcon={<ArrowBack />}
        onClick={() => navigate("/inventory")}
      >
        Regresar a Inventario
      </Button>

      <TextField
        label="Nombre del Ingrediente"
        variant="outlined"
        fullWidth
        margin="normal"
        value={currentIngredient}
        onChange={handleIngredientChange}
      />

      <TextField
        label="Cantidad"
        variant="outlined"
        type="number"
        fullWidth
        margin="normal"
        value={quantity}
        onChange={handleQuantityChange}
        InputProps={{
          endAdornment: <InputAdornment position="end">{unit}</InputAdornment>,
        }}
      />

      <Select
        value={unit}
        onChange={handleUnitChange}
        fullWidth
        margin="normal"
      >
        <MenuItem value="mililitros">Mililitros</MenuItem>
        <MenuItem value="gramos">Gramos</MenuItem>
        <MenuItem value="piezas">Piezas</MenuItem>
      </Select>

      <TextField
        label="Costo por Unidad"
        variant="outlined"
        type="number"
        step="0.01"
        fullWidth
        margin="normal"
        value={cost}
        onChange={handleCostChange}
        InputProps={{
          startAdornment: <InputAdornment position="start">$</InputAdornment>,
        }}
      />

      <Button
        onClick={handleSaveIngredient}
        variant="contained"
        color="primary"
        startIcon={<AddCircle />}
      >
        {editMode ? "Actualizar Ingrediente" : "Agregar Ingrediente"}
      </Button>

      <List>
        {ingredients.map((ingredient, index) => (
          <ListItem key={index}>
            <ListItemText
              primary={ingredient.name}
              secondary={`Cantidad: ${
                ingredient.quantity || "N/A"
              } ${unit} - Costo: ${ingredient.cost || "N/A"} MXN`}
            />
            <IconButton onClick={() => handleEditIngredient(ingredient)}>
              <Edit />
            </IconButton>
            <IconButton onClick={() => handleDeleteIngredient(ingredient)}>
              <Delete />
            </IconButton>
          </ListItem>
        ))}
      </List>

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

export default ManageInventoryPage;
