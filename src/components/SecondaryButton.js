export default function SecondaryButton({ text, onClick }) {
  return (
    <button className="secondary-button" onClick={onClick}>
      {text}
    </button>
  );
}
