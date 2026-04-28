# 🔐 INKRYPT — Vault Chiffrement

![Version](https://img.shields.io/badge/version-1.0.0-00f5c4?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-00a8ff?style=for-the-badge)
![Zero Server](https://img.shields.io/badge/zero--serveur-100%25%20local-blueviolet?style=for-the-badge)

**INKRYPT** est un outil de chiffrement et de prise de notes sécurisées, entièrement local, sans aucune dépendance externe. Tout le traitement se fait dans votre navigateur — aucune donnée n'est jamais transmise.

---

## ⚡ Fonctionnalités

- **Chiffrement AES-256-GCM** : Utilise l'API WebCrypto native du navigateur pour un chiffrement de niveau militaire.
- **Dérivation PBKDF2** : La clé secrète est dérivée avec 250 000 itérations SHA-256 et un sel aléatoire unique à chaque chiffrement.
- **Zero Trace** : Aucune donnée n'est envoyée sur un serveur. Tout se passe localement dans votre navigateur.
- **Notes sécurisées** : Créez, organisez et sauvegardez des notes dans des dossiers, stockées en localStorage.
- **UI Cyberpunk** : Interface immersive avec fond Matrix animé, grille dynamique et animations réactives.
- **Indicateur de force** : Barre de force du mot de passe en temps réel.
- **Sidebar collapsible** : Navigation rétractable entre les sections Chiffrement et Notes.

---

## 🛠 Stack Technique

- **HTML5 / CSS3** : Design sur mesure avec variables CSS, keyframes et backdrop-blur.
- **JavaScript ES6+** : Architecture modulaire, logique de chiffrement asynchrone via WebCrypto API.
- **Aucune dépendance externe** : Pas de librairie, pas de framework, pas de CDN.

---

## 📁 Structure du projet

```
Inkrypt/
├── index.html          # Structure HTML principale
├── style.css           # Styles et thème Cyberpunk
├── assets/             # Favicons et ressources statiques
└── js/
    ├── matrix.js       # Animation fond Matrix (canvas)
    ├── crypt.js        # Chiffrement / Déchiffrement AES-256-GCM
    ├── obsidian.js     # Gestion des notes (CRUD + arbre de fichiers)
    └── app.js          # Navigation, sidebar, initialisation globale
```

---

## 🚀 Utilisation

1. Clonez le dépôt :
   ```bash
   git clone https://github.com/ZMTexe/Inkrypt.git
   ```
2. Ouvrez `index.html` dans n'importe quel navigateur moderne (Chrome, Firefox, Edge).
3. Aucune installation requise — aucun `npm install`, aucun serveur.

### Chiffrer un message
1. Entrez votre texte dans **MESSAGE SOURCE**.
2. Entrez une clé secrète robuste (min. 8 caractères).
3. Cliquez sur **CHIFFRER** — le résultat encodé en Base64 apparaît.
4. Copiez le résultat avec le bouton **Copier**.

### Déchiffrer un message
1. Collez le texte chiffré (Base64) dans **MESSAGE SOURCE**.
2. Entrez la même clé secrète utilisée lors du chiffrement.
3. Cliquez sur **DÉCHIFFRER**.

### Notes sécurisées
1. Accédez à la section **Notes** via la sidebar.
2. Créez un **Dossier** ou une **Note** directement.
3. Éditez le titre et le contenu, puis cliquez sur **Sauvegarder**.
4. Les notes sont stockées dans le localStorage de votre navigateur.

---

## 🔒 Sécurité

> [!IMPORTANT]
> INKRYPT utilise l'algorithme **AES-GCM** avec une dérivation de clé **PBKDF2** (250 000 itérations, SHA-256) et un **sel + IV aléatoires** générés à chaque opération. La sécurité finale dépend de la robustesse de votre clé secrète.

| Paramètre | Valeur |
|-----------|--------|
| Algorithme | AES-256-GCM |
| Dérivation | PBKDF2 |
| Itérations | 250 000 |
| Hash | SHA-256 |
| Sel | 16 bytes aléatoires |
| IV | 12 bytes aléatoires |
| Encodage sortie | Base64 |

---

## 📋 Compatibilité

Fonctionne sur tout navigateur supportant l'API **WebCrypto** (disponible nativement depuis 2017) :

| Navigateur | Support |
|------------|--------|
| Chrome 37+ | ✅ |
| Firefox 34+ | ✅ |
| Edge 12+ | ✅ |
| Safari 11+ | ✅ |
| Opera 24+ | ✅ |

> ⚠️ L'API WebCrypto nécessite un contexte sécurisé : `https://` ou `localhost`. Elle ne fonctionne pas sur `http://`.

---

## 📜 Licence

MIT — Voir le fichier [LICENSE](LICENSE) pour les détails.

---

*Inkrypt · Tout le traitement est local · Aucune donnée transmise · Par Fego.exe*
