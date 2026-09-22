import './TableActions.scss';

type TableActionsProps = {
    showSearch?: boolean;
    onReset?: () => void;
    onCreate: () => void;
    createLabel?: string;
    disabled?: boolean;
};

/** 검색 버튼은 상위 검색 폼의 onSubmit을 실행합니다. */
export default function TableActions({ showSearch = false, onReset, onCreate, createLabel = '등록', disabled = false }: TableActionsProps) {
    return <>
        {showSearch && <button type="submit" className="table-action table-action-search" disabled={disabled}>검색</button>}
        {onReset && <button type="button" className="table-action" disabled={disabled} onClick={onReset}>초기화</button>}
        <button type="button" className="table-action table-action-create" disabled={disabled} onClick={onCreate}>{createLabel}</button>
    </>;
}
