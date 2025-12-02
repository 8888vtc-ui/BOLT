import { Home, Swords, Trophy, BarChart3, User, Settings, HelpCircle, LogOut } from 'lucide-react';

export interface MenuItem {
    id: string;
    label: string;
    route?: string;
    icon?: any;
    roles?: string[]; // 'guest', 'user', 'admin'
    children?: MenuItem[];
    action?: string; // For special actions like 'logout'
}

// Menu principal simplifié - 4 éléments max
export const MAIN_MENU: MenuItem[] = [
    {
        id: 'play',
        label: 'JOUER',
        route: '/lobby',
        icon: Swords,
        roles: ['user', 'guest']
    },
    {
        id: 'dashboard',
        label: 'Mon Espace',
        route: '/dashboard',
        icon: Home,
        roles: ['user', 'guest']
    },
    {
        id: 'tournaments',
        label: 'Tournois',
        route: '/tournaments',
        icon: Trophy,
        roles: ['user', 'guest']
    },
    {
        id: 'leaderboard',
        label: 'Classement',
        route: '/leaderboard',
        icon: BarChart3,
        roles: ['user', 'guest']
    }
];

// Menu utilisateur (dropdown)
export const USER_MENU: MenuItem[] = [
    {
        id: 'profile',
        label: 'Mon Profil',
        route: '/profile',
        icon: User,
        roles: ['user', 'guest']
    },
    {
        id: 'settings',
        label: 'Paramètres',
        route: '/settings',
        icon: Settings,
        roles: ['user', 'guest']
    },
    {
        id: 'support',
        label: 'Aide & Support',
        route: '/support',
        icon: HelpCircle,
        roles: ['user', 'guest']
    },
    {
        id: 'logout',
        label: 'Déconnexion',
        action: 'logout',
        icon: LogOut,
        roles: ['user', 'guest']
    }
];
