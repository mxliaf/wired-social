import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { API_URL } from '../config/api'

export default function Cadastro() {
    const [formulario, setFormulario] = useState({ nome: '', nome_usuario: '', email: '', senha: '' })
    const [erro, setErro] = useState('')
    const navigate = useNavigate()
    async function cadastrar(event) {
        event.preventDefault(); setErro('')
        try {
            const resposta = await fetch(`${API_URL}/api/auth/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formulario) })
            const dados = await resposta.json(); if (!resposta.ok) throw new Error(dados.erro)
            localStorage.setItem('wired_token', dados.token); localStorage.setItem('wired_usuario', JSON.stringify(dados.usuario)); navigate('/feed')
        } catch (error) { setErro(error.message || 'Não foi possível criar a conta') }
    }
    return (
        <main className="container cadastro-pagina py-5">
            <div className="card card-formulario cadastro-card mx-auto p-4">
                <h1 className="h3 mb-4">Criar conta</h1>

                <form onSubmit={cadastrar}>
                    {[
                        ['nome', 'Nome', 'text'],
                        ['nome_usuario', 'Nome de usuário', 'text'],
                        ['email', 'E-mail', 'email'],
                        ['senha', 'Senha (mínimo 6 caracteres)', 'password'],
                    ].map(([campo, rotulo, tipo]) => (
                        <div className="mb-3" key={campo}>
                            <label className="form-label" htmlFor={campo}>{rotulo}</label>
                            <input
                                id={campo}
                                type={tipo}
                                className="form-control campo-padrao"
                                required
                                autoComplete={campo === 'senha' ? 'new-password' : campo === 'email' ? 'email' : 'name'}
                                value={formulario[campo]}
                                onChange={(event) => setFormulario({ ...formulario, [campo]: event.target.value })}
                            />
                        </div>
                    ))}

                    {erro && <p className="text-danger cadastro-erro">{erro}</p>}
                    <button className="botao-formulario w-100">Criar conta</button>
                    <p className="mt-3 mb-0">Já tem conta? <Link to="/login">Entrar</Link></p>
                </form>
            </div>
        </main>
    )
}
