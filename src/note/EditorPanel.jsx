import { useState, useEffect, useRef, useCallback } from "react";
import MDEditor from "@uiw/react-md-editor";
import { getNoteContentKey, load, save, saveImage, getImage } from "../shared/storage.js";

// Custom image renderer to resolve short IDs
const customComponents = {
  img: ({ src, alt, ...props }) => {
    // Check if it's a short ID reference (img:XXXXX)
    if (src && src.startsWith("img:")) {
      const imageId = src.slice(4);
      const base64Data = getImage(imageId);
      if (base64Data) {
        return <img src={base64Data} alt={alt || "image"} style={{ maxWidth: "100%" }} {...props} />;
      }
      return <span style={{ color: "#999" }}>[画像が見つかりません]</span>;
    }
    return <img src={src} alt={alt} style={{ maxWidth: "100%" }} {...props} />;
  },
};

function truncateUrl(url, maxLength = 15) {
  if (!url || url.length <= maxLength) return url;
  try {
    const urlObj = new URL(url);
    const domain = urlObj.hostname.replace(/^www\./, "");
    if (domain.length <= maxLength) return domain;
    return domain.slice(0, maxLength - 3) + "...";
  } catch {
    return url.slice(0, maxLength - 3) + "...";
  }
}

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
    // Save image with short ID
    const imageId = saveImage(base64Data);
    const imageMarkdown = `![image](img:${imageId})\n`;
    setContent((prev) => {
      const newContent = prev + imageMarkdown;
      debouncedSave(newContent);
      return newContent;
    });
  }, [debouncedSave]);

  const insertLink = useCallback(() => {
    const url = prompt("URLを入力してください:");
    if (!url) return;

    const displayText = truncateUrl(url);
    const linkMarkdown = `[${displayText}](${url})`;
    setContent((prev) => {
      const newContent = prev + linkMarkdown;
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
        return;
      }
    }

    // Check for URL paste
    const text = e.clipboardData.getData("text");
    if (text && /^https?:\/\//.test(text.trim())) {
      e.preventDefault();
      const url = text.trim();
      const displayText = truncateUrl(url);
      const linkMarkdown = `[${displayText}](${url})`;
      setContent((prev) => {
        const newContent = prev + linkMarkdown;
        debouncedSave(newContent);
        return newContent;
      });
    }
  }, [handleFileSelect, debouncedSave]);

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
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
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
          <button
            onClick={insertLink}
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
            title="リンクを挿入"
          >
            🔗
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
          previewOptions={{
            components: customComponents,
          }}
          textareaProps={{
            placeholder: `${label}を入力...\n\n画像: ドラッグ&ドロップ / ペースト / 📷ボタン\nリンク: URLペースト / 🔗ボタン`,
          }}
        />
      </div>
    </div>
  );
}
