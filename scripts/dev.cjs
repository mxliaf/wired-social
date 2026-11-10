const { spawn } = require('node:child_process')
const { join } = require('node:path')

const pastaRaiz = join(__dirname, '..')
const comandoNpm = process.platform === 'win32' ? 'npm.cmd' : 'npm'
const processos = []
let encerrando = false

function iniciar(nome, pasta) {
  const processo = spawn(comandoNpm, ['run', 'dev'], {
    cwd: join(pastaRaiz, pasta),
    stdio: 'inherit',
  })

  processos.push(processo)

  processo.on('error', (erro) => {
    console.error(`Não foi possível iniciar ${nome}:`, erro.message)
    encerrar(1)
  })

  processo.on('exit', (codigo) => {
    if (!encerrando) {
      console.log(`${nome} foi encerrado.`)
      encerrar(codigo ?? 0)
    }
  })
}

function encerrar(codigo = 0) {
  if (encerrando) return

  encerrando = true

  for (const processo of processos) {
    if (!processo.killed) processo.kill('SIGTERM')
  }

  setTimeout(() => process.exit(codigo), 100)
}

process.on('SIGINT', () => encerrar(0))
process.on('SIGTERM', () => encerrar(0))

iniciar('backend', 'backend')
iniciar('frontend', 'frontend')
