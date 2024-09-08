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
import { useNavigate } from "react-router-dom"; 
import { db } from "../firebaseConfig"; 
import { collection, getDocs, addDoc, query, where } from "firebase/firestore";

const normalizeIngredient = (ingredient) => {
  return ingredient
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
};

const InventoryPage = () => {
  const [ingredients, setIngredients] = useState([]);
  const [newIngredient, setNewIngredient] = useState("");
  const [inputColor, setInputColor] = useState("");
  const [isIngredientNew, setIsIngredientNew] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchIngredients = async () => {
      const q = query(collection(db, "ingredients"));
      const querySnapshot = await getDocs(q);
      const ingredientsArray = querySnapshot.docs.map(doc => doc.data().name);
      setIngredients(ingredientsArray);
    };
    
    fetchIngredients();
  }, []);

  const saveIngredientToFirestore = async (ingredient) => {
    try {
      await addDoc(collection(db, "ingredients"), {
        name: ingredient,
      });
      setIngredients(prev => [...prev, ingredient]);
    } catch (error) {
      console.error("Error adding ingredient: ", error);
    }
  };

  const handleInputChange = async (e) => {
    const value = e.target.value;
    setNewIngredient(value);

    const normalizedNewIngredient = normalizeIngredient(value);
    const ingredientExists = ingredients.some(ingredient =>
      normalizeIngredient(ingredient).includes(normalizedNewIngredient)
    );

    if (ingredientExists) {
      setInputColor("red");
      setIsIngredientNew(false);
    } else {
      setInputColor("green");
      setIsIngredientNew(true);
    }
  };

  const addIngredient = async () => {
    if (isIngredientNew && newIngredient.trim()) {
      await saveIngredientToFirestore(newIngredient.trim());
      setNewIngredient("");
      setInputColor("");
      setIsIngredientNew(false);
      setSnackbarMessage(`${newIngredient.trim()} fue ingresado correctamente`);
      setSnackbarOpen(true);
    } else if (!isIngredientNew && newIngredient.trim()) {
      setSnackbarMessage(`${newIngredient.trim()} ya existe`);
      setSnackbarOpen(true);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      addIngredient();
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Gestión de Inventario
      </Typography>

      <TextField
        label="Nuevo Ingrediente"
        variant="outlined"
        fullWidth
        margin="normal"
        value={newIngredient}
        onChange={handleInputChange}
        onKeyPress={handleKeyPress}
        style={{ borderColor: inputColor, color: inputColor }}
        inputProps={{
          style: {
            color: inputColor,
          },
        }}
      />

      <Button
        onClick={addIngredient}
        variant="contained"
        color="primary"
        startIcon={<AddCircle />}
        disabled={!isIngredientNew}
      >
        Guardar Ingrediente
      </Button>

      <Button
        onClick={() => navigate("/manage-inventory")}
        variant="contained"
        color="secondary"
        startIcon={<ArrowForward />}
        style={{ marginTop: "20px" }}
      >
        Ir a Gestionar Inventario
      </Button>

      <Button
        onClick={() => navigate("/dashboard")}
        variant="outlined"
        color="default"
        startIcon={<ArrowBack />}
        style={{ marginTop: "20px" }}
      >
        Regresar al Dashboard
      </Button>

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
