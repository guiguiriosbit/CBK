-- Habilitar Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipping_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

-- Políticas para profiles
CREATE POLICY "Los usuarios pueden ver su propio perfil"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Los usuarios pueden actualizar su propio perfil"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Los usuarios pueden insertar su propio perfil"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Políticas para shipping_addresses
CREATE POLICY "Los usuarios pueden ver sus propias direcciones"
  ON public.shipping_addresses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden crear sus propias direcciones"
  ON public.shipping_addresses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden actualizar sus propias direcciones"
  ON public.shipping_addresses FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden eliminar sus propias direcciones"
  ON public.shipping_addresses FOR DELETE
  USING (auth.uid() = user_id);

-- Políticas para categories (todos pueden leer)
CREATE POLICY "Todos pueden ver categorías"
  ON public.categories FOR SELECT
  TO public
  USING (true);

-- Políticas para products (todos pueden leer productos activos)
CREATE POLICY "Todos pueden ver productos activos"
  ON public.products FOR SELECT
  TO public
  USING (is_active = true);

-- Políticas para orders
CREATE POLICY "Los usuarios pueden ver sus propios pedidos"
  ON public.orders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden crear sus propios pedidos"
  ON public.orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Políticas para order_items (se pueden ver si se puede ver el pedido)
CREATE POLICY "Los usuarios pueden ver items de sus pedidos"
  ON public.order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Los usuarios pueden crear items de sus pedidos"
  ON public.order_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

-- Políticas para cart_items
CREATE POLICY "Los usuarios pueden ver su propio carrito"
  ON public.cart_items FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden crear items en su carrito"
  ON public.cart_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden actualizar items de su carrito"
  ON public.cart_items FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden eliminar items de su carrito"
  ON public.cart_items FOR DELETE
  USING (auth.uid() = user_id);
