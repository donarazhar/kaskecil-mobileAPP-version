<!DOCTYPE html>
<html lang="id">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Laporan Kas Kecil - {{ date('d-m-Y', strtotime($periodeawal)) }} s.d
        {{ date('d-m-Y', strtotime($periodeakhir)) }}
    </title>

    <style>
        body {
            font-family: 'Times New Roman', Times, serif;
            color: #000;
            margin: 20px;
            background: #f9fafb;
        }

        .container {
            max-width: 1200px;
            margin: auto;
            background: #fff;
            padding: 20px 30px;
            box-shadow: 0 3px 8px rgba(0, 0, 0, 0.15);
            border-radius: 8px;
        }

        /* HEADER */
        .report-header {
            text-align: center;
            margin-bottom: 20px;
        }

        .report-title {
            font-size: 18px;
            font-weight: bold;
        }

        .report-subtitle {
            font-size: 15px;
            font-weight: bold;
        }

        .report-period {
            font-size: 13px;
            margin-top: 5px;
        }

        /* TABEL */
        table {
            width: 100%;
            border-collapse: collapse;
            font-size: 11px;
            margin-top: 10px;
            page-break-inside: auto;
        }

        thead th {
            background: #f1f5f9;
            border: 1px solid #000;
            padding: 8px 6px;
            text-align: center;
            font-weight: bold;
        }

        tbody td {
            border: 1px solid #000;
            padding: 6px 5px;
            vertical-align: top;
        }

        tbody tr:nth-child(even) {
            background: #fafafa;
        }

        tbody tr.subtotal-row {
            background: #f9f9f9;
            font-weight: bold;
        }

        .text-center {
            text-align: center;
        }

        .text-right {
            text-align: right;
        }

        .text-left {
            text-align: left;
        }

        /* TOTAL KESELURUHAN */
        .total-section {
            margin-top: 20px;
            border-top: 2px solid #000;
            padding-top: 10px;
            font-size: 13px;
            font-weight: bold;
            text-align: right;
            page-break-inside: avoid;
            page-break-after: avoid;
        }

        /* TANDA TANGAN */
        .signature-section {
            margin-top: 40px;
            display: flex;
            justify-content: space-between;
            font-size: 12px;
            page-break-inside: avoid;
        }

        .signature-box {
            width: 45%;
        }

        .signature-box p {
            margin: 3px 0;
        }

        .signature-name {
            margin-top: 20px;
            font-weight: bold;
            text-decoration: underline;
        }

        /* TOMBOL CETAK */
        .print-button {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 10px 20px;
            background: linear-gradient(135deg, #0053C5, #003d91);
            color: white;
            border: none;
            border-radius: 6px;
            font-size: 13px;
            font-weight: bold;
            cursor: pointer;
            box-shadow: 0 3px 8px rgba(0, 0, 0, 0.2);
            transition: all 0.3s ease;
            z-index: 1000;
        }

        .print-button:hover {
            background: linear-gradient(135deg, #003d91, #002b6b);
            transform: translateY(-2px);
        }

        /* CETAK */
        @media print {
            body {
                background: #fff;
                margin: 0;
                padding: 0;
            }

            .print-button {
                display: none;
            }

            .container {
                box-shadow: none;
                border-radius: 0;
                padding: 0;
            }
        }
    </style>
</head>

<body>

    <button class="print-button" onclick="window.print()">🖨️ Cetak Laporan</button>

    <div class="container">
        <!-- HEADER -->
        <div class="report-header">
            <div class="report-title">{{ $instansi->nama_instansi ?? 'Yayasan Pesantren Islam Al Azhar' }}</div>
            <div class="report-subtitle">{{ $instansi->alamat ?? 'Masjid Agung Al Azhar' }}</div>
            @if ($namaCabang)
                <div class="report-subtitle" style="font-weight: normal; margin-top: 5px;">{{ $namaCabang }}</div>
            @endif
            @if ($namaUnit)
                <div class="report-subtitle" style="font-weight: normal;">{{ $namaUnit }}</div>
            @endif
            <div class="report-period">
                Kas Kecil Periode {{ date('d-m-Y', strtotime($periodeawal)) }} s.d
                {{ date('d-m-Y', strtotime($periodeakhir)) }}
            </div>
        </div>

        <!-- TABEL DATA -->
        <table>
            <thead>
                <tr>
                    <th style="width:3%;">No.</th>
                    <th style="width:8%;">No. Akun AAS</th>
                    <th style="width:8%;">Mata Anggaran</th>
                    <th colspan="2" style="width:51%;">URAIAN</th>
                    <th colspan="2" style="width:15%;">Besaran (Rp)</th>
                </tr>
            </thead>
            <tbody>
                @php
                    $totals = [];
                    $currentKodeMatanggaran = null;
                    $currentKodeAAS = null;
                    $currentTotal = 0;
                @endphp

                @forelse ($pengeluaranbulanini as $d)
                    @if ($currentKodeMatanggaran !== $d->kode_matanggaran || $currentKodeAAS !== $d->kode_aas)
                        @if ($currentKodeMatanggaran !== null)
                            <tr class="subtotal-row">
                                <td colspan="5" class="text-right"><strong>Jumlah</strong></td>
                                <td></td>
                                <td class="text-right"><strong>{{ number_format($currentTotal, 0, ',', '.') }}</strong></td>
                            </tr>
                            @php
                                $totals["$currentKodeMatanggaran-$currentKodeAAS"] = $currentTotal;
                                $currentTotal = 0;
                            @endphp
                        @endif
                        @php
                            $currentKodeMatanggaran = $d->kode_matanggaran;
                            $currentKodeAAS = $d->kode_aas;
                        @endphp
                    @endif

                    @php $currentTotal += $d->jumlah; @endphp

                    <tr>
                        <td class="text-center">{{ $loop->iteration }}</td>
                        <td class="text-center">{{ $d->kode_aas }}</td>
                        <td class="text-center">{{ $d->kode_matanggaran }}</td>
                        <td class="text-left">{{ $d->nama_aas }}</td>
                        <td class="text-left">{{ $d->perincian }}</td>
                        <td class="text-right">{{ number_format($d->jumlah, 0, ',', '.') }}</td>
                        <td></td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="7" class="text-center" style="padding:40px;">Tidak ada data untuk periode ini</td>
                    </tr>
                @endforelse

                @if ($currentKodeMatanggaran !== null)
                    <tr class="subtotal-row">
                        <td colspan="5" class="text-right"><strong>Jumlah</strong></td>
                        <td></td>
                        <td class="text-right"><strong>{{ number_format($currentTotal, 0, ',', '.') }}</strong></td>
                    </tr>
                @endif
            </tbody>
        </table>

        <!-- TOTAL KESELURUHAN -->
        <div class="total-section">
            TOTAL KESELURUHAN: Rp {{ number_format($totalpengeluaran, 0, ',', '.') }}
        </div>

        <!-- TANDA TANGAN -->
        <div class="signature-section">
            <div class="signature-box">
                <p>Mengetahui,</p>
                <p>{{ $jabatanKepala }}</p>
                <br><br><br>
                <p class="signature-name">{{ $kepalaUnit }}</p>
            </div>
            <div class="signature-box" style="text-align:right;">
                <p>Jakarta, {{ date('d-m-Y') }}</p>
                <p>Dibuat oleh,</p>
                <p>Tata Usaha</p>
                <br><br>
                <p class="signature-name">{{ $staffUnit }}</p>
            </div>
        </div>
    </div>
</body>

</html>