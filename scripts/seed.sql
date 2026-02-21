-- ============================================================
-- MY BAKERY — Production Seed Script
-- ============================================================
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New query)
-- This script is idempotent: it cleans test data first, then inserts.
-- ============================================================

BEGIN;

-- ============================================================
-- 1. CLEAN TEST DATA
-- ============================================================

-- Delete dependent records first (FK constraints)
DELETE FROM daily_inventory_report_items WHERE product_id IN (
  SELECT id FROM products WHERE slug IN ('bbbbbb', 'fsfsafsaf')
);
DELETE FROM recurring_order_items WHERE product_id IN (
  SELECT id FROM products WHERE slug IN ('bbbbbb', 'fsfsafsaf')
);
DELETE FROM production_schedule WHERE product_id IN (
  SELECT id FROM products WHERE slug IN ('bbbbbb', 'fsfsafsaf')
);
DELETE FROM inventory_movements WHERE product_id IN (
  SELECT id FROM products WHERE slug IN ('bbbbbb', 'fsfsafsaf')
);
DELETE FROM inventory WHERE product_id IN (
  SELECT id FROM products WHERE slug IN ('bbbbbb', 'fsfsafsaf')
);
DELETE FROM ingredient_translations WHERE ingredient_id IN (
  SELECT i.id FROM ingredients i JOIN products p ON i.product_id = p.id WHERE p.slug IN ('bbbbbb', 'fsfsafsaf')
);
DELETE FROM ingredients WHERE product_id IN (
  SELECT id FROM products WHERE slug IN ('bbbbbb', 'fsfsafsaf')
);
DELETE FROM preparation_step_translations WHERE step_id IN (
  SELECT ps.id FROM preparation_steps ps JOIN products p ON ps.product_id = p.id WHERE p.slug IN ('bbbbbb', 'fsfsafsaf')
);
DELETE FROM preparation_steps WHERE product_id IN (
  SELECT id FROM products WHERE slug IN ('bbbbbb', 'fsfsafsaf')
);
DELETE FROM product_translations WHERE product_id IN (
  SELECT id FROM products WHERE slug IN ('bbbbbb', 'fsfsafsaf')
);
DELETE FROM product_images WHERE product_id IN (
  SELECT id FROM products WHERE slug IN ('bbbbbb', 'fsfsafsaf')
);
DELETE FROM review_images WHERE review_id IN (
  SELECT r.id FROM reviews r WHERE r.product_id IN (
    SELECT id FROM products WHERE slug IN ('bbbbbb', 'fsfsafsaf')
  )
);
DELETE FROM reviews WHERE product_id IN (
  SELECT id FROM products WHERE slug IN ('bbbbbb', 'fsfsafsaf')
);
DELETE FROM order_items WHERE product_id IN (
  SELECT id FROM products WHERE slug IN ('bbbbbb', 'fsfsafsaf')
);
DELETE FROM products WHERE slug IN ('bbbbbb', 'fsfsafsaf');

-- Delete test category
DELETE FROM category_translations WHERE category_id IN (
  SELECT id FROM categories WHERE slug = 'bbbbbbb'
);
DELETE FROM categories WHERE slug = 'bbbbbbb';

-- ============================================================
-- 2. CLEAN TEST VALUES IN CMS TRANSLATIONS
-- ============================================================

-- Hero ES: remove test cta_text "AAAAA"
UPDATE cms_content_translations
SET cta_text = NULL
WHERE content_id = (SELECT id FROM cms_content WHERE section = 'hero')
  AND language_code = 'es'
  AND cta_text = 'AAAAA';

-- Products_intro ES: remove test subtitle and cta_text
UPDATE cms_content_translations
SET subtitle = NULL, cta_text = NULL
WHERE content_id = (SELECT id FROM cms_content WHERE section = 'products_intro')
  AND language_code = 'es';

-- ============================================================
-- 3. UPDATE SOCIAL LINKS
-- ============================================================

-- Sync icon = platform for all existing links
UPDATE social_links SET icon = platform;

UPDATE social_links SET url = 'https://facebook.com/mybakery' WHERE platform = 'facebook';
UPDATE social_links SET url = 'https://instagram.com/mybakery' WHERE platform = 'instagram';
UPDATE social_links SET url = 'https://twitter.com/mybakery' WHERE platform = 'twitter';
UPDATE social_links SET url = 'https://youtube.com/@mybakery' WHERE platform = 'youtube';

-- Add missing social platforms
INSERT INTO social_links (platform, url, icon, sort_order, is_visible) VALUES
  ('tiktok',    'https://tiktok.com/@mybakery', 'tiktok',    5, true),
  ('whatsapp',  'https://wa.me/34933543810',    'whatsapp',  6, true),
  ('linkedin',  'https://linkedin.com/company/mybakery', 'linkedin', 7, false),
  ('telegram',  'https://t.me/mybakery',        'telegram',  8, false)
ON CONFLICT DO NOTHING;

-- ============================================================
-- 4. INSERT CATEGORIES
-- ============================================================

