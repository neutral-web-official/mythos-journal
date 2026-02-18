import { useState, useEffect, useCallback } from "react";

const QS = [
  { id: "flaw", label: "欠陥の種類", ph: "このエピソードに現れる神・人間の欠陥は何か？" },
  { id: "power", label: "権力構造", ph: "誰が誰に対してどんな力を持っているか？" },
  { id: "order", label: "秩序の作られ方", ph: "どのように秩序が生まれ、維持され、壊されるか？" },
  { id: "art", label: "美術化された例", ph: "この物語を描いた絵画・彫刻・作品は？" },
  { id: "modern", label: "現代接続仮説", ph: "現代のどんな現象・構造とつながるか？" },
];

const SK = { entries: "mythos-entries-v1", goal: "mythos-goal-v1" };

function fmtDate(s) {
  const d = new Date(s), w = ["日","月","火","水","木","金","土"];
  return d.getFullYear() + "/" + (d.getMonth()+1) + "/" + d.getDate() + "（" + w[d.getDay()] + "）";
}

function weekRange() {
  const now = new Date(), day = now.getDay();
  const m = new Date(now); m.setDate(now.getDate() - ((day+6)%7)); m.setHours(0,0,0,0);
  const s = new Date(m); s.setDate(m.getDate()+6); s.setHours(23,59,59,999);
  return { m, s };
}

function ld(k, fb) {
  try { const r = localStorage.getItem(k); return r ? JSON.parse(r) : fb; }
  catch { return fb; }
}
function sv(k, d) {
  try { localStorage.setItem(k, JSON.stringify(d)); }
  catch(e) { console.error(e); }
}

function ProgressBar({ c, g }) {
  const p = Math.min((c/g)*100, 100), r = Math.max(g-c, 0);
  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontSize: 13, color: "#717171" }}>{c} / {g} トピック</span>
        <span style={{ fontSize: 13, color: "#717171" }}>あと {r}</span>
      </div>
      <div style={{ height: 4, background: "#eee", borderRadius: 2, overflow: "hidden" }}>
        <div style={{ height: "100%", width: p+"%", background: p >= 100 ? "#7a9a6a" : "#c4a882", borderRadius: 2, transition: "width 0.5s ease" }} />
      </div>
    </div>
  );
}

function Form({ onSave, ed }) {
  const [t, sT] = useState("");
  const [src, sSrc] = useState("");
  const [ans, sAns] = useState({});
  const [busy, sB] = useState(false);

  useEffect(() => {
    if (ed) { sT(ed.title||""); sSrc(ed.source||""); sAns(ed.answers||{}); }
    else { sT(""); sSrc(""); sAns({}); }
  }, [ed]);

  const go = async () => {
    if (!t.trim()) return;
    sB(true);
    await onSave({ title: t.trim(), source: src.trim(), answers: ans });
    if (!ed) { sT(""); sSrc(""); sAns({}); }
    sB(false);
  };

  const ok = t.trim().length > 0;

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <input type="text" value={t} onChange={e => sT(e.target.value)}
          placeholder="今日学んだトピック名"
          style={{ width: "100%", boxSizing: "border-box", fontSize: 18, fontWeight: 600, padding: "10px 0", border: "none", borderBottom: "1px solid #e0e0e0", outline: "none", background: "transparent", color: "#222", fontFamily: "inherit" }} />
      </div>
      <div style={{ marginBottom: 24 }}>
        <input type="text" value={src} onChange={e => sSrc(e.target.value)}
          placeholder="ソース（書籍名、URL、ポッドキャスト名など）"
          style={{ width: "100%", boxSizing: "border-box", fontSize: 13, padding: "8px 0", border: "none", borderBottom: "1px solid #eee", outline: "none", background: "transparent", color: "#666", fontFamily: "inherit" }} />
      </div>
      {QS.map(q => (
        <div key={q.id} style={{ marginBottom: 20 }}>
          <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: "#393939", marginBottom: 6 }}>{q.label}</label>
          <textarea value={ans[q.id] || ""} onChange={e => sAns(p => ({...p, [q.id]: e.target.value}))}
            placeholder={q.ph} rows={3}
            style={{ width: "100%", boxSizing: "border-box", fontSize: 15, lineHeight: 1.7, padding: "10px 12px", border: "1px solid #e8e8e8", borderRadius: 6, outline: "none", background: "#fff", color: "#222", fontFamily: "inherit", resize: "vertical" }}
            onFocus={e => { e.target.style.borderColor = "#9b9b9b"; }}
            onBlur={e => { e.target.style.borderColor = "#e8e8e8"; }} />
        </div>
      ))}
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
        <button onClick={go} disabled={!ok || busy}
          style={{ padding: "8px 24px", fontSize: 14, fontWeight: 500, background: ok ? "#555" : "#ccc", color: "#fff", border: "none", borderRadius: 6, cursor: ok ? "pointer" : "default", fontFamily: "inherit" }}>
          {ed ? "更新する" : "記録する"}
        </button>
      </div>
    </div>
  );
}

