import { NavLink, useNavigate } from 'react-router-dom'
import { estaAutenticado, sair } from '../services/auth'

function BotoesBar({ usuario, onNavigate }) {
    const navigate = useNavigate()

    function sairDaConta() {
        sair()
        onNavigate?.()
        navigate('/login')
    }

    if (!estaAutenticado()) return null

    return (
        <ul id="botoesconta" className="navbar-nav ms-auto">
            {[
                ['/feed', '⌂', 'Feed'],
                ['/home', '◎', 'Perfil'],
                ['/publicar', '＋', 'Publicar'],
                ['/config', '⚙', 'Configurações'],
            ].map(([rota, icone, texto]) => (
                <li className="nav-item" key={rota}>
                    <NavLink
                        to={rota}
                        className={({ isActive }) => `botoesnav nav-link text-decoration-none ${isActive ? 'active' : ''}`}
                        onClick={onNavigate}
                    >
                        <span className="nav-icone" aria-hidden="true">{icone}</span>
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
                    <span className="nav-icone" aria-hidden="true">↪</span>
                    Sair
                </button>
            </li>

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
        </ul>
    )
}

export default BotoesBar
