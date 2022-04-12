import { Util } from '@hawryschuk/common';
import { DAO, Model } from '@hawryschuk/dao';
import * as admin from 'firebase-admin';
// const cert = require(process.env.GOOGLE_APPLICATION_CREDENTIALS);
const cert = require('./workorders-c95b9a24a1f3.json');
// const app = initializeApp({});
// const app = admin.initializeApp();
const app = admin.initializeApp({
    databaseURL: 'https://workorders-3308a.firebaseio.com',
    // projectId: cert.project_id,
    // credential: admin.credential.cert({
    //     projectId: cert.project_id,
    //     privateKey: cert.private_key,
    //     clientEmail: cert.client_email
    // }),
    credential: admin.credential.cert(cert)
});
admin.firestore()
    .collection('Account')
    .doc('05ea02c998cb1737a10494166869ad8b')
    .get()
    .then(response => {
        console.log('done!!', response);
    })