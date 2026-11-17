import { Link } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import { estaAutenticado, sair } from '../services/auth'

function BotoesBar() {
    const navigate = useNavigate()

    function sairDaConta() {
        sair()
        navigate('/login')
    }

    if (!estaAutenticado()) return null

    return (
        <div id="botoesconta">
            <Link
                to="/home"
                className="botoesnav text-decoration-none"
            >
                Perfil
            </Link>
            <Link
                to="/feed"
                className="botoesnav text-decoration-none"
            >
                Feed
            </Link>

            <Link
                to="/publicar"
                className="botoesnav text-decoration-none"
            >
                Publicar Post
            </Link>

            <Link
                to="/config"
                className="botoesnav text-decoration-none"
            >
                Configurações
            </Link>

            <button
                type="button"
                className="botoesnav border-0 bg-transparent"
                onClick={sairDaConta}
            >
                Sair
            </button>
        </div>
    )
}

export default BotoesBar
