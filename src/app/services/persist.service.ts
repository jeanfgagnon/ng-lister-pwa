import { Injectable } from '@angular/core';
import { Subject, ReplaySubject, Observable, Observer } from 'rxjs';
import { take } from 'rxjs/operators';

import { ListHeader } from '../models/list-header';

const VERSION = 3;
const STORE_NAME = 'lister-pwa';

@Injectable({
  providedIn: 'root'
})
export class PersistService {

  private db: Subject<IDBDatabase> = new ReplaySubject<IDBDatabase>(1);
  private database: any;

  constructor() {

    if (!window.indexedDB) {
      this.db.next(undefined);
      this.db.complete();
    } else {
      console.log(`localdb - requesting open of '${STORE_NAME}' version ${VERSION}`);

      const openRequest = indexedDB.open(STORE_NAME, VERSION);
      openRequest.onerror = err => {
        console.error('localdb - open has error:', err);
        this.db.error(err);
        this.db.complete();
      };

      openRequest.onupgradeneeded = function (e: any) {
        console.log('localdb - upgrade needed!');

        // create object stores for 'rawLogin' and 'rawVisit'
        const db: IDBDatabase = e.target.result;

        if (!db.objectStoreNames.contains('headers')) {
          db.createObjectStore('headers', { keyPath: "id" }).createIndex("by_id", "id");
        }

        if (!db.objectStoreNames.contains('items')) {
          db.createObjectStore('items', { keyPath: "id" }).createIndex("by_idEntete", "idEntete");
        }

        if (!db.objectStoreNames.contains('subitems')) {
          db.createObjectStore('subitems', { keyPath: "id" }).createIndex("by_idItem", "idItem");
        }
      };

      openRequest.onsuccess = (e: any) => {
        console.log('localdb - open success!', e.target.result);

        const db: IDBDatabase = e.target.result;
        this.db.next(db);
      };
    }
  }

