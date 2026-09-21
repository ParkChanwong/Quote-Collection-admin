import { useId, useState, type ComponentProps } from 'react';
import EyeIcon from '../../assets/icons/eye.svg?react';
import EyeOffIcon from '../../assets/icons/eye-off.svg?react';
import './TextInput.scss';

type TextInputProps = ComponentProps<'input'> & {
    label?: string;
    wrapperClassName?: string;
};

const TextInput = ({
    label,
    id,
    type = 'text',
    className = '',
    wrapperClassName = '',
    disabled,
    ...inputProps
}: TextInputProps) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';

    return (
        <div className={`text-input ${wrapperClassName}`.trim()}>
            {label && <label className="text-input__label" htmlFor={inputId}>{label}</label>}
            <div className={`text-input__field${isPassword ? ' text-input__field--password' : ''}`}>
                <input
                    {...inputProps}
                    id={inputId}
                    type={isPassword && showPassword ? 'text' : type}
                    className={`text-input__control ${className}`.trim()}
                    disabled={disabled}
                />
                {isPassword && (
                    <button
                        className="text-input__toggle"
                        type="button"
                        onClick={() => setShowPassword((visible) => !visible)}
                        aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 표시'}
                        aria-pressed={showPassword}
                        aria-controls={inputId}
                        disabled={disabled}
                    >
                        {showPassword ? <EyeOffIcon aria-hidden="true" /> : <EyeIcon aria-hidden="true" />}
                    </button>
                )}
            </div>
        </div>
    );
};

export default TextInput;
