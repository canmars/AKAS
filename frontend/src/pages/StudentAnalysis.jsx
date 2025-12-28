import React, { useState, useEffect, useMemo } from 'react';
import { Search, Download, Eye, AlertCircle } from 'lucide-react';
import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    getFilteredRowModel,
    flexRender,
} from '@tanstack/react-table';
import api from '../services/api';
import StudentDetailModal from '../components/studentAnalysis/StudentDetailModal';

const StudentAnalysis = () => {
    // State Management
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // Filter States
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedProgram, setSelectedProgram] = useState('');
    const [selectedRiskLevel, setSelectedRiskLevel] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');
    
    // Pagination
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 20,
    });
    const [totalPages, setTotalPages] = useState(0);
    const [totalRecords, setTotalRecords] = useState(0);

    // Fetch Students
    const fetchStudents = async () => {
        try {
            setLoading(true);
            const params = {
                page: pagination.pageIndex + 1,
                limit: pagination.pageSize,
                ...(searchTerm && { search: searchTerm }),
                ...(selectedProgram && { program_id: selectedProgram }),
                ...(selectedRiskLevel && { risk_level: selectedRiskLevel }),
                ...(selectedStatus && { status: selectedStatus }),
            };

            const response = await api.get('/students', { params });
            setStudents(response.data.data || []);
            setTotalPages(response.data.meta?.totalPages || 0);
            setTotalRecords(response.data.meta?.total || 0);
            setError(null);
        } catch (err) {
            console.error('Error fetching students:', err);
            setError('Öğrenci verileri yüklenirken bir hata oluştu.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const debounceTimer = setTimeout(() => {
            fetchStudents();
        }, 500); // Debounce for search

        return () => clearTimeout(debounceTimer);
    }, [searchTerm, selectedProgram, selectedRiskLevel, selectedStatus, pagination]);

    // Table Columns Definition
    const columns = useMemo(
        () => [
            {
                accessorKey: 'ad_soyad',
                header: 'Öğrenci',
                cell: ({ row }) => (
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                            {row.original.ad_soyad.split(' ').map(n => n[0]).join('').substring(0, 2)}
                        </div>
                        <div>
                            <div className="font-medium text-gray-900">{row.original.ad_soyad}</div>
                            <div className="text-sm text-gray-500">{row.original.ogrenci_no}</div>
                        </div>
                    </div>
                ),
            },
            {
                accessorKey: 'program',
                header: 'Program',
                cell: ({ row }) => (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {row.original.program}
                    </span>
                ),
            },
            {
                accessorKey: 'gno',
                header: 'GNO',
                cell: ({ row }) => {
                    const gno = row.original.gno;
                    const isLow = gno < 2.5;
                    return (
                        <span className={`font-semibold ${isLow ? 'text-red-600' : 'text-gray-900'}`}>
                            {gno.toFixed(2)}
                        </span>
                    );
                },
            },
            {
                accessorKey: 'risk_durumu',
                header: 'Risk',
                cell: ({ row }) => {
                    const { seviye, skor } = row.original.risk_durumu;
                    const badgeStyles = {
                        Kritik: 'bg-red-100 text-red-800',
                        Yuksek: 'bg-orange-100 text-orange-800',
                        Orta: 'bg-yellow-100 text-yellow-800',
                        Dusuk: 'bg-green-100 text-green-800',
                    };
                    const icons = {
                        Kritik: '🔴',
                        Yuksek: '🟠',
                        Orta: '🟡',
                        Dusuk: '🟢',
                    };
                    return (
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${badgeStyles[seviye] || 'bg-gray-100 text-gray-800'}`}>
                            {icons[seviye]} {seviye} ({skor})
                        </span>
                    );
                },
            },
            {
                accessorKey: 'danisman',
                header: 'Danışman',
                cell: ({ row }) => (
                    <div className="text-sm text-gray-700">{row.original.danisman}</div>
                ),
            },
            {
                accessorKey: 'durum',
                header: 'Durum',
                cell: ({ row }) => (
                    <span className="text-sm text-gray-600">{row.original.durum}</span>
                ),
            },
            {
                id: 'actions',
                header: 'İşlemler',
                cell: ({ row }) => (
                    <button
                        onClick={() => handleViewDetails(row.original.id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                        <Eye className="w-4 h-4" />
                        Detay
                    </button>
                ),
            },
        ],
        []
    );

    // Table Instance
    const table = useReactTable({
        data: students,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        manualPagination: true,
        pageCount: totalPages,
        state: {
            pagination,
        },
        onPaginationChange: setPagination,
    });

    // Handlers
    const handleViewDetails = async (studentId) => {
        try {
            const response = await api.get(`/students/${studentId}/details`);
            setSelectedStudent(response.data);
            setIsModalOpen(true);
        } catch (err) {
            console.error('Error fetching student details:', err);
            alert('Öğrenci detayları yüklenirken bir hata oluştu.');
        }
    };

    const handleExportExcel = () => {
        // TODO: Implement Excel export functionality
        alert('Excel export özelliği yakında eklenecek.');
    };

    // Get risk background color for row
    const getRowBgClass = (student) => {
        if (student.risk_durumu.seviye === 'Kritik') return 'bg-red-50';
        if (student.risk_durumu.seviye === 'Yuksek') return 'bg-orange-50';
        return 'bg-white';
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Öğrenci Analizi</h1>
                <p className="text-gray-600 mt-1">Tüm öğrencilerin detaylı akademik takibi</p>
            </div>

            {/* Filter Bar */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    {/* Search */}
                    <div className="lg:col-span-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Öğrenci ara (Ad, Soyad, No)..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    {/* Program Filter */}
                    <div>
                        <select
                            value={selectedProgram}
                            onChange={(e) => setSelectedProgram(e.target.value)}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">Tüm Programlar</option>
                            <option value="tezli-yl">Tezli YL</option>
                            <option value="doktora">Doktora</option>
                            <option value="tezsiz-uzaktan">Tezsiz (Uzaktan)</option>
                            <option value="tezsiz-io">Tezsiz (İÖ)</option>
                        </select>
                    </div>

                    {/* Risk Level Filter */}
                    <div>
                        <select
                            value={selectedRiskLevel}
                            onChange={(e) => setSelectedRiskLevel(e.target.value)}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">Tüm Risk Seviyeleri</option>
                            <option value="Kritik">🔴 Kritik</option>
                            <option value="Yuksek">🟠 Yüksek</option>
                            <option value="Orta">🟡 Orta</option>
                            <option value="Dusuk">🟢 Düşük</option>
                        </select>
                    </div>

                    {/* Export Button */}
                    <div>
                        <button
                            onClick={handleExportExcel}
                            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                        >
                            <Download className="w-4 h-4" />
                            Excel'e Aktar
                        </button>
                    </div>
                </div>
            </div>

            {/* Error State */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <p className="text-red-800">{error}</p>
                </div>
            )}

            {/* Student Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                ) : students.length === 0 ? (
                    <div className="text-center py-20">
                    </div>
                ) : (
                    <>
                        {/* Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    {table.getHeaderGroups().map((headerGroup) => (
                                        <tr key={headerGroup.id}>
                                            {headerGroup.headers.map((header) => (
                                                <th
                                                    key={header.id}
                                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                                >
                                                    {flexRender(
                                                        header.column.columnDef.header,
                                                        header.getContext()
                                                    )}
                                                </th>
                                            ))}
                                        </tr>
                                    ))}
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {table.getRowModel().rows.map((row) => (
                                        <tr
                                            key={row.id}
                                            className={`${getRowBgClass(row.original)} hover:bg-gray-100 transition-colors`}
                                        >
                                            {row.getVisibleCells().map((cell) => (
                                                <td key={cell.id} className="px-6 py-4 whitespace-nowrap">
                                                    {flexRender(
                                                        cell.column.columnDef.cell,
                                                        cell.getContext()
                                                    )}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                            <div className="text-sm text-gray-700">
                                <span className="font-medium">{totalRecords}</span> öğrenciden{' '}
                                <span className="font-medium">
                                    {pagination.pageIndex * pagination.pageSize + 1}
                                </span>
                                -{' '}
                                <span className="font-medium">
                                    {Math.min((pagination.pageIndex + 1) * pagination.pageSize, totalRecords)}
                                </span>{' '}
                                arası gösteriliyor
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => table.previousPage()}
                                    disabled={!table.getCanPreviousPage()}
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Önceki
                                </button>
                                <span className="text-sm text-gray-700">
                                    Sayfa <span className="font-medium">{pagination.pageIndex + 1}</span> /{' '}
                                    <span className="font-medium">{totalPages}</span>
                                </span>
                                <button
                                    onClick={() => table.nextPage()}
                                    disabled={!table.getCanNextPage()}
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Sonraki
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Student Detail Modal */}
            {isModalOpen && selectedStudent && (
                <StudentDetailModal
                    student={selectedStudent}
                    isOpen={isModalOpen}
                    onClose={() => {
                        setIsModalOpen(false);
                        setSelectedStudent(null);
                    }}
                />
            )}
        </div>
    );
};

export default StudentAnalysis;

