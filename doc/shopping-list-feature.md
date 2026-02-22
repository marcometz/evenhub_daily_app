# Shopping List Feature

## 1. Ziel und Scope
Das Feature erweitert die TestApp um eine Shopping-Liste fuer EvenHub.

Enthalten:
- Dashboard-Eintrag `Shopping List`
- Einspaltige Liste fuer offene und erledigte Eintraege
- `Click` toggelt offen/erledigt
- Erledigte Eintraege werden automatisch unter offene Eintraege sortiert
- Trennzeile zwischen offenen und erledigten Eintraegen (wenn beide Gruppen vorhanden sind)
- Companion-Config fuer Shopping-Eintraege (Titel + Status)

Nicht enthalten:
- Detailansicht fuer Shopping-Eintraege
- Native iOS-Reminders-Integration
- Externe Synchronisierung (nur vorbereiteter, deaktivierter UI-Button)

## 2. Plan-A-Pruefung (iOS Erinnerungen)
- Direkter Zugriff auf iOS-Erinnerungen ist im aktuellen Stack nicht verfuegbar.
- Das genutzte SDK (`@evenrealities/even_hub_sdk`) bietet hier nur EvenHub-UI, Device/User und LocalStorage.
- Apple Reminders benoetigt EventKit in nativer App-Logik mit Berechtigungen.
- Ergebnis: In dieser WebView/TestApp ohne native Host-Erweiterung kein direkter Reminders-Zugriff.

## 3. User-Flow
1. App startet im Dashboard.
2. `Click` auf `Shopping List` oeffnet die Shopping-Liste.
3. `Up`/`Down` bewegt die Auswahl in der Liste.
4. `Click` toggelt den ausgewaehlten Eintrag zwischen offen und erledigt.
5. Nach Toggle wird die Liste neu sortiert (offen oben, erledigt unten).
6. `DoubleClick` geht zurueck zum Dashboard.

Input-Mapping:
- `Click`: Toggle des selektierten Shopping-Eintrags
- `DoubleClick`: Back
- `Up`/`Down`: Auswahl bewegen

## 4. Datenmodell und Persistenz
Storage:
- Key: `shopping_config_v1`
- Version: `1`

Eintragsschema:
- `id: string`
- `title: string`
- `done: boolean`
- `position: number`

Normalisierung:
- Titel wird getrimmt, leere Titel werden verworfen.
- `done` wird auf bool normalisiert.
- `position` wird auf gueltige nicht-negative Ganzzahl normalisiert.
- IDs werden dedupliziert.

## 5. Listen-Darstellung
Format in der Brillenliste:
- Offen: `"[ ] <titel>"`
- Divider: `"-------- Erledigt --------"` (nur wenn offene und erledigte vorhanden sind)
- Erledigt: `"[x] <titel>"`

Sortierung:
- Primar: offen vor erledigt
- Sekundaer: `position` aufsteigend
- Tertiaer: `title` alphabetisch

## 6. Companion Config UI
Shopping Config Card:
- Eintrag hinzufuegen
- Eintrag loeschen
- Felder pro Eintrag:
  - Titel
  - Status (`offen`/`erledigt`)
- Speichern in EvenHub LocalStorage

Zusatz:
- Sichtbarer, deaktivierter Button:
  - `Offene Todos aus externer Quelle laden`
  - fuer spaetere Integration (z. B. Google Spreadsheet)

## 7. Fehler- und Fallback-Verhalten
- Ladefehler bei vorhandenem In-Memory-Stand: letzter Stand bleibt sichtbar.
- Ladefehler ohne Eintraege: Statuszeile in der Liste.
- Toggle-Fehler: Liste bleibt erhalten, Fehlertext wird angezeigt.

## 8. Testmatrix
Happy-Path:
1. Dashboard oeffnet Shopping-Liste.
2. `Click` toggelt Eintrag.
3. Erledigter Eintrag wandert in den unteren Block.
4. `DoubleClick` geht zurueck.

Edge-Cases:
1. `Up`/`Down` bleibt innerhalb gueltiger Grenzen.
2. `Click` auf Divider/Statuszeile ist no-op.
3. Leere Shopping-Liste zeigt Statuszeile.

Regression:
1. Nach Toggle bleibt die Auswahl gueltig.
2. Erledigte Eintraege bleiben unter dem Divider.

Build-Check:
- `npm --prefix testapp run test`
- `npm --prefix testapp run build`
