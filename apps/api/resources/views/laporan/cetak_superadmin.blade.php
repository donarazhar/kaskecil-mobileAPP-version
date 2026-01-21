<!DOCTYPE html>
<html lang="id">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Laporan Visual Kas Kecil - {{ date('d-m-Y', strtotime($periodeawal)) }} s.d
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

        .text-center {
            text-align: center;
        }

        .text-right {
            text-align: right;
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
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        .chart-container {
            width: 100%;
            height: 300px;
            margin-bottom: 30px;
            page-break-inside: avoid;
        }

        .charts-row {
            display: flex;
            flex-wrap: wrap;
            gap: 20px;
            margin-bottom: 20px;
        }

        .chart-wrapper {
            flex: 1;
            min-width: 300px;
            border: 1px solid #ddd;
            padding: 10px;
            border-radius: 8px;
            background: #fff;
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
                Laporan Visual Kas Kecil Periode {{ date('d-m-Y', strtotime($periodeawal)) }} s.d
                {{ date('d-m-Y', strtotime($periodeakhir)) }}
            </div>
            <div style="font-size: 12px; margin-top: 5px; color: #666;">Dicetak oleh Super Admin</div>
        </div>

        <!-- VISUAL REPORT FOR SUPER ADMIN -->
        <div class="charts-row">
            <div class="chart-wrapper">
                <h4 class="text-center" style="margin: 0 0 10px 0;">Komposisi Pengeluaran (Top 10 Akun)</h4>
                <div class="chart-container">
                    <canvas id="expenseChart"></canvas>
                </div>
            </div>
            <div class="chart-wrapper">
                <h4 class="text-center" style="margin: 0 0 10px 0;">Trend Pengeluaran Harian</h4>
                <div class="chart-container">
                    <canvas id="trendChart"></canvas>
                </div>
            </div>
        </div>

        <h4 style="margin-bottom: 10px;">Ringkasan Detail Pengeluaran</h4>
        <table>
            <thead>
                <tr>
                    <th style="width:5%;">No.</th>
                    <th>Nama Akun</th>
                    <th class="text-right" style="width:25%;">Total Pengeluaran (Rp)</th>
                    <th class="text-center" style="width:15%;">Persentase</th>
                </tr>
            </thead>
            <tbody>
                @php $i = 1; @endphp
                @foreach ($topExpenses as $akun => $total)
                    <tr>
                        <td class="text-center">{{ $i++ }}</td>
                        <td>{{ $akun }}</td>
                        <td class="text-right">{{ number_format($total, 0, ',', '.') }}</td>
                        <td class="text-center">
                            {{ $totalpengeluaran > 0 ? number_format(($total / $totalpengeluaran) * 100, 2) : 0 }}%
                        </td>
                    </tr>
                @endforeach
            </tbody>
        </table>

        <!-- TOTAL KESELURUHAN -->
        <div class="total-section">
            TOTAL PENGELUARAN: Rp {{ number_format($totalpengeluaran, 0, ',', '.') }}
        </div>

        <script>
            document.addEventListener('DOMContentLoaded', function () {
                const topExpenses = @json($topExpenses);
                const dailyTrend = @json($dailyTrend);

                // Bar Chart - Top Expenses
                new Chart(document.getElementById('expenseChart'), {
                    type: 'bar',
                    data: {
                        labels: Object.keys(topExpenses),
                        datasets: [{
                            label: 'Pengeluaran (Rp)',
                            data: Object.values(topExpenses),
                            backgroundColor: 'rgba(54, 162, 235, 0.6)',
                            borderColor: 'rgba(54, 162, 235, 1)',
                            borderWidth: 1
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        indexAxis: 'y',
                        plugins: {
                            legend: { display: false }
                        },
                        scales: {
                            x: { beginAtZero: true }
                        }
                    }
                });

                // Line Chart - Daily Trend
                new Chart(document.getElementById('trendChart'), {
                    type: 'line',
                    data: {
                        labels: Object.keys(dailyTrend).map(date => {
                            const d = new Date(date);
                            return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
                        }),
                        datasets: [{
                            label: 'Pengeluaran Harian',
                            data: Object.values(dailyTrend),
                            borderColor: 'rgba(255, 99, 132, 1)',
                            backgroundColor: 'rgba(255, 99, 132, 0.2)',
                            tension: 0.3,
                            fill: true
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            y: { beginAtZero: true }
                        }
                    }
                });
            });
        </script>
    </div>
</body>

</html>