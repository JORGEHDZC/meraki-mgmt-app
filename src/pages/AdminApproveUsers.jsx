import React, { useState, useEffect } from 'react';
import { getFirestore, collection, getDocs, deleteDoc, doc, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { useNavigate } from 'react-router-dom'; // Importar useNavigate
import { approveUserService } from './../services/authService';

const AdminApproveUsers = () => {
    const [pendingUsers, setPendingUsers] = useState([]);
    const [approvedUsers, setApprovedUsers] = useState([]);
    const [isAdmin, setIsAdmin] = useState(false); // Estado para verificar si es admin
    const [error, setError] = useState(null); // Estado para manejar errores

    const navigate = useNavigate(); // Crear instancia de useNavigate

    useEffect(() => {
        const checkAdmin = async () => {
            const auth = getAuth();
            const user = auth.currentUser;

            if (user) {
                console.log("UID del usuario autenticado:", user.uid);

                try {
                    const db = getFirestore();
                    const docRef = doc(db, 'roles', user.uid);
                    const docSnap = await getDoc(docRef);

                    if (docSnap.exists() && docSnap.data().role === 'admin') {
                        setIsAdmin(true);
                        fetchPendingUsers();
                        fetchApprovedUsers();
                    } else {
                        setError("No tienes permisos para acceder a estos datos.");
                    }
                } catch (error) {
                    setError("Error al verificar permisos de administrador.");
                    console.error(error);
                }
            } else {
                setError("No hay usuario autenticado.");
            }
        };

        const fetchPendingUsers = async () => {
            const db = getFirestore();
            try {
                const querySnapshot = await getDocs(collection(db, 'pendingUsers'));
                const users = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
                setPendingUsers(users);
            } catch (error) {
                console.error("Error al obtener los usuarios pendientes:", error.message);
            }
        };

        const fetchApprovedUsers = async () => {
            const db = getFirestore();
            try {
                const querySnapshot = await getDocs(collection(db, 'approvedUsers'));
                const users = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
                setApprovedUsers(users);
            } catch (error) {
                console.error("Error al obtener los usuarios aprobados:", error.message);
            }
        };


        checkAdmin();
    }, []);

    const handleDeny = async (user) => {
        const db = getFirestore();

        try {
            await deleteDoc(doc(db, 'pendingUsers', user.id));
            setPendingUsers(pendingUsers.filter(u => u.id !== user.id));
            console.log(`Usuario con email ${user.email} ha sido denegado y eliminado de pendingUsers.`);
        } catch (error) {
            console.error("Error al denegar el acceso al usuario:", error);
        }
    };

    const handleApprove = async (user) => {
        try {
            const result = await approveUserService(user);
            if (result) {
                setPendingUsers(pendingUsers.filter(u => u.id !== user.id));
                console.log(`Usuario con email ${user.email} ha sido aprobado y movido a approvedUsers.`);
            }
        } catch (error) {
            console.error("Error al aprobar el usuario:", error);
        }
    };

    if (error) {
        return <div className="container mx-auto max-w-md mt-8"><p>{error}</p></div>;
    }

    if (!isAdmin) {
        return <div className="container mx-auto max-w-md mt-8"><p>Verificando permisos...</p></div>;
    }

    return (
        <div className="container mx-auto max-w-md mt-8">
            <div className="mb-4">
                <button
                    className="bg-red-500 text-white px-4 py-2 rounded mb-4"
                    onClick={() => navigate("/dashboard")}
                >
                    Regresar al Dashboard
                </button>
            </div>
            <h2 className="text-3xl font-bold text-center mb-6">Usuarios pendientes de aprobación</h2>
            {pendingUsers.length === 0 ? (
                <p>No hay usuarios pendientes de aprobación.</p>
            ) : (
                <ul>
                    {pendingUsers.map(user => (
                        <li key={user.id} className="mb-4 flex justify-between items-center">
                            <div>
                                <p>Email: {user.email}</p>
                                <p>Solicitado en: {user.requestedAt.toDate().toLocaleString()}</p>
                            </div>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => handleApprove(user)}
                                    className="bg-green-500 text-white p-2 rounded-md hover:bg-green-600"
                                >
                                    Aprobar
                                </button>
                                <button
                                    onClick={() => handleDeny(user)}
                                    className="bg-red-500 text-white p-2 rounded-md hover:bg-red-600"
                                >
                                    Denegar
                                </button>
                            </div>
                        </li>
                    ))}

                    <button
                        onClick={() => navigate('/dashboard')}
                        className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 mt-6"
                    >
                        Regresar al Dashboard
                    </button>
                </ul>
            )}

            <h2 className="text-3xl font-bold text-center mb-6 mt-12">Usuarios aprobados</h2>
            {approvedUsers.length === 0 ? (
                <p>No hay usuarios aprobados.</p>
            ) : (
                <ul>
                    {approvedUsers.map(user => (
                        <li key={user.id} className="mb-4 flex justify-between items-center">
                            <div>
                                <p>Email: {user.email}</p>
                                <p>Aprobado en: {user.approvedAt.toDate().toLocaleString()}</p>
                                <p>Estado: {user.active ? 'Activo' : 'Inactivo'}</p>
                            </div>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => handleSetInactive(user)}
                                    className="bg-yellow-500 text-white p-2 rounded-md hover:bg-yellow-600"
                                >
                                    Marcar como inactivo
                                </button>
                                <button
                                    onClick={() => handleDeleteApproved(user)}
                                    className="bg-red-500 text-white p-2 rounded-md hover:bg-red-600"
                                >
                                    Eliminar
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default AdminApproveUsers;
