import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig"; // Asegúrate de tener configurado tu Firebase
import { useNavigate } from "react-router-dom";

const ViewRecipesPage = () => {
  const [recepies, setRecepies] = useState([]);
  const [filteredRecepies, setFilteredRecepies] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const recipesPerPage = 3; // Máximo de recetas por página en dispositivos móviles
  const navigate = useNavigate();

  useEffect(() => {
    // Función para obtener las recetas desde Firebase
    const fetchRecepies = async () => {
      try {
        const recepiesCollection = collection(db, "recepies");
        const recepiesSnapshot = await getDocs(recepiesCollection);
        const recepiesList = recepiesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setRecepies(recepiesList);
        setFilteredRecepies(recepiesList);
      } catch (error) {
        console.error("Error fetching recipes:", error);
      }
    };

    fetchRecepies();
  }, []);

  // Filtra las recetas según el término de búsqueda
  useEffect(() => {
    const filtered = recepies.filter((recipe) =>
      recipe.recipe_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredRecepies(filtered);
    setCurrentPage(1); // Resetea la página actual al filtrar
  }, [searchTerm, recepies]);

  // Obtener las recetas para la página actual
  const indexOfLastRecipe = currentPage * recipesPerPage;
  const indexOfFirstRecipe = indexOfLastRecipe - recipesPerPage;
  const currentRecipes = filteredRecepies.slice(
    indexOfFirstRecipe,
    indexOfLastRecipe
  );

  // Cambiar página
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-4xl font-bold text-center mb-8">Mis Recetas</h1>
      <button
        className="bg-red-500 text-white px-4 py-2 rounded mb-4"
        onClick={() => navigate("/dashboard")}
      >
        Regresar al Dashboard
      </button>

      {/* Buscador */}
      <div className="flex justify-center mb-6">
        <input
          type="text"
          className="border border-gray-300 p-2 rounded w-full max-w-md"
          placeholder="Buscar receta..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Recetas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {currentRecipes.map((recipe) => (
          <div
            key={recipe.id}
            className="bg-white shadow-lg rounded-lg overflow-hidden"
          >
            <img
              src={recipe.image_url}
              alt={recipe.recipe_name}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h2 className="text-2xl font-bold mb-2">{recipe.recipe_name}</h2>
              <p className="text-gray-700 mb-2">
                Precio: ${recipe.cost_recipe}
              </p>
              <p className="text-gray-700">
                Porciones: {recipe.quantity_portions}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Paginación */}
      {filteredRecepies.length > recipesPerPage && (
        <div className="flex justify-center mt-8">
          <button
            className={`mx-2 px-4 py-2 bg-gray-200 rounded ${
              currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""
            }`}
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Anterior
          </button>
          <button
            className={`mx-2 px-4 py-2 bg-gray-200 rounded ${
              indexOfLastRecipe >= filteredRecepies.length
                ? "opacity-50 cursor-not-allowed"
                : ""
            }`}
            onClick={() => paginate(currentPage + 1)}
            disabled={indexOfLastRecipe >= filteredRecepies.length}
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
};

export default ViewRecipesPage;
