import SearchBar from '../../components/SearchBar';
import RowActions from '../../components/RowActions';
import Badge from '../../components/Badge';
import TableActions from '../../components/TableActions';
import { matchesSearch } from '../../utils/search';
import { isAxiosError } from 'axios';
import { useMutation, useQueries, useQueryClient } from '@tanstack/react-query';
import { categoryApi } from '../../api/category';
import { createPortal } from 'react-dom';
import { useOutletContext } from 'react-router-dom';
import type { AdminLayoutContext } from '../../layouts';
import DataTable, { type TableColumn } from '../../components/DataTable';
import Pagination from '../../components/Pagination';
import { useState } from 'react';
import CategoryFormModal from '../../components/CategoryFormModal';
import DeleteModal from '../../components/DeleteModal';
import './Category.scss';

const PAGE_SIZE = 10;

const groups = [
    { key: 'country', name: '국가', english: 'COUNTRY', description: '인물이 태어나고 활동한 나라', example: '대한민국' },
    { key: 'period', name: '시대', english: 'PERIOD', description: '생각과 문장이 탄생한 시간', example: '고대' },
    { key: 'field', name: '분야', english: 'FIELD', description: '인물이 발자취를 남긴 영역', example: '철학' },
    { key: 'theme', name: '주제', english: 'THEME', description: '명언에 담긴 메시지와 가치', example: '삶' },
] as const;
type GroupKey = typeof groups[number]['key'];
type Item = { id: number; name: string };

