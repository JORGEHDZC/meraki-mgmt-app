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
import { db, storage } from "../firebaseConfig"; // Asegúrate de importar tu configuración de Firebase y Storage
import { collection, addDoc, getDocs } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"; // Importar funciones de Storage para cargar imagenes
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
  const [imageFile, setImageFile] = useState(null); // Estado para la imagen
  const [imageUrl, setImageUrl] = useState(""); // URL de la imagen cargada
  const [loading, setLoading] = useState(false); // Para controlar el estado de carga de la imagen

  const navigate = useNavigate(); // Instancia del hook para la navegación

  useEffect(() => {
    const fetchIngredients = async () => {
      const q = collection(db, "ingredients");
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
    // Filtrar las opciones de ingredientes para excluir los ingredientes ya añadidos
    const filtered = ingredientOptions.filter(
      (ingredient) =>
        !ingredientsList.some(
          (addedIngredient) => addedIngredient.id === ingredient.id
        )
    );
    setFilteredOptions(filtered);
  }, [ingredientsList, ingredientOptions]);

  // Función para manejar la selección de imagen
  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  // Función para subir la imagen a Firebase Storage
  const uploadImageToStorage = async () => {
    if (imageFile) {
      const storageRef = ref(storage, `recipes/${imageFile.name}`);
      const snapshot = await uploadBytes(storageRef, imageFile);
      const downloadURL = await getDownloadURL(snapshot.ref);
      return downloadURL;
    }
    return null;
  };

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

  const calculateTotalCost = () => {
    return ingredientsList
      .reduce((total, ing) => total + parseFloat(ing.costByQuantityUsed), 0)
      .toFixed(2);
  };

  const handleSaveRecipe = async () => {
    setLoading(true); // Iniciar la carga
    let imageUrl = "";
    if (imageFile) {
      imageUrl = await uploadImageToStorage(); // Subir imagen a Firebase Storage
    }

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
        image_url: imageUrl, // Agregar la URL de la imagen
      };

      // Imprimir en consola para verificar los datos antes de guardarlos
      console.log("Datos de la receta:", recipeData);

      try {
        await addDoc(collection(db, "recepies"), recipeData); // Guardar la receta en Firestore
        setSnackbarMessage("Receta guardada exitosamente");
        setSnackbarOpen(true);

        // Resetear campos después de guardar
        setRecipeName("");
        setQuantityPortions("");
        setIngredientsList([]);
        setCreateDate(new Date());
        setImageFile(null);
        setImageUrl("");
      } catch (error) {
        console.error("Error al guardar la receta:", error);
        setSnackbarMessage("Error al guardar la receta");
        setSnackbarOpen(true);
      }
    } else {
      setSnackbarMessage("Complete todos los campos requeridos");
      setSnackbarOpen(true);
    }

    setLoading(false); // Terminar la carga
  };

  return (
    <Container
      sx={{ height: "100vh", display: "flex", flexDirection: "column" }}
    >
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
            endAdornment: <InputAdornment position="end">Unidad</InputAdornment>,
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

        {/* Botón para subir una imagen */}
        <Typography variant="h6">Subir Imagen de la Receta</Typography>
        <Button
          variant="contained"
          component="label"
          sx={{ marginBottom: "1rem" }}
        >
          Seleccionar Imagen
          <input type="file" hidden onChange={handleImageChange} />
        </Button>

        {/* Renderizar imagen si existe */}
        {imageUrl && (
          <Box sx={{ marginBottom: "1rem" }}>
            <Typography variant="h6">Vista Previa de la Imagen:</Typography>
            <img src={imageUrl} alt="Receta" width="100%" />
          </Box>
        )}

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
          disabled={loading} // Deshabilitar botón durante la carga
        >
          {loading ? "Guardando..." : "Guardar Receta"}
        </Button>

        <Button variant="contained" color="error" onClick={() => navigate("/dashboard")}>
          Regresar al Dashboard
        </Button>
      </Box>

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
