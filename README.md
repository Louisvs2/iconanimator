# Icon Animator (After Effects Script)

Ein ScriptUI-Panel für Adobe After Effects, das ein Icon (Bild-Ebene) mit einer
zufälligen, abgehackten Stotter-Animation entlang einer Kurve durch die
Komposition springen lässt.

## Funktionen

- **Skalierungs-Regler** (1–400 %): passt die Skalierung der ausgewählten
  Icon-Ebene direkt an.
- **Generate-Button**: erzeugt eine Animation, bei der das Icon entlang einer
  zufälligen Bezier-Kurve (z. B. von links unten nach rechts oben) läuft.
  - Dauer: standardmäßig **1/3 Sekunde**
  - Das Icon bewegt sich **3-mal stotternd** (Hold-Keyframes, keine flüssige
    Bewegung — es springt zwischen den Positionen).
  - Jeder Klick auf **Generate** würfelt einen komplett neuen Pfad
    (Richtung, Krümmung und Positionen sind zufällig).
- Dauer und Anzahl der Sprünge sind im Panel einstellbar.

## Installation

1. `IconAnimator.jsx` kopieren nach:
   - **Windows:** `C:\Program Files\Adobe\Adobe After Effects <Version>\Support Files\Scripts\ScriptUI Panels\`
   - **macOS:** `/Applications/Adobe After Effects <Version>/Scripts/ScriptUI Panels/`
2. After Effects neu starten.
3. Panel öffnen über **Fenster → IconAnimator.jsx**.

Alternativ ohne Installation: **Datei → Skripte → Skriptdatei ausführen…**
und die `.jsx`-Datei auswählen.

> Hinweis: In den Voreinstellungen unter *Skripte & Expressions* sollte
> „Skripts erlauben, Dateien zu schreiben…" aktiviert sein (für ältere
> AE-Versionen nicht zwingend nötig, schadet aber nicht).

## Benutzung

1. Komposition öffnen und das Icon (Bild) hineinlegen — z. B. mittig.
2. Icon-Ebene auswählen (ohne Auswahl wird die oberste Ebene verwendet).
3. Skalierung mit dem Regler einstellen.
4. **Generate** klicken → die Stotter-Animation startet ab der aktuellen
   Position des Zeitcursors.
5. Nicht zufrieden mit dem Pfad? Einfach nochmal **Generate** klicken.

Bestehende Positions-Keyframes der Ebene werden bei jedem Generate ersetzt.
Alles ist per **Strg/Cmd+Z** rückgängig zu machen.