export default function Category() {
    const client = useQueryClient();
    const { headerSlot } = useOutletContext<AdminLayoutContext>();
    const [active, setActive] = useState<GroupKey>('country');
    const [query, setQuery] = useState('');
    const [page, setPage] = useState(1);
    const [editing, setEditing] = useState<Item | 'new' | null>(null);
    const [deleting, setDeleting] = useState<Item | null>(null);
    const [notice, setNotice] = useState('');
    const group = groups.find(value => value.key === active)!;
    const categoryQueries = useQueries({ queries: groups.map(value => ({
        queryKey: ['categories', value.key, value.key === active ? page : 1],
        queryFn: ({ signal }: { signal: AbortSignal }) => categoryApi.list(value.key, value.key === active ? page : 1, signal),
    })) });
    const listQuery = categoryQueries[groups.findIndex(value => value.key === active)];
    const sourceItems = listQuery.data?.result ?? [];
    const total = listQuery.data?.total ?? 0;
    const pageCount = listQuery.data?.totalPage ?? 0;
    const currentPage = page;
    const pageItems = sourceItems.filter(item => matchesSearch(item.name, query));
    const loading = listQuery.isPending;
    const loadError = listQuery.isError;
    const refreshCategories = () => Promise.all([
        client.invalidateQueries({ queryKey: ['categories', active] }),
        client.invalidateQueries({ queryKey: ['persons'] }),
        client.invalidateQueries({ queryKey: ['themes'] }),
        client.invalidateQueries({ queryKey: ['quotes'] }),
    ]);


    const saveCategory = useMutation({
        mutationFn: ({ id, name }: { id?: number; name: string }) => id === undefined ? categoryApi.create(active, name) : categoryApi.update(active, id, name),
        onSuccess: async () => {
            await refreshCategories();
            setEditing(null);
            setNotice(`${group.name} 항목을 저장했습니다.`);
        },
    });
    const deleteCategory = useMutation({
        mutationFn: (id: number) => categoryApi.remove(active, id),
        onSuccess: async () => {
            if (sourceItems.length === 1 && page > 1) setPage(page - 1);
            await refreshCategories();
            setDeleting(null);
            setNotice(`${group.name} 항목을 삭제했습니다.`);
        },
    });
    const saving = saveCategory.isPending;
    const removing = deleteCategory.isPending;
    const mutationError = (error: unknown) => {
        if (isAxiosError<{ message?: string }>(error)) {
            if (error.response?.status === 401) return '로그인이 필요합니다. 다시 로그인해 주세요.';
            if (error.response?.status === 403) return '관리자 권한이 필요합니다.';
            if (typeof error.response?.data?.message === 'string') return error.response.data.message;
        }
        return '요청을 처리하지 못했습니다. 다시 시도해 주세요.';
    };

    const columns: TableColumn<Item>[] = [
        { key: 'number', header: '번호', width: 85, align: 'center', className: 'category-number', render: (_, index) => String((currentPage - 1) * PAGE_SIZE + index + 1).padStart(2, '0') },
        { key: 'name', header: `${group.name} 이름`, className: 'category-name', render: item => item.name },
        { key: 'group', header: '분류', width: 120, align: 'center', className: 'category-group', render: () => <Badge>{group.name}</Badge> },
        { key: 'actions', header: '관리', width: 156, align: 'center', className: 'category-actions', render: item => <RowActions label={item.name} onEdit={() => { saveCategory.reset(); setEditing(item); }} onDelete={() => { deleteCategory.reset(); setDeleting(item); }} /> },
    ];

    return <div className="category-page">
        {loadError && <p role="alert">{group.name} 목록을 불러오지 못했습니다. <button type="button" disabled={listQuery.isFetching} onClick={() => void listQuery.refetch()}>다시 시도</button></p>}
        {headerSlot && createPortal(<div className="category-selectors" aria-label="카테고리 선택">
            {groups.map((value, index) => <button type="button" key={value.key} className={`category-selector${active === value.key ? ' is-selected' : ''}`} aria-pressed={active === value.key} onClick={() => { setActive(value.key); setPage(1); setQuery(''); setNotice(''); }}>
                <span className="category-selector-title"><span className="category-selector-label">{value.name}<span className="category-english">{value.english}</span></span><span>{categoryQueries[index].data?.total ?? '—'}<small>개</small></span></span>
                <span className="category-selector-description">{value.description}</span>
            </button>)}
        </div>, headerSlot)}
        <DataTable
            className="category-panel"
            title={`${group.name} 목록`}
            count={total}
            loading={loading}
            description={`${group.description}를 관리해요.`}
            columns={columns}
            items={pageItems}
            rowKey={item => item.id}
            emptyMessage={loadError ? `${group.name} 목록을 불러오지 못했습니다. 다시 시도해 주세요.` : query ? '검색 결과가 없습니다. 다른 이름으로 검색해 주세요.' : `등록된 ${group.name}가 없습니다. 새 항목을 등록해 보세요.`}
            toolbar={
                <SearchBar label={`${group.name} 검색`} value={query} onChange={setQuery} placeholder={`현재 페이지에서 ${group.name} 검색`}><TableActions createLabel={`＋ ${group.name} 등록`} onCreate={() => { saveCategory.reset(); setEditing('new'); }} /></SearchBar>
            }
            footer={<>
                <span>전체 {total}개 · {query ? '현재 페이지 검색 결과 ' : ''}{pageItems.length}개 표시</span>
                <Pagination currentPage={currentPage} totalPages={pageCount} disabled={loading} onPageChange={setPage} label="카테고리 목록 페이지" />
            </>}
        />
        <p className="category-notice" role="status">{notice}</p>
        {editing && <CategoryFormModal
            group={group}
            initial={editing === 'new' ? undefined : editing}
            existingItems={sourceItems}
            saving={saving}
            error={saveCategory.isError ? mutationError(saveCategory.error) : ''}
            onClose={() => setEditing(null)}
            onSubmit={name => { if (!saving) saveCategory.mutate({ id: editing === 'new' ? undefined : editing.id, name }); }}
        />}
        {deleting && <DeleteModal
            disabled={removing}
            onClose={() => { if (!removing) setDeleting(null); }}
            title={`‘${deleting.name}’ ${group.name} 항목을 삭제하시겠습니까?`}
            description={`${active === 'theme' ? '이 주제를 삭제하면 해당 주제에 포함된 명언도 함께 삭제됩니다.' : `이 ${group.name} 항목을 삭제하면 소속된 모든 인물과 해당 인물의 명언도 함께 삭제됩니다.`}\n삭제한 데이터는 복구할 수 없으니 신중하게 확인해 주세요.`}
            onConfirm={() => { if (!removing) deleteCategory.mutate(deleting.id); }}
        >{deleteCategory.isError && <p role="alert">{mutationError(deleteCategory.error)}</p>}</DeleteModal>}

    </div>;
}
