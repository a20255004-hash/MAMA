-- Arreglo: la política de lectura de `pedidos` consultaba la misma tabla mediante una función,
-- y en un INSERT ... RETURNING esa consulta no ve la fila recién creada. Ahora se decide solo con
-- las columnas de la propia fila.

drop policy pedidos_ver on public.pedidos;
create policy pedidos_ver on public.pedidos for select to authenticated
  using (
    privado.hogar_propio(hogar_id)
    or (privado.es_staff() and ciudad_id = privado.mi_ciudad())
  );
