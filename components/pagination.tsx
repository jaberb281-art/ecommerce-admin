'use client';

interface Props {
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export function Pagination({ page, totalPages, onPageChange }: Props) {
    return (
        <div className="flex items-center gap-2 justify-end mt-4">
            <button
                onClick={() => onPageChange(page - 1)}
                disabled={page <= 1}
                className="px-3 py-1 rounded border text-sm disabled:opacity-40"
            >
                Previous
            </button>
            <span className="text-sm text-gray-600">
                Page {page} of {totalPages}
            </span>
            <button
                onClick={() => onPageChange(page + 1)}
                disabled={page >= totalPages}
                className="px-3 py-1 rounded border text-sm disabled:opacity-40"
            >
                Next
            </button>
        </div>
    );
}