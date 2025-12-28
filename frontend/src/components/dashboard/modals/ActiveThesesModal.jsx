import React, { useState, useEffect } from 'react';
import api from '../../../services/api';
import { SkeletonListItem } from '../../common/SkeletonLoader';
import EmptyState from '../../common/EmptyState';

const ActiveThesesModal = () => {
    const [theses, setTheses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState({ durum: 'all', donem: 'all' });

    useEffect(() => {
        const fetchTheses = async () => {
            try {
                const data = await api.get('/dashboard/details/active-theses');
                setTheses(data || []);
            } catch (error) {
                console.error('Error fetching active theses:', error);
                setTheses([]);
            } finally {
                setLoading(false);
            }
        };
        fetchTheses();
    }, []);

    const filteredTheses = theses.filter(thesis => {
        if (filter.durum !== 'all' && thesis.durum !== filter.durum) return false;
        // Donem filtresi için tarih kontrolü eklenebilir
        return true;
    });

    const getStatusColor = (durum) => {
        switch (durum) {
            case 'Juri':
                return 'bg-purple-100 text-purple-700';
            case 'Yazim':
                return 'bg-blue-100 text-blue-700';
            case 'Duzeltme':
                return 'bg-amber-100 text-amber-700';
            case 'Oneri':
                return 'bg-slate-100 text-slate-700';
            default:
                return 'bg-gray-100 text-gray-700';
        }
    };

    if (loading) {
        return (
            <div className="space-y-2">
                {[1, 2, 3, 4, 5].map(i => (
                    <SkeletonListItem key={i} />
                ))}
            </div>
        );
    }

    if (theses.length === 0) {
        return (
            <EmptyState
                icon="📝"
                title="Aktif tez bulunamadı"
                description="Şu an aktif tez kaydı bulunmuyor."
            />
        );
    }

    return (
        <div className="space-y-4">
            {/* Filters */}
            <div className="flex gap-3">
                <select
                    value={filter.durum}
                    onChange={(e) => setFilter({ ...filter, durum: e.target.value })}
                    className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                    <option value="all">Tüm Durumlar</option>
                    <option value="Juri">Jüri</option>
                    <option value="Yazim">Yazım</option>
                    <option value="Duzeltme">Düzeltme</option>
                    <option value="Oneri">Öneri</option>
                </select>
            </div>

            {/* Thesis List */}
            <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                {filteredTheses.map((thesis) => (
                    <div
                        key={thesis.tez_id}
                        className="flex items-start gap-4 p-4 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
                    >
                        <img
                            src={thesis.avatar_url || `https://ui-avatars.com/api/?name=${thesis.ogrenci_adi}&background=indigo&color=fff`}
                            alt={thesis.ogrenci_adi}
                            className="w-12 h-12 rounded-full border-2 border-slate-200"
                        />
                        <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-bold text-slate-900 mb-1">{thesis.tez_baslik}</h4>
                            <p className="text-xs text-slate-500 mb-2">
                                {thesis.ogrenci_no} • {thesis.ogrenci_adi} • {thesis.program_adi}
                            </p>
                            <p className="text-xs text-slate-600">
                                <span className="font-semibold">Danışman:</span> {thesis.danisman_adi}
                            </p>
                            {thesis.baslangic_tarihi && (
                                <p className="text-xs text-slate-500 mt-1">
                                    Başlangıç: {new Date(thesis.baslangic_tarihi).toLocaleDateString('tr-TR')}
                                </p>
                            )}
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(thesis.durum)}`}>
                            {thesis.durum}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ActiveThesesModal;

