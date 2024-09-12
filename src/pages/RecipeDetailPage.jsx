import React, { useEffect, useState } from 'react';
import { collection, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';  // Tu archivo de configuración Firebase
import {
  Button,
  IconButton,
  Modal,
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  TextField,
  Pagination,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { useNavigate } from 'react-router-dom';

const RecipeDetailPage = () => {
  const [recipes, setRecipes] = useState([]); // Estado para almacenar todas las recetas
  const [filteredRecipes, setFilteredRecipes] = useState([]); // Estado para recetas filtradas
  const [openModal, setOpenModal] = useState(false); // Estado para controlar el modal
  const [recipeToDelete, setRecipeToDelete] = useState(null); // Estado para la receta a eliminar
  const [searchQuery, setSearchQuery] = useState(''); // Estado para búsqueda
  const [currentPage, setCurrentPage] = useState(1); // Estado para la página actual
  const recipesPerPage = 5; // Cantidad de recetas por página
  const navigate = useNavigate(); // Hook de navegación

  // Función para obtener todas las recetas de la colección "recepies"
  const fetchRecipes = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'recepies'));
      const fetchedRecipes = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setRecipes(fetchedRecipes);
      setFilteredRecipes(fetchedRecipes);
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
        setFilteredRecipes((prevRecipes) => prevRecipes.filter((recipe) => recipe.id !== recipeToDelete));
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

  // Función para manejar la búsqueda
  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchQuery(value);
    const filtered = recipes.filter((recipe) =>
      recipe.recipe_name.toLowerCase().includes(value)
    );
    setFilteredRecipes(filtered);
    setCurrentPage(1); // Reiniciar a la primera página cuando se busca
  };

  // Paginar las recetas
  const indexOfLastRecipe = currentPage * recipesPerPage;
  const indexOfFirstRecipe = indexOfLastRecipe - recipesPerPage;
  const currentRecipes = filteredRecipes.slice(indexOfFirstRecipe, indexOfLastRecipe);

  // Cambiar de página
  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  return (
    <div>
      <h1>Recetas Disponibles</h1>

      <Button variant="contained" color="primary" onClick={goToDashboard}>
        Regresar al Dashboard
      </Button>

      {/* Barra de búsqueda */}
      <TextField
        label="Buscar Recetas"
        variant="outlined"
        fullWidth
        margin="normal"
        value={searchQuery}
        onChange={handleSearch}
      />

      {currentRecipes.length === 0 ? (
        <p>No hay recetas disponibles.</p>
      ) : (
        <>
          <List>
            {currentRecipes.map((recipe) => (
              <ListItem key={recipe.id}>
                <ListItemText
                  primary={recipe.recipe_name}
                  secondary={<div style={{ whiteSpace: 'pre-line', textAlign: 'left' }}>{`Costo: $${recipe.cost_recipe}`}</div>}
                />
                <IconButton onClick={() => navigate(`/edit-recipe/${recipe.id}`)} color="primary">
                  <EditIcon />
                </IconButton>
                <IconButton onClick={() => confirmDelete(recipe.id)} color="secondary">
                  <DeleteIcon />
                </IconButton>
              </ListItem>
            ))}
          </List>

          {/* Paginación */}
          <Pagination
            count={Math.ceil(filteredRecipes.length / recipesPerPage)}
            page={currentPage}
            onChange={handlePageChange}
            color="primary"
            sx={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}
          />
        </>
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
