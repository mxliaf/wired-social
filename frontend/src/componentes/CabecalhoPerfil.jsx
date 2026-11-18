import FotoPerfil from './FotoPerfil'
import { StoryAvatar } from './Stories'

export default function CabecalhoPerfil({ perfil }) {
    return (
        <div id="profileheader">
            <div id="profilecover">
                {perfil.capa ? (
                    <img src={perfil.capa} alt="Capa do perfil" />
                ) : (
                    <span>Sem capa</span>
                )}
            </div>

            <div id="profilecontent">
                <div id="profilepicture">
                    <StoryAvatar usuario={perfil}><FotoPerfil img={perfil.foto} semContainer /></StoryAvatar>
                </div>
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
    )
}
