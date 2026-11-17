-- Correr una vez en Neon (SQL Editor).
create table if not exists demos (
  id          bigint generated always as identity primary key,
  nombre      text not null,
  contacto    text not null,
  link        text not null,
  mensaje     text,
  creado_en   timestamptz not null default now()
);

-- Lista de espera de kits y newsletter.
create table if not exists suscriptores (
  id         bigint generated always as identity primary key,
  email      text not null,
  origen     text not null default 'web',
  creado_en  timestamptz not null default now(),
  unique (email, origen)
);

-- Ventas de kits (Mercado Pago).
create table if not exists pedidos (
  id             uuid primary key,
  kit_slug       text not null,
  email          text not null,
  monto          numeric(12,2) not null,
  estado         text not null default 'pendiente' check (estado in ('pendiente','pagado','rechazado')),
  mp_preference_id text,
  mp_payment_id  text,
  descargas      int not null default 0,
  creado_en      timestamptz not null default now(),
  pagado_en      timestamptz
);
create index if not exists pedidos_email_idx on pedidos (email);

-- Botón de arrepentimiento (Res. 424/2020).
create table if not exists arrepentimientos (
  codigo     text primary key,
  pedido     text,
  email      text not null,
  nombre     text not null,
  motivo     text,
  creado_en  timestamptz not null default now()
);

-- Consultas de producción y mensualidad.
create table if not exists consultas (
  id          bigint generated always as identity primary key,
  nombre      text not null,
  instagram   text,
  email       text not null,
  whatsapp    text,
  interes     text not null,
  idea        text not null,
  referencias text,
  estado      text not null default 'nueva',
  creado_en   timestamptz not null default now()
);

-- Códigos de descuento para kits.
create table if not exists cupones (
  codigo     text primary key,            -- en mayúsculas
  porcentaje int not null check (porcentaje between 1 and 100),
  activo     boolean not null default true,
  usos       int not null default 0,
  max_usos   int,                         -- null = sin límite
  vence      timestamptz,                 -- null = no vence
  kits       text[],                      -- null = todos los kits
  creado_en  timestamptz not null default now()
);
alter table pedidos add column if not exists cupon text, add column if not exists precio_lista numeric(12,2), add column if not exists nombre text;
