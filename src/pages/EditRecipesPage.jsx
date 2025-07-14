import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  doc,
  deleteDoc,
  addDoc,
} from "firebase/firestore"; // Importar `addDoc`
import { db } from "../firebaseConfig"; // Tu archivo de configuración Firebase
import { useNavigate } from "react-router-dom";
import { Pencil, CircleX, CopyPlus, CirclePlus, ArrowLeft } from "lucide-react";
import { Button } from "../components/ui/Button";

const EditRecipesPage = () => {
  const [recipes, setRecipes] = useState([]); // Estado para almacenar todas las recetas
  const [filteredRecipes, setFilteredRecipes] = useState([]); // Estado para recetas filtradas
  const [openModal, setOpenModal] = useState(false); // Estado para controlar el modal
  const [recipeToDelete, setRecipeToDelete] = useState(null); // Estado para la receta a eliminar
  const [searchQuery, setSearchQuery] = useState(""); // Estado para búsqueda
  const [currentPage, setCurrentPage] = useState(1); // Estado para la página actual
  const recipesPerPage = 5; // Cantidad de recetas por página
  const navigate = useNavigate(); // Hook de navegación

  // Función para obtener todas las recetas de la colección "recepies"
  const fetchRecipes = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "recepies"));
      const fetchedRecipes = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      // Ordenar las recetas por nombre en orden ascendente
      const sortedRecipes = fetchedRecipes.sort((a, b) =>
        a.recipe_name.localeCompare(b.recipe_name)
      );
      setRecipes(sortedRecipes);
      setFilteredRecipes(sortedRecipes);
    } catch (error) {
      console.error("Error fetching recepies:", error);
    }
  };

  // Función para eliminar una receta
  const handleDelete = async () => {
    if (recipeToDelete) {
      try {
        await deleteDoc(doc(db, "recepies", recipeToDelete));
        setRecipes((prevRecipes) =>
          prevRecipes.filter((recipe) => recipe.id !== recipeToDelete)
        );
        setFilteredRecipes((prevRecipes) =>
          prevRecipes.filter((recipe) => recipe.id !== recipeToDelete)
        );
        setOpenModal(false); // Cerrar el modal después de eliminar
        setRecipeToDelete(null); // Reiniciar el estado de la receta a eliminar
      } catch (error) {
        console.error("Error deleting recipe:", error);
      }
    }
  };

  // Función para duplicar una receta
  const handleDuplicate = async (id) => {
    const recipeToDuplicate = recipes.find((recipe) => recipe.id === id);
    if (recipeToDuplicate) {
      const duplicatedRecipe = {
        ...recipeToDuplicate,
        recipe_name: `${recipeToDuplicate.recipe_name} - duplicated`, // Añadir " - duplicated" al nombre
      };
      delete duplicatedRecipe.id; // Eliminar el ID para que Firebase asigne uno nuevo
      try {
        // Guardar la receta duplicada en Firebase con un nuevo ID
        await addDoc(collection(db, "recepies"), duplicatedRecipe);
        // Recargar recetas después de duplicar
        fetchRecipes();
      } catch (error) {
        console.error("Error duplicating recipe:", error);
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
  const currentRecipes = filteredRecipes.slice(
    indexOfFirstRecipe,
    indexOfLastRecipe
  );

  // Cambiar de página
  const handlePageChange = (value) => {
    setCurrentPage(value);
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        <div className="card">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-4">
            <h1 className="text-2xl font-bold text-[var(--primary)]">
              Recetas Disponibles
            </h1>
            <div className="flex gap-2">
              <Button
                className="dashboard-button"
                onClick={() => navigate("/dashboard")}
              >
                <ArrowLeft size={30} />
                <span>Dashboard</span>
              </Button>
              <Button
                className="dashboard-button"
                onClick={() => navigate("/create-recipe")}
              >
                <CirclePlus size={30} />
                <span>Añadir receta</span>
              </Button>
            </div>
          </div>

          <input
            type="text"
            placeholder="Buscar Recetas"
            className="rounded-md p-2 border border-gray-300 w-full mb-4"
            value={searchQuery}
            onChange={handleSearch}
          />

          {currentRecipes.length === 0 ? (
            <p>No hay recetas disponibles.</p>
          ) : (
            <div className="grid gap-4">
              {currentRecipes.map((recipe) => (
                <div
                  key={recipe.id}
                  className="card flex flex-col md:flex-row md:items-center justify-between p-4"
                >
                  <div>
                    <h3 className="text-lg font-semibold text-[var(--primary)]">
                      <span className="font-bold">{recipe.recipe_name}</span>
                    </h3>
                    <p className="text-gray-600">
                      Costo:{" "}
                      <span className="font-bold">${recipe.cost_recipe}</span>
                    </p>
                  </div>
                  <div className="flex gap-3 mt-2 md:mt-0">
                    <button
                      onClick={() => navigate(`/edit-recipe/${recipe.id}`)}
                      className="text-white-500 hover:text-blue-700 edit-button"
                      title="Editar"
                    >
                      <Pencil size={20} />
                    </button>
                    <button
                      onClick={() => handleDuplicate(recipe.id)}
                      className="text-white-500 hover:text-green-700 edit-button"
                      title="Duplicar"
                    >
                      <CopyPlus size={20} />
                    </button>
                    <button
                      onClick={() => confirmDelete(recipe.id)}
                      className="text-white-500 hover:text-red-700 edit-button"
                      title="Eliminar"
                    >
                      <CircleX size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Paginación */}
          <div className="flex justify-center items-center gap-4 mt-6">
            <Button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              ← Anterior
            </Button>
            <span style={{ fontWeight: "bold", fontSize: "8px" }}>
              Página {currentPage}
            </span>
            <Button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={indexOfLastRecipe >= filteredRecipes.length}
            >
              Siguiente →
            </Button>
          </div>
        </div>

        {/* Modal de confirmación */}
        {openModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded shadow-md max-w-sm w-full">
              <h2 className="text-lg font-bold mb-4 text-[var(--primary)]">
                ¿Eliminar esta receta?
              </h2>
              <p className="mb-4 text-gray-700">
                Esta acción no se puede deshacer.
              </p>
              <div className="flex justify-end gap-2">
                <Button onClick={handleDelete}>Eliminar</Button>
                <Button onClick={closeModal}>Cancelar</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditRecipesPage;
