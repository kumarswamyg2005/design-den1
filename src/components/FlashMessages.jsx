import { useFlash } from "../context/FlashContext";
import "./FlashMessages.css";

const FlashMessages = () => {
  const { messages, removeMessage } = useFlash();

  if (messages.length === 0) return null;

  const getIcon = (type) => {
    switch (type) {
      case "success":
        return "fa-check-circle";
      case "danger":
        return "fa-exclamation-circle";
      case "warning":
        return "fa-exclamation-triangle";
      case "info":
      default:
        return "fa-info-circle";
    }
  };

  return (
    <div className="container mt-3">
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`alert alert-${msg.type} alert-dismissible fade show flash-message`}
          role="alert"
        >
          <i className={`fas ${getIcon(msg.type)} me-2`}></i>
          {msg.message}
          <button
            type="button"
            className="btn-close"
            onClick={() => removeMessage(msg.id)}
            aria-label="Close"
          ></button>
        </div>
      ))}
    </div>
  );
};

export default FlashMessages;