  public get(storeName: string, key: any): Observable<any> {
    console.log('localdb.query()');
    return new Observable((observer: Observer<any>) => {
      try {
        console.log('localdb.query() - subscribed!');
        this.db.pipe(
          take(1)
        ).subscribe(db => {
          console.log('localdb.query() got db:', db);
          if (!db) {
            observer.error('IndexDB not supported!');
            return;
          }

          const txn = db.transaction(storeName, 'readonly');
          const store = txn.objectStore(storeName);
          const req = store.get(key);
          req.onerror = function (e: any) {
            observer.error(e.target.error);
            return;
          };
          req.onsuccess = function (e: any) {
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
          //const req = store.put(value, key);
          req.onerror = function (e: any) {
            console.log('store error event:', e);
            observer.error(e.target.error);
            return;
          };
          req.onsuccess = function (e: any) {
            console.log('store success:', e);
            observer.next(e.target.result);
            observer.complete();
          };
        });
      } catch (err) {
        observer.error(err);
      }
    });
  }

  public query(storeName: string): Observable<any> {
    console.log('localdb.query()');
    return new Observable((observer: Observer<any>) => {
      try {
        console.log('localdb.query() - subscribed!');
        this.db.pipe(
          take(1)
        ).subscribe(db => {
          console.log('localdb.query() got db:', db);
          if (!db) {
            observer.error('IndexDB not supported!');
            return;
          }

          const transaction = db.transaction([storeName], 'readonly');
          const store = transaction.objectStore(storeName);
          const req = store.openCursor();
          req.onerror = function (e: any) {
            observer.error(e.target.error);
            return;
          };
          req.onsuccess = function (e: any) {
            const cursor = e.target.result;
            if (cursor) {
              observer.next({ key: cursor.key, value: cursor.value });
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

  // private AAconstructor() {
  //   this.request = window.indexedDB.open(this.storeName);
  //   this.request.onupgradeneeded = () => {
  //     const db = this.request.result;

  //     const store = db.createObjectStore("headers", { keyPath: "id" });
  //     const headerIndex = store.createIndex("by_id", "id", { unique: true });
  //   };

  //   this.request.onsuccess = () => {
  //     this.database = this.request.result;
  //   }

  //   //this.database = this.request.result;
  // }

  public saveHeader(h: ListHeader) {
    const tx = this.database.transaction("headers", "readwrite");
    const store = tx.objectStore("headers");
    store.put(h);

    tx.oncomplete = function () {
      // All requests have succeeded and the transaction has committed.
      console.log('All requests have succeeded and the transaction has committed.');
    };

    console.log('on est fermé %s', this.uuidv4());
  }

  public newHeaderInstance(): ListHeader {
    const rv: ListHeader = {
      id: this.uuidv4(),
      name: 'xxx'
    };

    return rv;
  }



  // privates

  private uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

}



/*

import { Injectable } from '@angular/core';

import { Observable, Observer, ReplaySubject, Subject } from 'rxjs';
import { take } from 'rxjs/operators';

const VERSION = 2;

// good tutorial: https://code.tutsplus.com/tutorials/working-with-indexeddb--net-34673
// reference: https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Using_IndexedDB

@Injectable()
export class LocalDbService {
  db: Subject<IDBDatabase> = new ReplaySubject<IDBDatabase>(1);

  constructor() {
    window['SLOCALDB'] = this;

    if (!window.indexedDB) {
      this.db.next(undefined);
      this.db.complete();
    } else {
      console.log(`localdb - requesting open of 'swbuddy' version ${VERSION}`);

      const openRequest = indexedDB.open('swbuddy', VERSION);
      openRequest.onerror = err => {
        console.error('localdb - open has error:', err);

        this.db.error(err);
        this.db.complete();
      };

      openRequest.onupgradeneeded = function(e: any) {
        console.log('localdb - upgrade needed!');

        // create object stores for 'rawLogin' and 'rawVisit'
        const db: IDBDatabase = e.target.result;
        if (!db.objectStoreNames.contains('rawLogin')) {
          db.createObjectStore('rawLogin');
        }

        if (!db.objectStoreNames.contains('rawVisit')) {
          db.createObjectStore('rawVisit');
        }

        // for testing any type of object setup
        if (!db.objectStoreNames.contains('test')) {
          db.createObjectStore('test');
        }
      };

      openRequest.onsuccess = (e: any) => {
        console.log('localdb - open success!', e.target.result);

        const db: IDBDatabase = e.target.result;
        this.db.next(db);
      };
    }
  }

  get(storeName: string, key: any): Observable<any> {
    console.log('localdb.query()');
    return Observable.create((observer: Observer<any>) => {
      try {
        console.log('localdb.query() - subscribed!');
        this.db.pipe(
          take(1)
        ).subscribe(db => {
          console.log('localdb.query() got db:', db);
          if (!db) {
            observer.error('IndexDB not supported!');
            return;
          }

          const txn = db.transaction([storeName], 'readonly');
          const store = txn.objectStore(storeName);
          const req = store.get(key);
          req.onerror = function(e: any) {
            observer.error(e.target.error);
            return;
          };
          req.onsuccess = function(e: any) {
            observer.next(e.target.result);
            observer.complete();
          };
        });
      } catch (err) {
        observer.error(err);
      }
    });
  }

  put(storeName: string, key: any, value: any): Observable<any> {
    return Observable.create((observer: Observer<any>) => {
      try {
        this.db.pipe(
          take(1)
        ).subscribe(db => {
          if (!db) {
            observer.error('IndexDB not supported!');
            return;
          }

          const txn = db.transaction([storeName], 'readwrite');
          const store = txn.objectStore(storeName);
          const req = store.put(value, key);
          req.onerror = function(e: any) {
            console.log('store error event:', e);
            observer.error(e.target.error);
            return;
          };
          req.onsuccess = function(e: any) {
            console.log('store success:', e);
            observer.next(e.target.result);
            observer.complete();
          };
        });
      } catch (err) {
        observer.error(err);
      }
    });
  }

  delete(storeName: string, key: any): Observable<any> {
    console.log('localdb.delete()');
    return Observable.create((observer: Observer<any>) => {
      try {
        console.log('localdb.delete() - subscribed!');
        this.db.pipe(
          take(1)
        ).subscribe(db => {
          console.log('localdb.delete() got db:', db);
          if (!db) {
            observer.error('IndexDB not supported!');
            return;
          }

          const txn = db.transaction([storeName], 'readwrite');
          const store = txn.objectStore(storeName);
          const req = store.delete(key);
          req.onerror = function(e: any) {
            observer.error(e.target.error);
            return;
          };
          req.onsuccess = function(e: any) {
            observer.next(e.target.result);
            observer.complete();
          };
        });
      } catch (err) {
        observer.error(err);
      }
    });
  }


  query(storeName: string): Observable<any> {
    console.log('localdb.query()');
    return Observable.create((observer: Observer<any>) => {
      try {
        console.log('localdb.query() - subscribed!');
        this.db.pipe(
          take(1)
        ).subscribe(db => {
          console.log('localdb.query() got db:', db);
          if (!db) {
            observer.error('IndexDB not supported!');
            return;
          }

          const txn = db.transaction([storeName], 'readonly');
          const store = txn.objectStore(storeName);
          const req = store.openCursor();
          req.onerror = function(e: any) {
            observer.error(e.target.error);
            return;
          };
          req.onsuccess = function(e: any) {
            const cursor = e.target.result;
            if (cursor) {
              observer.next({key: cursor.key, value: cursor.value});
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
}
shar

*/