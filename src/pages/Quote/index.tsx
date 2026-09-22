import SearchBar from '../../components/SearchBar';
import RowActions from '../../components/RowActions';
import Badge from '../../components/Badge';
import TableActions from '../../components/TableActions';
import { normalizeSearch } from '../../utils/search';
import DataTable, { type TableColumn } from '../../components/DataTable';
import Pagination from '../../components/Pagination';
import { isAxiosError } from 'axios';
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import './Quote.scss';
import { quoteApi, PAGE_SIZE, type QuoteDTO, type SearchType, type QuoteSubmitValues } from '../../api/quote';
import QuoteFormModal from '../../components/QuoteFormModal';
import DeleteModal from '../../components/DeleteModal';

const searchLabels = { person: '인물', theme: '주제', content: '키워드' };

const Quote = () => {
    const client = useQueryClient();
    const [quoteForm, setQuoteForm] = useState<{ mode: 'create' } | { mode: 'edit'; quote: QuoteDTO } | null>(null);
    const [submitError, setSubmitError] = useState('');
    const [deletingQuote, setDeletingQuote] = useState<QuoteDTO | null>(null);
    const [searchType, setSearchType] = useState<SearchType>('person');
    const [searchText, setSearchText] = useState('');
    const [search, setSearch] = useState({ type: 'person' as SearchType, keyword: '' });
    const [page, setPage] = useState(1);
    const requestPage = search.keyword ? 1 : page;
    const listQuery = useQuery({
        queryKey: ['quotes', search, requestPage],
        queryFn: ({ signal }) => quoteApi.list(requestPage, search, signal),
    });
    const total = listQuery.data?.total ?? 0;
    const totalPages = listQuery.data?.totalPages ?? 0;
    const currentPage = search.keyword ? Math.max(1, Math.min(page, totalPages)) : page;
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    const quoteList = listQuery.data?.items ?? [];
    const visibleQuotes = search.keyword ? quoteList.slice(startIndex, startIndex + PAGE_SIZE) : quoteList;
    const loading = listQuery.isPending;
    const error = listQuery.isError ? '명언 목록을 불러오지 못했습니다. 다시 검색해 주세요.' : '';
    const saveMutation = useMutation({
        mutationFn: ({ values, id }: { values: QuoteSubmitValues; id?: number }) => id === undefined ? quoteApi.create(values) : quoteApi.update(id, values),
        onSuccess: async () => {
            await client.invalidateQueries({ queryKey: ['quotes'] });
            setQuoteForm(null);
        },
    });
    const deleteMutation = useMutation({
        mutationFn: quoteApi.remove,
        onSuccess: async () => {
            if (visibleQuotes.length === 1 && currentPage > 1) setPage(currentPage - 1);
            await client.invalidateQueries({ queryKey: ['quotes'] });
            setDeletingQuote(null);
        },
    });
    const saving = saveMutation.isPending;

    const applySearch = (reset = false) => {
        if (reset) {
            setSearchText('');
            setSearchType('person');
        }
        setPage(1);
        const next = { type: reset ? 'person' as const : searchType, keyword: reset ? '' : normalizeSearch(searchText) };
        if (page === 1 && next.type === search.type && next.keyword === search.keyword) void listQuery.refetch();
        setSearch(next);
    };

    const changePage = (nextPage: number) => setPage(nextPage);

    const saveQuote = async (values: QuoteSubmitValues) => {
        if (!quoteForm || saving) return;
        setSubmitError('');
        try {
            await saveMutation.mutateAsync({ values, id: quoteForm.mode === 'edit' ? quoteForm.quote.id : undefined });
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
        }
    };

    const columns: TableColumn<QuoteDTO>[] = [
        { key: 'number', header: '번호', width: 80, align: 'center', className: 'quote-table-number', render: (_, index) => String(startIndex + index + 1).padStart(2, '0') },
        { key: 'quote', header: '명언', className: 'quote-table-content', render: quote => quote.quote },
        { key: 'person', header: '인물', width: 160, align: 'center', className: 'quote-table-author', render: quote => quote.personName },
        { key: 'theme', header: '주제', width: 120, align: 'center', render: quote => <Badge>{quote.themeName}</Badge> },
        { key: 'actions', header: '관리', width: 156, align: 'center', render: quote => <RowActions label={quote.quote} onEdit={() => { setSubmitError(''); setQuoteForm({ mode: 'edit', quote }); }} onDelete={() => { deleteMutation.reset(); setDeletingQuote(quote); }} /> },
    ];

    return (
        <>
            {error && <p className="quote-search-error" role="alert">{error}</p>}
            <DataTable
                className="quote-list"
                title="명언 목록"
                count={total}
                columns={columns}
                items={visibleQuotes}
                rowKey={quote => quote.id}
                loading={loading}
                emptyMessage={error || (search.keyword ? '검색 결과가 없습니다.' : '등록된 명언이 없습니다.')}
                toolbar={
                    <SearchBar label="명언 검색" value={searchText} onChange={setSearchText} placeholder={`${searchLabels[searchType]} 검색어를 입력해 주세요`} onSearch={() => applySearch()} filter={<select aria-label="검색 기준" value={searchType} onChange={event => setSearchType(event.target.value as SearchType)}>
                            <option value="content">명언</option>
                            <option value="person">인물</option>
                            <option value="theme">주제</option>
                        </select>}>
                        <TableActions showSearch onReset={() => applySearch(true)} onCreate={() => { setSubmitError(''); setQuoteForm({ mode: 'create' }); }} />
                    </SearchBar>
                }
                footer={<>
                    <span aria-live="polite">전체 {total}개 중 {visibleQuotes.length ? startIndex + 1 : 0}–{visibleQuotes.length ? startIndex + visibleQuotes.length : 0}개</span>
                    <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={changePage} disabled={loading} label="명언 목록 페이지" />
                </>}
            />
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
                    onClose={() => { if (!deleteMutation.isPending) setDeletingQuote(null); }}
                    description="삭제할 명언을 확인해 주세요."
                    disabled={deleteMutation.isPending}
                    onConfirm={() => { if (!deleteMutation.isPending) deleteMutation.mutate(deletingQuote.id); }}
                >
                    {deleteMutation.isError && <p className="quote-search-error" role="alert">명언을 삭제하지 못했습니다. 다시 시도해 주세요.</p>}
                    <blockquote className="quote-delete-preview">
                        <p>{deletingQuote.quote}</p>
                        <footer>{deletingQuote.personName} · {deletingQuote.themeName}</footer>
                    </blockquote>
                </DeleteModal>
            )}
        </>
    );
};

export default Quote;
