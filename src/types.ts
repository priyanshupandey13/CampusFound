export type ItemStatus = 'Lost' | 'Found'

export type ItemState = 'Open' | 'Claim pending' | 'Resolved'

export type Item = {
  id: string
  title: string
  category: string
  status: ItemStatus
  location: string
  date: string
  description: string
  image: string
  reporter: string
  createdAt: number
  state: ItemState
}