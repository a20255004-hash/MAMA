-- Operación del negocio: usuarios y roles, hogares de clientes, catálogo, pedidos,
-- cotizaciones, caja, entregas y Libro de Reclamaciones.
--
-- Principios de seguridad:
--  * Todas las tablas tienen seguridad por filas (RLS) y permisos mínimos por columna.
--  * Las funciones de apoyo viven en el esquema `privado`, que la API no expone.
--  * Las acciones sensibles (aprobar, cotizar, comprar, cambiar de estado) son funciones
--    que validan quién llama y en qué estado está el pedido.
--  * La caja no permite mezclar el dinero de los clientes con los ingresos del negocio.

create schema if not exists privado;
revoke all on schema privado from public;
grant usage on schema privado to authenticated;

-- Tipos -------------------------------------------------------------------------
create type public.rol_usuario as enum ('cliente', 'compradora', 'repartidor', 'administrador');
create type public.estado_pedido as enum
  ('solicitado', 'cotizado', 'aprobado', 'en_compra', 'liquidado', 'en_entrega', 'entregado', 'cerrado', 'cancelado');
create type public.sustitucion as enum ('similar', 'consultar', 'omitir');
create type public.estado_item as enum ('pendiente', 'comprado', 'sin_stock', 'sustituido');
create type public.estado_cotizacion as enum ('enviada', 'aprobada', 'rechazada', 'reemplazada');
create type public.cuenta_caja as enum ('fondos_clientes', 'negocio');
create type public.tipo_movimiento as enum
  ('adelanto_cliente', 'cobro_saldo_cliente', 'compra_productos', 'devolucion_cliente',
   'ingreso_servicio', 'ingreso_delivery', 'gasto_operativo', 'pago_personal', 'otro');
create type public.estado_entrega as enum ('pendiente', 'en_camino', 'entregada', 'fallida');
create type public.tipo_reclamacion as enum ('reclamo', 'queja');
create type public.estado_reclamacion as enum ('recibido', 'en_atencion', 'respondido');

-- Perfiles: una fila por persona que entra (cliente o equipo) ---------------------
create table public.perfiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  ciudad_id  uuid not null references public.ciudades (id),
  rol        public.rol_usuario not null default 'cliente',
  nombre     text not null default '' check (char_length(nombre) <= 80),
  celular    text check (celular is null or celular ~ '^9[0-9]{8}$'),
  activo     boolean not null default true,
  creado_en  timestamptz not null default now()
);
create index perfiles_ciudad_idx on public.perfiles (ciudad_id);

-- Hogares: la casa del cliente, con o sin cuenta en la app ------------------------
create table public.hogares (
  id                  uuid primary key default gen_random_uuid(),
  ciudad_id           uuid not null references public.ciudades (id),
  perfil_id           uuid unique references public.perfiles (id) on delete set null,
  nombre              text not null check (char_length(nombre) between 2 and 80),
  celular             text check (celular is null or celular ~ '^9[0-9]{8}$'),
  personas            smallint check (personas is null or personas between 1 and 30),
  presupuesto_semanal numeric(10, 2) check (presupuesto_semanal is null or presupuesto_semanal >= 0),
  notas               text not null default '' check (char_length(notas) <= 600),
  creado_en           timestamptz not null default now(),
  actualizado_en      timestamptz not null default now()
);
create index hogares_ciudad_idx on public.hogares (ciudad_id);

create table public.direcciones (
  id         uuid primary key default gen_random_uuid(),
  hogar_id   uuid not null references public.hogares (id) on delete cascade,
  etiqueta   text not null default 'Casa' check (char_length(etiqueta) between 1 and 40),
  direccion  text not null check (char_length(direccion) between 5 and 200),
  referencia text not null default '' check (char_length(referencia) <= 200),
  zona       text not null default '' check (char_length(zona) <= 60),
  creado_en  timestamptz not null default now()
);
create index direcciones_hogar_idx on public.direcciones (hogar_id);

-- Los caseros de confianza de cada hogar y sus preferencias de compra.
create table public.caseros_hogar (
  id        uuid primary key default gen_random_uuid(),
  hogar_id  uuid not null references public.hogares (id) on delete cascade,
  rubro     text not null default '' check (char_length(rubro) <= 60),
  nombre    text not null check (char_length(nombre) between 1 and 80),
  puesto    text not null default '' check (char_length(puesto) <= 120),
  nota      text not null default '' check (char_length(nota) <= 300),
  creado_en timestamptz not null default now()
);
create index caseros_hogar_idx on public.caseros_hogar (hogar_id);

create table public.preferencias_hogar (
  id         uuid primary key default gen_random_uuid(),
  hogar_id   uuid not null references public.hogares (id) on delete cascade,
  producto   text not null check (char_length(producto) between 1 and 80),
  preferencia text not null default '' check (char_length(preferencia) <= 200),
  sustitucion public.sustitucion not null default 'consultar',
  creado_en  timestamptz not null default now()
);
create index preferencias_hogar_idx on public.preferencias_hogar (hogar_id);

