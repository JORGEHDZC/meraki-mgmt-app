import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { db, storage } from "../firebaseConfig"; // Ensure your Firebase config is correctly imported
import { collection, addDoc, getDocs } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useNavigate } from "react-router-dom"; // Hook for navigation

const CreateRecipePage = () => {
  const [recipeName, setRecipeName] = useState("");
  const [quantityPortions, setQuantityPortions] = useState("");
  const [ingredientsList, setIngredientsList] = useState([]);
  const [ingredientInput, setIngredientInput] = useState("");
  const [quantityUsed, setQuantityUsed] = useState("");
  const [createDate, setCreateDate] = useState(new Date());
  const [ingredientOptions, setIngredientOptions] = useState([]);
  const [filteredOptions, setFilteredOptions] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchIngredients = async () => {
      const q = collection(db, "ingredients");
      const querySnapshot = await getDocs(q);
      const ingredients = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setIngredientOptions(ingredients);
    };

    fetchIngredients();
  }, []);

  // Filter ingredients as the user types in the input
  useEffect(() => {
    const filtered = ingredientOptions.filter((ingredient) =>
      ingredient.name.toLowerCase().includes(ingredientInput.toLowerCase())
    );
    setFilteredOptions(filtered);
  }, [ingredientInput, ingredientOptions]);

  const handleAddIngredient = () => {
    const ingredient = ingredientOptions.find(
      (ing) => ing.name === ingredientInput
    );
    if (ingredient && quantityUsed) {
      const cost = (ingredient.cost / ingredient.quantity) * quantityUsed;
      setIngredientsList((prevList) => [
        ...prevList,
        {
          id: ingredient.id,
          name: ingredient.name,
          quantityUsed: parseInt(quantityUsed, 10),
          costByQuantityUsed: cost.toFixed(2),
          unit: ingredient.unit,
        },
      ]);
      setIngredientInput(""); // Clear input after adding ingredient
      setFilteredOptions([]); // Hide dropdown after adding ingredient
      setQuantityUsed(""); // Clear quantity input
    } else {
      setSnackbarMessage("Ingrediente no encontrado o sin cantidad usada");
      setSnackbarOpen(true);
    }
  };

  const calculateTotalCost = () => {
    return ingredientsList
      .reduce((total, ing) => total + parseFloat(ing.costByQuantityUsed), 0)
      .toFixed(2);
  };

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSaveRecipe = async () => {
    setLoading(true);
    let imageUrl = "";
    if (imageFile) {
      imageUrl = await uploadImageToStorage();
    }

    if (
      recipeName &&
      quantityPortions &&
      ingredientsList.length >= 3 &&
      createDate
    ) {
      const recipeData = {
        recipe_name: recipeName,
        ingredients_list: ingredientsList.map((ing) => ({
          ingredient_id: ing.id,
          quantity_used: ing.quantityUsed,
          cost_by_quantity_used: ing.costByQuantityUsed,
        })),
        quantity_portions: parseInt(quantityPortions, 10),
        cost_recipe: calculateTotalCost(),
        create_date: createDate,
        image_url: imageUrl,
      };

      try {
        await addDoc(collection(db, "recepies"), recipeData);
        setSnackbarMessage("Receta guardada exitosamente");
        setSnackbarOpen(true);

        setRecipeName("");
        setQuantityPortions("");
        setIngredientsList([]);
        setCreateDate(new Date());
        setImageFile(null);
        setImageUrl("");
      } catch (error) {
        console.error("Error al guardar la receta:", error);
        setSnackbarMessage("Error al guardar la receta");
        setSnackbarOpen(true);
      }
    } else {
      setSnackbarMessage("Complete todos los campos requeridos");
      setSnackbarOpen(true);
    }

    setLoading(false);
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col h-screen overflow-y-auto">
        <h1 className="text-4xl font-bold mb-4">Crear Nueva Receta</h1>

        <input
          type="text"
          placeholder="Nombre de la Receta"
          className="w-full mb-4 p-2 border border-gray-300 rounded-md"
          value={recipeName}
          onChange={(e) => setRecipeName(e.target.value)}
        />

        <input
          type="number"
          placeholder="Número de Porciones"
          className="w-full mb-4 p-2 border border-gray-300 rounded-md"
          value={quantityPortions}
          onChange={(e) => setQuantityPortions(e.target.value)}
        />

        {/* Ingredient Search Input */}
        <div className="relative w-full mb-4">
          <input
            type="text"
            placeholder="Buscar Ingrediente"
            className="w-full p-2 border border-gray-300 rounded-md"
            value={ingredientInput}
            onChange={(e) => setIngredientInput(e.target.value)}
          />
          
          {/* Show the filtered options only when the user has typed something */}
          {ingredientInput && filteredOptions.length > 0 && (
            <ul className="absolute bg-white border border-gray-300 rounded-md mt-1 w-full z-10">
              {filteredOptions.map((option) => (
                <li
                  key={option.id}
                  className="p-2 hover:bg-blue-100 cursor-pointer"
                  onClick={() => {
                    setIngredientInput(option.name);
                    setFilteredOptions([]); // Hide the dropdown after selection
                  }}
                >
                  {option.name}
                </li>
              ))}
            </ul>
          )}
        </div>

        <input
          type="number"
          placeholder="Cantidad Usada"
          className="w-full mb-4 p-2 border border-gray-300 rounded-md"
          value={quantityUsed}
          onChange={(e) => setQuantityUsed(e.target.value)}
        />

        <button
          className="w-full mb-4 bg-blue-500 text-white p-2 rounded-md"
          onClick={handleAddIngredient}
        >
          Añadir Ingrediente
        </button>

        <div className="mb-4">
          <h2 className="text-lg font-bold">Subir Imagen de la Receta</h2>
          <input type="file" onChange={handleImageChange} />
        </div>

        {imageUrl && (
          <div className="mb-4">
            <h2 className="text-lg font-bold">Vista Previa de la Imagen:</h2>
            <img src={imageUrl} alt="Receta" className="w-full" />
          </div>
        )}

        <input
          type="text"
          placeholder={`Costo Total de la Receta: $${calculateTotalCost()}`}
          className="w-full mb-4 p-2 border border-gray-300 rounded-md"
          readOnly
        />

        <DatePicker
          selected={createDate}
          onChange={(date) => setCreateDate(date)}
          dateFormat="MMMM d, yyyy"
          className="w-full mb-4 p-2 border border-gray-300 rounded-md"
          placeholderText="Seleccionar fecha de creación"
        />

        <div className="flex justify-between">
          <button
            className="w-1/2 bg-blue-500 text-white p-2 rounded-md mr-2"
            onClick={handleSaveRecipe}
            disabled={loading}
          >
            {loading ? "Guardando..." : "Guardar Receta"}
          </button>
          <button
            className="w-1/2 bg-red-500 text-white p-2 rounded-md ml-2"
            onClick={() => navigate("/dashboard")}
          >
            Regresar al Dashboard
          </button>
        </div>

        {snackbarOpen && (
          <div className="fixed bottom-4 left-4 bg-green-500 text-white p-4 rounded-md">
            {snackbarMessage}
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateRecipePage;
