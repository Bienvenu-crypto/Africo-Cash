# Africo Cash — Portefeuille numérique (MVP)

Site web complet pour **Africo Cash by Africo Group**, construit avec **Next.js (App Router)** et **SQLite** (better-sqlite3), conforme au cahier des charges fourni (MVP_AFRICO.docx).

## Démarrage

```bash
npm install
npm run dev
```

Ouvrez http://localhost:3000

Pour un build de production :

```bash
npm run build
npm start
```

La base de données SQLite se crée automatiquement au premier démarrage dans `data/africocash.db` (tables clients, agents, guichets, banks, transactions, config).

## Pages

- `/` — Accueil
- `/a-propos`, `/services`, `/comment-ca-marche`, `/contact` — Pages vitrine
- `/inscription` — Inscription client (5 étapes : identité, profil & contact, KYC + OTP, biométrie (scan facial + signature), génération du numéro à 8 chiffres)
- `/inscription-agent`, `/agents` — Inscription Agent Africo (4 étapes, GPS obligatoire, liaison automatique à la banque partenaire la plus proche)
- `/guichet` — Connexion / configuration d'un Guichet Bancaire (Code Guichet + mot de passe, sans profil nominatif)
- `/portefeuille` — Connexion client (numéro à 8 chiffres + PIN) puis tableau de bord : Retirer, Envoyer, Convertir, Déposer, historique et scoring
- `/mobile-money` — Passerelles Airtel Money, Vodacom M-Pesa, Orange Money, Africell Money
- `/banques` — Passerelles Rawbank, Equity BCDC, TMB, Ecobank, FBNBank DRC (Retirer le cash, Banque vers Africo, Africo vers banque)
- `/paiements` — REGIDESO, SOCODEE, SNEL Virunga, Internet, CANAL+, Africo Market

## Logique métier

Toutes les formules de frais et de flux comptables (retrait, envoi, conversion, dépôts/retraits Mobile Money, passerelles bancaires, paiement de factures) sont implémentées dans `src/app/api/**/route.js`, avec les taux configurables dans la table `config` (voir `src/lib/db.js`).

## Notes de démonstration

- Le scan facial utilise la caméra de l'appareil (`getUserMedia`) avec un bouton de repli « Simuler la capture » si la caméra est indisponible.
- La signature électronique utilise la librairie `signature_pad`.
- Le code OTP est généré et affiché à l'écran pour la démonstration (aucun SMS réel n'est envoyé).
