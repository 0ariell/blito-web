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
