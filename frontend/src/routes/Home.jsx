import { useEffect, useState } from 'react';
import Destaques from '../componentes/Destaques'
import BarraAcoes from '../componentes/BarraAcoes';
import Feed from './Feed';
import FotoPerfil from '../componentes/FotoPerfil';
import IconeLink from '../componentes/IconeLink';
import { API_URL } from '../config/api';
import { fetchComAuth } from '../services/auth';

function Home() {
    const [perfil, setPerfil] = useState({
        nome_usuario: 'agaetisbyrju',
        bio: '2005 / fashion and technology enthusiast',
        foto: 'https://i.pinimg.com/1200x/6c/ef/fb/6ceffb9310699f63aa4cfe58b67bf2dc.jpg',
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
                                    <p><strong>marilia</strong></p>
                                </div>
                                <div id="username">
                                    <p>{perfil.nome_usuario} <span>·</span> she/her</p>
                                </div>
                                <div id="dadosnumericos">
                                    <p><strong>64,7 mil</strong> seguidores  <span>·</span><strong> 3.009</strong> seguindo</p>
                                </div>
                                <div id="bio">
                                    <p>{perfil.bio}</p>
                                </div>
                                <div id="linkbio">
                                    <IconeLink></IconeLink>
                                    <a href="https://www.last.fm/user/morphinedrip" target="_blank" rel="noreferrer">last.fm/user/morphinedrip</a>
                                </div>
                            </div>
                        </div>
                        <BarraAcoes></BarraAcoes>
                    </div>
                </div>
                <Destaques></Destaques>
                <Feed></Feed>
            </div>

            


            


        </>
    );
}

export default Home

