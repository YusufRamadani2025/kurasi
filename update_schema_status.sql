-- Run this in your Supabase SQL Editor
alter table products 
add column status text default 'available';

-- Optional: Create an index if you plan to filter by status often
create index if not exists products_status_idx on products (status);
