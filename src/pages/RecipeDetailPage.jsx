import React, { useEffect, useState } from 'react';
import { collection, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig'; // Tu archivo de configuración Firebase
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
  const handlePageChange = (value) => {
    setCurrentPage(value);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Recetas Disponibles</h1>

      <button
        className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
        onClick={goToDashboard}
      >
        Regresar al Dashboard
      </button>

      {/* Barra de búsqueda */}
      <input
        type="text"
        placeholder="Buscar Recetas"
        className="w-full mb-4 p-2 border border-gray-300 rounded"
        value={searchQuery}
        onChange={handleSearch}
      />

      {currentRecipes.length === 0 ? (
        <p>No hay recetas disponibles.</p>
      ) : (
        <>
          <ul className="divide-y divide-gray-200">
            {currentRecipes.map((recipe) => (
              <li key={recipe.id} className="py-4 flex justify-between items-center">
                <div>
                  <p className="font-bold">{recipe.recipe_name}</p>
                  <p className="text-gray-500">Costo: ${recipe.cost_recipe}</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => navigate(`/edit-recipe/${recipe.id}`)}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => confirmDelete(recipe.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Eliminar
                  </button>
                </div>
              </li>
            ))}
          </ul>

          {/* Paginación */}
          <div className="flex justify-center mt-4">
            <button
              className="px-4 py-2 mx-1 bg-gray-300 rounded"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Anterior
            </button>
            <span className="px-4 py-2">{currentPage}</span>
            <button
              className="px-4 py-2 mx-1 bg-gray-300 rounded"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={indexOfLastRecipe >= filteredRecipes.length}
            >
              Siguiente
            </button>
          </div>
        </>
      )}

      {/* Modal para confirmar la eliminación de la receta */}
      {openModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-md">
            <h2 className="text-lg font-bold mb-4">¿Estás seguro de que quieres eliminar esta receta?</h2>
            <div className="flex justify-end space-x-4">
              <button
                className="px-4 py-2 bg-red-500 text-white rounded"
                onClick={handleDelete}
              >
                Eliminar
              </button>
              <button
                className="px-4 py-2 bg-gray-300 rounded"
                onClick={closeModal}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecipeDetailPage;
