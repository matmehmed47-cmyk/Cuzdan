// Beş dakikada bir çalışır; vakti gelen hatırlatmaları telefona gönderir.
import webpush from 'npm:web-push@3.6.7';
import { createClient } from 'npm:@supabase/supabase-js@2.45.4';

const EN_ESKI = 2 * 24 * 60 * 60 * 1000;

Deno.serve(async (istek) => {
  if (istek.headers.get('x-cron-sir') !== Deno.env.get('CRON_SIR')) return new Response('yetkisiz', { status: 401 });

  webpush.setVapidDetails('https://matmehmed47-cmyk.github.io/Cuzdan/', Deno.env.get('VAPID_ACIK')!, Deno.env.get('VAPID_GIZLI')!);
  const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

  const { data: planlar, error } = await db.from('bildirim_planlari').select('*');
  if (error) return new Response(error.message, { status: 500 });

  const simdi = Date.now();
  let gonderilen = 0;
  const hatalar = [];
  for (const satir of planlar ?? []) {
    const gelen = satir.plan.filter((k) => k.zaman <= simdi && k.zaman > simdi - EN_ESKI && !satir.gonderilen.includes(k.anahtar));
    if (!gelen.length) continue;

    const { data: abonelikler } = await db.from('bildirim_abonelikleri').select('*').eq('kullanici', satir.kullanici);
    const ulasan = [];
    for (const kalem of gelen) {
      for (const abone of abonelikler ?? []) {
        try {
          await webpush.sendNotification(
            { endpoint: abone.endpoint, keys: { p256dh: abone.p256dh, auth: abone.auth } },
            JSON.stringify({ baslik: kalem.baslik, metin: kalem.metin, anahtar: kalem.anahtar }),
          );
          gonderilen += 1;
          ulasan.push(kalem.anahtar);
        } catch (hata) {
          if (hata.statusCode === 404 || hata.statusCode === 410) {
            await db.from('bildirim_abonelikleri').delete().eq('endpoint', abone.endpoint);
          } else {
            hatalar.push(`${hata.statusCode ?? ''} ${hata.message ?? hata}`.slice(0, 200));
          }
        }
      }
    }
    // Ulaşmayan hatırlatma işaretlenmez, sonraki turda yeniden denenir.
    if (ulasan.length) {
      await db.from('bildirim_planlari')
        .update({ gonderilen: [...new Set([...satir.gonderilen, ...ulasan])].slice(-300) })
        .eq('kullanici', satir.kullanici);
    }
  }
  return Response.json({ gonderilen, hatalar });
});
