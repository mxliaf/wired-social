import { NavLink, useNavigate } from 'react-router-dom'
import { estaAutenticado, sair } from '../services/auth'

function IconeFeed() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M4 10.2 12 3.8l8 6.4" />
            <path d="M6.5 9.2v10.3h11V9.2" />
            <path d="M9.4 19.5v-5.3h5.2v5.3" />
            <path d="M17.3 5.9h2.1v3.4" />
        </svg>
    )
}

function IconePerfil() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 12.2c2.4 0 4.2-1.9 4.2-4.3S14.4 3.7 12 3.7 7.8 5.5 7.8 7.9s1.8 4.3 4.2 4.3Z" />
            <path d="M4.6 20.2c.5-4.1 3.3-6.4 7.4-6.4s6.9 2.3 7.4 6.4" />
            <path d="M8.2 14.7c1.1.8 2.4 1.2 3.8 1.2s2.7-.4 3.8-1.2" />
        </svg>
    )
}

function IconeConfiguracoes() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M9.7 4.3 10.5 2h3l.8 2.3 2 .9 2.2-1.1 2.1 2.1-1.1 2.2.9 2 2.3.8v3l-2.3.8-.9 2 1.1 2.2-2.1 2.1-2.2-1.1-2 .9-.8 2.3h-3l-.8-2.3-2-.9-2.2 1.1-2.1-2.1L4.5 17l-.9-2-2.3-.8v-3l2.3-.8.9-2-1.1-2.2 2.1-2.1 2.2 1.1 2-.9Z" />
            <path d="M12 8.4a3.6 3.6 0 1 1 0 7.2 3.6 3.6 0 0 1 0-7.2Z" />
            <path d="M12 10.8a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4Z" />
        </svg>
    )
}

function IconeSair() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M10.3 4.2H5.8c-1 0-1.8.8-1.8 1.8v12c0 1 .8 1.8 1.8 1.8h4.5" />
            <path d="M13.5 7.2 18.3 12l-4.8 4.8" />
            <path d="M8.5 12h9.8" />
            <path d="M6.8 7.2v9.6" />
        </svg>
    )
}

function BotoesBar({ usuario, onNavigate, modo = 'topo' }) {
    const navigate = useNavigate()

    function sairDaConta() {
        sair()
        onNavigate?.()
        navigate('/login')
    }

    if (!estaAutenticado()) return null

    return (
        <ul className={`botoesconta navbar-nav ${modo === 'topo' ? 'ms-auto' : ''}`}>
            {[
                ['/feed', IconeFeed, 'Feed'],
                ['/home', IconePerfil, 'Perfil'],
                ['/config', IconeConfiguracoes, 'Configurações'],
            ].map(([rota, Icone, texto]) => (
                <li className="nav-item" key={rota}>
                    <NavLink
                        to={rota}
                        className={({ isActive }) => `botoesnav nav-link text-decoration-none ${isActive ? 'active' : ''}`}
                        onClick={onNavigate}
                    >
                        <span className="nav-icone" aria-hidden="true"><Icone /></span>
                        {texto}
                    </NavLink>
                </li>
            ))}

            <li className="nav-item">
                <button
                    type="button"
                    className="botoesnav nav-link"
                    onClick={sairDaConta}
                >
                    <span className="nav-icone" aria-hidden="true"><IconeSair /></span>
                    Sair
                </button>
            </li>

            {modo === 'lateral' && (
                <li className="nav-item nav-item-usuario">
                    <NavLink to="/home" className="nav-usuario text-decoration-none" onClick={onNavigate}>
                        {usuario?.foto ? (
                            <img src={usuario.foto} alt="Sua foto de perfil" />
                        ) : (
                            <span className="nav-usuario-foto">{usuario?.nome?.charAt(0)?.toUpperCase() || '♡'}</span>
                        )}
                        <span className="nav-usuario-texto">
                            <strong>{usuario?.nome || 'Meu perfil'}</strong>
                            <small>@{usuario?.nome_usuario || 'usuario'}</small>
                        </span>
                    </NavLink>
                </li>
            )}
        </ul>
    )
}

export default BotoesBar
