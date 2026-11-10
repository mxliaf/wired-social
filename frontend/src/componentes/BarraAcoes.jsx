const botoesAcao = ['Seguir', 'Enviar Mensagem', 'Recomendações']

function BarraAcoes() {
    return (
        <div id="barraacoes">
            {botoesAcao.map((texto) => (
                <button type="button" className="botoesopcoes" key={texto}>
                    {texto}
                </button>
            ))}
        </div>
    )
}

export default BarraAcoes
