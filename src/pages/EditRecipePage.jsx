import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  getDocs,
  query,
} from "firebase/firestore";
import { db, storage } from "../firebaseConfig"; // Import Firebase storage
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage"; // Import Firebase storage functions
import { Delete } from "@mui/icons-material";

const EditRecipePage = () => {
  const { id } = useParams(); // Obtener el ID de la receta desde los parámetros de la URL
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState({
    recipe_name: "",
    cost_recipe: 0,
    quantity_portions: 0,
    ingredients_list: [],
    image_url: "", // Added field for the recipe image
  }); // Estado para almacenar la receta
  const [ingredientOptions, setIngredientOptions] = useState([]); // Opciones de ingredientes desde la base de datos
  const [ingredientInput, setIngredientInput] = useState(""); // Ingrediente seleccionado para agregar
  const [quantityUsed, setQuantityUsed] = useState(""); // Cantidad usada del nuevo ingrediente
  const [loading, setLoading] = useState(true); // Estado para controlar el cargando
  const [filteredOptions, setFilteredOptions] = useState([]);
  const [newImage, setNewImage] = useState(null); // State to store the new image file
  const [uploading, setUploading] = useState(false); // State to handle upload progress
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  // Función para obtener la receta desde Firestore
  const fetchRecipe = async () => {
    try {
      const recipeRef = doc(db, "recepies", id);
      const recipeSnap = await getDoc(recipeRef);
      if (recipeSnap.exists()) {
        const recipeData = recipeSnap.data();
        const ingredientsWithDetails = await fetchIngredientDetails(
          recipeData.ingredients_list
        );
        setRecipe({ ...recipeData, ingredients_list: ingredientsWithDetails });
      } else {
        console.log("La receta no existe");
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching recipe:", error);
      setLoading(false);
    }
  };

  // Función para obtener los detalles de los ingredientes desde Firestore
  const fetchIngredientDetails = async (ingredientsList) => {
    const updatedIngredients = await Promise.all(
      ingredientsList.map(async (ingredient) => {
        const ingredientData = await getDoc(
          doc(db, "ingredients", ingredient.ingredient_id)
        );
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
    const q = query(collection(db, "ingredients"));
    const querySnapshot = await getDocs(q);
    const ingredients = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setIngredientOptions(ingredients);
  };

  // Cargar la receta y los ingredientes cuando el componente se monte
  useEffect(() => {
    fetchRecipe();
    fetchIngredients();
  }, [id]);

  // Filter ingredients based on input
  useEffect(() => {
    if (ingredientInput) {
      const filtered = ingredientOptions.filter((ingredient) =>
        ingredient.name.toLowerCase().includes(ingredientInput.toLowerCase())
      );
      setFilteredOptions(filtered);
    } else {
      setFilteredOptions([]); // Clear the options when there is no input
    }
  }, [ingredientInput, ingredientOptions]);

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
        const newCostByQuantityUsed =
          (ingredient.cost / ingredient.quantity) * newQuantityUsed;
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
      const recipeRef = doc(db, "recepies", id);
      await updateDoc(recipeRef, {
        recipe_name: recipe.recipe_name,
        ingredients_list: recipe.ingredients_list,
        cost_recipe: recipe.cost_recipe, // Guardar el costo total actualizado
        quantity_portions: recipe.quantity_portions,
        image_url: recipe.image_url, // Ensure the image_url is saved
      });
      navigate("/recipe-detail"); // Redirigir al listado de recetas después de actualizar
    } catch (error) {
      console.error("Error updating recipe:", error);
    }
  };

  // Función para manejar la selección de un nuevo archivo de imagen
  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setNewImage(e.target.files[0]);
    }
  };

  // Función para subir la nueva imagen a Firebase Storage
  const handleImageUpload = () => {
    if (!newImage) return;

    setUploading(true);
    const storageRef = ref(storage, `recipe_images/${id}`);
    const uploadTask = uploadBytesResumable(storageRef, newImage);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        setSnackbarMessage("La imagen está cargada...");
        setSnackbarOpen(true);
        setTimeout(() => {
          setSnackbarOpen(false);
        }, 1500);
      },
      (error) => {
        console.error("Error uploading image:", error);
        setUploading(false);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          setRecipe((prevRecipe) => ({
            ...prevRecipe,
            image_url: downloadURL, // Update the image_url with the new download link
          }));
          setUploading(false);
        });
      }
    );
  };

  // Calcular el costo total de la receta
  const calculateTotalCost = (ingredientsList) => {
    return ingredientsList
      .reduce((total, ing) => total + parseFloat(ing.cost_by_quantity_used), 0)
      .toFixed(2);
  };

  // Función para eliminar un ingrediente de la receta
  const handleDeleteIngredient = (ingredientId) => {
    const updatedIngredients = recipe.ingredients_list.filter(
      (ingredient) => ingredient.ingredient_id !== ingredientId
    );
    // Actualizar la lista de ingredientes y el costo total de la receta
    setRecipe((prevRecipe) => ({
      ...prevRecipe,
      ingredients_list: updatedIngredients,
      cost_recipe: calculateTotalCost(updatedIngredients), // Recalcular el costo total
    }));
  };

  // Add ingredient to the list
  const handleAddIngredient = () => {
    const ingredient = ingredientOptions.find(
      (ing) => ing.name === ingredientInput
    );
    if (ingredient && quantityUsed) {
      const cost = (ingredient.cost / ingredient.quantity) * quantityUsed;
      setRecipe((prevRecipe) => ({
        ...prevRecipe,
        ingredients_list: [
          ...prevRecipe.ingredients_list,
          {
            ingredient_id: ingredient.id,
            name: ingredient.name,
            quantity_used: parseInt(quantityUsed, 10),
            cost_by_quantity_used: cost.toFixed(2),
            unit: ingredient.unit,
          },
        ],
        cost_recipe: (
          parseFloat(prevRecipe.cost_recipe) + parseFloat(cost)
        ).toFixed(2),
      }));
      setIngredientInput(""); // Clear input after adding ingredient
      setFilteredOptions([]); // Hide dropdown after adding ingredient
      setQuantityUsed(""); // Clear quantity input
    } else {
      alert("Please select an ingredient and enter a valid quantity.");
    }
  };

  // Función para regresar al listado de recetas sin hacer cambios
  const goBack = () => {
    navigate("/recipe-detail");
  };

  if (loading) {
    return <p className="text-center text-lg">Cargando receta...</p>;
  }

  return (
    <div className="container mx-auto py-4">
      <div className="max-w-lg mx-auto bg-white p-6 shadow-md rounded-md">
        <h1 className="text-3xl font-semibold mb-4">Editar Receta:</h1>
        <h2 className="text-2xl font-semibold mb-4">{recipe.recipe_name}</h2>

        {/* Show recipe image */}
        {recipe.image_url && (
          <div className="mb-4">
            <img
              src={recipe.image_url}
              alt={recipe.recipe_name}
              className="w-full h-auto object-cover rounded-md"
            />
          </div>
        )}

        <input
          type="text"
          name="recipe_name"
          value={recipe.recipe_name}
          onChange={handleInputChange}
          className="w-full mb-4 p-2 border border-gray-300 rounded-md"
          placeholder="Nombre de la receta"
        />

        <input
          type="number"
          name="cost_recipe"
          value={recipe.cost_recipe}
          onChange={handleInputChange}
          className="w-full mb-4 p-2 border border-gray-300 rounded-md"
          disabled
          placeholder="Costo de la receta"
        />

        <input
          type="number"
          name="quantity_portions"
          value={recipe.quantity_portions}
          onChange={handleInputChange}
          className="w-full mb-4 p-2 border border-gray-300 rounded-md"
          placeholder="Porciones"
        />

        <h2 className="text-xl font-medium mb-2">Ingredientes</h2>

        <ul className="mb-4">
          {recipe.ingredients_list.map((ingredient) => (
            <li
              key={ingredient.ingredient_id}
              className="flex items-center mb-2"
            >
              <div className="flex-1">
                <p className="font-semibold">{ingredient.name}</p>
                <p className="text-sm text-gray-600">{`Costo: $${ingredient.cost_by_quantity_used}`}</p>
              </div>
              <input
                type="number"
                value={ingredient.quantity_used}
                onChange={(e) =>
                  handleEditQuantity(ingredient.ingredient_id, e.target.value)
                }
                className="w-20 mr-4 p-2 border border-gray-300 rounded-md"
              />
              <button
                onClick={() => handleDeleteIngredient(ingredient.ingredient_id)}
                className="text-red-500 hover:text-red-700"
              >
                <Delete />
              </button>
            </li>
          ))}
        </ul>

        {/* Ingredient Search Input */}
        <div className="relative w-full mb-4">
          <input
            type="text"
            placeholder="Buscar Ingrediente"
            className="w-full p-2 border border-gray-300 rounded-md"
            value={ingredientInput}
            onChange={(e) => setIngredientInput(e.target.value)}
          />

          {/* Show filtered options */}
          {ingredientInput && filteredOptions.length > 0 && (
            <ul className="absolute bg-white border border-gray-300 rounded-md mt-1 w-full z-10">
              {filteredOptions.map((option) => (
                <li
                  key={option.id}
                  className="p-2 hover:bg-blue-100 cursor-pointer"
                  onClick={() => {
                    setIngredientInput(option.name);
                    setFilteredOptions([]);
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
          value={quantityUsed}
          onChange={(e) => setQuantityUsed(e.target.value)}
          className="w-full mb-4 p-2 border border-gray-300 rounded-md"
          placeholder="Cantidad Usada"
        />

        <button
          onClick={handleAddIngredient}
          className="w-full mb-4 bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600"
        >
          Añadir Ingrediente
        </button>

        {/* Upload image section */}
        <div className="mb-4">
          <input
            type="file"
            onChange={handleImageChange}
            className="w-full mb-2"
          />
          <button
            onClick={handleImageUpload}
            className={`w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 ${
              uploading ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={uploading}
          >
            {uploading ? "Subiendo Imagen..." : "Subir Imagen"}
            {snackbarOpen && (
              <div className="fixed bottom-4 left-4 bg-green-500 text-white p-4 rounded-md">
                {snackbarMessage}
              </div>
            )}
          </button>
        </div>

        <div className="flex justify-between">
          <button
            onClick={handleUpdate}
            className="w-1/2 mr-2 bg-green-500 text-white p-2 rounded-md hover:bg-green-600"
          >
            Actualizar Receta
          </button>
          <button
            onClick={goBack}
            className="w-1/2 ml-2 bg-gray-500 text-white p-2 rounded-md hover:bg-gray-600"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditRecipePage;
