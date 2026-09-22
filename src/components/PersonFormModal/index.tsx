import { useId, useState } from 'react';
import { useQueries } from '@tanstack/react-query';
import Modal from '../Modal';
import { personApi, type Person, type PersonValues } from '../../api/person';
import '../QuoteFormModal/QuoteFormModal.scss';

const fields = [
    { key: 'country', label: '국가', nameKey: 'countryName' },
    { key: 'period', label: '시대', nameKey: 'periodName' },
    { key: 'field', label: '분야', nameKey: 'fieldName' },
] as const;

type Props = { initial?: Person; saving: boolean; error: string; onClose: () => void; onSubmit: (values: PersonValues) => void };
export default function PersonFormModal({ initial, saving, error, onClose, onSubmit }: Props) {
    const id = useId();
    const [name, setName] = useState(initial?.name ?? '');
    const [selected, setSelected] = useState<Partial<Record<typeof fields[number]['key'], string>>>({});
    const queries = useQueries({ queries: fields.map(field => ({ queryKey: ['categories', field.key, 'options'], queryFn: ({ signal }: { signal: AbortSignal }) => personApi.options(field.key, signal) })) });
    const ids = fields.map((field, index) => {
        const options = queries[index].data ?? [];
        const matches = options.filter(option => option.name === initial?.[field.nameKey]);
        const value = selected[field.key] ?? (matches.length === 1 ? String(matches[0].id) : '');
        return options.some(option => String(option.id) === value) ? value : '';
    });
    const loading = queries.some(query => query.isPending);
    const failed = queries.some(query => query.isError);
    const valid = !!name.trim() && ids.every(Boolean) && !loading && !failed;
    return <Modal onClose={() => { if (!saving) onClose(); }} labelledBy={`${id}-title`}>
        <div className="quote-modal-heading"><h2 id={`${id}-title`}>인물 {initial ? '수정' : '등록'}</h2><button type="button" disabled={saving} aria-label="인물 창 닫기" onClick={onClose}>×</button></div>
        <p className="quote-modal-description">국가·시대·분야를 선택하고 인물 이름을 입력해 주세요.</p>
        <form onSubmit={event => { event.preventDefault(); if (!valid || saving) return; onSubmit({ name: name.trim(), countryId: Number(ids[0]), periodId: Number(ids[1]), fieldId: Number(ids[2]) }); }}>
            <div className="quote-form-fields">
                {fields.map((field, index) => <div key={field.key} className="person-form-select"><label htmlFor={`${id}-${field.key}`}>{field.label}</label><select id={`${id}-${field.key}`} autoFocus={index === 0} required disabled={saving || loading || failed} value={ids[index]} onChange={event => setSelected(previous => ({ ...previous, [field.key]: event.target.value }))}>
                    <option value="">{loading ? '불러오는 중…' : `${field.label} 선택`}</option>
                    {(queries[index].data ?? []).map(option => <option key={option.id} value={option.id}>{option.name}{queries[index].data!.filter(item => item.name === option.name).length > 1 ? ` (#${option.id})` : ''}</option>)}
                </select></div>)}
                <label htmlFor={`${id}-name`}>인물 이름</label><input id={`${id}-name`} required value={name} disabled={saving} onChange={event => setName(event.target.value)} />
            </div>
            {failed && <p className="quote-modal-note" role="alert">선택 항목을 불러오지 못했습니다. <button type="button" onClick={() => queries.forEach(query => void query.refetch())}>다시 시도</button></p>}
            {initial && !loading && !failed && ids.some(value => !value) && <p className="quote-modal-note">기존 항목을 확정할 수 없습니다. 국가·시대·분야를 다시 선택해 주세요.</p>}
            {error && <p className="quote-modal-note" role="alert">{error}</p>}
            <div className="quote-modal-actions"><button type="button" disabled={saving} onClick={onClose}>취소</button><button type="submit" className="quote-modal-primary" disabled={saving || !valid}>{saving ? '저장 중…' : '저장'}</button></div>
        </form>
    </Modal>;
}