-- Catálogo ------------------------------------------------------------------------
create table public.categorias (
  id     smallint generated always as identity primary key,
  nombre text not null unique,
  orden  smallint not null default 0
);

create table public.productos (
  id            uuid primary key default gen_random_uuid(),
  categoria_id  smallint not null references public.categorias (id),
  nombre        text not null unique check (char_length(nombre) between 2 and 80),
  unidad_defecto text not null default 'kg' check (char_length(unidad_defecto) between 1 and 20),
  activo        boolean not null default true,
  creado_en     timestamptz not null default now()
);
create index productos_categoria_idx on public.productos (categoria_id);

create table public.puestos (
  id         uuid primary key default gen_random_uuid(),
  mercado_id uuid not null references public.mercados (id),
  nombre     text not null check (char_length(nombre) between 1 and 80),
  rubro      text not null default '' check (char_length(rubro) <= 60),
  ubicacion  text not null default '' check (char_length(ubicacion) <= 120),
  notas      text not null default '' check (char_length(notas) <= 300),
  activo     boolean not null default true,
  creado_en  timestamptz not null default now()
);
create index puestos_mercado_idx on public.puestos (mercado_id);

-- Pedidos ------------------------------------------------------------------------
create table public.pedidos (
  id             uuid primary key default gen_random_uuid(),
  numero         bigint generated always as identity unique,
  ciudad_id      uuid not null references public.ciudades (id),
  mercado_id     uuid references public.mercados (id),
  hogar_id       uuid not null references public.hogares (id) on delete restrict,
  solicitud_id   uuid references public.solicitudes (id) on delete set null,
  modalidad      public.modalidad_compra not null,
  recepcion      public.tipo_recepcion not null,
  direccion_id   uuid references public.direcciones (id) on delete set null,
  estado         public.estado_pedido not null default 'solicitado',
  fecha_deseada  date,
  notas_cliente  text not null default '' check (char_length(notas_cliente) <= 1200),
  creado_por     uuid references public.perfiles (id) on delete set null default auth.uid(),
  creado_en      timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);
create index pedidos_hogar_idx on public.pedidos (hogar_id);
create index pedidos_bandeja_idx on public.pedidos (ciudad_id, estado, creado_en desc);
create index pedidos_solicitud_idx on public.pedidos (solicitud_id);
create index pedidos_direccion_idx on public.pedidos (direccion_id);
create index pedidos_mercado_idx on public.pedidos (mercado_id);

create table public.pedido_items (
  id                   uuid primary key default gen_random_uuid(),
  pedido_id            uuid not null references public.pedidos (id) on delete cascade,
  producto_id          uuid references public.productos (id) on delete set null,
  descripcion          text not null check (char_length(descripcion) between 1 and 160),
  cantidad             numeric(10, 3) not null check (cantidad > 0),
  unidad               text not null default 'unidad' check (char_length(unidad) between 1 and 20),
  preferencia          text not null default '' check (char_length(preferencia) <= 200),
  casero               text not null default '' check (char_length(casero) <= 80),
  sustitucion          public.sustitucion not null default 'consultar',
  precio_unit_estimado numeric(10, 2) check (precio_unit_estimado is null or precio_unit_estimado >= 0),
  estado_item          public.estado_item not null default 'pendiente',
  cantidad_real        numeric(10, 3) check (cantidad_real is null or cantidad_real >= 0),
  precio_real_total    numeric(10, 2) check (precio_real_total is null or precio_real_total >= 0),
  nota_compra          text not null default '' check (char_length(nota_compra) <= 300),
  orden                integer not null default 0,
  creado_en            timestamptz not null default now()
);
create index pedido_items_pedido_idx on public.pedido_items (pedido_id, orden);
create index pedido_items_producto_idx on public.pedido_items (producto_id);

create table public.cotizaciones (
  id                       uuid primary key default gen_random_uuid(),
  pedido_id                uuid not null references public.pedidos (id) on delete cascade,
  version                  integer not null,
  total_productos_estimado numeric(12, 2) not null check (total_productos_estimado >= 0),
  tarifa_servicio          numeric(10, 2) not null default 0 check (tarifa_servicio >= 0),
  tarifa_delivery          numeric(10, 2) not null default 0 check (tarifa_delivery >= 0),
  tolerancia_pct           numeric(5, 2) not null default 10 check (tolerancia_pct between 0 and 100),
  estado                   public.estado_cotizacion not null default 'enviada',
  enviada_en               timestamptz not null default now(),
  aprobada_en              timestamptz,
  creado_por               uuid references public.perfiles (id) on delete set null,
  unique (pedido_id, version)
);
create index cotizaciones_creado_por_idx on public.cotizaciones (creado_por);

create table public.notas_internas (
  id        uuid primary key default gen_random_uuid(),
  pedido_id uuid not null references public.pedidos (id) on delete cascade,
  autor_id  uuid references public.perfiles (id) on delete set null default auth.uid(),
  texto     text not null check (char_length(texto) between 1 and 1000),
  creado_en timestamptz not null default now()
);
create index notas_internas_pedido_idx on public.notas_internas (pedido_id);
create index notas_internas_autor_idx on public.notas_internas (autor_id);

