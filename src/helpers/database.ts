import { FirebaseApp, initializeApp } from 'firebase/app';
import { Database, getDatabase, get, child, ref, set } from 'firebase/database';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

import { conf } from '../../config/config';

class DatabaseService {
  app: FirebaseApp;
  db: Database;

  constructor() {
    try {
      this.app = initializeApp({
        ...conf.firebase,
      });
      const auth = getAuth();
      signInWithEmailAndPassword(
        auth,
        conf.authFirebase.email,
        conf.authFirebase.password,
      ).catch((error) => {
        const { code, message } = error;
        console.log(`${code} - ${message}`);
      });
      this.db = getDatabase(this.app);
      console.log('Инициализировано');
    } catch (err) {
      console.error('Applications work withjout database');
    }
  }

  // получить список всех сохраненных объявлений
  getSavedAds(): Promise<Collection<Ad>> {
    return new Promise((resolve, reject) => {
      get(child(ref(this.db), 'ads'))
        .then((snapshots) => {
          if (snapshots.exists) {
            resolve(snapshots.val() || {});
          } else {
            reject('No data avaible');
          }
        })
        .catch((err) => reject(err));
    });
  }
  // добавить новое объявление
  setNewAd(ad: Ad): Promise<unknown> {
    return new Promise((resolve, reject) => {
      set(ref(this.db, 'ads' + '/' + ad.id), ad).then(() => resolve('')).catch(err => reject(err))
    });
  }
}

const db = new DatabaseService();

export default db;

export interface Collection<T> {
  [key: string]: T;
}

export interface Ad {
  title: string;
  price: number;
  url: string;
  id: string;
}
