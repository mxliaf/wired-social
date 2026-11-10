function Destaque({ img, nome }) {
    return (
        <div className="destaque">
            <img src={img} alt={`Destaque ${nome}`} />
            <p>{nome}</p>
        </div>
    )
}

export default Destaque