INSERT INTO categories (id, slug, sort_order, is_visible) VALUES
  ('a1000000-0000-0000-0000-000000000001', 'panes',      1, true),
  ('a1000000-0000-0000-0000-000000000002', 'bolleria',    2, true),
  ('a1000000-0000-0000-0000-000000000003', 'pasteles',    3, true),
  ('a1000000-0000-0000-0000-000000000004', 'galletas',    4, true),
  ('a1000000-0000-0000-0000-000000000005', 'especiales',  5, true)
ON CONFLICT (id) DO NOTHING;

-- Category translations
INSERT INTO category_translations (category_id, language_code, name, description) VALUES
  -- Panes
  ('a1000000-0000-0000-0000-000000000001', 'es', 'Panes', 'Panes artesanales horneados a diario con masa madre y harinas seleccionadas'),
  ('a1000000-0000-0000-0000-000000000001', 'en', 'Breads', 'Artisanal breads baked daily with sourdough and selected flours'),
  ('a1000000-0000-0000-0000-000000000001', 'ca', 'Pans', 'Pans artesanals enfornats diàriament amb massa mare i farines seleccionades'),
  -- Bollería
  ('a1000000-0000-0000-0000-000000000002', 'es', 'Bollería', 'Croissants, ensaimadas y bollería fina elaborada con mantequilla francesa'),
  ('a1000000-0000-0000-0000-000000000002', 'en', 'Pastries', 'Croissants, ensaimadas and fine pastries made with French butter'),
  ('a1000000-0000-0000-0000-000000000002', 'ca', 'Brioxeria', 'Croissants, ensaïmades i brioxeria fina elaborada amb mantega francesa'),
  -- Pasteles
  ('a1000000-0000-0000-0000-000000000003', 'es', 'Pasteles', 'Tartas y pasteles para celebrar los momentos más dulces de la vida'),
  ('a1000000-0000-0000-0000-000000000003', 'en', 'Cakes', 'Cakes and tarts to celebrate life''s sweetest moments'),
  ('a1000000-0000-0000-0000-000000000003', 'ca', 'Pastissos', 'Pastissos i tartes per celebrar els moments més dolços de la vida'),
  -- Galletas
  ('a1000000-0000-0000-0000-000000000004', 'es', 'Galletas', 'Galletas artesanales crujientes y tiernas, perfectas para cualquier momento'),
  ('a1000000-0000-0000-0000-000000000004', 'en', 'Cookies', 'Artisanal cookies, crispy and tender, perfect for any occasion'),
  ('a1000000-0000-0000-0000-000000000004', 'ca', 'Galetes', 'Galetes artesanals cruixents i tendres, perfectes per a qualsevol moment'),
  -- Especiales
  ('a1000000-0000-0000-0000-000000000005', 'es', 'Especiales', 'Creaciones de temporada y ediciones limitadas para paladares curiosos'),
  ('a1000000-0000-0000-0000-000000000005', 'en', 'Specials', 'Seasonal creations and limited editions for curious palates'),
  ('a1000000-0000-0000-0000-000000000005', 'ca', 'Especials', 'Creacions de temporada i edicions limitades per a paladars curiosos')
ON CONFLICT (category_id, language_code) DO NOTHING;

-- ============================================================
-- 5. INSERT PRODUCTS
-- ============================================================

INSERT INTO products (id, slug, category_id, price, is_visible, is_featured, display_on_landing, sort_order, preparation_time_minutes, weight_grams, season_tags) VALUES
  -- Panes
  ('b1000000-0000-0000-0000-000000000001', 'pan-de-pueblo',       'a1000000-0000-0000-0000-000000000001', 3.50,  true, true,  true, 1, 240, 750,  '{todo_el_ano}'),
  ('b1000000-0000-0000-0000-000000000002', 'pan-de-cristal',      'a1000000-0000-0000-0000-000000000001', 2.80,  true, false, true, 2, 180, 350,  '{todo_el_ano}'),
  ('b1000000-0000-0000-0000-000000000003', 'hogaza-masa-madre',   'a1000000-0000-0000-0000-000000000001', 4.90,  true, true,  true, 3, 360, 900,  '{todo_el_ano}'),
  -- Bollería
  ('b1000000-0000-0000-0000-000000000004', 'croissant-artesanal', 'a1000000-0000-0000-0000-000000000002', 2.20,  true, true,  true, 4, 120, 80,   '{todo_el_ano}'),
  ('b1000000-0000-0000-0000-000000000005', 'ensaimada',           'a1000000-0000-0000-0000-000000000002', 3.00,  true, false, true, 5, 180, 120,  '{todo_el_ano}'),
  ('b1000000-0000-0000-0000-000000000006', 'napolitana-chocolate','a1000000-0000-0000-0000-000000000002', 2.50,  true, false, false, 6, 90, 100,  '{todo_el_ano}'),
  -- Pasteles
  ('b1000000-0000-0000-0000-000000000007', 'tarta-chocolate',     'a1000000-0000-0000-0000-000000000003', 22.00, true, true,  true, 7, 180, 1200, '{todo_el_ano}'),
  ('b1000000-0000-0000-0000-000000000008', 'tarta-manzana',       'a1000000-0000-0000-0000-000000000003', 18.50, true, false, false, 8, 150, 1000, '{todo_el_ano}'),
  ('b1000000-0000-0000-0000-000000000009', 'tarta-zanahoria',     'a1000000-0000-0000-0000-000000000003', 20.00, true, false, true, 9, 160, 1100, '{todo_el_ano}'),
  -- Galletas
  ('b1000000-0000-0000-0000-000000000010', 'cookies-chocolate',   'a1000000-0000-0000-0000-000000000004', 1.80,  true, false, false, 10, 30, 60,  '{todo_el_ano}'),
  ('b1000000-0000-0000-0000-000000000011', 'galletas-mantequilla','a1000000-0000-0000-0000-000000000004', 6.50,  true, false, true, 11, 45, 250,  '{todo_el_ano}'),
  -- Especiales
  ('b1000000-0000-0000-0000-000000000012', 'roscon-reyes',        'a1000000-0000-0000-0000-000000000005', 15.00, true, true,  false, 12, 300, 800, '{navidad}'),
  ('b1000000-0000-0000-0000-000000000013', 'coca-sant-joan',      'a1000000-0000-0000-0000-000000000005', 12.00, true, false, false, 13, 180, 600, '{san_juan}'),
  ('b1000000-0000-0000-0000-000000000014', 'panettone-artesanal', 'a1000000-0000-0000-0000-000000000005', 16.50, true, false, false, 14, 360, 750, '{navidad}')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 5b. PRODUCT TRANSLATIONS
