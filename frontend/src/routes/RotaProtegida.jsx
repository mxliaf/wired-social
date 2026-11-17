import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { estaAutenticado } from '../services/auth'

export default function RotaProtegida() {
    const location = useLocation()

    if (!estaAutenticado()) {
        return <Navigate to="/login" replace state={{ de: location.pathname }} />
    }

    return <Outlet />
}
