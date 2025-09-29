const $ = (id) => document.getElementById(id);
const api = (p, init) => fetch(p, init).then(r => r.json());
const toast = (ok, msg) => {
  const el = $('status'); el.hidden = false;
  el.className = 'status ' + (ok ? 'ok' : 'err'); el.textContent = msg;
  setTimeout(() => el.hidden = true, 2000);
};

let rows = []; // cache data divisi
const fmtMoney = n =>
  Number(n).toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const render = (list) => {
  const tb = $('tbl').querySelector('tbody');
  tb.innerHTML = list.map(r => `
    <tr>
      <td>${r.id_div}</td>
      <td>${r.nama_div}</td>
      <td>${fmtMoney(r.anggaran)}</td>
      <td class="action">
        <a class="inline" data-act="edit" data-id="${r.id_div}">edit</a>
        <a class="inline" data-act="del"  data-id="${r.id_div}">hapus</a>
      </td>
    </tr>
  `).join('');
};

/* 1) GET semua divisi */
async function loadAll() {
  const res = await api('/divisi');
  if (!res.success) { toast(false, res.error || 'Gagal memuat'); return; }
  rows = res.data;
  render(rows);
  toast(true, `OK: ${res.total} baris`);
}

/* 2) GET /divisi/search?nama=... */
async function doSearch() {
  const q = $('q').value.trim();
  if (!q) { render(rows); return; }
  const res = await api(`/divisi/search?nama_div=${encodeURIComponent(q)}`);
  if (!res.success) { toast(false, res.error || 'Gagal cari'); return; }
  render(res.data);
  toast(true, res.total ? `OK: ${res.total} baris cocok` : 'Divisi tidak ditemukan');
}

/* 3) Modal helpers */
function openAdd() {
  $('dlgTitle').textContent = 'Tambah Divisi';
  $('f_id').value = '';
  $('f_nama').value = '';
  $('f_ang').value = '';
  $('dlg').showModal();
}
function openEdit(id) {
  const r = rows.find(x => x.id_div === Number(id));
  if (!r) return;
  $('dlgTitle').textContent = `Edit Divisi #${id}`;
  $('f_id').value = id;
  $('f_nama').value = r.nama_div;
  $('f_ang').value = r.anggaran;
  $('dlg').showModal();
}

/* 4) Simpan (POST/PUT) */
async function saveForm(evt) {
  evt.preventDefault();
  const id = $('f_id').value.trim();
  const payload = {
    nama_div: $('f_nama').value.trim(),
    anggaran: Number($('f_ang').value)
  };
  try {
    if (id) {
      const res = await api(`/divisi/${id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.success) throw new Error(res.error || 'Gagal update');
      toast(true, 'Berhasil diubah');
    } else {
      const res = await api('/divisi', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.success) throw new Error(res.error || 'Gagal tambah');
      toast(true, 'Berhasil ditambah');
    }
    $('dlg').close();
    await loadAll();
  } catch (e) { toast(false, e.message); }
}

/* 5) Hapus */
async function removeById(id) {
  if (!confirm(`Hapus divisi #${id}? (akan gagal jika masih dipakai pegawai)`)) return;
  const res = await api(`/divisi/${id}`, { method: 'DELETE' });
  if (!res.success) { toast(false, res.error || 'Gagal hapus'); return; }
  toast(true, 'Berhasil dihapus');
  await loadAll();
}

/* Events */
$('btnAdd').onclick = openAdd;
$('btnSearch').onclick = doSearch;
$('btnClear').onclick = () => { $('q').value = ''; render(rows); };
$('frm').addEventListener('submit', saveForm);
$('tbl').addEventListener('click', (e) => {
  const a = e.target.closest('a.inline'); if (!a) return;
  const id = a.dataset.id;
  if (a.dataset.act === 'edit') openEdit(id);
  if (a.dataset.act === 'del') removeById(id);
});

/* start */
loadAll();