create table public.entregas (
  id            uuid primary key default gen_random_uuid(),
  pedido_id     uuid not null unique references public.pedidos (id) on delete cascade,
  repartidor_id uuid references public.perfiles (id) on delete set null,
  ventana       text not null default '' check (char_length(ventana) <= 80),
  estado        public.estado_entrega not null default 'pendiente',
  entregada_en  timestamptz,
  nota          text not null default '' check (char_length(nota) <= 300)
);
create index entregas_repartidor_idx on public.entregas (repartidor_id);

-- Caja: libro de movimientos que no se edita ni se borra (se corrige con otro movimiento).
-- La restricción impide mezclar el dinero de los clientes con los ingresos del negocio.
create table public.movimientos (
  id          uuid primary key default gen_random_uuid(),
  ciudad_id   uuid not null references public.ciudades (id),
  fecha       date not null default current_date,
  cuenta      public.cuenta_caja not null,
  tipo        public.tipo_movimiento not null,
  entrada     boolean not null,
  monto       numeric(12, 2) not null check (monto > 0),
  pedido_id   uuid references public.pedidos (id) on delete set null,
  descripcion text not null default '' check (char_length(descripcion) <= 300),
  creado_por  uuid references public.perfiles (id) on delete set null default auth.uid(),
  creado_en   timestamptz not null default now(),
  constraint caja_separada check (
    (tipo in ('adelanto_cliente', 'cobro_saldo_cliente') and cuenta = 'fondos_clientes' and entrada)
    or (tipo in ('compra_productos', 'devolucion_cliente') and cuenta = 'fondos_clientes' and not entrada)
    or (tipo in ('ingreso_servicio', 'ingreso_delivery') and cuenta = 'negocio' and entrada)
    or (tipo in ('gasto_operativo', 'pago_personal') and cuenta = 'negocio' and not entrada)
    or tipo = 'otro'
  )
);
create index movimientos_caja_idx on public.movimientos (ciudad_id, fecha desc);
create index movimientos_pedido_idx on public.movimientos (pedido_id);
create index movimientos_creado_por_idx on public.movimientos (creado_por);

create view public.resumen_caja with (security_invoker = true) as
select
  ciudad_id,
  date_trunc('month', fecha)::date as mes,
  coalesce(sum(monto) filter (where tipo in ('ingreso_servicio', 'ingreso_delivery')), 0) as ingresos,
  coalesce(sum(monto) filter (where tipo in ('gasto_operativo', 'pago_personal')), 0) as gastos,
  coalesce(sum(monto) filter (where tipo in ('ingreso_servicio', 'ingreso_delivery')), 0)
    - coalesce(sum(monto) filter (where tipo in ('gasto_operativo', 'pago_personal')), 0) as ganancia,
  coalesce(sum(case when cuenta = 'fondos_clientes' then case when entrada then monto else -monto end end), 0)
    as fondos_clientes_neto
from public.movimientos
group by ciudad_id, date_trunc('month', fecha);

-- Libro de Reclamaciones (virtual) ----------------------------------------------
create table public.reclamaciones (
  id                 uuid primary key default gen_random_uuid(),
  numero             bigint generated always as identity unique,
  ciudad_id          uuid not null references public.ciudades (id),
  tipo               public.tipo_reclamacion not null,
  consumidor_nombre  text not null check (char_length(consumidor_nombre) between 3 and 120),
  documento_tipo     text not null check (documento_tipo in ('DNI', 'CE', 'Pasaporte', 'RUC')),
  documento_numero   text not null check (documento_numero ~ '^[A-Za-z0-9]{6,15}$'),
  celular            text not null check (celular ~ '^9[0-9]{8}$'),
  correo             text not null check (correo ~* '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$' and char_length(correo) <= 120),
  domicilio          text not null check (char_length(domicilio) between 5 and 200),
  bien_tipo          text not null check (bien_tipo in ('producto', 'servicio')),
  monto_reclamado    numeric(10, 2) check (monto_reclamado is null or monto_reclamado >= 0),
  descripcion_bien   text not null check (char_length(descripcion_bien) between 3 and 300),
  detalle            text not null check (char_length(detalle) between 10 and 2000),
  pedido_consumidor  text not null default '' check (char_length(pedido_consumidor) <= 600),
  estado             public.estado_reclamacion not null default 'recibido',
  respuesta          text check (respuesta is null or char_length(respuesta) <= 3000),
  respondido_en      timestamptz,
  fecha_limite       date not null,
  creado_en          timestamptz not null default now()
);
create index reclamaciones_bandeja_idx on public.reclamaciones (ciudad_id, estado, creado_en desc);

-- Funciones de apoyo (esquema privado) -----------------------------------------
create function privado.mi_rol() returns public.rol_usuario
language sql stable security definer set search_path = ''
as $$ select rol from public.perfiles where id = (select auth.uid()) and activo $$;

create function privado.mi_ciudad() returns uuid
language sql stable security definer set search_path = ''
as $$ select ciudad_id from public.perfiles where id = (select auth.uid()) and activo $$;

