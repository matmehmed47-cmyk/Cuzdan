# Sikke seslerini fizik modeliyle üretir: metal diskin titreşim kipleri, çarpma gürültüsü, sekme ve oda yankısı.
# Çalıştırma: python3 araclar/ses-uret.py (ses/ altına wav yazar, sonra ffmpeg ile mp3 yapılır)
import math, os, random, struct, wave

HIZ = 44100
# Serbest dairesel plakanın kip oranları: gerçek metal diskin tınısını bunlar verir.
KIPLER = [1.0, 1.46, 1.73, 2.33, 3.04, 3.91, 4.11, 5.08, 6.30, 6.96]
CIKIS = os.path.join(os.path.dirname(__file__), '..', 'ses')


def bos(sure):
    return [0.0] * int(sure * HIZ), [0.0] * int(sure * HIZ)


def carpma(sol, sag, an, taban, guc, zil, kaydir, rastgele):
    """Tek çarpışma: yakın iki frekans parlak bir titreşim verir; yüksek kipler hızlı söner."""
    bas = int(an * HIZ)
    sol_k, sag_k = math.cos((kaydir + 1) * math.pi / 4), math.sin((kaydir + 1) * math.pi / 4)
    for i, oran in enumerate(KIPLER):
        f = taban * oran * (1 + rastgele.uniform(-0.004, 0.004))
        if f > 17000:
            continue
        sonum = zil * (0.34 / (1 + i * 0.75))
        genlik = guc * rastgele.uniform(0.55, 1.0) / (1 + i * 0.32)
        evre = rastgele.uniform(0, 6.28)
        fark = f * rastgele.uniform(0.0012, 0.0035)
        uzunluk = min(int(sonum * 5.5 * HIZ), len(sol) - bas)
        for n in range(uzunluk):
            t = n / HIZ
            atak = min(1.0, t / 0.00035)
            d = genlik * atak * math.exp(-t / sonum) * (
                math.sin(2 * math.pi * f * t + evre) + 0.6 * math.sin(2 * math.pi * (f + fark) * t + evre * 1.7)
            )
            sol[bas + n] += d * sol_k
            sag[bas + n] += d * sag_k
    onceki = 0.0
    for n in range(int(0.004 * HIZ)):
        g = rastgele.uniform(-1, 1)
        y = g - onceki
        onceki = g
        d = guc * 0.5 * y * math.exp(-n / (0.0009 * HIZ))
        if bas + n < len(sol):
            sol[bas + n] += d * sol_k
            sag[bas + n] += d * sag_k


def gumbur(sol, sag, an, guc):
    """Cüzdanın yumuşak, kısa dip sesi; sese ağırlık verir."""
    bas = int(an * HIZ)
    for n in range(min(int(0.12 * HIZ), len(sol) - bas)):
        t = n / HIZ
        f = 150 + 90 * math.exp(-t / 0.02)
        d = guc * math.exp(-t / 0.035) * math.sin(2 * math.pi * f * t)
        sol[bas + n] += d
        sag[bas + n] += d


def oda(sol, sag):
    """Erken yansımalar ve kısa kuyruk: sesi kuru olmaktan çıkarır."""
    yansima = [(0.011, 0.20, 0.30), (0.017, 0.26, 0.15), (0.023, 0.13, 0.24), (0.031, 0.18, 0.09), (0.043, 0.10, 0.12), (0.061, 0.09, 0.05)]
    k_sol, k_sag = sol[:], sag[:]
    for sure, s, g in yansima:
        ad = int(sure * HIZ)
        for i in range(len(sol) - ad):
            sol[i + ad] += k_sol[i] * s
            sag[i + ad] += k_sag[i] * g


def bitir(ad, sol, sag, tepe=0.72):
    en = max(max(map(abs, sol)), max(map(abs, sag)))
    n = len(sol)
    kapanis = int(0.05 * HIZ)
    with wave.open(os.path.join(CIKIS, f'{ad}.wav'), 'wb') as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(HIZ)
        v = bytearray()
        for i in range(n):
            s = 1.0 if i < n - kapanis else (n - i) / kapanis
            for ch in (sol, sag):
                v += struct.pack('<h', int(max(-1, min(1, ch[i] / en * tepe * s)) * 32767))
        w.writeframes(bytes(v))
    print(ad, round(n / HIZ, 2), 's')


def acilis():
    # Sikke cebe düşer, iki kez sekip yanındaki sikkeye değer ve çınlayarak durur.
    r = random.Random(47)
    sol, sag = bos(1.5)
    gumbur(sol, sag, 0.01, 0.22)
    carpma(sol, sag, 0.00, 3350, 0.95, 1.0, -0.15, r)
    carpma(sol, sag, 0.135, 4280, 0.55, 0.8, 0.28, r)
    carpma(sol, sag, 0.235, 3350, 0.42, 0.75, -0.1, r)
    carpma(sol, sag, 0.305, 4280, 0.28, 0.65, 0.22, r)
    carpma(sol, sag, 0.352, 3350, 0.34, 2.1, 0.0, r)
    oda(sol, sag)
    bitir('acilis', sol, sag)


def kazanc():
    # Avuçtaki iki sikkenin kısa, temiz çınlaması.
    r = random.Random(1907)
    sol, sag = bos(0.8)
    carpma(sol, sag, 0.00, 3900, 0.8, 0.8, -0.12, r)
    carpma(sol, sag, 0.082, 4920, 0.62, 1.15, 0.16, r)
    oda(sol, sag)
    bitir('kazanc', sol, sag)


os.makedirs(CIKIS, exist_ok=True)
acilis()
kazanc()
