# ⚡ Kalori- ja Makrovahti (PWA)

Yksityinen, selainpohjainen Lifesum- & Strong -hybridi henkilökohtaiseen ravitsemuksen, aamupainon, makrotavoitteiden ja salitreenien seurantaan.

🔒 **100 % yksityisyys (Zero-Leakage):** Kaikki tiedot (paino, ruoat, sarjat, muistiinpanot) tallentuvat ainoastaan käyttäjän omaan laitteeseen selaimen paikalliseen muistiin (`localStorage`). Sovelluksessa ei ole keskitettyä seurantapalvelinta, joten kenenkään henkilökohtaiset tiedot eivät voi sekoittua tai vuotaa, vaikka sovelluksen linkki jaettaisiin kavereille.

---

## 🌟 Ominaisuudet

1. **Lifesum-ravintoseuranta & Älykäs makrolaskuri**:
   - Oletuskaloritavoite (2400 kcal/pv, muokattavissa asetuksista).
   - Suositeltu proteiini: $2{,}0\text{ g} \times \text{paino}$ ($4\text{ kcal/g}$).
   - Suositeltu rasva: $0{,}8\text{ g} \times \text{paino}$ ($9\text{ kcal/g}$).
   - Suositellut hiilihydraatit: jäljelle jäävät kalorit jaettuna 4:llä (minimi 0 g).
   - Reaaliaikainen **kalorirengas** ja jäljellä olevat makrot.
   - Ateriat: Aamiainen, Lounas, Päivällinen, Välipalat.
   - **TDEE-arviointi**: Laskee todellisen energiankulutuksen painotrendistä ($7700\text{ kcal} / 1\text{ kg}$).
   - Tavoitetilat: *Painon pudotus* (-400 kcal/pv), *Lihaskasvu* (+250 kcal/pv), *Ylläpito* (±0 kcal).

2. **Kameralla toimiva viivakoodi- & QR-skanneri + Open Food Facts**:
   - Skannaa EAN-13, EAN-8 ja QR-koodeja suoraan puhelimen kameralla.
   - Hakee tuotenimen, brändin ja 100 g ravintoarvot avoimesta **Open Food Facts** -tietokannasta (HTTPS/CORS suoraan selaimesta ilman API-avaimia).
   - Annoskokolaskuri (g) laskee makrot ateriaan.
   - Paikallinen tuotemuisti tallentaa skannatut ja itse luodut tuotteet laitteelle nopeaa hakua varten.

3. **Strong-salitreenilogi & Lepotaukoajastin**:
   - Treenipohjat (*Push / Työntävät*, *Pull / Vetävät*, *Legs / Jalat*, *Full Body / Koko keho*) tai vapaat liikkeet.
   - Sarjojen kirjaus (kg, toistot, RPE) ja **edellisen treenin vertailu** (esim. *"Edellinen: 80 kg × 8"*).
   - **Automaattinen lepotaukoajastin**: Käynnistyy sarjan kuittaamisesta vihreäksi (60s, 90s, 120s, 180s, +30s) ja antaa äänimerkin (Web Audio API).
   - Tallentaa treenivolyymin ja keston.

4. **PWA (Progressive Web App) & Offline-tuki**:
   - Voidaan asentaa puhelimen kotinäytölle sovellukseksi ilman selaimen osoitepalkkia.
   - Service Worker mahdollistaa salikäytön ilman verkkoyhteyttä.

---

## 📱 Asennus puhelimen kotinäytölle (PWA)

### iPhone / iPad (iOS Safari):
1. Avaa sovelluksen osoite Safarissa.
2. Napauta selaimen alareunasta **Jaa**-painiketta (neliö ja nuoli ylöspäin).
3. Vieritä alaspäin ja valitse **"Lisää Koti-valikkoon"** (*Add to Home Screen*).
4. Sovellus ilmestyy puhelimen kotinäytölle omalla kuvakkeellaan ja avautuu koko ruudun tilassa ilman selaimen palkkeja.

