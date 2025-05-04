export type Gender = 'male' | 'female';
export interface Person {
  id: number
  name: string
  age: number
  partner?: Person
  gender: Gender
  children: Person[]
  mother?: number
  father?: number
  dead?: boolean
}

export interface News {
  title: string
  body: string
}
export interface IslandAction {
  title: string
  description: string

}
export interface GameState {
  year: number
  people: Person[]
  food: number
  news: News[]
  islandEvents: IslandEvent[]
  islandActions: IslandAction[]
}
export interface IslandEvent {
  title: string
  description: string
  choices: string[]
}