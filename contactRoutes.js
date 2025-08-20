import Router from '../utils/router.js';
import { submitContact } from '../controllers/contactController.js';

const router = new Router();

router.post('', submitContact);

export default router;