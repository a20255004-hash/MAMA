-- Ajustes de rendimiento tras revisar los avisos de Supabase:
--  * índice para la llave foránea pedidos.creado_por
--  * las políticas de administración "for all" se separan para que no se dupliquen en select/update.

create index pedidos_creado_por_idx on public.pedidos (creado_por);

drop policy categorias_admin on public.categorias;
create policy categorias_crear on public.categorias for insert to authenticated with check (privado.es_admin());
create policy categorias_editar on public.categorias for update to authenticated
  using (privado.es_admin()) with check (privado.es_admin());
create policy categorias_borrar on public.categorias for delete to authenticated using (privado.es_admin());

drop policy productos_admin on public.productos;
create policy productos_crear on public.productos for insert to authenticated with check (privado.es_admin());
create policy productos_editar on public.productos for update to authenticated
  using (privado.es_admin()) with check (privado.es_admin());
create policy productos_borrar on public.productos for delete to authenticated using (privado.es_admin());

drop policy puestos_admin on public.puestos;
create policy puestos_crear on public.puestos for insert to authenticated with check (privado.es_admin());
create policy puestos_editar on public.puestos for update to authenticated
  using (privado.es_admin()) with check (privado.es_admin());
create policy puestos_borrar on public.puestos for delete to authenticated using (privado.es_admin());

-- entregas: administración y repartidor se unen en una sola política por acción.
drop policy entregas_admin on public.entregas;
drop policy entregas_repartidor on public.entregas;
create policy entregas_crear on public.entregas for insert to authenticated
  with check (privado.es_admin() and privado.pedido_visible(pedido_id));
create policy entregas_editar on public.entregas for update to authenticated
  using ((privado.es_admin() and privado.pedido_visible(pedido_id)) or repartidor_id = (select auth.uid()))
  with check ((privado.es_admin() and privado.pedido_visible(pedido_id)) or repartidor_id = (select auth.uid()));
create policy entregas_borrar on public.entregas for delete to authenticated
  using (privado.es_admin() and privado.pedido_visible(pedido_id));
