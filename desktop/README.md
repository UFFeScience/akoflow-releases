# AkoFlow Desktop

Interface local do AkoFlow em Electron.

## O que ela faz

- Verifica se o Docker está instalado.
- Verifica se o daemon do Docker está ativo.
- Orienta a instalação ou abertura do Docker Desktop quando necessário.
- Serve como porta de entrada para o fluxo local que vai usar a imagem de release.

## Estrutura

- `electron/` - processo principal, preload e integração com o sistema.
- `renderer/app.js` - bootstrap da interface.
- `renderer/components/` - blocos reutilizáveis da tela.
- `renderer/services/` - acesso ao estado do Docker e ações externas.
- `renderer/styles.css` - tema visual da aplicação.
- `renderer/styles/` - tokens, layout, hero, status e responsividade.

## Fluxo esperado

1. Instalar as dependências com `npm install`.
2. Abrir a aplicação com `npm start`.
3. Se o Docker não existir, a tela mostra o link de instalação.
4. Se o daemon estiver desligado, a tela orienta a abrir o Docker Desktop.

## Welcome flow

- Tela inicial em etapas com animação e progresso.
- Detecção automática do sistema para sugerir o download correto.
- Caminho guiado: welcome, Docker, daemon, release image.
