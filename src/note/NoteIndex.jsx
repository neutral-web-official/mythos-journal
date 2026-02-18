import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { STORAGE_KEYS, load, save } from "../shared/storage.js";

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export default function NoteIndex() {
  const { categoryId } = useParams();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [pages, setPages] = useState([]);
  const [newCatName, setNewCatName] = useState("");
  const [newPageName, setNewPageName] = useState("");
  const [editingCat, setEditingCat] = useState(null);
  const [editingPage, setEditingPage] = useState(null);
  const [editName, setEditName] = useState("");

  useEffect(() => {
    setCategories(load(STORAGE_KEYS.categories, []));
    setPages(load(STORAGE_KEYS.pages, []));
  }, []);

  const saveCategories = (cats) => {
    setCategories(cats);
    save(STORAGE_KEYS.categories, cats);
  };

  const savePages = (pgs) => {
    setPages(pgs);
    save(STORAGE_KEYS.pages, pgs);
  };

  // Category CRUD
  const addCategory = () => {
    if (!newCatName.trim()) return;
    const newCat = {
      id: generateId(),
      name: newCatName.trim(),
      order: categories.length,
    };
    saveCategories([...categories, newCat]);
    setNewCatName("");
  };

  const renameCategory = (catId) => {
    if (!editName.trim()) return;
    saveCategories(
      categories.map((c) =>
        c.id === catId ? { ...c, name: editName.trim() } : c
      )
    );
    setEditingCat(null);
    setEditName("");
  };

  const deleteCategory = (catId) => {
    if (!confirm("このカテゴリとその中のページをすべて削除しますか？")) return;
    saveCategories(categories.filter((c) => c.id !== catId));
    savePages(pages.filter((p) => p.categoryId !== catId));
    if (categoryId === catId) {
      navigate("/note");
    }
  };

  // Page CRUD
  const addPage = () => {
    if (!newPageName.trim() || !categoryId) return;
    const newPage = {
      id: generateId(),
      categoryId,
      title: newPageName.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    savePages([...pages, newPage]);
    setNewPageName("");
  };

  const renamePage = (pageId) => {
    if (!editName.trim()) return;
    savePages(
      pages.map((p) =>
        p.id === pageId
          ? { ...p, title: editName.trim(), updatedAt: new Date().toISOString() }
          : p
      )
    );
    setEditingPage(null);
    setEditName("");
  };

  const deletePage = (pageId) => {
    if (!confirm("このページを削除しますか？")) return;
    savePages(pages.filter((p) => p.id !== pageId));
  };

  const currentCategory = categoryId
    ? categories.find((c) => c.id === categoryId)
    : null;
  const categoryPages = categoryId
    ? pages.filter((p) => p.categoryId === categoryId)
    : [];

  const styles = {
    container: {
      maxWidth: 800,
      margin: "0 auto",
      padding: "32px 24px",
    },
    header: {
      fontSize: 18,
      fontWeight: 600,
      color: "#333",
      marginBottom: 24,
    },
    breadcrumb: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      marginBottom: 24,
      fontSize: 14,
      color: "#888",
    },
    breadcrumbLink: {
      color: "#888",
      textDecoration: "none",
    },
    grid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
      gap: 16,
      marginBottom: 32,
    },
    card: {
      padding: "16px 20px",
      border: "1px solid #e8e8e8",
      borderRadius: 8,
      cursor: "pointer",
      transition: "all 0.2s",
      background: "#fff",
    },
    cardTitle: {
      fontSize: 15,
      fontWeight: 500,
      color: "#333",
      marginBottom: 4,
    },
    cardMeta: {
      fontSize: 12,
      color: "#aaa",
    },
    addCard: {
      padding: "16px 20px",
      border: "1px dashed #ddd",
      borderRadius: 8,
      background: "#fafafa",
    },
    input: {
      width: "100%",
      boxSizing: "border-box",
      fontSize: 14,
      padding: "8px 12px",
      border: "1px solid #e8e8e8",
      borderRadius: 6,
      outline: "none",
      fontFamily: "inherit",
      marginBottom: 8,
    },
    button: {
      fontSize: 13,
      padding: "6px 16px",
      background: "#555",
      color: "#fff",
      border: "none",
      borderRadius: 6,
      cursor: "pointer",
      fontFamily: "inherit",
    },
    buttonSecondary: {
      fontSize: 12,
      padding: "4px 10px",
      background: "transparent",
      color: "#888",
      border: "1px solid #ddd",
      borderRadius: 4,
      cursor: "pointer",
      fontFamily: "inherit",
      marginRight: 6,
    },
    actions: {
      display: "flex",
      gap: 8,
      marginTop: 12,
    },
    actionBtn: {
      fontSize: 12,
      color: "#999",
      background: "none",
      border: "none",
      cursor: "pointer",
      padding: 0,
      fontFamily: "inherit",
    },
    deleteBtn: {
      fontSize: 12,
      color: "#cc8888",
      background: "none",
      border: "none",
      cursor: "pointer",
      padding: 0,
      fontFamily: "inherit",
    },
  };

  // Category List View
  if (!categoryId) {
    return (
      <div style={styles.container}>
        <h1 style={styles.header}>ノート</h1>
        <p style={{ fontSize: 14, color: "#888", marginBottom: 24 }}>
          カテゴリを選択するか、新しいカテゴリを作成してください
        </p>

        <div style={styles.grid}>
          {categories.map((cat) => (
            <div key={cat.id}>
              {editingCat === cat.id ? (
                <div style={styles.card}>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && renameCategory(cat.id)}
                    style={styles.input}
                    autoFocus
                  />
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => renameCategory(cat.id)} style={styles.button}>
                      保存
                    </button>
                    <button
                      onClick={() => {
                        setEditingCat(null);
                        setEditName("");
                      }}
                      style={styles.buttonSecondary}
                    >
                      キャンセル
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  style={styles.card}
                  onClick={() => navigate(`/note/${cat.id}`)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "#c4a882";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "#e8e8e8";
                  }}
                >
                  <div style={styles.cardTitle}>{cat.name}</div>
                  <div style={styles.cardMeta}>
                    {pages.filter((p) => p.categoryId === cat.id).length} ページ
                  </div>
                  <div style={styles.actions}>
                    <button
                      style={styles.actionBtn}
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingCat(cat.id);
                        setEditName(cat.name);
                      }}
                    >
                      名前変更
                    </button>
                    <button
                      style={styles.deleteBtn}
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteCategory(cat.id);
                      }}
                    >
                      削除
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}

          <div style={styles.addCard}>
            <input
              type="text"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addCategory()}
              placeholder="新しいカテゴリ名"
              style={styles.input}
            />
            <button
              onClick={addCategory}
              disabled={!newCatName.trim()}
              style={{
                ...styles.button,
                opacity: newCatName.trim() ? 1 : 0.5,
              }}
            >
              カテゴリを作成
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Page List View (within a category)
  return (
    <div style={styles.container}>
      <div style={styles.breadcrumb}>
        <Link to="/note" style={styles.breadcrumbLink}>
          ノート
        </Link>
        <span>/</span>
        <span style={{ color: "#333" }}>{currentCategory?.name || "..."}</span>
      </div>

      <h1 style={styles.header}>{currentCategory?.name || "カテゴリ"}</h1>

      <div style={styles.grid}>
        {categoryPages.map((page) => (
          <div key={page.id}>
            {editingPage === page.id ? (
              <div style={styles.card}>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && renamePage(page.id)}
                  style={styles.input}
                  autoFocus
                />
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => renamePage(page.id)} style={styles.button}>
                    保存
                  </button>
                  <button
                    onClick={() => {
                      setEditingPage(null);
                      setEditName("");
                    }}
                    style={styles.buttonSecondary}
                  >
                    キャンセル
                  </button>
                </div>
              </div>
            ) : (
              <div
                style={styles.card}
                onClick={() => navigate(`/note/${categoryId}/${page.id}`)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#c4a882";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#e8e8e8";
                }}
              >
                <div style={styles.cardTitle}>{page.title}</div>
                <div style={styles.cardMeta}>
                  {new Date(page.updatedAt).toLocaleDateString("ja-JP")}
                </div>
                <div style={styles.actions}>
                  <button
                    style={styles.actionBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingPage(page.id);
                      setEditName(page.title);
                    }}
                  >
                    名前変更
                  </button>
                  <button
                    style={styles.deleteBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      deletePage(page.id);
                    }}
                  >
                    削除
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}

        <div style={styles.addCard}>
          <input
            type="text"
            value={newPageName}
            onChange={(e) => setNewPageName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addPage()}
            placeholder="新しいページ名"
            style={styles.input}
          />
          <button
            onClick={addPage}
            disabled={!newPageName.trim()}
            style={{
              ...styles.button,
              opacity: newPageName.trim() ? 1 : 0.5,
            }}
          >
            ページを作成
          </button>
        </div>
      </div>
    </div>
  );
}
