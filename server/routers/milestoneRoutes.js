import express from 'express';
import { MilestoneController } from '../controllers/MilestoneController.js';
import { authenticate } from '../middlewares/auth.js';

const router = express.Router();
router.use(authenticate);

router.get('/', MilestoneController.getMilestoneListesi);
router.get('/gecikmis', MilestoneController.getGecikmisMilestonelar);

// Milestone CRUD
router.get('/:ogrenciId', MilestoneController.getMilestoneByOgrenciId);
router.post('/', MilestoneController.createMilestone);
router.patch('/:id', MilestoneController.updateMilestone);

// TİK Toplantıları
router.get('/tik', MilestoneController.getTikToplantilari);
router.get('/tik/:ogrenciId', MilestoneController.getTikByOgrenciId);
router.get('/tik/yaklasan', MilestoneController.getYaklasanTikToplantilari);
router.post('/tik', MilestoneController.createTikToplanti);
router.post('/tik/olustur-takvim', MilestoneController.olusturTikTakvimi);

export default router;

