import { effect, inject, Service, signal } from '@angular/core';
import { Note } from '../interfaces/note.interface';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment.development';
import { map, Observable, tap } from 'rxjs';

@Service()
export class NoteServices {
  public noteList = signal<Note[]>([]);
  binList = signal<Note[]>([]);

  updateNote(upN: Note) {
    this.noteList.update((notes) =>
      notes.map((note) =>
        note.id == upN.id
          ? {
              ...note,
              title: upN.title,
              content: upN.content,
              fix: upN.fix,
              color: upN.color,
              img: upN.img,
            }
          : note,
      ),
    );
    console.log('UPDATE!!!, ', this.noteList());
  }

  deleteNote(id: string) {
    this.noteList.update((notes) => notes.filter((note) => note.id !== id));
  }

  // --- Papelera ---

  addBinList(newB: Note) {
    this.binList.update((list) => [...list, newB]);
  }

  deleteBin(id: string) {
    this.binList.update((bins) => bins.filter((bin) => bin.id !== id));
  }

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
          } as Note;
        });
      }),
      tap((list) => {
        this.noteList.set(list);
      }),
    );
  }

  createNoteFireStore(nuevaNota: Note): Observable<Note> {
    const bodyFirestore = {
      fields: {
        title: { stringValue: nuevaNota.title || '' },
        content: { stringValue: nuevaNota.content || '' },
        color: { stringValue: nuevaNota.color || 'bg-white' },
        fix: { booleanValue: nuevaNota.fix || false },
        img: nuevaNota.img ? { stringValue: nuevaNota.img } : { nullValue: null },
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
        } as Note;
      }),
    );
  }

  deleteNoteFireStore(id: string): Observable<void> {
    const urlConId = `${this.baseUrl}/${this.noteCollection}/${id}`;
    return this.http.delete<void>(urlConId);
  }

  addListBinFireStore(noteBin: Note): Observable<Note> {
    const bodyFireStore = {
      fields: {
        title: { stringValue: noteBin.title || '' },
        content: { stringValue: noteBin.content || '' },
        color: { stringValue: noteBin.color || 'bg-white' },
        fix: { booleanValue: noteBin.fix || false },
        img: noteBin.img ? { stringValue: noteBin.img } : { nullValue: null },
      },
    };
    return this.http.post<any>(`${this.baseUrl}/${this.binCollection}`, bodyFireStore).pipe(
      map((doc) => {
        const fields = doc.fields || {};
        const idUnique = doc.name ? doc.name.split('/').pop() : '';
        return {
          id: idUnique,
          title: fields.title?.stringValue || '',
          content: fields.content?.stringValue || '',
          color: fields.color?.stringValue || 'bg-white',
          fix: fields.fix?.booleanValue || false,
          img: fields.img?.stringValue || null,
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
