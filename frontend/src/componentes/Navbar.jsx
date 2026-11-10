import BotoesBar from "./BotoesBar"
import { Link } from "react-router-dom"

function Navbar() {
    return (
        <header id="header">
            <Link
                to="/home"
                id="logo"
                className="text-decoration-none"
                aria-label="Ir para a página inicial"
            >
                <span id="textologo">Wired</span>
            </Link>
            <BotoesBar />
        </header>
    )
}

export default Navbar
