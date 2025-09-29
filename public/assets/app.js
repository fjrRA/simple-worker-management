const $ = (id) => document.getElementById(id);
const api = (p, init) => fetch(p, init).then(r => r.json());
const toast = (ok, msg) => {
  const el = $('status'); el.hidden = false;
  el.className = 'status ' + (ok ? 'ok' : 'err'); el.textContent = msg;
  setTimeout(() => el.hidden = true, 2000);
};

let rows = [];                // cache data pegawai (dari /view)
const render = (list) => {
  const tb = $('tbl').querySelector('tbody');
  tb.innerHTML = list.map(r => `
    <tr>
      <td>${r.id_peg}</td>
      <td>${r.nama_pegawai ?? r.nama}</td>
      <td>${r.email}</td>
      <td>${r.id_div}</td>
      <td class="action">
        <a class="inline" data-act="edit" data-id="${r.id_peg}">edit</a>
        <a class="inline" data-act="del" data-id="${r.id_peg}">hapus</a>
      </td>
    </tr>
  `).join('');
};

/* Load awal dari VIEW (menampilkan nama divisi & anggaran juga bisa, tinggal tambah kolom) */
async function loadAll() {
  const res = await api('/view');
  if (!res.success) { toast(false, res.error || 'Gagal memuat'); return; }
  rows = res.data;
  render(rows);
  toast(true, `OK: ${res.total} baris`);
}

/* Search by nama (menggunakan endpoint /pegawai/search) */
async function doSearch() {
  const q = $('q').value.trim();
  if (!q) { render(rows); return; }
  const res = await api(`/pegawai/search?nama=${encodeURIComponent(q)}`);
  if (!res.success) { toast(false, res.error || 'Gagal cari'); return; }
  render(res.data);
  toast(true, `OK: ${res.total} baris cocok`);
}

/* Modal helpers */
function openAdd() {
  $('dlgTitle').textContent = 'Tambah Pegawai';
  $('f_id').value = '';
  $('f_nama').value = '';
  $('f_email').value = '';
  $('f_div').value = '';
  $('dlg').showModal();
}
function openEdit(id) {
  const r = rows.find(x => x.id_peg === Number(id));
  if (!r) return;
  $('dlgTitle').textContent = `Edit Pegawai #${id}`;
  $('f_id').value = id;
  $('f_nama').value = r.nama_pegawai ?? r.nama;
  $('f_email').value = r.email;
  $('f_div').value = r.id_div;
  $('dlg').showModal();
}

/* Simpan (Tambah/Update) */
async function saveForm(evt) {
  evt.preventDefault();
  const id = $('f_id').value.trim();
  const payload = {
    nama: $('f_nama').value.trim(),
    email: $('f_email').value.trim(),
    id_div: Number($('f_div').value)
  };
  try {
    if (id) {
      const res = await api(`/pegawai/${id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.success) throw new Error(res.error || 'Gagal update');
      toast(true, 'Berhasil diubah');
    } else {
      const res = await api('/pegawai', {
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

/* Hapus */
async function removeById(id) {
  if (!confirm(`Hapus pegawai #${id}?`)) return;
  const res = await api(`/pegawai/${id}`, { method: 'DELETE' });
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
