const API_URL = import.meta.env.VITE_API_URL || 'https://gurugammon.onrender.com';

class GurugammonAPI {
  private getHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'API request failed');
    }

    return data;
  }

  async guestLogin() {
    return this.request('/api/auth/guest-login', { method: 'POST' });
  }

  async clerkLogin(token: string, email: string, username: string) {
    return this.request('/api/auth/clerk-login', {
      method: 'POST',
      body: JSON.stringify({ token, email, username }),
    });
  }

  async createGame(gameMode: string = 'AI_VS_PLAYER', stake: number = 0) {
    return this.request('/api/games', {
      method: 'POST',
      body: JSON.stringify({ game_mode: gameMode, stake }),
    });
  }

  async getGame(gameId: string) {
    return this.request(`/api/games/${gameId}/status`);
  }

  async joinGame(gameId: string) {
    return this.request(`/api/games/${gameId}/join`, { method: 'POST' });
  }

  async rollDice(gameId: string) {
    return this.request(`/api/games/${gameId}/roll`, { method: 'POST' });
  }

  async makeMove(gameId: string, from: number, to: number, diceUsed: number) {
    return this.request(`/api/games/${gameId}/move`, {
      method: 'POST',
      body: JSON.stringify({ from, to, diceUsed }),
    });
  }

  async resign(gameId: string, resignationType: 'SINGLE' | 'GAMMON' | 'BACKGAMMON' = 'SINGLE') {
    return this.request(`/api/games/${gameId}/resign`, {
      method: 'POST',
      body: JSON.stringify({ resignationType }),
    });
  }

  async getCoachAdvice(gameId: string) {
    return this.request(`/api/games/${gameId}/coach`, { method: 'POST' });
  }

  async getSuggestions(gameId: string) {
    return this.request(`/api/games/${gameId}/suggestions`, { method: 'POST' });
  }

  async evaluatePosition(gameId: string) {
    return this.request(`/api/games/${gameId}/evaluate`, { method: 'POST' });
  }

  async doubleCube(gameId: string) {
    return this.request(`/api/games/${gameId}/cube/double`, { method: 'POST' });
  }

  async takeCube(gameId: string) {
    return this.request(`/api/games/${gameId}/cube/take`, { method: 'POST' });
  }

  async passCube(gameId: string) {
    return this.request(`/api/games/${gameId}/cube/pass`, { method: 'POST' });
  }

  async getTournaments() {
    return this.request('/api/tournaments');
  }

  async createTournament(name: string, description: string, maxParticipants: number) {
    return this.request('/api/tournaments', {
      method: 'POST',
      body: JSON.stringify({ name, description, maxParticipants }),
    });
  }

  async joinTournament(tournamentId: string) {
    return this.request(`/api/tournaments/${tournamentId}/join`, { method: 'POST' });
  }

  async getLeaderboard() {
    return this.request('/api/players');
  }

  async getUserProfile() {
    return this.request('/api/user/profile');
  }

  async getDashboard() {
    return this.request('/api/user/dashboard');
  }
}

export const gurugammonApi = new GurugammonAPI();
