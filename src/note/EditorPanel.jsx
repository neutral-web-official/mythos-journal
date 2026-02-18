import { useState, useEffect, useRef, useCallback } from "react";
import MDEditor from "@uiw/react-md-editor";
import { getNoteContentKey, load, save } from "../shared/storage.js";

export default function EditorPanel({ pageId, panelId, label }) {
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [editorHeight, setEditorHeight] = useState(200);
  const containerRef = useRef(null);
  const saveTimeoutRef = useRef(null);
  const storageKey = getNoteContentKey(pageId, panelId);

  useEffect(() => {
    setContent(load(storageKey, ""));
  }, [storageKey]);

  useEffect(() => {
    const updateHeight = () => {
      if (containerRef.current) {
        const headerHeight = 37;
        const containerHeight = containerRef.current.offsetHeight;
        setEditorHeight(Math.max(containerHeight - headerHeight, 100));
      }
    };

    updateHeight();
    window.addEventListener("resize", updateHeight);

    // Use ResizeObserver for panel resize detection
    const resizeObserver = new ResizeObserver(updateHeight);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      window.removeEventListener("resize", updateHeight);
      resizeObserver.disconnect();
    };
  }, []);

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
      ref={containerRef}
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
          flexShrink: 0,
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
        style={{ flex: 1, overflow: "hidden", minHeight: 0 }}
        data-color-mode="light"
      >
        <MDEditor
          value={content}
          onChange={handleChange}
          preview="live"
          height={editorHeight}
          visibleDragbar={false}
          textareaProps={{
            placeholder: `${label}を入力...`,
          }}
        />
      </div>
    </div>
  );
}
