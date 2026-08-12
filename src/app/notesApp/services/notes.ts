import { effect, inject, Service, signal } from '@angular/core';
import { Note } from '../interfaces/note.interface';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment.development';
import { map, Observable, tap } from 'rxjs';

@Service()
export class NoteServices {
  public noteList = signal<Note[]>([]);
  public binList = signal<Note[]>([]);

  deleteAllBin() {
    this.binList.set([]);
  }

  private http = inject(HttpClient);
  private baseUrl = environment.fireStoreUrl;
  private noteCollection = environment.collectionNotes;
  private binCollection = environment.collectionBins;

  getNotesFireStore(): Observable<Note[]> {
    return this.http.get<{ documents: any[] }>(`${this.baseUrl}/${this.noteCollection}`).pipe(
      map((response) => {
        if (!response.documents) return [];
        return response.documents.map((doc) => {
          const fields = doc.fields || {};
          const idUnico = doc.name ? doc.name.split('/').pop() : '';
          return {
            id: idUnico,
            title: fields.title?.stringValue || '',
            content: fields.content?.stringValue || '',
            color: fields.color?.stringValue || 'bg-white',
            fix: fields.fix?.booleanValue || false,
            img: fields.img?.stringValue || null,
            date: doc.fields.date?.timestampValue
          } as Note;
        });
      }),
      tap((list) => {
        this.noteList.set(list);
      }),
    );
  }

  createNoteFireStore(newNote: Note): Observable<Note> {
    console.log('>>>Nota', newNote);
    const fechaISO = newNote.date instanceof Date
      ? newNote.date.toISOString()
      : (typeof newNote.date === 'string' ? newNote.date : new Date().toISOString());
    const bodyFirestore = {
      fields: {
        title: { stringValue: newNote.title || '' },
        content: { stringValue: newNote.content || '' },
        color: { stringValue: newNote.color || 'bg-white' },
        fix: { booleanValue: newNote.fix || false },
        img: newNote.img ? { stringValue: newNote.img } : { nullValue: null },
        date: { timestampValue: fechaISO },
      },
    };
    return this.http.post<any>(`${this.baseUrl}/${this.noteCollection}`, bodyFirestore).pipe(
      map((doc) => {
        const fields = doc.fields || {};
        const idUnico = doc.name ? doc.name.split('/').pop() : '';
        return {
          id: idUnico,
          title: fields.title?.stringValue || '',
          content: fields.content?.stringValue || '',
          color: fields.color?.stringValue || 'bg-white',
          fix: fields.fix?.booleanValue || false,
          img: fields.img?.stringValue || null,
          date: fields.date?.timestampValue || new Date().toISOString(),
        } as Note;
      }),
    );
  }

  updateNoteFireStore(id: string, updateNote: Partial<Note>): Observable<Note> {
    const urlConId = `${this.baseUrl}/${this.noteCollection}/${id}`;

    // 1. Construir el cuerpo con la estructura especial de Firestore
    const fields: any = {};
    const queryParams: string[] = [];

    if (updateNote.title !== undefined) {
      fields.title = { stringValue: updateNote.title || '' };
      queryParams.push('updateMask.fieldPaths=title');
    }
    if (updateNote.content !== undefined) {
      fields.content = { stringValue: updateNote.content || '' };
      queryParams.push('updateMask.fieldPaths=content');
    }
    if (updateNote.color !== undefined) {
      fields.color = { stringValue: updateNote.color || 'bg-white' };
      queryParams.push('updateMask.fieldPaths=color');
    }
    if (updateNote.fix !== undefined) {
      fields.fix = { booleanValue: updateNote.fix || false };
      queryParams.push('updateMask.fieldPaths=fix');
    }
    if (updateNote.img !== undefined) {
      fields.img = updateNote.img ? { stringValue: updateNote.img } : { nullValue: null };
      queryParams.push('updateMask.fieldPaths=img');
    }

    const bodyFirestore = { fields };

    // 2. Unir los parámetros a la URL (necesarios para que Firestore sepa qué actualizar)
    const urlConParams = `${urlConId}?${queryParams.join('&')}`;

    // 3. Ejecutar la petición PATCH
    return this.http.patch<any>(urlConParams, bodyFirestore).pipe(
      map((doc) => {
        const fields = doc.fields || {};
        const idUnico = doc.name ? doc.name.split('/').pop() : '';
        return {
          id: idUnico,
          title: fields.title?.stringValue || '',
          content: fields.content?.stringValue || '',
          color: fields.color?.stringValue || 'bg-white',
          fix: fields.fix?.booleanValue || false,
          img: fields.img?.stringValue || null,
          date: fields.date?.timestampValue,
        } as Note;
      }),
    );
  }

  deleteNoteFireStore(id: string): Observable<void> {
    const urlConId = `${this.baseUrl}/${this.noteCollection}/${id}`;
    return this.http.delete<void>(urlConId);
  }

  addListBinFireStore( bin: Note): Observable<Note> {
    console.log('>>>Bin', bin);
    const fechaISO = bin.date instanceof Date
      ? bin.date.toISOString()
      : (typeof bin.date === 'string' ? bin.date : new Date().toISOString());
    const bodyFirestore = {
      fields: {
        title: { stringValue: bin.title || '' },
        content: { stringValue: bin.content || '' },
        color: { stringValue: bin.color || 'bg-white' },
        fix: { booleanValue: bin.fix || false },
        img: bin.img ? { stringValue: bin.img } : { nullValue: null },
        date: { timestampValue: fechaISO },
      },
    };
    return this.http.post<any>(`${this.baseUrl}/${this.binCollection}`, bodyFirestore).pipe(
      map((doc) => {
        const fields = doc.fields || {};
        const idUnico = doc.name ? doc.name.split('/').pop() : '';
        return {
          id: idUnico,
          title: fields.title?.stringValue || '',
          content: fields.content?.stringValue || '',
          color: fields.color?.stringValue || 'bg-white',
          fix: fields.fix?.booleanValue || false,
          img: fields.img?.stringValue || null,
          date: fields.date?.timestampValue ? new Date(fields.date.timestampValue) : new Date(),
        } as Note;
      }),
    );
  }

  getBinsFireStore(): Observable<Note[]> {
    return this.http.get<{ documents: any[] }>(`${this.baseUrl}/${this.binCollection}`).pipe(
      map((response) => {
        if (!response.documents) return [];
        return response.documents.map((doc) => {
          const fields = doc.fields || {};
          const idUnico = doc.name ? doc.name.split('/').pop() : '';
          return {
            id: idUnico,
            title: fields.title?.stringValue || '',
            content: fields.content?.stringValue || '',
            color: fields.color?.stringValue || 'bg-white',
            fix: fields.fix?.booleanValue || false,
            img: fields.img?.stringValue || null,
            date: fields.date?.timestampValue,
          } as Note;
        });
      }),
      tap((list) => {
        this.binList.set(list);
      }),
    );
  }

  deleteBinFirestore(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${this.binCollection}/${id}`);
  }
}
