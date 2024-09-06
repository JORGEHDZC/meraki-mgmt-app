// src/pages/CostReportPage.jsx

import React from 'react';
import { Container, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';

const CostReportPage = () => {
  // Ejemplo de datos; en una aplicación real, estos datos vendrían de un servicio o API
  const reportData = [
    { recipeName: 'Tarta de Manzana', cost: '$10.00' },
    { recipeName: 'Brownies', cost: '$8.50' },
    { recipeName: 'Cheesecake', cost: '$12.00' },
  ];

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Reporte de Costos
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nombre de la Receta</TableCell>
              <TableCell align="right">Costo</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {reportData.map((row, index) => (
              <TableRow key={index}>
                <TableCell component="th" scope="row">
                  {row.recipeName}
                </TableCell>
                <TableCell align="right">{row.cost}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default CostReportPage;
