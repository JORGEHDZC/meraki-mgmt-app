import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  getDocs,
  query,
} from "firebase/firestore";
import { db, storage } from "../firebaseConfig"; // Import Firebase storage
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage"; // Import Firebase storage functions
import { Delete } from "@mui/icons-material";
import {
  TextField,
  Button,
  Input,
  IconButton,
  Typography,
  Box,
  Grid,
  Snackbar,
} from "@mui/material";

const EditRecipeByIDPage = () => {
  const { id } = useParams(); // Obtener el ID de la receta desde los parámetros de la URL
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState({
    recipe_name: "",
    cost_recipe: 0,
    quantity_portions: 0,
    ingredients_list: [],
    image_url: "", // Added field for the recipe image
  }); // Estado para almacenar la receta
  const [ingredientOptions, setIngredientOptions] = useState([]); // Opciones de ingredientes desde la base de datos
  const [ingredientInput, setIngredientInput] = useState(""); // Ingrediente seleccionado para agregar
  const [quantityUsed, setQuantityUsed] = useState(""); // Cantidad usada del nuevo ingrediente
  const [loading, setLoading] = useState(true); // Estado para controlar el cargando
  const [filteredOptions, setFilteredOptions] = useState([]);
  const [newImage, setNewImage] = useState(null); // State to store the new image file
  const [uploading, setUploading] = useState(false); // State to handle upload progress
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  // Función para obtener la receta desde Firestore
  const fetchRecipe = async () => {
    try {
      const recipeRef = doc(db, "recepies", id);
      const recipeSnap = await getDoc(recipeRef);
      if (recipeSnap.exists()) {
        const recipeData = recipeSnap.data();
        const ingredientsWithDetails = await fetchIngredientDetails(
          recipeData.ingredients_list
        );
        setRecipe({ ...recipeData, ingredients_list: ingredientsWithDetails });
      } else {
        console.log("La receta no existe");
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching recipe:", error);
      setLoading(false);
    }
  };

  // Función para obtener los detalles de los ingredientes desde Firestore
  const fetchIngredientDetails = async (ingredientsList) => {
    const updatedIngredients = await Promise.all(
      ingredientsList.map(async (ingredient) => {
        const ingredientData = await getDoc(
          doc(db, "ingredients", ingredient.ingredient_id)
        );
        if (ingredientData.exists()) {
          const ingredientInfo = ingredientData.data();
          return {
            ...ingredient,
            name: ingredientInfo.name,
            unit: ingredientInfo.unit,
            cost: ingredientInfo.cost,
            quantity: ingredientInfo.quantity,
          };
        }
        return ingredient; // Retorna el ingrediente sin cambios si no se encuentra en la colección
      })
    );
    return updatedIngredients;
  };

  // Función para obtener los ingredientes disponibles
  const fetchIngredients = async () => {
    const q = query(collection(db, "ingredients"));
    const querySnapshot = await getDocs(q);
    const ingredients = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setIngredientOptions(ingredients);
  };

  // Cargar la receta y los ingredientes cuando el componente se monte
  useEffect(() => {
    fetchRecipe();
    fetchIngredients();
  }, [id]);

  // Filter ingredients based on input
  useEffect(() => {
    if (ingredientInput) {
      const filtered = ingredientOptions.filter((ingredient) =>
        ingredient.name.toLowerCase().includes(ingredientInput.toLowerCase())
      );
      setFilteredOptions(filtered);
    } else {
      setFilteredOptions([]); // Clear the options when there is no input
    }
  }, [ingredientInput, ingredientOptions]);

  // Función para manejar el cambio en los campos de texto
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setRecipe({
      ...recipe,
      [name]: value,
    });
  };

  // Función para editar la cantidad usada de un ingrediente y recalcular el costo
  const handleEditQuantity = (ingredientId, newQuantityUsed) => {
    const updatedIngredients = recipe.ingredients_list.map((ingredient) => {
      if (ingredient.ingredient_id === ingredientId) {
        // Recalcular el costo basado en la nueva cantidad
        const newCostByQuantityUsed =
          (ingredient.cost / ingredient.quantity) * newQuantityUsed;
        return {
          ...ingredient,
          quantity_used: newQuantityUsed,
          cost_by_quantity_used: newCostByQuantityUsed.toFixed(2),
        };
      }
      return ingredient;
    });
    // Actualizar la lista de ingredientes y el costo total de la receta
    setRecipe((prevRecipe) => ({
      ...prevRecipe,
      ingredients_list: updatedIngredients,
      cost_recipe: calculateTotalCost(updatedIngredients), // Recalcular el costo total
    }));
  };

  // Función para actualizar la receta en Firestore
  const handleUpdate = async () => {
    try {
      const recipeRef = doc(db, "recepies", id);
      await updateDoc(recipeRef, {
        recipe_name: recipe.recipe_name,
        ingredients_list: recipe.ingredients_list,
        cost_recipe: recipe.cost_recipe, // Guardar el costo total actualizado
        quantity_portions: recipe.quantity_portions,
        image_url: recipe.image_url, // Ensure the image_url is saved
      });
      navigate("/edit-recipes"); // Redirigir al listado de recetas después de actualizar
    } catch (error) {
      console.error("Error updating recipe:", error);
    }
  };

  // Función para manejar la selección de un nuevo archivo de imagen
  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setNewImage(e.target.files[0]);
    }
  };

  // Función para subir la nueva imagen a Firebase Storage
  const handleImageUpload = () => {
    if (!newImage) return;

    setUploading(true);
    const storageRef = ref(storage, `recipe_images/${id}`);
    const uploadTask = uploadBytesResumable(storageRef, newImage);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        setSnackbarMessage("La imagen está cargada...");
        setSnackbarOpen(true);
        setTimeout(() => {
          setSnackbarOpen(false);
        }, 1500);
      },
      (error) => {
        console.error("Error uploading image:", error);
        setUploading(false);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          setRecipe((prevRecipe) => ({
            ...prevRecipe,
            image_url: downloadURL, // Update the image_url with the new download link
          }));
          setUploading(false);
        });
      }
    );
  };

  // Calcular el costo total de la receta
  const calculateTotalCost = (ingredientsList) => {
    return ingredientsList
      .reduce((total, ing) => total + parseFloat(ing.cost_by_quantity_used), 0)
      .toFixed(2);
  };

  // Función para eliminar un ingrediente de la receta
  const handleDeleteIngredient = (ingredientId) => {
    const updatedIngredients = recipe.ingredients_list.filter(
      (ingredient) => ingredient.ingredient_id !== ingredientId
    );
    // Actualizar la lista de ingredientes y el costo total de la receta
    setRecipe((prevRecipe) => ({
      ...prevRecipe,
      ingredients_list: updatedIngredients,
      cost_recipe: calculateTotalCost(updatedIngredients), // Recalcular el costo total
    }));
  };

  // Add ingredient to the list
  const handleAddIngredient = () => {
    const ingredient = ingredientOptions.find(
      (ing) => ing.name === ingredientInput
    );
    if (ingredient && quantityUsed) {
      const cost = (ingredient.cost / ingredient.quantity) * quantityUsed;
      setRecipe((prevRecipe) => ({
        ...prevRecipe,
        ingredients_list: [
          ...prevRecipe.ingredients_list,
          {
            ingredient_id: ingredient.id,
            name: ingredient.name,
            quantity_used: parseInt(quantityUsed, 10),
            cost_by_quantity_used: cost.toFixed(2),
            unit: ingredient.unit,
          },
        ],
        cost_recipe: (
          parseFloat(prevRecipe.cost_recipe) + parseFloat(cost)
        ).toFixed(2),
      }));
      setIngredientInput(""); // Clear input after adding ingredient
      setFilteredOptions([]); // Hide dropdown after adding ingredient
      setQuantityUsed(""); // Clear quantity input
    } else {
      alert("Please select an ingredient and enter a valid quantity.");
    }
  };

  // Función para regresar al listado de recetas sin hacer cambios
  const goBack = () => {
    navigate("/edit-recipes");
  };

  if (loading) {
    return <Typography align="center">Cargando receta...</Typography>;
  }

  return (
    <Box className="container mx-auto py-4">
      <Box className="max-w-lg mx-auto bg-white p-6 shadow-md rounded-md">
        <Typography variant="h4" gutterBottom>
          Editar Receta:
        </Typography>
        <Typography variant="h5" gutterBottom>
          {recipe.recipe_name}
        </Typography>

        {/* Mostrar imagen de la receta */}
        {recipe.image_url && (
          <Box mb={4}>
            <img
              src={recipe.image_url}
              alt={recipe.recipe_name}
              className="w-full h-auto object-cover rounded-md"
            />
          </Box>
        )}

        <TextField
          label="Nombre de la receta"
          name="recipe_name"
          value={recipe.recipe_name}
          onChange={handleInputChange}
          fullWidth
          margin="normal"
          variant="outlined"
        />

        <TextField
          label="Costo de la receta"
          name="cost_recipe"
          value={recipe.cost_recipe}
          onChange={handleInputChange}
          fullWidth
          margin="normal"
          variant="outlined"
          disabled
        />

        <TextField
          label="Porciones"
          name="quantity_portions"
          value={recipe.quantity_portions}
          onChange={handleInputChange}
          fullWidth
          margin="normal"
          variant="outlined"
        />

        <Typography variant="h6" gutterBottom>
          Ingredientes
        </Typography>

        <ul className="mb-4">
          {recipe.ingredients_list.map((ingredient) => (
            <li
              key={ingredient.ingredient_id}
              className="flex items-center mb-2"
            >
              <Box className="flex-1">
                <Typography variant="subtitle1">{ingredient.name}</Typography>
                <Typography variant="body2" color="textSecondary">
                  {`Costo: $${ingredient.cost_by_quantity_used}`}
                </Typography>
              </Box>
              <TextField
                type="number"
                label={ingredient.unit}
                value={ingredient.quantity_used}
                onChange={(e) =>
                  handleEditQuantity(ingredient.ingredient_id, e.target.value)
                }
                variant="outlined"
                className="w-20 mr-4"
              />
              <IconButton
                onClick={() => handleDeleteIngredient(ingredient.ingredient_id)}
                color="error"
              >
                <Delete />
              </IconButton>
            </li>
          ))}
        </ul>

        {/* Input de búsqueda de ingredientes */}
        <TextField
          label="Buscar Ingrediente"
          value={ingredientInput}
          onChange={(e) => setIngredientInput(e.target.value)}
          fullWidth
          margin="normal"
          variant="outlined"
        />

        {/* Opciones filtradas */}
        {ingredientInput && filteredOptions.length > 0 && (
          <ul className="absolute bg-white border border-gray-300 rounded-md mt-1 w-full z-10">
            {filteredOptions.map((option) => (
              <li
                key={option.id}
                className="p-2 hover:bg-blue-100 cursor-pointer"
                onClick={() => {
                  setIngredientInput(option.name);
                  setFilteredOptions([]);
                }}
              >
                {option.name}
              </li>
            ))}
          </ul>
        )}

        <TextField
          label="Cantidad Usada"
          type="number"
          value={quantityUsed}
          onChange={(e) => setQuantityUsed(e.target.value)}
          fullWidth
          margin="normal"
          variant="outlined"
        />

        <Button
          onClick={handleAddIngredient}
          variant="contained"
          color="primary"
          fullWidth
          className="mb-6"
        >
          Añadir Ingrediente
        </Button>

        {/* Subir imagen */}
        <Box mb={4}>
          <Input
            type="file"
            onChange={handleImageChange}
            fullWidth
            className="mb-2"
          />
          <Button
            onClick={handleImageUpload}
            variant="contained"
            color="primary"
            fullWidth
            disabled={uploading}
          >
            {uploading ? "Subiendo Imagen..." : "Subir Imagen"}
          </Button>
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Button
              onClick={handleUpdate}
              variant="contained"
              color="success"
              fullWidth
            >
              Actualizar
            </Button>
          </Grid>
          <Grid item xs={6}>
            <Button
              onClick={goBack}
              variant="contained"
              color="error"
              fullWidth
            >
              Cancelar
            </Button>
          </Grid>
        </Grid>
      </Box>

      <Snackbar
        open={snackbarOpen}
        message={snackbarMessage}
        autoHideDuration={1500}
        onClose={() => setSnackbarOpen(false)}
      />
    </Box>
  );
};

export default EditRecipeByIDPage;
