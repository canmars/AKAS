import express from 'express';
import { AkademikTakvimController } from '../controllers/AkademikTakvimController.js';
import { authenticate } from '../middlewares/auth.js';

const router = express.Router();
router.use(authenticate);

router.get('/', AkademikTakvimController.getAkademikTakvim);
router.get('/aktif', AkademikTakvimController.getAktifDonem);
router.get('/ogrenci-sayilari', AkademikTakvimController.getDonemBazliOgrenciSayilari);
router.get('/risk-dagilimi', AkademikTakvimController.getDonemBazliRiskDagilimi);

export default router;

