import { useId, useState } from 'react';
import Modal from '../Modal';
import type { CategoryItem } from '../../api/category';
import './CategoryFormModal.scss';

type CategoryFormModalProps = {
    group: { name: string; english: string; example: string };
    initial?: CategoryItem;
    existingItems: CategoryItem[];
    saving: boolean;
    error: string;
    onClose: () => void;
    onSubmit: (name: string) => void;
};

export default function CategoryFormModal({ group, initial, existingItems, saving, error, onClose, onSubmit }: CategoryFormModalProps) {
    const id = useId();
    const [name, setName] = useState(initial?.name ?? '');
    const duplicate = existingItems.some(item => item.name === name.trim() && item.id !== initial?.id);

    return (
        <Modal onClose={() => { if (!saving) onClose(); }} labelledBy={`${id}-title`}>
            <form className="category-form" onSubmit={event => {
                event.preventDefault();
                if (!name.trim() || duplicate || saving) return;
                onSubmit(name.trim());
            }}>
                <p className="category-eyebrow">{group.english}</p>
                <h2 id={`${id}-title`}>{group.name} {initial ? '수정' : '등록'}</h2>
                <p>목록에서 사용할 이름을 입력해 주세요.</p>
                <label htmlFor={`${id}-name`}>{group.name} 이름</label>
                <input id={`${id}-name`} disabled={saving} autoFocus maxLength={50} required value={name} onChange={event => setName(event.target.value)} placeholder={`예: ${group.example}`} aria-describedby={duplicate ? `${id}-duplicate` : undefined} aria-invalid={duplicate} />
                {duplicate && <p id={`${id}-duplicate`} role="alert">이미 등록된 이름입니다.</p>}
                {error && <p role="alert">{error}</p>}
                <div className="category-form-actions">
                    <button type="button" disabled={saving} onClick={onClose}>취소</button>
                    <button type="submit" className="category-primary" disabled={saving || !name.trim() || duplicate}>{saving ? '저장 중…' : '저장'}</button>
                </div>
            </form>
        </Modal>
    );
}
