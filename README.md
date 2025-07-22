# 🌳 Dynamic Binary Genealogy Tree Viewer (PHP Backend)

This project implements a dynamic binary genealogy tree with a simple PHP backend serving the JSON data and rendering the tree view.

## 🧩 Key Features

- Tree data loaded from backend PHP controller (`TreeController.php`).
- JSON tree data stored in `public/data/tree.json`.
- Frontend tree rendering with expand/collapse and mobile support.
- Search, hover info, and parent navigation.
- Simple MVC structure with controller and view.

---

## 🚀 Requirements

- PHP 7.4+ installed on your machine or server.
- Web server capable of running PHP (Apache, Nginx, or built-in PHP server).
- File structure:
  - `app/Controllers/TreeController.php` — loads JSON and includes view.
  - `public/data/tree.json` — contains the tree data in JSON format.
  - `app/Views/tree.php` — contains the HTML + JS tree rendering code.
  - `public/index.php` — front controller loading the TreeController.

---

## ⚙️ How to run locally

1. Clone or download this repository.
2. Make sure your `public/data/tree.json` file exists with valid JSON tree data.
3. From the project root, start PHP built-in server (example):
   ```bash
   php -S localhost:8000 -t public


📂 File structure overview
project-root/
├── app/
│   ├── Controllers/
│   │   └── TreeController.php
│   └── Views/
│       └── tree.php
├── public/
│   ├── data/
│   │   └── tree.json
│   └── index.php
