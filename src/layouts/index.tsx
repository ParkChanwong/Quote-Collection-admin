import QuoteListIcon from '../assets/icons/quote-list.svg?react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { clearAuthToken } from '../api/axios';
import './Layout.scss';

const AdminLayout = () => {
    const navigate = useNavigate();

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
                </nav>

                <div className="admin-sidebar-bottom">
                    <p className="admin-sidebar-note">작은 문장, 오래 남는 울림.</p>
                    <button className="admin-logout" type="button" onClick={handleLogout}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M10 4H5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h5M10 12h10m-4-4 4 4-4 4" />
                        </svg>
                        <span>로그아웃</span>
                    </button>
                </div>
            </aside>

            <main className="admin-content" id="admin-content" tabIndex={-1}>
                <div className="admin-content-inner"><Outlet /></div>
            </main>
        </div>
    );
};

export default AdminLayout;
