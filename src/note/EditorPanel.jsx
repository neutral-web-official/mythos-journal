import { useState, useEffect, useRef, useCallback } from "react";
import MDEditor from "@uiw/react-md-editor";
import { getNoteContentKey, load, save } from "../shared/storage.js";

export default function EditorPanel({ pageId, panelId, label }) {
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [mode, setMode] = useState("edit"); // "edit" or "preview"
  const [editorHeight, setEditorHeight] = useState(200);
  const containerRef = useRef(null);
  const fileInputRef = useRef(null);
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

  const insertImage = useCallback((base64Data) => {
    const imageMarkdown = `![image](${base64Data})\n`;
    setContent((prev) => {
      const newContent = prev + imageMarkdown;
      debouncedSave(newContent);
      return newContent;
    });
  }, [debouncedSave]);

  const handleFileSelect = useCallback((file) => {
    if (!file || !file.type.startsWith("image/")) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      insertImage(e.target.result);
    };
    reader.readAsDataURL(file);
  }, [insertImage]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  }, [handleFileSelect]);

  const handlePaste = useCallback((e) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (const item of items) {
      if (item.type.startsWith("image/")) {
        e.preventDefault();
        const file = item.getAsFile();
        handleFileSelect(file);
        break;
      }
    }
  }, [handleFileSelect]);

  const handleFileInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
    e.target.value = "";
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
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "6px 12px",
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
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {saving && (
            <span style={{ fontSize: 11, color: "#aaa" }}>保存中...</span>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileInputChange}
            style={{ display: "none" }}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            style={{
              fontSize: 11,
              color: "#888",
              background: "none",
              border: "1px solid #ddd",
              borderRadius: 4,
              padding: "2px 8px",
              cursor: "pointer",
              fontFamily: "inherit",
            }}
            title="画像をアップロード"
          >
            📷
          </button>
          <div
            style={{
              display: "flex",
              background: "#eee",
              borderRadius: 4,
              overflow: "hidden",
            }}
          >
            <button
              onClick={() => setMode("edit")}
              style={{
                fontSize: 11,
                color: mode === "edit" ? "#333" : "#999",
                background: mode === "edit" ? "#fff" : "transparent",
                border: "none",
                padding: "3px 10px",
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              編集
            </button>
            <button
              onClick={() => setMode("preview")}
              style={{
                fontSize: 11,
                color: mode === "preview" ? "#333" : "#999",
                background: mode === "preview" ? "#fff" : "transparent",
                border: "none",
                padding: "3px 10px",
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              表示
            </button>
          </div>
        </div>
      </div>
      <div
        style={{ flex: 1, overflow: "hidden", minHeight: 0 }}
        data-color-mode="light"
        onPaste={handlePaste}
      >
        <MDEditor
          value={content}
          onChange={handleChange}
          preview={mode === "preview" ? "preview" : "edit"}
          hideToolbar={mode === "preview"}
          height={editorHeight}
          visibleDragbar={false}
          textareaProps={{
            placeholder: `${label}を入力...\n\n画像はドラッグ&ドロップ、ペースト、または📷ボタンでアップロードできます`,
          }}
        />
      </div>
    </div>
  );
}
