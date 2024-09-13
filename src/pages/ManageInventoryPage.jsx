import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebaseConfig";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query } from "firebase/firestore";

const normalizeIngredient = (ingredient) => {
  return ingredient
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
};

const ManageInventoryPage = () => {
  const [ingredients, setIngredients] = useState([]);
  const [currentIngredient, setCurrentIngredient] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("gramos");
  const [cost, setCost] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [ingredientToEdit, setIngredientToEdit] = useState("");
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [noResultsMessage, setNoResultsMessage] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [openModal, setOpenModal] = useState(false);
  const [ingredientToDelete, setIngredientToDelete] = useState("");

  const navigate = useNavigate();
  const ingredientsCollectionRef = collection(db, "ingredients");

  const itemsPerPage = 10;

  useEffect(() => {
    const fetchIngredients = async () => {
      const data = await getDocs(ingredientsCollectionRef);
      setIngredients(data.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    };

    fetchIngredients();
  }, []);

  const handleIngredientChange = (e) => {
    setCurrentIngredient(e.target.value);
  };

  const handleQuantityChange = (e) => {
    setQuantity(e.target.value);
  };

  const handleUnitChange = (e) => {
    setUnit(e.target.value);
  };

  const handleCostChange = (e) => {
    setCost(e.target.value);
  };

  const handleSaveIngredient = async () => {
    if (!currentIngredient.trim()) {
      setSnackbarMessage("El nombre del ingrediente no puede estar vacío");
      setSnackbarOpen(true);
      return;
    }

    if (!quantity || isNaN(parseInt(quantity, 10)) || parseInt(quantity, 10) <= 0) {
      setSnackbarMessage("La cantidad debe ser un número entero positivo");
      setSnackbarOpen(true);
      return;
    }

    if (isNaN(parseFloat(cost)) || parseFloat(cost) < 0) {
      setSnackbarMessage("El costo debe ser un número positivo");
      setSnackbarOpen(true);
      return;
    }

    const normalizedIngredient = normalizeIngredient(currentIngredient);

    if (editMode) {
      const ingredientDoc = doc(db, "ingredients", ingredientToEdit);
      await updateDoc(ingredientDoc, {
        name: currentIngredient.trim(),
        quantity,
        cost,
        unit,
      });
      await handleUpdateIngredientCostOrQuantity(ingredientToEdit, cost, quantity);
      setSnackbarMessage(`${currentIngredient} actualizado correctamente`);
      setSnackbarOpen(true);
      setTimeout(() => {
        setSnackbarOpen(false);
      }, 1500);
    } else {
      const ingredientExists = ingredients.some(
        (ingredient) => normalizeIngredient(ingredient.name) === normalizedIngredient
      );

      if (ingredientExists) {
        setSnackbarMessage("El ingrediente ya existe");
        setSnackbarOpen(true);
        return;
      }

      await addDoc(ingredientsCollectionRef, {
        name: currentIngredient.trim(),
        quantity,
        cost,
        unit,
      });
      setSnackbarMessage(`${currentIngredient} agregado correctamente`);
    }

    const data = await getDocs(ingredientsCollectionRef);
    setIngredients(data.docs.map((doc) => ({ id: doc.id, ...doc.data() })));

    setCurrentIngredient("");
    setQuantity("");
    setCost("");
    setEditMode(false);
    setIngredientToEdit("");
    setSnackbarOpen(true);
  };

  const handleDeleteIngredient = async () => {
    const ingredientDoc = doc(db, "ingredients", ingredientToDelete);
    await deleteDoc(ingredientDoc);
    const data = await getDocs(ingredientsCollectionRef);
    setIngredients(data.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    setSnackbarMessage("Ingrediente eliminado correctamente");
    setOpenModal(false);
    setSnackbarOpen(true);
  };

  const handleEditIngredient = (ingredient) => {
    setCurrentIngredient(ingredient.name);
    setQuantity(ingredient.quantity || "");
    setCost(ingredient.cost || "");
    setUnit(ingredient.unit || "gramos");
    setEditMode(true);
    setIngredientToEdit(ingredient.id);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    const filteredIngredients = ingredients.filter((ingredient) =>
      ingredient.name.toLowerCase().includes(e.target.value.toLowerCase())
    );
    if (filteredIngredients.length === 0 && e.target.value.trim() !== "") {
      setNoResultsMessage(`${e.target.value} no existe, favor de agregarlo`);
    } else {
      setNoResultsMessage("");
    }
  };

  const filteredIngredients = ingredients
    .filter((ingredient) => ingredient.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => a.name.localeCompare(b.name));

  const indexOfLastIngredient = currentPage * itemsPerPage;
  const indexOfFirstIngredient = indexOfLastIngredient - itemsPerPage;
  const currentIngredients = filteredIngredients.slice(indexOfFirstIngredient, indexOfLastIngredient);

  const handlePageChange = (direction) => {
    setCurrentPage((prevPage) => {
      if (direction === "next") {
        return prevPage + 1;
      } else if (direction === "prev" && prevPage > 1) {
        return prevPage - 1;
      }
      return prevPage;
    });
  };

  const openDeleteModal = (ingredientId) => {
    setIngredientToDelete(ingredientId);
    setOpenModal(true);
  };

  const closeDeleteModal = () => {
    setOpenModal(false);
    setIngredientToDelete("");
  };

  // Función para actualizar recetas cuando un ingrediente se modifica
  const updateRecipesWithModifiedIngredient = async (ingredientId, newCost, newQuantity) => {
    try {
      const q = query(collection(db, "recepies"));
      const querySnapshot = await getDocs(q);

      for (const recipeDoc of querySnapshot.docs) {
        const recipeData = recipeDoc.data();

        const updatedIngredients = recipeData.ingredients_list.map((ingredient) => {
          if (ingredient.ingredient_id === ingredientId) {
            const newCostByQuantityUsed = calculateNewCostByQuantityUsed(
              newCost,
              newQuantity,
              ingredient.quantity_used
            );
            return {
              ...ingredient,
              cost: newCost,
              quantity: newQuantity,
              cost_by_quantity_used: newCostByQuantityUsed,
            };
          }
          return ingredient;
        });

        const updatedRecipeCost = recalculateRecipeTotalCost(updatedIngredients);

        if (recipeData.ingredients_list.some((ingredient) => ingredient.ingredient_id === ingredientId)) {
          await updateDoc(doc(db, "recepies", recipeDoc.id), {
            ingredients_list: updatedIngredients,
            cost_recipe: updatedRecipeCost,
          });
        }
      }
    } catch (error) {
      console.error("Error actualizando las recetas:", error);
    }
  };

  // Función para calcular el nuevo cost_by_quantity_used
  const calculateNewCostByQuantityUsed = (cost, quantity, quantityUsed) => {
    return ((cost / quantity) * quantityUsed).toFixed(2);
  };

  // Función para recalcular el costo total de la receta
  const recalculateRecipeTotalCost = (ingredients_list) => {
    return ingredients_list
      .reduce((total, ing) => total + parseFloat(ing.cost_by_quantity_used), 0)
      .toFixed(2);
  };

  // Llama a esta función cuando se actualice el costo o la cantidad de un ingrediente
  const handleUpdateIngredientCostOrQuantity = async (ingredientId, newCost, newQuantity) => {
    await updateRecipesWithModifiedIngredient(ingredientId, newCost, newQuantity);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold mb-4">Gestión de Inventario</h1>

      <div className="mb-4">
        <button
          className="bg-red-500 text-white px-4 py-2 rounded mb-4"
          onClick={() => navigate("/dashboard")}
        >
          Regresar a Inventario
        </button>
      </div>

      <div className="mb-4">
        <h2 className="text-2xl font-bold mb-2">
          {editMode ? "Editar Ingrediente" : "Agregar Nuevo Ingrediente"}
        </h2>

        <input
          type="text"
          placeholder="Nombre del Ingrediente"
          className="w-full mb-4 p-2 border border-gray-300 rounded-md"
          value={currentIngredient}
          onChange={handleIngredientChange}
        />

        <input
          type="number"
          placeholder="Cantidad"
          className="w-full mb-4 p-2 border border-gray-300 rounded-md"
          value={quantity}
          onChange={handleQuantityChange}
        />

        <select
          className="w-full mb-4 p-2 border border-gray-300 rounded-md"
          value={unit}
          onChange={handleUnitChange}
        >
          <option value="gramos">Gramos</option>
          <option value="mililitros">Mililitros</option>
          <option value="piezas">Piezas</option>
        </select>

        <input
          type="number"
          placeholder="Costo"
          className="w-full mb-4 p-2 border border-gray-300 rounded-md"
          value={cost}
          onChange={handleCostChange}
        />

        <button
          className="w-full mb-4 bg-blue-500 text-white p-2 rounded-md"
          onClick={handleSaveIngredient}
        >
          {editMode ? "Actualizar Ingrediente" : "Agregar Ingrediente"}
        </button>

        <input
          type="text"
          placeholder="Buscar Ingredientes"
          className="w-full mb-4 p-2 border border-gray-300 rounded-md"
          value={searchQuery}
          onChange={handleSearchChange}
        />

        {noResultsMessage && (
          <p className="text-red-500">{noResultsMessage}</p>
        )}

        <ul className="mb-4">
          {currentIngredients.map((ingredient) => (
            <li
              key={ingredient.id}
              className="flex justify-between items-center border-b py-2"
            >
              <div className="flex flex-col">
                <span className="font-bold">{ingredient.name}</span>
                <ul className="text-left space-y-1">
                  <li>
                    <span className="text-gray-500">Cantidad: {ingredient.quantity} {ingredient.unit} </span>
                  </li>
                  <li>
                    <span className="text-gray-500">Costo: ${ingredient.cost} </span>
                  </li>
                </ul>
              </div>
              <div className="flex">
                <button
                  className="text-blue-500 mr-2"
                  onClick={() => handleEditIngredient(ingredient)}
                >
                  Editar
                </button>
                <button
                  className="text-red-500"
                  onClick={() => openDeleteModal(ingredient.id)}
                >
                  Eliminar
                </button>
              </div>
            </li>
          ))}
        </ul>

        <div className="flex justify-between">
          <button
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
            onClick={() => handlePageChange("prev")}
            disabled={currentPage === 1}
          >
            Anterior
          </button>
          <span>Página {currentPage}</span>
          <button
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
            onClick={() => handlePageChange("next")}
            disabled={indexOfLastIngredient >= filteredIngredients.length}
          >
            Siguiente
          </button>
        </div>
      </div>

      {snackbarOpen && (
        <div className="fixed bottom-4 left-4 bg-green-500 text-white p-4 rounded-md">
          {snackbarMessage}
        </div>
      )}

      {openModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-4 rounded-md relative">
            <button
              className="absolute top-0 right-0 m-2 text-gray-500 hover:text-gray-700"
              onClick={() => setOpenModal(false)}
            >
              &times;
            </button>
            <h2 className="text-xl font-bold mb-2">Confirmación de Eliminación</h2>
            <p>¿Está seguro de que desea eliminar este ingrediente?</p>
            <div className="flex justify-end mt-4">
              <button
                className="px-4 py-2 bg-gray-300 rounded-md mr-2"
                onClick={closeDeleteModal}
              >
                Cancelar
              </button>
              <button
                className="px-4 py-2 bg-red-500 text-white rounded-md"
                onClick={handleDeleteIngredient}
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageInventoryPage;
