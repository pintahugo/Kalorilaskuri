# ⚡ Kalori- ja Makrovahti

Henkilökohtainen web-sovellus kalorien (oletustavoite 2400 kcal/pv), aamupainon, makrojen, treenipäivien ja palautumisen seurantaan.

---

## 🚀 Keskeiset ominaisuudet

1. **Reaaliaikaiset makrotavoitteet**:
   - **Proteiini**: Laskeutuu automaattisesti kaavalla $2{,}0\text{ g} \times \text{aamupaino (kg)}$ ($4\text{ kcal/g}$).
   - **Rasva**: Laskeutuu automaattisesti kaavalla $0{,}8\text{ g} \times \text{aamupaino (kg)}$ ($9\text{ kcal/g}$).
   - **Hiilihydraatit**: Laskeutuu jäljelle jäävistä kaloreista: $(\text{kaloritavoite} - \text{proteiinikalorit} - \text{rasvakalorit}) / 4$ (pyöristettynä, minimi 0 g).
   - Lomakkeessa esikatselu päivittyy välittömästi aamupainoa syötettäessä.
   - **1-klikkauksen esitäyttö**: "Täytä nämä toteutuneiksi" kopioi lasketut tavoitteet toteutuneisiin makroihin.
   - Visuaalinen vertailu toteutuneiden ja tavoitemakrojen välillä mittaripalkeilla ja grammaeroilla.

2. **Datan paikallinen tallennus & vienti**:
   - Tallennus paikalliseen SQLite-tietokantaan (`data/fitness.db`).
   - Yhden klikkauksen **"Generoi testidataa (30 pv)"** -painike tuottaa realistisen ja koherentin 30 päivän aineiston (aamupaino, kalorit, makrot, salitreenit ja palautuminen).
   - Vienti JSON- ja CSV-muodoissa (Excel-yhteensopiva puolipiste-erottimella ja UTF-8 BOM -merkinnällä).

3. **Dashboard & Analytiikka**:
   - **Päivän ja 7 päivän liukuva kalorikeskiarvo** suhteessa kaloritavoitteeseen (oletus 2400 kcal).
   - **Aamupaino ja 7 päivän liukuva painokeskiarvo** (tasoittaa nesteheilahtelut).
   - **Arvioitu toteutunut kulutus (TDEE)**: Lasketaan painon liukuvasta trendistä ja todellisesta energiansaannista kehon massamuutoksen ($7700\text{ kcal} / 1\text{ kg}$) avulla.
   - **Interaktiiviset SVG-kaaviot**:
     - Painon mittauspisteet ja 7 pv liukuva keskiarvokäyrä hover-työkaluohjeilla.
     - Päivittäiset kaloripylväät, tavoiteviiva sekä 7 pv kalorikeskiarvokäyrä.

4. **Tavoitetilat & Älykäs Kalorisuositus**:
   - *Painon pudotus* (-400 kcal/pv vaje TDEE:hen nähden, ~0,35–0,4 kg/vko tahti).
   - *Ylläpito / Recomposition* (Tasauspiste TDEE:n mukaan).
   - *Lihaskasvu (maltillinen plussa)* (+250 kcal/pv maltillinen anabolinen ylijäämä).
   - Analytiikkakortti antaa perustellun selityksen ja painikkeen *"Ota suositus käyttöön"*, joka päivittää kaloritavoitteen ja samalla automaattisesti hiilihydraattitavoitteen.

5. **Päiväkirjamerkintöjen CRUD**:
   - Päivämäärä, aamupaino, kalorit, toteutuneet makrot.
   - Salitreeni (kyllä/ei, sanallinen muistiinpano/ohjelma, fiilis 1–5).
   - Uni ja palautuminen (arvosana 1–5).
   - Täysi muokkaus ja poisto taulukosta.

---

## 🛠️ Teknologia

- **Backend**: Natiivi Node.js HTTP-palvelin (`node:http`) ja SQLite-ajuri (`node:sqlite`). Ei vaadi ulkoisia `npm install` -kirjastoja.
- **Frontend**: Moderni HTML5, CSS3 (tumma teema, lasimorfismi, mobiiliresponsiivisuus) ja puhdas Vanilla JS.
- **Kaaviot**: Responsiivinen, kevyt SVG-grafiikkamoottori interaktiivisilla hover-työkaluohjeilla.
- **Tietokanta**: Paikallinen SQLite (`data/fitness.db`).

---

## 📦 Asennus ja käynnistys

### Vaatimukset
- Node.js v22 tai uudempi (v26 testattu)

### Käynnistys

```bash
# Siirry projektikansioon
cd /Users/hugo/.gemini/antigravity/scratch/kalorilaskuri

# Käynnistä sovellus
node server.js
# tai
npm start
```

Avaa selain osoitteessa:
👉 **[http://localhost:3000](http://localhost:3000)**

---

## 📐 Kaavat ja laskentalogiikka

### 1. Makrotavoitteet
$$\text{Proteiinitavoite (g)} = \text{round}(2{,}0 \times \text{paino})$$
$$\text{Rasvatavoite (g)} = \text{round}(0{,}8 \times \text{paino})$$
$$\text{Hiilihydraattitavoite (g)} = \max\left(0, \text{round}\left(\frac{\text{Kaloritavoite} - (\text{Proteiini} \times 4) - (\text{Rasva} \times 9)}{4}\right)\right)$$

### 2. TDEE (Kokonaisenergiankulutus)
Kun merkintöjä on vähintään 7 päivää, lasketaan painon lineaarinen muutosnopeus $m$ (kg/pv) ja keskimääräiset toteutuneet kalorit $\bar{C}$:
$$\text{Toteutunut energiatase (kcal/pv)} = m \times 7700\text{ kcal}$$
$$\text{Arvioitu TDEE} = \text{round}(\bar{C} - (m \times 7700))$$

---

## 📂 Tiedostorakenne

```
kalorilaskuri/
├── data/
│   └── fitness.db       # Paikallinen SQLite-tietokanta (luodaan automaattisesti)
├── public/
│   ├── app.js           # Frontend-logiikka, makrolaskuri, SVG-kaaviomoottori
│   ├── index.html       # Käyttöliittymä
│   └── styles.css       # Tumma teema ja responsiivinen asettelu
├── .gitignore           # GitHub-yhteensopiva ohitustiedosto
├── package.json         # Pakettikonfiguraatio
├── README.md            # Dokumentaatio ja ohjeet
└── server.js            # Node.js REST API & SQLite DAO
```
