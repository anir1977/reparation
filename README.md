# Ben Daoud Réparation

Application interne de gestion des réparations de bijoux.

Stack:
- Next.js (App Router) + TypeScript
- Tailwind CSS
- Supabase (PostgreSQL + Auth + Storage)

## Fonctionnalités livrées

- Authentification Supabase (connexion email/mot de passe)
- Rôles: admin / employé (via table `app.profiles`)
- Gestion des utilisateurs (page `/utilisateurs`, admin only)
- Gestion des réparations avec plusieurs bijoux par réparation
- Upload de photos multiples par bijou (bucket `bijoux-photos`)
- CRUD réparation (création, modification, suppression)
- Pages métier:
	- `/login`
	- `/dashboard`
	- `/nouvelle-reparation`
	- `/reparations-en-cours`
	- `/reparations-pretes`
	- `/historique`
	- `/statistiques`
- Structure prête pour intégration:
	- génération PDF
	- notification WhatsApp

## Mise en place

1. Installer les dépendances:

```bash
npm install
```

2. Configurer les variables d’environnement:

```bash
cp .env.example .env.local
```

Renseigner:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (obligatoire pour création users admin-only)

3. Dans Supabase SQL Editor, exécuter:

- `supabase/schema.sql`
- `supabase/seed_demo.sql` (optionnel, pour charger des exemples)

Ce script crée:
- le schéma `app`
- les tables (`profiles`, `clients`, `reparations`, `bijoux`, `bijou_photos`)
- les enums métier
- les triggers/indices
- les policies RLS
- le bucket Storage `bijoux-photos`

4. Créer les utilisateurs employés/admin dans Supabase Auth.

Pour un admin, définir `raw_app_meta_data.role = "admin"`.

## Lancer l’application

```bash
npm run dev
```

Application disponible sur `http://localhost:3000`.

## Données démo (dashboard + analytics)

Pour voir rapidement des chiffres dans le dashboard et la page statistiques:

1. Ouvrir Supabase SQL Editor
2. Exécuter `supabase/seed_demo.sql`
3. Recharger l’application (`/dashboard` et `/statistiques`)

Le script est idempotent: vous pouvez le relancer, il réinitialise puis recharge les données démo.

## Structure projet

- `supabase/schema.sql`: base de données + sécurité + bucket
- `supabase/seed_demo.sql`: données de démonstration
- `src/lib/supabase/*`: clients Supabase browser/server/middleware
- `src/lib/reparations.ts`: requêtes métier
- `src/app/actions/reparations.ts`: actions serveur (suppression)
- `src/components/*`: UI modulaire (shell, formulaires, tableaux)
- `src/lib/integrations/*`: stubs PDF/WhatsApp
