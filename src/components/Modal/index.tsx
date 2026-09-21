import './Modal.scss';

const Modal = ({children}: {children: React.ReactNode}) => {
    
    return (
        <div className="modal-background">
            <div className="modal-container">
                {children}
            </div>
        </div>
    )
}

export default Modal;