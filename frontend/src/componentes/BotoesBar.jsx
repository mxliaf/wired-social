import { Link } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import { estaAutenticado, sair } from '../services/auth'

function BotoesBar({ onNavigate }) {
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
                ['/home', 'Perfil'],
                ['/feed', 'Feed'],
                ['/publicar', 'Publicar'],
                ['/config', 'Configurações'],
            ].map(([rota, texto]) => (
                <li className="nav-item" key={rota}>
                    <Link
                        to={rota}
                        className="botoesnav nav-link text-decoration-none"
                        onClick={onNavigate}
                    >
                        {texto}
                    </Link>
                </li>
            ))}

            <li className="nav-item">
                <button
                    type="button"
                    className="botoesnav nav-link"
                    onClick={sairDaConta}
                >
                    Sair
                </button>
            </li>
        </ul>
    )
}

export default BotoesBar