create function privado.es_staff() returns boolean
language sql stable security definer set search_path = ''
as $$ select coalesce(privado.mi_rol() in ('administrador', 'compradora', 'repartidor'), false) $$;

create function privado.es_admin() returns boolean
language sql stable security definer set search_path = ''
as $$ select coalesce(privado.mi_rol() = 'administrador', false) $$;

create function privado.es_compras() returns boolean
language sql stable security definer set search_path = ''
as $$ select coalesce(privado.mi_rol() in ('administrador', 'compradora'), false) $$;

create function privado.hogar_propio(p_hogar uuid) returns boolean
language sql stable security definer set search_path = ''
as $$ select exists (select 1 from public.hogares h where h.id = p_hogar and h.perfil_id = (select auth.uid())) $$;

create function privado.hogar_visible(p_hogar uuid) returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.hogares h
    where h.id = p_hogar
      and (h.perfil_id = (select auth.uid()) or (privado.es_staff() and h.ciudad_id = privado.mi_ciudad()))
  )
$$;

create function privado.hogar_editable(p_hogar uuid) returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.hogares h
    where h.id = p_hogar
      and (h.perfil_id = (select auth.uid()) or (privado.es_admin() and h.ciudad_id = privado.mi_ciudad()))
  )
$$;

create function privado.pedido_propio(p_pedido uuid) returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.pedidos p join public.hogares h on h.id = p.hogar_id
    where p.id = p_pedido and h.perfil_id = (select auth.uid())
  )
$$;

create function privado.pedido_visible(p_pedido uuid) returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.pedidos p join public.hogares h on h.id = p.hogar_id
    where p.id = p_pedido
      and (h.perfil_id = (select auth.uid()) or (privado.es_staff() and p.ciudad_id = privado.mi_ciudad()))
  )
$$;

-- El cliente edita su pedido solo mientras está "solicitado"; la administración, siempre.
create function privado.pedido_editable(p_pedido uuid) returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.pedidos p join public.hogares h on h.id = p.hogar_id
    where p.id = p_pedido
      and ((h.perfil_id = (select auth.uid()) and p.estado = 'solicitado')
           or (privado.es_admin() and p.ciudad_id = privado.mi_ciudad()))
  )
$$;

create function privado.sumar_dias_habiles(p_inicio date, p_dias integer) returns date
language plpgsql immutable set search_path = ''
as $$
declare d date := p_inicio; n integer := 0;
begin
  -- Cuenta de lunes a viernes. No descuenta feriados, así que el plazo calculado nunca es más largo que el legal.
  while n < p_dias loop
    d := d + 1;
    if extract(isodow from d) < 6 then n := n + 1; end if;
  end loop;
  return d;
end
$$;

-- Disparadores -----------------------------------------------------------------
create function privado.tocar() returns trigger
language plpgsql set search_path = ''
as $$ begin new.actualizado_en := now(); return new; end $$;

create trigger tocar_hogares before update on public.hogares for each row execute function privado.tocar();
create trigger tocar_pedidos before update on public.pedidos for each row execute function privado.tocar();
create trigger tocar_paquetes before update on public.paquetes for each row execute function privado.tocar();

-- Al registrarse una persona se crea su perfil de cliente. El rol nunca viene del cliente.
create function privado.nuevo_usuario() returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.perfiles (id, ciudad_id, nombre, celular)
  values (
    new.id,
    (select id from public.ciudades where slug = 'tacna'),
    left(coalesce(new.raw_user_meta_data ->> 'nombre', ''), 80),
    case when new.raw_user_meta_data ->> 'celular' ~ '^9[0-9]{8}$' then new.raw_user_meta_data ->> 'celular' end
  );
  return new;
end
$$;

create trigger perfil_nuevo after insert on auth.users for each row execute function privado.nuevo_usuario();

-- Un cliente no puede fijar precios ni marcar compras: solo la administración o las funciones de compras.
create function privado.limitar_item() returns trigger
language plpgsql set search_path = ''
as $$
begin
  if current_user in ('authenticated', 'anon') and not privado.es_admin() then
    if tg_op = 'INSERT' then
      new.precio_unit_estimado := null;
      new.cantidad_real := null;
      new.precio_real_total := null;
      new.estado_item := 'pendiente';
      new.nota_compra := '';
    else
      new.pedido_id := old.pedido_id;
      new.precio_unit_estimado := old.precio_unit_estimado;
      new.cantidad_real := old.cantidad_real;
      new.precio_real_total := old.precio_real_total;
      new.estado_item := old.estado_item;
      new.nota_compra := old.nota_compra;
    end if;
  end if;
  return new;
end
$$;

create trigger limitar_item before insert or update on public.pedido_items for each row execute function privado.limitar_item();

create function privado.fijar_plazo_reclamo() returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  new.fecha_limite := privado.sumar_dias_habiles(current_date, 15);
  return new;
end
$$;

create trigger plazo_reclamo before insert on public.reclamaciones for each row execute function privado.fijar_plazo_reclamo();

