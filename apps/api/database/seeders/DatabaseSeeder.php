<?php

namespace Database\Seeders;

use App\Models\AkunAAS;
use App\Models\AkunMataAnggaran;
use App\Models\Cabang;
use App\Models\Instansi;
use App\Models\Role;
use App\Models\Setting;
use App\Models\Unit;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->command->info('Seeding Roles...');
        $this->seedRoles();

        $this->command->info('Seeding Instansi...');
        $instansi = $this->seedInstansi();

        $this->command->info('Seeding Cabang...');
        $cabangList = $this->seedCabang($instansi);

        $this->command->info('Seeding Unit...');
        $unitList = $this->seedUnit($cabangList);

        $this->command->info('Seeding Users...');
        $userList = $this->seedUsers($cabangList, $unitList);

        $this->command->info('Seeding Akun AAS...');
        $this->seedAkunAas($unitList);

        $this->command->info('Seeding Akun Mata Anggaran...');
        $this->seedAkunMatanggaran($unitList);

        $this->command->info('Seeding Settings...');
        $this->seedSettings();

        $this->command->info('');
        $this->command->info('======================================');
        $this->command->info('Database seeded successfully!');
        $this->command->info('======================================');
        $this->command->info('');
        $this->command->info('Default Login Credentials:');
        $this->command->info('- Super Admin        : admin@kaskecil.com / password');
        $this->command->info('- Admin Unit (JKT)   : admin.jktkeu@kaskecil.com / password');
        $this->command->info('- Admin Unit (BDG)   : admin.bdgops@kaskecil.com / password');
    }

    private function seedRoles(): void
    {
        $roles = [
            ['name' => 'super_admin', 'display_name' => 'Super Admin', 'description' => 'Akses penuh ke semua data, mengatur plafon kas per unit'],
            ['name' => 'admin_unit', 'display_name' => 'Admin Unit', 'description' => 'Input transaksi untuk unit sendiri sesuai plafon kas'],
        ];

        foreach ($roles as $role) {
            Role::firstOrCreate(['name' => $role['name']], $role);
        }
    }

    private function seedInstansi(): Instansi
    {
        return Instansi::firstOrCreate(
            ['nama_instansi' => 'YPI Al Azhar'],
            [
                'alamat' => 'Jl. Sisingamangaraja Kebayoran Baru',
                'telepon' => '021-5555-7777',
                'email' => 'info@kaskecil.co.id',
                'kepala_instansi' => 'Dr Fuad Bawazier.',
                'nip_kepala' => '196501151990031001',
            ]
        );
    }

    private function seedCabang(Instansi $instansi): array
    {
        $cabangData = [
            [
                'kode_cabang' => 'JKT-001',
                'nama_cabang' => 'Cabang Jakarta Pusat',
                'alamat' => 'Jl. MH Thamrin No. 50, Jakarta Pusat',
                'telepon' => '021-3456-7890',
                'email' => 'jakarta@kaskecil.co.id',
                'kepala_cabang' => 'Ahmad Fauzi, S.E.',
                'nip_kepala' => '198001012005011001',
                'plafon_kas' => 50000000,
            ],
            [
                'kode_cabang' => 'BDG-001',
                'nama_cabang' => 'Cabang Bandung',
                'alamat' => 'Jl. Asia Afrika No. 25, Bandung',
                'telepon' => '022-1234-5678',
                'email' => 'bandung@kaskecil.co.id',
                'kepala_cabang' => 'Dian Permata, S.E.',
                'nip_kepala' => '198505152010012002',
                'plafon_kas' => 35000000,
            ],
            [
                'kode_cabang' => 'TNG-001',
                'nama_cabang' => 'Cabang Tangerang',
                'alamat' => 'Jl. Raya Serpong No. 77, Tangerang',
                'telepon' => '021-8765-4321',
                'email' => 'tangerang@kaskecil.co.id',
                'kepala_cabang' => 'Rudi Hartono',
                'nip_kepala' => '199001202015011003',
                'plafon_kas' => 25000000,
            ],
        ];

        $cabangList = [];
        foreach ($cabangData as $data) {
            $cabangList[] = Cabang::firstOrCreate(
                ['kode_cabang' => $data['kode_cabang']],
                array_merge($data, ['instansi_id' => $instansi->id, 'is_active' => true])
            );
        }

        return $cabangList;
    }

    private function seedUnit(array $cabangList): array
    {
        $unitData = [
            // Jakarta units
            ['cabang_index' => 0, 'kode_unit' => 'JKT-KEU', 'nama_unit' => 'Unit Keuangan', 'plafon_kas' => 15000000, 'kepala_unit' => 'Siti Aminah'],
            ['cabang_index' => 0, 'kode_unit' => 'JKT-SDM', 'nama_unit' => 'Unit SDM', 'plafon_kas' => 10000000, 'kepala_unit' => 'Rizky Pratama'],
            // Bandung units
            ['cabang_index' => 1, 'kode_unit' => 'BDG-OPS', 'nama_unit' => 'Unit Operasional', 'plafon_kas' => 12000000, 'kepala_unit' => 'Nina Kartika'],
            ['cabang_index' => 1, 'kode_unit' => 'BDG-IT', 'nama_unit' => 'Unit IT', 'plafon_kas' => 8000000, 'kepala_unit' => 'Hendri Wijaya'],
            // Tangerang units
            ['cabang_index' => 2, 'kode_unit' => 'TNG-MKT', 'nama_unit' => 'Unit Marketing', 'plafon_kas' => 10000000, 'kepala_unit' => 'Lisa Anggraeni'],
        ];

        $unitList = [];
        foreach ($unitData as $data) {
            $cabang = $cabangList[$data['cabang_index']];
            $unitList[] = Unit::firstOrCreate(
                ['cabang_id' => $cabang->id, 'kode_unit' => $data['kode_unit']],
                [
                    'nama_unit' => $data['nama_unit'],
                    'plafon_kas' => $data['plafon_kas'],
                    'kepala_unit' => $data['kepala_unit'],
                    'is_active' => true,
                ]
            );
        }

        return $unitList;
    }

    private function seedUsers(array $cabangList, array $unitList): array
    {
        $superAdminRole = Role::where('name', 'super_admin')->first();
        $adminUnitRole = Role::where('name', 'admin_unit')->first();

        $users = [];

        // Super Admin
        $users[] = User::firstOrCreate(
            ['email' => 'admin@kaskecil.com'],
            [
                'nama' => 'Super Admin',
                'password' => Hash::make('password'),
                'role_id' => $superAdminRole->id,
                'cabang_id' => null,
                'unit_id' => null,
                'is_active' => true,
                'email_verified_at' => now(),
            ]
        );

        // Generate Admin Unit for each Unit
        foreach ($unitList as $unit) {
            $email = 'admin.' . strtolower(str_replace(['-', ' '], '', $unit->kode_unit)) . '@kaskecil.com';
            $users[] = User::firstOrCreate(
                ['email' => $email],
                [
                    'nama' => 'Admin ' . $unit->nama_unit,
                    'password' => Hash::make('password'),
                    'role_id' => $adminUnitRole->id,
                    'cabang_id' => $unit->cabang_id,
                    'unit_id' => $unit->id,
                    'is_active' => true,
                    'email_verified_at' => now(),
                ]
            );
        }

        return $users;
    }

    private function seedAkunAas(array $unitList): void
    {
        // Create akun for each unit - default akun untuk Pembentukan dan Pengisian Kas
        $akunTemplates = [
            ['kode_akun' => '1.1.1', 'nama_akun' => 'Pembentukan Kas', 'jenis' => 'kredit'],
            ['kode_akun' => '1.1.2', 'nama_akun' => 'Pengisian Kas', 'jenis' => 'kredit'],
        ];

        foreach ($unitList as $unit) {
            foreach ($akunTemplates as $data) {
                AkunAAS::firstOrCreate(
                    ['unit_id' => $unit->id, 'kode_akun' => $data['kode_akun']],
                    array_merge($data, ['is_active' => true])
                );
            }
        }
    }

    private function seedAkunMatanggaran(array $unitList): array
    {
        $anggaranList = [];

        // Create default Mata Anggaran for each unit
        foreach ($unitList as $unit) {
            // Default Mata Anggaran - MA-111 saldo sesuai plafon_kas unit, MA-112 saldo 0
            $defaultAnggaranTemplates = [
                ['akun_kode' => '1.1.1', 'kode_matanggaran' => 'MA-111', 'saldo' => (int) $unit->plafon_kas],
                ['akun_kode' => '1.1.2', 'kode_matanggaran' => 'MA-112', 'saldo' => 0],
            ];

            foreach ($defaultAnggaranTemplates as $data) {
                $akunAas = AkunAAS::where('unit_id', $unit->id)
                    ->where('kode_akun', $data['akun_kode'])
                    ->first();

                if ($akunAas) {
                    $anggaranList[] = AkunMataAnggaran::firstOrCreate(
                        ['kode_matanggaran' => $data['kode_matanggaran'], 'akun_aas_id' => $akunAas->id],
                        [
                            'saldo' => $data['saldo'],
                        ]
                    );
                }
            }
        }

        return $anggaranList;
    }


    private function seedSettings(): void
    {
        $settings = [
            ['key' => 'app_name', 'value' => 'Kas Kecil Management System'],
            ['key' => 'app_version', 'value' => '4.0.0'],
            ['key' => 'default_plafon', 'value' => '10000000'],
            ['key' => 'allow_registration', 'value' => 'false'],
            ['key' => 'maintenance_mode', 'value' => 'false'],
        ];

        foreach ($settings as $setting) {
            Setting::firstOrCreate(
                ['key' => $setting['key'], 'cabang_id' => null],
                ['value' => $setting['value']]
            );
        }
    }
}
