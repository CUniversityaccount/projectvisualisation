## Datasources
CBS statestiek
(website: http://statline.cbs.nl/Statweb/ )

Algemeen databestand, Amsterdam
(website: [links]https://data.amsterdam.nl/#?dte=dcatd%2Fdatasets%2Fbasisbestand-gebieden-amsterdam-bbga&dtfs=T&dsf=groups::bevolking&mpb=topografie&mpz=11&mpv=52.3731081:4.8932945)
Dit bestand is zeer knullig gemaakt door de gemeente, dus dit wordt geparsed met behulp van een python script.

Coordinatenbestand, Amsterdam
(website: [links]https://maps.amsterdam.nl/open_geodata/?LANG=en  )

## Design
![uiterlijk](https://user-images.githubusercontent.com/44020631/50771335-a2f0fd00-128a-11e9-98fa-c210c3315fc0.png)

## Implementatie
Je kan op de Amsterdamse kaart klikken voor welke data je wilt zien of op de navigatie menu voor een beter overzicht.
Als men op de kaart drukt, kan men een van de variables zien en dat wordt in een piechart of barchart duidelijk gemaakt.
Verder is deze mogelijkheid ook te zien op de overzichtpagina's

De overzicht pagina's bestaan uit de gebieden die te zien zijn uit de hoofdpagina en de stadzelf.

## Tools
- D3
- Python
- Tooltip
- SVG voor Amsterdammap
- Dropdown menu om de variables te kiezen