-- Seguridad por filas ----------------------------------------------------------
alter table public.perfiles           enable row level security;
alter table public.hogares            enable row level security;
alter table public.direcciones        enable row level security;
alter table public.caseros_hogar      enable row level security;
alter table public.preferencias_hogar enable row level security;
alter table public.categorias         enable row level security;
alter table public.productos          enable row level security;
alter table public.puestos            enable row level security;
alter table public.pedidos            enable row level security;
alter table public.pedido_items       enable row level security;
alter table public.cotizaciones       enable row level security;
alter table public.notas_internas     enable row level security;
alter table public.entregas           enable row level security;
alter table public.movimientos        enable row level security;
alter table public.reclamaciones      enable row level security;

-- perfiles: cada quien ve el suyo; la administración ve los de su ciudad.
create policy perfiles_ver on public.perfiles for select to authenticated
  using (id = (select auth.uid()) or (privado.es_admin() and ciudad_id = privado.mi_ciudad()));
create policy perfiles_editar on public.perfiles for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));

-- hogares
create policy hogares_ver on public.hogares for select to authenticated
  using (perfil_id = (select auth.uid()) or (privado.es_staff() and ciudad_id = privado.mi_ciudad()));
create policy hogares_crear on public.hogares for insert to authenticated
  with check (
    ciudad_id = privado.mi_ciudad()
    and (perfil_id = (select auth.uid()) or (perfil_id is null and privado.es_admin()))
  );
create policy hogares_editar on public.hogares for update to authenticated
  using (perfil_id = (select auth.uid()) or (privado.es_admin() and ciudad_id = privado.mi_ciudad()))
  with check (ciudad_id = privado.mi_ciudad() and (perfil_id = (select auth.uid()) or privado.es_admin()));
create policy hogares_borrar on public.hogares for delete to authenticated
  using (privado.es_admin() and ciudad_id = privado.mi_ciudad());

-- direcciones, caseros y preferencias: del hogar al que pertenecen
create policy direcciones_ver on public.direcciones for select to authenticated using (privado.hogar_visible(hogar_id));
create policy direcciones_crear on public.direcciones for insert to authenticated with check (privado.hogar_editable(hogar_id));
create policy direcciones_editar on public.direcciones for update to authenticated
  using (privado.hogar_editable(hogar_id)) with check (privado.hogar_editable(hogar_id));
create policy direcciones_borrar on public.direcciones for delete to authenticated using (privado.hogar_editable(hogar_id));

create policy caseros_ver on public.caseros_hogar for select to authenticated using (privado.hogar_visible(hogar_id));
create policy caseros_crear on public.caseros_hogar for insert to authenticated with check (privado.hogar_editable(hogar_id));
create policy caseros_editar on public.caseros_hogar for update to authenticated
  using (privado.hogar_editable(hogar_id)) with check (privado.hogar_editable(hogar_id));
create policy caseros_borrar on public.caseros_hogar for delete to authenticated using (privado.hogar_editable(hogar_id));

create policy preferencias_ver on public.preferencias_hogar for select to authenticated using (privado.hogar_visible(hogar_id));
create policy preferencias_crear on public.preferencias_hogar for insert to authenticated with check (privado.hogar_editable(hogar_id));
create policy preferencias_editar on public.preferencias_hogar for update to authenticated
  using (privado.hogar_editable(hogar_id)) with check (privado.hogar_editable(hogar_id));
create policy preferencias_borrar on public.preferencias_hogar for delete to authenticated using (privado.hogar_editable(hogar_id));

-- catálogo: lo ven todos los que entraron; solo la administración lo cambia
create policy categorias_ver on public.categorias for select to authenticated using (true);
create policy categorias_admin on public.categorias for all to authenticated
  using (privado.es_admin()) with check (privado.es_admin());
create policy productos_ver on public.productos for select to authenticated using (activo or privado.es_staff());
create policy productos_admin on public.productos for all to authenticated
  using (privado.es_admin()) with check (privado.es_admin());
create policy puestos_ver on public.puestos for select to authenticated using (activo or privado.es_staff());
create policy puestos_admin on public.puestos for all to authenticated
  using (privado.es_admin()) with check (privado.es_admin());

-- pedidos: el cliente crea y ve los suyos; el equipo ve los de su ciudad; la administración los modifica
create policy pedidos_ver on public.pedidos for select to authenticated using (privado.pedido_visible(id));
create policy pedidos_crear on public.pedidos for insert to authenticated
  with check (
    ciudad_id = privado.mi_ciudad()
    and (
      (estado = 'solicitado' and privado.hogar_propio(hogar_id) and creado_por = (select auth.uid()))
      or (privado.es_admin() and privado.hogar_visible(hogar_id))
    )
  );
create policy pedidos_editar on public.pedidos for update to authenticated
  using (privado.es_admin() and ciudad_id = privado.mi_ciudad())
  with check (privado.es_admin() and ciudad_id = privado.mi_ciudad());