function Card({ entry, onEdit, onDel }) {
  const [open, sO] = useState(false);
  const filled = QS.filter(q => entry.answers?.[q.id]?.trim()).length;

  return (
    <div style={{ padding: "14px 0", borderBottom: "1px solid #f0f0f0" }}>
      <div onClick={() => sO(!open)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}>
        <div>
          <span style={{ fontSize: 15, fontWeight: 500, color: "#333" }}>{entry.title}</span>
          <span style={{ fontSize: 12, color: "#aaa", marginLeft: 10 }}>{fmtDate(entry.date)}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 11, color: "#bbb" }}>{filled}/5</span>
          <span style={{ fontSize: 12, color: "#ccc", transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s", display: "inline-block" }}>▼</span>
        </div>
      </div>
      {open && (
        <div style={{ marginTop: 12 }}>
          {entry.source && <div style={{ fontSize: 12, color: "#999", marginBottom: 10 }}>📎 {entry.source}</div>}
          {QS.map(q => {
            const v = entry.answers?.[q.id];
            if (!v?.trim()) return null;
            return (
              <div key={q.id} style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#888", marginBottom: 2 }}>{q.label}</div>
                <div style={{ fontSize: 13, color: "#444", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{v}</div>
              </div>
            );
          })}
          <div style={{ display: "flex", gap: 12, marginTop: 10 }}>
            <button onClick={() => onEdit(entry)} style={{ fontSize: 12, color: "#999", background: "none", border: "none", cursor: "pointer", padding: 0, fontFamily: "inherit" }}>編集</button>
            <button onClick={() => onDel(entry.id)} style={{ fontSize: 12, color: "#cc8888", background: "none", border: "none", cursor: "pointer", padding: 0, fontFamily: "inherit" }}>削除</button>
          </div>
        </div>
      )}
    </div>
  );
}

function Review({ entries, goal }) {
  const { m, s } = weekRange();
  const we = entries.filter(e => { const d = new Date(e.date); return d >= m && d <= s; });
  const tot = entries.length;
  const pct = Math.round((tot / goal) * 100);
  const first = entries.length > 0 ? new Date(entries.reduce((a, e) => e.date < a ? e.date : a, entries[0].date)) : new Date();
  const wks = Math.max(1, Math.ceil((Date.now() - first.getTime()) / 604800000));
  const avg = (tot / wks).toFixed(1);
  const rem = Math.max(goal - tot, 0);
  const need = rem > 0 ? Math.ceil(rem / Math.max(parseFloat(avg), 0.1)) : 0;

  let msg, mc = "#7a9a6a";
  if (tot >= goal) msg = "🎉 目標達成おめでとうございます！";
  else if (we.length >= 5) msg = "素晴らしいペースです。この調子で続けましょう。";
  else if (we.length >= 3) msg = "順調です。着実に積み重なっています。";
  else if (we.length >= 1) { msg = "今週も学びがありましたね。もう少しペースを上げるとゴールが近づきます。"; mc = "#c4a882"; }
  else { msg = "今週はまだ記録がありません。小さな一歩から始めましょう。"; mc = "#cc8888"; }

  const cats = QS.map(q => {
    const f = entries.filter(e => e.answers?.[q.id]?.trim()).length;
    return { label: q.label, pct: tot > 0 ? Math.round((f / tot) * 100) : 0 };
  });

  return (
    <div>
      <div style={{ fontSize: 15, color: mc, fontWeight: 500, marginBottom: 24, lineHeight: 1.6 }}>{msg}</div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 28 }}>
        <div>
          <div style={{ fontSize: 28, fontWeight: 600, color: "#333" }}>{we.length}</div>
          <div style={{ fontSize: 12, color: "#999" }}>今週の記録</div>
        </div>
        <div>
          <div style={{ fontSize: 28, fontWeight: 600, color: "#333" }}>{tot}</div>
          <div style={{ fontSize: 12, color: "#999" }}>累計トピック</div>
        </div>
        <div>
          <div style={{ fontSize: 28, fontWeight: 600, color: "#333" }}>{pct}%</div>
          <div style={{ fontSize: 12, color: "#999" }}>目標達成率</div>
        </div>
      </div>

      {we.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#393939", marginBottom: 8 }}>今週学んだトピック</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {we.map((e, i) => (
              <span key={i} style={{ fontSize: 12, padding: "4px 10px", background: "#f5f0eb", borderRadius: 12, color: "#666" }}>{e.title}</span>
            ))}
          </div>
        </div>
      )}

      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: "#393939", marginBottom: 10 }}>観点別の記入率</div>
        {cats.map(c => (
          <div key={c.label} style={{ display: "flex", alignItems: "center", marginBottom: 6, gap: 10 }}>
            <div style={{ fontSize: 12, color: "#888", width: 100, flexShrink: 0 }}>{c.label}</div>
            <div style={{ flex: 1, height: 3, background: "#eee", borderRadius: 2 }}>
              <div style={{ height: "100%", width: c.pct + "%", background: "#c4a882", borderRadius: 2 }} />
            </div>
            <div style={{ fontSize: 11, color: "#aaa", width: 35, textAlign: "right" }}>{c.pct}%</div>
          </div>
        ))}
      </div>

      <div style={{ padding: "12px 16px", background: "#f9f8f6", borderRadius: 8, fontSize: 13, color: "#777", lineHeight: 1.6 }}>
        週平均 <strong style={{ color: "#555" }}>{avg}</strong> トピック
        {rem > 0 && <span>　→　このペースだとあと約 <strong style={{ color: "#555" }}>{need}週</strong> で目標達成</span>}
      </div>
    </div>
  );
}

