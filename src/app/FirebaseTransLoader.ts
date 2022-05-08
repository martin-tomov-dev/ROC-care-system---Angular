import { TranslateLoader } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { AngularFireDatabase } from "@angular/fire/database";
import { AngularFirestore } from '@angular/fire/firestore';
import { map } from 'rxjs/operators';

export class FirebaseTransLoader implements TranslateLoader {
    constructor(
        // private db: AngularFireDatabase,
        // private prefix: string = 'translations/',
        private firestore: AngularFirestore) {
    }
    public getTranslation(lang: string): any {
        let data = {};
        return this.firestore.collection('language_label').valueChanges().pipe(
            map(x => {
                if (x && x[0]) {
                    x[0]['language'].map(lan => {
                        data[lan['language_label']] = lan['value']
                    })
                }
                return data
            })
        ) as Observable<any>;
    }
}