import mongoose from 'mongoose'

let conexao

export async function conectarBanco() {
    if (conexao) return conexao

    const uri = process.env.MONGODB_URI

    if (!uri) {
        throw new Error('MONGODB_URI não configurada')
    }

    conexao = mongoose.connect(uri, {
        dbName: process.env.MONGODB_DB || 'wired',
    })

    return conexao
}
