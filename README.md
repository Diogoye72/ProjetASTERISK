## ✅ 1. Activer le module CDR CSV

Ouvre le fichier `cdr.conf` :

```bash
sudo nano /etc/asterisk/cdr.conf
```

Et assure-toi qu’il contient ceci (ou ajoute-le) :

```ini
[general]
enable=yes
```

---

## ✅ 2. Configurer le module `cdr_csv`

Édite le fichier :

```bash
sudo nano /etc/asterisk/cdr_csv.conf
```

Et vérifie qu’il contient par défaut ceci :

```ini
[general]
loguniqueid=yes
loguserfield=yes
accountlogs=yes
```

Tu peux personnaliser si tu veux un autre nom que `Master.csv`.

---

## ✅ 3. Redémarrer Asterisk

Après modification des fichiers de configuration :

```bash
sudo systemctl restart asterisk
```

---

## ✅ 4. Vérifie la présence du fichier

Le fichier devrait être automatiquement généré à chaque appel dans :

```bash
/var/log/asterisk/cdr-csv/Master.csv
```

Teste en passant un appel, puis regarde :

```bash
cat /var/log/asterisk/cdr-csv/Master.csv
```

---

## ⚠️ Problèmes courants

### 🛑 Le fichier `Master.csv` n’est pas créé ?

* Vérifie que le module est bien chargé :

  ```bash
  sudo asterisk -rvvv
  module show like cdr_csv
  ```

  S'il ne s'affiche pas, charge-le :

  ```bash
  module load cdr_csv.so
  ```

* Si besoin, force son chargement au démarrage :

  ```bash
  sudo nano /etc/asterisk/modules.conf
  ```

  Et ajoute :

  ```
  load => cdr_csv.so
  ```

---

## 📦 Bonus : Créer manuellement le dossier et le fichier (si nécessaire)

Si le dossier `/var/log/asterisk/cdr-csv/` n’existe pas :

```bash
sudo mkdir -p /var/log/asterisk/cdr-csv
sudo chown asterisk:asterisk /var/log/asterisk/cdr-csv
```

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- 
# ProjetASTERISK
