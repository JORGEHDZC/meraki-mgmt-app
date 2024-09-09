import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Button,
  TextField,
  Select,
  MenuItem,
  IconButton,
  List,
  ListItem,
  ListItemText,
  InputAdornment,
  Snackbar,
  Alert,
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  styled,
} from "@mui/material";
import { Edit, Delete as DeleteIcon, ArrowBack } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { db } from "../firebaseConfig"; // Importar Firestore
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
} from "firebase/firestore";
import { useMediaQuery, useTheme } from "@mui/material";

// Styled components for button outlines
const OutlinedButton = styled(Button)(({ color }) => ({
  borderColor: color,
  color: color,
  "&:hover": {
    borderColor: color,
    backgroundColor: `${color}20`,
  },
}));

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

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const isMediumScreen = useMediaQuery(theme.breakpoints.between("sm", "md"));

  const itemsPerPage = isSmallScreen ? 3 : isMediumScreen ? 5 : 10;

  useEffect(() => {
    const fetchIngredients = async () => {
      const data = await getDocs(ingredientsCollectionRef);
      setIngredients(data.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    };

    fetchIngredients();
  }, [itemsPerPage]);

  useEffect(() => {
    const handleResize = () => {
      setCurrentPage(1);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
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

    if (
      !quantity ||
      isNaN(parseInt(quantity, 10)) ||
      parseInt(quantity, 10) <= 0
    ) {
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
      await handleUpdateIngredientCostOrQuantity(
        ingredientToEdit,
        cost,
        quantity
      );
      setSnackbarMessage(`${currentIngredient} actualizado correctamente`);
    } else {
      const ingredientExists = ingredients.some(
        (ingredient) =>
          normalizeIngredient(ingredient.name) === normalizedIngredient
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
    .filter((ingredient) =>
      ingredient.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => a.name.localeCompare(b.name));

  const indexOfLastIngredient = currentPage * itemsPerPage;
  const indexOfFirstIngredient = indexOfLastIngredient - itemsPerPage;
  const currentIngredients = filteredIngredients.slice(
    indexOfFirstIngredient,
    indexOfLastIngredient
  );

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

  // Función para actualizar las recetas que contienen el ingrediente modificado
  const updateRecipesWithModifiedIngredient = async (
    ingredientId,
    newCost,
    newQuantity
  ) => {
    try {
      const q = query(collection(db, "recepies"));
      const querySnapshot = await getDocs(q);

      for (const recipeDoc of querySnapshot.docs) {
        const recipeData = recipeDoc.data();

        const updatedIngredients = recipeData.ingredients_list.map(
          (ingredient) => {
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
          }
        );

        const isUpdated = recipeData.ingredients_list.some(
          (ingredient) => ingredient.ingredient_id === ingredientId
        );

        if (isUpdated) {
          await updateDoc(doc(db, "recepies", recipeDoc.id), {
            ingredients_list: updatedIngredients,
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

  // Llama a esta función cuando se actualice el costo o la cantidad de un ingrediente
  const handleUpdateIngredientCostOrQuantity = async (
    ingredientId,
    newCost,
    newQuantity
  ) => {
    await updateRecipesWithModifiedIngredient(
      ingredientId,
      newCost,
      newQuantity
    );
  };

  return (
    <Container
      sx={{ height: "100vh", overflow: "auto", paddingBottom: "2rem" }}
    >
      <Typography variant="h4" gutterBottom>
        Gestión de Inventario
      </Typography>

      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          backgroundColor: theme.palette.background.paper,
          padding: "1rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Button
          variant="outlined"
          color="secondary"
          startIcon={<ArrowBack />}
          onClick={() => navigate("/dashboard")}
        >
          Regresar a Inventario
        </Button>
      </Box>

      <Box sx={{ paddingTop: "4rem" }}>
        <Typography variant="h6" gutterBottom>
          {editMode ? "Editar Ingrediente" : "Agregar Nuevo Ingrediente"}
        </Typography>

        <TextField
          label="Nombre del Ingrediente"
          variant="outlined"
          fullWidth
          value={currentIngredient}
          onChange={handleIngredientChange}
          sx={{ marginBottom: "1rem" }}
        />

        <TextField
          label="Cantidad"
          variant="outlined"
          type="number"
          fullWidth
          value={quantity}
          onChange={handleQuantityChange}
          sx={{ marginBottom: "1rem" }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">{unit}</InputAdornment>
            ),
          }}
        />

        <Select
          value={unit}
          onChange={handleUnitChange}
          fullWidth
          sx={{ marginBottom: "1rem" }}
        >
          <MenuItem value="gramos">Gramos</MenuItem>
          <MenuItem value="mililitros">Mililitros</MenuItem>
          <MenuItem value="piezas">Piezas</MenuItem>
        </Select>

        <TextField
          label="Costo"
          variant="outlined"
          type="number"
          fullWidth
          value={cost}
          onChange={handleCostChange}
          sx={{ marginBottom: "1rem" }}
          InputProps={{
            startAdornment: <InputAdornment position="start">$</InputAdornment>,
          }}
        />

        <Button
          variant="contained"
          color="primary"
          onClick={handleSaveIngredient}
        >
          {editMode ? "Actualizar Ingrediente" : "Agregar Ingrediente"}
        </Button>

        <TextField
          label="Buscar Ingredientes"
          variant="outlined"
          fullWidth
          value={searchQuery}
          onChange={handleSearchChange}
          sx={{ marginBottom: "1rem", marginTop: "1rem" }}
        />

        {noResultsMessage && (
          <Typography color="error" variant="body2" sx={{ marginTop: "1rem" }}>
            {noResultsMessage}
          </Typography>
        )}

        <List>
          {currentIngredients.map((ingredient) => (
            <ListItem key={ingredient.id}>
              <ListItemText
                primary={ingredient.name}
                secondary={
                  <div style={{ whiteSpace: "pre-line", textAlign: "left" }}>
                    {`Cantidad: ${ingredient.quantity} ${ingredient.unit}\n Costo: $${ingredient.cost}`}
                  </div>
                }
              />
              <IconButton
                onClick={() => handleEditIngredient(ingredient)}
                edge="end"
              >
                <Edit />
              </IconButton>
              <IconButton
                onClick={() => openDeleteModal(ingredient.id)}
                edge="end"
              >
                <DeleteIcon />
              </IconButton>
            </ListItem>
          ))}
        </List>

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "1rem",
          }}
        >
          <OutlinedButton
            variant="outlined"
            onClick={() => handlePageChange("prev")}
            disabled={currentPage === 1}
            color="primary"
          >
            Anterior
          </OutlinedButton>
          <Typography variant="body2">Página {currentPage}</Typography>
          <OutlinedButton
            variant="outlined"
            onClick={() => handlePageChange("next")}
            disabled={indexOfLastIngredient >= filteredIngredients.length}
            color="primary"
          >
            Siguiente
          </OutlinedButton>
        </Box>
      </Box>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert onClose={handleSnackbarClose} severity="success">
          {snackbarMessage}
        </Alert>
      </Snackbar>

      <Dialog
        open={openModal}
        onClose={closeDeleteModal}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          Confirmación de Eliminación
        </DialogTitle>
        <DialogContent>
          ¿Está seguro de que desea eliminar este ingrediente?
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteModal} color="primary">
            Cancelar
          </Button>
          <Button onClick={handleDeleteIngredient} color="error" autoFocus>
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ManageInventoryPage;
