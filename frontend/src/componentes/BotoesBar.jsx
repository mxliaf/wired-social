import { Link } from 'react-router-dom'

function BotoesBar() {
    return (
        <div id="botoesconta">
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
        </div>
    )
}

export default BotoesBar
