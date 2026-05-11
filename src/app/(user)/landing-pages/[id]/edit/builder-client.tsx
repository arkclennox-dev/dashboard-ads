"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  type LandingPageSection, type PageSettings, type SectionType,
  SECTION_LABELS, defaultSection,
} from "@/lib/types/sections";

const inputCls = "w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink placeholder:text-muted-2 focus:border-brand focus:outline-none";
const labelCls = "block mb-1 text-xs font-medium text-ink-2";

// ── Generic list item editor ─────────────────────────────────────────────────
function ItemList<T extends Record<string, unknown>>({
  items, onChange, renderItem, newItem,
}: {
  items: T[]; onChange: (v: T[]) => void;
  renderItem: (item: T, update: (v: T) => void, remove: () => void) => React.ReactNode;
  newItem: () => T;
}) {
  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={i} className="rounded-lg border border-border bg-surface p-3">
          {renderItem(
            item,
            (v) => { const n = [...items]; n[i] = v; onChange(n); },
            () => onChange(items.filter((_, j) => j !== i)),
          )}
        </div>
      ))}
      <button type="button" onClick={() => onChange([...items, newItem()])}
        className="text-xs text-brand-300 hover:underline">+ Tambah item</button>
    </div>
  );
}

// ── Section form editors ─────────────────────────────────────────────────────
function SectionForm({ section, onChange }: { section: LandingPageSection; onChange: (s: LandingPageSection) => void }) {
  function set(key: string, value: unknown) {
    onChange({ ...(section as unknown as Record<string, unknown>), [key]: value } as unknown as LandingPageSection);
  }

  const ctaTypeOptions = (
    <select value={(section as { cta_type?: string }).cta_type ?? "scroll"} onChange={e => set("cta_type" as keyof LandingPageSection, e.target.value)} className={inputCls}>
      <option value="scroll">Scroll ke Form Order</option>
      <option value="whatsapp">WhatsApp</option>
      <option value="link">Link URL</option>
    </select>
  );

  switch (section.type) {
    case "hero": return (
      <div className="space-y-3">
        <label className="block"><span className={labelCls}>Headline</span><input className={inputCls} value={section.headline} onChange={e => set("headline", e.target.value)} /></label>
        <label className="block"><span className={labelCls}>Subheadline</span><textarea className={inputCls} rows={2} value={section.subheadline} onChange={e => set("subheadline", e.target.value)} /></label>
        <label className="block"><span className={labelCls}>URL Gambar</span><input className={inputCls} placeholder="https://..." value={section.image_url} onChange={e => set("image_url", e.target.value)} /></label>
        <label className="block"><span className={labelCls}>Teks Tombol CTA</span><input className={inputCls} value={section.cta_text} onChange={e => set("cta_text", e.target.value)} /></label>
        <label className="block"><span className={labelCls}>Aksi Tombol</span>{ctaTypeOptions}</label>
        {section.cta_type === "link" && <label className="block"><span className={labelCls}>URL Tujuan</span><input className={inputCls} value={section.cta_url} onChange={e => set("cta_url", e.target.value)} /></label>}
        {section.cta_type === "whatsapp" && <label className="block"><span className={labelCls}>Nomor WA (kosongkan untuk pakai default)</span><input className={inputCls} placeholder="628xxx" value={section.cta_url} onChange={e => set("cta_url", e.target.value)} /></label>}
      </div>
    );

    case "benefits": return (
      <div className="space-y-3">
        <label className="block"><span className={labelCls}>Judul Section</span><input className={inputCls} value={section.title} onChange={e => set("title", e.target.value)} /></label>
        <span className={labelCls}>Item Keunggulan</span>
        <ItemList
          items={section.items}
          onChange={v => set("items", v)}
          newItem={() => ({ emoji: "✅", title: "", description: "" })}
          renderItem={(item, upd, rm) => (
            <div className="space-y-2">
              <div className="flex gap-2">
                <input className={inputCls + " w-14"} placeholder="emoji" value={item.emoji} onChange={e => upd({ ...item, emoji: e.target.value })} />
                <input className={inputCls} placeholder="Judul" value={item.title} onChange={e => upd({ ...item, title: e.target.value })} />
                <button type="button" onClick={rm} className="shrink-0 text-danger text-xs">✕</button>
              </div>
              <input className={inputCls} placeholder="Deskripsi (opsional)" value={item.description} onChange={e => upd({ ...item, description: e.target.value })} />
            </div>
          )}
        />
      </div>
    );

    case "gallery": return (
      <div className="space-y-3">
        <label className="block"><span className={labelCls}>Judul Section</span><input className={inputCls} value={section.title} onChange={e => set("title", e.target.value)} /></label>
        <span className={labelCls}>Gambar</span>
        <ItemList
          items={section.images}
          onChange={v => set("images", v)}
          newItem={() => ({ url: "", caption: "" })}
          renderItem={(item, upd, rm) => (
            <div className="space-y-2">
              <div className="flex gap-2">
                <input className={inputCls} placeholder="URL gambar" value={item.url} onChange={e => upd({ ...item, url: e.target.value })} />
                <button type="button" onClick={rm} className="shrink-0 text-danger text-xs">✕</button>
              </div>
              <input className={inputCls} placeholder="Caption (opsional)" value={item.caption} onChange={e => upd({ ...item, caption: e.target.value })} />
            </div>
          )}
        />
      </div>
    );

    case "testimonials": return (
      <div className="space-y-3">
        <label className="block"><span className={labelCls}>Judul Section</span><input className={inputCls} value={section.title} onChange={e => set("title", e.target.value)} /></label>
        <span className={labelCls}>Testimoni</span>
        <ItemList
          items={section.items}
          onChange={v => set("items", v)}
          newItem={() => ({ name: "", rating: 5, text: "", avatar_url: "" })}
          renderItem={(item, upd, rm) => (
            <div className="space-y-2">
              <div className="flex gap-2 items-center">
                <input className={inputCls} placeholder="Nama" value={item.name} onChange={e => upd({ ...item, name: e.target.value })} />
                <select className={inputCls + " w-20"} value={item.rating} onChange={e => upd({ ...item, rating: Number(e.target.value) })}>
                  {[5,4,3,2,1].map(n => <option key={n} value={n}>{"★".repeat(n)}</option>)}
                </select>
                <button type="button" onClick={rm} className="shrink-0 text-danger text-xs">✕</button>
              </div>
              <textarea className={inputCls} rows={2} placeholder="Teks testimoni" value={item.text} onChange={e => upd({ ...item, text: e.target.value })} />
            </div>
          )}
        />
      </div>
    );

    case "pricing": return (
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <label className="block"><span className={labelCls}>Harga Normal (0 = sembunyikan)</span><input type="number" className={inputCls} value={section.original_price} onChange={e => set("original_price", Number(e.target.value))} /></label>
          <label className="block"><span className={labelCls}>Harga Jual</span><input type="number" className={inputCls} value={section.sale_price} onChange={e => set("sale_price", Number(e.target.value))} /></label>
        </div>
        <label className="block"><span className={labelCls}>Badge (misal: Hemat 25%)</span><input className={inputCls} value={section.badge} onChange={e => set("badge", e.target.value)} /></label>
        <label className="block"><span className={labelCls}>Catatan</span><input className={inputCls} value={section.note} onChange={e => set("note", e.target.value)} /></label>
      </div>
    );

    case "video": return (
      <div className="space-y-3">
        <label className="block"><span className={labelCls}>Judul</span><input className={inputCls} value={section.title} onChange={e => set("title", e.target.value)} /></label>
        <label className="block"><span className={labelCls}>URL YouTube</span><input className={inputCls} placeholder="https://youtube.com/watch?v=..." value={section.youtube_url} onChange={e => set("youtube_url", e.target.value)} /></label>
      </div>
    );

    case "faq": return (
      <div className="space-y-3">
        <label className="block"><span className={labelCls}>Judul Section</span><input className={inputCls} value={section.title} onChange={e => set("title", e.target.value)} /></label>
        <span className={labelCls}>Pertanyaan & Jawaban</span>
        <ItemList
          items={section.items}
          onChange={v => set("items", v)}
          newItem={() => ({ question: "", answer: "" })}
          renderItem={(item, upd, rm) => (
            <div className="space-y-2">
              <div className="flex gap-2">
                <input className={inputCls} placeholder="Pertanyaan" value={item.question} onChange={e => upd({ ...item, question: e.target.value })} />
                <button type="button" onClick={rm} className="shrink-0 text-danger text-xs">✕</button>
              </div>
              <textarea className={inputCls} rows={2} placeholder="Jawaban" value={item.answer} onChange={e => upd({ ...item, answer: e.target.value })} />
            </div>
          )}
        />
      </div>
    );

    case "cta": return (
      <div className="space-y-3">
        <label className="block"><span className={labelCls}>Headline</span><input className={inputCls} value={section.headline} onChange={e => set("headline", e.target.value)} /></label>
        <label className="block"><span className={labelCls}>Subtitle</span><input className={inputCls} value={section.subtitle} onChange={e => set("subtitle", e.target.value)} /></label>
        <label className="block"><span className={labelCls}>Teks Tombol</span><input className={inputCls} value={section.cta_text} onChange={e => set("cta_text", e.target.value)} /></label>
        <label className="block"><span className={labelCls}>Aksi Tombol</span>{ctaTypeOptions}</label>
      </div>
    );

    case "checkout": return <CheckoutEditor section={section} onChange={onChange} />;

    default: return <div className="text-sm text-muted">Section tidak dikenali.</div>;
  }
}

