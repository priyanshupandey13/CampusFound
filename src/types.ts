export type ItemStatus = 'Lost' | 'Found'
export type Item = {
  id: string; title: string; category: string; status: ItemStatus; location: string;
  date: string; description: string; image: string; reporter: string; createdAt: number;
  state: 'Open' | 'Claim pending' | 'Resolved'
}
