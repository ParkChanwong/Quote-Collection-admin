import type { ReactNode } from 'react';
import './SearchBar.scss';

type SearchBarProps = {
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    onSearch?: () => void;
    filter?: ReactNode;
    children?: ReactNode;
};

export default function SearchBar({ label, value, onChange, placeholder, onSearch, filter, children }: SearchBarProps) {
    return <form className="table-search" role="search" aria-label={label} onSubmit={event => { event.preventDefault(); onSearch?.(); }}>
        {filter}
        <input type="search" aria-label={`${label} 검색어`} value={value} onChange={event => onChange(event.target.value)} placeholder={placeholder} />
        {children}
    </form>;
}
