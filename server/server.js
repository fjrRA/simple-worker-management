// server/server.js
const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");
const path = require("path");

require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "..", "public")));

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  namedPlaceholders: true,
});

// -------------------- VIEW (gabungan pegawai + divisi) --------------------
app.get("/view", async (_req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM view_divisi_pegawai");
    res.json({ success: true, total: rows.length, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==================== PEGAWAI CRUD ====================

// Search pegawai: /pegawai/search?nama=Put
app.get("/pegawai/search", async (req, res) => {
  const q = (req.query.nama || "").toString().trim();
  if (!q) return res.status(400).json({ success: false, error: "param ?nama wajib" });
  try {
    const [rows] = await pool.query(
      "SELECT * FROM pegawai WHERE nama LIKE :name",
      { name: `%${q}%` }
    );
    res.json({ success: true, total: rows.length, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Tambah pegawai (id_peg diasumsikan AUTO_INCREMENT)
app.post("/pegawai", async (req, res) => {
  const { nama, email, id_div } = req.body || {};
  if (!nama || !email || !id_div)
    return res.status(400).json({ success: false, error: "nama, email, id_div wajib" });

  try {
    const [ok] = await pool.query(
      "INSERT INTO pegawai (nama, email, id_div) VALUES (:nama, :email, :id_div)",
      { nama, email, id_div }
    );
    res.status(201).json({ success: true, inserted_id: ok.insertId });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Ubah pegawai
app.put("/pegawai/:id(\\d+)", async (req, res) => {
  const id = req.params.id;
  const { nama, email, id_div } = req.body || {};
  if (!nama && !email && !id_div)
    return res.status(400).json({ success: false, error: "tidak ada field yang diubah" });

  const fields = [];
  const params = { id };
  if (nama) { fields.push("nama = :nama"); params.nama = nama; }
  if (email) { fields.push("email = :email"); params.email = email; }
  if (id_div) { fields.push("id_div = :id_div"); params.id_div = id_div; }

  try {
    const sql = `UPDATE pegawai SET ${fields.join(", ")} WHERE id_peg = :id`;
    const [ok] = await pool.query(sql, params);
    res.json({ success: true, affected: ok.affectedRows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Hapus pegawai
app.delete("/pegawai/:id(\\d+)", async (req, res) => {
  try {
    const [ok] = await pool.query("DELETE FROM pegawai WHERE id_peg = :id", { id: req.params.id });
    res.json({ success: true, affected: ok.affectedRows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// (opsional) alternative delete via POST
app.post("/pegawai/:id(\\d+)/delete", async (req, res) => {
  try {
    const [ok] = await pool.query("DELETE FROM pegawai WHERE id_peg = :id", { id: req.params.id });
    res.json({ success: true, affected: ok.affectedRows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==================== DIVISI CRUD ====================

// Get semua divisi
app.get("/divisi", async (_req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM divisi ORDER BY id_div");
    res.json({ success: true, total: rows.length, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Penting: definisikan /divisi/search SEBELUM /divisi/:id
app.get("/divisi/search", async (req, res) => {
  const q = (req.query.nama || "").toString().trim();
  if (!q) return res.status(400).json({ success: false, error: "param ?nama wajib" });
  try {
    const [rows] = await pool.query(
      "SELECT * FROM divisi WHERE nama_div LIKE :q ORDER BY id_div",
      { q: `%${q}%` }
    );
    res.json({ success: true, total: rows.length, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get divisi by id (hanya angka)
app.get("/divisi/:id(\\d+)", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM divisi WHERE id_div = :id", { id: req.params.id });
    if (!rows.length) return res.status(404).json({ success: false, error: "Divisi tidak ditemukan" });
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Tambah divisi (id_div bisa AUTO_INCREMENT; contoh ini tanpa id_div)
app.post("/divisi", async (req, res) => {
  const { nama_div, anggaran } = req.body || {};
  if (!nama_div || anggaran == null)
    return res.status(400).json({ success: false, error: "nama_div dan anggaran wajib" });

  try {
    const [ok] = await pool.query(
      "INSERT INTO divisi (nama_div, anggaran) VALUES (:nama_div, :anggaran)",
      { nama_div, anggaran }
    );
    res.status(201).json({ success: true, inserted_id: ok.insertId });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Ubah divisi
app.put("/divisi/:id(\\d+)", async (req, res) => {
  const { nama_div, anggaran } = req.body || {};
  if (nama_div == null && anggaran == null)
    return res.status(400).json({ success: false, error: "tidak ada field yang diubah" });

  const fields = [];
  const params = { id: req.params.id };
  if (nama_div != null) { fields.push("nama_div = :nama_div"); params.nama_div = nama_div; }
  if (anggaran != null) { fields.push("anggaran = :anggaran"); params.anggaran = anggaran; }

  try {
    const [ok] = await pool.query(`UPDATE divisi SET ${fields.join(", ")} WHERE id_div = :id`, params);
    res.json({ success: true, affected: ok.affectedRows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Hapus divisi
app.delete("/divisi/:id(\\d+)", async (req, res) => {
  try {
    const [ok] = await pool.query("DELETE FROM divisi WHERE id_div = :id", { id: req.params.id });
    res.json({ success: true, affected: ok.affectedRows });
  } catch (err) {
    if (err.code === "ER_ROW_IS_REFERENCED_2" || err.errno === 1451) {
      return res.status(409).json({ success: false, error: "Tidak bisa hapus: masih dipakai di tabel pegawai." });
    }
    res.status(500).json({ success: false, error: err.message });
  }
});

// -------------------- START --------------------
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`API running on http://localhost:${port}`));
