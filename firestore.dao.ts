import { Util } from '@hawryschuk/common';
import { DAO, Model } from '@hawryschuk/dao';
import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
const cert = require(process.env.GOOGLE_APPLICATION_CREDENTIALS);
// const app = admin.initializeApp({});
// const app = admin.initializeApp({ projectId: 'workorders-3308a', credential: admin.credential.cert(cert) });
admin.initializeApp(functions.config().firebase);
// const app = admin;
// const app = admin.initializeApp({ credential: admin.credential.cert(cert), databaseURL: 'https://workorders-3308a.firebaseio.com' });
// admin.initializeApp(functions.config().firebase);
// const app = admin.initializeApp({});
// const app = admin.initializeApp();

export class FirestoreDAO extends DAO {
  constructor(models: any) { super(models); }

  firestore = () => Util.pause(1000).then(() => admin.firestore() as any);

  async create<M extends Model>(klass: any, data: M): Promise<M> {
    const object = await super.create(klass, data);
    const { id } = object;
    const firestore = await this.firestore();
    await firestore.collection(klass.name).doc(id).set(object.POJO());
    await Util.waitUntil(async () => await this.getOnline(klass, id));
    return object;
  }
  async delete(klass: any, id: string, fromObject?: boolean) {
    const object = await super.delete(klass, id, fromObject, true);
    const firestore = await this.firestore();
    await firestore.collection(klass.name).doc(id).delete();
    await Util.waitUntil(async () => ! await this.getOnline(klass, id));
    return object;
  }
  async update<M extends Model>(klass: any, id: string, data: any): Promise<M> {
    const object: M = await super.update(klass, id, data);
    const firestore = await this.firestore();
    await firestore.collection(klass.name).doc(id).set(object.POJO());
    return object;
  }
  static reads2 = 0;
  async getOnline(klass: any, id = '') {
    Util.log(`FB.getOnline(${klass.name},${id}): ${++FirestoreDAO.reads2}`);
    await super.getOnline(klass, id);
    const doc2obj = async (doc: any): Promise<Model> => {
      const obj = doc && new klass({ ...doc });
      obj && await obj.ready$;
      return obj;
    };
    const firestore = await this.firestore();
    const online = id
      ? await firestore
        .collection(klass.name)
        .doc(id).get()
        .then(d => d && d.data())
        .then(doc2obj)
      : await firestore
        .collection(klass.name)
        .get()
        .then(r => {
          console.info('got ome results!!')
          return r;
        })
        .then(documents => Promise.all(documents.docs.map(d => d && d.data()).map(doc2obj)))
        .then(documents => documents.reduce(
          (docs, doc) => ({ ...docs, ...(doc && doc.id ? { [doc.id]: doc } : {}) }),
          {} as any
        ))
      ;
    Util.log(`/FB.getOnline(${klass.name},${id}): ${FirestoreDAO.reads2}: ${id ? online.length : online}`);
    return online;
  }
}
