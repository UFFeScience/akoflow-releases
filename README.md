# AkoFlow Release Image

Container de release que baixa a última versão da `main` do backend e do frontend, faz o build e expõe a aplicação inteira na porta 80.

## Estrutura

- `cloud/` - futura versão para disponibilidade em cloud.
- `desktop/` - app Electron local que usa esta imagem de release.

## Roteamento

- `/api` -> Laravel
- `/` -> Next.js

## Build

```bash
docker build -t akoflow-release .
```

Se precisar usar outro fork ou outra branch, sobrescreva os `build-args`:

```bash
docker build \
  --build-arg BACKEND_REPO=https://github.com/UFFeScience/akoflow-deployment-control-plane.git \
  --build-arg FRONTEND_REPO=https://github.com/UFFeScience/akoflow-deployment-control-plane-ui.git \
  --build-arg BACKEND_REF=main \
  --build-arg FRONTEND_REF=main \
  -t akoflow-release .
```

## Run

```bash
docker run --rm -p 80:80 akoflow-release
```

O container inicializa um banco SQLite local, aplica as migrations, executa o `db:seed`, sobe o worker de fila, o Laravel e o Next atrás do Nginx.

## Desktop app

A pasta `desktop/` será a interface local do AkoFlow. Ela vai verificar se o Docker está instalado, confirmar se o daemon está ativo e orientar a instalação/ativação quando necessário.