// ── Checkout section editor (has area search) ─────────────────────────────────
function CheckoutEditor({ section, onChange }: { section: LandingPageSection & { type: "checkout" }; onChange: (s: LandingPageSection) => void }) {
  const [areaSearch, setAreaSearch] = useState(section.origin_area_label ?? "");
  const [areas, setAreas] = useState<{ id: string; administrative_division_level_3_name: string; administrative_division_level_2_name: string; administrative_division_level_1_name: string }[]>([]);
  const [timer, setTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  function set(key: string, value: unknown) { onChange({ ...section, [key]: value } as LandingPageSection); }

  function searchArea(v: string) {
    setAreaSearch(v);
    if (timer) clearTimeout(timer);
    if (v.length < 3) { setAreas([]); return; }
    setTimer(setTimeout(async () => {
      const res = await fetch(`/api/biteship/areas?q=${encodeURIComponent(v)}`);
      const json = await res.json();
      setAreas(json.data ?? []);
    }, 400));
  }

  return (
    <div className="space-y-3">
      <label className="block"><span className={labelCls}>Judul Section</span><input className={inputCls} value={section.title} onChange={e => set("title", e.target.value)} /></label>
      <label className="block"><span className={labelCls}>Nama Produk</span><input className={inputCls} value={section.product_name} onChange={e => set("product_name", e.target.value)} /></label>
      <div className="grid grid-cols-2 gap-3">
        <label className="block"><span className={labelCls}>Harga (Rp)</span><input type="number" className={inputCls} value={section.price} onChange={e => set("price", Number(e.target.value))} /></label>
        <label className="block"><span className={labelCls}>Berat (gram)</span><input type="number" className={inputCls} value={section.weight_gram} onChange={e => set("weight_gram", Number(e.target.value))} /></label>
      </div>
      <div className="relative">
        <span className={labelCls}>Lokasi Asal (untuk ongkir)</span>
        <input className={inputCls} placeholder="Ketik kecamatan/kota penjual..." value={areaSearch} onChange={e => searchArea(e.target.value)} />
        {section.origin_area_id && <div className="mt-1 text-xs text-brand-300">✓ Area ID: {section.origin_area_id}</div>}
        {areas.length > 0 && (
          <div className="absolute z-10 mt-1 w-full rounded-lg border border-border bg-surface shadow-lg max-h-40 overflow-y-auto">
            {areas.map(a => (
              <button key={a.id} type="button" onClick={() => {
                const label = `${a.administrative_division_level_3_name}, ${a.administrative_division_level_2_name}`;
                set("origin_area_id", a.id);
                set("origin_area_label", label);
                setAreaSearch(label);
                setAreas([]);
              }} className="w-full px-3 py-2 text-left text-xs hover:bg-surface-3">
                {a.administrative_division_level_3_name}, {a.administrative_division_level_2_name}, {a.administrative_division_level_1_name}
              </button>
            ))}
          </div>
        )}
      </div>
      <label className="block"><span className={labelCls}>Nomor WhatsApp Penjual (628xxx)</span><input className={inputCls} placeholder="628xxx" value={section.whatsapp_number} onChange={e => set("whatsapp_number", e.target.value)} /></label>
      <label className="block">
        <span className={labelCls}>Template Pesan WA</span>
        <div className="mb-1 text-[10px] text-muted">Variabel: {"{product_name}"} {"{name}"} {"{phone}"} {"{address}"} {"{courier}"} {"{shipping_cost}"} {"{total}"}</div>
        <textarea className={inputCls} rows={5} value={section.message_template} onChange={e => set("message_template", e.target.value)} />
      </label>
    </div>
  );
}

// ── Main builder ──────────────────────────────────────────────────────────────
const ALL_SECTION_TYPES: SectionType[] = ["hero","benefits","gallery","testimonials","pricing","video","faq","cta","checkout"];

interface Props {
  id: string; title: string; slug: string; status: string;
  initialSections: LandingPageSection[];
  initialSettings: PageSettings;
}

export function BuilderClient({ id, title, slug, status: initialStatus, initialSections, initialSettings }: Props) {
  const router = useRouter();
  const [sections, setSections] = useState<LandingPageSection[]>(initialSections);
  const [settings, setSettings] = useState<PageSettings>(initialSettings);
  const [selectedId, setSelectedId] = useState<string | null>(sections[0]?.id ?? null);
  const [tab, setTab] = useState<"sections" | "settings">("sections");
  const [status, setStatus] = useState(initialStatus);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [pageMode, setPageMode] = useState<"sections" | "html">(initialSettings.page_mode ?? "sections");
  const [customHtml, setCustomHtml] = useState(initialSettings.custom_html ?? "");

  const selected = sections.find(s => s.id === selectedId) ?? null;

  function addSection(type: SectionType) {
    const id = Math.random().toString(36).slice(2);
    const s = defaultSection(type, id);
    setSections(prev => [...prev, s]);
    setSelectedId(id);
    setShowAdd(false);
  }

  function updateSection(s: LandingPageSection) {
    setSections(prev => prev.map(x => x.id === s.id ? s : x));
  }

  function moveUp(i: number) { if (i === 0) return; const n = [...sections]; [n[i-1], n[i]] = [n[i], n[i-1]]; setSections(n); }
  function moveDown(i: number) { if (i === sections.length - 1) return; const n = [...sections]; [n[i], n[i+1]] = [n[i+1], n[i]]; setSections(n); }
  function remove(i: number) { const n = sections.filter((_, j) => j !== i); setSections(n); setSelectedId(n[0]?.id ?? null); }

  async function save() {
    setSaving(true);
    await fetch(`/api/landing-pages/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        sections,
        page_settings: { ...settings, page_mode: pageMode, custom_html: customHtml },
        status,
      }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    router.refresh();
  }

  return (
    <div className="flex h-screen flex-col bg-canvas text-ink">
      {/* Top bar */}
      <div className="flex items-center gap-3 border-b border-border bg-surface px-4 py-3 shrink-0">
        <a href="/landing-pages" className="text-sm text-muted hover:text-ink">← Kembali</a>
        <span className="text-sm font-semibold truncate max-w-[200px]">{title}</span>
        <span className="text-xs text-muted">/lp/{slug}</span>
        <div className="ml-auto flex items-center gap-2">
          {/* Mode toggle */}
          <div className="flex rounded-lg border border-border bg-surface-3 p-0.5 text-xs">
            {(["sections", "html"] as const).map(m => (
              <button key={m} type="button" onClick={() => setPageMode(m)}
                className={`rounded-md px-3 py-1 font-medium transition ${pageMode === m ? "bg-surface text-ink shadow-sm" : "text-muted hover:text-ink"}`}>
                {m === "sections" ? "Sections" : "HTML"}
              </button>
            ))}
          </div>
          <select value={status} onChange={e => setStatus(e.target.value)}
            className="rounded-lg border border-border bg-surface px-2 py-1.5 text-xs text-ink focus:outline-none">
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
          <a href={`/lp/${slug}`} target="_blank" rel="noreferrer"
            className="rounded-lg border border-border px-3 py-1.5 text-xs text-ink-2 hover:bg-surface-3">
            Preview ↗
          </a>
          <button onClick={save} disabled={saving}
            className="rounded-lg bg-brand px-4 py-1.5 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-50">
            {saving ? "Menyimpan…" : saved ? "✓ Tersimpan" : "Simpan"}
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left panel */}
        <div className="flex w-60 shrink-0 flex-col border-r border-border bg-surface overflow-y-auto">
          {/* Tabs */}
          <div className="flex border-b border-border">
            {(["sections", "settings"] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`flex-1 py-2.5 text-xs font-medium capitalize transition ${tab === t ? "border-b-2 border-brand text-brand" : "text-muted hover:text-ink"}`}>
                {t === "sections" ? "Sections" : "Pengaturan"}
              </button>
            ))}
          </div>

          {tab === "sections" && (
            <div className="flex-1 p-2 space-y-1">
              {sections.map((s, i) => (
                <div key={s.id} className={`group flex items-center gap-1 rounded-lg px-2 py-2 cursor-pointer transition ${selectedId === s.id ? "bg-brand/10 text-brand" : "hover:bg-surface-3 text-ink-2"}`}
                  onClick={() => setSelectedId(s.id)}>
                  <span className="flex-1 truncate text-xs font-medium">{SECTION_LABELS[s.type]}</span>
                  <div className="hidden group-hover:flex items-center gap-0.5">
                    <button type="button" onClick={e => { e.stopPropagation(); moveUp(i); }} className="p-0.5 text-muted hover:text-ink text-xs">↑</button>
                    <button type="button" onClick={e => { e.stopPropagation(); moveDown(i); }} className="p-0.5 text-muted hover:text-ink text-xs">↓</button>
                    <button type="button" onClick={e => { e.stopPropagation(); remove(i); }} className="p-0.5 text-danger text-xs">✕</button>
                  </div>
                </div>
              ))}

              <div className="relative mt-2">
                <button onClick={() => setShowAdd(v => !v)}
                  className="w-full rounded-lg border border-dashed border-border py-2 text-xs text-muted hover:border-brand hover:text-brand transition">
                  + Tambah Section
                </button>
                {showAdd && (
                  <div className="absolute left-0 top-full z-10 mt-1 w-full rounded-lg border border-border bg-surface shadow-lg">
                    {ALL_SECTION_TYPES.map(type => (
                      <button key={type} type="button" onClick={() => addSection(type)}
                        className="block w-full px-3 py-2 text-left text-xs hover:bg-surface-3 text-ink-2">
                        {SECTION_LABELS[type]}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {tab === "settings" && (
            <div className="flex-1 p-3 space-y-3">
              <label className="block"><span className={labelCls}>Warna Tema</span>
                <div className="flex gap-2">
                  <input type="color" value={settings.theme_color} onChange={e => setSettings(s => ({ ...s, theme_color: e.target.value }))} className="h-9 w-12 rounded border border-border cursor-pointer" />
                  <input className={inputCls} value={settings.theme_color} onChange={e => setSettings(s => ({ ...s, theme_color: e.target.value }))} />
                </div>
              </label>
              <label className="block"><span className={labelCls}>No. WhatsApp Default (628xxx)</span>
                <input className={inputCls} placeholder="628xxx" value={settings.whatsapp_number} onChange={e => setSettings(s => ({ ...s, whatsapp_number: e.target.value }))} />
              </label>
              <div className="space-y-1">
                <label className="flex items-center gap-2 text-xs text-ink-2">
                  <input type="checkbox" checked={settings.sticky_cta_enabled} onChange={e => setSettings(s => ({ ...s, sticky_cta_enabled: e.target.checked }))} className="rounded" />
                  Tampilkan tombol sticky
                </label>
                {settings.sticky_cta_enabled && (
                  <>
                    <input className={inputCls} placeholder="Teks tombol sticky" value={settings.sticky_cta_text} onChange={e => setSettings(s => ({ ...s, sticky_cta_text: e.target.value }))} />
                    <select className={inputCls} value={settings.sticky_cta_type} onChange={e => setSettings(s => ({ ...s, sticky_cta_type: e.target.value as PageSettings["sticky_cta_type"] }))}>
                      <option value="scroll">Scroll ke Form Order</option>
                      <option value="whatsapp">WhatsApp</option>
                      <option value="link">Link URL</option>
                    </select>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right panel: section editor or HTML editor */}
        {pageMode === "html" ? (
          <div className="flex flex-1 flex-col overflow-hidden">
            <div className="flex items-center gap-3 border-b border-border bg-surface-3 px-4 py-2 shrink-0">
              <span className="text-xs font-medium text-ink-2">Mode HTML — paste raw HTML dari landing page lain</span>
              <span className="ml-auto text-[10px] text-muted">Halaman akan merender HTML ini langsung saat di-Publish</span>
            </div>
            <textarea
              className="flex-1 resize-none bg-canvas p-4 font-mono text-xs text-ink focus:outline-none"
              placeholder="<!DOCTYPE html>&#10;<html>&#10;  ...&#10;</html>"
              value={customHtml}
              onChange={e => setCustomHtml(e.target.value)}
              spellCheck={false}
            />
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-6">
            {selected ? (
              <div>
                <h2 className="mb-4 text-base font-semibold text-ink">{SECTION_LABELS[selected.type]}</h2>
                <div className="max-w-2xl">
                  <SectionForm section={selected} onChange={updateSection} />
                </div>
              </div>
            ) : (
              <div className="flex h-full items-center justify-center text-muted text-sm">
                Pilih section di sebelah kiri untuk mulai mengedit.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
