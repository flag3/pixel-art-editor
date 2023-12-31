type ButtonProps = {
  text: string;
  onClick: () => void;
  disabled?: boolean;
};

const Button = ({ text, onClick, disabled = false }: ButtonProps) => {
  return (
    <button onClick={onClick} disabled={disabled}>
      <span className="material-icons-outlined">{text}</span>
    </button>
  );
};

export default Button;
