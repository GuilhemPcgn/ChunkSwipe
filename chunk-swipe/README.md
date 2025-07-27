# ChunkSwipe - Application de Validation de Données

Une application moderne de validation de chunks de données avec interface swipe, construite avec Next.js, Supabase et Framer Motion.

## Fonctionnalités

- 🔐 **Authentification complète** avec Supabase
- 🎯 **Interface swipe intuitive** pour valider/rejeter les données
- 📱 **Design responsive** et moderne
- ⚡ **Performance optimisée** avec Next.js 15
- 🎨 **Animations fluides** avec Framer Motion
- 🔄 **Synchronisation en temps réel** avec Supabase

## Configuration

### Prérequis

- Node.js 18+ 
- Compte Supabase

### Installation

1. **Cloner le projet**
```bash
git clone <votre-repo>
cd chunk-swipe
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configuration Supabase**

Créez un projet Supabase et configurez les variables d'environnement :

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=votre_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_clé_anon_supabase
```

4. **Configuration de la base de données**

**Option A : Utiliser le script SQL (Recommandé)**
- Ouvrez votre projet Supabase
- Allez dans l'éditeur SQL
- Copiez et exécutez le contenu du fichier `supabase-setup.sql`

**Option B : Créer manuellement**
Créez une table `chunks` dans Supabase avec la structure suivante :

```sql
CREATE TABLE chunks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT NOT NULL,
  rejected BOOLEAN DEFAULT FALSE,
  validated BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

5. **Configuration de l'authentification**

Dans votre projet Supabase :
- Activez l'authentification par email/mot de passe
- Configurez les redirections d'URL (optionnel)
- Activez la confirmation d'email (recommandé)

### Démarrage

```bash
npm run dev
```

L'application sera accessible sur `http://localhost:3000`

## Utilisation

### Authentification

1. **Première visite** : Vous serez redirigé vers la page de login
2. **Créer un compte** : Utilisez le bouton "Créer un compte" ou connectez-vous directement
3. **Validation d'email** : Vérifiez votre email pour confirmer votre compte (si activé)

### Validation des données

1. **Interface swipe** : Glissez les cartes à droite pour valider, à gauche pour rejeter
2. **Boutons** : Utilisez les boutons "Valider" et "Rejeter" en bas de l'écran
3. **Progression** : Suivez votre progression avec la barre en bas de chaque carte
4. **Déconnexion** : Utilisez le bouton "Déconnexion" en haut à droite

## Architecture

### Structure des fichiers

```
src/
├── app/
│   ├── login/
│   │   └── page.tsx          # Page de connexion
│   ├── layout.tsx            # Layout principal avec AuthProvider
│   └── page.tsx              # Page principale de validation
├── components/
│   ├── AuthProvider.tsx      # Provider d'authentification
│   └── ProtectedRoute.tsx    # Protection des routes
└── lib/
    ├── supabase-client.ts    # Client Supabase côté client
    └── supabase-server.ts    # Client Supabase côté serveur
```

### Composants clés

- **AuthProvider** : Gère l'état d'authentification global
- **ProtectedRoute** : Protège les pages nécessitant une authentification
- **ValidationPage** : Interface principale de validation avec swipe

### Middleware

Le middleware (`middleware.ts`) gère :
- La vérification de l'authentification
- Les redirections automatiques
- La gestion des cookies de session

## Sécurité

- ✅ **Protection des routes** : Toutes les pages sont protégées sauf `/login`
- ✅ **Gestion des sessions** : Sessions sécurisées avec Supabase
- ✅ **Validation côté serveur** : Middleware pour vérifier l'authentification
- ✅ **Variables d'environnement** : Clés sensibles protégées

## Déploiement

### Vercel (Recommandé)

1. Connectez votre repo GitHub à Vercel
2. Configurez les variables d'environnement dans Vercel
3. Déployez automatiquement

### Autres plateformes

L'application peut être déployée sur n'importe quelle plateforme supportant Next.js.

## Développement

### Scripts disponibles

```bash
npm run dev          # Démarrage en mode développement
npm run build        # Build de production
npm run start        # Démarrage en mode production
npm run lint         # Vérification du code
```

### Technologies utilisées

- **Next.js 15** : Framework React avec App Router
- **Supabase** : Backend-as-a-Service (auth + database)
- **Framer Motion** : Animations et interactions
- **Tailwind CSS** : Styling utilitaire
- **TypeScript** : Typage statique
- **Lucide React** : Icônes

## Support

Pour toute question ou problème :
1. Vérifiez la configuration Supabase
2. Consultez les logs de la console
3. Vérifiez les variables d'environnement

## Licence

MIT License
