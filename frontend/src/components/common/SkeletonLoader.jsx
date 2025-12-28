import React from 'react';

// Skeleton Card Component
export const SkeletonCard = ({ className = '' }) => {
    return (
        <div className={`bg-white rounded-2xl border border-gray-100 p-6 ${className}`}>
            <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
            </div>
        </div>
    );
};

// Skeleton Table Row
export const SkeletonTableRow = () => {
    return (
        <tr className="animate-pulse">
            <td className="px-4 py-3">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
            </td>
            <td className="px-4 py-3">
                <div className="h-4 bg-gray-200 rounded w-32"></div>
            </td>
            <td className="px-4 py-3">
                <div className="h-4 bg-gray-200 rounded w-20"></div>
            </td>
            <td className="px-4 py-3">
                <div className="h-4 bg-gray-200 rounded w-16"></div>
            </td>
        </tr>
    );
};

// Skeleton List Item
export const SkeletonListItem = () => {
    return (
        <div className="animate-pulse flex items-center gap-4 p-4 border-b border-gray-100">
            <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
            <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
            </div>
            <div className="h-6 bg-gray-200 rounded w-20"></div>
        </div>
    );
};

export default SkeletonCard;

