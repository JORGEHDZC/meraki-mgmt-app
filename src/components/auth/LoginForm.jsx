'use client'

import { useState, useContext } from 'react'
import { LockIcon } from 'lucide-react'
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AuthContext } from "@/context/AuthContext"

export default function LoginForm() {
  const { login } = useContext(AuthContext)
  const navigate = useNavigate();

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [formError, setFormError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!email || !password) {
      setFormError("Por favor, completa todos los campos.")
      return
    }

    try {
      const success = await login(email, password)
      if (success) {
        setFormError(null)
        navigate("/dashboard")
      } else {
        setFormError("Credenciales incorrectas, por favor verifica.")
      }
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Ocurrió un error al iniciar sesión.")
    }
  }

  return (
    <div className="container mx-auto max-w-md mt-8">
      <div className="flex flex-col items-center">
        <div className="bg-secondary p-3 rounded-full mb-4">
          <LockIcon className="h-6 w-6 text-secondary-foreground" />
        </div>
        <h1 className="text-2xl font-bold mb-6">Iniciar Sesión</h1>
        <form onSubmit={handleSubmit} className="w-full space-y-4">
          <Input
            type="email"
            id="email"
            placeholder="Correo Electrónico"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full"
          />
          <Input
            type="password"
            id="password"
            placeholder="Contraseña"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full"
          />
          {formError && <p className="text-red-500 text-sm">{formError}</p>}
          <Button type="submit" className="w-full">
            Iniciar Sesión
          </Button>
          <div className="flex justify-between text-sm">
            <Button variant="link" size="sm">
              ¿Olvidaste tu contraseña?
            </Button>
            <Button variant="link" size="sm" asChild onClick={() => navigate("/register")}>
             Regístrate aquí
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
