# Icon Animator

Ein ScriptUI-Panel für Adobe After Effects. Es lässt ein Icon in wenigen
Sprüngen entlang einer zufälligen Kurve durch die Komposition stottern —
ein Effekt, der von Hand jedes Mal ein Dutzend Keyframes kostet.

Jeder Klick auf **GENERATE** würfelt einen komplett neuen Pfad.

---

## Funktionen

**Skalierung (1–400 %)** — passt die ausgewählte Ebene sofort an, nicht erst
beim Generieren.

**Geschwindigkeit (0,1×–3×)** — Faktor auf die Grunddauer von 1/3 Sekunde.
Höhere Werte machen die Animation kürzer. Die daraus errechnete Dauer steht
unter dem Regler.

**Sprünge** — wie viele Positionen das Icon anspringt. Vorgabe ist 3.

**GENERATE** — setzt die Keyframes:

- Das Icon läuft entlang einer zufälligen quadratischen Bezier-Kurve.
  Start- und Endpunkt liegen einander auf einem Streuring um die
  Kompositionsmitte gegenüber, der Kontrollpunkt sitzt seitlich versetzt.
- Alle Keyframes stehen auf **Hold**. Das Icon gleitet nicht, es springt.
- Die Ebene wird auf die Animationsdauer getrimmt: In-Point beim Start,
  Out-Point am Ende.
- Bestehende Positions-Keyframes der Ebene werden dabei ersetzt.

Alles läuft in einer Undo-Gruppe und lässt sich mit **Strg/Cmd + Z**
zurücknehmen.

---

## Installation

Kopiere `IconAnimator.jsx` nach:

- **Windows** — `C:\Program Files\Adobe\Adobe After Effects <Version>\Support Files\Scripts\ScriptUI Panels\`
- **macOS** — `/Applications/Adobe After Effects <Version>/Scripts/ScriptUI Panels/`

Starte After Effects neu. Das Panel liegt danach unter
**Fenster → IconAnimator.jsx** und lässt sich andocken.

Ohne Installation geht es auch: **Datei → Skripte → Skriptdatei ausführen…**
und die `.jsx` auswählen. Dann öffnet sich das Panel als eigenes Fenster.

---

## Benutzung

1. Komposition öffnen und das Icon hineinlegen.
2. Die Icon-Ebene auswählen. Ohne Auswahl nimmt das Skript die oberste Ebene.
3. Skalierung und Geschwindigkeit einstellen.
4. Den Zeitcursor dorthin setzen, wo die Animation beginnen soll.
5. **GENERATE** klicken.

Gefällt der Pfad nicht, klick einfach nochmal.

---

## Gestaltung

Weiß, Schwarz, ein Orange (`#FF3B00`) für den Hauptbutton, Grau (`#8A8A8A`)
für Nebentext. Eine Schrift, dünne Trennlinien statt Kästen, keine Rundungen
und keine Icons.

Das Panel ist frei skalierbar; die Mindestgröße beträgt 260 × 320 px.

---

## Bekannte Grenzen

**3D-Ebenen** — Position und Skalierung werden mit zwei Komponenten gesetzt.
Bei aktiviertem 3D-Schalter erwartet After Effects drei; das Skript
funktioniert dort nicht.

**Sprünge ohne Obergrenze** — sehr große Werte erzeugen entsprechend viele
Keyframes und können After Effects blockieren.

**Umlaute** — die Datei ist UTF-8 ohne BOM. Je nach After-Effects-Version
können Umlaute in den Beschriftungen falsch dargestellt werden.

**Angedocktes Panel** — der weiße Hintergrund wird über
`graphics.backgroundColor` gesetzt. Nicht jede After-Effects-Version wendet
das auf angedockte Panels an; dort kann der graue Programmhintergrund
stehen bleiben. Als eigenes Fenster ist die Darstellung immer korrekt.

---

BY LOUIS REINECKE
