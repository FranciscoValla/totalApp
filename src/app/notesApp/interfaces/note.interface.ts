export interface Note {
  id: string;
  title: string;
  content: string;
  fix: boolean;
  color: string;
  date : Date;
  img?: string | null;
}
