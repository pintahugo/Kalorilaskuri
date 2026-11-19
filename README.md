# ⚡ Kalori- ja Makrovahti (Lifesum & Strong -hybridi)

Henkilökohtainen web-sovellus, joka yhdistää:
1. **Lifesum-tyylisen kalori- ja makroseurannan** (oletustavoite 2400 kcal/pv, makrotavoitteet proteiini 2 g × paino, rasva 0,8 g × paino, loput hiilihydraatteihin, aamupaino, 7 pv liukuva keskiarvo ja TDEE-arviointi).
2. **Kameralla toimivan viivakoodi- ja QR-skannerin** sekä **Open Food Facts** -ravintosisältöhaun annoskokolaskurilla ja paikallisella tuotemuistilla.
3. **Strong-tyylisen salitreenilogin** treenipohjilla (Push/Pull/Legs/Full Body), sarjakirjauksella (paino, toistot, RPE), edellisen treenin vertailulla ja älykkäällä lepotaukoajastimella (äänimerkillä).

---

## 🚀 Keskeiset ominaisuudet

### 1. Lifesum-ravintoseuranta & Makrolaskenta
- **Automaattiset makrotavoitteet**:
  - Proteiini: $2{,}0\text{ g} \times \text{paino}$ ($4\text{ kcal/g}$)
  - Rasva: $0{,}8\text{ g} \times \text{paino}$ ($9\text{ kcal/g}$)
  - Hiilihydraatit: $\max(0, \text{round}((\text{kalorit} - \text{proteiinikalorit} - \text{rasvakalorit}) / 4))$
- **Aterialoki**: Aamiainen, Lounas, Päivällinen ja Välipalat.
- **Dynaamiset edistymisrenkaat & mittarit**: Jäljellä olevat kalorit ja makrot grammoina reaaliajassa.
- **TDEE & Älykäs Tavoitetila**: Laskee todellisen energiankulutuksen ($7700\text{ kcal} / 1\text{ kg}$) ja antaa suosituksen painonpudotukseen (-400 kcal/pv), lihaskasvuun (+250 kcal/pv) tai ylläpitoon.

### 2. Viivakoodi- & QR-skanneri + Open Food Facts
- **Kameraskanneri**: Lukee EAN-13, EAN-8 ja QR-koodeja kameran kuvaikkunalla ja kohdistusristikolla.
- **Käsisyöttö & Pikanäytteet**: Mahdollisuus syöttää koodi numerona tai valita suoraan testituote (Valio Raejuusto, Maitorahka, Elovena Kaurahiutale, Kanafilee, Lohifilee).
- **Open Food Facts -haku**: Hakee tuotteen nimen, brändin ja ravintoarvot (energia, P, H, R per 100 g) virheenkäsittelyllä.
- **Annoskokolaskuri**: Syötä annos grammoina -> laskee makrot suoraan ateriaan.
- **Paikallinen Tuotemuisti (SQLite `foods`)**: Kaikki haetut ja käsin lisätyt tuotteet tallentuvat paikalliseen tietokantaan nopeaa hakua ja uudelleenkäyttöä varten.

### 3. Strong-salitreenilogi & Lepotaukoajastin
- **Treenipohjat / Viikkojako**: Valmiit pohjat (Push, Pull, Legs, Full Body) tai vapaa treeni.
- **Sarjakirjaus**: Liikekohtaiset sarjat, paino (kg), toistot, valinnainen RPE (6–10) ja kuittaus.
- **Edellisen treenin vertailu**: Näyttää suoraan saman liikkeen edelliskerran sarjat (esim. *"Edellinen: 80 kg × 8"*).
- **Automaattinen Lepotaukoajastin**:
  - Käynnistyy automaattisesti sarjan kuittaamisen yhteydessä.
  - Pikanapit: 60s, 90s, 120s, 180s sekä +30s lisäaika.
  - Web Audio API -syntetisoitu äänimerkki ajan päättyessä.
- **Volyymi & Historia**: Tallentaa treenikohtaisen volyymin ($\sum \text{paino} \times \text{toistot}$) ja keston.

### 4. Datanhallinta & Paikallisuus
- Paikallinen SQLite-tietokanta (`data/fitness.db`).
- Vienti JSON- ja CSV-muodoissa sekä JSON-tuonti.
- *"Generoi testidataa (30 pv)"* -painike generoi 30 päivää realistisia aamupainoja, aterioita ja treenejä.

---

## 🛠️ Teknologia ja arkkitehtuuri

- **Backend**: Node.js (v22+ / v26) sisäänrakennetulla `node:http`- ja `node:sqlite`-moduulilla (ei ulkoisia npm-riippuvuuksia).
- **Frontend**: Responsiivinen HTML5, CSS3 (tumma teema) ja Vanilla JS.
- **API-integraatio**: Open Food Facts v2 REST API.
- **Äänet**: Web Audio API (syntetisoitu äänikello ajastimelle).

---

## 📦 Käynnistysohjeet

```bash
# Siirry projektikansioon
cd /Users/hugo/.gemini/antigravity/scratch/kalorilaskuri

# Käynnistä palvelin
node server.js
# tai
npm start
```

Avaa selain:
👉 **[http://localhost:3000](http://localhost:3000)**

---

## 📂 Tiedostorakenne

```
kalorilaskuri/
├── data/
│   └── fitness.db       # SQLite-tietokanta (entries, meal_items, foods, workouts)
├── public/
│   ├── app.js           # Lifesum-makrot, skanneri, Strong-loki ja ajastin
│   ├── index.html       # Käyttöliittymä ja välilehtinavigaatio
│   └── styles.css       # Teema, asettelu ja animaatiot
├── .gitignore           # Gitin ohitussäännöt
├── package.json         # Pakettikonfiguraatio
├── README.md            # Dokumentaatio
└── server.js            # REST API & SQLite DAO
```
