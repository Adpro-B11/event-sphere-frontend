export interface Event {
  id?: string;
  title: string;
  description?: string;
  date: string;
  location: string;
  price: number;
  status?: string;
  organizer?: string;
}