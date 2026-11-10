import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { API_URL } from '../config/api'

export default function Publicar() {
    const [imagem, setImagem] = useState(null)
    const [legenda, setLegenda] = useState('')
    const [erro, setErro] = useState('')
    const [enviando, setEnviando] = useState(false)

    const navigate = useNavigate()

    async function publicar(event) {
        event.preventDefault()

        if (!imagem) {
            setErro('Selecione uma imagem')
            return
        }

        if (!legenda.trim()) {
            setErro('Digite uma legenda')
            return
        }

        const formulario = new FormData()

        formulario.append('imagem', imagem)
        formulario.append('legenda', legenda)

        try {
            setEnviando(true)
            setErro('')

            const resposta = await fetch(`${API_URL}/api/posts`, {
                method: 'POST',
                body: formulario,
            })

            const dados = await resposta.json()

            if (!resposta.ok) {
                throw new Error(dados.erro || 'Não foi possível publicar')
            }

            navigate('/feed')
        } catch (error) {
            setErro(error.message)
        } finally {
            setEnviando(false)
        }
    }

    return (
        <main className="container py-5">
            <div className="card card-formulario mx-auto p-4">
                <h1 className="h3 mb-4">Nova publicação</h1>

                <form onSubmit={publicar}>
                    <div className="mb-3">
                        <label htmlFor="imagem" className="form-label">
                            Imagem
                        </label>

                        <input
                            id="imagem"
                            type="file"
                            accept="image/*"
                            className="form-control campo-padrao"
                            onChange={(event) => {
                                setImagem(event.target.files[0])
                            }}
                            required
                        />
                    </div>

                    <div className="mb-3">
                        <label htmlFor="legenda" className="form-label">
                            Legenda
                        </label>

                        <textarea
                            id="legenda"
                            className="form-control campo-padrao"
                            rows="4"
                            value={legenda}
                            onChange={(event) => {
                                setLegenda(event.target.value)
                            }}
                            placeholder="Escreva uma legenda..."
                            required
                        />
                    </div>

                    {erro && (
                        <p className="text-danger">
                            {erro}
                        </p>
                    )}

                    <button
                        type="submit"
                        className="botao-formulario w-100"
                        disabled={enviando}
                    >
                        {enviando ? 'Publicando...' : 'Publicar'}
                    </button>
                </form>
            </div>
        </main>
    )
}
