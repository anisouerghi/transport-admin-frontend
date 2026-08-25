# transport-admin-frontend

Back-Office signalements TRANSTU (Angular **21** + CoreUI).

> API cible locale : **`http://localhost:8082`** (`admin-api`).  
> `npm start` sert sur le port **4300** (le voyageur reste sur **4200**).

## Développement local

```bash
cd transport-admin-frontend
npm install
npm start
# http://localhost:4300  → API http://localhost:8082
```

Backend : `mvn -pl admin-api -am spring-boot:run` dans le repo `transport-api`.

Port 4200 si besoin : `npm run start:4200`.

## Build production

```bash
npm run build
```
