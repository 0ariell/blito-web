-- Correr una vez en Neon (SQL Editor).
create table if not exists demos (
  id          bigint generated always as identity primary key,
  nombre      text not null,
  contacto    text not null,
  link        text not null,
  mensaje     text,
  creado_en   timestamptz not null default now()
);
