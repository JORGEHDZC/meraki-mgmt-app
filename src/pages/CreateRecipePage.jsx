// src/pages/CreateRecipePage.jsx

import React, { useState } from 'react';
import { Container, Typography, TextField, Button, Grid } from '@mui/material';

const CreateRecipePage = () => {
  const [recipeName, setRecipeName] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [instructions, setInstructions] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Lógica para enviar la receta al servidor o guardarla
    console.log('Receta:', { recipeName, ingredients, instructions });
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Crear Nueva Receta
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Nombre de la Receta"
          variant="outlined"
          fullWidth
          margin="normal"
          value={recipeName}
          onChange={(e) => setRecipeName(e.target.value)}
          required
        />
        <TextField
          label="Ingredientes"
          variant="outlined"
          fullWidth
          margin="normal"
          multiline
          rows={4}
          value={ingredients}
          onChange={(e) => setIngredients(e.target.value)}
          required
        />
        <TextField
          label="Instrucciones"
          variant="outlined"
          fullWidth
          margin="normal"
          multiline
          rows={6}
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          required
        />
        <Button type="submit" variant="contained" color="primary">
          Guardar Receta
        </Button>
      </form>
    </Container>
  );
};

export default CreateRecipePage;
