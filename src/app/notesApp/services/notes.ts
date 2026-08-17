import { effect, inject, Service, signal } from '@angular/core';
import { Note } from '../interfaces/note.interface';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment.development';
import { map, Observable, tap } from 'rxjs';
import { mapFireSToNote, mapResponseFireSc } from '../mapper/note.mapper';

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
      map(mapResponseFireSc),
      tap((list) => {
        this.noteList.set(list);
      }),
    );
  }

  createNoteFireStore(newNote: Note): Observable<Note> {
    const bodyFirestore = this.returnFireStoreFormat(newNote);
    return this.http.post<any>(`${this.baseUrl}/${this.noteCollection}`, bodyFirestore).pipe(
      map(mapFireSToNote),
    );
  }

  updateNoteFireStore(id: string, updateNote: Partial<Note>): Observable<Note> {
    const urlConId = `${this.baseUrl}/${this.noteCollection}/${id}`;
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
    const urlConParams = `${urlConId}?${queryParams.join('&')}`;
    return this.http.patch<any>(urlConParams, bodyFirestore).pipe(
      map(mapFireSToNote),
    );
  }

  deleteNoteFireStore(id: string): Observable<void> {
    const urlConId = `${this.baseUrl}/${this.noteCollection}/${id}`;
    return this.http.delete<void>(urlConId);
  }

  addListBinFireStore( bin: Note): Observable<Note> {
    const bodyFirestore = this.returnFireStoreFormat(bin);
    return this.http.post<any>(`${this.baseUrl}/${this.binCollection}`, bodyFirestore).pipe(
      map(mapFireSToNote),
    );
  }

  getBinsFireStore(): Observable<Note[]> {
    return this.http.get<{ documents: any[] }>(`${this.baseUrl}/${this.binCollection}`).pipe(
      map(mapResponseFireSc),
      tap((list) => {
        this.binList.set(list);
      }),
    );
  }

  deleteBinFirestore(id: string): Observable<void> {
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
          values: newNote.content.map( txt => ({stringValue: txt || ''}))
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
