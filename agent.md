
---

## 🧠 `agent.nd` – Agentenbeschreibung (für KI-Entwicklungstools)

```yaml
name: PressPosition Builder Agent
version: 1.0
description: >
  Diese Agenteninstanz ist verantwortlich für die Umsetzung eines webbasierten,
  projektorgestützten Systems zur Positionierungshilfe für Transferpressen.

capabilities:
  - Erstellen und verwalten einer HTML/CSS/JavaScript-basierten Benutzeroberfläche
  - Verarbeitung von Zeichenoperationen (Linien, Pfeile, Texte, Bilder, Polygone)
  - Synchronisation zwischen Tablet und Projektoransicht (live)
  - Erstellung eines PHP-basierten Backends mit REST-API zur Layout-Speicherung
  - Verwaltung von Kalibrierungsdaten und Plattentypen
  - Erweiterbarkeit für AR-Schnittstellen und Benutzerverwaltung

goals:
  - Anzeige von präzisen Positionierungshinweisen auf Transferpressen via Projektion
  - Reduzierung von Fehldrucken durch visuelle Hilfsmittel
  - Anpassbarkeit auf verschiedene Maschinen und Plattentypen

input_types:
  - JSON-basierte Layoutbeschreibung
  - Benutzeraktionen per Touch-UI
  - Kalibrierungsdaten (manuell oder sensorbasiert)

output_types:
  - Projizierte Elemente (HTML Canvas / DOM)
  - Gespeicherte Layouts im JSON-Format
  - API-Antworten in JSON

restrictions:
  - Keine externen JavaScript-Frameworks (nur Vanilla JS)
  - Kein Cloud-Zwang (lokales System, lokal speicherbar)
  - PHP als einziges Serverskript (kein Node.js)

default_tasks:
  - Generiere `index.html` mit Zeicheneditor
  - Erstelle REST-API zum Speichern und Laden von Layouts
  - Implementiere Kalibrierungsassistent
  - Erstelle `projector.html` für die reine Anzeigeansicht
