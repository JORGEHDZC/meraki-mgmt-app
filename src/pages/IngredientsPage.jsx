import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebaseConfig";
import { ArrowLeft, CirclePlus, ArrowRight } from "lucide-react";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
} from "firebase/firestore";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";

import { Button } from "../components/ui/Button";

const normalizeIngredient = (ingredient) => {
  return ingredient
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
};

export default function IngredientsPage() {
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
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

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

  const handleSaveIngredient = async () => {
    if (!currentIngredient.trim()) {
      setSnackbarMessage("El nombre del ingrediente no puede estar vacío");
      setSnackbarOpen(true);
      return;
    }

    if (!quantity || isNaN(quantity) || quantity <= 0) {
      setSnackbarMessage("La cantidad debe ser un número positivo");
      setSnackbarOpen(true);
      return;
    }

    if (isNaN(cost) || cost < 0) {
      setSnackbarMessage("El costo debe ser un número positivo");
      setSnackbarOpen(true);
      return;
    }

    const normalizedIngredient = normalizeIngredient(currentIngredient);
    const storage = getStorage();
    let imageUrl = "";

    try {
      if (imageFile) {
        if (!imageFile.type.startsWith("image/")) {
          setSnackbarMessage("El archivo debe ser una imagen.");
          setSnackbarOpen(true);
          return;
        }

        if (imageFile.size > 2 * 1024 * 1024) {
          setSnackbarMessage("La imagen es demasiado grande. Máximo 2MB.");
          setSnackbarOpen(true);
          return;
        }

        setIsUploading(true);
        setUploadProgress(0);

        const imageRef = ref(
          storage,
          `ingredients_images/${Date.now()}_${imageFile.name}`
        );
        const uploadTask = uploadBytesResumable(imageRef, imageFile);

        await new Promise((resolve, reject) => {
          uploadTask.on(
            "state_changed",
            (snapshot) => {
              const progress =
                (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              setUploadProgress(progress);
            },
            (error) => {
              console.error("Error al subir la imagen:", error);
              setSnackbarMessage("Hubo un problema al subir la imagen.");
              setSnackbarOpen(true);
              setIsUploading(false);
              reject(error);
            },
            async () => {
              imageUrl = await getDownloadURL(uploadTask.snapshot.ref);
              setIsUploading(false);
              resolve();
            }
          );
        });
      }

      if (editMode) {
        const ingredientDoc = doc(db, "ingredients", ingredientToEdit);
        await updateDoc(ingredientDoc, {
          name: currentIngredient.trim(),
          quantity,
          cost,
          unit,
          ...(imageUrl && { imageUrl }),
        });
        await handleUpdateIngredientCostOrQuantity(
          ingredientToEdit,
          cost,
          quantity
        );
        setSnackbarMessage(`${currentIngredient} actualizado correctamente`);
      } else {
        const exists = ingredients.some(
          (ing) => normalizeIngredient(ing.name) === normalizedIngredient
        );
        if (exists) {
          setSnackbarMessage("El ingrediente ya existe");
          setSnackbarOpen(true);
          return;
        }

        await addDoc(ingredientsCollectionRef, {
          name: currentIngredient.trim(),
          quantity,
          cost,
          unit,
          imageUrl,
        });
        setSnackbarMessage(`${currentIngredient} agregado correctamente`);
      }

      const data = await getDocs(ingredientsCollectionRef);
      setIngredients(data.docs.map((doc) => ({ id: doc.id, ...doc.data() })));

      setCurrentIngredient("");
      setQuantity("");
      setCost("");
      setImageFile(null);
      setPreviewUrl(null);
      setUnit("gramos");
      setEditMode(false);
      setIngredientToEdit("");
      setSnackbarOpen(true);
      setTimeout(() => setSnackbarOpen(false), 1500);
    } catch (error) {
      console.error("Error al guardar el ingrediente:", error);
      setSnackbarMessage("Ocurrió un error al guardar el ingrediente.");
      setSnackbarOpen(true);
      setIsUploading(false);
    }
  };

  const handleEditIngredient = (ingredient) => {
    setCurrentIngredient(ingredient.name);
    setQuantity(ingredient.quantity || "");
    setCost(ingredient.cost || "");
    setUnit(ingredient.unit || "gramos");
    setEditMode(true);
    setIngredientToEdit(ingredient.id);
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

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    const filtered = ingredients.filter((ing) =>
      ing.name.toLowerCase().includes(e.target.value.toLowerCase())
    );
    setNoResultsMessage(
      filtered.length === 0 && e.target.value.trim() !== ""
        ? `${e.target.value} no existe, favor de agregarlo`
        : ""
    );
  };

  const filteredIngredients = ingredients
    .filter((ing) => ing.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => a.name.localeCompare(b.name));

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentIngredients = filteredIngredients.slice(
    indexOfFirst,
    indexOfLast
  );

  const handlePageChange = (dir) => {
    setCurrentPage((prev) =>
      dir === "next" ? prev + 1 : dir === "prev" && prev > 1 ? prev - 1 : prev
    );
  };

  const openDeleteModal = (id) => {
    setIngredientToDelete(id);
    setOpenModal(true);
  };

  const closeDeleteModal = () => {
    setOpenModal(false);
    setIngredientToDelete("");
  };

  const updateRecipesWithModifiedIngredient = async (id, newCost, newQty) => {
    const q = query(collection(db, "recepies"));
    const snapshot = await getDocs(q);

    for (const recipeDoc of snapshot.docs) {
      const data = recipeDoc.data();
      const updatedIngredients = data.ingredients_list.map((ing) => {
        if (ing.ingredient_id === id) {
          const costByQty = ((newCost / newQty) * ing.quantity_used).toFixed(2);
          return {
            ...ing,
            cost: newCost,
            quantity: newQty,
            cost_by_quantity_used: costByQty,
          };
        }
        return ing;
      });

      const totalCost = updatedIngredients
        .reduce((sum, ing) => sum + parseFloat(ing.cost_by_quantity_used), 0)
        .toFixed(2);

      if (data.ingredients_list.some((ing) => ing.ingredient_id === id)) {
        await updateDoc(doc(db, "recepies", recipeDoc.id), {
          ingredients_list: updatedIngredients,
          cost_recipe: totalCost,
        });
      }
    }
  };

  const handleUpdateIngredientCostOrQuantity = async (id, cost, qty) => {
    await updateRecipesWithModifiedIngredient(id, cost, qty);
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        <div className="card">
          <h1 className="card-title">Lista de Ingredientes</h1>

          <div className="button-stack">
            <Button
              className="dashboard-button"
              onClick={() => navigate("/dashboard")}
            >
              <ArrowLeft size={30} />
              <span>Dashboard</span>
            </Button>
          </div>

          <h2 style={{ fontSize: "1.5em", marginTop: "1em" }}>
            {editMode ? "Editar Ingrediente" : "Agregar Nuevo Ingrediente"}
          </h2>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1em",
              marginTop: "1em",
            }}
          >
            <input
              type="text"
              placeholder="Nombre del Ingrediente"
              value={currentIngredient}
              onChange={(e) => setCurrentIngredient(e.target.value)}
              className="rounded-md p-2 border border-gray-300"
            />
            <input
              type="number"
              placeholder="Cantidad"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="rounded-md p-2 border border-gray-300"
            />
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="rounded-md p-2 border border-gray-300"
            >
              <option value="gramos">Gramos</option>
              <option value="mililitros">Mililitros</option>
              <option value="piezas">Piezas</option>
            </select>
            <input
              type="number"
              placeholder="Costo"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              className="rounded-md p-2 border border-gray-300"
            />
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files[0];
                setImageFile(file);
                if (file) {
                  const reader = new FileReader();
                  reader.onloadend = () => setPreviewUrl(reader.result);
                  reader.readAsDataURL(file);
                } else {
                  setPreviewUrl(null);
                }
              }}
              className="rounded-md p-2 border border-gray-300"
            />
            {previewUrl && (
              <div style={{ position: "relative", marginBottom: "1em" }}>
                <img
                  src={previewUrl}
                  alt="Vista previa"
                  className="rounded-md shadow-md"
                  style={{
                    width: "100%",
                    maxHeight: "200px",
                    objectFit: "cover",
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    setImageFile(null);
                    setPreviewUrl(null);
                  }}
                  className="remove-image-button"
                  aria-label="Eliminar imagen"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="white"
                  >
                    <path d="M3 6h18v2H3V6zm2 3h14v13H5V9zm3 2v9h2v-9H8zm4 0v9h2v-9h-2z" />
                  </svg>
                </button>
              </div>
            )}

            {isUploading && (
              <div style={{ marginBottom: "1em" }}>
                <p style={{ color: "var(--primary)", fontWeight: "bold" }}>
                  Subiendo imagen... 🍰
                </p>
                <div
                  style={{
                    height: "8px",
                    backgroundColor: "#fbe3e4",
                    borderRadius: "4px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${uploadProgress}%`,
                      height: "100%",
                      backgroundColor: "var(--primary)",
                      transition: "width 0.3s ease",
                    }}
                  ></div>
                </div>
              </div>
            )}

            {isUploading && (
              <p style={{ color: "var(--primary)", fontWeight: "bold" }}>
                Subiendo imagen... 🍰
              </p>
            )}

            <Button onClick={handleSaveIngredient} className="edit-button">
              <CirclePlus size={30} />
              <span>
                {editMode ? "Actualizar Ingrediente" : "Agregar Ingrediente"}
              </span>
            </Button>
            <input
              type="text"
              placeholder="Buscar Ingredientes"
              value={searchQuery}
              onChange={handleSearchChange}
              className="rounded-md p-2 border border-gray-300"
            />
            {noResultsMessage && (
              <p style={{ color: "red" }}>{noResultsMessage}</p>
            )}
          </div>
        </div>

        <div className="card">
          <div className="ingredient-list">
            {currentIngredients.map((ingredient) => (
              <div key={ingredient.id} className="card ingredient-card">
                {ingredient.imageUrl && (
                  <img
                    src={ingredient.imageUrl}
                    alt={`Imagen de ${ingredient.name}`}
                    className="ingredient-image"
                  />
                )}
                <div style={{ padding: "0.5em 0" }}>
                  <h3
                    style={{
                      fontSize: "1.2em",
                      marginBottom: "0.5em",
                      color: "var(--primary)",
                    }}
                  >
                    <span className="font-bold">{ingredient.name}</span>
                  </h3>
                  <p
                    style={{
                      fontSize: "0.95em",
                      color: "var(--text-dark)",
                      marginBottom: "0.5em",
                    }}
                  >
                    <span>
                      Cantidad:{" "}
                      <span className="font-bold">
                        {ingredient.quantity}{" "}
                        {ingredient.unit === "mililitros"
                          ? "ml"
                          : ingredient.unit === "gramos"
                          ? "gr"
                          : "pz"}
                      </span>
                    </span>

                    <br />
                    <span>
                      Costo:{" "}
                      <span className="font-bold">${ingredient.cost}</span>
                    </span>
                  </p>
                </div>
                <div className="button-stack">
                  <Button onClick={() => handleEditIngredient(ingredient)}>
                    Editar
                  </Button>
                  <Button onClick={() => openDeleteModal(ingredient.id)}>
                    Eliminar
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <br />

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Button
              onClick={() => handlePageChange("prev")}
              disabled={currentPage === 1}
            >
              <ArrowLeft size={30}></ArrowLeft>
              <span>Anterior</span>
            </Button>
            <span>Página {currentPage}</span>
            <Button
              onClick={() => handlePageChange("next")}
              disabled={indexOfLast >= filteredIngredients.length}
            >
              <span>Siguiente</span>
              <ArrowRight size={30}></ArrowRight>
            </Button>
          </div>
        </div>
      </div>

      {snackbarOpen && (
        <div className="fixed bottom-4 left-4 bg-green-500 text-white p-4 rounded-md shadow-md">
          {snackbarMessage}
        </div>
      )}

      {openModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-4 rounded-md relative max-w-sm w-full">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              onClick={closeDeleteModal}
            >
              &times;
            </button>
            <h2 className="text-xl font-bold mb-2">
              Confirmación de Eliminación
            </h2>
            <p>¿Está seguro de que desea eliminar este ingrediente?</p>
            <div className="flex justify-end mt-4 gap-2">
              <Button onClick={closeDeleteModal}>Cancelar</Button>
              <Button onClick={handleDeleteIngredient}>Eliminar</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
