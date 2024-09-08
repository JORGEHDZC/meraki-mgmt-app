import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, collection, getDocs, query } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { TextField, Button, Box, Typography, List, ListItem, ListItemText, IconButton, Autocomplete } from '@mui/material';
import { Delete } from '@mui/icons-material';

const EditRecipePage = () => {
  const { id } = useParams(); // Obtener el ID de la receta desde los parámetros de la URL
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState({ recipe_name: '', cost_recipe: 0, quantity_portions: 0, ingredients_list: [] }); // Estado para almacenar la receta
  const [ingredientOptions, setIngredientOptions] = useState([]); // Opciones de ingredientes desde la base de datos
  const [ingredientInput, setIngredientInput] = useState(null); // Ingrediente seleccionado para agregar
  const [quantityUsed, setQuantityUsed] = useState(''); // Cantidad usada del nuevo ingrediente
  const [loading, setLoading] = useState(true); // Estado para controlar el cargando

  // Función para obtener la receta desde Firestore
  const fetchRecipe = async () => {
    try {
      const recipeRef = doc(db, 'recepies', id);
      const recipeSnap = await getDoc(recipeRef);
      if (recipeSnap.exists()) {
        const recipeData = recipeSnap.data();
        const ingredientsWithDetails = await fetchIngredientDetails(recipeData.ingredients_list);
        setRecipe({ ...recipeData, ingredients_list: ingredientsWithDetails });
      } else {
        console.log('La receta no existe');
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching recipe:', error);
      setLoading(false);
    }
  };

  // Función para obtener los detalles de los ingredientes desde Firestore
  const fetchIngredientDetails = async (ingredientsList) => {
    const updatedIngredients = await Promise.all(
      ingredientsList.map(async (ingredient) => {
        const ingredientData = await getDoc(doc(db, 'ingredients', ingredient.ingredient_id));
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
    const q = query(collection(db, 'ingredients'));
    const querySnapshot = await getDocs(q);
    const ingredients = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setIngredientOptions(ingredients);
  };

  // Cargar la receta y los ingredientes cuando el componente se monte
  useEffect(() => {
    fetchRecipe();
    fetchIngredients();
  }, [id]);

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
        const newCostByQuantityUsed = (ingredient.cost / ingredient.quantity) * newQuantityUsed;
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
      const recipeRef = doc(db, 'recepies', id);
      await updateDoc(recipeRef, {
        recipe_name: recipe.recipe_name,
        ingredients_list: recipe.ingredients_list,
        cost_recipe: recipe.cost_recipe, // Guardar el costo total actualizado
        quantity_portions: recipe.quantity_portions,
      });
      navigate('/recipe-detail'); // Redirigir al listado de recetas después de actualizar
    } catch (error) {
      console.error('Error updating recipe:', error);
    }
  };

  // Calcular el costo total de la receta
  const calculateTotalCost = (ingredientsList) => {
    return ingredientsList.reduce((total, ing) => total + parseFloat(ing.cost_by_quantity_used), 0).toFixed(2);
  };

  // Función para eliminar un ingrediente de la receta
  const handleDeleteIngredient = (ingredientId) => {
    const updatedIngredients = recipe.ingredients_list.filter((ingredient) => ingredient.ingredient_id !== ingredientId);
    // Actualizar la lista de ingredientes y el costo total de la receta
    setRecipe((prevRecipe) => ({
      ...prevRecipe,
      ingredients_list: updatedIngredients,
      cost_recipe: calculateTotalCost(updatedIngredients), // Recalcular el costo total
    }));
  };

  // Función para agregar un nuevo ingrediente a la receta
  const handleAddIngredient = async () => {
    if (ingredientInput && quantityUsed) {
      const ingredientData = await getDoc(doc(db, 'ingredients', ingredientInput.id));
      const ingredientInfo = ingredientData.data();
      const cost = (ingredientInfo.cost / ingredientInfo.quantity) * quantityUsed;
      const newIngredient = {
        ingredient_id: ingredientInput.id,
        name: ingredientInfo.name,
        quantity_used: parseInt(quantityUsed, 10),
        cost_by_quantity_used: cost.toFixed(2),
        unit: ingredientInfo.unit,
      };

      const updatedIngredients = [...recipe.ingredients_list, newIngredient];

      // Actualizar la lista de ingredientes y el costo total de la receta
      setRecipe((prevRecipe) => ({
        ...prevRecipe,
        ingredients_list: updatedIngredients,
        cost_recipe: calculateTotalCost(updatedIngredients), // Recalcular el costo total
      }));

      setIngredientInput(null);
      setQuantityUsed('');
    }
  };

  // Función para regresar al listado de recetas sin hacer cambios
  const goBack = () => {
    navigate('/recipe-detail');
  };

  if (loading) {
    return <p>Cargando receta...</p>;
  }

  return (
    <Box sx={{ maxWidth: 500, margin: '0 auto', padding: '20px' }}>
      <Typography variant="h4" gutterBottom>
        Editar Receta
      </Typography>

      <TextField
        label="Nombre de la receta"
        name="recipe_name"
        value={recipe.recipe_name}
        onChange={handleInputChange}
        fullWidth
        margin="normal"
      />

      <TextField
        label="Costo de la receta"
        name="cost_recipe"
        type="number"
        value={recipe.cost_recipe}
        onChange={handleInputChange}
        fullWidth
        margin="normal"
        disabled // El costo total es calculado automáticamente
      />

      <TextField
        label="Porciones"
        name="quantity_portions"
        type="number"
        value={recipe.quantity_portions}
        onChange={handleInputChange}
        fullWidth
        margin="normal"
      />

      {/* Renderizar ingredientes */}
      <Typography variant="h6">Ingredientes</Typography>
      <List>
        {recipe.ingredients_list.map((ingredient) => (
          <ListItem key={ingredient.ingredient_id}>
            <ListItemText
              primary={`${ingredient.name}`}
              secondary={<div style={{ whiteSpace: 'pre-line', textAlign: 'left' }}>{`Costo: $${ingredient.cost_by_quantity_used}`}</div>}
            />
            <TextField
              label="Cantidad Usada"
              type="number"
              value={ingredient.quantity_used}
              onChange={(e) => handleEditQuantity(ingredient.ingredient_id, e.target.value)}
              sx={{ marginRight: '1rem' }}
            />
            <IconButton onClick={() => handleDeleteIngredient(ingredient.ingredient_id)}>
              <Delete />
            </IconButton>
          </ListItem>
        ))}
      </List>

      {/* Agregar nuevo ingrediente */}
      <Autocomplete
        value={ingredientInput}
        onChange={(event, newValue) => setIngredientInput(newValue)}
        options={ingredientOptions.filter(
          (option) => !recipe.ingredients_list.some((ing) => ing.ingredient_id === option.id)
        )}
        getOptionLabel={(option) => option.name}
        renderInput={(params) => <TextField {...params} label="Buscar Ingrediente" fullWidth margin="normal" />}
      />
      <TextField
        label="Cantidad Usada"
        type="number"
        value={quantityUsed}
        onChange={(e) => setQuantityUsed(e.target.value)}
        fullWidth
        margin="normal"
      />
      <Button variant="contained" color="primary" onClick={handleAddIngredient}>
        Añadir Ingrediente
      </Button>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
        <Button variant="contained" color="primary" onClick={handleUpdate}>
          Actualizar Receta
        </Button>
        <Button variant="outlined" color="secondary" onClick={goBack}>
          Cancelar
        </Button>
      </Box>
    </Box>
  );
};

export default EditRecipePage;
