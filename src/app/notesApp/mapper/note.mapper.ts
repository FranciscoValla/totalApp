import { Note } from "../interfaces/note.interface";

export function mapFireSToNote (doc:any):Note {
  if(!doc) return {} as Note;
  const fields = doc.fields || {};
  const idUnico = doc.name ? doc.name.split('/').pop() : '';
  let contenFinal:string | string[] = '';
  if ( fields.content ) {
    if (fields.content .stringValue !== undefined) {
      contenFinal = fields.content.stringValue;
    } else if (fields.content.arrayValue && fields.content.arrayValue.values) {
       contenFinal = fields.content.arrayValue.values.map(
        (val:any) => val.stringValue || ''
      );
    }
  }
  return {
    id: idUnico,
    title: fields.title?.stringValue || '',
    content: contenFinal,
    color: fields.color?.stringValue || 'bg-white',
    fix: fields.fix?.booleanValue || false,
    img: fields.img?.stringValue || null,
    date: fields.date?.timestampValue,
  };
}

export function mapResponseFireSc (response: {documents?:any[]}):Note[] {
  if (!response || !response.documents) return [];
  return response.documents.map(mapFireSToNote);
}
