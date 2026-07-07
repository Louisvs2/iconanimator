/*
    Icon Animator für After Effects
    --------------------------------
    - Regler für die Skalierung des Icons
    - "Generate" erzeugt eine zufällige, kurvige Stotter-Animation:
      Das Icon springt in 3 Schritten (Hold-Keyframes) entlang einer
      zufälligen Bezier-Kurve durch die Komposition, Dauer: 1/3 Sekunde.
    - Jeder Klick auf "Generate" würfelt einen neuen Pfad.

    Installation:
    Datei nach "Scripts/ScriptUI Panels" im After-Effects-Ordner kopieren,
    AE neu starten, dann unter "Fenster > IconAnimator.jsx" öffnen.

    Benutzung:
    Komposition öffnen, Icon-Ebene auswählen (sonst wird die oberste
    Ebene genommen), Skalierung einstellen, "Generate" klicken.
*/

(function iconAnimator(thisObj) {

    var SCRIPT_NAME = "Icon Animator";

    // ---------------------------------------------------------------
    // Hilfsfunktionen
    // ---------------------------------------------------------------

    function randRange(min, max) {
        return min + Math.random() * (max - min);
    }

    // Quadratische Bezier-Kurve: p0 = Start, p1 = Kontrollpunkt, p2 = Ende
    function bezierPoint(p0, p1, p2, t) {
        var u = 1 - t;
        return [
            u * u * p0[0] + 2 * u * t * p1[0] + t * t * p2[0],
            u * u * p0[1] + 2 * u * t * p1[1] + t * t * p2[1]
        ];
    }

    function getCompAndLayer() {
        var comp = app.project.activeItem;
        if (!(comp && comp instanceof CompItem)) {
            alert("Bitte zuerst eine Komposition öffnen bzw. aktivieren.");
            return null;
        }
        var layer = null;
        if (comp.selectedLayers.length > 0) {
            layer = comp.selectedLayers[0];
        } else if (comp.numLayers > 0) {
            layer = comp.layer(1);
        }
        if (!layer) {
            alert("Keine Ebene gefunden. Bitte das Icon in die Komposition legen.");
            return null;
        }
        return { comp: comp, layer: layer };
    }

    // ---------------------------------------------------------------
    // Kernfunktionen
    // ---------------------------------------------------------------

    function applyScale(scaleValue) {
        var target = getCompAndLayer();
        if (!target) return;

        app.beginUndoGroup(SCRIPT_NAME + " - Skalierung");
        try {
            var scaleProp = target.layer.property("ADBE Transform Group").property("ADBE Scale");
            if (scaleProp.numKeys > 0) {
                scaleProp.setValueAtTime(target.comp.time, [scaleValue, scaleValue]);
            } else {
                scaleProp.setValue([scaleValue, scaleValue]);
            }
        } finally {
            app.endUndoGroup();
        }
    }

    function generateAnimation(scaleValue, durationSec, steps) {
        var target = getCompAndLayer();
        if (!target) return;

        var comp = target.comp;
        var layer = target.layer;

        app.beginUndoGroup(SCRIPT_NAME + " - Generate");
        try {
            var transform = layer.property("ADBE Transform Group");

            // Skalierung übernehmen
            var scaleProp = transform.property("ADBE Scale");
            if (scaleProp.numKeys === 0) {
                scaleProp.setValue([scaleValue, scaleValue]);
            }

            var posProp = transform.property("ADBE Position");

            // Alte Keyframes entfernen
            while (posProp.numKeys > 0) {
                posProp.removeKey(1);
            }

            var w = comp.width;
            var h = comp.height;

            // Zufällige Richtung: Start auf einer Seite, Ende ungefähr
            // gegenüber (z.B. links unten -> rechts oben), mit Streuung.
            var angle = randRange(0, Math.PI * 2);
            var jitterA = randRange(-0.6, 0.6);
            var jitterB = randRange(-0.6, 0.6);
            var radiusX = w * randRange(0.28, 0.42);
            var radiusY = h * randRange(0.28, 0.42);
            var cx = w / 2;
            var cy = h / 2;

            var p0 = [
                cx + Math.cos(angle + jitterA) * radiusX,
                cy + Math.sin(angle + jitterA) * radiusY
            ];
            var p2 = [
                cx + Math.cos(angle + Math.PI + jitterB) * radiusX,
                cy + Math.sin(angle + Math.PI + jitterB) * radiusY
            ];

            // Kontrollpunkt: Mittelpunkt der Strecke, seitlich versetzt,
            // damit eine deutliche Kurve entsteht.
            var midX = (p0[0] + p2[0]) / 2;
            var midY = (p0[1] + p2[1]) / 2;
            var dx = p2[0] - p0[0];
            var dy = p2[1] - p0[1];
            var len = Math.sqrt(dx * dx + dy * dy);
            if (len < 1) len = 1;
            // Senkrechte zur Bewegungsrichtung, zufällige Seite und Stärke
            var side = (Math.random() < 0.5) ? -1 : 1;
            var bend = len * randRange(0.25, 0.55) * side;
            var p1 = [
                midX + (-dy / len) * bend,
                midY + (dx / len) * bend
            ];

            // "steps" Sprünge => steps + 1 Positionen entlang der Kurve.
            // Hold-Keyframes sorgen für die abgehackte Stotter-Bewegung.
            var startTime = comp.time;
            var stepDur = durationSec / steps;
            var k, t, pt, keyIndex;

            for (k = 0; k <= steps; k++) {
                t = k / steps;
                pt = bezierPoint(p0, p1, p2, t);
                posProp.setValueAtTime(startTime + k * stepDur, pt);
            }

            for (keyIndex = 1; keyIndex <= posProp.numKeys; keyIndex++) {
                posProp.setInterpolationTypeAtKey(
                    keyIndex,
                    KeyframeInterpolationType.HOLD,
                    KeyframeInterpolationType.HOLD
                );
            }
        } catch (err) {
            alert("Fehler beim Generieren: " + err.toString());
        } finally {
            app.endUndoGroup();
        }
    }

    // ---------------------------------------------------------------
    // GUI
    // ---------------------------------------------------------------

    function buildUI(thisObj) {
        var pal = (thisObj instanceof Panel)
            ? thisObj
            : new Window("palette", SCRIPT_NAME, undefined, { resizeable: true });

        pal.orientation = "column";
        pal.alignChildren = ["fill", "top"];
        pal.spacing = 8;
        pal.margins = 12;

        // --- Skalierung ---
        var scaleGroup = pal.add("panel", undefined, "Skalierung");
        scaleGroup.orientation = "row";
        scaleGroup.alignChildren = ["fill", "center"];
        scaleGroup.margins = 12;

        var scaleSlider = scaleGroup.add("slider", undefined, 100, 1, 400);
        scaleSlider.preferredSize.width = 180;
        var scaleText = scaleGroup.add("edittext", undefined, "100");
        scaleText.characters = 5;
        scaleGroup.add("statictext", undefined, "%");

        scaleSlider.onChanging = function () {
            scaleText.text = String(Math.round(scaleSlider.value));
        };
        scaleSlider.onChange = function () {
            scaleText.text = String(Math.round(scaleSlider.value));
            applyScale(Math.round(scaleSlider.value));
        };
        scaleText.onChange = function () {
            var v = parseFloat(scaleText.text);
            if (isNaN(v)) v = 100;
            if (v < 1) v = 1;
            if (v > 400) v = 400;
            scaleText.text = String(Math.round(v));
            scaleSlider.value = v;
            applyScale(Math.round(v));
        };

        // --- Geschwindigkeit ---
        // Tempo-Faktor: 1x = 1/3 Sekunde Gesamtdauer.
        // Höherer Wert = schnellere Animation (kürzere Dauer).
        var BASE_DURATION = 1 / 3;

        var speedGroup = pal.add("panel", undefined, "Geschwindigkeit");
        speedGroup.orientation = "column";
        speedGroup.alignChildren = ["fill", "center"];
        speedGroup.margins = 12;
        speedGroup.spacing = 4;

        var speedRow = speedGroup.add("group");
        speedRow.orientation = "row";
        speedRow.alignChildren = ["fill", "center"];

        var speedSlider = speedRow.add("slider", undefined, 1, 0.1, 3);
        speedSlider.preferredSize.width = 180;
        var speedText = speedRow.add("edittext", undefined, "1.0");
        speedText.characters = 5;
        speedRow.add("statictext", undefined, "x");

        var durLabel = speedGroup.add("statictext", undefined, "");

        function currentDuration() {
            var speed = parseFloat(speedText.text);
            if (isNaN(speed) || speed <= 0) speed = 1;
            return BASE_DURATION / speed;
        }

        function updateDurLabel() {
            durLabel.text = "Dauer: " + currentDuration().toFixed(3) + " s";
        }
        updateDurLabel();

        speedSlider.onChanging = function () {
            speedText.text = speedSlider.value.toFixed(1);
            updateDurLabel();
        };
        speedSlider.onChange = function () {
            speedText.text = speedSlider.value.toFixed(1);
            updateDurLabel();
        };
        speedText.onChange = function () {
            var v = parseFloat(speedText.text);
            if (isNaN(v)) v = 1;
            if (v < 0.1) v = 0.1;
            if (v > 3) v = 3;
            speedText.text = v.toFixed(1);
            speedSlider.value = v;
            updateDurLabel();
        };

        // --- Optionen ---
        var optGroup = pal.add("panel", undefined, "Animation");
        optGroup.orientation = "row";
        optGroup.alignChildren = ["left", "center"];
        optGroup.margins = 12;
        optGroup.spacing = 6;

        optGroup.add("statictext", undefined, "Sprünge:");
        var stepsText = optGroup.add("edittext", undefined, "3");
        stepsText.characters = 3;

        // --- Generate ---
        var genBtn = pal.add("button", undefined, "Generate");
        genBtn.preferredSize.height = 36;

        genBtn.onClick = function () {
            var scaleVal = parseFloat(scaleText.text);
            if (isNaN(scaleVal) || scaleVal <= 0) scaleVal = 100;

            var dur = currentDuration();

            var steps = parseInt(stepsText.text, 10);
            if (isNaN(steps) || steps < 1) steps = 3;

            generateAnimation(scaleVal, dur, steps);
        };

        var hint = pal.add("statictext", undefined,
            "Icon-Ebene auswählen, dann Generate klicken.", { multiline: true });
        hint.graphics.foregroundColor =
            hint.graphics.newPen(hint.graphics.PenType.SOLID_COLOR, [0.6, 0.6, 0.6], 1);

        pal.layout.layout(true);
        pal.onResizing = pal.onResize = function () {
            this.layout.resize();
        };

        if (pal instanceof Window) {
            pal.center();
            pal.show();
        }
        return pal;
    }

    buildUI(thisObj);

})(this);
