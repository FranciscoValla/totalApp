export interface Note {
  id: string;
  title: string;
  content: string | string[];
  fix: boolean;
  color: string;
  date : Date;
  img?: string | null;
}
