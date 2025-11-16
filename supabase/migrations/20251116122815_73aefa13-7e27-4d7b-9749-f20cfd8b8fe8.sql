-- Create user roles enum
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
ON public.user_roles FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Create orders table
CREATE TABLE public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    payment_method TEXT NOT NULL,
    address JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- RLS policies for orders
CREATE POLICY "Users can view their own orders"
ON public.orders FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own orders"
ON public.orders FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all orders"
ON public.orders FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all orders"
ON public.orders FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Create order_items table
CREATE TABLE public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
    product_id TEXT NOT NULL,
    product_name TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on order_items
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- RLS policies for order_items
CREATE POLICY "Users can view their order items"
ON public.order_items FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.orders
        WHERE orders.id = order_items.order_id
        AND orders.user_id = auth.uid()
    )
);

CREATE POLICY "Users can create order items"
ON public.order_items FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.orders
        WHERE orders.id = order_items.order_id
        AND orders.user_id = auth.uid()
    )
);

CREATE POLICY "Admins can view all order items"
ON public.order_items FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Create products table
CREATE TABLE public.products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    description TEXT NOT NULL,
    image TEXT NOT NULL,
    category TEXT NOT NULL,
    rating DECIMAL(2, 1) NOT NULL DEFAULT 0,
    reviews INTEGER NOT NULL DEFAULT 0,
    in_stock BOOLEAN NOT NULL DEFAULT true,
    discount INTEGER DEFAULT 0,
    stock_quantity INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- RLS policies for products
CREATE POLICY "Anyone can view products"
ON public.products FOR SELECT
TO authenticated, anon
USING (true);

CREATE POLICY "Admins can manage products"
ON public.products FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Create feedback table
CREATE TABLE public.feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    item_rating INTEGER NOT NULL CHECK (item_rating >= 1 AND item_rating <= 5),
    service_rating INTEGER NOT NULL CHECK (service_rating >= 1 AND service_rating <= 5),
    delivery_rating INTEGER NOT NULL CHECK (delivery_rating >= 1 AND delivery_rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (order_id, user_id)
);

-- Enable RLS on feedback
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- RLS policies for feedback
CREATE POLICY "Users can view their own feedback"
ON public.feedback FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own feedback"
ON public.feedback FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all feedback"
ON public.feedback FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_orders_updated_at
BEFORE UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();