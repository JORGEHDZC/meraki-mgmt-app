// src/App.jsx

import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import LoginPage from "./pages/LoginPage";
import AdminApproveUsers from "./pages/AdminApproveUsers";
import DashboardPage from "./pages/DashboardPage";
import CreateRecipePage from "./pages/CreateRecipePage";
import RegisterPage from "./pages/RegisterPage";
import EditRecipesPage from "./pages/EditRecipesPage";
import EditRecipeByIDPage from "./pages/EditRecipeByIDPage";
import ViewRecipesPage from "./pages/ViewRecipesPage";
import IngredientsPage from "./pages/IngredientsPage";
import { Container } from "@mui/material";
import PrivateRoute from "./context/PrivateRoute";
import "./styles/globals.css";

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Container>
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Rutas protegidas */}
            <Route
              path="/approve-users"
              element={
                <PrivateRoute>
                  <AdminApproveUsers />
                </PrivateRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <DashboardPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/create-recipe"
              element={
                <PrivateRoute>
                  <CreateRecipePage />
                </PrivateRoute>
              }
            />
            <Route
              path="/edit-recipes"
              element={
                <PrivateRoute>
                  <EditRecipesPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/edit-recipe/:id"
              element={
                <PrivateRoute>
                  <EditRecipeByIDPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/view-recipes"
              element={
                <PrivateRoute>
                  <ViewRecipesPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/ingredients"
              element={
                <PrivateRoute>
                  <IngredientsPage />
                </PrivateRoute>
              }
            />
          </Routes>
        </Container>
      </Router>
    </AuthProvider>
  );
};

export default App;
