# admin-frontend

Back-Office recrutement TRANSTU (Angular **21** + CoreUI **5.6**).  
Seules les fonctionnalités métier sont présentes (pas de pages démo du template).

**Branche `admin_ar`** : interface en arabe (RTL), locale `ar` dans `environment.ts`.

```
src/app/
├── core/           # auth JWT, guards, services API
├── features/       # candidats, postes, référentiels, rbac, auth, dashboard
└── layout/         # sidebar CoreUI
```

## Développement local

```bash
cd admin-frontend
npm install
npm start
# http://localhost:4200
```

## Build production

```bash
npm install
npm run build
```

## Docker (développement)

Le service `admin-frontend` du `docker-compose` exécute **`npm install && npm run start:docker`** (`ng serve` sur le port 4200, rechargement à chaud).

```bash
# Depuis la racine du monorepo
docker compose up -d --build admin-frontend
# UI : http://localhost:4200  — API proxifiée vers admin-backend (/api)
```

Fichiers : `Dockerfile.dev`, `proxy.conf.docker.json` (cible `http://admin-backend:8080`).

## Docker (production nginx)

```bash
docker build -f Dockerfile -t recrutement-admin-ui-prod ./admin-frontend
```

Le `Dockerfile` (prod) fait `npm run build` puis sert les fichiers via nginx.

## Personnalisation

| Fichier | Rôle |
|---------|------|
| `src/app/layout/default-layout/_nav.ts` | Menu latéral |
| `src/app/app.routes.ts` | Routes |
| `src/environments/` | URL API (`/api` proxifié par `ng serve` ou nginx) |

Documentation composants : [CoreUI Angular Docs](https://coreui.io/angular/docs/)
