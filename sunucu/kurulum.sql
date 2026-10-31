-- Cüzdan sunucu yapısı. Her kullanıcı yalnız kendi satırını görür.

create table if not exists public.cuzdanlar (
  kullanici uuid primary key default auth.uid() references auth.users on delete cascade,
  veri jsonb not null,
  surum bigint not null default 1,
  guncellendi timestamptz not null default now(),
  constraint veri_boyutu check (octet_length(veri::text) < 5000000)
);

create table if not exists public.bildirim_abonelikleri (
  endpoint text primary key,
  kullanici uuid not null default auth.uid() references auth.users on delete cascade,
  p256dh text not null,
  auth text not null,
  olusturuldu timestamptz not null default now()
);

create table if not exists public.bildirim_planlari (
  kullanici uuid primary key default auth.uid() references auth.users on delete cascade,
  plan jsonb not null default '[]',
  gonderilen jsonb not null default '[]',
  guncellendi timestamptz not null default now()
);

alter table public.cuzdanlar enable row level security;
alter table public.bildirim_abonelikleri enable row level security;
alter table public.bildirim_planlari enable row level security;

drop policy if exists kendi_cuzdani on public.cuzdanlar;
create policy kendi_cuzdani on public.cuzdanlar for all to authenticated
  using (kullanici = auth.uid()) with check (kullanici = auth.uid());
drop policy if exists kendi_aboneligi on public.bildirim_abonelikleri;
create policy kendi_aboneligi on public.bildirim_abonelikleri for all to authenticated
  using (kullanici = auth.uid()) with check (kullanici = auth.uid());
drop policy if exists kendi_plani on public.bildirim_planlari;
create policy kendi_plani on public.bildirim_planlari for all to authenticated
  using (kullanici = auth.uid()) with check (kullanici = auth.uid());

revoke all on public.cuzdanlar, public.bildirim_abonelikleri, public.bildirim_planlari from anon, public;
grant select, insert, update, delete on public.cuzdanlar, public.bildirim_abonelikleri, public.bildirim_planlari to authenticated;

-- Başka cihaz araya girdiyse -1 döner, üzerine yazılmaz.
create or replace function public.cuzdan_kaydet(yeni jsonb, beklenen bigint)
returns bigint language plpgsql security invoker as $$
declare sonuc bigint;
begin
  if beklenen = 0 then
    insert into public.cuzdanlar (veri) values (yeni)
      on conflict (kullanici) do nothing returning surum into sonuc;
  else
    update public.cuzdanlar set veri = yeni, surum = surum + 1, guncellendi = now()
      where kullanici = auth.uid() and surum = beklenen returning surum into sonuc;
  end if;
  return coalesce(sonuc, -1);
end $$;

create or replace function public.hesabimi_sil()
returns void language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null then raise exception 'giris gerekli'; end if;
  delete from auth.users where id = auth.uid();
end $$;

revoke all on function public.cuzdan_kaydet(jsonb, bigint), public.hesabimi_sil() from anon, public;
grant execute on function public.cuzdan_kaydet(jsonb, bigint), public.hesabimi_sil() to authenticated;

create extension if not exists pg_cron;
create extension if not exists pg_net;
