"use client";

import { useState, useCallback } from "react";
import type { CheckoutSection as CheckoutSectionType, PageSettings } from "@/lib/types/sections";

interface Area { id: string; name: string; administrative_division_level_1_name: string; administrative_division_level_2_name: string; administrative_division_level_3_name: string; postal_code: number; }
interface Rate { courier_name: string; courier_service_name: string; courier_service_code: string; price: number; min_day: number; max_day: number; }

function formatRp(n: number) { return "Rp " + n.toLocaleString("id-ID"); }

interface Props { s: CheckoutSectionType; settings: PageSettings; }

export function CheckoutSection({ s, settings }: Props) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [areaSearch, setAreaSearch] = useState("");
  const [areas, setAreas] = useState<Area[]>([]);
  const [selectedArea, setSelectedArea] = useState<Area | null>(null);
  const [rates, setRates] = useState<Rate[]>([]);
  const [selectedRate, setSelectedRate] = useState<Rate | null>(null);
  const [loadingAreas, setLoadingAreas] = useState(false);
  const [loadingRates, setLoadingRates] = useState(false);
  const [areaOpen, setAreaOpen] = useState(false);

  const searchTimer = { current: null as ReturnType<typeof setTimeout> | null };

  function handleAreaSearch(v: string) {
    setAreaSearch(v);
    setSelectedArea(null);
    setRates([]);
    setSelectedRate(null);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    if (v.length < 3) { setAreas([]); return; }
    searchTimer.current = setTimeout(async () => {
      setLoadingAreas(true);
      const res = await fetch(`/api/biteship/areas?q=${encodeURIComponent(v)}`);
      const json = await res.json();
      setAreas(json.data ?? []);
      setAreaOpen(true);
      setLoadingAreas(false);
    }, 400);
  }

  async function selectArea(area: Area) {
    setSelectedArea(area);
    setAreaSearch(`${area.administrative_division_level_3_name}, ${area.administrative_division_level_2_name}, ${area.administrative_division_level_1_name}`);
    setAreas([]);
    setAreaOpen(false);
    if (!s.origin_area_id) return;
    setLoadingRates(true);
    const res = await fetch("/api/biteship/rates", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ origin_area_id: s.origin_area_id, destination_area_id: area.id, weight_gram: s.weight_gram || 500, item_value: s.price || 0 }),
    });
    const json = await res.json();
    setRates(json.data ?? []);
    setLoadingRates(false);
  }

  function buildMessage() {
    const total = s.price + (selectedRate?.price ?? 0);
    return (s.message_template || "")
      .replace("{product_name}", s.product_name)
      .replace("{name}", name)
      .replace("{phone}", phone)
      .replace("{address}", address + (selectedArea ? `, ${areaSearch}` : ""))
      .replace("{courier}", selectedRate ? `${selectedRate.courier_name} ${selectedRate.courier_service_name}` : "-")
      .replace("{shipping_cost}", selectedRate ? formatRp(selectedRate.price) : "-")
      .replace("{total}", formatRp(total));
  }

  const waNumber = (s.whatsapp_number || settings.whatsapp_number).replace(/\D/g, "");
  const waReady = name && phone && address && selectedArea && selectedRate && waNumber;

  const inputCls = "w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500";

  return (
    <section id="checkout" className="px-4 py-12 bg-gray-50">
      <div className="mx-auto max-w-lg">
        {s.title && <h2 className="mb-8 text-center text-2xl font-bold text-gray-900">{s.title}</h2>}

        {s.price > 0 && (
          <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4 text-center shadow-sm">
            <div className="text-sm text-gray-500">Harga Produk</div>
            <div className="text-2xl font-extrabold text-gray-900">{formatRp(s.price)}</div>
          </div>
        )}

        <div className="space-y-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">Nama Lengkap</label>
            <input className={inputCls} placeholder="Masukkan nama lengkap" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">Nomor HP / WhatsApp</label>
            <input className={inputCls} placeholder="08xxxxxxxxxx" value={phone} onChange={e => setPhone(e.target.value)} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">Alamat Lengkap</label>
            <textarea className={inputCls} rows={2} placeholder="Jalan, no. rumah, RT/RW" value={address} onChange={e => setAddress(e.target.value)} />
          </div>
          <div className="relative">
            <label className="mb-1 block text-xs font-medium text-gray-700">Kota / Kecamatan</label>
            <input
              className={inputCls}
              placeholder="Ketik nama kecamatan atau kota..."
              value={areaSearch}
              onChange={e => handleAreaSearch(e.target.value)}
              autoComplete="off"
            />
            {loadingAreas && <div className="mt-1 text-xs text-gray-400">Mencari...</div>}
            {areaOpen && areas.length > 0 && (
              <div className="absolute z-10 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg max-h-48 overflow-y-auto">
                {areas.map(a => (
                  <button key={a.id} type="button" onClick={() => selectArea(a)}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50">
                    <span className="font-medium">{a.administrative_division_level_3_name}</span>
                    <span className="text-gray-500">, {a.administrative_division_level_2_name}, {a.administrative_division_level_1_name}</span>
                    <span className="ml-1 text-xs text-gray-400">{a.postal_code}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {loadingRates && <div className="text-center text-sm text-gray-400 py-4">Mengecek ongkos kirim...</div>}

          {rates.length > 0 && (
            <div>
              <label className="mb-2 block text-xs font-medium text-gray-700">Pilih Kurir & Layanan</label>
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {rates.map((r, i) => (
                  <label key={i} className={`flex cursor-pointer items-center justify-between rounded-lg border p-3 transition ${selectedRate === r ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"}`}>
                    <div className="flex items-center gap-2">
                      <input type="radio" className="accent-blue-600" checked={selectedRate === r} onChange={() => setSelectedRate(r)} />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{r.courier_name} — {r.courier_service_name}</div>
                        <div className="text-xs text-gray-500">Estimasi {r.min_day}–{r.max_day} hari</div>
                      </div>
                    </div>
                    <div className="text-sm font-semibold text-gray-900">{formatRp(r.price)}</div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {selectedRate && s.price > 0 && (
            <div className="rounded-lg bg-gray-50 border border-gray-200 p-3 text-sm">
              <div className="flex justify-between text-gray-600"><span>Harga produk</span><span>{formatRp(s.price)}</span></div>
              <div className="flex justify-between text-gray-600"><span>Ongkos kirim</span><span>{formatRp(selectedRate.price)}</span></div>
              <div className="mt-2 flex justify-between border-t border-gray-300 pt-2 font-bold text-gray-900"><span>Total</span><span>{formatRp(s.price + selectedRate.price)}</span></div>
            </div>
          )}

          <a
            href={waReady ? `https://wa.me/${waNumber}?text=${encodeURIComponent(buildMessage())}` : undefined}
            onClick={e => { if (!waReady) e.preventDefault(); }}
            className={`block w-full rounded-xl py-3.5 text-center text-base font-bold text-white transition ${waReady ? "hover:opacity-90 cursor-pointer" : "opacity-40 cursor-not-allowed"}`}
            style={{ backgroundColor: settings.theme_color }}
          >
            Pesan via WhatsApp
          </a>

          {!waNumber && (
            <p className="text-center text-xs text-red-500">Nomor WhatsApp penjual belum dikonfigurasi.</p>
          )}
        </div>
      </div>
    </section>
  );
}
