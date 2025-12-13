-- Insertar categorías de adornos navideños
INSERT INTO public.categories (name, description, image_url) VALUES
  ('Árboles de Navidad', 'Árboles artificiales y naturales de todos los tamaños', '/placeholder.svg?height=300&width=300'),
  ('Luces Navideñas', 'Luces LED y tradicionales para interior y exterior', '/placeholder.svg?height=300&width=300'),
  ('Bolas y Ornamentos', 'Decoraciones colgantes para el árbol', '/placeholder.svg?height=300&width=300'),
  ('Coronas', 'Coronas decorativas para puertas y paredes', '/placeholder.svg?height=300&width=300'),
  ('Belenes y Figuras', 'Nacimientos y figuras navideñas', '/placeholder.svg?height=300&width=300'),
  ('Decoración de Mesa', 'Manteles, centros de mesa y vajilla navideña', '/placeholder.svg?height=300&width=300');

-- Insertar productos de ejemplo
INSERT INTO public.products (name, description, price, stock, category_id, image_url, featured) 
SELECT 
  'Árbol de Navidad Premium 2.1m',
  'Árbol artificial de alta calidad con ramas densas y aspecto natural. Incluye base metálica resistente.',
  2499.00,
  15,
  c.id,
  '/placeholder.svg?height=400&width=400',
  true
FROM public.categories c WHERE c.name = 'Árboles de Navidad';

INSERT INTO public.products (name, description, price, stock, category_id, image_url, featured)
SELECT 
  'Luces LED Multicolor 200 Focos',
  'Serie de 200 luces LED de bajo consumo con 8 modos de iluminación. Cable verde de 20m.',
  449.00,
  50,
  c.id,
  '/placeholder.svg?height=400&width=400',
  true
FROM public.categories c WHERE c.name = 'Luces Navideñas';

INSERT INTO public.products (name, description, price, stock, category_id, image_url, featured)
SELECT 
  'Set 24 Bolas Navideñas Rojas y Doradas',
  'Conjunto de 24 bolas decorativas en tonos rojo y dorado. Material inastillable, ideal para hogares con niños.',
  299.00,
  80,
  c.id,
  '/placeholder.svg?height=400&width=400',
  true
FROM public.categories c WHERE c.name = 'Bolas y Ornamentos';

INSERT INTO public.products (name, description, price, stock, category_id, image_url)
SELECT 
  'Corona Navideña Natural 45cm',
  'Corona hecha a mano con ramas naturales, piñas y bayas rojas. Decoración elegante para puertas.',
  599.00,
  25,
  c.id,
  '/placeholder.svg?height=400&width=400'
FROM public.categories c WHERE c.name = 'Coronas';

INSERT INTO public.products (name, description, price, stock, category_id, image_url)
SELECT 
  'Nacimiento 12 Piezas Resina',
  'Belén completo con 12 figuras detalladas en resina pintada a mano. Altura aprox. 15cm.',
  1299.00,
  20,
  c.id,
  '/placeholder.svg?height=400&width=400'
FROM public.categories c WHERE c.name = 'Belenes y Figuras';

INSERT INTO public.products (name, description, price, stock, category_id, image_url)
SELECT 
  'Centro de Mesa Navideño con Velas',
  'Elegante centro de mesa con velas LED, ramas de pino y decoración navideña. 40cm de largo.',
  449.00,
  30,
  c.id,
  '/placeholder.svg?height=400&width=400'
FROM public.categories c WHERE c.name = 'Decoración de Mesa';

INSERT INTO public.products (name, description, price, stock, category_id, image_url)
SELECT 
  'Árbol de Navidad Compacto 1.2m',
  'Perfecto para espacios pequeños. Fácil de montar y guardar.',
  899.00,
  40,
  c.id,
  '/placeholder.svg?height=400&width=400'
FROM public.categories c WHERE c.name = 'Árboles de Navidad';

INSERT INTO public.products (name, description, price, stock, category_id, image_url)
SELECT 
  'Luces Blancas Cálidas 100 Focos',
  'Elegantes luces LED blanco cálido para decoración minimalista. Cable transparente 10m.',
  349.00,
  60,
  c.id,
  '/placeholder.svg?height=400&width=400'
FROM public.categories c WHERE c.name = 'Luces Navideñas';

INSERT INTO public.products (name, description, price, stock, category_id, image_url)
SELECT 
  'Set 50 Ornamentos Variados',
  'Colección variada de ornamentos en diferentes formas y colores. Material plástico resistente.',
  499.00,
  45,
  c.id,
  '/placeholder.svg?height=400&width=400'
FROM public.categories c WHERE c.name = 'Bolas y Ornamentos';

INSERT INTO public.products (name, description, price, stock, category_id, image_url)
SELECT 
  'Corona LED con Pilas 60cm',
  'Corona pre-iluminada con luces LED. Funciona con pilas AA (no incluidas). Uso interior/exterior.',
  799.00,
  18,
  c.id,
  '/placeholder.svg?height=400&width=400'
FROM public.categories c WHERE c.name = 'Coronas';

INSERT INTO public.products (name, description, price, stock, category_id, image_url)
SELECT 
  'Estrella de Belén Iluminada',
  'Estrella decorativa con luz LED para colocar en el nacimiento. 25cm de altura.',
  249.00,
  35,
  c.id,
  '/placeholder.svg?height=400&width=400'
FROM public.categories c WHERE c.name = 'Belenes y Figuras';

INSERT INTO public.products (name, description, price, stock, category_id, image_url)
SELECT 
  'Mantel Navideño Rectangular 150x220cm',
  'Mantel festivo con diseños navideños. Tela lavable y resistente. Color rojo y dorado.',
  399.00,
  25,
  c.id,
  '/placeholder.svg?height=400&width=400'
FROM public.categories c WHERE c.name = 'Decoración de Mesa';
