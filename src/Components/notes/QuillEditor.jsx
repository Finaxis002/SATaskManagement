import React, { useEffect, useRef } from "react";
import { useQuill } from "react-quilljs";
import "quill/dist/quill.snow.css";

const QuillEditor = ({ value, onChange }) => {
  const { quill, quillRef } = useQuill({
    modules: {
      toolbar: {
        container: [
          ["bold", "italic", "underline", "strike", "link"],
          [{ list: "ordered" }, { list: "bullet" }],
          [{ color: [] }, { background: [] }],
        ],
      },
    },
  });

  const isMounted = useRef(false);

  useEffect(() => {
    if (quill && !isMounted.current) {
      quill.clipboard.dangerouslyPasteHTML(value || "");
      isMounted.current = true;
    }
  }, [quill, value]);

  useEffect(() => {
    if (quill) {
      // Custom list handling to prevent conflicts
      const toolbar = quill.getModule("toolbar");

      toolbar.addHandler("list", function (value) {
        if (value === "ordered") {
          // Clear bullet list format first
          quill.format("list", false);
          quill.format("list", "ordered");
        } else if (value === "bullet") {
          // Clear ordered list format first
          quill.format("list", false);
          quill.format("list", "bullet");
        } else {
          quill.format("list", false);
        }
      });

      quill.on("text-change", () => {
        const htmlContent = quill.root.innerHTML;
        if (htmlContent !== value) {
          onChange(htmlContent);
        }
      });
    }
  }, [quill, onChange, value]);

  return (
    <div className="w-100% ">
      <div ref={quillRef} />
    </div>
  );
};

export default QuillEditor;