import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const EMAIL_PADRAO = 'admin@wired.com'
const SENHA_PADRAO = '1234'

export default function Login() {
    const [email, setEmail] = useState('')
    const [senha, setSenha] = useState('')
    const [erro, setErro] = useState('')
    const navigate = useNavigate()

    function entrar(event) {
        event.preventDefault()

        if (email === EMAIL_PADRAO && senha === SENHA_PADRAO) {
            setErro('')
            navigate('/home')
            return
        }

        setErro('E-mail ou senha incorretos')
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
                                            <small>
                                                E-mail: <strong>{EMAIL_PADRAO}</strong>
                                            </small>
                                            <small>
                                                Senha: <strong>{SENHA_PADRAO}</strong>
                                            </small>
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
