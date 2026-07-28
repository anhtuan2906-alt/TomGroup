export interface Member {
  id: string;
  name: string;
  avatar: string;
  position: string;
  joinDate: string;
  status: 'active' | 'inactive';
}

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  date: string;
  description: string;
  memberId?: string;
  matchId?: string;
}

export interface Match {
  id: string;
  date: string;
  opponent: string;
  location: string;
  result: 'win' | 'loss' | 'draw' | 'upcoming';
  score?: string;
}
