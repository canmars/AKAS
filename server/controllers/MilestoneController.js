/**
 * Milestone Controller
 */

import { milestoneQueries } from '../db/queries/milestoneQueries.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';

export class MilestoneController {
  static getMilestoneListesi = asyncHandler(async (req, res) => {
    const { ogrenci_id, durum, milestone_turu } = req.query;
    const data = await milestoneQueries.getMilestoneListesi(
      ogrenci_id || null,
      durum || null,
      milestone_turu || null
    );
    res.json({ success: true, data });
  });

  static getGecikmisMilestonelar = asyncHandler(async (req, res) => {
    const data = await milestoneQueries.getGecikmisMilestonelar();
    res.json({ success: true, data });
  });

  static getTikToplantilari = asyncHandler(async (req, res) => {
    const { ogrenci_id } = req.query;
    const data = await milestoneQueries.getTikToplantilari(ogrenci_id || null);
    res.json({ success: true, data });
  });

  static getTikByOgrenciId = asyncHandler(async (req, res) => {
    const { ogrenciId } = req.params;
    const data = await milestoneQueries.getTikToplantilari(ogrenciId);
    res.json({ success: true, data });
  });

  static getYaklasanTikToplantilari = asyncHandler(async (req, res) => {
    const data = await milestoneQueries.getYaklasanTikToplantilari();
    res.json({ success: true, data });
  });

  static createTikToplanti = asyncHandler(async (req, res) => {
    const { ogrenci_id, toplanti_tarihi, katilim_durumu, rapor_verildi_mi, rapor_icerigi } = req.body;
    const data = await milestoneQueries.createTikToplanti({
      ogrenci_id,
      toplanti_tarihi,
      katilim_durumu,
      rapor_verildi_mi,
      rapor_icerigi
    });
    res.json({ success: true, data });
  });

  static olusturTikTakvimi = asyncHandler(async (req, res) => {
    const { ogrenci_id, tez_onersi_onay_tarihi } = req.body;
    const data = await milestoneQueries.olusturTikTakvimi(ogrenci_id, tez_onersi_onay_tarihi);
    res.json({ success: true, data });
  });

  static getMilestoneByOgrenciId = asyncHandler(async (req, res) => {
    const { ogrenciId } = req.params;
    const data = await milestoneQueries.getMilestoneListesi(ogrenciId, null, null);
    res.json({ success: true, data });
  });

  static createMilestone = asyncHandler(async (req, res) => {
    const data = await milestoneQueries.createMilestone(req.body);
    res.json({ success: true, data });
  });

  static updateMilestone = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const data = await milestoneQueries.updateMilestone(id, req.body);
    res.json({ success: true, data });
  });
}

