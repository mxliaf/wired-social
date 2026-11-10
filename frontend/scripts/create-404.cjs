const { copyFileSync } = require('node:fs')
const { join } = require('node:path')

const pastaDist = join(__dirname, '..', 'dist')

copyFileSync(
  join(pastaDist, 'index.html'),
  join(pastaDist, '404.html'),
)

console.log('Arquivo dist/404.html criado para o GitHub Pages.')
