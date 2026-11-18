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

    useEffect(() => {
        if (!menuAberto) return undefined

        function fecharComEscape(event) {
            if (event.key === 'Escape') setMenuAberto(false)
        }

        document.body.classList.add('menu-lateral-aberto')
        window.addEventListener('keydown', fecharComEscape)

        return () => {
            document.body.classList.remove('menu-lateral-aberto')
            window.removeEventListener('keydown', fecharComEscape)
        }
    }, [menuAberto])

    return (
        <>
            <header id="header" className="navbar">
                <div className="container-fluid px-0">
                    {autenticado && (
                        <button
                            className="menu-sanduiche"
                            type="button"
                            aria-controls="menuLateral"
                            aria-expanded={menuAberto}
                            aria-label={menuAberto ? 'Fechar menu' : 'Abrir menu'}
                            onClick={() => setMenuAberto((aberto) => !aberto)}
                        >
                            <span></span>
                            <span></span>
                            <span></span>
                        </button>
                    )}

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
                        <nav className="nav-topo" aria-label="Navegação principal">
                            <BotoesBar modo="topo" onNavigate={() => setMenuAberto(false)} />
                        </nav>
                    )}
                </div>
            </header>

            {autenticado && (
                <>
                    <button
                        type="button"
                        className={`menu-overlay ${menuAberto ? 'aberto' : ''}`}
                        aria-label="Fechar menu lateral"
                        tabIndex={menuAberto ? 0 : -1}
                        onClick={() => setMenuAberto(false)}
                    />

                    <aside
                        id="menuLateral"
                        className={`menu-lateral ${menuAberto ? 'aberto' : ''}`}
                        aria-hidden={!menuAberto}
                    >
                        <div className="menu-lateral-cabecalho">
                            <span className="menu-lateral-logo">Wired</span>
                            <button type="button" aria-label="Fechar menu" onClick={() => setMenuAberto(false)}>×</button>
                        </div>
                        <BotoesBar modo="lateral" usuario={usuario} onNavigate={() => setMenuAberto(false)} />
                    </aside>
                </>
            )}
        </>
    )
}

export default Navbar
