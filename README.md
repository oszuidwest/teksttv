# Tekst TV Applicatie

Deze repository bevat de broncode van een eenvoudige Tekst TV applicatie die slides toont voor de kabelkranten van ZuidWest TV en Rucphen RTV. De slides bevatten tekst of afbeeldingen, met een doorlopende tickerbalk onderaan. De applicatie haalt regelmatig nieuwe content op via een API.

Het geheel is gebouwd met React, TypeScript en Vite. Voor de opmaak wordt Tailwind CSS 4 gebruikt. Het eindproduct wordt in een full-screen browser afgespeeld.

⚠️ Dit project is in actieve ontwikkeling. Veel is nog hardcoded. ⚠️

## Inhoud

- [Architectuur](#architectuur)
- [Slide types](#slide-types)
- [Ticker](#ticker)
- [Automatisch vernieuwen](#automatisch-vernieuwen)
- [Slide schema](#slide-schema)
- [Ticker schema](#ticker-schema)
- [Previews maken](#previews-maken)
- [Licentie](#licentie)

## Architectuur

Deze applicatie is bewust als 'domme playout' ontworpen. Het speelt slechts een playlist die als JSON is gedefinieerd af. Alle logica voor het generen van deze playlist zit in een externe applicatie. Dit maakt het flexibel: elk CMS dat een compatibel JSON-schema genereert, kan de slides aanleveren.

## Slide types

Alle slides zijn 1920x1080 pixels.

### 1. **Tekstslide**
   - **Type**: `text`
   - Bevat een **titel** en **inhoud**, met een zijbalkafbeelding.
   - **Afbeelding**: Wordt links getoond. We moeten dit waarschijnlijk in de toekomst opsplitsen in een decoratieve afbeelding en een 'editorial afbeelding' (beter woord nodig).

### 2. **Afbeeldingsslide**
   - **Type**: `image`
   - Toont een volledige afbeelding zonder tekst.

Alle slides hebben een **duur** die bepaalt hoe lang ze worden weergegeven.

## Ticker

Onderaan het scherm is een **ticker** die berichten en een klok toont. Berichten worden opgehaald via een API. De ticker wordt automatisch afgebroken om het kapot maken van de template met een te lange ticker te voorkomen.

## Automatisch vernieuwen

De app haalt bij het opstarten en elke 5 minuten nieuwe content op. Huidige slides blijven afspelen terwijl nieuwe worden geladen.

Als de internetverbinding wegvalt, zal de app blijven werken met de reeds opgehaalde slides en ticker-items. Als er geen internetverbinding is, probeert de app elke 60 seconden opnieuw data op te halen, totdat dit succesvol is. Op deze manier kan de app blijven draaien en inhoud tonen, zelfs als de internetverbinding tijdelijk wegvalt.

Daarnaast zorgt een meta-refresh ervoor dat de pagina elke dag rond 3 uur in de nacht volledig opnieuw wordt geladen. Dit gebeurt door een script dat de tijd berekent tot 3 uur 's nachts de volgende dag. Deze dagelijkse herstart voorkomt cacheproblemen. Gedurende de rest van de dag wordt de inhoud via JavaScript-updates ververst, zonder dat de pagina opnieuw hoeft te laden.

## Slide schema

Een voorbeeld van een slide-schema:

```json
[
  {
    "type": "image",
    "duration": 10000,
    "url": "https://voorbeeld.com/afbeelding.jpg"
  },
  {
    "type": "text",
    "duration": 15000,
    "title": "Nieuws van de dag",
    "body": "Dit is een nieuwsbericht.",
    "image": "https://voorbeeld.com/afbeelding2.jpg"
  }
]
```

## Ticker schema

Voorbeeld ticker-schema:
```json
[
  {
    "message": "Nu op de radio: Victor in het Weekend"
  },
  {
    "message": "Straks: NonStop"
  }
]
```

## Previews maken
Het is mogelijk om previews te tonen van slides. Previews draaien op de route `/preview?data={{base64data}}`. Je kunt een preview genereren door de schema van een van de slides als base64 encoded data aan te leveren. De preview-weergave is responsive maar altijd 16x9.

## Licentie

Dit project valt onder de Mozilla Public License, versie 2.0 (MPL-2.0). De MPL is een vrije en open softwarelicentie die het mogelijk maakt om code te hergebruiken en te delen, zowel in open-source als in commerciële projecten, zolang wijzigingen aan de oorspronkelijke code teruggegeven worden aan de gemeenschap onder de MPL.

Je mag:

- De software gebruiken voor elk doel.
- De software aanpassen en wijzigingen verspreiden.
- De software opnemen in grotere projecten, die mogelijk onder een andere licentie kunnen vallen.

Echter, als je bestanden aanpast, moet je:

- De broncode van die wijzigingen beschikbaar stellen.
- De wijzigingen onder de MPL licentie publiceren.

Voor meer informatie, zie de volledige [LICENSE](LICENSE).
