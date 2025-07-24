import React, { useEffect, useRef } from "react";
import { useQuill } from "react-quilljs";
import "quill/dist/quill.snow.css";

const QuillEditor = ({ value, onChange }) => {
  const { quill, quillRef } = useQuill({
    modules: {
      toolbar: [
        ["bold", "italic", "underline", "strike"],
        [{ list: "ordered" }, { list: "bullet" }],
        [{ color: [] }, { background: [] }],
      ],
    },
  });

  const isMounted = useRef(false);

  // Initialize the editor's content once after loading
  useEffect(() => {
    if (quill && !isMounted.current) {
      quill.clipboard.dangerouslyPasteHTML(value || "");
      isMounted.current = true;
    }
  }, [quill, value]);

  // Listen to user typing and update parent state
  useEffect(() => {
    if (quill) {
      quill.on("text-change", () => {
        const htmlContent = quill.root.innerHTML;
        if (htmlContent !== value) {
          onChange(htmlContent);
        }
      });
    }
  }, [quill, onChange, value]);

  return (
    <div style={{ width: "100%" }}>
      <div ref={quillRef} />
    </div>
  );
};

export default QuillEditor;
