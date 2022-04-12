import { FirestoreDAO } from './firestore.dao';
import { testDAO, RestApiDAO, Model } from '@hawryschuk/dao';
import { BusinessModel, Company, Account, WorkOrder, Membership } from '@hawryschuk/redaction';
import { testBusinessModel } from '@hawryschuk/redaction/business.model.spec.exports';

testBusinessModel({
    title: 'Business Model : FirestoreDAO',
    business: new BusinessModel(FirestoreDAO)
});
