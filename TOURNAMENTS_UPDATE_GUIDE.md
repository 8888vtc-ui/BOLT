# 🔧 Guide de Mise à Jour - Tournaments.tsx

## Modifications à Appliquer Manuellement

Le fichier `src/pages/Tournaments.tsx` doit être mis à jour pour utiliser le hook `useTournaments`.

---

## 1. Imports à Ajouter

```typescript
// Ajouter ces imports en haut du fichier
import { useTournaments } from '../hooks/useTournaments';
import { useAuth } from '../hooks/useAuth';
import { Loader2 } from 'lucide-react'; // Ajouter à la ligne existante
```

---

## 2. Remplacer les Données Mockées

**SUPPRIMER** les tableaux `tournaments` et `myTournaments` (lignes 10-76)

**REMPLACER PAR** :

```typescript
export default function Tournaments() {
  const { user } = useAuth();
  const {
    tournaments,
    myTournaments,
    loading,
    error,
    createTournament,
    registerForTournament
  } = useTournaments();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 3 | 5 | 7 | 11>('all');
  const [registering, setRegistering] = useState<string | null>(null);

  // Helper functions
  const formatStatus = (status: string) => {
    const statusMap: Record<string, string> = {
      'registration': 'Inscription ouverte',
      'in_progress': 'En cours',
      'completed': 'Terminé',
      'cancelled': 'Annulé'
    };
    return statusMap[status] || status;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (days > 1) return `Dans ${days} jours`;
    if (days === 1) return 'Demain';
    if (hours > 0) return `Dans ${hours}h`;
    if (hours === 0) return "Aujourd'hui";
    return 'Bientôt';
  };

  const formatFormat = (format: string) => {
    const formatMap: Record<string, string> = {
      'single_elimination': 'Élimination directe',
      'double_elimination': 'Double Élimination',
      'swiss': 'Swiss System',
      'round_robin': 'Round Robin'
    };
    return formatMap[format] || format;
  };
```

---

## 3. Mettre à Jour les Categories

**REMPLACER** :
```typescript
const categories = [
  { value: 'all' as const, label: 'Tous', count: tournaments.length },
  { value: 3 as const, label: '3 Points', count: tournaments.filter(t => t.matchLength === 3).length },
  // ...
];
```

**PAR** :
```typescript
const categories = [
  { value: 'all' as const, label: 'Tous', count: tournaments.length },
  { value: 3 as const, label: '3 Points', count: tournaments.filter(t => t.match_length === 3).length },
  { value: 5 as const, label: '5 Points', count: tournaments.filter(t => t.match_length === 5).length },
  { value: 7 as const, label: '7 Points', count: tournaments.filter(t => t.match_length === 7).length },
  { value: 11 as const, label: '11 Points', count: tournaments.filter(t => t.match_length === 11).length },
];
```

---

## 4. Mettre à Jour filteredTournaments

**REMPLACER** :
```typescript
const filteredTournaments = selectedCategory === 'all'
  ? tournaments
  : tournaments.filter(t => t.matchLength === selectedCategory);
```

**PAR** :
```typescript
const filteredTournaments = selectedCategory === 'all'
  ? tournaments
  : tournaments.filter(t => t.match_length === selectedCategory);
```

---

## 5. Remplacer handleCreateTournament

**REMPLACER** :
```typescript
const handleCreateTournament = (config: TournamentConfig) => {
  console.log('Creating tournament:', config);
  // TODO: Implement tournament creation logic
  alert(`Tournoi "${config.name}" créé avec succès !`);
};
```

**PAR** :
```typescript
const handleCreateTournament = async (config: TournamentConfig) => {
  try {
    await createTournament({
      name: config.name,
      description: config.description,
      format: config.format as any,
      match_length: config.matchLength as any,
      max_players: config.maxPlayers as any,
      start_date: config.startDate,
      registration_deadline: config.registrationDeadline,
      prize_pool: config.prizePool,
      entry_fee: config.entryFee,
      crawford_rule: config.crawfordRule,
      jacoby_rule: config.jacobyRule,
      allow_late_registration: config.allowLateRegistration
    });

    setShowCreateModal(false);
    alert(`Tournoi "${config.name}" créé avec succès !`);
  } catch (err: any) {
    alert(`Erreur lors de la création : ${err.message}`);
  }
};
```

---

## 6. Ajouter handleRegister

**AJOUTER APRÈS handleCreateTournament** :

