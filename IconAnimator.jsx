/*
    Icon Animator für After Effects
    --------------------------------
    - Logo-Header (Bild) und dunkles UI-Theme
    - Regler für die Skalierung des Icons
    - Regler für die Geschwindigkeit (Tempo-Faktor, 1x = 1/3 Sekunde)
    - "GENERATE" erzeugt eine zufällige, kurvige Stotter-Animation:
      Das Icon springt in 3 Schritten (Hold-Keyframes) entlang einer
      zufälligen Bezier-Kurve durch die Komposition.
    - Jeder Klick auf "GENERATE" würfelt einen neuen Pfad.

    Installation:
    Den kompletten Ordner (IconAnimator.jsx + assets/) nach
    "Scripts/ScriptUI Panels" im After-Effects-Ordner kopieren,
    AE neu starten, dann unter "Fenster > IconAnimator.jsx" öffnen.

    Eigenes Logo:
    Einfach assets/logo.png durch dein eigenes Titel-Logo ersetzen
    (PNG, empfohlen ca. 340 x 72 px, transparenter Hintergrund geht).

    Benutzung:
    Komposition öffnen, Icon-Ebene auswählen (sonst wird die oberste
    Ebene genommen), Skalierung einstellen, "GENERATE" klicken.
*/

(function iconAnimator(thisObj) {

    var SCRIPT_NAME = "Icon Animator";
    var BASE_DURATION = 1 / 3; // Sekunden bei Geschwindigkeit 1x

    // Farbschema (dunkles Theme)
    var COLOR_BG      = [0.118, 0.125, 0.149]; // Panel-Hintergrund
    var COLOR_CARD    = [0.157, 0.165, 0.196]; // Gruppen-Hintergrund
    var COLOR_TEXT    = [0.92, 0.93, 0.95];
    var COLOR_MUTED   = [0.58, 0.60, 0.66];
    var COLOR_ACCENT  = [1.0, 0.48, 0.35];     // Orange (Generate-Button)
    var COLOR_ACCENT2 = [1.0, 0.60, 0.40];     // Orange hell (Hover)

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

    // Sucht das Titel-Logo neben der Skriptdatei
    function findLogoFile() {
        try {
            var scriptFile = new File($.fileName);
            var folder = scriptFile.parent;
            var candidates = [
                new File(folder.fsName + "/assets/logo.png"),
                new File(folder.fsName + "/logo.png"),
                new File(folder.fsName + "/IconAnimator_logo.png")
            ];
            for (var i = 0; i < candidates.length; i++) {
                if (candidates[i].exists) return candidates[i];
            }
        } catch (e) {}
        return null;
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
    // GUI-Bausteine
    // ---------------------------------------------------------------

    function setBg(ctrl, color) {
        try {
            ctrl.graphics.backgroundColor = ctrl.graphics.newBrush(
                ctrl.graphics.BrushType.SOLID_COLOR, color);
        } catch (e) {}
    }

    function setFg(ctrl, color) {
        try {
            ctrl.graphics.foregroundColor = ctrl.graphics.newPen(
                ctrl.graphics.PenType.SOLID_COLOR, color, 1);
        } catch (e) {}
    }

    // Abschnitts-Karte mit kleiner Überschrift
    function addCard(parent, title) {
        var card = parent.add("group");
        card.orientation = "column";
        card.alignChildren = ["fill", "top"];
        card.margins = [12, 10, 12, 12];
        card.spacing = 6;
        setBg(card, COLOR_CARD);

        var label = card.add("statictext", undefined, title.toUpperCase());
        setFg(label, COLOR_MUTED);
        return card;
    }

    // Custom gezeichneter, farbiger Button
    function addFancyButton(parent, text) {
        var btn = parent.add("button", undefined, text);
        btn.preferredSize.height = 42;
        btn.fillColor = COLOR_ACCENT;

        btn.onDraw = function () {
            var g = this.graphics;
            var w = this.size.width;
            var h = this.size.height;
            var color = this.fillColor;

            var brush = g.newBrush(g.BrushType.SOLID_COLOR, color);
            g.newPath();
            g.rectPath(0, 0, w, h);
            g.fillPath(brush);

            var textPen = g.newPen(g.PenType.SOLID_COLOR, [0.10, 0.06, 0.04], 1);
            var font = ScriptUI.newFont(g.font.name, ScriptUI.FontStyle.BOLD, 15);
            var size = g.measureString(this.text, font);
            g.drawString(
                this.text,
                textPen,
                (w - size.width) / 2,
                (h - size.height) / 2,
                font
            );
        };

        // Hover-Effekt
        btn.addEventListener("mouseover", function () {
            btn.fillColor = COLOR_ACCENT2;
            btn.notify("onDraw");
        });
        btn.addEventListener("mouseout", function () {
            btn.fillColor = COLOR_ACCENT;
            btn.notify("onDraw");
        });

        return btn;
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
        pal.spacing = 10;
        pal.margins = 14;
        setBg(pal, COLOR_BG);

        // --- Logo-Header ---
        var logoFile = findLogoFile();
        if (logoFile) {
            var logo = pal.add("image", undefined, logoFile);
            logo.alignment = ["center", "top"];
        } else {
            var titleGrp = pal.add("group");
            titleGrp.orientation = "column";
            titleGrp.alignChildren = ["center", "top"];
            titleGrp.spacing = 2;
            var title = titleGrp.add("statictext", undefined, SCRIPT_NAME);
            setFg(title, COLOR_TEXT);
            var sub = titleGrp.add("statictext", undefined, "random stutter paths");
            setFg(sub, COLOR_MUTED);
        }

        // --- Skalierung ---
        var scaleCard = addCard(pal, "Skalierung");
        var scaleRow = scaleCard.add("group");
        scaleRow.orientation = "row";
        scaleRow.alignChildren = ["fill", "center"];

        var scaleSlider = scaleRow.add("slider", undefined, 100, 1, 400);
        scaleSlider.preferredSize.width = 180;
        var scaleText = scaleRow.add("edittext", undefined, "100");
        scaleText.characters = 5;
        var scalePct = scaleRow.add("statictext", undefined, "%");
        setFg(scalePct, COLOR_TEXT);

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
        var speedCard = addCard(pal, "Geschwindigkeit");
        var speedRow = speedCard.add("group");
        speedRow.orientation = "row";
        speedRow.alignChildren = ["fill", "center"];

        var speedSlider = speedRow.add("slider", undefined, 1, 0.1, 3);
        speedSlider.preferredSize.width = 180;
        var speedText = speedRow.add("edittext", undefined, "1.0");
        speedText.characters = 5;
        var speedX = speedRow.add("statictext", undefined, "x");
        setFg(speedX, COLOR_TEXT);

        var durLabel = speedCard.add("statictext", undefined, "");
        setFg(durLabel, COLOR_MUTED);

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

        // --- Sprünge ---
        var animCard = addCard(pal, "Animation");
        var stepsRow = animCard.add("group");
        stepsRow.orientation = "row";
        stepsRow.alignChildren = ["left", "center"];
        stepsRow.spacing = 6;

        var stepsLabel = stepsRow.add("statictext", undefined, "Sprünge:");
        setFg(stepsLabel, COLOR_TEXT);
        var stepsText = stepsRow.add("edittext", undefined, "3");
        stepsText.characters = 3;

        // --- Generate ---
        var genBtn = addFancyButton(pal, "GENERATE");

        genBtn.onClick = function () {
            var scaleVal = parseFloat(scaleText.text);
            if (isNaN(scaleVal) || scaleVal <= 0) scaleVal = 100;

            var steps = parseInt(stepsText.text, 10);
            if (isNaN(steps) || steps < 1) steps = 3;

            generateAnimation(scaleVal, currentDuration(), steps);
        };

        var hint = pal.add("statictext", undefined,
            "Icon-Ebene auswählen, dann GENERATE klicken.", { multiline: true });
        setFg(hint, COLOR_MUTED);

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
