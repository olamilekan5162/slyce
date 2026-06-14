export interface Transaction {
  id: number;
  name: string;
  amount: number;
  date: string;
  category: string;
  image: string;
  type?: string;
}

export interface SavingsPot {
  id: string;
  title: string;
  totalReceived: number;
  confirmedCollaborators: number;
  totalCollaborators: number;
}

export interface Token {
  id: number;
  symbol: string;
  name: string;
  fiatValue: number;
  amount: number;
  iconUrl: string;
  iconFallback?: string;
}
