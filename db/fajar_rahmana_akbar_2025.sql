-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Sep 29, 2025 at 05:38 AM
-- Server version: 8.4.3
-- PHP Version: 8.3.16

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `fajar_rahmana_akbar_2025`
--

-- --------------------------------------------------------

--
-- Table structure for table `divisi`
--

CREATE TABLE `divisi` (
  `id_div` int NOT NULL,
  `nama_div` varchar(100) NOT NULL,
  `anggaran` decimal(12,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `divisi`
--

INSERT INTO `divisi` (`id_div`, `nama_div`, `anggaran`) VALUES
(1, 'IT', 1000000.00),
(2, 'HR', 500000.00),
(3, 'Finance', 1450000.00),
(4, 'Marketing', 650000.00),
(5, 'Sales', 900000.00),
(7, 'Security', 1000000.00);

-- --------------------------------------------------------

--
-- Table structure for table `pegawai`
--

CREATE TABLE `pegawai` (
  `id_peg` int NOT NULL,
  `nama` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `id_div` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `pegawai`
--

INSERT INTO `pegawai` (`id_peg`, `nama`, `email`, `id_div`) VALUES
(1, 'Arlina Harun', 'arlina.harun@example.com', 1),
(2, 'Angga Putra', 'angga.putra@example.com', 2),
(3, 'Ranum Sari', 'ranum.sari@corp_example.com', 3),
(4, 'Rianti Hasna', 'rianti.hasna@example.com', 1),
(5, 'Putri Renita', 'putri.renita@example.com', 4),
(6, 'Dian Sastro', 'dian.sastro@example.com', 5),
(7, 'Erlina Dewi', 'erlina.dewi@example.com', 2),
(8, 'Rian Darma', 'rian.darma@example.com', 3),
(9, 'Panji Kelana', 'panji.kelana@example.com', 4),
(11, 'Budi Santoso', 'budi.santoso@example.com', 1);

-- --------------------------------------------------------

--
-- Stand-in structure for view `view_divisi_pegawai`
-- (See below for the actual view)
--
CREATE TABLE `view_divisi_pegawai` (
`anggaran` decimal(12,2)
,`email` varchar(100)
,`id_div` int
,`id_peg` int
,`nama_div` varchar(100)
,`nama_pegawai` varchar(100)
);

-- --------------------------------------------------------

--
-- Structure for view `view_divisi_pegawai`
--
DROP TABLE IF EXISTS `view_divisi_pegawai`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `view_divisi_pegawai`  AS SELECT `p`.`id_peg` AS `id_peg`, `p`.`nama` AS `nama_pegawai`, `p`.`email` AS `email`, `d`.`id_div` AS `id_div`, `d`.`nama_div` AS `nama_div`, `d`.`anggaran` AS `anggaran` FROM (`pegawai` `p` join `divisi` `d` on((`p`.`id_div` = `d`.`id_div`))) ;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `divisi`
--
ALTER TABLE `divisi`
  ADD PRIMARY KEY (`id_div`);

--
-- Indexes for table `pegawai`
--
ALTER TABLE `pegawai`
  ADD PRIMARY KEY (`id_peg`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `divisi`
--
ALTER TABLE `divisi`
  MODIFY `id_div` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `pegawai`
--
ALTER TABLE `pegawai`
  MODIFY `id_peg` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
