import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { API_URL } from '../config/api'

export default function Login() {
    const [email, setEmail] = useState('')
    const [senha, setSenha] = useState('')
    const [erro, setErro] = useState('')
    const navigate = useNavigate()

    useEffect(() => {
        if (localStorage.getItem('wired_token')) {
            navigate('/home', { replace: true })
        }
    }, [navigate])

    async function entrar(event) {
        event.preventDefault()
        try {
            const resposta = await fetch(`${API_URL}/api/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, senha }) })
            const dados = await resposta.json()
            if (!resposta.ok) throw new Error(dados.erro)
            localStorage.setItem('wired_token', dados.token)
            localStorage.setItem('wired_usuario', JSON.stringify(dados.usuario))
            setErro('')
            navigate('/home')
        } catch (error) {
            setErro(error.message || 'Não foi possível entrar')
        }
    }

    return (
        <div className="bodylogin">
            <section className="d-flex justify-content-center h-100 gradient-custom-2">
                <div className="container py-5 h-100">
                    <div className="row d-flex justify-content-center">
                        <div className="col col-lg-9 col-xl-5 ">
                            <div className="card card-formulario card-login">

                                <div className="logo d-flex flex-column justify-content-center align-items-center p-4">
                                    <h1 className="titulo-login py-3">Wired</h1>
                                    

                                    <form className="w-100" onSubmit={entrar}>
                                        <div className="mb-3">
                                            <label htmlFor="email" className="form-label">
                                                E-mail
                                            </label>
                                            <input
                                                id="email"
                                                type="email"
                                                className="form-control campo-padrao text-black"
                                                placeholder="Digite seu e-mail"
                                                value={email}
                                                onChange={(event) => setEmail(event.target.value)}
                                                required
                                            />
                                        </div>

                                        <div className="mb-3">
                                            <label htmlFor="senha" className="form-label">
                                                Senha
                                            </label>
                                            <input
                                                id="senha"
                                                type="password"
                                                className="form-control campo-padrao text-black"
                                                placeholder="Digite sua senha"
                                                value={senha}
                                                onChange={(event) => setSenha(event.target.value)}
                                                required
                                            />
                                        </div>

                                        {erro && (
                                            <p className="text-danger text-center mb-3">
                                                {erro}
                                            </p>
                                        )}

                                        <button type="submit" className="botao-formulario w-100">
                                            Entrar
                                        </button>

                                        <div className="credenciais-login mt-4">
                                            <small>Não tem conta? <Link to="/cadastro">Cadastre-se</Link></small>
                                        </div>
                                    </form>

                                </div>


                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
