import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig"; // Asegúrate de tener configurado tu Firebase

const ViewRecipesPage = () => {
  const [recepies, setRecepies] = useState([]);

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
      } catch (error) {
        console.error("Error fetching recipes:", error);
      }
    };

    fetchRecepies();
  }, []);

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-4xl font-bold text-center mb-8">Mis Recetas</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {recepies.map((recipe) => (
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
              <p className="text-gray-700 mb-2">Costo: ${recipe.cost_recipe}</p>
              <p className="text-gray-700">
                Porciones: {recipe.quantity_portions}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ViewRecipesPage;
