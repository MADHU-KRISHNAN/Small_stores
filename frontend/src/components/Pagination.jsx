import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

export default function Pagination({ page, totalPages, totalElements, size, onPageChange, onSizeChange }) {
    const startItem = page * size + 1;
    const endItem = Math.min((page + 1) * size, totalElements);

    return (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2">
            <div className="flex items-center space-x-4">
                <p className="text-sm text-surface-500">
                    Showing <span className="text-surface-300 font-medium">{startItem}</span>–<span className="text-surface-300 font-medium">{endItem}</span> of{' '}
                    <span className="text-surface-300 font-medium">{totalElements}</span>
                </p>
                {onSizeChange && (
                    <select
                        value={size}
                        onChange={(e) => onSizeChange(Number(e.target.value))}
                        className="bg-surface-800/50 border border-surface-700/30 rounded-lg text-sm text-surface-300 px-2 py-1.5 outline-none focus:ring-2 focus:ring-brand-500/30"
                    >
                        {[5, 10, 20, 50].map(s => (
                            <option key={s} value={s}>{s} per page</option>
                        ))}
                    </select>
                )}
            </div>
            <div className="flex items-center space-x-2">
                <button
                    onClick={() => onPageChange(page - 1)}
                    disabled={page === 0}
                    className="btn-secondary !p-2 disabled:opacity-30"
                >
                    <ChevronLeftIcon className="w-4 h-4" />
                </button>
                {/* Page numbers */}
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                        pageNum = i;
                    } else if (page < 3) {
                        pageNum = i;
                    } else if (page > totalPages - 4) {
                        pageNum = totalPages - 5 + i;
                    } else {
                        pageNum = page - 2 + i;
                    }
                    return (
                        <button
                            key={pageNum}
                            onClick={() => onPageChange(pageNum)}
                            className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${pageNum === page
                                ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/25'
                                : 'text-surface-400 hover:bg-surface-800/50 hover:text-surface-200'
                                }`}
                        >
                            {pageNum + 1}
                        </button>
                    );
                })}
                <button
                    onClick={() => onPageChange(page + 1)}
                    disabled={page === totalPages - 1}
                    className="btn-secondary !p-2 disabled:opacity-30"
                >
                    <ChevronRightIcon className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
