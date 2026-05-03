import { PageShell } from "@/components/page-shell";

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-4">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand text-sm font-bold text-white">
        {n}
      </div>
      <div className="flex-1 pb-8 border-l border-dashed border-border pl-6 -ml-[1.25rem]">
        <h2 className="mb-2 text-base font-semibold text-ink">{title}</h2>
        <div className="space-y-2 text-sm text-ink-2 leading-relaxed">{children}</div>
      </div>
    </div>
  );
}

function Code({ children }: { children: React.ReactNode }) {
  return (
    <code className="rounded bg-surface-3 px-1.5 py-0.5 text-xs font-mono text-brand-300">
      {children}
    </code>
  );
}

function Note({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-brand/20 bg-brand/5 px-3 py-2 text-xs text-ink-2">
      {children}
    </div>
  );
}

function Warn({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-warn/30 bg-warn/5 px-3 py-2 text-xs text-ink-2">
      {children}
    </div>
  );
}

export default function PanduanPage() {
  return (
    <PageShell
      title="Panduan"
      subtitle="Cara menggunakan dashboard ini dari awal sampai bisa tracking iklan."
    >
      <div className="max-w-2xl">

        {/* ─── STEP 1 ─── */}
        <Step n={1} title="Pengaturan Awal — Site URL">
          <p>
            Buka <strong>Pengaturan</strong> di sidebar, isi kolom <strong>Site URL</strong>
            {" "}dengan domain website kamu (contoh: <Code>https://tokoafiliasi.com</Code>).
          </p>
          <p>
            Site URL ini dipakai untuk membuat link redirect yang bisa di-track.
            Tanpa ini, semua link yang di-generate tidak akan berfungsi dengan benar.
          </p>
          <Note>
            Jika belum punya domain, kamu bisa gunakan URL Vercel sementara,
            contoh: <Code>https://nama-project.vercel.app</Code>
          </Note>
          <p>
            Isi juga <strong>Nama Toko/Brand</strong> agar mudah dikenali. Field lainnya
            (Meta Pixel ID, GA4) opsional dan bisa diisi nanti.
          </p>
        </Step>

        {/* ─── STEP 2 ─── */}
        <Step n={2} title="Buat Link Tracking di Redirect Builder">
          <p>
            Buka <strong>Redirect Builder</strong> di sidebar. Di bagian atas ada form untuk
            membuat link tracking baru:
          </p>
          <ul className="ml-4 list-disc space-y-1">
            <li>
              <strong>Link Affiliate</strong> — paste URL asli dari Shopee Affiliate Center
              (biasanya diawali <Code>https://s.shopee.co.id/...</Code>).
            </li>
            <li>
              <strong>Nama Produk</strong> — nama yang muncul di dashboard dan laporan.
            </li>
            <li>
              <strong>Custom Link</strong> (opsional) — bagian setelah domain, misal{" "}
              <Code>sepatu-nike</Code> akan jadi <Code>yoursite.com/sepatu-nike</Code>.
              Jika dikosongkan, akan di-generate otomatis dari nama produk.
            </li>
          </ul>
          <p>
            Klik <strong>Buat Link Trackable</strong> — link langsung tersimpan dan muncul
            di bagian &ldquo;atau pilih yang tersimpan&rdquo; di bawahnya.
          </p>
          <Note>
            Link yang sudah dibuat sebelumnya bisa dipilih langsung dari dropdown
            tanpa perlu mengisi form lagi.
          </Note>
        </Step>

        {/* ─── STEP 3 ─── */}
        <Step n={3} title="Tambah UTM Parameters (Opsional)">
          <p>
            Setelah memilih produk dari dropdown, buka section{" "}
            <strong>Tambah UTM Parameters</strong> untuk melampirkan informasi sumber
            traffic ke link:
          </p>
          <ul className="ml-4 list-disc space-y-1">
            <li><Code>utm_source</Code> — platform iklan (facebook, instagram, tiktok, dll)</li>
            <li><Code>utm_medium</Code> — tipe iklan (cpc, paid, social)</li>
            <li><Code>utm_campaign</Code> — nama kampanye spesifik</li>
            <li><Code>utm_content</Code> — versi iklan / creative</li>
            <li><Code>utm_term</Code> — kata kunci (untuk Google Ads)</li>
          </ul>
          <p>
            Klik <strong>Copy Link</strong> — link lengkap beserta UTM siap dipakai.
          </p>
          <Note>
            Aktifkan toggle <strong>Enable Click ID (fbclid)</strong> hanya jika kamu
            memasang link ini sebagai destination URL di Meta Ads Manager. Jangan aktifkan
            jika link akan dibuka langsung dari bio atau chat.
          </Note>
        </Step>

        {/* ─── STEP 4 ─── */}
        <Step n={4} title="Pasang Link di Iklan atau Bio">
          <p>
            Salin link hasil Redirect Builder dan tempel di:
          </p>
          <ul className="ml-4 list-disc space-y-1">
            <li>
              <strong>Meta Ads Manager</strong> — kolom &ldquo;Website URL&rdquo; saat buat iklan.
              Aktifkan fbclid jika ingin attribution Meta.
            </li>
            <li>
              <strong>Bio Instagram / TikTok</strong> — langsung tempel link pendek tanpa fbclid.
            </li>
            <li>
              <strong>Konten organik</strong> — caption, story, atau chat.
            </li>
          </ul>
          <p>
            Setiap klik pada link ini akan dicatat otomatis oleh dashboard beserta
            UTM source, device, dan waktu klik.
          </p>
        </Step>

        {/* ─── STEP 5 ─── */}
        <Step n={5} title="Pantau Klik Masuk">
          <p>
            Buka <strong>Klik</strong> di sidebar untuk melihat semua klik yang masuk.
          </p>
          <p>Setiap baris menampilkan:</p>
          <ul className="ml-4 list-disc space-y-1">
            <li>Produk yang diklik</li>
            <li>Sumber traffic (utm_source, utm_campaign, dll)</li>
            <li>Device (mobile / desktop)</li>
            <li>Status duplikat dan bot (untuk filtering klik tidak valid)</li>
            <li>Landing page asal (jika klik dari halaman rekomendasi)</li>
          </ul>
          <p>
            Halaman <strong>Redirect Builder</strong> juga menampilkan statistik ringkas:
            total klik semua waktu, klik 7 hari terakhir, dan grafik sparkline 14 hari.
          </p>
          <Warn>
            Klik duplikat = klik kedua dari IP yang sama dalam waktu singkat.
            Klik bot = terdeteksi dari user-agent bot. Keduanya tetap dicatat
            tapi ditandai agar bisa difilter.
          </Warn>
        </Step>

        {/* ─── STEP 6 ─── */}
        <Step n={6} title="Hubungkan Meta Ads API (Sinkronisasi Otomatis)">
          <p>
            Dashboard bisa menarik data biaya iklan langsung dari Meta Ads API
            tanpa input manual. Caranya:
          </p>
          <ol className="ml-4 list-decimal space-y-1">
            <li>
              Buka <strong>Akun Meta</strong> di sidebar → klik{" "}
              <strong>+ Tambah Akun</strong>.
            </li>
            <li>
              Isi <strong>Nama</strong> (label internal), <strong>Ad Account ID</strong>{" "}
              (format <Code>act_XXXXXXXXXX</Code> dari Meta Ads Manager), dan{" "}
              <strong>Access Token</strong> dengan permission <Code>ads_read</Code>.
            </li>
            <li>
              Buka halaman <strong>Biaya Iklan</strong> → klik tombol{" "}
              <strong>Sync Meta Ads</strong> untuk menarik data dari semua akun aktif.
            </li>
          </ol>
          <Note>
            Kamu bisa menambahkan lebih dari satu akun Meta (untuk campaign dari
            beberapa akun bisnis yang berbeda). Setiap sync akan memperbarui data
            berdasarkan rentang tanggal yang kamu pilih.
          </Note>
          <p>
            Jika tidak ingin menggunakan API, data biaya iklan tetap bisa diinput
            manual di halaman <strong>Biaya Iklan</strong> via upload CSV/XLSX.
          </p>
        </Step>

        {/* ─── STEP 7 ─── */}
        <Step n={7} title="Input Komisi Shopee">
          <p>
            Buka <strong>Komisi</strong> di sidebar untuk mencatat pendapatan komisi
            dari Shopee Affiliate.
          </p>
          <p>
            Data komisi (pesanan, klik Shopee, dan nominal komisi per hari) dipakai
            dashboard untuk menghitung:
          </p>
          <ul className="ml-4 list-disc space-y-1">
            <li><strong>Net Profit</strong> — total komisi dikurangi total spend iklan</li>
            <li><strong>Conversion Rate</strong> — pesanan ÷ klik dari data Shopee</li>
            <li><strong>ROAS</strong> — return on ad spend</li>
          </ul>
          <Note>
            Data komisi diisi manual dari laporan Shopee Affiliate Center.
            Export laporan harian dari Shopee, lalu upload ke halaman Komisi.
          </Note>
        </Step>

        {/* ─── STEP 8 ─── */}
        <Step n={8} title="Buat Landing Page Rekomendasi (Opsional)">
          <p>
            Landing page adalah halaman publik di{" "}
            <Code>yoursite.com/rekomendasi/[nama]</Code> yang menampilkan
            beberapa produk sekaligus — cocok untuk konten &ldquo;Top 5 Produk&rdquo; atau
            review multi-produk.
          </p>
          <p>
            Buka <strong>Landing Page</strong> → <strong>+ New landing page</strong>.
          </p>
          <ul className="ml-4 list-disc space-y-1">
            <li>Isi judul, intro, dan pilih produk yang ingin ditampilkan</li>
            <li>Setiap produk bisa punya judul, deskripsi, dan teks tombol yang berbeda</li>
            <li>Isi <strong>Disclosure text</strong> jika dibutuhkan</li>
            <li>Set status ke <strong>published</strong> agar halaman bisa diakses publik</li>
          </ul>
          <p>
            Kunjungan ke landing page tercatat di kolom <strong>Kunjungan</strong> pada
            halaman Landing Page, dan klik dari halaman tersebut ditandai di halaman Klik.
          </p>
        </Step>

        {/* ─── STEP 9 ─── */}
        <Step n={9} title="Lihat Laporan & Filter Date Range">
          <p>
            Halaman <strong>Overview</strong> (dashboard utama) menampilkan ringkasan
            performa iklan dengan filter tanggal yang bisa disesuaikan:
          </p>
          <ul className="ml-4 list-disc space-y-1">
            <li><strong>Spend</strong> — total biaya iklan periode yang dipilih</li>
            <li><strong>Clicks</strong> — klik dari Meta Ads (link_clicks)</li>
            <li><strong>CPC</strong> — cost per click</li>
            <li><strong>Net Profit</strong> — total komisi semua waktu dikurangi total spend</li>
            <li><strong>Conversion Rate</strong> — pesanan ÷ klik Shopee</li>
          </ul>
          <p>
            Klik tombol tanggal di filter bar untuk memilih preset (7D, 14D, 30D,
            bulan ini, bulan lalu) atau masukkan rentang custom. Periode pembanding
            otomatis dihitung sesuai durasi yang dipilih.
          </p>
          <p>
            Gunakan kolom <strong>Search</strong> di filter bar untuk mencari ad set
            tertentu di tabel, dan tombol <strong>Export</strong> untuk download CSV.
          </p>
        </Step>

        {/* ─── STEP 10 ─── */}
        <Step n={10} title="Integrasi API (Opsional)">
          <p>
            Jika kamu ingin mengakses data dari luar dashboard (misal: Google Sheets,
            tools otomasi, atau app sendiri), buka <strong>API Keys</strong> dan buat
            API key baru.
          </p>
          <p>
            Gunakan API key tersebut di header{" "}
            <Code>x-api-key: [key]</Code> saat memanggil endpoint API dashboard.
          </p>
          <p>
            Dokumentasi lengkap endpoint tersedia di{" "}
            <a href="/admin/api-docs" className="text-brand-300 hover:underline">
              /admin/api-docs
            </a>
            {" "}(dapat diakses tanpa login).
          </p>
          <Note>
            Simpan API key di tempat aman. Key hanya ditampilkan sekali saat dibuat.
          </Note>
        </Step>

      </div>
    </PageShell>
  );
}
