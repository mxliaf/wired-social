import BotoesBar from "./BotoesBar"
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { estaAutenticado } from "../services/auth"

function Navbar() {
    const [menuAberto, setMenuAberto] = useState(false)
    const [usuario, setUsuario] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('wired_usuario'))
        } catch {
            return null
        }
    })
    const autenticado = estaAutenticado()

    useEffect(() => {
        function atualizarUsuario() {
            try {
                setUsuario(JSON.parse(localStorage.getItem('wired_usuario')))
            } catch {
                setUsuario(null)
            }
        }

        window.addEventListener('wired-user-updated', atualizarUsuario)
        return () => window.removeEventListener('wired-user-updated', atualizarUsuario)
    }, [])

    return (
        <header id="header" className="navbar navbar-expand-lg">
            <div className="container-fluid px-0">
                <Link
                    to="/home"
                    id="logo"
                    className="navbar-brand text-decoration-none"
                    aria-label="Ir para a página inicial"
                    onClick={() => setMenuAberto(false)}
                >
                    <span id="textologo">Wired</span>
                </Link>

                {autenticado && (
                    <>
                        <button
                            className="navbar-toggler"
                            type="button"
                            aria-controls="menuPrincipal"
                            aria-expanded={menuAberto}
                            aria-label="Abrir menu"
                            onClick={() => setMenuAberto((aberto) => !aberto)}
                        >
                            <span className="navbar-toggler-icon"></span>
                        </button>

                        <div id="menuPrincipal" className={`collapse navbar-collapse ${menuAberto ? 'show' : ''}`}>
                            <BotoesBar usuario={usuario} onNavigate={() => setMenuAberto(false)} />
                        </div>
                    </>
                )}
            </div>
        </header>
    )
}

export default Navbar
