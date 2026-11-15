-- Paquetes de propuesta. Entran como BORRADOR (publicado = false): no aparecen
-- en la web hasta que la dueña confirme nombres y contenido.
insert into public.paquetes (ciudad_id, slug, nombre, para_quien, descripcion, contenido, orden)
select c.id, p.slug, p.nombre, p.para_quien, p.descripcion, p.contenido, p.orden
from public.ciudades c,
(values
  ('canasta-semana', 'Canasta de la semana', 'Para la casa de todos los días',
   'Lo básico para cocinar toda la semana. Tú ajustas cantidades y quitas o agregas lo que quieras.',
   array['Verduras', 'Frutas de estación', 'Tubérculos', 'Pollo', 'Huevos'], 1),
  ('verde-fresco', 'Frutas y verduras', 'Para reponer lo fresco',
   'Solo lo que se acaba primero, elegido pieza por pieza.',
   array['Verduras de hoja', 'Verduras para guiso', 'Frutas de estación'], 2),
  ('almuerzo-domingo', 'Almuerzo del domingo', 'Para cuando la familia se junta',
   'Nos dices qué vas a preparar y para cuántos; compramos todo lo que lleva.',
   array['Carne o pollo', 'Verduras', 'Papas o camote', 'Ají y hierbas'], 3)
) as p(slug, nombre, para_quien, descripcion, contenido, orden)
where c.slug = 'tacna'
on conflict (ciudad_id, slug) do nothing;
