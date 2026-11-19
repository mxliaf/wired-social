//reaproveitamento da estrutura

import { lazy, Suspense, useEffect, useState } from 'react'
import { Outlet, useLocation } from "react-router-dom";
import Navbar from './componentes/Navbar'
import { estaAutenticado } from './services/auth'

const FaultyTerminal = lazy(() => import('./componentes/FaultyTerminal'))
const consultaTerminal = '(min-width: 901px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)'

export default function App() {
    useLocation()
    const autenticado = estaAutenticado()
    const [mostrarTerminal, setMostrarTerminal] = useState(() => window.matchMedia(consultaTerminal).matches)

    useEffect(() => {
        const media = window.matchMedia(consultaTerminal)
        const atualizar = (evento) => setMostrarTerminal(evento.matches)
        media.addEventListener('change', atualizar)
        return () => media.removeEventListener('change', atualizar)
    }, [])

    return(
        <div className={`app-layout ${autenticado ? 'autenticado' : 'publico'}`}>
            {mostrarTerminal && (
                <div className="fundo-terminal" aria-hidden="true">
                    <Suspense fallback={null}>
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
                    </Suspense>
                </div>
            )}
            <Navbar />
            <div className="conteudo-rotas">
                <Outlet />
            </div>
        </div>
    )
}
