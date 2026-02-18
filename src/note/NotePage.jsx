import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { STORAGE_KEYS, load } from "../shared/storage.js";
import EditorPanel from "./EditorPanel.jsx";

const PANELS = [
  { id: "summary", label: "概要" },
  { id: "lineage", label: "来歴・血統" },
  { id: "episode", label: "エピソード" },
  { id: "art", label: "美術作品" },
  { id: "question", label: "疑問点" },
  { id: "modern", label: "現代での引用" },
];

export default function NotePage() {
  const { categoryId, pageId } = useParams();
  const navigate = useNavigate();
  const [category, setCategory] = useState(null);
  const [page, setPage] = useState(null);

  useEffect(() => {
    const categories = load(STORAGE_KEYS.categories, []);
    const pages = load(STORAGE_KEYS.pages, []);
    setCategory(categories.find((c) => c.id === categoryId) || null);
    setPage(pages.find((p) => p.id === pageId) || null);
  }, [categoryId, pageId]);

  if (!page) {
    return (
      <div style={{ padding: 32, textAlign: "center", color: "#888" }}>
        ページが見つかりません
        <br />
        <Link
          to="/note"
          style={{ color: "#c4a882", marginTop: 16, display: "inline-block" }}
        >
          ノート一覧に戻る
        </Link>
      </div>
    );
  }

  return (
    <div
      style={{
        height: "calc(100vh - 45px)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "12px 20px",
          borderBottom: "1px solid #f0f0f0",
          display: "flex",
          alignItems: "center",
          gap: 12,
          background: "#fff",
          flexShrink: 0,
        }}
      >
        <button
          onClick={() => navigate(`/note/${categoryId}`)}
          style={{
            fontSize: 14,
            color: "#888",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "4px 8px",
            fontFamily: "inherit",
          }}
        >
          ← 戻る
        </button>
        <div style={{ fontSize: 12, color: "#aaa" }}>
          {category?.name || "..."} /
        </div>
        <div style={{ fontSize: 16, fontWeight: 600, color: "#333" }}>
          {page.title}
        </div>
      </div>

      {/* 3x2 Grid of Editors */}
      <div
        style={{
          flex: 1,
          padding: 12,
          overflow: "hidden",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gridTemplateRows: "1fr 1fr 1fr",
          gap: 8,
        }}
      >
        {PANELS.map((panel) => (
          <EditorPanel
            key={panel.id}
            pageId={pageId}
            panelId={panel.id}
            label={panel.label}
          />
        ))}
      </div>
    </div>
  );
}
