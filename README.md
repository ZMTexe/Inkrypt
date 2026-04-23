# 🔐 INKRYPT — Suite de Sécurité Cyberpunk

![Version](https://img.shields.io/badge/version-1.0.0-00f5c4?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-00a8ff?style=for-the-badge)

**INKRYPT** est une interface de chiffrement ultra-rapide basée sur le web, conçue avec une esthétique Cyberpunk/Dark-Tech. Elle permet de protéger vos messages et fichiers en utilisant des standards de chiffrement de niveau militaire directement dans votre navigateur.

---

## ⚡ Caractéristiques

* **Chiffrement AES-256-GCM** : Utilise l'API WebCrypto native pour une sécurité maximale sans dépendances externes.
* **Zero Trace** : Rien n'est envoyé sur un serveur. Tout se passe localement sur votre machine.
* **Mode Fichier** : Chiffrez et déchiffrez des fichiers directement par glisser-déposer.
* **UI Cyberpunk** : Interface immersive avec effets de matrice, grille dynamique et animations réactives.
* **QR Code** : Génération automatique de QR Codes pour partager vos messages chiffrés.

---

## 🛠️ Stack Technique

* **HTML5 / CSS3** : Design sur mesure avec variables CSS et animations complexes.
* **JavaScript (ES6+)** : Logique de chiffrement asynchrone (WebCrypto API).
* **QRCode.js** : Librairie légère pour la génération de codes.

---

## 🚀 Installation & Utilisation

1.  Clonez le dépôt :
    ```bash
    git clone [https://github.com/VOTRE_PSEUDO/inkrypt.git](https://github.com/VOTRE_PSEUDO/inkrypt.git)
    ```
2.  Ouvrez `index.html` dans n'importe quel navigateur moderne.
3.  Entrez votre message, une clé secrète, et cliquez sur **CHIFFRER**.

---

## 🔒 Sécurité

> [!IMPORTANT]  
> INKRYPT utilise l'algorithme **AES-GCM** avec une dérivation de clé **PBKDF2**. Bien que l'outil soit techniquement robuste, la sécurité finale dépend de la force de votre mot de passe (clé secrète).

---

## 🎨 Personnalisation

Le projet utilise des variables racines pour le thème. Vous pouvez modifier les couleurs dans le fichier `style.css` :

```css
:root {
  --accent: #00f5c4; /* Couleur néon principale */
  --bg:     #080b10; /* Fond sombre */
}
