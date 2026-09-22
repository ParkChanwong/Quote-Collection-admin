import './RowActions.scss';

type RowActionsProps = {
    label: string;
    onEdit: () => void;
    onDelete: () => void;
    disabled?: boolean;
};

export default function RowActions({ label, onEdit, onDelete, disabled = false }: RowActionsProps) {
    return <div className="table-row-actions">
        <button type="button" disabled={disabled} aria-label={`${label} 수정`} onClick={onEdit}>수정</button>
        <button type="button" disabled={disabled} className="table-delete-button" aria-label={`${label} 삭제`} onClick={onDelete}>삭제</button>
    </div>;
}
