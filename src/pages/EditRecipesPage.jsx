import { useEffect, useState, useMemo } from "react";
import {
  collection,
  getDocs,
  doc,
  deleteDoc,
  addDoc,
} from "firebase/firestore";
import { db } from "../firebaseConfig";
import { useNavigate } from "react-router-dom";
import Fuse from "fuse.js";
import { Pencil, CircleX, CopyPlus, CirclePlus, ArrowLeft } from "lucide-react";
import { Button } from "../components/ui/Button";

const EditRecipesPage = () => {
  const [recipes, setRecipes] = useState([]);
  const [filteredRecipes, setFilteredRecipes] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [recipeToDelete, setRecipeToDelete] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const recipesPerPage = 5;
  const navigate = useNavigate();

  const fetchRecipes = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "recepies"));
      const fetchedRecipes = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      const sortedRecipes = fetchedRecipes.sort((a, b) =>
        a.recipe_name.localeCompare(b.recipe_name)
      );
      setRecipes(sortedRecipes);
      setFilteredRecipes(sortedRecipes);
    } catch (error) {
      console.error("Error fetching recepies:", error);
    }
  };

  const handleDelete = async () => {
    if (recipeToDelete) {
      try {
        await deleteDoc(doc(db, "recepies", recipeToDelete));
        setRecipes((prev) => prev.filter((r) => r.id !== recipeToDelete));
        setFilteredRecipes((prev) =>
          prev.filter((r) => r.id !== recipeToDelete)
        );
        setOpenModal(false);
        setRecipeToDelete(null);
      } catch (error) {
        console.error("Error deleting recipe:", error);
      }
    }
  };

  const handleDuplicate = async (id) => {
    const recipeToDuplicate = recipes.find((r) => r.id === id);
    if (recipeToDuplicate) {
      const duplicatedRecipe = {
        ...recipeToDuplicate,
        recipe_name: `${recipeToDuplicate.recipe_name} - duplicated`,
      };
      delete duplicatedRecipe.id;
      try {
        await addDoc(collection(db, "recepies"), duplicatedRecipe);
        fetchRecipes();
      } catch (error) {
        console.error("Error duplicating recipe:", error);
      }
    }
  };

  const confirmDelete = (id) => {
    setRecipeToDelete(id);
    setOpenModal(true);
  };

  const closeModal = () => {
    setOpenModal(false);
    setRecipeToDelete(null);
  };

  useEffect(() => {
    fetchRecipes();
  }, []);

  const normalizeText = (text) =>
    text
      .toLowerCase()
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .trim();

  const fuse = useMemo(() => {
    return new Fuse(recipes, {
      keys: ["recipe_name"],
      threshold: 0.4,
      ignoreLocation: true,
      includeScore: false,
      useExtendedSearch: true,
    });
  }, [recipes]);

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (!value.trim()) {
      setFilteredRecipes(recipes);
    } else {
      const result = fuse.search(normalizeText(value));
      const matches = result.map((res) => res.item);
      setFilteredRecipes(matches);
    }

    setCurrentPage(1);
  };

  const indexOfLastRecipe = currentPage * recipesPerPage;
  const indexOfFirstRecipe = indexOfLastRecipe - recipesPerPage;
  const currentRecipes = filteredRecipes.slice(
    indexOfFirstRecipe,
    indexOfLastRecipe
  );

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
                  <div className="flex items-center gap-4">
                    {recipe.image_url && (
                      <div className="w-[100px] h-[100px] overflow-hidden rounded shadow">
                        <img
                          src={recipe.image_url}
                          alt={recipe.recipe_name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div>
                      <h3 className="text-lg font-semibold text-[var(--primary)]">
                        <span className="font-bold">{recipe.recipe_name}</span>
                      </h3>
                      <p className="text-gray-600">
                        Costo:{" "}
                        <span className="font-bold">${recipe.cost_recipe}</span>
                      </p>
                    </div>
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
