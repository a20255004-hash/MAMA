-- Cimientos: ciudades, mercados, paquetes y solicitudes de la web.
-- Todo lo operativo cuelga de una ciudad para poder crecer sin reescribir.

create extension if not exists pgcrypto;

create table public.ciudades (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  nombre      text not null,
  activa      boolean not null default true,
  creado_en   timestamptz not null default now()
);

create table public.mercados (
  id          uuid primary key default gen_random_uuid(),
  ciudad_id   uuid not null references public.ciudades(id),
  slug        text not null,
  nombre      text not null,
  activo      boolean not null default true,
  creado_en   timestamptz not null default now(),
  unique (ciudad_id, slug)
);
create index mercados_ciudad_idx on public.mercados (ciudad_id);

-- Paquetes y combos. El precio no vive aquí: cada pedido se cotiza con precios del día.
create table public.paquetes (
  id            uuid primary key default gen_random_uuid(),
  ciudad_id     uuid not null references public.ciudades(id),
  slug          text not null,
  nombre        text not null check (char_length(nombre) between 2 and 80),
  para_quien    text not null default '' check (char_length(para_quien) <= 140),
  descripcion   text not null default '' check (char_length(descripcion) <= 400),
  contenido     text[] not null default '{}',
  publicado     boolean not null default false,
  orden         integer not null default 0,
  creado_en     timestamptz not null default now(),
  actualizado_en timestamptz not null default now(),
  unique (ciudad_id, slug)
);
create index paquetes_publicados_idx on public.paquetes (ciudad_id, orden) where publicado;

create type public.modalidad_compra as enum ('paquete', 'lista', 'delegada', 'caseros');
create type public.tipo_recepcion  as enum ('domicilio', 'recojo');
create type public.estado_solicitud as enum ('nueva', 'contactada', 'convertida', 'descartada');

-- Solicitudes que llegan desde la web. El panel las convertirá en clientes y pedidos.
create table public.solicitudes (
  id          uuid primary key default gen_random_uuid(),
  ciudad_id   uuid not null references public.ciudades(id),
  nombre      text not null check (char_length(nombre) between 2 and 80),
  celular     text not null check (celular ~ '^9[0-9]{8}$'),
  modalidad   public.modalidad_compra not null,
  recepcion   public.tipo_recepcion not null,
  paquete_id  uuid references public.paquetes(id),
  mensaje     text not null default '' check (char_length(mensaje) <= 1200),
  estado      public.estado_solicitud not null default 'nueva',
  origen      text not null default 'web' check (char_length(origen) <= 40),
  creado_en   timestamptz not null default now()
);
create index solicitudes_bandeja_idx on public.solicitudes (ciudad_id, estado, creado_en desc);
create index solicitudes_paquete_idx on public.solicitudes (paquete_id);

-- Seguridad por filas -------------------------------------------------------
alter table public.ciudades    enable row level security;
alter table public.mercados    enable row level security;
alter table public.paquetes    enable row level security;
alter table public.solicitudes enable row level security;

create policy "ciudades activas visibles" on public.ciudades
  for select to anon, authenticated using (activa);

create policy "mercados activos visibles" on public.mercados
  for select to anon, authenticated using (activo);

create policy "paquetes publicados visibles" on public.paquetes
  for select to anon, authenticated using (publicado);

-- La web puede dejar una solicitud, pero no leer ni modificar ninguna.
-- Solo entra como 'nueva' y con origen 'web'; el resto lo decide el panel.
create policy "la web registra solicitudes" on public.solicitudes
  for insert to anon, authenticated
  with check (estado = 'nueva' and origen = 'web');

revoke all on public.solicitudes from anon, authenticated;
grant insert (ciudad_id, nombre, celular, modalidad, recepcion, paquete_id, mensaje)
  on public.solicitudes to anon, authenticated;

-- Datos base ----------------------------------------------------------------
insert into public.ciudades (slug, nombre) values ('tacna', 'Tacna');

insert into public.mercados (ciudad_id, slug, nombre)
select id, 'grau', 'Mercado Grau' from public.ciudades where slug = 'tacna';
