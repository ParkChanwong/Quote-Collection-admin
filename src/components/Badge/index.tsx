import type { ReactNode } from 'react';
import './Badge.scss';

export default function Badge({ children }: { children: ReactNode }) {
    return <span className="table-tag">{children}</span>;
}