create policy items_ver on public.pedido_items for select to authenticated using (privado.pedido_visible(pedido_id));
create policy items_crear on public.pedido_items for insert to authenticated with check (privado.pedido_editable(pedido_id));
create policy items_editar on public.pedido_items for update to authenticated
  using (privado.pedido_editable(pedido_id)) with check (privado.pedido_editable(pedido_id));
create policy items_borrar on public.pedido_items for delete to authenticated using (privado.pedido_editable(pedido_id));

create policy cotizaciones_ver on public.cotizaciones for select to authenticated using (privado.pedido_visible(pedido_id));

create policy notas_ver on public.notas_internas for select to authenticated using (privado.es_staff() and privado.pedido_visible(pedido_id));
create policy notas_crear on public.notas_internas for insert to authenticated
  with check (privado.es_staff() and privado.pedido_visible(pedido_id) and autor_id = (select auth.uid()));

create policy entregas_ver on public.entregas for select to authenticated using (privado.pedido_visible(pedido_id));
create policy entregas_admin on public.entregas for all to authenticated
  using (privado.es_admin() and privado.pedido_visible(pedido_id))
  with check (privado.es_admin() and privado.pedido_visible(pedido_id));
create policy entregas_repartidor on public.entregas for update to authenticated
  using (repartidor_id = (select auth.uid())) with check (repartidor_id = (select auth.uid()));

-- caja: solo administración; sin editar ni borrar
create policy movimientos_ver on public.movimientos for select to authenticated
  using (privado.es_admin() and ciudad_id = privado.mi_ciudad());
create policy movimientos_crear on public.movimientos for insert to authenticated
  with check (privado.es_admin() and ciudad_id = privado.mi_ciudad() and creado_por = (select auth.uid()));

-- Libro de Reclamaciones: cualquiera deja un reclamo; solo la administración lo lee y responde
create policy reclamos_registrar on public.reclamaciones for insert to anon, authenticated
  with check (estado = 'recibido' and respuesta is null and respondido_en is null);
create policy reclamos_ver on public.reclamaciones for select to authenticated
  using (privado.es_admin() and ciudad_id = privado.mi_ciudad());
create policy reclamos_responder on public.reclamaciones for update to authenticated
  using (privado.es_admin() and ciudad_id = privado.mi_ciudad())
  with check (privado.es_admin() and ciudad_id = privado.mi_ciudad());

-- solicitudes de la web: la administración las ve y las marca
create policy solicitudes_ver on public.solicitudes for select to authenticated
  using (privado.es_admin() and ciudad_id = privado.mi_ciudad());
create policy solicitudes_marcar on public.solicitudes for update to authenticated
  using (privado.es_admin() and ciudad_id = privado.mi_ciudad())
  with check (privado.es_admin() and ciudad_id = privado.mi_ciudad());

-- Permisos por tabla y columna ---------------------------------------------------
alter default privileges in schema public revoke all on tables from anon, authenticated;
alter default privileges in schema public revoke execute on functions from public, anon, authenticated;

revoke all on all tables in schema public from anon, authenticated;

grant select on public.ciudades, public.mercados, public.paquetes to anon, authenticated;
grant insert (ciudad_id, nombre, celular, modalidad, recepcion, paquete_id, mensaje)
  on public.solicitudes to anon, authenticated;
grant select on public.solicitudes to authenticated;
grant update (estado) on public.solicitudes to authenticated;

grant select on public.perfiles to authenticated;
grant update (nombre, celular) on public.perfiles to authenticated;

grant select, insert, update, delete on
  public.hogares, public.direcciones, public.caseros_hogar, public.preferencias_hogar, public.pedido_items
  to authenticated;
grant select, insert, update on public.pedidos to authenticated;
grant select on public.cotizaciones to authenticated;
grant select, insert on public.notas_internas to authenticated;
grant select, insert on public.entregas to authenticated;
grant update (repartidor_id, ventana, estado, entregada_en, nota) on public.entregas to authenticated;
grant select, insert on public.movimientos to authenticated;
grant select on public.resumen_caja to authenticated;

grant select, insert, update, delete on public.categorias, public.productos, public.puestos to authenticated;

grant insert (ciudad_id, tipo, consumidor_nombre, documento_tipo, documento_numero, celular, correo, domicilio,
              bien_tipo, monto_reclamado, descripcion_bien, detalle, pedido_consumidor)
  on public.reclamaciones to anon, authenticated;
grant select on public.reclamaciones to authenticated;
grant update (estado, respuesta, respondido_en) on public.reclamaciones to authenticated;

revoke all on all functions in schema privado from public;
grant execute on all functions in schema privado to authenticated;

-- Acciones que validan quién llama y en qué estado está el pedido -----------------
create function public.enviar_cotizacion(
  p_pedido uuid, p_servicio numeric, p_delivery numeric, p_tolerancia numeric default 10
) returns uuid
language plpgsql security definer set search_path = ''
as $$
declare
  v_estado public.estado_pedido;
  v_total numeric(12, 2);
  v_version integer;
  v_id uuid;
