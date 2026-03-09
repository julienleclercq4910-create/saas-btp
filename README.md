# AtelierFlow MVP (SaaS BTP)

AtelierFlow est un MVP SaaS moderne pour les petites entreprises du batiment (1 a 15 personnes), pense pour un usage terrain + bureau, avec une logique simple et visuelle.

## 1. Synthese produit

- Cible: artisans, renovation, menuiserie, ferronnerie, plomberie, electricite, toiture, etc.
- Promesse: centraliser les operations cle (chantiers, clients, taches, documents, mesures, productivite, abonnement) sans lourdeur ERP.
- Valeur: pilotage quotidien rapide, lisible et actionnable.

## 2. Architecture fonctionnelle

- Authentification:
  - inscription, connexion, deconnexion, reset password
  - creation auto entreprise + membership admin a l'inscription
  - role `admin` et `member`
- Dashboard:
  - KPI: chantiers en cours, taches urgentes, documents, clients
  - derniers chantiers
  - taches du jour
  - widget focus Pomodoro local
- Chantiers:
  - liste + creation
  - fiche detaillee avec synthese + taches + documents + mesures
- Clients:
  - liste + creation
  - fiche detaillee avec chantiers et documents lies
- Taches:
  - liste + creation
  - filtres simples par priorite/statut
- Documents:
  - upload vers Supabase Storage
  - listing, filtre type, lien apercu signe
- Mesures:
  - liste + creation
  - categories metier predefinies
  - fiche detaillee (dimensions + zone prise de cotes + croquis texte)
- Parametres:
  - infos entreprise
  - membres et roles
- Billing:
  - statut abonnement
  - checkout Stripe de base

## 3. Architecture technique

- Frontend: Next.js App Router + React + TypeScript strict
- UI: Tailwind CSS + composants reutilisables (`components/ui`)
- Backend BaaS: Supabase (PostgreSQL + Auth + Storage + RLS)
- Validation: Zod
- Paiement: Stripe (route checkout server)
- Deploy: Vercel + Supabase
- Architecture par modules:
  - `app/(auth)` pages publiques
  - `app/(app)` pages protegees
  - `lib/actions` logique serveur
  - `lib/schemas` validation
  - `lib/queries` data access
  - `supabase/migrations` schema SQL et securite

## 4. Schema base de donnees

Tables principales:

- `profiles`: profil utilisateur (relie a `auth.users`)
- `companies`: entreprise
- `memberships`: lien user <-> entreprise + role
- `clients`: clients entreprise
- `projects`: chantiers
- `tasks`: taches
- `documents`: metadonnees fichiers
- `measurements`: prises de mesures JSON
- `subscriptions`: abonnement Stripe
- `activity_logs`: audit simple

Points de conception:

- UUID partout
- timestamps `created_at`, `updated_at`
- `deleted_at` pour soft delete sur entites metier
- indexes sur `company_id`
- RLS active sur toutes les tables sensibles
- fonction `is_company_member(company_id)` pour centraliser les policies
- bucket storage `documents` + policies liees au `company_id` encode dans le chemin

## 5. Arborescence projet

```txt
app/
  (auth)/login|signup|forgot-password
  (app)/dashboard|projects|clients|tasks|documents|measurements|settings|billing
  api/stripe/checkout/route.ts
components/
  ui/
  layout/
  features/
lib/
  actions/
  schemas/
  auth.ts
  queries.ts
  supabase-*.ts
types/
  domain.ts
supabase/
  migrations/001_init.sql
  seed.sql
```

## 6. Plan d'implementation (realise)

1. Scaffold Next.js + TypeScript + Tailwind
2. Couche auth + contexte entreprise
3. Couche data access + validation Zod
4. Composants UI reutilisables + layout SaaS
5. Pages MVP metier (dashboard/chantiers/clients/taches/documents/mesures)
6. Stripe checkout basique + page billing
7. SQL schema + RLS + seed demo
8. Documentation install/deploy/roadmap

## 7. Code genere (fichiers principaux)

- App shell: `app/layout.tsx`, `app/(app)/layout.tsx`, `components/layout/sidebar.tsx`
- Auth: `app/(auth)/*`, `lib/actions/auth.ts`
- Metier: `app/(app)/*`
- Actions serveur: `lib/actions/index.ts`
- Validation: `lib/schemas/index.ts`
- Data: `lib/queries.ts`, `lib/supabase-server.ts`, `lib/supabase-client.ts`
- Billing Stripe: `app/api/stripe/checkout/route.ts`, `app/(app)/billing/page.tsx`
- DB: `supabase/migrations/001_init.sql`, `supabase/seed.sql`

## 8. Donnees de demonstration (seed)

`supabase/seed.sql` cree:

- 1 entreprise
- 3 clients
- 4 chantiers
- 10 taches
- documents d'exemple
- prises de mesures d'exemple
- 1 abonnement actif

## 9. Installation locale

### Prerequis

- Node.js 20+
- Projet Supabase (local ou cloud)

### Etapes

1. Copier les variables d'environnement:

```bash
cp .env.example .env.local
```

2. Renseigner `.env.local`:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY` (optionnel en MVP)
- `NEXT_PUBLIC_BASE_URL=http://localhost:3000`

3. Installer les dependances:

```bash
npm install
```

4. Appliquer la migration SQL dans Supabase SQL Editor:

- `supabase/migrations/001_init.sql`

5. Charger le seed demo:

- `supabase/seed.sql`

6. Lancer en local:

```bash
npm run dev
```

## 10. Deploiement

### Vercel

1. Importer le repo sur Vercel
2. Ajouter les variables d'environnement identiques a `.env.local`
3. Deploy

### Supabase

1. Executer la migration `001_init.sql`
2. Executer `seed.sql` (optionnel en prod)
3. Verifier bucket `documents` + policies

### Stripe

1. Ajouter `STRIPE_SECRET_KEY`
2. Configurer un webhook (V2 recommande) pour synchroniser `subscriptions`

## 11. Roadmap V2 / V3

### V2

- invitation membres par email
- permissions fines par module
- workflow documents (versioning + validation)
- commentaires et mentions sur chantiers/taches
- webhook Stripe complet + portail client
- export PDF de fiches chantier/mesures

### V3

- planning equipe (drag and drop)
- mode hors ligne terrain + sync differee
- photos annotees sur prises de cotes
- analytics marge chantier et rentabilite
- API publique + connecteurs compta

## Notes MVP

- Le socle est volontairement simple et evolutif.
- Les modules sont reels (pas prototype statique), avec persistance Supabase et securite RLS.
- Le webhook Stripe de synchronisation abonnement est prepare pour une iteration suivante.


