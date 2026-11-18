import { useEffect, useRef, useState } from 'react'
import { API_URL } from '../config/api'
import { fetchComAuth } from '../services/auth'

async function requisitar(caminho, opcoes) {
    const resposta = await fetchComAuth(`${API_URL}/api/stories${caminho}`, opcoes)
    if (resposta.status === 413) throw new Error('A imagem é grande demais. Escolha um arquivo de até 2,5 MB.')
    const dados = await resposta.json()
    if (!resposta.ok) throw new Error(dados.erro || 'Não foi possível carregar os stories')
    return dados
}

function ModalStory({ children, fechar }) {
    const ref = useRef(null)
    useEffect(() => {
        const dialog = ref.current
        const anterior = document.activeElement
        dialog.showModal()
        return () => { dialog.close(); anterior?.focus() }
    }, [])
    return <dialog ref={ref} className="story-dialog" aria-label="Stories" onCancel={(event) => { event.preventDefault(); fechar() }}
        onClick={(event) => { if (event.target === event.currentTarget) fechar() }}>
        <button type="button" className="story-fechar" onClick={fechar} aria-label="Fechar stories">×</button>
        {children}
    </dialog>
}

function Visualizador({ stories, usuario, fechar, aoVer }) {
    const [indice, setIndice] = useState(0)
    const [imagem, setImagem] = useState('')
    const [erro, setErro] = useState('')
    const story = stories[indice]
    useEffect(() => {
        let ativo = true
        requisitar(`/${story.id}`).then((dados) => {
            if (ativo) setImagem(dados.imagem)
        }).catch((error) => { if (ativo) setErro(error.message) })
        return () => { ativo = false }
    }, [story.id])

    async function marcarVisto() {
        try {
            await requisitar(`/${story.id}/visto`, { method: 'PUT' })
            aoVer(story.id)
        } catch { setErro('Não foi possível registrar a visualização. Abra o story novamente para tentar outra vez.') }
    }

    function mudar(proximo) {
        if (proximo >= stories.length) return fechar()
        setImagem(''); setErro(''); setIndice(proximo)
    }

    return <ModalStory fechar={fechar}>
        <h2 className="h5">@{usuario.nome_usuario}</h2>
        <p className="small">{indice + 1} de {stories.length}</p>
        <div className="story-progresso" aria-hidden="true">
            {stories.map((item, i) => <span key={item.id} className={i <= indice ? 'ativo' : ''} />)}
        </div>
        {!imagem && !erro && <p role="status">Carregando story...</p>}
        {imagem && <img className="story-midia" src={imagem} alt={`Story de ${usuario.nome_usuario}`} onLoad={marcarVisto} onError={() => setErro('Não foi possível exibir esta imagem.')} />}
        {erro && <p role="alert" className="text-danger">{erro}</p>}
        <div className="story-controles">
            <button type="button" className="botao-post" disabled={indice === 0} onClick={() => mudar(indice - 1)}>Anterior</button>
            <button type="button" className="botao-post" onClick={() => mudar(indice + 1)}>{indice === stories.length - 1 ? 'Concluir' : 'Próximo'}</button>
        </div>
    </ModalStory>
}

export function StoryAvatar({ usuario, children }) {
    const [stories, setStories] = useState([])
    const [aberto, setAberto] = useState(null)
    const [erro, setErro] = useState('')
    useEffect(() => {
        if (!usuario.id) return
        let ativo = true
        function carregar() {
            requisitar(`?usuario=${encodeURIComponent(usuario.id)}`).then((dados) => {
                if (ativo) { setStories(dados); setErro('') }
            }).catch(() => { if (ativo) setErro('Não foi possível carregar os stories') })
        }
        carregar()
        const intervalo = setInterval(carregar, 60000)
        window.addEventListener('wired-stories-updated', carregar)
        return () => { ativo = false; clearInterval(intervalo); window.removeEventListener('wired-stories-updated', carregar) }
    }, [usuario.id])
    const ativos = stories.filter((story) => new Date(story.expira_em) > new Date())
    const novos = ativos.some((story) => !story.visto)
    return <>
        <button type="button" className={`story-avatar-botao ${ativos.length ? novos ? 'story-nao-visto' : 'story-visto' : 'story-sem'}`}
            aria-label={ativos.length ? `Ver stories de ${usuario.nome_usuario}${novos ? ', não vistos' : ', já vistos'}` : `${usuario.nome_usuario || 'Perfil'} sem stories`}
            onClick={() => setAberto(ativos)} title={erro || 'Ver stories'}>
            {children}
        </button>
        {aberto && (aberto.length ? <Visualizador stories={aberto} usuario={usuario} fechar={() => setAberto(null)}
            aoVer={(id) => {
                setStories((lista) => lista.map((story) => story.id === id ? { ...story, visto: true } : story))
            }} /> : <ModalStory fechar={() => setAberto(null)}><p>{erro || 'Este perfil ainda não tem stories ativos.'}</p></ModalStory>)}
    </>
}

export function NovoStory() {
    const [aberto, setAberto] = useState(false)
    const [imagem, setImagem] = useState('')
    const [erro, setErro] = useState('')
    const [enviando, setEnviando] = useState(false)
    function fechar() { if (!enviando) { setAberto(false); setImagem(''); setErro('') } }
    function selecionar(event) {
        const arquivo = event.target.files[0]
        setImagem(''); setErro('')
        if (!arquivo) return
        if (!['image/png', 'image/jpeg', 'image/webp', 'image/gif'].includes(arquivo.type) || arquivo.size > 2500000) {
            setErro('Escolha PNG, JPEG, WebP ou GIF de até 2,5 MB.'); return
        }
        const leitor = new FileReader()
        leitor.onload = () => setImagem(leitor.result)
        leitor.onerror = () => setErro('Não foi possível ler a imagem')
        leitor.readAsDataURL(arquivo)
    }
    async function publicar(event) {
        event.preventDefault()
        if (!imagem || enviando) return
        setEnviando(true); setErro('')
        try {
            await requisitar('', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ imagem }) })
            window.dispatchEvent(new Event('wired-stories-updated'))
            setAberto(false); setImagem('')
        } catch (error) { setErro(error.message) }
        finally { setEnviando(false) }
    }
    return <>
        <button type="button" className="story-item story-item-botao" onClick={() => setAberto(true)}>
            <span className="story-adicionar">+</span><small>Novo story</small>
        </button>
        {aberto && <ModalStory fechar={fechar}>
            <h2 className="h5">Novo story</h2>
            <p>Compartilhe uma imagem ou GIF por 24 horas.</p>
            <form onSubmit={publicar}>
                <label htmlFor="imagemStory" className="form-label">Imagem do story</label>
                <input id="imagemStory" type="file" className="form-control mb-3" accept="image/png,image/jpeg,image/webp,image/gif" onChange={selecionar} disabled={enviando} />
                {imagem && <img src={imagem} className="story-midia" alt="Prévia do story" />}
                {erro && <p role="alert" className="text-danger">{erro}</p>}
                <button className="botao-formulario w-100 mt-3" disabled={!imagem || enviando}>{enviando ? 'Publicando...' : 'Publicar story'}</button>
            </form>
        </ModalStory>}
    </>
}
