import { useEffect, useRef, type ReactNode } from 'react';
import './Modal.scss';

type ModalProps = {
    children: ReactNode;
    onClose: () => void;
    labelledBy: string;
};

const Modal = ({ children, onClose, labelledBy }: ModalProps) => {
    const dialogRef = useRef<HTMLDialogElement>(null);

    useEffect(() => {
        const dialog = dialogRef.current;
        const previousFocus = document.activeElement;
        const previousOverflow = document.body.style.overflow;
        dialog?.showModal();
        document.body.style.overflow = 'hidden';
        return () => {
            dialog?.close();
            document.body.style.overflow = previousOverflow;
            if (previousFocus instanceof HTMLElement) previousFocus.focus();
        };
    }, []);

    return (
        <dialog ref={dialogRef} className="modal-container" aria-labelledby={labelledBy}
            onCancel={event => { event.preventDefault(); onClose(); }}>
            {children}
        </dialog>
    );
};

export default Modal;
