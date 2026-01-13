-- Run this in Supabase SQL Editor
alter table products 
add column category text default 'Uncategorized';

-- Optional: Create index
create index if not exists products_category_idx on products (category);