### Android (Chrome):
1. Avaa sovelluksen osoite Chromessa.
2. Napauta kolmea pistettä oikeassa yläkulmassa.
3. Valitse **"Asenna sovellus"** tai **"Lisää aloitusnäyttöön"** (*Install App / Add to Home screen*).

---

## 🚀 Julkaisu GitHub Pagesiin (Ilmainen & nopea)

Sovellus on 100 % staattinen asiakaspuolen sovellus, joten se voidaan julkaista suoraan GitHub Pagesissa ilman palvelinkuluja:

1. **Luo yksityinen tai julkinen repositorio GitHubissa**:
   ```bash
   cd kalorilaskuri
   git remote add origin https://github.com/KAYTTAJANIMI/kalorilaskuri.git
   git branch -M main
   git push -u origin main
   ```

2. **Ota GitHub Pages käyttöön**:
   - Mene repositoriosi sivulle GitHubissa: **Settings** $\rightarrow$ **Pages**.
   - Kohdassa **Build and deployment** / **Source**: valitse **Deploy from a branch**.
   - Valitse haaraksi **main** ja kansioksi **/ (root)** tai **/public** (tai sijoita `public/`-kansion tiedostot juureen).
   - Tallenna (**Save**).
   - Hetken kuluttua saat HTTPS-osoitteen (esim. `https://kayttajanimi.github.io/kalorilaskuri/`).

---

## 👥 Miten sovellus jaetaan kavereille turvallisesti?

Koska kaikki tiedot tallentuvat vain ja ainoastaan kunkin käyttäjän omaan laitteeseen (`localStorage`):
- Voit antaa saman GitHub Pages -osoitteen tai paikallisen linkin kenelle tahansa kaverillesi.
- Kaverin avatessa linkin, sovellus aukeaa hänelle **täysin puhtaalta pöydältä** (omilla oletusasetuksilla).
- Kenenkään paino, aamupaino, treenit tai ruokakirjaukset **eivät koskaan siirry tai vuoda toisille**.
- Jos kaveri haluaa testata toimintoja heti ilman omaa dataa, hän voi painaa asetuksista:
  👉 **"🎲 Lataa esimerkkidata (demo)"**.
- Kaikki tiedot voi nollata milloin tahansa yhdellä klikkauksella:
  👉 **"🗑️ Tyhjennä kaikki tiedot (Puhdas pöytä)"**.
- Varmuuskopiot voi ottaa talteen tiedostona napilla:
  👉 **"📥 Vie varmuuskopio (JSON)"**.

---

## 💻 Paikallinen kehitys ja testaus

Voit ajaa sovellusta paikallisesti millä tahansa staattisella palvelimella tai mukana tulevalla Node.js-palvelimella:

```bash
# Käynnistys Node.js:llä
node server.js
# tai
npm start
```

Avaa selain osoitteessa:
👉 **[http://localhost:3000](http://localhost:3000)**

---

## 📂 Tiedostorakenne

```
kalorilaskuri/
├── public/
│   ├── index.html            # Käyttöliittymä, PWA-meta-tagit
│   ├── app.js                # Asiakaspuolen tallennus, makrolaskuri, skanneri & Strong-loki
│   ├── styles.css            # Mobiilioptimoitu tumma teema (notch- & touch-tuella)
│   ├── sw.js                 # Service Worker offline-välimuistille
│   ├── manifest.json         # Web App Manifest PWA-asennukseen
│   ├── icon.svg              # Vektori-ikoni
│   ├── icon-192.png          # PWA-kuvake 192x192 px
│   ├── icon-512.png          # PWA-kuvake 512x512 px
│   └── apple-touch-icon.png  # iOS Safari -kotinäyttökuvake
├── .gitignore                # Git-ohitussäännöt (kannat, varmuuskopiot, .env)
├── package.json              # Projektiasetukset
├── README.md                 # Käyttö-, julkaisu- ja kaverijako-ohjeet
└── server.js                 # Valinnainen kevyt paikallispalvelin
```
