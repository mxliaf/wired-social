//reaproveitamento da estrutura

import { Outlet, useLocation } from "react-router-dom";
import Navbar from './componentes/Navbar'
import { estaAutenticado } from './services/auth'

export default function App() {
    useLocation()
    const autenticado = estaAutenticado()

    return(
        <div className={`app-layout ${autenticado ? 'autenticado' : 'publico'}`}>
            <Navbar />
            <div className="conteudo-rotas">
                <Outlet />
            </div>
        </div>
    )
}
