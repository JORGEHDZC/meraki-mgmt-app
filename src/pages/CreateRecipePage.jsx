import React, { useState, useEffect } from "react";
import {
  Container,
  TextField,
  Button,
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  InputAdornment,
  IconButton,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Autocomplete,
} from "@mui/material";
import { Delete } from "@mui/icons-material";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { db } from "../firebaseConfig"; // Asegúrate de importar tu configuración de Firebase
import { collection, addDoc, getDocs, query } from "firebase/firestore";
import { useNavigate } from "react-router-dom"; // Importa el hook para la navegación

const CreateRecipePage = () => {
  const [recipeName, setRecipeName] = useState("");
  const [quantityPortions, setQuantityPortions] = useState("");
  const [ingredientsList, setIngredientsList] = useState([]);
  const [ingredientInput, setIngredientInput] = useState(null);
  const [quantityUsed, setQuantityUsed] = useState("");
  const [createDate, setCreateDate] = useState(new Date());
  const [ingredientOptions, setIngredientOptions] = useState([]);
  const [filteredOptions, setFilteredOptions] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [ingredientToDelete, setIngredientToDelete] = useState(null);

  const navigate = useNavigate(); // Instancia del hook para la navegación

  const handleGoBack = () => {
    navigate("/dashboard"); // Cambia '/dashboard' por la ruta a la que quieres que navegue
  };

  useEffect(() => {
    const fetchIngredients = async () => {
      const q = query(collection(db, "ingredients"));
      const querySnapshot = await getDocs(q);
      const ingredients = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setIngredientOptions(ingredients);
      setFilteredOptions(ingredients);
    };

    fetchIngredients();
  }, []);

  useEffect(() => {
    const filtered = ingredientOptions.filter(
      (ingredient) =>
        !ingredientsList.some(
          (addedIngredient) => addedIngredient.id === ingredient.id
        )
    );
    setFilteredOptions(filtered);
  }, [ingredientsList, ingredientOptions]);

  const handleAddIngredient = () => {
    if (ingredientInput) {
      const ingredient = ingredientOptions.find(
        (ing) => ing.id === ingredientInput.id
      );
      if (ingredient) {
        const cost = (ingredient.cost / ingredient.quantity) * quantityUsed;
        setIngredientsList((prevList) => [
          ...prevList,
          {
            id: ingredient.id,
            name: ingredient.name,
            quantityUsed: parseInt(quantityUsed, 10),
            costByQuantityUsed: cost.toFixed(2),
            unit: ingredient.unit,
          },
        ]);
        setIngredientInput(null);
        setQuantityUsed("");
      } else {
        setSnackbarMessage("Ingrediente no encontrado");
        setSnackbarOpen(true);
      }
    }
  };

  const handleDeleteIngredient = (ingredientId) => {
    setIngredientsList((prevList) =>
      prevList.filter((ing) => ing.id !== ingredientId)
    );
    setOpenDeleteModal(false);
    setSnackbarMessage("Ingrediente eliminado");
    setSnackbarOpen(true);
  };

  const calculateTotalCost = () => {
    return ingredientsList
      .reduce((total, ing) => total + parseFloat(ing.costByQuantityUsed), 0)
      .toFixed(2);
  };

  const handleSaveRecipe = async () => {
    if (
      recipeName &&
      quantityPortions &&
      ingredientsList.length >= 3 &&
      createDate
    ) {
      const recipeData = {
        recipe_name: recipeName,
        ingredients_list: ingredientsList.map((ing) => ({
          ingredient_id: ing.id,
          quantity_used: ing.quantityUsed,
          cost_by_quantity_used: ing.costByQuantityUsed,
        })),
        quantity_portions: parseInt(quantityPortions, 10),
        cost_recipe: calculateTotalCost(),
        create_date: createDate,
      };

      console.log("Datos de la receta:", recipeData);

      try {
        await addDoc(collection(db, "recepies"), recipeData);
        setSnackbarMessage("Receta guardada exitosamente");
        setSnackbarOpen(true);

        // Reset fields after saving
        setRecipeName("");
        setQuantityPortions("");
        setIngredientsList([]);
        setCreateDate(new Date());
      } catch (error) {
        console.error("Error al guardar la receta:", error);
        setSnackbarMessage("Error al guardar la receta");
        setSnackbarOpen(true);
      }
    } else {
      setSnackbarMessage("Complete todos los campos requeridos");
      setSnackbarOpen(true);
    }
  };

  return (
    <Container
      sx={{ height: "100vh", display: "flex", flexDirection: "column" }}
    >
      {/* Contenedor con barra de desplazamiento */}
      <Box sx={{ flexGrow: 1, overflowY: "auto", paddingRight: "1rem" }}>
        <Typography variant="h4" gutterBottom>
          Crear Nueva Receta
        </Typography>

        <TextField
          label="Nombre de la Receta"
          variant="outlined"
          fullWidth
          value={recipeName}
          onChange={(e) => setRecipeName(e.target.value)}
          sx={{ marginBottom: "1rem" }}
        />

        <TextField
          label="Número de Porciones"
          variant="outlined"
          type="number"
          fullWidth
          value={quantityPortions}
          onChange={(e) => setQuantityPortions(e.target.value)}
          sx={{ marginBottom: "1rem" }}
        />

        <Autocomplete
          value={ingredientInput}
          onChange={(event, newValue) => setIngredientInput(newValue)}
          options={filteredOptions}
          getOptionLabel={(option) => option.name}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Buscar Ingrediente"
              variant="outlined"
              sx={{ marginBottom: "1rem" }}
            />
          )}
        />

        <TextField
          label="Cantidad Usada"
          variant="outlined"
          type="number"
          fullWidth
          value={quantityUsed}
          onChange={(e) => setQuantityUsed(e.target.value)}
          sx={{ marginBottom: "1rem" }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">Unidad</InputAdornment>
            ),
          }}
        />

        <Button
          variant="contained"
          color="primary"
          onClick={handleAddIngredient}
          sx={{ marginBottom: "1rem" }}
        >
          Añadir Ingrediente
        </Button>

        <Typography variant="h6" gutterBottom>
          Ingredientes Añadidos
        </Typography>

        <List>
          {ingredientsList.map((ingredient) => (
            <ListItem key={ingredient.id}>
              <ListItemText
                primary={`${ingredient.name} - ${ingredient.quantityUsed} ${ingredient.unit}`}
                secondary={`Costo: $${ingredient.costByQuantityUsed}`}
              />
              <IconButton
                onClick={() => {
                  setOpenDeleteModal(true);
                  setIngredientToDelete(ingredient.id);
                }}
              >
                <Delete />
              </IconButton>
            </ListItem>
          ))}
        </List>

        <TextField
          label="Costo Total de la Receta"
          variant="outlined"
          value={`$${calculateTotalCost()}`}
          InputProps={{
            readOnly: true,
          }}
          sx={{ marginBottom: "1rem" }}
        />

        <DatePicker
          selected={createDate}
          onChange={(date) => setCreateDate(date)}
          dateFormat="MMMM d, yyyy"
          className="react-datepicker"
          placeholderText="Seleccionar fecha de creación"
          style={{ marginBottom: "1rem", width: "100%", padding: "0.5rem" }}
        />
      </Box>

      {/* Botones de Guardar y Regresar */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          padding: "1rem",
        }}
      >
        <Button
          variant="contained"
          color="primary"
          onClick={handleSaveRecipe}
          disabled={
            !recipeName ||
            !quantityPortions ||
            ingredientsList.length < 3 ||
            !createDate
          }
        >
          Guardar Receta
        </Button>

        <Button variant="contained" color="error" onClick={handleGoBack}>
          Regresar al Dashboard
        </Button>
      </Box>

      {/* Dialog de confirmación de eliminación */}
      <Dialog open={openDeleteModal} onClose={() => setOpenDeleteModal(false)}>
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <Typography>¿Deseas eliminar este ingrediente?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteModal(false)}>Cancelar</Button>
          <Button
            onClick={() =>
              ingredientToDelete && handleDeleteIngredient(ingredientToDelete)
            }
            color="error"
          >
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar para mostrar mensajes */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity="success">
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default CreateRecipePage;
