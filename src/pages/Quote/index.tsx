import { isAxiosError } from 'axios';
import ChevronsRightIcon from '../../assets/icons/chevrons-right.svg?react';
import ChevronsLeftIcon from '../../assets/icons/chevrons-left.svg?react';
import ChevronRightIcon from '../../assets/icons/chevron-right.svg?react';
import ChevronLeftIcon from '../../assets/icons/chevron-left.svg?react';
import { useEffect, useRef, useState } from 'react';
import './Quote.scss';
import { api } from '../../api/axios';
import QuoteFormModal, { type QuoteSubmitValues } from '../../components/QuoteFormModal';
import DeleteModal from '../../components/DeleteModal';

type QuoteDTO = {
    id: number;
    personName: string;
    themeName: string;
    quote: string;
}

type SearchType = 'person' | 'theme' | 'content';
const searchLabels = { person: '인물', theme: '주제', content: '키워드' };
const PAGE_SIZE = 10;

const Quote = () => {
    const [quoteList, setQuoteList] = useState<QuoteDTO[]>([])
    const [quoteForm, setQuoteForm] = useState<{ mode: 'create' } | { mode: 'edit'; quote: QuoteDTO } | null>(null);
    const [saving, setSaving] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const saveInFlight = useRef(false);
    const [deletingQuote, setDeletingQuote] = useState<QuoteDTO | null>(null);
    const [searchType, setSearchType] = useState<SearchType>('person');
    const [searchText, setSearchText] = useState('');
    const [search, setSearch] = useState({ type: 'person' as SearchType, keyword: '' });
    const [revision, setRevision] = useState(0);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [totalPages, setTotalPages] = useState(0);
    const [total, setTotal] = useState(0);
    const currentPage = Math.max(1, Math.min(page, totalPages));
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    const firstPage = Math.max(1, Math.min(currentPage - 2, totalPages - 4));
    const pageNumbers = Array.from({ length: Math.min(5, totalPages) }, (_, index) => firstPage + index);

    const visibleQuotes = search.keyword ? quoteList.slice(startIndex, startIndex + PAGE_SIZE) : quoteList;
    const requestPage = search.keyword ? 1 : currentPage;

    useEffect(() => {
        const controller = new AbortController();
        api.get(search.keyword ? `/quote/${search.type}` : '/quote', {
            params: search.keyword ? { keyword: search.keyword } : { page: requestPage },
            signal: controller.signal,
        }).then(res => {
            if (controller.signal.aborted) return;
            setQuoteList(res.data.result);
            setTotal(search.keyword ? res.data.result.length : res.data.total);
            setTotalPages(search.keyword ? Math.ceil(res.data.result.length / PAGE_SIZE) : res.data.totalPage);
            setError('');
        }).catch(() => {
            if (controller.signal.aborted) return;
            setQuoteList([]);
            setTotal(0);
            setTotalPages(0);
            setError('명언 목록을 불러오지 못했습니다. 다시 검색해 주세요.');
        }).finally(() => {
            if (!controller.signal.aborted) setLoading(false);
        });
        return () => controller.abort();
    }, [requestPage, search, revision]);

    const applySearch = (reset = false) => {
        if (reset) {
            setSearchText('');
            setSearchType('person');
        }
        setPage(1);
        setQuoteList([]);
        setLoading(true);
        setError('');
        setSearch({ type: reset ? 'person' : searchType, keyword: reset ? '' : searchText.trim() });
    };

    const changePage = (nextPage: number) => {
        if (nextPage === currentPage) return;
        if (!search.keyword) {
            setQuoteList([]);
            setLoading(true);
        }
        setPage(nextPage);
    };

    const saveQuote = async (values: QuoteSubmitValues) => {
        if (!quoteForm || saveInFlight.current) return;
        saveInFlight.current = true;
        setSaving(true);
        setSubmitError('');
        try {
            if (quoteForm.mode === 'create') {
                await api.post('/quote', values);
            } else {
                await api.put(`/quote/${quoteForm.quote.id}`, values);
            }
            setQuoteForm(null);
            setLoading(true);
            setQuoteList([]);
            setError('');
            setRevision(value => value + 1);
        } catch (error) {
            if (isAxiosError<{ message?: string }>(error)) {
                const status = error.response?.status;
                if (status === 401) {
                    setSubmitError('로그인 정보가 없거나 만료되었습니다. 다시 로그인한 뒤 저장해 주세요. (401)');
                } else if (status === 403) {
                    setSubmitError('관리자 권한이 필요합니다. 관리자 계정으로 로그인해 주세요. (403)');
                } else if (!error.response) {
                    setSubmitError('서버에 연결하지 못했습니다. 서버 실행 상태와 네트워크를 확인해 주세요.');
                } else {
                    const message = error.response.data?.message;
                    setSubmitError(`${typeof message === 'string' ? message : '저장하지 못했습니다. 다시 시도해 주세요.'} (${status})`);
                }
            } else {
                setSubmitError('저장 중 오류가 발생했습니다. 다시 시도해 주세요.');
            }
        } finally {
            saveInFlight.current = false;
            setSaving(false);
        }
    };

    const deleteQuote = (id: number) => {
        api.delete(`/quote/${id}`).then(() => {
            setLoading(true);
            setQuoteList([]);
            if (visibleQuotes.length === 1 && currentPage > 1) setPage(currentPage - 1);
            setRevision(value => value + 1);
            setDeletingQuote(null);
        }).catch(() => {
            setError('명언을 삭제하지 못했습니다. 새로고침 후 다시 시도해 주세요.');
        })
    }

    return (
        <section className="quote-page" aria-labelledby="quote-page-title">
            <div className="quote-page-heading">
                <div>
                    <p className="quote-page-eyebrow">QUOTE COLLECTION</p>
                    <h1 id="quote-page-title">명언 관리</h1>
                    <p className="quote-page-description">오래 남을 좋은 문장들을 한곳에서 관리해요.</p>
                </div>
            </div>
            {error && <p className="quote-search-error" role="alert">{error}</p>}
            <section className="quote-list" aria-labelledby="quote-list-title">
                <div className="quote-list-heading">
                    <h2 id="quote-list-title">명언 목록 <span>{total}</span></h2>
                    <form className="quote-search" role="search" aria-label="명언 검색" onSubmit={event => { event.preventDefault(); applySearch(); }}>
                        <select aria-label="검색 기준" value={searchType} onChange={event => setSearchType(event.target.value as SearchType)}>
                            <option value="content">명언</option>
                            <option value="person">인물</option>
                            <option value="theme">주제</option>
                        </select>
                        <input type="search" aria-label="검색어" value={searchText} onChange={event => setSearchText(event.target.value)} placeholder={`${searchLabels[searchType]} 검색어를 입력해 주세요`} />
                        <button type="submit" className="quote-search-submit">검색</button>
                        <button type="button" onClick={() => applySearch(true)}>초기화</button>
                        <button type="button" className="quote-create-button" onClick={() => { setSubmitError(''); setQuoteForm({ mode: 'create' }); }}>등록</button>
                    </form>
                </div>
                <div className="quote-table-scroll" role="region" aria-label="명언 목록 표" tabIndex={0}>
                    <table className="quote-table">
                        <caption>명언 내용, 작가 및 카테고리 목록</caption>
                        <thead>
                            <tr><th scope="col">번호</th><th scope="col">명언</th><th scope="col">인물</th><th scope="col">주제</th><th scope="col">관리</th></tr>
                        </thead>
                        <tbody>
                            {(!loading ? visibleQuotes : []).map((quote, index) => (
                                <tr key={quote.id}>
                                    <td className="quote-table-number">{String(startIndex + index + 1).padStart(2, '0')}</td>
                                    <td className="quote-table-content">{quote.quote}</td>
                                    <td className="quote-table-author">{quote.personName}</td>
                                    <td><span className="quote-category">{quote.themeName}</span></td>
                                    <td>
                                        <div className="quote-row-actions">
                                            <button type="button" className="quote-edit-button" onClick={() => { setSubmitError(''); setQuoteForm({ mode: 'edit', quote }); }} aria-label={`${quote.quote} 수정`}>수정</button>
                                            <button type="button" className="quote-delete-button" onClick={() => setDeletingQuote(quote)} aria-label={`${quote.quote} 삭제`}>삭제</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {(loading || visibleQuotes.length === 0) && (
                                <tr><td colSpan={5} className="quote-table-empty" role="status">
                                    {loading ? '명언 목록을 불러오는 중입니다.' : error || (search.keyword ? '검색 결과가 없습니다.' : '등록된 명언이 없습니다.')}
                                </td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="quote-list-footer">
                    <span aria-live="polite">전체 {total}개 중 {visibleQuotes.length ? startIndex + 1 : 0}–{visibleQuotes.length ? startIndex + visibleQuotes.length : 0}개</span>
                    <nav className="quote-pagination" aria-label="명언 목록 페이지">
                        <button type="button" disabled={loading || currentPage === 1} onClick={() => changePage(1)} aria-label="첫 페이지"><ChevronsLeftIcon aria-hidden="true" /></button>
                        <button type="button" disabled={loading || currentPage === 1} onClick={() => changePage(currentPage - 1)} aria-label="이전 페이지"><ChevronLeftIcon aria-hidden="true" /></button>
                        {pageNumbers.map(number => (
                            <button key={number} type="button" aria-label={`${number}페이지`} aria-current={currentPage === number ? 'page' : undefined} disabled={loading} onClick={() => changePage(number)}>{number}</button>
                        ))}
                        <button type="button" disabled={loading || currentPage >= totalPages} onClick={() => changePage(currentPage + 1)} aria-label="다음 페이지"><ChevronRightIcon aria-hidden="true" /></button>
                        <button type="button" disabled={loading || currentPage >= totalPages} onClick={() => changePage(totalPages)} aria-label="마지막 페이지"><ChevronsRightIcon aria-hidden="true" /></button>
                    </nav>
                </div>
            </section>
            {quoteForm && (
                <QuoteFormModal
                    mode={quoteForm.mode}
                    initialValues={quoteForm.mode === 'edit' ? quoteForm.quote : undefined}
                    onClose={() => setQuoteForm(null)}
                    onSubmit={saveQuote}
                    saving={saving}
                    submitError={submitError}
                />
            )}
            {deletingQuote && (
                <DeleteModal
                    onClose={() => setDeletingQuote(null)}
                    description="삭제할 명언을 확인해 주세요."
                    onConfirm={() => deleteQuote(deletingQuote.id)}
                >
                    <blockquote className="quote-delete-preview">
                        <p>{deletingQuote.quote}</p>
                        <footer>{deletingQuote.personName} · {deletingQuote.themeName}</footer>
                    </blockquote>
                </DeleteModal>
            )}
        </section>
    );
};

export default Quote;
