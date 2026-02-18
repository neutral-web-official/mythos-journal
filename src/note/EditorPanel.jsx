import { useState, useEffect, useRef, useCallback } from "react";
import MDEditor from "@uiw/react-md-editor";
import { getNoteContentKey, load, save } from "../shared/storage.js";

export default function EditorPanel({ pageId, panelId, label }) {
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const saveTimeoutRef = useRef(null);
  const storageKey = getNoteContentKey(pageId, panelId);

  useEffect(() => {
    setContent(load(storageKey, ""));
  }, [storageKey]);

  const debouncedSave = useCallback(
    (value) => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      setSaving(true);
      saveTimeoutRef.current = setTimeout(() => {
        save(storageKey, value);
        setSaving(false);
      }, 400);
    },
    [storageKey]
  );

  const handleChange = (value) => {
    const newValue = value || "";
    setContent(newValue);
    debouncedSave(newValue);
  };

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: "#fff",
        border: "1px solid #e8e8e8",
        borderRadius: 6,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "8px 12px",
          borderBottom: "1px solid #f0f0f0",
          background: "#fafafa",
        }}
      >
        <span
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "#393939",
          }}
        >
          {label}
        </span>
        {saving && (
          <span style={{ fontSize: 11, color: "#aaa" }}>保存中...</span>
        )}
      </div>
      <div
        style={{ flex: 1, overflow: "hidden" }}
        data-color-mode="light"
      >
        <MDEditor
          value={content}
          onChange={handleChange}
          preview="live"
          hideToolbar={false}
          height="100%"
          style={{
            height: "100%",
          }}
          textareaProps={{
            placeholder: `${label}を入力...`,
          }}
        />
      </div>
    </div>
  );
}
