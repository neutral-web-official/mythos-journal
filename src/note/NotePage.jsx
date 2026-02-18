import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Panel,
  Group as PanelGroup,
  Separator as PanelResizeHandle,
} from "react-resizable-panels";
import { STORAGE_KEYS, load } from "../shared/storage.js";
import EditorPanel from "./EditorPanel.jsx";

const LEFT_PANELS = [
  { id: "summary", label: "概要" },
  { id: "episode", label: "エピソード" },
  { id: "question", label: "疑問点" },
];

const RIGHT_PANELS = [
  { id: "lineage", label: "来歴・血統" },
  { id: "art", label: "美術作品" },
  { id: "modern", label: "現代での引用" },
];

function ColumnPanels({ panels, pageId }) {
  return (
    <PanelGroup direction="vertical">
      <Panel defaultSize={33} minSize={15}>
        <div style={{ height: "100%", padding: 4 }}>
          <EditorPanel
            pageId={pageId}
            panelId={panels[0].id}
            label={panels[0].label}
          />
        </div>
      </Panel>
      <PanelResizeHandle
        style={{
          height: 6,
          background: "transparent",
          cursor: "row-resize",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: "80%",
            height: 2,
            background: "#e0e0e0",
            borderRadius: 1,
          }}
        />
      </PanelResizeHandle>
      <Panel defaultSize={34} minSize={15}>
        <div style={{ height: "100%", padding: 4 }}>
          <EditorPanel
            pageId={pageId}
            panelId={panels[1].id}
            label={panels[1].label}
          />
        </div>
      </Panel>
      <PanelResizeHandle
        style={{
          height: 6,
          background: "transparent",
          cursor: "row-resize",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: "80%",
            height: 2,
            background: "#e0e0e0",
            borderRadius: 1,
          }}
        />
      </PanelResizeHandle>
      <Panel defaultSize={33} minSize={15}>
        <div style={{ height: "100%", padding: 4 }}>
          <EditorPanel
            pageId={pageId}
            panelId={panels[2].id}
            label={panels[2].label}
          />
        </div>
      </Panel>
    </PanelGroup>
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

      {/* 3x2 Grid of Editors with resizable panels */}
      <div style={{ flex: 1, padding: 8, overflow: "hidden" }}>
        <PanelGroup direction="horizontal">
          {/* Left Column */}
          <Panel defaultSize={50} minSize={25}>
            <ColumnPanels panels={LEFT_PANELS} pageId={pageId} />
          </Panel>

          {/* Horizontal Resize Handle */}
          <PanelResizeHandle
            style={{
              width: 6,
              background: "transparent",
              cursor: "col-resize",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: 2,
                height: "80%",
                background: "#e0e0e0",
                borderRadius: 1,
              }}
            />
          </PanelResizeHandle>

          {/* Right Column */}
          <Panel defaultSize={50} minSize={25}>
            <ColumnPanels panels={RIGHT_PANELS} pageId={pageId} />
          </Panel>
        </PanelGroup>
      </div>
    </div>
  );
}
