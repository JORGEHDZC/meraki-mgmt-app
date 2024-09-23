import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { useNavigate } from "react-router-dom";

const ViewRecipesPage = () => {
  const [recepies, setRecepies] = useState([]);
  const [filteredRecepies, setFilteredRecepies] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [portionsMap, setPortionsMap] = useState({}); // Para manejar las porciones por receta
  const recipesPerPage = 3;
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

        // Inicializar el estado de porciones basado en las porciones originales
        const initialPortionsMap = {};
        recepiesList.forEach((recipe) => {
          initialPortionsMap[recipe.id] = recipe.quantity_portions;
        });
        setPortionsMap(initialPortionsMap);
      } catch (error) {
        console.error("Error fetching recipes:", error);
      }
    };

    fetchRecepies();
  }, []);

  // Filtrar recetas basadas en el término de búsqueda
  useEffect(() => {
    const filtered = recepies.filter((recipe) =>
      recipe.recipe_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredRecepies(filtered);
    setCurrentPage(1);
  }, [searchTerm, recepies]);

  // Obtener las recetas para la página actual
  const indexOfLastRecipe = currentPage * recipesPerPage;
  const indexOfFirstRecipe = indexOfLastRecipe - recipesPerPage;
  const currentRecipes = filteredRecepies.slice(
    indexOfFirstRecipe,
    indexOfLastRecipe
  );

  // Función para recalcular el costo y las cantidades de los ingredientes
  const recalculateRecipe = (recipe, selectedPortions) => {
    const originalPortions = recipe.quantity_portions; // Porciones originales almacenadas en la receta
    const portionFactor = selectedPortions / originalPortions;

    const updatedIngredients = recipe.ingredients_list.map((ingredient) => {
      // Recalcular la cantidad usada aplicando el factor de porciones
      const newQuantityUsed = (
        ingredient.quantity_used * portionFactor
      ).toFixed(2);
      const newCostByQuantityUsed = (
        (ingredient.cost / ingredient.quantity) *
        newQuantityUsed
      ).toFixed(2);

      return {
        ...ingredient,
        quantity_used: newQuantityUsed,
        cost_by_quantity_used: newCostByQuantityUsed,
      };
    });

    // Calcular el costo total basado en las nuevas cantidades
    const updatedCostRecipe = updatedIngredients
      .reduce((total, ing) => total + parseFloat(ing.cost_by_quantity_used), 0)
      .toFixed(2);

    return {
      ...recipe,
      ingredients_list: updatedIngredients,
      cost_recipe: updatedCostRecipe,
    };
  };

  // Cambiar página
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Actualizar las porciones seleccionadas para una receta específica
  const handlePortionChange = (recipeId, newPortions) => {
    setPortionsMap((prevPortionsMap) => ({
      ...prevPortionsMap,
      [recipeId]: newPortions,
    }));
  };

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
        {currentRecipes.map((recipe) => {
          const selectedPortions =
            portionsMap[recipe.id] || recipe.quantity_portions;

          const updatedRecipe = recalculateRecipe(recipe, selectedPortions);

          return (
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
                <h2 className="text-2xl font-bold mb-2">
                  {recipe.recipe_name}
                </h2>
                <p className="text-gray-700">
                  Precio: <b>${updatedRecipe.cost_recipe}</b>
                </p>
                <p className="text-gray-700">
                  Porciones: <b>{selectedPortions}</b>
                </p>

                {/* Selector de porciones independiente por receta */}
                <div className="mb-4">
                  <label className="mr-4">Seleccionar porciones:</label>
                  <select
                    value={selectedPortions}
                    onChange={(e) =>
                      handlePortionChange(recipe.id, parseInt(e.target.value))
                    }
                    className="border border-gray-300 p-2 rounded"
                  >
                    <option value={10}>10 porciones</option>
                    <option value={15}>15 porciones</option>
                    <option value={20}>20 porciones</option>
                  </select>
                </div>

                <ul className="text-gray-700 mt-2">
                  {updatedRecipe.ingredients_list.map((ingredient) => (
                    <li key={ingredient.ingredient_id}>
                      {ingredient.name}: {ingredient.quantity_used}{" "}
                      {ingredient.unit}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
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
