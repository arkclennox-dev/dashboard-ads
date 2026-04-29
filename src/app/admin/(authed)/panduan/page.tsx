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
    <div className="rounded-lg border border-warning/30 bg-warning/5 px-3 py-2 text-xs text-ink-2">
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
        <Step n={2} title="Tambah Produk Afiliasi">
          <p>
            Buka <strong>Produk</strong> → klik <strong>+ New product</strong> atau gunakan
            tombol <strong>Produk baru</strong> di Redirect Builder.
          </p>
          <p>Isi form berikut:</p>
          <ul className="ml-4 list-disc space-y-1">
            <li>
              <strong>Link Shopee Affiliate</strong> — URL asli dari Shopee Affiliate Center
              (diawali <Code>https://s.shopee.co.id/...</Code> atau link panjang Shopee).
              URL inilah tujuan akhir user setelah klik iklan.
            </li>
            <li>
              <strong>Nama Produk</strong> — nama yang muncul di dashboard, bukan di publik.
            </li>
            <li>
              <strong>Custom Link</strong> (opsional) — bagian setelah domain, misal{" "}
              <Code>sepatu-nike</Code> akan jadi <Code>yoursite.com/sepatu-nike</Code>.
              Jika dikosongkan, akan digenerate otomatis (misal <Code>x3k9ab</Code>).
            </li>
          </ul>
          <Note>
            Setiap produk punya <strong>short code</strong> unik. Inilah yang dipakai
            sebagai link redirect — bukan URL panjang Shopee.
          </Note>
        </Step>

        {/* ─── STEP 3 ─── */}
        <Step n={3} title="Buat Link Tracking di Redirect Builder">
          <p>
            Buka <strong>Redirect Builder</strong>. Jika produk sudah ada, pilih dari
            dropdown — link tracking langsung muncul.
          </p>
          <p>Link yang dihasilkan formatnya:</p>
          <div className="rounded-lg border border-border bg-surface px-3 py-2 font-mono text-xs text-ink-2 break-all">
            https://yoursite.com/<span className="text-brand-300">[short-code]</span>
          </div>
          <p className="mt-2">
            Kamu bisa tambah <strong>UTM Parameters</strong> dengan membuka section
            &ldquo;Tambah UTM Parameters&rdquo;:
          </p>
          <ul className="ml-4 list-disc space-y-1">
            <li><Code>utm_source</Code> — platform iklan (facebook, tiktok, dll)</li>
            <li><Code>utm_medium</Code> — tipe iklan (cpc, paid, social)</li>
            <li><Code>utm_campaign</Code> — nama kampanye spesifik</li>
            <li><Code>utm_content</Code> — versi iklan / creative</li>
            <li><Code>utm_term</Code> — kata kunci (untuk Google Ads)</li>
          </ul>
          <p>
            Klik <strong>Copy Link</strong> — link siap dipakai.
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
            Buka <strong>Klik</strong> di sidebar untuk melihat semua klik yang masuk secara
            real-time.
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
            Gunakan tombol <strong>Export CSV</strong> untuk mengunduh data klik
            dan menganalisis di spreadsheet.
          </p>
          <Warn>
            Klik duplikat = klik kedua dari IP yang sama dalam waktu singkat.
            Klik bot = terdeteksi dari user-agent bot. Keduanya tetap dicatat
            tapi ditandai agar kamu bisa filter.
          </Warn>
        </Step>

        {/* ─── STEP 6 ─── */}
        <Step n={6} title="Buat Landing Page Rekomendasi (Opsional)">
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
            <li>Isi <strong>Disclosure text</strong> jika dibutuhkan (misal: &ldquo;Konten ini mengandung link afiliasi&rdquo;)</li>
            <li>Set status ke <strong>published</strong> agar halaman bisa diakses publik</li>
          </ul>
          <p>
            Klik dari landing page akan tercatat dengan tag <Code>lp=[slug]</Code> di
            kolom Landing Page di halaman Klik.
          </p>
        </Step>

        {/* ─── STEP 7 ─── */}
        <Step n={7} title="Catat Biaya Iklan untuk Hitung ROAS">
          <p>
            Buka <strong>Biaya Iklan</strong> dan input pengeluaran iklan kamu secara manual
            dari Meta Ads Manager.
          </p>
          <p>Isi per baris:</p>
          <ul className="ml-4 list-disc space-y-1">
            <li><strong>Tanggal</strong> laporan</li>
            <li><strong>Nama Campaign / Ad Set / Ad</strong> sesuai di Meta</li>
            <li><strong>Spend</strong> — total biaya dalam rupiah</li>
            <li><strong>Impressions, Link Clicks, LPV</strong> — dari kolom di Meta Ads Manager</li>
          </ul>
          <Note>
            Data ini tidak otomatis tarik dari Meta API. Input manual diperlukan
            agar laporan di dashboard akurat.
          </Note>
        </Step>

        {/* ─── STEP 8 ─── */}
        <Step n={8} title="Lihat Laporan Performa">
          <p>
            Buka <strong>Laporan</strong> untuk melihat ringkasan gabungan antara
            data klik redirect dan biaya iklan:
          </p>
          <ul className="ml-4 list-disc space-y-1">
            <li><strong>Total Spend</strong> — total biaya iklan yang sudah dicatat</li>
            <li><strong>Redirect clicks</strong> — klik masuk ke link tracking kamu</li>
            <li><strong>Non-duplicate clicks</strong> — klik unik (bukan pengulangan dari IP sama)</li>
            <li><strong>Meta link clicks</strong> — klik yang dilaporkan Meta (dari data manual)</li>
            <li><strong>Cost per redirect click</strong> — biaya per klik ke link kamu</li>
            <li><strong>Click gap</strong> — selisih antara klik Meta vs klik yang benar-benar masuk ke server kamu. Angka positif berarti ada klik yang &ldquo;hilang&rdquo; di tengah jalan.</li>
          </ul>
          <p>
            Bandingkan <strong>Click gap</strong> secara rutin — jika selisihnya besar,
            bisa jadi ada masalah di redirect atau link yang tidak sesuai.
          </p>
        </Step>

        {/* ─── STEP 9 ─── */}
        <Step n={9} title="Integrasi API (Opsional)">
          <p>
            Jika kamu ingin mengakses data dari luar dashboard (misal: Google Sheets,
            tools otomasi, atau app sendiri), buka <strong>API Keys</strong> dan buat
            API key baru.
          </p>
          <p>
            Gunakan API key tersebut di header <Code>Authorization: Bearer [key]</Code>
            saat memanggil endpoint API dashboard.
          </p>
          <Note>
            Simpan API key di tempat aman. Key hanya ditampilkan sekali saat dibuat.
          </Note>
        </Step>

      </div>
    </PageShell>
  );
}
