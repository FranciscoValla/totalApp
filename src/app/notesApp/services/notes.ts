import { effect, inject, Service, signal } from '@angular/core';
import { Note } from '../interfaces/note.interface';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment.development';
import { map, Observable, of, tap } from 'rxjs';
import { mapFireSToNote, mapResponseFireSc } from '../mapper/note.mapper';

@Service()
export class NoteServices {
  public noteList = signal<Note[]>([]);
  public binList = signal<Note[]>([]);

  public noteListLocal = signal<Note[]>([]);
  public binListLocal = signal<Note[]>([]);

  deleteAllBin() {
    this.binList.set([]);
  }

  private http = inject(HttpClient);
  private baseUrl = environment.fireStoreUrl;
  private noteCollection = environment.collectionNotes;
  private binCollection = environment.collectionBins;

  getNotesFireStore(): Observable<Note[]> {
    if( !localStorage.getItem('refreshTokenAuth')){
      console.log('>>>Entro en local');
      const notes = JSON.parse(localStorage.getItem('localNotes') || '[]' );
      console.log('>>>Notes', notes);
      this.noteList.set(notes);
      return of(notes);
    }
    return this.http.get<{ documents: any[] }>(`${this.baseUrl}/${this.noteCollection}`).pipe(
      map(mapResponseFireSc),
      tap((list) => {
        this.noteList.set(list);
      }),
    );
  }

  createNoteFireStore(newNote: Note): Observable<Note> {
    if ( !localStorage.getItem('refreshTokenAuth')){
      const noteActual:Note[] = JSON.parse(localStorage.getItem('localNotes') || '[]');
      const noteWithId = {...newNote, id: 'local_' + Math.random().toString(36).substring(2,9)};
      const newList = [...noteActual, noteWithId];
      localStorage.setItem('localNotes', JSON.stringify(newList));
      // this.noteList.set(notesSave);
      return of(noteWithId);
    }
    const bodyFirestore = this.returnFireStoreFormat(newNote);
    return this.http.post<any>(`${this.baseUrl}/${this.noteCollection}`, bodyFirestore).pipe(
      map(mapFireSToNote),
    );
  }

  updateNoteFireStore(id: string, updateNote: Partial<Note>): Observable<Note> {
    if( !localStorage.getItem('refreshTokenAuth')){
      const noteListTemp: Note[] = JSON.parse(localStorage.getItem('localNotes') || '[]');
      const newList = noteListTemp.map( note => {
        if ( note.id === id) {
          return { ...note, ...updateNote}
        }
        return note
      });
      localStorage.setItem('localNotes', JSON.stringify(newList));
      const actualNote = newList.find( n => n.id === id) as Note;
      return of(actualNote);
    }
    const urlConId = `${this.baseUrl}/${this.noteCollection}/${id}`;
    const fields: any = {};
    const queryParams: string[] = [];
    if (updateNote.title !== undefined) {
      fields.title = { stringValue: updateNote.title || '' };
      queryParams.push('updateMask.fieldPaths=title');
    }

    if (updateNote.content !== undefined) {
      // 1. Verificamos si lo que vamos a actualizar es un arreglo de objetos
      if (Array.isArray(updateNote.content)) {
        fields.content = {
          arrayValue: {
            values: updateNote.content.map((item: any) => ({
              mapValue: {
                fields: {
                  type: { booleanValue: item.type ?? false }, // Guarda el booleano
                  txt: { stringValue: item.txt || '' }       // Guarda el texto
                }
              }
            }))
          }
        };
      } else {
        // 2. Si es una nota de texto normal de toda la vida, se queda igual
        fields.content = { stringValue: updateNote.content || '' };
      }
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
    const urlConParams = `${urlConId}?${queryParams.join('&')}`;
    return this.http.patch<any>(urlConParams, bodyFirestore).pipe(
      map(mapFireSToNote),
    );
  }

  deleteNoteFireStore(id: string): Observable<void> {
    if ( !localStorage.getItem('refreshTokenAuth')){
      const localListTemp:Note[] = JSON.parse(localStorage.getItem('localNotes') || '[]');
      const noteListTemp = localListTemp.filter((item)=> item.id !== id);
      localStorage.setItem('localNotes', JSON.stringify(noteListTemp));
      // this.noteListLocal.set(noteListTemp);
      return of(void 0);
    }
    const urlConId = `${this.baseUrl}/${this.noteCollection}/${id}`;
    return this.http.delete<void>(urlConId);
  }

  addListBinFireStore( bin: Note): Observable<Note> {
    if( !localStorage.getItem('refreshTokenAuth')){
      const binListLocal = JSON.parse( localStorage.getItem('localBin') || '[]');
      const actualBin = [...binListLocal, bin];
      localStorage.setItem('localBin', JSON.stringify(actualBin));
      return of(bin);
    }
    const bodyFirestore = this.returnFireStoreFormat(bin);
    return this.http.post<any>(`${this.baseUrl}/${this.binCollection}`, bodyFirestore).pipe(
      map(mapFireSToNote),
    );
  }

  getBinsFireStore(): Observable<Note[]> {
    if( !localStorage.getItem('refreshTokenAuth')){
      const bins = JSON.parse(localStorage.getItem('localBin') || '[]');
      this.binList.set(bins);
      return of(bins);
    }
    return this.http.get<{ documents: any[] }>(`${this.baseUrl}/${this.binCollection}`).pipe(
      map(mapResponseFireSc),
      tap((list) => {
        this.binList.set(list);
      }),
    );
  }

  deleteBinFirestore(id: string): Observable<void> {
    if( !localStorage.getItem('refreshTokenAuth')){
      const binListTemp:Note[] = JSON.parse(localStorage.getItem('localBin') || '[]');
      const actualBin = binListTemp.filter( (item)=> item.id !== id);
      localStorage.setItem('localBin', JSON.stringify(actualBin));
      return of(void 0);
    }
    return this.http.delete<void>(`${this.baseUrl}/${this.binCollection}/${id}`);
  }

  returnFireStoreFormat ( newNote:Note ) {
    const fechaISO = newNote.date instanceof Date
    ? newNote.date.toISOString()
    : (typeof newNote.date === 'string' ? newNote.date : new Date().toISOString());
    let contentFire:any;
    if (Array.isArray(newNote.content)) {
      contentFire = {
        arrayValue: {
          // values: newNote.content.map( txt => ({stringValue: txt || ''}))
          values: newNote.content.map( (item:any)=> ({
            mapValue: {
              fields: {
                type: { booleanValue: item.type ?? false },
                txt: { stringValue: item.txt || '' }
              }
            }
          }))
        }
      };
    } else {
      contentFire = {stringValue: newNote.content || ''}
    }
    return {
      fields: {
        title: { stringValue: newNote.title || '' },
        content: contentFire,
        color: { stringValue: newNote.color || 'bg-white' },
        fix: { booleanValue: newNote.fix || false },
        img: newNote.img ? { stringValue: newNote.img } : { nullValue: null },
        date: { timestampValue: fechaISO },
      }
    }
  }
}
