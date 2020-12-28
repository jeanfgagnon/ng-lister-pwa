import { Injectable } from '@angular/core';
import { Subject, ReplaySubject, Observable, Observer } from 'rxjs';
import { take } from 'rxjs/operators';
import { ApplicationSetting } from '../models/application-setting';
import { IIDText } from '../models/interface-id-text';
import { ListCategory } from '../models/list-category';

import { ListHeader } from '../models/list-header';
import { ListItem } from '../models/list-item';
import { SubItem } from '../models/sub-item';

const VERSION = 3;
const STORE_NAME = 'lister-pwa';

@Injectable({
  providedIn: 'root'
})
export class PersistService {

  private db: Subject<IDBDatabase> = new ReplaySubject<IDBDatabase>(1);
  private verbose = false;

  constructor() {
    if (!window.indexedDB) {
      this.db.next(undefined);
      this.db.complete();
    } else {
      this.debugLog(`localdb - requesting open of '${STORE_NAME}' version ${VERSION}`);

      const openRequest = indexedDB.open(STORE_NAME, VERSION);
      openRequest.onerror = err => {
        console.error('localdb - open has error:', err);
        this.db.error(err);
        this.db.complete();
      };

      openRequest.onupgradeneeded = (e: any) => {
        this.debugLog('localdb - upgrade needed!');

        const db: IDBDatabase = e.target.result;

        if (!db.objectStoreNames.contains('categories')) {
          db.createObjectStore('categories', { keyPath: 'id' }).createIndex('by_id', 'id');
        }

        if (!db.objectStoreNames.contains('headers')) {
          db.createObjectStore('headers', { keyPath: 'id' }).createIndex('by_id', 'id');
        }

        if (!db.objectStoreNames.contains('items')) {
          db.createObjectStore('items', { keyPath: 'id' }).createIndex('by_idEntete', 'idEntete');
        }

        if (!db.objectStoreNames.contains('subitems')) {
          db.createObjectStore('subitems', { keyPath: 'id' }).createIndex('by_idItem', 'idItem');
        }

        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'id' }).createIndex('by_id', 'id');
        }
      };

      openRequest.onsuccess = (e: any) => {
        this.debugLog('localdb - open success!', e.target.result);

        const db: IDBDatabase = e.target.result;
        this.db.next(db);
      };
    }
  }

  public get(storeName: string, key: any): Observable<any> {
    this.debugLog('localdb.query()');
    return new Observable((observer: Observer<any>) => {
      try {
        this.debugLog('localdb.query() - subscribed!');
        this.db.pipe(
          take(1)
        ).subscribe(db => {
          this.debugLog('localdb.query() got db:', db);
          if (!db) {
            observer.error('IndexDB not supported!');
            return;
          }

          const txn = db.transaction(storeName, 'readonly');
          const store = txn.objectStore(storeName);
          const req = store.get(key);
          req.onerror = (e: any) => {
            observer.error(e.target.error);
            return;
          };
          req.onsuccess = (e: any) => {
            observer.next(e.target.result);
            observer.complete();
          };
        });
      } catch (err) {
        observer.error(err);
      }
    });
  }

  public put(storeName: string, key: any, value: any): Observable<any> {
    return new Observable((observer: Observer<any>) => {
      try {
        this.db.pipe(
          take(1)
        ).subscribe(db => {
          if (!db) {
            observer.error('IndexDB not supported!');
            return;
          }

          const transaction = db.transaction(storeName, 'readwrite');
          const store = transaction.objectStore(storeName);
          const req = store.put(value);
          // TODO: look into this: const req = store.put(value, key);
          req.onerror = (e: any) => {
            this.debugLog('store error event:', e);
            observer.error(e.target.error);
            return;
          };
          req.onsuccess = (e: any) => {
            this.debugLog('store success:', e);
            observer.next(e.target.result);
            observer.complete();
          };
        });
      } catch (err) {
        observer.error(err);
      }
    });
  }

  // retourne la clef et l'objet pour tout le store itérativement
  public query(storeName: string, valueOnly = false): Observable<any> {
    this.debugLog('localdb.query()');
    return new Observable((observer: Observer<any>) => {
      try {
        this.debugLog('localdb.query() - subscribed!');
        this.db.pipe(
          take(1)
        ).subscribe(db => {
          this.debugLog('localdb.query() got db:', db);
          if (!db) {
            observer.error('IndexDB not supported!');
            return;
          }

          const transaction = db.transaction([storeName], 'readonly');
          const store = transaction.objectStore(storeName);
          const req = store.openCursor();
          req.onerror = (e: any) => {
            observer.error(e.target.error);
            return;
          };
          req.onsuccess = (e: any) => {
            const cursor = e.target.result;
            if (cursor) {
              if (valueOnly) {
                observer.next(cursor.value);
              }
              else {
                observer.next({ key: cursor.key, value: cursor.value });
              }
              cursor.continue();
            } else {
              observer.complete();
            }
          };
        });
      } catch (err) {
        observer.error(err);
      }
    });
  }

  public clear(storeName: string): Observable<any> {
    this.debugLog('localdb.clear() ' + storeName);
    return new Observable((observer: Observer<any>) => {
      try {
        this.debugLog('localdb.clear() - subscribed!');
        this.db.pipe(
          take(1)
        ).subscribe(db => {
          this.debugLog('localdb.clear() got db:', db);
          if (!db) {
            observer.error('IndexDB not supported!');
            return;
          }

          const txn = db.transaction([storeName], 'readwrite');
          const store = txn.objectStore(storeName);
          const req = store.clear();
          req.onerror = (e: any) => {
            observer.error(e.target.error);
            return;
          };
          req.onsuccess = (e: any) => {
            observer.next(e.target.result);
            observer.complete();
          };
        });
      } catch (err) {
        observer.error(err);
      }
    });
  }

  public delete(storeName: string, key: any): Observable<any> {
    this.debugLog('localdb.delete()');
    return new Observable((observer: Observer<any>) => {
      try {
        this.debugLog('localdb.delete() - subscribed!');
        this.db.pipe(
          take(1)
        ).subscribe(db => {
          this.debugLog('localdb.delete() got db:', db);
          if (!db) {
            observer.error('IndexDB not supported!');
            return;
          }

          const txn = db.transaction([storeName], 'readwrite');
          const store = txn.objectStore(storeName);
          const req = store.delete(key);
          req.onerror = (e: any) => {
            observer.error(e.target.error);
            return;
          };
          req.onsuccess = (e: any) => {
            observer.next(e.target.result);
            observer.complete();
          };
        });
      } catch (err) {
        observer.error(err);
      }
    });
  }

  public exists<T extends IIDText>(storeName: string, matcher: (truc: T) => boolean): Observable<boolean> {
    this.debugLog('localedb.exists()');
    return new Observable((observer: Observer<boolean>) => {
      try {
        this.db.pipe(
          take(1)
        ).subscribe(db => {
          this.debugLog('localdb.query() got db:', db);
          if (!db) {
            observer.error('IndexDB not supported!');
            return;
          }

          const transaction = db.transaction([storeName], 'readonly');
          const store = transaction.objectStore(storeName);

          const req = store.openCursor();

          req.onerror = (e: any) => {
            observer.error(e.target.error);
            return;
          };

          req.onsuccess = (e: any) => {
            const cursor = e.target.result;
            if (cursor) {
              const record = cursor.value as T;
              if (matcher(record)) {
                observer.next(true);
                observer.complete();
              }
              cursor.continue();
            } else {
              observer.next(false);
              observer.complete();
            }
          };
        });
      } catch (err) {
        observer.error(err);
      }
    });
  }

  public newCategoryInstance(): ListCategory {
    const rv: ListCategory = {
      id: this.uuidv4(),
      text: '',
      description: '',
      isDefault: false,
      headers: []
    };

    return rv;
  }

  public newHeaderInstance(idCategory: string): ListHeader {
    const rv: ListHeader = {
      id: this.uuidv4(),
      idCategory: idCategory,
      text: 'xxx',
      items: []
    };

    return rv;
  }

  public newItemInstance(idHeader: string): ListItem {
    const rv: ListItem = {
      id: this.uuidv4(),
      idHeader: idHeader,
      text: '',
      checked: false,
      subs: []
    };

    return rv;
  }

  public newSubitemInstance(idItem: string): SubItem {
    const rv: SubItem = {
      id: this.uuidv4(),
      idItem: idItem,
      text: '',
      rank: 0,
      checked: false
    };

    return rv;
  }

  public newSettingInstance(): ApplicationSetting {
    const rv: ApplicationSetting = {
      id: this.uuidv4(),
      name: '',
      value: ''
    };

    return rv;
  }

  public get dbVersion(): number {
    return VERSION;
  }

  // privates
  private uuidv4(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      /* tslint:disable:no-bitwise */
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      /* tslint:enable:no-bitwise */
      return v.toString(16);
    });
  }
  private debugLog(str: string, ...args: any[]): void {
    if (this.verbose) {
      console.log(str, args);
    }
  }

}
