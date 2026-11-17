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
