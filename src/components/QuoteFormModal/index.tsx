import { useId, useState } from 'react';
import CloseIcon from '../../assets/icons/close.svg?react';
import Modal from '../Modal';
import { useQuery } from '@tanstack/react-query';
import { optionApi, type QuoteSubmitValues } from '../../api/quote';
import './QuoteFormModal.scss';

export type QuoteFormValues = {
    personName: string;
    themeName: string;
    quote: string;
};


type QuoteFormModalProps = {
    mode: 'create' | 'edit';
    initialValues?: QuoteFormValues;
    onClose: () => void;
    onSubmit: (values: QuoteSubmitValues) => void;
    saving: boolean;
    submitError: string;
};

const QuoteFormModal = ({ mode, initialValues, onClose, onSubmit, saving, submitError }: QuoteFormModalProps) => {
    const id = useId();
    const [values, setValues] = useState<QuoteFormValues>(initialValues ?? {
        personName: '', themeName: '', quote: '',
    });
    const personsQuery = useQuery({ queryKey: ['persons'], queryFn: ({ signal }) => optionApi.persons(signal) });
    const themesQuery = useQuery({ queryKey: ['themes'], queryFn: ({ signal }) => optionApi.themes(signal) });
    const persons = personsQuery.data ?? [];
    const themes = themesQuery.data ?? [];
    const [selectedPersonId, setPersonId] = useState<string | null>(null);
    const [selectedThemeId, setThemeId] = useState<string | null>(null);
    const matchedPersons = persons.filter(item => item.name === initialValues?.personName);
    const matchedThemes = themes.filter(item => item.name === initialValues?.themeName);
    const personId = selectedPersonId ?? (matchedPersons.length === 1 ? String(matchedPersons[0].id) : '');
    const themeId = selectedThemeId ?? (matchedThemes.length === 1 ? String(matchedThemes[0].id) : '');
    const loading = personsQuery.isPending || themesQuery.isPending;
    const error = personsQuery.isError || themesQuery.isError ? '인물과 주제 목록을 불러오지 못했습니다. 창을 다시 열어 주세요.' : '';

    const action = mode === 'create' ? '등록' : '수정';

    return (
        <Modal onClose={() => { if (!saving) onClose(); }} labelledBy={`${id}-title`}>
            <div className="quote-modal-heading">
                <h2 id={`${id}-title`}>명언 {action}</h2>
                <button type="button" disabled={saving} onClick={onClose} aria-label={`${action} 모달 닫기`}><CloseIcon aria-hidden="true" /></button>
            </div>
            <p className="quote-modal-description">인물과 주제를 선택하고 명언을 입력해 주세요.</p>
            <form onSubmit={event => {
                event.preventDefault();
                if (saving || loading || error || !personId || !themeId || !values.quote.trim()) return;
                onSubmit({ personId: Number(personId), themeId: Number(themeId), quote: values.quote.trim() });
            }}>
                <div className="quote-form-fields">
                    <label htmlFor={`${id}-person`}>인물</label>
                    <select id={`${id}-person`} name="personId" value={personId} onChange={event => setPersonId(event.target.value)} disabled={saving || loading || !!error} required>
                        <option value="">{loading ? '불러오는 중…' : persons.length ? '인물을 선택해 주세요' : '등록된 인물이 없습니다'}</option>
                        {persons.map(person => <option key={person.id} value={person.id}>{person.name}{persons.filter(item => item.name === person.name).length > 1 ? ` (#${person.id})` : ''}</option>)}
                    </select>
                    <label htmlFor={`${id}-theme`}>주제</label>
                    <select id={`${id}-theme`} name="themeId" value={themeId} onChange={event => setThemeId(event.target.value)} disabled={saving || loading || !!error} required>
                        <option value="">{loading ? '불러오는 중…' : themes.length ? '주제를 선택해 주세요' : '등록된 주제가 없습니다'}</option>
                        {themes.map(theme => <option key={theme.id} value={theme.id}>{theme.name}{themes.filter(item => item.name === theme.name).length > 1 ? ` (#${theme.id})` : ''}</option>)}
                    </select>
                    <label htmlFor={`${id}-quote`}>명언</label>
                    <textarea id={`${id}-quote`} name="quote" rows={5} disabled={saving} value={values.quote} onChange={event => setValues({ ...values, quote: event.target.value })} required />
                </div>
                {error && <p className="quote-modal-note" role="alert">{error}</p>}
                {mode === 'edit' && !loading && !error && (!personId || !themeId) && <p className="quote-modal-note">기존 항목을 확정할 수 없습니다. 인물과 주제를 다시 선택해 주세요.</p>}
                {submitError && <p className="quote-modal-note" id={`${id}-note`} role="alert">{submitError}</p>}
                <div className="quote-modal-actions">
                    <button type="button" disabled={saving} onClick={onClose}>취소</button>
                    <button type="submit" className="quote-modal-primary" aria-describedby={submitError ? `${id}-note` : undefined} disabled={saving || loading || !!error || !personId || !themeId || !values.quote.trim()}>{saving ? '저장 중…' : mode === 'create' ? '등록' : '저장'}</button>
                </div>
            </form>
        </Modal>
    );
};

export default QuoteFormModal;
