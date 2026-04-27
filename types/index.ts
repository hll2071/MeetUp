export interface Profile {
  id: string
  name: string
  email: string
  created_at: string
}

export interface Availability {
  id: string
  user_id: string
  date: string
  created_at: string
  profiles?: Profile
}

export interface Plan {
  id: string
  created_by: string
  date: string
  time: string | null
  place: string
  activity: string | null
  cost: number
  memo: string | null
  confirmed: boolean
  created_at: string
  profiles?: Profile
}

export interface AvailabilityByDate {
  date: string
  users: Profile[]
}
