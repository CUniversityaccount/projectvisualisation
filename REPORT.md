## Report
### Omschrijving van de datavisualisatie
Dit is een datavisualisatie dat de verschillende visualisaties laten zien, die over de bevolking van Amsterdam gaat. Men kan op een stadsdeel kiezen en dan de verschillende aspecten van de data selecteren.

![](Afbeeldingen/firefox_1BN0qKWpqU.png =250x)

### Technisch ontwerp
Er zijn twee webpagina's die voor de visualisaties zorgen. De eerste (home.html) is de visualisatie met Amsterdam als hoofdcomponent. In deze pagina zitten vier belangrijke componenten. De tijdlijn, de knoppen , de grafieken en de kaart van Amsterdam. De kaart is afhankelijk van de tijdlijn ,vanwege dat de tijdlijn de data voor de map verzorgd (de data die later ook voor grafieken wordt gebruikt).

De map heeft een aparte bestand die de coordinaten van de stadsdelen bevat. Hierbij is wel van belang dat dit alleen de stadsdelen. De data die de kleur van de verschillende stadsdelen komen van de tijdslijn, waarbij de bevolking per stadsdeel wordt geselecteerd, als men op een stadsdeel wordt gekozen.

De knoppen zijn gedeelte verbonden met de kaart. Als er niks is geselecteerd op de kaart, dan laat de kaart de data van de stad zien met de bijhorende geselecteerde grafiek. Een persoon kan tussen de verschillende grafieken kiezen door middel van de knoppen. Die geven etnische groepen, ratio tussen man en vrouw en leeftijdgroepen van de stad of stadsdeel zien.

Op de tweede webpagina (specific.html) kunnen mensen de ontwikkeling over de jaren 2005 en 2017. Deze keuze is gemaakt om een meer objectievere grafieken te laten zien, zodat mensen de ontwikkeling van de bevolking in de stad kan beschouwen en een conclusie daar uit kan krijgen.

Hierbij zijn twee menu's en een knop. Met de knop kan de de grafiek worden aangepast op percentage en of absolute getallen. Met de menu's kan selecteren welke data er wordt geplot in de grafiek.

### Progressie
#### Problemen
De eerste probleem was de data. Dit was zeer slordig geformatteerd door de gemeente, dus heb ik de eerste paar dagen de data redelijk geformatteerd. Dit kwam ook enkele keren voor dat ik de parser.py moest herschrijven om zo de data beter tot zijn rech te laten komen. In het vervolg zou de eisen, data gezien, dat ik de data eerst grondig bekijkt.

Verder was het probleem dat de kaart eerst op eigen formules waren gemaakt, vanwege te weinig kennis van geoJson, wat in een later stadium is opgelost om eerst een test geoJson bestand te schrijven, die in de Javascript files staat als geojson.js

Verder was bij het teamoverleg dat de kaart zelf geen informatie bevatte of verder niks toonde. Dit is dus met bevolkingaantal opgelost alleen. In de nabije toekomst zou ook de bevolkingsdichtheid worden toegevoegd.

Een ander obstakel was de treemap. Hierbij was de format van de data niet geldig om de treemap tot zijn recht te laten komen. Dit moest in een aparte functie worden omgeschreven. In de toekomst zou het netter zijn om van tevoren de data beter te orderen.

Als laatste zou het netter zijn in de toekomst alles na te lopen met iemand anders op het laatstste moment, vanwege dat ik bij de tweede webpagina de omschrijving van de x-as en de y-as ben vergeten. Dit kan met deze oplossing worden voorkomen.

#### In de nabije toekomst
Als het project langer had geduurd, zou ik meer data hebben toegevoegd, waaraan meer grafieken worden verbonden, wat een duidelijker beeld geeft over andere aspecten die bezig zijn in Amsterdam. Hierbij zouden de knoppen ook veranderen per thema. Er zou ook een functie komen waarmee je de gebieden kan vergelijken, bijvoorbeeld in een lijn grafiek.

Voor de tweede pagina (specific.html) zou ik de webpagina uitgebreider maken, zodat tot zijn recht komt in de visualisatie. Ik zou ook graag willen dat je deze data kan vergelijken. Een extra functionaliteit die ik er zou willen in hebben, is dat mensen de data kunnen downloaden en erop verder kan bouwen.
