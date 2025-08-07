# Projecta – Projektor-gestütztes Positionierungssystem für Transferpressen

**PProjecta** ist eine webbasierte Anwendung zur präzisen Positionierung von Druckmotiven auf Textilien. Das System nutzt einen Projektor, der über einen Minicomputer (z. B. Raspberry Pi) mit einer Website verbunden ist. Die Positionierungsanweisungen werden live über ein Tablet gesteuert und können gespeichert und wiederverwendet werden.

---

## 🚀 Funktionen

- Live-Projektion von Positionierungshilfen (Linien, Texte, Bilder, Pfeile, Polygone)
- Webbasierter Editor (Tablet-basiert)
- Speicherung & Laden von Layouts
- Kalibrierungsmodus für verschiedene Pressen und Plattengrößen
- Unterstützung für mehrere Layout-Elementtypen
- Unterstützt verschiedene Pressen mit ein oder zwei Platten
- Optional: AR-Interface (in Entwicklung)

---

## 🧱 Systemarchitektur

- **Frontend**: HTML, CSS, Vanilla JavaScript
- **Backend**: PHP (REST-API), SQLite oder MariaDB
- **Hardware**: Raspberry Pi + Beamer (HDMI) + Tablet

---

## 📂 Projektstruktur

pressposition/
│
├── frontend/
│ ├── index.html # Editor (Tablet)
│ ├── projector.html # Anzeige (Beamer)
│ ├── css/
│ └── js/
│
├── backend/
│ ├── api/ # REST-Endpoints
│ ├── db.php # DB-Verbindung
│ └── init.sql # Datenbankstruktur
│
├── data/ # Bild-Uploads, Layout-Daten
├── config.php
└── README.md


---

## 🛠️ Installation

1. Raspberry Pi einrichten (z. B. Raspbian Lite + Apache + PHP)
2. Projektverzeichnis nach `/var/www/html/pressposition/` kopieren
3. Datenbank initialisieren:
   ```bash
   mysql -u root -p < backend/init.sql

    config.php anpassen (Datenbank-Zugang etc.)

    Projektor anschließen und projector.html im Browser im Fullscreen öffnen

    Auf dem Tablet index.html öffnen und Layout bearbeiten

🧪 Kalibrierung

    Layout öffnen

    Kalibriermodus aktivieren

    Vier Punkte auf der Platte anklicken, um Ecken festzulegen

    Layout wird an die Form angepasst

    Kalibrierung speichern (verknüpft mit Pressemuster)

🔐 Sicherheit

    Optionales Login-System in Planung

    Zugriff auf Projektor-Ansicht kann auf IP-Whitelist beschränkt werden

📌 Hinweise

    Keine Cloudbindung notwendig

    Offlinefähig (PWA-Support in Planung)

    Modular aufgebaut – leicht erweiterbar