begin
  if not privado.es_admin() then
    raise exception 'Solo la administración puede enviar cotizaciones' using errcode = '42501';
  end if;
  select estado into v_estado from public.pedidos where id = p_pedido and ciudad_id = privado.mi_ciudad() for update;
  if not found then raise exception 'No encontramos el pedido'; end if;
  if v_estado not in ('solicitado', 'cotizado') then
    raise exception 'El pedido ya no admite una nueva cotización';
  end if;
  if not exists (select 1 from public.pedido_items where pedido_id = p_pedido) then
    raise exception 'El pedido no tiene productos';
  end if;
  if exists (select 1 from public.pedido_items where pedido_id = p_pedido and precio_unit_estimado is null) then
    raise exception 'Faltan precios estimados en algunos productos';
  end if;
  if coalesce(p_servicio, 0) < 0 or coalesce(p_delivery, 0) < 0 then
    raise exception 'Las tarifas no pueden ser negativas';
  end if;

  select coalesce(sum(round(cantidad * precio_unit_estimado, 2)), 0) into v_total
  from public.pedido_items where pedido_id = p_pedido;
  select coalesce(max(version), 0) + 1 into v_version from public.cotizaciones where pedido_id = p_pedido;

  update public.cotizaciones set estado = 'reemplazada' where pedido_id = p_pedido and estado = 'enviada';
  insert into public.cotizaciones
    (pedido_id, version, total_productos_estimado, tarifa_servicio, tarifa_delivery, tolerancia_pct, creado_por)
  values
    (p_pedido, v_version, v_total, coalesce(p_servicio, 0), coalesce(p_delivery, 0), coalesce(p_tolerancia, 10), (select auth.uid()))
  returning id into v_id;
  update public.pedidos set estado = 'cotizado' where id = p_pedido;
  return v_id;
end
$$;

create function public.aprobar_cotizacion(p_pedido uuid) returns void
language plpgsql security definer set search_path = ''
as $$
declare v_cot uuid;
begin
  if not (
    privado.pedido_propio(p_pedido)
    or (privado.es_admin() and exists (select 1 from public.pedidos where id = p_pedido and ciudad_id = privado.mi_ciudad()))
  ) then
    raise exception 'No puedes aprobar este pedido' using errcode = '42501';
  end if;
  select id into v_cot from public.cotizaciones
    where pedido_id = p_pedido and estado = 'enviada' order by version desc limit 1 for update;
  if v_cot is null then raise exception 'No hay una cotización pendiente de aprobar'; end if;
  update public.cotizaciones set estado = 'aprobada', aprobada_en = now() where id = v_cot;
  update public.pedidos set estado = 'aprobado' where id = p_pedido and estado = 'cotizado';
end
$$;

create function public.cancelar_pedido(p_pedido uuid) returns void
language plpgsql security definer set search_path = ''
as $$
declare v_estado public.estado_pedido;
begin
  select estado into v_estado from public.pedidos where id = p_pedido for update;
  if not found then raise exception 'No encontramos el pedido'; end if;
  if privado.pedido_propio(p_pedido) then
    if v_estado not in ('solicitado', 'cotizado') then
      raise exception 'Este pedido ya no se puede cancelar desde la app; escríbenos por WhatsApp';
    end if;
  elsif privado.es_admin() and exists (select 1 from public.pedidos where id = p_pedido and ciudad_id = privado.mi_ciudad()) then
    if v_estado in ('entregado', 'cerrado', 'cancelado') then
      raise exception 'Este pedido ya está cerrado';
    end if;
  else
    raise exception 'No puedes cancelar este pedido' using errcode = '42501';
  end if;
  update public.cotizaciones set estado = 'rechazada' where pedido_id = p_pedido and estado = 'enviada';
  update public.pedidos set estado = 'cancelado' where id = p_pedido;
end
$$;

create function public.registrar_compra_item(
  p_item uuid, p_cantidad_real numeric, p_precio_real_total numeric,
  p_estado public.estado_item, p_nota text default ''
) returns void
language plpgsql security definer set search_path = ''
as $$
declare v_pedido uuid; v_estado public.estado_pedido;
begin
  if not privado.es_compras() then
    raise exception 'Solo compras o administración pueden registrar compras' using errcode = '42501';
  end if;
  select i.pedido_id, p.estado into v_pedido, v_estado
  from public.pedido_items i join public.pedidos p on p.id = i.pedido_id
  where i.id = p_item and p.ciudad_id = privado.mi_ciudad()
  for update of i;
  if v_pedido is null then raise exception 'No encontramos el producto'; end if;
  if v_estado not in ('aprobado', 'en_compra') then raise exception 'El pedido no está listo para comprar'; end if;
  if p_estado in ('comprado', 'sustituido') and (p_cantidad_real is null or p_precio_real_total is null) then
    raise exception 'Falta la cantidad y el precio real';
  end if;
  update public.pedido_items
    set estado_item = p_estado, cantidad_real = p_cantidad_real, precio_real_total = p_precio_real_total,
        nota_compra = left(coalesce(p_nota, ''), 300)
    where id = p_item;
  if v_estado = 'aprobado' then update public.pedidos set estado = 'en_compra' where id = v_pedido; end if;
