// src/pages/InventoryPage.jsx

import React, { useState } from 'react';
import { Container, Typography, Button, TextField, List, ListItem, ListItemText, IconButton } from '@mui/material';
import { AddCircle, Edit, Delete } from '@mui/icons-material';

const InventoryPage = () => {
  const [ingredients, setIngredients] = useState([]);
  const [newIngredient, setNewIngredient] = useState('');

  const addIngredient = () => {
    setIngredients([...ingredients, newIngredient]);
    setNewIngredient('');
  };

  const deleteIngredient = (index) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Gestión de Inventario
      </Typography>
      <TextField
        label="Nuevo Ingrediente"
        variant="outlined"
        fullWidth
        margin="normal"
        value={newIngredient}
        onChange={(e) => setNewIngredient(e.target.value)}
      />
      <Button onClick={addIngredient} variant="contained" color="primary" startIcon={<AddCircle />}>
        Agregar Ingrediente
      </Button>
      <List>
        {ingredients.map((ingredient, index) => (
          <ListItem key={index}>
            <ListItemText primary={ingredient} />
            <IconButton onClick={() => deleteIngredient(index)}>
              <Delete />
            </IconButton>
          </ListItem>
        ))}
      </List>
    </Container>
  );
};

export default InventoryPage;
