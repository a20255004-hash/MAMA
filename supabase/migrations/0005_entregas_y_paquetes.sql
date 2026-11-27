-- Entregas: la persona asignada (o la administración) marca el avance y el pedido se actualiza solo.
-- Paquetes: la administración los crea, edita y publica; la web solo muestra los publicados.

create function public.marcar_entrega(p_pedido uuid, p_estado public.estado_entrega, p_nota text default '')
returns void
language plpgsql security definer set search_path = ''
as $$
declare
  v_pedido public.pedidos;
  v_entrega public.entregas;
begin
  if p_estado not in ('en_camino', 'entregada', 'fallida') then
    raise exception 'Estado de entrega no válido';
  end if;
  select * into v_pedido from public.pedidos where id = p_pedido and ciudad_id = privado.mi_ciudad() for update;
  if not found then raise exception 'No encontramos el pedido'; end if;
  select * into v_entrega from public.entregas where pedido_id = p_pedido for update;
  if not found then raise exception 'Este pedido aún no tiene una entrega programada'; end if;
  if not (privado.es_admin() or v_entrega.repartidor_id = (select auth.uid())) then
    raise exception 'No puedes actualizar esta entrega' using errcode = '42501';
  end if;
  if v_pedido.estado not in ('liquidado', 'en_entrega') then
    raise exception 'El pedido aún no está listo para entregarse';
  end if;

  update public.entregas
    set estado = p_estado,
        nota = left(coalesce(p_nota, ''), 300),
        entregada_en = case when p_estado = 'entregada' then now() else null end
    where id = v_entrega.id;

  if p_estado = 'en_camino' then
    update public.pedidos set estado = 'en_entrega' where id = p_pedido;
  elsif p_estado = 'entregada' then
    update public.pedidos set estado = 'entregado' where id = p_pedido;
  end if;
end
$$;

revoke execute on function public.marcar_entrega(uuid, public.estado_entrega, text) from public, anon;
grant execute on function public.marcar_entrega(uuid, public.estado_entrega, text) to authenticated;

-- Paquetes -------------------------------------------------------------------------
drop policy "paquetes publicados visibles" on public.paquetes;
create policy paquetes_publicos on public.paquetes for select to anon using (publicado);
create policy paquetes_ver on public.paquetes for select to authenticated
  using (publicado or (privado.es_admin() and ciudad_id = privado.mi_ciudad()));
create policy paquetes_crear on public.paquetes for insert to authenticated
  with check (privado.es_admin() and ciudad_id = privado.mi_ciudad());
create policy paquetes_editar on public.paquetes for update to authenticated
  using (privado.es_admin() and ciudad_id = privado.mi_ciudad())
  with check (privado.es_admin() and ciudad_id = privado.mi_ciudad());
create policy paquetes_borrar on public.paquetes for delete to authenticated
  using (privado.es_admin() and ciudad_id = privado.mi_ciudad());

grant insert, update, delete on public.paquetes to authenticated;
