import { useEffect, useState } from 'react';
import Feed from './Feed';
import CabecalhoPerfil from '../componentes/CabecalhoPerfil';
import { API_URL } from '../config/api';
import { fetchComAuth } from '../services/auth';

function Home() {
    const [perfil, setPerfil] = useState({
        nome: '',
        nome_usuario: '',
        bio: '',
        foto: '',
        capa: '',
        seguidores: 0,
        seguindo: 0,
    })

    useEffect(() => {
        async function carregarPerfil() {
            try {
                const resposta = await fetchComAuth(`${API_URL}/api/perfil`)
                const dados = await resposta.json()

                if (resposta.ok) {
                    setPerfil(dados)
                }
            } catch (error) {
                console.error('Não foi possível carregar o perfil', error)
            }
        }

        carregarPerfil()
    }, [])

    return (
        <>
            <div id="fullscreen">
                <div id="MainContainer">
                    <CabecalhoPerfil perfil={perfil} />
                </div>
                <Feed apenasDoUsuario />
            </div>

            


            


        </>
    );
}

export default Home

