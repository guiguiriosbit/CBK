-- Función para crear perfil automáticamente cuando se registra un usuario
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para crear perfil automáticamente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Vista para administradores (listado completo de pedidos con información del usuario)
CREATE OR REPLACE VIEW public.admin_orders_view AS
SELECT 
  o.id,
  o.user_id,
  p.email,
  p.full_name,
  o.total_amount,
  o.status,
  o.payment_status,
  o.created_at,
  o.updated_at,
  sa.address_line1,
  sa.city,
  sa.state,
  sa.postal_code
FROM public.orders o
LEFT JOIN public.profiles p ON o.user_id = p.id
LEFT JOIN public.shipping_addresses sa ON o.shipping_address_id = sa.id;

-- Vista para estadísticas de productos
CREATE OR REPLACE VIEW public.product_stats AS
SELECT 
  p.id,
  p.name,
  p.price,
  p.stock,
  p.is_active,
  c.name as category_name,
  COALESCE(SUM(oi.quantity), 0) as total_sold,
  COALESCE(SUM(oi.subtotal), 0) as total_revenue
FROM public.products p
LEFT JOIN public.categories c ON p.category_id = c.id
LEFT JOIN public.order_items oi ON p.id = oi.product_id
GROUP BY p.id, p.name, p.price, p.stock, p.is_active, c.name;