```typescript
const handleRegister = async (tournamentId: string) => {
  if (!user) {
    alert('Vous devez être connecté pour vous inscrire');
    return;
  }

  setRegistering(tournamentId);
  try {
    await registerForTournament(tournamentId);
    alert('Inscription réussie !');
  } catch (err: any) {
    alert(`Erreur : ${err.message}`);
  } finally {
    setRegistering(null);
  }
};
```

---

## 7. Ajouter Loading et Error States

**AJOUTER AVANT le return principal** :

```typescript
if (loading) {
  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-12 h-12 text-[#FFD700] animate-spin mx-auto mb-4" />
        <p className="text-gray-400">Chargement des tournois...</p>
      </div>
    </div>
  );
}

if (error) {
  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center">
      <div className="text-center">
        <p className="text-red-400 mb-4">Erreur : {error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-[#FFD700] text-black font-bold rounded-xl hover:scale-105 transition-transform"
        >
          Réessayer
        </button>
      </div>
    </div>
  );
}
```

---

## 8. Mettre à Jour l'Affichage des Tournois

Dans la section "Available Tournaments", **REMPLACER** les propriétés :

```typescript
// Ancien
{tournament.players}/{tournament.maxPlayers}
{tournament.startDate}
{tournament.format}
{tournament.status}
{tournament.prize}
{tournament.entryFee}
{tournament.matchLength}

// Nouveau
{tournament.participants_count || 0}/{tournament.max_players}
{formatDate(tournament.start_date)}
{formatFormat(tournament.format)}
{formatStatus(tournament.status)}
🏆 {tournament.prize_pool} Points
{tournament.entry_fee === 0 ? 'Gratuit' : `${tournament.entry_fee} Points`}
{tournament.match_length} Points
```

---

## 9. Mettre à Jour le Bouton d'Inscription

**REMPLACER** le bouton "S'inscrire" (ligne ~260) :

```typescript
<button
  onClick={() => handleRegister(tournament.id)}
  disabled={tournament.status !== 'registration' || registering === tournament.id}
  className={`w-full py-4 rounded-xl font-black text-lg transition-all flex items-center justify-center gap-2 ${
    tournament.status !== 'registration' || registering === tournament.id
      ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
      : tournament.is_registered
      ? 'bg-green-600 text-white'
      : 'bg-gradient-to-r from-[#FFD700] to-[#FDB931] text-black hover:scale-[1.02] shadow-[0_0_20px_rgba(255,215,0,0.3)]'
  }`}
>
  {registering === tournament.id ? (
    <>
      <Loader2 className="w-5 h-5 animate-spin" />
      Inscription...
    </>
  ) : tournament.is_registered ? (
    '✓ Inscrit'
  ) : tournament.status !== 'registration' ? (
    'Inscriptions fermées'
  ) : (
    <>
      S'inscrire
      <ChevronRight className="w-5 h-5" />
    </>
  )}
</button>
```

---

## 10. Mettre à Jour "Mes Tournois"

Dans la section "My Tournaments", **REMPLACER** :

```typescript
{myTournaments.map((tournament, index) => (
  <div key={index} className="...">
    <h3>{tournament.name}</h3>
    <div>{tournament.round}</div>
    <div>{tournament.nextMatch}</div>
  </div>
))}
```

**PAR** :

```typescript
{myTournaments.map((tournament) => (
  <div key={tournament.id} className="...">
    <h3>{tournament.name}</h3>
    <div>{tournament.my_status === 'active' ? 'En cours' : 'Inscrit'}</div>
    <div>{formatDate(tournament.start_date)}</div>
  </div>
))}
```

---

## ✅ Checklist de Vérification

Après les modifications :

- [ ] Imports ajoutés
- [ ] Hook useTournaments utilisé
- [ ] Données mockées supprimées
- [ ] Helper functions ajoutées
- [ ] handleCreateTournament mis à jour
- [ ] handleRegister ajouté
- [ ] Loading state ajouté
- [ ] Error state ajouté
- [ ] Affichage des tournois mis à jour
- [ ] Bouton d'inscription mis à jour
- [ ] "Mes Tournois" mis à jour
- [ ] Pas d'erreurs TypeScript
- [ ] Build passe

---

## 🧪 Tests à Effectuer

1. **Charger la page** → Doit afficher un loader puis les tournois
2. **Créer un tournoi** → Doit apparaître dans la liste
3. **S'inscrire** → Doit apparaître dans "Mes Tournois"
4. **Filtrer par catégorie** → Doit fonctionner
5. **Temps réel** → Les changements doivent se refléter automatiquement

---

**Note** : Ces modifications transforment la page d'un prototype avec données mockées en une application fonctionnelle connectée à Supabase !