export default function MythosJournal() {
  const [entries, setEntries] = useState([]);
  const [goal, setGoal] = useState(100);
  const [view, setView] = useState("form");
  const [ed, sEd] = useState(null);
  const [notice, sN] = useState(false);

  useEffect(() => {
    setEntries(ld(SK.entries, []));
    setGoal(ld(SK.goal, 100));
  }, []);

  const persist = useCallback(ne => {
    setEntries(ne);
    sv(SK.entries, ne);
  }, []);

  const handleSave = async data => {
    let ne;
    if (ed) {
      ne = entries.map(e => e.id === ed.id ? { ...e, ...data } : e);
      sEd(null);
    } else {
      ne = [{ id: Date.now().toString(), date: new Date().toISOString(), ...data }, ...entries];
    }
    persist(ne);
    sN(true);
    setTimeout(() => sN(false), 2000);
  };

  const tabs = [
    ["form", "記録"],
    ["list", "一覧（" + entries.length + "）"],
    ["review", "週次振り返り"],
  ];

  return (
    <div style={{ fontFamily: "'LINE Seed JP', -apple-system, BlinkMacSystemFont, sans-serif", maxWidth: 560, margin: "0 auto", minHeight: "100vh", background: "#fff", color: "#333" }}>
      <div style={{ padding: "28px 24px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h1 style={{ fontSize: 18, fontWeight: 600, color: "#333", margin: 0, letterSpacing: "0.02em" }}>Mythos Journal</h1>
          <button onClick={() => setView(view === "settings" ? "form" : "settings")}
            style={{ fontSize: 16, color: "#bbb", background: "none", border: "none", cursor: "pointer", padding: "4px 8px", fontFamily: "inherit" }}>⚙</button>
        </div>
        <div style={{ fontSize: 12, color: "#bbb", marginTop: 4 }}>神話から学んだことを、5つの視点で記録する</div>
      </div>

      <div style={{ padding: "20px 24px 0" }}>
        <ProgressBar c={entries.length} g={goal} />
      </div>

      <div style={{ display: "flex", padding: "0 24px", borderBottom: "1px solid #f0f0f0", marginBottom: 24 }}>
        {tabs.map(([k, l]) => (
          <button key={k} onClick={() => { setView(k); sEd(null); }}
            style={{
              fontSize: 13, fontWeight: view === k ? 600 : 400,
              color: view === k ? "#222" : "#bbb",
              background: "none", border: "none",
              borderBottom: view === k ? "2px solid #333" : "2px solid transparent",
              padding: "8px 16px", cursor: "pointer", fontFamily: "inherit",
            }}>
            {l}
          </button>
        ))}
      </div>

      <div style={{ padding: "0 24px 40px" }}>
        {notice && <div style={{ fontSize: 13, color: "#7a9a6a", marginBottom: 16 }}>✓ 記録しました</div>}

        {view === "form" && (
          <div>
            {ed && (
              <div style={{ marginBottom: 16, display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 13, color: "#999" }}>編集中</span>
                <button onClick={() => sEd(null)} style={{ fontSize: 12, color: "#999", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}>キャンセル</button>
              </div>
            )}
            <Form onSave={handleSave} ed={ed} />
          </div>
        )}

        {view === "list" && (
          entries.length === 0
            ? <div style={{ fontSize: 14, color: "#ccc", textAlign: "center", padding: "40px 0" }}>まだ記録がありません</div>
            : entries.map(e => (
              <Card key={e.id} entry={e}
                onEdit={x => { sEd(x); setView("form"); }}
                onDel={id => persist(entries.filter(x => x.id !== id))} />
            ))
        )}

        {view === "review" && <Review entries={entries} goal={goal} />}

        {view === "settings" && (
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#393939", marginBottom: 12 }}>目標設定</div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
              <input type="number" value={goal}
                onChange={e => { const v = Math.max(1, parseInt(e.target.value) || 1); setGoal(v); sv(SK.goal, v); }}
                style={{ width: 80, fontSize: 16, padding: "6px 10px", border: "1px solid #e0e0e0", borderRadius: 6, outline: "none", fontFamily: "inherit", textAlign: "center" }} />
              <span style={{ fontSize: 13, color: "#888" }}>トピック</span>
            </div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#393939", marginBottom: 12 }}>データ</div>
            <div style={{ fontSize: 13, color: "#888" }}>累計 {entries.length} 件の記録</div>
          </div>
        )}
      </div>
    </div>
  );
}
