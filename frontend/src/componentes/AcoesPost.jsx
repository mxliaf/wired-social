import { useState } from 'react'

export default function AcoesPost({ post, onEditar, onExcluir }) {
    const usuarioSalvo = localStorage.getItem('wired_usuario')
    const usuario = usuarioSalvo ? JSON.parse(usuarioSalvo) : null
    const [editando, setEditando] = useState(false)
    const [legenda, setLegenda] = useState(post.legenda)
    const [processando, setProcessando] = useState(false)
    const [erro, setErro] = useState('')

    if (post.autor && post.autor.id !== usuario?.id) return null

    async function salvar(event) {
        event.preventDefault()

        if (!legenda.trim()) {
            setErro('A legenda não pode ficar vazia')
            return
        }

        try {
            setProcessando(true)
            setErro('')
            await onEditar(post.id, legenda.trim())
            setEditando(false)
        } catch (error) {
            setErro(error.message)
        } finally {
            setProcessando(false)
        }
    }

    async function apagar() {
        const confirmou = window.confirm('Deseja realmente excluir este post?')

        if (!confirmou) return

        try {
            setProcessando(true)
            setErro('')
            await onExcluir(post.id)
        } catch (error) {
            setErro(error.message)
            setProcessando(false)
        }
    }

    if (editando) {
        return (
            <form className="edicao-post" onSubmit={salvar}>
                <label htmlFor={`legenda-${post.id}`} className="form-label">
                    Editar legenda
                </label>
                <textarea
                    id={`legenda-${post.id}`}
                    className="form-control campo-padrao"
                    rows="3"
                    value={legenda}
                    onChange={(event) => setLegenda(event.target.value)}
                />

                {erro && <p className="text-danger small mt-2 mb-0">{erro}</p>}

                <div className="acoes-edicao mt-3">
                    <button
                        type="button"
                        className="botao-post botao-cancelar"
                        onClick={() => {
                            setLegenda(post.legenda)
                            setErro('')
                            setEditando(false)
                        }}
                        disabled={processando}
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        className="botao-post botao-salvar"
                        disabled={processando}
                    >
                        {processando ? 'Salvando...' : 'Salvar'}
                    </button>
                </div>
            </form>
        )
    }

    return (
        <div>
            {erro && <p className="text-danger small mb-2">{erro}</p>}
            <div className="acoes-post">
                <button
                    type="button"
                    className="botao-post botao-editar"
                    onClick={() => setEditando(true)}
                    disabled={processando}
                >
                    Editar legenda
                </button>
                <button
                    type="button"
                    className="botao-post botao-excluir"
                    onClick={apagar}
                    disabled={processando}
                >
                    {processando ? 'Excluindo...' : 'Excluir'}
                </button>
            </div>
        </div>
    )
}
