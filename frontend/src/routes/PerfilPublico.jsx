import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import CabecalhoPerfil from '../componentes/CabecalhoPerfil'
import Feed from './Feed'
import { API_URL } from '../config/api'
import { fetchComAuth } from '../services/auth'

const perfilInicial = {
    nome: '',
    nome_usuario: '',
    bio: '',
    foto: '',
    capa: '',
    seguidores: 0,
    seguindo: 0,
}

export default function PerfilPublico() {
    const { id } = useParams()
    const [perfil, setPerfil] = useState(perfilInicial)
    const [carregando, setCarregando] = useState(true)
    const [erro, setErro] = useState('')

    useEffect(() => {
        async function carregarPerfil() {
            try {
                setCarregando(true)
                setErro('')
                const resposta = await fetchComAuth(`${API_URL}/api/usuarios/${id}`)
                const dados = await resposta.json()

                if (!resposta.ok) {
                    throw new Error(dados.erro || 'Não foi possível carregar esse perfil')
                }

                setPerfil(dados)
            } catch (error) {
                setErro(error.message)
            } finally {
                setCarregando(false)
            }
        }

        carregarPerfil()
    }, [id])

    if (carregando) return <p className="text-center py-5">Carregando perfil...</p>
    if (erro) return <p className="alert alert-danger text-center mx-auto my-5 perfil-publico-erro">{erro}</p>

    return (
        <div id="fullscreen">
            <div id="MainContainer">
                <CabecalhoPerfil perfil={perfil} />
            </div>
            <Feed usuarioId={id} />
        </div>
    )
}
