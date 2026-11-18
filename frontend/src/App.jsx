//reaproveitamento da estrutura

import { Outlet, useLocation } from "react-router-dom";
import Navbar from './componentes/Navbar'
import FaultyTerminal from './componentes/FaultyTerminal'
import { estaAutenticado } from './services/auth'

export default function App() {
    useLocation()
    const autenticado = estaAutenticado()

    return(
        <div className={`app-layout ${autenticado ? 'autenticado' : 'publico'}`}>
            <div className="fundo-terminal" aria-hidden="true">
                <FaultyTerminal
                    scale={1.35}
                    gridMul={[2, 1]}
                    digitSize={1.3}
                    timeScale={0.12}
                    scanlineIntensity={0.12}
                    glitchAmount={0.28}
                    flickerAmount={0.18}
                    noiseAmp={0.45}
                    chromaticAberration={0}
                    curvature={0}
                    tint="#729f8e"
                    mouseStrength={0.08}
                    brightness={0.72}
                    glyphs="dots"
                    glow={0.18}
                    persistence={0.25}
                    scramble={0.08}
                    mouseGlow={0.18}
                    vignette={0.08}
                    clickEffect="none"
                    lightMode
                    dpr={1}
                />
            </div>
            <Navbar />
            <div className="conteudo-rotas">
                <Outlet />
            </div>
        </div>
    )
}
