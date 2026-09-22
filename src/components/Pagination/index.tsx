import ChevronsRightIcon from '../../assets/icons/chevrons-right.svg?react';
import ChevronsLeftIcon from '../../assets/icons/chevrons-left.svg?react';
import ChevronRightIcon from '../../assets/icons/chevron-right.svg?react';
import ChevronLeftIcon from '../../assets/icons/chevron-left.svg?react';
import './Pagination.scss';

type PaginationProps = {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    disabled?: boolean;
    label: string;
};

export default function Pagination({ currentPage, totalPages, onPageChange, disabled = false, label }: PaginationProps) {
    const page = Math.max(1, Math.min(currentPage, totalPages));
    const firstPage = Math.max(1, Math.min(page - 2, totalPages - 4));
    const pageNumbers = Array.from({ length: Math.max(0, Math.min(5, totalPages)) }, (_, index) => firstPage + index);
    const atStart = disabled || page === 1;
    const atEnd = disabled || page >= totalPages;

    return (
        <nav className="pagination" aria-label={label}>
            <button type="button" disabled={atStart} onClick={() => onPageChange(1)} aria-label="첫 페이지"><ChevronsLeftIcon aria-hidden="true" /></button>
            <button type="button" disabled={atStart} onClick={() => onPageChange(page - 1)} aria-label="이전 페이지"><ChevronLeftIcon aria-hidden="true" /></button>
            {pageNumbers.map(number => (
                <button key={number} type="button" aria-label={`${number}페이지`} aria-current={page === number ? 'page' : undefined} disabled={disabled} onClick={() => onPageChange(number)}>{number}</button>
            ))}
            <button type="button" disabled={atEnd} onClick={() => onPageChange(page + 1)} aria-label="다음 페이지"><ChevronRightIcon aria-hidden="true" /></button>
            <button type="button" disabled={atEnd} onClick={() => onPageChange(totalPages)} aria-label="마지막 페이지"><ChevronsRightIcon aria-hidden="true" /></button>
        </nav>
    );
}