-- ============================================================

INSERT INTO product_translations (product_id, language_code, name, short_description, description) VALUES
  -- Pan de pueblo
  ('b1000000-0000-0000-0000-000000000001', 'es', 'Pan de Pueblo', 'Pan rústico con corteza crujiente y miga esponjosa', 'Nuestro pan de pueblo es el alma de la panadería. Elaborado con harina de trigo de fuerza, agua, sal y masa madre natural, fermentado lentamente durante 24 horas para conseguir un sabor profundo y una textura incomparable. La corteza crujiente y dorada envuelve una miga tierna y alveolada.'),
  ('b1000000-0000-0000-0000-000000000001', 'en', 'Country Bread', 'Rustic bread with crispy crust and spongy crumb', 'Our country bread is the soul of the bakery. Made with strong wheat flour, water, salt and natural sourdough, slowly fermented for 24 hours to achieve a deep flavor and incomparable texture. The crispy golden crust wraps a tender, open crumb.'),
  ('b1000000-0000-0000-0000-000000000001', 'ca', 'Pa de Pagès', 'Pa rústic amb crosta cruixent i molla esponjosa', 'El nostre pa de pagès és l''ànima de la fleca. Elaborat amb farina de blat de força, aigua, sal i massa mare natural, fermentat lentament durant 24 hores per aconseguir un sabor profund i una textura incomparable. La crosta cruixent i daurada embolcalla una molla tendra i alveolada.'),

  -- Pan de cristal
  ('b1000000-0000-0000-0000-000000000002', 'es', 'Pan de Cristal', 'Pan mediterráneo ligero con grandes alveolos', 'El pan de cristal es una joya de la panadería catalana. Con una corteza fina y delicada como el cristal y un interior lleno de grandes alveolos, es perfecto para acompañar con aceite de oliva y tomate. Su textura aérea y crujiente lo hace irresistible.'),
  ('b1000000-0000-0000-0000-000000000002', 'en', 'Crystal Bread', 'Light Mediterranean bread with large air pockets', 'Crystal bread is a gem of Catalan baking. With a thin, delicate crust like crystal and an interior full of large air pockets, it''s perfect paired with olive oil and tomato. Its airy, crispy texture makes it irresistible.'),
  ('b1000000-0000-0000-0000-000000000002', 'ca', 'Pa de Vidre', 'Pa mediterrani lleuger amb grans alvèols', 'El pa de vidre és una joia de la fleca catalana. Amb una crosta fina i delicada com el vidre i un interior ple de grans alvèols, és perfecte per acompanyar amb oli d''oliva i tomàquet. La seva textura aèria i cruixent el fa irresistible.'),

  -- Hogaza de masa madre
  ('b1000000-0000-0000-0000-000000000003', 'es', 'Hogaza de Masa Madre', 'Pan artesanal con fermentación de 48 horas', 'Nuestra hogaza de masa madre es el resultado de 48 horas de fermentación lenta. Utilizamos una masa madre centenaria alimentada diariamente, que aporta notas ácidas sutiles y una complejidad de sabor única. Cada hogaza es única, con una corteza gruesa y caramelizada.'),
  ('b1000000-0000-0000-0000-000000000003', 'en', 'Sourdough Loaf', 'Artisanal bread with 48-hour fermentation', 'Our sourdough loaf is the result of 48 hours of slow fermentation. We use a century-old sourdough starter fed daily, which brings subtle acidic notes and unique flavor complexity. Each loaf is unique, with a thick, caramelized crust.'),
  ('b1000000-0000-0000-0000-000000000003', 'ca', 'Fogassa de Massa Mare', 'Pa artesanal amb fermentació de 48 hores', 'La nostra fogassa de massa mare és el resultat de 48 hores de fermentació lenta. Utilitzem una massa mare centenària alimentada diàriament, que aporta notes àcides subtils i una complexitat de sabor única. Cada fogassa és única, amb una crosta gruixuda i caramel·litzada.'),

  -- Croissant artesanal
  ('b1000000-0000-0000-0000-000000000004', 'es', 'Croissant Artesanal', 'Hojaldre mantecoso con 72 capas de masa', 'Nuestro croissant artesanal es una obra maestra de la bollería. Elaborado con mantequilla francesa de primera calidad, cada pieza tiene 72 capas perfectamente laminadas que se deshacen en la boca. Dorado por fuera, tierno y mantecoso por dentro.'),
  ('b1000000-0000-0000-0000-000000000004', 'en', 'Artisan Croissant', 'Buttery puff pastry with 72 layers of dough', 'Our artisan croissant is a masterpiece of pastry making. Made with premium French butter, each piece has 72 perfectly laminated layers that melt in your mouth. Golden on the outside, tender and buttery on the inside.'),
  ('b1000000-0000-0000-0000-000000000004', 'ca', 'Croissant Artesanal', 'Full de mantega amb 72 capes de massa', 'El nostre croissant artesanal és una obra mestra de la brioxeria. Elaborat amb mantega francesa de primera qualitat, cada peça té 72 capes perfectament laminades que es desfan a la boca. Daurat per fora, tendre i mantegós per dins.'),

  -- Ensaimada
  ('b1000000-0000-0000-0000-000000000005', 'es', 'Ensaimada', 'Dulce espiral de masa hojaldrada con azúcar glas', 'La ensaimada es un clásico mediterráneo que preparamos con la receta tradicional. Masa hojaldrada en espiral, elaborada con manteca de cerdo y espolvoreada con azúcar glas. Ligera, esponjosa y con un sabor que transporta a las islas.'),
  ('b1000000-0000-0000-0000-000000000005', 'en', 'Ensaimada', 'Sweet spiral of puff pastry with powdered sugar', 'The ensaimada is a Mediterranean classic we prepare with the traditional recipe. Spiral puff pastry, made with lard and dusted with powdered sugar. Light, spongy and with a flavor that transports you to the islands.'),
  ('b1000000-0000-0000-0000-000000000005', 'ca', 'Ensaïmada', 'Dolça espiral de pasta fullada amb sucre glas', 'L''ensaïmada és un clàssic mediterrani que preparem amb la recepta tradicional. Pasta fullada en espiral, elaborada amb saïm i empolvorada amb sucre glas. Lleugera, esponjosa i amb un sabor que transporta a les illes.'),

  -- Napolitana de chocolate
  ('b1000000-0000-0000-0000-000000000006', 'es', 'Napolitana de Chocolate', 'Hojaldre crujiente relleno de chocolate belga', 'Nuestra napolitana combina un hojaldre crujiente y mantecoso con un relleno generoso de chocolate belga negro 70%. Se hornea hasta conseguir un dorado perfecto mientras el chocolate se funde en un interior cremoso e irresistible.'),
  ('b1000000-0000-0000-0000-000000000006', 'en', 'Chocolate Napolitana', 'Crispy puff pastry filled with Belgian chocolate', 'Our napolitana combines a crispy, buttery puff pastry with a generous filling of 70% dark Belgian chocolate. Baked until perfectly golden while the chocolate melts into a creamy, irresistible interior.'),
  ('b1000000-0000-0000-0000-000000000006', 'ca', 'Napolitana de Xocolata', 'Full cruixent farcit de xocolata belga', 'La nostra napolitana combina un full cruixent i mantegós amb un farcit generós de xocolata belga negra 70%. S''enforna fins a aconseguir un daurat perfecte mentre la xocolata es fon en un interior cremós i irresistible.'),

  -- Tarta de chocolate
  ('b1000000-0000-0000-0000-000000000007', 'es', 'Tarta de Chocolate', 'Tres capas de bizcocho con ganache de chocolate negro', 'Nuestra tarta de chocolate es pura indulgencia. Tres capas de bizcocho húmedo de cacao cubiertas con ganache de chocolate negro belga al 72%. Decorada con virutas de chocolate y un toque de flor de sal que realza todos los sabores.'),
  ('b1000000-0000-0000-0000-000000000007', 'en', 'Chocolate Cake', 'Three layers of sponge with dark chocolate ganache', 'Our chocolate cake is pure indulgence. Three layers of moist cocoa sponge covered with 72% Belgian dark chocolate ganache. Decorated with chocolate shavings and a touch of fleur de sel that enhances all the flavors.'),
  ('b1000000-0000-0000-0000-000000000007', 'ca', 'Pastís de Xocolata', 'Tres capes de pa de pessic amb ganache de xocolata negra', 'El nostre pastís de xocolata és pura indulgència. Tres capes de pa de pessic humit de cacau cobertes amb ganache de xocolata negra belga al 72%. Decorat amb encenalls de xocolata i un toc de flor de sal que realça tots els sabors.'),

  -- Tarta de manzana
  ('b1000000-0000-0000-0000-000000000008', 'es', 'Tarta de Manzana', 'Clásica tarta con manzanas caramelizadas y canela', 'Nuestra tarta de manzana rinde homenaje a la receta de la abuela. Base de masa quebrada mantecosa, rellena de manzanas Golden caramelizadas con canela, vainilla y un toque de limón. Horneada hasta que las manzanas se doran y el aroma llena la panadería.'),
  ('b1000000-0000-0000-0000-000000000008', 'en', 'Apple Pie', 'Classic pie with caramelized apples and cinnamon', 'Our apple pie pays homage to grandma''s recipe. Buttery shortcrust base filled with Golden apples caramelized with cinnamon, vanilla and a touch of lemon. Baked until the apples turn golden and the aroma fills the bakery.'),
  ('b1000000-0000-0000-0000-000000000008', 'ca', 'Pastís de Poma', 'Pastís clàssic amb pomes caramel·litzades i canyella', 'El nostre pastís de poma ret homenatge a la recepta de l''àvia. Base de pasta trencada mantegosa, farcida de pomes Golden caramel·litzades amb canyella, vainilla i un toc de llimona. Enfornat fins que les pomes es dauren i l''aroma omple la fleca.'),

  -- Tarta de zanahoria
  ('b1000000-0000-0000-0000-000000000009', 'es', 'Tarta de Zanahoria', 'Bizcocho especiado con frosting de queso crema', 'Nuestra tarta de zanahoria es húmeda, aromática y absolutamente adictiva. Bizcocho con zanahoria rallada, nueces, canela y jengibre, cubierta con un frosting de queso crema Philadelphia. Un equilibrio perfecto entre dulce y especiado.'),
  ('b1000000-0000-0000-0000-000000000009', 'en', 'Carrot Cake', 'Spiced sponge with cream cheese frosting', 'Our carrot cake is moist, aromatic and absolutely addictive. Sponge cake with grated carrot, walnuts, cinnamon and ginger, topped with Philadelphia cream cheese frosting. A perfect balance between sweet and spiced.'),
  ('b1000000-0000-0000-0000-000000000009', 'ca', 'Pastís de Pastanaga', 'Pa de pessic especiat amb frosting de formatge crema', 'El nostre pastís de pastanaga és humit, aromàtic i absolutament addictiu. Pa de pessic amb pastanaga ratllada, nous, canyella i gingebre, cobert amb un frosting de formatge crema Philadelphia. Un equilibri perfecte entre dolç i especiat.'),

  -- Cookies de chocolate
  ('b1000000-0000-0000-0000-000000000010', 'es', 'Cookie de Chocolate', 'Cookie crujiente por fuera y fundente por dentro', 'Nuestra cookie de chocolate es el clásico americano perfeccionado. Crujiente en los bordes, fundente en el centro, con trozos generosos de chocolate negro y chocolate con leche. Cada cookie se hornea al momento para una frescura máxima.'),
  ('b1000000-0000-0000-0000-000000000010', 'en', 'Chocolate Cookie', 'Crispy on the outside, gooey on the inside', 'Our chocolate cookie is the perfected American classic. Crispy at the edges, gooey in the center, with generous chunks of dark and milk chocolate. Each cookie is baked to order for maximum freshness.'),
  ('b1000000-0000-0000-0000-000000000010', 'ca', 'Galeta de Xocolata', 'Galeta cruixent per fora i fosa per dins', 'La nostra galeta de xocolata és el clàssic americà perfeccionat. Cruixent als marges, fosa al centre, amb trossos generosos de xocolata negra i xocolata amb llet. Cada galeta s''enforna al moment per a una frescor màxima.'),

  -- Galletas de mantequilla
  ('b1000000-0000-0000-0000-000000000011', 'es', 'Galletas de Mantequilla', 'Surtido de galletas artesanales de mantequilla (caja 250g)', 'Nuestro surtido de galletas de mantequilla incluye cinco variedades: clásica, limón, almendra, canela y vainilla. Cada galleta se elabora con mantequilla francesa y se hornea a baja temperatura para conseguir esa textura que se deshace en la boca.'),
  ('b1000000-0000-0000-0000-000000000011', 'en', 'Butter Cookies', 'Assorted artisanal butter cookies (250g box)', 'Our butter cookie assortment includes five varieties: classic, lemon, almond, cinnamon and vanilla. Each cookie is made with French butter and baked at low temperature to achieve that melt-in-your-mouth texture.'),
  ('b1000000-0000-0000-0000-000000000011', 'ca', 'Galetes de Mantega', 'Assortiment de galetes artesanals de mantega (caixa 250g)', 'El nostre assortiment de galetes de mantega inclou cinc varietats: clàssica, llimona, ametlla, canyella i vainilla. Cada galeta s''elabora amb mantega francesa i s''enforna a baixa temperatura per aconseguir aquella textura que es desfà a la boca.'),

  -- Roscón de reyes
  ('b1000000-0000-0000-0000-000000000012', 'es', 'Roscón de Reyes', 'Roscón tradicional con nata y fruta escarchada', 'Nuestro Roscón de Reyes sigue la receta más tradicional: masa brioche perfumada con agua de azahar, decorada con fruta escarchada y azúcar perlado. Disponible con relleno de nata, trufa o crema. Incluye sorpresa y haba.'),
  ('b1000000-0000-0000-0000-000000000012', 'en', 'Kings'' Cake', 'Traditional ring cake with cream and candied fruit', 'Our Kings'' Cake follows the most traditional recipe: brioche dough perfumed with orange blossom water, decorated with candied fruit and pearl sugar. Available with cream, truffle or custard filling. Includes surprise and bean.'),
  ('b1000000-0000-0000-0000-000000000012', 'ca', 'Tortell de Reis', 'Tortell tradicional amb nata i fruita confitada', 'El nostre Tortell de Reis segueix la recepta més tradicional: massa brioix perfumada amb aigua de taronger, decorada amb fruita confitada i sucre perlat. Disponible amb farcit de nata, tòfona o crema. Inclou sorpresa i fava.'),

  -- Coca de Sant Joan
  ('b1000000-0000-0000-0000-000000000013', 'es', 'Coca de San Juan', 'Coca catalana tradicional con piñones y frutas', 'La coca de San Juan es la estrella de la verbena. Masa brioche cubierta con piñones, frutas confitadas y crema. Elaborada siguiendo la receta tradicional catalana que celebramos cada 23 de junio.'),
  ('b1000000-0000-0000-0000-000000000013', 'en', 'Sant Joan Cake', 'Traditional Catalan flatbread with pine nuts and fruits', 'The Sant Joan cake is the star of the midsummer festival. Brioche dough topped with pine nuts, candied fruits and cream. Made following the traditional Catalan recipe celebrated every June 23rd.'),
  ('b1000000-0000-0000-0000-000000000013', 'ca', 'Coca de Sant Joan', 'Coca catalana tradicional amb pinyons i fruites', 'La coca de Sant Joan és l''estrella de la revetlla. Massa brioix coberta amb pinyons, fruites confitades i crema. Elaborada seguint la recepta tradicional catalana que celebrem cada 23 de juny.'),

  -- Panettone
  ('b1000000-0000-0000-0000-000000000014', 'es', 'Panettone Artesanal', 'Panettone italiano con pasas y naranja confitada', 'Nuestro panettone artesanal requiere tres días de elaboración. Masa madre natural, mantequilla, huevos de corral, pasas sultanas maceradas en ron y naranja confitada. El resultado es un panettone ligero, aromático y con un alveolado perfecto.'),
  ('b1000000-0000-0000-0000-000000000014', 'en', 'Artisan Panettone', 'Italian panettone with raisins and candied orange', 'Our artisan panettone requires three days of preparation. Natural sourdough, butter, free-range eggs, sultana raisins macerated in rum and candied orange. The result is a light, aromatic panettone with perfect honeycomb structure.'),
  ('b1000000-0000-0000-0000-000000000014', 'ca', 'Panettone Artesanal', 'Panettone italià amb panses i taronja confitada', 'El nostre panettone artesanal requereix tres dies d''elaboració. Massa mare natural, mantega, ous de corral, panses sultanes macerades en rom i taronja confitada. El resultat és un panettone lleuger, aromàtic i amb un alveolat perfecte.')
