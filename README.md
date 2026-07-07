# Icon Animator (After Effects Script)

Ein ScriptUI-Panel für Adobe After Effects, das ein Icon (Bild-Ebene) mit einer
zufälligen, abgehackten Stotter-Animation entlang einer Kurve durch die
Komposition springen lässt.

## Funktionen

- **Skalierungs-Regler** (1–400 %): passt die Skalierung der ausgewählten
  Icon-Ebene direkt an.
- **Geschwindigkeits-Regler** (0,1×–3×): steuert das Tempo der Animation.
  1× entspricht 1/3 Sekunde Gesamtdauer, höhere Werte machen die Animation
  schneller (kürzer), niedrigere langsamer. Die resultierende Dauer wird
  im Panel angezeigt.
- **Generate-Button**: erzeugt eine Animation, bei der das Icon entlang einer
  zufälligen Bezier-Kurve (z. B. von links unten nach rechts oben) läuft.
  - Dauer: standardmäßig **1/3 Sekunde**
  - Das Icon bewegt sich **3-mal stotternd** (Hold-Keyframes, keine flüssige
    Bewegung — es springt zwischen den Positionen).
  - Jeder Klick auf **Generate** würfelt einen komplett neuen Pfad
    (Richtung, Krümmung und Positionen sind zufällig).
- Anzahl der Sprünge ist im Panel einstellbar.
- Die **Icon-Ebene wird automatisch getrimmt**: Sie beginnt beim Start der
  Animation und endet genau mit ihr (In-/Out-Point = Animationsdauer).
- Das **Panel-Fenster ist frei skalierbar** — Regler, Button und das
  Titel-Logo wachsen bzw. schrumpfen mit der Fensterbreite.

## Eigenes Titel-Logo

Das Panel zeigt oben ein Logo an. Ersetze einfach `assets/logo.png` durch
dein eigenes Bild (PNG, empfohlen ca. **340 × 72 px**, transparenter
Hintergrund funktioniert). Alternativ kann das Logo auch als `logo.png`
oder `IconAnimator_logo.png` direkt neben der `.jsx`-Datei liegen.
Ohne Logo-Datei wird ein Text-Titel angezeigt.

## Installation

1. `IconAnimator.jsx` **zusammen mit dem `assets/`-Ordner** kopieren nach:
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