end
$$;

create function public.cambiar_estado_pedido(p_pedido uuid, p_estado public.estado_pedido) returns void
language plpgsql security definer set search_path = ''
as $$
declare v_actual public.estado_pedido;
begin
  if not privado.es_admin() then
    raise exception 'Solo la administración puede cambiar el estado' using errcode = '42501';
  end if;
  select estado into v_actual from public.pedidos where id = p_pedido and ciudad_id = privado.mi_ciudad() for update;
  if not found then raise exception 'No encontramos el pedido'; end if;
  if (v_actual::text || '>' || p_estado::text) <> all (array[
    'aprobado>en_compra', 'en_compra>liquidado', 'liquidado>en_entrega', 'liquidado>entregado',
    'en_entrega>entregado', 'entregado>cerrado',
    'solicitado>cancelado', 'cotizado>cancelado', 'aprobado>cancelado', 'en_compra>cancelado'
  ]) then
    raise exception 'Ese cambio de estado no está permitido';
  end if;
  update public.pedidos set estado = p_estado where id = p_pedido;
end
$$;

create function public.cambiar_rol(p_perfil uuid, p_rol public.rol_usuario) returns void
language plpgsql security definer set search_path = ''
as $$
begin
  if not privado.es_admin() then
    raise exception 'Solo la administración puede cambiar roles' using errcode = '42501';
  end if;
  if p_perfil = (select auth.uid()) and p_rol <> 'administrador' then
    raise exception 'No puedes quitarte a ti misma el rol de administración';
  end if;
  update public.perfiles set rol = p_rol where id = p_perfil and ciudad_id = privado.mi_ciudad();
  if not found then raise exception 'No encontramos a esa persona'; end if;
end
$$;

revoke execute on function
  public.enviar_cotizacion(uuid, numeric, numeric, numeric),
  public.aprobar_cotizacion(uuid),
  public.cancelar_pedido(uuid),
  public.registrar_compra_item(uuid, numeric, numeric, public.estado_item, text),
  public.cambiar_estado_pedido(uuid, public.estado_pedido),
  public.cambiar_rol(uuid, public.rol_usuario)
  from public, anon;
grant execute on function
  public.enviar_cotizacion(uuid, numeric, numeric, numeric),
  public.aprobar_cotizacion(uuid),
  public.cancelar_pedido(uuid),
  public.registrar_compra_item(uuid, numeric, numeric, public.estado_item, text),
  public.cambiar_estado_pedido(uuid, public.estado_pedido),
  public.cambiar_rol(uuid, public.rol_usuario)
  to authenticated;

-- Catálogo inicial: categorías reales del mercado y productos de uso diario (sin precios) ----
insert into public.categorias (nombre, orden) values
  ('Frutas', 1), ('Verduras', 2), ('Tubérculos', 3), ('Carnes', 4),
  ('Pollo', 5), ('Huevos', 6), ('Abarrotes', 7), ('Hierbas', 8);

insert into public.productos (categoria_id, nombre, unidad_defecto)
select c.id, p.nombre, p.unidad
from (values
  ('Frutas', 'Palta', 'kg'), ('Frutas', 'Plátano', 'kg'), ('Frutas', 'Manzana', 'kg'), ('Frutas', 'Naranja', 'kg'),
  ('Frutas', 'Limón', 'kg'), ('Frutas', 'Mandarina', 'kg'), ('Frutas', 'Uva', 'kg'), ('Frutas', 'Papaya', 'kg'),
  ('Verduras', 'Tomate', 'kg'), ('Verduras', 'Cebolla', 'kg'), ('Verduras', 'Zanahoria', 'kg'),
  ('Verduras', 'Lechuga', 'unidad'), ('Verduras', 'Zapallo', 'kg'), ('Verduras', 'Choclo', 'unidad'),
  ('Verduras', 'Ajo', 'kg'), ('Verduras', 'Pimiento', 'kg'),
  ('Tubérculos', 'Papa', 'kg'), ('Tubérculos', 'Camote', 'kg'), ('Tubérculos', 'Yuca', 'kg'),
  ('Carnes', 'Carne de res', 'kg'), ('Carnes', 'Carne de cerdo', 'kg'),
  ('Pollo', 'Pollo entero', 'unidad'), ('Pollo', 'Pechuga de pollo', 'kg'), ('Pollo', 'Pierna de pollo', 'kg'),
  ('Huevos', 'Huevos', 'docena'),
  ('Abarrotes', 'Arroz', 'kg'), ('Abarrotes', 'Azúcar', 'kg'), ('Abarrotes', 'Aceite', 'litro'),
  ('Abarrotes', 'Fideos', 'kg'), ('Abarrotes', 'Lentejas', 'kg'),
  ('Hierbas', 'Culantro', 'atado'), ('Hierbas', 'Perejil', 'atado'), ('Hierbas', 'Hierbabuena', 'atado'),
  ('Hierbas', 'Huacatay', 'atado')
) as p (categoria, nombre, unidad)
join public.categorias c on c.nombre = p.categoria;
