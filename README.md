# Casera

Compras del Mercado Grau de Tacna por encargo: página comercial, app de clientes y panel de administración sobre una misma base.

```bash
npm install
npm run dev        # página comercial en http://localhost:3000
npm run typecheck
npm run build
```

Para guardar solicitudes y leer paquetes, copia `apps/web/.env.example` a `apps/web/.env.local` y completa los datos de Supabase. El esquema está en `supabase/migrations/`.

- Contexto del negocio y reglas: [CLAUDE.md](CLAUDE.md)
- Diseño: [docs/direccion-de-arte.md](docs/direccion-de-arte.md)
- Avance y pendientes: [docs/estado.md](docs/estado.md)
