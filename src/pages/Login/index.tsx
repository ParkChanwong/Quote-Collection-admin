import { useState, type FormEvent } from 'react';
import { api, setAuthToken } from '../../api/axios';
import { useNavigate } from 'react-router-dom';
import TextInput from '../../components/TextInput';
import './Login.scss';

const Login = () => {
    const navigate = useNavigate();
    const [message, setMessage] = useState('');
    const [userId, setUserId] = useState<string>('');
    const [userPw, setUserPw] = useState<string>('');
    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setMessage('로그인 서비스 연결을 준비 중입니다. 관리자에게 문의해 주세요.');
    };
    const loginSubmit = () => {
        api.post("/account/signin?auth=0", {
            userId: userId,
            userPw: userPw
        }).then(result => {
            setAuthToken(result.data.result);
            navigate('/');
        }).catch(e => {
            setMessage(e.response.data.message);
        })
    }
    
    return (
        <main className="login-wrapper">
            <section className="login-story" aria-label="명언 컬렉션 소개">
                <a className="login-brand" href="/login"><span className="brand-symbol" aria-hidden="true">“</span><span>명언 컬렉션<small>QUOTE COLLECTION</small></span></a>
                <div className="story-content">
                    <span className="eyebrow">WORDS THAT STAY WITH US</span>
                    <h1>좋은 문장이 모여,<br />더 나은 하루가 되도록.</h1>
                    <p>누군가의 하루에 오래 남을 한 문장.<br />그 소중한 이야기를 함께 가꾸는 공간입니다.</p>
                    <div className="quote-art">
                        <div className="quote-orbit" aria-hidden="true" />
                        <div className="quote-sheet quote-sheet-back" aria-hidden="true" />
                        <figure className="quote-sheet">
                            <span className="quote-number">A LITTLE INSPIRATION / 001</span>
                            <span className="quote-mark" aria-hidden="true">“</span>
                            <blockquote>작은 문장 하나가<br />하루의 방향을 바꾸기도.</blockquote>
                            <figcaption>명언 컬렉션의 작은 생각</figcaption>
                            <div className="quote-card-footer">오늘을 위한 한 문장 <span aria-hidden="true">✳</span></div>
                        </figure>
                    </div>
                </div>
                <div className="story-footer">작은 문장, 오래 남는 울림.</div>
            </section>
            <section className="login-panel" aria-labelledby="login-title">
                <span className="admin-badge"><i />ADMIN WORKSPACE</span>
                <div className="login-box">
                    <header className="login-heading">
                        <span className="eyebrow">WELCOME BACK</span>
                        <h2 id="login-title">다시 만나 반가워요</h2>
                        <p>명언 컬렉션 관리를 위해 로그인해 주세요.</p>
                    </header>
                    <form onSubmit={handleSubmit}>
                        <TextInput
                            wrapperClassName="login-field"
                            label="아이디"
                            id="admin-id"
                            name="username"
                            autoComplete="username"
                            placeholder="관리자 아이디를 입력해 주세요"
                            required
                            onChange={e => {
                                setUserId(e.target.value);
                            }}
                        />
                        <TextInput
                            wrapperClassName="login-field"
                            label="비밀번호"
                            id="admin-password"
                            name="password"
                            type="password"
                            autoComplete="current-password"
                            placeholder="비밀번호를 입력해 주세요"
                            required
                            onChange={e => {
                                setUserPw(e.target.value);
                            }}
                        />
                        <p className="login-access-note">승인된 관리자 계정으로 접속해 주세요.</p>
                        <button className="login-submit" type="submit" onClick={loginSubmit}>로그인<span aria-hidden="true">↗</span></button>
                        <p className="login-message" role="status">{message}</p>
                    </form>
                    <div className="login-help"><span aria-hidden="true">ⓘ</span><p>계정에 문제가 있으신가요?<br /><span>서비스 운영 담당자에게 문의해 주세요.</span></p></div>
                </div>
                <footer className="login-footer">© {new Date().getFullYear()} Quote Collection<span>좋은 문장의 시작, 이곳에서.</span></footer>
            </section>
        </main>
    );
};

export default Login;
