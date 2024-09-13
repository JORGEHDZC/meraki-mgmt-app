import { Button } from "@/components/ui/Button";
import React, { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card";
import { BookOpen, ClipboardList, PlusCircle, LogOut } from "lucide-react";

export default function Dashboard() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center text-primary">
            Bienvenido al Dashboard, Usuario!
          </CardTitle>
          <CardDescription className="text-center text-lg mt-2">
            Este es tu panel principal donde puedes gestionar tus recetas, ingredientes, y más.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Button
            className="h-32 flex flex-col justify-center items-center text-lg font-semibold"
            onClick={() => navigate("/create-recipe")}
          >
            <PlusCircle className="h-8 w-8 mb-2" />
            Crear Nueva Receta
          </Button>
          <Button
            className="h-32 flex flex-col justify-center items-center text-lg font-semibold"
            onClick={() => navigate("/manage-inventory")}
          >
            <ClipboardList className="h-8 w-8 mb-2" />
            Gestionar Inventario
          </Button>
          <Button
            className="h-32 flex flex-col justify-center items-center text-lg font-semibold"
            onClick={() => navigate("/recipe-detail")}
          >
            <BookOpen className="h-8 w-8 mb-2" />
            Ver Recetas
          </Button>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button
            className="mt-4 bg-red-500 hover:bg-red-600 text-white flex flex-row items-center justify-center"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Cerrar Sesión
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
