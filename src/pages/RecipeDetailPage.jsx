import React, { useEffect, useState } from 'react';
import { collection, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';  // Tu archivo de configuración Firebase
import { Button, IconButton, Modal, Box, Typography, List, ListItem, ListItemText } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { useNavigate } from 'react-router-dom';

const RecipeDetailPage = () => {
  const [recipes, setRecipes] = useState([]); // Estado para almacenar todas las recetas
  const [openModal, setOpenModal] = useState(false); // Estado para controlar el modal
  const [recipeToDelete, setRecipeToDelete] = useState(null); // Estado para la receta a eliminar
  const navigate = useNavigate(); // Hook de navegación

  // Función para obtener todas las recetas de la colección "recipes"
  const fetchRecipes = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'recepies'));
      const fetchedRecipes = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setRecipes(fetchedRecipes);
    } catch (error) {
      console.error('Error fetching recepies:', error);
    }
  };

  // Función para eliminar una receta
  const handleDelete = async () => {
    if (recipeToDelete) {
      try {
        await deleteDoc(doc(db, 'recepies', recipeToDelete));
        setRecipes((prevRecipes) => prevRecipes.filter((recipe) => recipe.id !== recipeToDelete));
        setOpenModal(false); // Cerrar el modal después de eliminar
        setRecipeToDelete(null); // Reiniciar el estado de la receta a eliminar
      } catch (error) {
        console.error('Error deleting recipe:', error);
      }
    }
  };

  // Función para abrir el modal de confirmación de eliminación
  const confirmDelete = (id) => {
    setRecipeToDelete(id);
    setOpenModal(true);
  };

  // Función para cerrar el modal
  const closeModal = () => {
    setOpenModal(false);
    setRecipeToDelete(null);
  };

  // Función para navegar al dashboard
  const goToDashboard = () => {
    navigate('/dashboard');
  };

  // Cargar todas las recetas cuando el componente se monte
  useEffect(() => {
    fetchRecipes();
  }, []);

  return (
    <div>
      <h1>Recetas Disponibles</h1>

      <Button variant="contained" color="primary" onClick={goToDashboard}>
        Regresar al Dashboard
      </Button>

      {recipes.length === 0 ? (
        <p>No hay recetas disponibles.</p>
      ) : (
        <List>
          {recipes.map((recipe) => (
            <ListItem key={recipe.id}>
              <ListItemText
                primary={recipe.recipe_name}
                secondary={<div style={{ whiteSpace: 'pre-line', textAlign: 'left' }}>{`Costo: $${recipe.cost_recipe}`}</div>}
              />
              <IconButton onClick={() => navigate(`/edit-recipe/${recipe.id}`)} color="primary"><EditIcon /></IconButton>
              <IconButton onClick={() => confirmDelete(recipe.id)} color="secondary"><DeleteIcon /></IconButton>
            </ListItem>
          ))}
        </List>
      )}

      {/* Modal para confirmar la eliminación de la receta */}
      <Modal open={openModal} onClose={closeModal}>
        <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', bgcolor: 'background.paper', border: '2px solid #000', boxShadow: 24, p: 4 }}>
          <Typography variant="h6">¿Estás seguro de que quieres eliminar esta receta?</Typography>
          <Button onClick={handleDelete} variant="contained" color="secondary">Eliminar</Button>
          <Button onClick={closeModal} variant="outlined" color="primary">Cancelar</Button>
        </Box>
      </Modal>
    </div>
  );
};

export default RecipeDetailPage;
