import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Panel,
  Group as PanelGroup,
  Separator as PanelResizeHandle,
} from "react-resizable-panels";
import { STORAGE_KEYS, load } from "../shared/storage.js";
import EditorPanel from "./EditorPanel.jsx";

const PANELS = [
  { id: "summary", label: "概要", row: 0, col: 0 },
  { id: "lineage", label: "来歴・血統", row: 0, col: 1 },
  { id: "episode", label: "エピソード", row: 1, col: 0 },
  { id: "art", label: "美術作品", row: 1, col: 1 },
  { id: "question", label: "疑問点", row: 2, col: 0 },
  { id: "modern", label: "現代での引用", row: 2, col: 1 },
];

const leftPanels = PANELS.filter((p) => p.col === 0);
const rightPanels = PANELS.filter((p) => p.col === 1);

function ResizeHandle({ direction = "vertical" }) {
  return (
    <PanelResizeHandle
      style={{
        width: direction === "vertical" ? 6 : "100%",
        height: direction === "vertical" ? "100%" : 6,
        background: "transparent",
        cursor: direction === "vertical" ? "col-resize" : "row-resize",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: direction === "vertical" ? 2 : "80%",
          height: direction === "vertical" ? "80%" : 2,
          background: "#e8e8e8",
          borderRadius: 1,
          transition: "background 0.2s",
        }}
      />
    </PanelResizeHandle>
  );
}

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
      <div style={{ flex: 1, padding: 12, overflow: "hidden" }}>
        <PanelGroup direction="horizontal" style={{ height: "100%" }}>
          {/* Left Column */}
          <Panel defaultSize={50} minSize={25}>
            <PanelGroup direction="vertical" style={{ height: "100%" }}>
              {leftPanels.map((panel, idx) => (
                <div key={panel.id} style={{ display: "contents" }}>
                  <Panel defaultSize={33.33} minSize={15}>
                    <div style={{ height: "100%", padding: 4 }}>
                      <EditorPanel
                        pageId={pageId}
                        panelId={panel.id}
                        label={panel.label}
                      />
                    </div>
                  </Panel>
                  {idx < leftPanels.length - 1 && (
                    <ResizeHandle direction="horizontal" />
                  )}
                </div>
              ))}
            </PanelGroup>
          </Panel>

          <ResizeHandle direction="vertical" />

          {/* Right Column */}
          <Panel defaultSize={50} minSize={25}>
            <PanelGroup direction="vertical" style={{ height: "100%" }}>
              {rightPanels.map((panel, idx) => (
                <div key={panel.id} style={{ display: "contents" }}>
                  <Panel defaultSize={33.33} minSize={15}>
                    <div style={{ height: "100%", padding: 4 }}>
                      <EditorPanel
                        pageId={pageId}
                        panelId={panel.id}
                        label={panel.label}
                      />
                    </div>
                  </Panel>
                  {idx < rightPanels.length - 1 && (
                    <ResizeHandle direction="horizontal" />
                  )}
                </div>
              ))}
            </PanelGroup>
          </Panel>
        </PanelGroup>
      </div>
    </div>
  );
}
