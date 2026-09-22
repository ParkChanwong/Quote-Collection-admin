import LogoutIcon from '../assets/icons/logout.svg?react';
import { useState } from 'react';
import QuoteListIcon from '../assets/icons/quote-list.svg?react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { clearAuthToken } from '../api/axios';
import './Layout.scss';

export type AdminLayoutContext = { headerSlot: HTMLDivElement | null };

type AdminLayoutProps = {
    title: string;
    subtitle: string;
    badge?: string;
};

const AdminLayout = ({ title, subtitle, badge }: AdminLayoutProps) => {
    const navigate = useNavigate();
    const [headerSlot, setHeaderSlot] = useState<HTMLDivElement | null>(null);

    const handleLogout = () => {
        clearAuthToken();
        navigate('/login', { replace: true });
    };

    return (
        <div className="admin-layout">
            <a className="admin-skip-link" href="#admin-content">본문으로 이동</a>
            <aside className="admin-sidebar" aria-label="관리 메뉴">
                <Link className="admin-brand" to="/quotes" aria-label="명언 컬렉션 홈">
                    <span className="admin-brand-symbol" aria-hidden="true">“</span>
                    <span className="admin-brand-name">명언 컬렉션<small>QUOTE COLLECTION</small></span>
                </Link>

                <nav className="admin-navigation" aria-label="주 메뉴">
                    <p className="admin-navigation-label">WORKSPACE</p>
                    <NavLink className={({ isActive }) => `admin-nav-link${isActive ? ' is-active' : ''}`} to="/quotes">
                        <QuoteListIcon aria-hidden="true" />
                        <span>명언 관리</span>
                    </NavLink>
                    <NavLink className={({ isActive }) => `admin-nav-link${isActive ? ' is-active' : ''}`} to="/persons">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><circle cx="12" cy="8" r="4" /><path d="M4 21v-2a8 8 0 0 1 16 0v2" /></svg>
                        <span>인물 관리</span>
                    </NavLink>
                    <NavLink className={({ isActive }) => `admin-nav-link${isActive ? ' is-active' : ''}`} to="/categories">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><rect x="3" y="3" width="7" height="7" rx="2" /><rect x="14" y="3" width="7" height="7" rx="2" /><rect x="3" y="14" width="7" height="7" rx="2" /><rect x="14" y="14" width="7" height="7" rx="2" /></svg>
                        <span>카테고리 관리</span>
                    </NavLink>
                </nav>

                <div className="admin-sidebar-bottom">
                    <p className="admin-sidebar-note">작은 문장, 오래 남는 울림.</p>
                    <button className="admin-logout" type="button" onClick={handleLogout}>
                        <LogoutIcon aria-hidden="true" />
                        <span>로그아웃</span>
                    </button>
                </div>
            </aside>

            <main className="admin-content" id="admin-content" tabIndex={-1} aria-labelledby="admin-page-title">
                <div className="admin-content-inner">
                    <header className="admin-page-heading">
                        <div>
                            <p className="admin-page-eyebrow">QUOTE COLLECTION</p>
                            <h1 id="admin-page-title" className="admin-page-title">{title}</h1>
                            <p className="admin-page-subtitle">{subtitle}</p>
                        </div>
                        <div className="admin-page-actions" ref={setHeaderSlot} />
                        {badge && <span className="admin-page-badge">{badge}</span>}
                    </header>
                    <Outlet context={{ headerSlot } satisfies AdminLayoutContext} />
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
