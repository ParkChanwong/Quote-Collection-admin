import { useId, type ReactNode, type Key } from 'react';
import './DataTable.scss';

export type TableColumn<T> = {
    key: string;
    header: string;
    render: (item: T, index: number) => ReactNode;
    className?: string;
    width?: number;
    align?: 'left' | 'center' | 'right';
};

type DataTableProps<T> = {
    title: string;
    count: number;
    description?: string;
    columns: TableColumn<T>[];
    items: T[];
    rowKey: (item: T) => Key;
    toolbar?: ReactNode;
    footer?: ReactNode;
    loading?: boolean;
    emptyMessage: string;
    className?: string;
};

export default function DataTable<T>({ title, count, description, columns, items, rowKey, toolbar, footer, loading = false, emptyMessage, className = '' }: DataTableProps<T>) {
    const titleId = useId();
    return (
        <section className={`data-table-panel ${className}`} aria-labelledby={titleId}>
            <div className="data-table-heading">
                <div><h2 id={titleId}>{title} <span>{count}</span></h2>{description && <p>{description}</p>}</div>
                {toolbar}
            </div>
            <div className="data-table-scroll" role="region" aria-label={`${title} 표`} tabIndex={0}>
                <table className="data-table" aria-busy={loading}>
                    <caption>{title}</caption>
                    <thead><tr>{columns.map(column => <th key={column.key} scope="col" className={column.className} style={{ width: column.width, textAlign: column.align }}>{column.header}</th>)}</tr></thead>
                    <tbody>
                        {!loading && items.map((item, index) => <tr key={rowKey(item)}>{columns.map(column => <td key={column.key} className={column.className} style={{ textAlign: column.align }}>{column.render(item, index)}</td>)}</tr>)}
                        {(loading || items.length === 0) && <tr><td colSpan={columns.length} className="data-table-empty"><span role="status">{loading ? `${title}을 불러오는 중입니다.` : emptyMessage}</span></td></tr>}
                    </tbody>
                </table>
            </div>
            {footer && <footer className="data-table-footer">{footer}</footer>}
        </section>
    );
}
