import { forwardRef } from "react";
import AppIcon from "./AppIcon";

const FileUpload = forwardRef(function FileUpload({ id, label = "Upload file", hint, error, accept, multiple = false, ...props }, ref) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <label className="file-upload" htmlFor={id}>
        <AppIcon name="upload" size={20} />
        <span>Choose {multiple ? "files" : "a file"}</span>
      </label>
      <input className="sr-only" id={id} ref={ref} type="file" accept={accept} multiple={multiple} {...props} />
      {error ? <small className="field-error">{error}</small> : hint ? <small className="field-hint">{hint}</small> : null}
    </div>
  );
});

export default FileUpload;
