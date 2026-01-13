-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create specific types for roles and status
create type user_role as enum ('user', 'seller', 'admin');
create type request_status as enum ('pending', 'approved', 'rejected');

-- PROFILES TABLE (Extends auth.users)
create table profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  role user_role default 'user',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Turn on RLS
alter table profiles enable row level security;

-- RLS Policies for Profiles
create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );

-- PRODUCTS TABLE
create table products (
  id uuid default uuid_generate_v4() primary key,
  seller_id uuid references profiles(id) not null,
  name text not null,
  description text,
  price numeric not null,
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Turn on RLS
alter table products enable row level security;

-- RLS Policies for Products
create policy "Products are viewable by everyone."
  on products for select
  using ( true );

create policy "Sellers can create products."
  on products for insert
  with check ( 
    auth.uid() = seller_id 
    and exists (
      select 1 from profiles 
      where id = auth.uid() and role = 'seller'
    ) 
  );

create policy "Sellers can update their own products."
  on products for update
  using ( auth.uid() = seller_id );

create policy "Sellers can delete their own products."
  on products for delete
  using ( auth.uid() = seller_id );

-- SELLER REQUESTS TABLE
create table seller_requests (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) not null,
  shop_name text not null,
  description text,
  status request_status default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Turn on RLS
alter table seller_requests enable row level security;

-- RLS Policies for Seller Requests
create policy "Users can create a seller request."
  on seller_requests for insert
  with check ( auth.uid() = user_id );

create policy "Users can view their own requests."
  on seller_requests for select
  using ( auth.uid() = user_id );

create policy "Admins can view all requests."
  on seller_requests for select
  using ( 
    exists (
      select 1 from profiles 
      where id = auth.uid() and role = 'admin'
    ) 
  );

create policy "Admins can update requests (approve/reject)."
  on seller_requests for update
  using ( 
    exists (
      select 1 from profiles 
      where id = auth.uid() and role = 'admin'
    ) 
  );

-- STORAGE BUCKET SETUP (For Product Images)
insert into storage.buckets (id, name, public) 
values ('product-images', 'product-images', true);

create policy "Product images are publicly accessible."
  on storage.objects for select
  using ( bucket_id = 'product-images' );

create policy "Sellers can upload product images."
  on storage.objects for insert
  with check (
    bucket_id = 'product-images'
    and auth.role() = 'authenticated'
  );

-- AUTOMATIC PROFILE CREATION TRIGGER
-- This ensures that when a user signs up via Supabase Auth, 
-- a row is automatically created in the 'profiles' table.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, 'user');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
