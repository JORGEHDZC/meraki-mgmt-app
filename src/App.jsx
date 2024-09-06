// src/App.jsx

import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import CreateRecipePage from './pages/CreateRecipePage'; 
import InventoryPage from './pages/InventoryPage'; 
import CostReportPage from './pages/CostReportPage'; 
import RegisterPage from './pages/RegisterPage';
import { Container } from '@mui/material';


const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Container>
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/create-recipe" element={<CreateRecipePage />} />
            <Route path="/inventory" element={<InventoryPage />} />
            <Route path="/cost-report" element={<CostReportPage />} />
          </Routes>
        </Container>
      </Router>
    </AuthProvider>
  );
};

export default App;
