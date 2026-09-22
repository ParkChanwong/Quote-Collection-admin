import CloseIcon from '../../assets/icons/close.svg?react';
import { useId, type ReactNode } from 'react';
import Modal from '../Modal';
import './DeleteModal.scss';

type DeleteModalProps = {
    onClose: () => void;
    onConfirm?: () => void;
    title?: string;
    description?: string;
    children?: ReactNode;
    disabled?: boolean;
};

const DeleteModal = ({
    onClose,
    onConfirm,
    title = '정말 삭제하시겠습니까?',
    description = '삭제할 항목을 확인해 주세요.',
    children,
    disabled = false,
}: DeleteModalProps) => {
    const titleId = useId();

    return (
        <Modal onClose={onClose} labelledBy={titleId}>
            <div className="delete-modal-heading">
                <h2 id={titleId}>{title}</h2>
                <button type="button" onClick={onClose} aria-label="삭제 모달 닫기"><CloseIcon aria-hidden="true" /></button>
            </div>
            <p className="delete-modal-description">{description}</p>
            {children}
            <div className="delete-modal-actions">
                <button type="button" onClick={onClose}>취소</button>
                <button type="button" className="delete-modal-confirm" onClick={onConfirm} disabled={disabled || !onConfirm}>삭제</button>
            </div>
        </Modal>
    );
};

export default DeleteModal;
