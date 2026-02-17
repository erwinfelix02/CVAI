interface AuthAlertProps {
  message: string;
  type: "error" | "success";
  visible: boolean;
  loading?: boolean;
}

export default function AuthAlert({
  message,
  type,
  visible,
  loading = false,
}: AuthAlertProps) {
  if (!message) return null;

  return (
    <div className={`auth-alert ${type} ${visible ? "show" : ""}`}>
      <span className="auth-alert-icon">
        {type === "error" ? "⚠️" : "⏳"}
      </span>

      <span className="auth-alert-text">
        {message}
        {loading && <span className="dot-ellipsis" />}
      </span>
    </div>
  );
}
