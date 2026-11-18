import { useEffect, useState } from 'react';
import Feed from './Feed';
import FotoPerfil from '../componentes/FotoPerfil';
import { API_URL } from '../config/api';
import { fetchComAuth } from '../services/auth';

function Home() {
    const [perfil, setPerfil] = useState({
        nome: '',
        nome_usuario: '',
        bio: '',
        foto: '',
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
                    <div id="profileheader">
                        <div id="profilecover"></div>

                        <div id="profilecontent">
                            <FotoPerfil img={perfil.foto}></FotoPerfil>
                            <div id="textodeperfil">
                                <div id="nome">
                                    <p><strong>{perfil.nome}</strong></p>
                                </div>
                                <div id="username">
                                    <p>@{perfil.nome_usuario}</p>
                                </div>
                                <div id="dadosnumericos">
                                    <p><strong>{perfil.seguidores}</strong> seguidores <span>·</span> <strong>{perfil.seguindo}</strong> seguindo</p>
                                </div>
                                {perfil.bio && <div id="bio"><p>{perfil.bio}</p></div>}
                            </div>
                        </div>
                    </div>
                </div>
                <Feed apenasDoUsuario />
            </div>

            


            


        </>
    );
}

export default Home

