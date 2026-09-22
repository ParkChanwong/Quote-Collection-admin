import SearchBar from '../../components/SearchBar';
import RowActions from '../../components/RowActions';
import Badge from '../../components/Badge';
import TableActions from '../../components/TableActions';
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import DataTable, { type TableColumn } from '../../components/DataTable';
import Pagination from '../../components/Pagination';
import DeleteModal from '../../components/DeleteModal';
import PersonFormModal from '../../components/PersonFormModal';
import { personApi, type Person, type PersonValues } from '../../api/person';
import { matchesSearch, normalizeSearch } from '../../utils/search';
import './Person.scss';

const searchFields = { name: '인물', countryName: '국가', periodName: '시대', fieldName: '분야' };
type SearchField = keyof typeof searchFields;
const PAGE_SIZE = 10;
function errorMessage(error: unknown) {
    if (!error) return '';
    if (isAxiosError<{ message?: string }>(error)) {
        if (error.response?.status === 401) return '로그인이 필요합니다. 다시 로그인해 주세요.';
        if (error.response?.status === 403) return '관리자 권한이 필요합니다.';
        if (typeof error.response?.data?.message === 'string') return error.response.data.message;
    }
    return '요청을 처리하지 못했습니다. 다시 시도해 주세요.';
}

export default function PersonPage() {
    const client = useQueryClient();
    const [page, setPage] = useState(1);
    const [field, setField] = useState<SearchField>('name');
    const [text, setText] = useState('');
    const [search, setSearch] = useState({ field: 'name' as SearchField, keyword: '' });
    const [form, setForm] = useState<Person | 'new' | null>(null);
    const [deleting, setDeleting] = useState<Person | null>(null);
    const [notice, setNotice] = useState('');
    const list = useQuery({ queryKey: ['persons', 'page', page], queryFn: ({ signal }) => personApi.list(page, signal), enabled: !search.keyword });
    // 전체 조회 API를 사용해 영문 대소문자를 구분하지 않고 모든 페이지를 검색합니다.
    const all = useQuery({ queryKey: ['persons', 'search-source'], queryFn: ({ signal }) => personApi.all(signal), enabled: !!search.keyword });
    const filtered = (all.data ?? []).filter(item => matchesSearch(item[search.field], search.keyword));
    const total = search.keyword ? filtered.length : list.data?.total ?? 0;
    const pages = search.keyword ? Math.ceil(total / PAGE_SIZE) : list.data?.totalPage ?? 0;
    const current = search.keyword ? Math.max(1, Math.min(page, pages)) : page;
    const start = (current - 1) * PAGE_SIZE;
    const rows = search.keyword ? filtered.slice(start, start + PAGE_SIZE) : list.data?.result ?? [];
    const query = search.keyword ? all : list;
    const refresh = () => Promise.all([client.invalidateQueries({ queryKey: ['persons'] }), client.invalidateQueries({ queryKey: ['quotes'] })]);
    const save = useMutation({
        mutationFn: ({ id, values }: { id?: number; values: PersonValues }) => id === undefined ? personApi.create(values) : personApi.update(id, values),
        onSuccess: async () => { await refresh(); setForm(null); setNotice('인물을 저장했습니다.'); },
    });
    const remove = useMutation({ mutationFn: personApi.remove, onSuccess: async () => {
        if (rows.length === 1 && current > 1) setPage(current - 1);
        await refresh(); setDeleting(null); setNotice('인물을 삭제했습니다.');
    } });
    const applySearch = (reset = false) => {
        const next = { field: reset ? 'name' as const : field, keyword: reset ? '' : normalizeSearch(text) };
        if (reset) { setField('name'); setText(''); }
        if (next.field === search.field && next.keyword === search.keyword && (page === 1 || next.keyword)) void query.refetch();
        setSearch(next); setPage(1);
    };
    const columns: TableColumn<Person>[] = [
        { key: 'number', header: '번호', width: 80, align: 'center', render: (_, index) => String(start + index + 1).padStart(2, '0') },
        { key: 'name', header: '인물', render: item => item.name },
        ...(['countryName', 'periodName', 'fieldName'] as const).map(key => ({ key, header: searchFields[key], align: 'center' as const, render: (item: Person) => <Badge>{item[key]}</Badge> })),
        { key: 'actions', header: '관리', width: 156, align: 'center', render: item => <RowActions label={item.name} onEdit={() => { save.reset(); setForm(item); }} onDelete={() => { remove.reset(); setDeleting(item); }} /> },
    ];
    return <>
        {query.isError && <p className="person-notice" role="alert">인물 목록을 불러오지 못했습니다. <button type="button" disabled={query.isFetching} onClick={() => void query.refetch()}>다시 시도</button></p>}
        <DataTable className="person-panel" title="인물 목록" count={total} columns={columns} items={rows} rowKey={item => item.id} loading={query.isPending} emptyMessage={query.isError ? '인물 목록을 불러오지 못했습니다.' : search.keyword ? '검색 결과가 없습니다.' : '등록된 인물이 없습니다.'}
            toolbar={<SearchBar label="인물 검색" value={text} onChange={setText} placeholder={`${searchFields[field]} 검색어를 입력해 주세요`} onSearch={() => applySearch()} filter={<select aria-label="검색 기준" value={field} onChange={event => setField(event.target.value as SearchField)}>{Object.entries(searchFields).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select>}><TableActions showSearch onReset={() => applySearch(true)} onCreate={() => { save.reset(); setForm('new'); }} /></SearchBar>}
            footer={<><span aria-live="polite">전체 {total}개 중 {rows.length ? start + 1 : 0}–{rows.length ? start + rows.length : 0}개</span><Pagination currentPage={current} totalPages={pages} onPageChange={setPage} disabled={query.isPending} label="인물 목록 페이지" /></>}
        />
        <p className="person-notice" role="status">{notice}</p>
        {form && <PersonFormModal initial={form === 'new' ? undefined : form} saving={save.isPending} error={errorMessage(save.error)} onClose={() => setForm(null)} onSubmit={values => { if (!save.isPending) save.mutate({ id: form === 'new' ? undefined : form.id, values }); }} />}
        {deleting && <DeleteModal title={`‘${deleting.name}’ 인물을 삭제하시겠습니까?`} description={'이 인물을 삭제하면 해당 인물의 명언도 함께 삭제됩니다.\n삭제한 데이터는 복구할 수 없으니 신중하게 확인해 주세요.'} disabled={remove.isPending} onClose={() => { if (!remove.isPending) setDeleting(null); }} onConfirm={() => { if (!remove.isPending) remove.mutate(deleting.id); }}>{remove.isError && <p role="alert">{errorMessage(remove.error)}</p>}</DeleteModal>}
    </>;
}
