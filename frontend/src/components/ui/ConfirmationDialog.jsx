import Button from "./Button";
import Modal from "./Modal";

function ConfirmationDialog({ open, title, description, confirmLabel = "Confirm", cancelLabel = "Cancel", tone = "danger", busy = false, onConfirm, onCancel }) {
  return (
    <Modal
      open={open}
      title={title}
      description={description}
      onClose={onCancel}
      size="sm"
      footer={<><Button variant="secondary" onClick={onCancel} disabled={busy}>{cancelLabel}</Button><Button variant={tone} onClick={onConfirm} loading={busy}>{confirmLabel}</Button></>}
    />
  );
}

export default ConfirmationDialog;