ON CONFLICT (product_id, language_code) DO NOTHING;

-- ============================================================
-- 5c. PRODUCT IMAGES (Unsplash placeholders — replace with real photos)
-- ============================================================

-- Remove existing seed images to avoid duplicates (no unique constraint on product_images)
DELETE FROM product_images WHERE product_id IN (
  'b1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000002',
  'b1000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000004',
  'b1000000-0000-0000-0000-000000000005', 'b1000000-0000-0000-0000-000000000006',
  'b1000000-0000-0000-0000-000000000007', 'b1000000-0000-0000-0000-000000000008',
  'b1000000-0000-0000-0000-000000000009', 'b1000000-0000-0000-0000-000000000010',
  'b1000000-0000-0000-0000-000000000011', 'b1000000-0000-0000-0000-000000000012',
  'b1000000-0000-0000-0000-000000000013', 'b1000000-0000-0000-0000-000000000014'
);

INSERT INTO product_images (product_id, url, alt_text, sort_order, is_primary) VALUES
  ('b1000000-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=800&q=80', 'Pan de pueblo artesanal', 0, true),
  ('b1000000-0000-0000-0000-000000000002', 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&q=80', 'Pan de cristal', 0, true),
  ('b1000000-0000-0000-0000-000000000003', 'https://images.unsplash.com/photo-1585478259715-876acc5be8eb?w=800&q=80', 'Hogaza de masa madre', 0, true),
  ('b1000000-0000-0000-0000-000000000004', 'https://images.unsplash.com/photo-1555507036-ab1f4038024a?w=800&q=80', 'Croissant artesanal', 0, true),
  ('b1000000-0000-0000-0000-000000000005', 'https://images.unsplash.com/photo-1620921568790-c1cf8984624c?w=800&q=80', 'Ensaimada', 0, true),
  ('b1000000-0000-0000-0000-000000000006', 'https://images.unsplash.com/photo-1530610476181-d83430b64dcd?w=800&q=80', 'Napolitana de chocolate', 0, true),
  ('b1000000-0000-0000-0000-000000000007', 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&q=80', 'Tarta de chocolate', 0, true),
  ('b1000000-0000-0000-0000-000000000008', 'https://images.unsplash.com/photo-1568571780765-9276ac8b75a2?w=800&q=80', 'Tarta de manzana', 0, true),
  ('b1000000-0000-0000-0000-000000000009', 'https://images.unsplash.com/photo-1621303837174-89787a7d4729?w=800&q=80', 'Tarta de zanahoria', 0, true),
  ('b1000000-0000-0000-0000-000000000010', 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=800&q=80', 'Cookie de chocolate', 0, true),
  ('b1000000-0000-0000-0000-000000000011', 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=800&q=80', 'Galletas de mantequilla', 0, true),
  ('b1000000-0000-0000-0000-000000000012', 'https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?w=800&q=80', 'Roscón de reyes', 0, true),
  ('b1000000-0000-0000-0000-000000000013', 'https://images.unsplash.com/photo-1509365390695-33aee754301f?w=800&q=80', 'Coca de Sant Joan', 0, true),
  ('b1000000-0000-0000-0000-000000000014', 'https://images.unsplash.com/photo-1607920591413-4ec007e70023?w=800&q=80', 'Panettone artesanal', 0, true);

-- ============================================================
-- 5d. INVENTORY
-- ============================================================

INSERT INTO inventory (product_id, stock, low_stock_threshold) VALUES
  ('b1000000-0000-0000-0000-000000000001', 30, 5),
  ('b1000000-0000-0000-0000-000000000002', 25, 5),
  ('b1000000-0000-0000-0000-000000000003', 15, 3),
  ('b1000000-0000-0000-0000-000000000004', 50, 10),
  ('b1000000-0000-0000-0000-000000000005', 20, 5),
  ('b1000000-0000-0000-0000-000000000006', 30, 8),
  ('b1000000-0000-0000-0000-000000000007', 5,  2),
  ('b1000000-0000-0000-0000-000000000008', 4,  2),
  ('b1000000-0000-0000-0000-000000000009', 4,  2),
  ('b1000000-0000-0000-0000-000000000010', 40, 10),
  ('b1000000-0000-0000-0000-000000000011', 15, 3),
  ('b1000000-0000-0000-0000-000000000012', 0,  3),
  ('b1000000-0000-0000-0000-000000000013', 0,  3),
  ('b1000000-0000-0000-0000-000000000014', 0,  3)
ON CONFLICT (product_id) DO NOTHING;

-- ============================================================
-- 5e. INGREDIENTS (for key products)
-- ============================================================

-- Pan de pueblo
INSERT INTO ingredients (id, product_id, sort_order, is_allergen) VALUES
  ('c1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', 1, true),
  ('c1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000001', 2, false),
  ('c1000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000001', 3, false),
  ('c1000000-0000-0000-0000-000000000004', 'b1000000-0000-0000-0000-000000000001', 4, false)
ON CONFLICT (id) DO NOTHING;
INSERT INTO ingredient_translations (ingredient_id, language_code, name) VALUES
  ('c1000000-0000-0000-0000-000000000001', 'es', 'Harina de trigo'),
  ('c1000000-0000-0000-0000-000000000001', 'en', 'Wheat flour'),
  ('c1000000-0000-0000-0000-000000000001', 'ca', 'Farina de blat'),
  ('c1000000-0000-0000-0000-000000000002', 'es', 'Agua'),
  ('c1000000-0000-0000-0000-000000000002', 'en', 'Water'),
  ('c1000000-0000-0000-0000-000000000002', 'ca', 'Aigua'),
  ('c1000000-0000-0000-0000-000000000003', 'es', 'Sal marina'),
  ('c1000000-0000-0000-0000-000000000003', 'en', 'Sea salt'),
  ('c1000000-0000-0000-0000-000000000003', 'ca', 'Sal marina'),
  ('c1000000-0000-0000-0000-000000000004', 'es', 'Masa madre natural'),
  ('c1000000-0000-0000-0000-000000000004', 'en', 'Natural sourdough'),
  ('c1000000-0000-0000-0000-000000000004', 'ca', 'Massa mare natural')
ON CONFLICT (ingredient_id, language_code) DO NOTHING;

-- Croissant artesanal
INSERT INTO ingredients (id, product_id, sort_order, is_allergen) VALUES
  ('c1000000-0000-0000-0000-000000000005', 'b1000000-0000-0000-0000-000000000004', 1, true),
  ('c1000000-0000-0000-0000-000000000006', 'b1000000-0000-0000-0000-000000000004', 2, true),
  ('c1000000-0000-0000-0000-000000000007', 'b1000000-0000-0000-0000-000000000004', 3, true),
  ('c1000000-0000-0000-0000-000000000008', 'b1000000-0000-0000-0000-000000000004', 4, false),
  ('c1000000-0000-0000-0000-000000000009', 'b1000000-0000-0000-0000-000000000004', 5, false)
ON CONFLICT (id) DO NOTHING;
INSERT INTO ingredient_translations (ingredient_id, language_code, name) VALUES
  ('c1000000-0000-0000-0000-000000000005', 'es', 'Harina de trigo'),
  ('c1000000-0000-0000-0000-000000000005', 'en', 'Wheat flour'),
  ('c1000000-0000-0000-0000-000000000005', 'ca', 'Farina de blat'),
  ('c1000000-0000-0000-0000-000000000006', 'es', 'Mantequilla francesa'),
  ('c1000000-0000-0000-0000-000000000006', 'en', 'French butter'),
  ('c1000000-0000-0000-0000-000000000006', 'ca', 'Mantega francesa'),
  ('c1000000-0000-0000-0000-000000000007', 'es', 'Huevos de corral'),
  ('c1000000-0000-0000-0000-000000000007', 'en', 'Free-range eggs'),
  ('c1000000-0000-0000-0000-000000000007', 'ca', 'Ous de corral'),
  ('c1000000-0000-0000-0000-000000000008', 'es', 'Azúcar'),
  ('c1000000-0000-0000-0000-000000000008', 'en', 'Sugar'),
  ('c1000000-0000-0000-0000-000000000008', 'ca', 'Sucre'),
  ('c1000000-0000-0000-0000-000000000009', 'es', 'Levadura fresca'),
  ('c1000000-0000-0000-0000-000000000009', 'en', 'Fresh yeast'),
  ('c1000000-0000-0000-0000-000000000009', 'ca', 'Llevat fresc')
ON CONFLICT (ingredient_id, language_code) DO NOTHING;

-- Tarta de chocolate
INSERT INTO ingredients (id, product_id, sort_order, is_allergen) VALUES
  ('c1000000-0000-0000-0000-000000000010', 'b1000000-0000-0000-0000-000000000007', 1, true),
  ('c1000000-0000-0000-0000-000000000011', 'b1000000-0000-0000-0000-000000000007', 2, true),
  ('c1000000-0000-0000-0000-000000000012', 'b1000000-0000-0000-0000-000000000007', 3, true),
  ('c1000000-0000-0000-0000-000000000013', 'b1000000-0000-0000-0000-000000000007', 4, false),
  ('c1000000-0000-0000-0000-000000000014', 'b1000000-0000-0000-0000-000000000007', 5, false)
ON CONFLICT (id) DO NOTHING;
INSERT INTO ingredient_translations (ingredient_id, language_code, name) VALUES
  ('c1000000-0000-0000-0000-000000000010', 'es', 'Chocolate negro belga 72%'),
  ('c1000000-0000-0000-0000-000000000010', 'en', 'Belgian dark chocolate 72%'),
  ('c1000000-0000-0000-0000-000000000010', 'ca', 'Xocolata negra belga 72%'),
  ('c1000000-0000-0000-0000-000000000011', 'es', 'Mantequilla'),
  ('c1000000-0000-0000-0000-000000000011', 'en', 'Butter'),
  ('c1000000-0000-0000-0000-000000000011', 'ca', 'Mantega'),
  ('c1000000-0000-0000-0000-000000000012', 'es', 'Huevos de corral'),
  ('c1000000-0000-0000-0000-000000000012', 'en', 'Free-range eggs'),
  ('c1000000-0000-0000-0000-000000000012', 'ca', 'Ous de corral'),
  ('c1000000-0000-0000-0000-000000000013', 'es', 'Cacao en polvo'),
  ('c1000000-0000-0000-0000-000000000013', 'en', 'Cocoa powder'),
  ('c1000000-0000-0000-0000-000000000013', 'ca', 'Cacau en pols'),
  ('c1000000-0000-0000-0000-000000000014', 'es', 'Flor de sal'),
  ('c1000000-0000-0000-0000-000000000014', 'en', 'Fleur de sel'),
  ('c1000000-0000-0000-0000-000000000014', 'ca', 'Flor de sal')
ON CONFLICT (ingredient_id, language_code) DO NOTHING;

-- ============================================================
-- 6. ADD SEO CMS SECTION (missing from current data)
-- ============================================================

INSERT INTO cms_content (id, section, sort_order, is_visible) VALUES
  ('d1000000-0000-0000-0000-000000000001', 'seo', 7, true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO cms_content_translations (content_id, language_code, title, subtitle, body) VALUES
  ('d1000000-0000-0000-0000-000000000001', 'es',
    'My Bakery - Panadería Artesanal en Barcelona',
    'Panes, pasteles y bollería artesanal',
    'Descubre la mejor panadería artesanal en Barcelona. Panes frescos de masa madre, croissants de mantequilla, tartas caseras y bollería fina. Horneamos a diario con ingredientes locales y recetas tradicionales. Visítanos en Nou Barris.'),
  ('d1000000-0000-0000-0000-000000000001', 'en',
    'My Bakery - Artisan Bakery in Barcelona',
    'Breads, cakes and artisan pastries',
    'Discover the best artisan bakery in Barcelona. Fresh sourdough breads, butter croissants, homemade cakes and fine pastries. We bake daily with local ingredients and traditional recipes. Visit us in Nou Barris.'),
  ('d1000000-0000-0000-0000-000000000001', 'ca',
    'My Bakery - Fleca Artesanal a Barcelona',
    'Pans, pastissos i brioxeria artesanal',
    'Descobreix la millor fleca artesanal a Barcelona. Pans frescos de massa mare, croissants de mantega, pastissos casolans i brioxeria fina. Enfornem a diari amb ingredients locals i receptes tradicionals. Visita''ns a Nou Barris.')
ON CONFLICT (content_id, language_code) DO NOTHING;

COMMIT;
