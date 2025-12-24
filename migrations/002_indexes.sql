CREATE INDEX idx_adminler_aktif ON public.adminler USING btree (aktif_mi);
CREATE INDEX idx_logs_created_at ON public.sistem_loglari USING btree (created_at DESC);
CREATE INDEX idx_ogrenci_user_id ON public.ogrenci USING btree (user_id);
CREATE INDEX idx_personel_user_id ON public.akademik_personel USING btree (user_id);
CREATE INDEX idx_risk_hist_ogrenci ON public.risk_tarihcesi USING btree (ogrenci_id);
