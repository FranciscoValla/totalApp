export interface Note {
  id: string;
  title: string;
  content: string | { type: boolean; txt: string }[];
  fix: boolean;
  color: string;
  date : Date;
  img?: string | null;
}
