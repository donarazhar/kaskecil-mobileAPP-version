<?php

namespace App\Services;

use App\Models\Notification;
use App\Models\Transaksi;
use App\Models\TransaksiShadow;
use App\Models\User;

class NotificationService
{
    public function create(User $user, string $title, ?string $body = null, ?string $type = null, ?array $data = null): Notification
    {
        return Notification::create([
            'user_id' => $user->id,
            'title' => $title,
            'body' => $body,
            'type' => $type,
            'data' => $data,
        ]);
    }

    public function notifyDraftSubmitted(TransaksiShadow $draft): void
    {
        // Notify approvers (admin cabang/unit)
        $approvers = $this->getApprovers($draft);

        foreach ($approvers as $approver) {
            $this->create(
                $approver,
                'Draft Transaksi Baru',
                "Draft transaksi dari {$draft->user->nama} menunggu persetujuan Anda.",
                'draft_submitted',
                [
                    'draft_id' => $draft->id,
                    'jumlah' => $draft->jumlah,
                ]
            );

            $this->sendPushNotification($approver, 'Draft Transaksi Baru', "Menunggu persetujuan: Rp " . number_format($draft->jumlah, 0, ',', '.'));
        }
    }

    public function notifyDraftApproved(TransaksiShadow $draft): void
    {
        $this->create(
            $draft->user,
            'Draft Disetujui',
            "Draft transaksi Anda telah disetujui oleh {$draft->approver->nama}.",
            'draft_approved',
            [
                'draft_id' => $draft->id,
            ]
        );

        $this->sendPushNotification($draft->user, 'Draft Disetujui', 'Draft transaksi Anda telah disetujui.');
    }

    public function notifyDraftRejected(TransaksiShadow $draft): void
    {
        $body = "Draft transaksi Anda ditolak.";
        if ($draft->catatan_approval) {
            $body .= " Catatan: {$draft->catatan_approval}";
        }

        $this->create(
            $draft->user,
            'Draft Ditolak',
            $body,
            'draft_rejected',
            [
                'draft_id' => $draft->id,
                'catatan' => $draft->catatan_approval,
            ]
        );

        $this->sendPushNotification($draft->user, 'Draft Ditolak', $body);
    }

    public function notifyPengisianCompleted(Transaksi $pengisian, int $count): void
    {
        // Notify relevant users about completed pengisian
        $users = User::where('cabang_id', $pengisian->cabang_id)
            ->when($pengisian->unit_id, fn($q) => $q->where('unit_id', $pengisian->unit_id))
            ->active()
            ->get();

        foreach ($users as $user) {
            $this->create(
                $user,
                'Pengisian Kas Selesai',
                "{$count} transaksi pengeluaran telah diisi kembali.",
                'pengisian_completed',
                [
                    'pengisian_id' => $pengisian->id,
                    'jumlah' => $pengisian->jumlah,
                ]
            );
        }
    }

    public function notifyLowBalance(int $cabangId, ?int $unitId, float $percentage): void
    {
        $query = User::where('cabang_id', $cabangId);
        if ($unitId) {
            $query->where('unit_id', $unitId);
        }

        $admins = $query->whereHas('role', function ($q) {
            $q->whereIn('name', ['super_admin', 'admin_cabang', 'admin_unit']);
        })->get();

        foreach ($admins as $admin) {
            $this->create(
                $admin,
                'Saldo Kas Rendah',
                "Saldo kas kecil hanya tersisa " . round($percentage) . "% dari plafon.",
                'low_balance',
                [
                    'cabang_id' => $cabangId,
                    'unit_id' => $unitId,
                    'percentage' => $percentage,
                ]
            );

            $this->sendPushNotification($admin, 'Saldo Kas Rendah', 'Segera lakukan pengisian kembali.');
        }
    }

    private function getApprovers(TransaksiShadow $draft): array
    {
        $query = User::active()
            ->whereHas('role', function ($q) {
                $q->whereIn('name', ['super_admin', 'admin_cabang', 'admin_unit']);
            });

        if ($draft->unit_id) {
            $query->where(function ($q) use ($draft) {
                $q->whereNull('unit_id')
                    ->orWhere('unit_id', $draft->unit_id);
            });
        }

        if ($draft->cabang_id) {
            $query->where(function ($q) use ($draft) {
                $q->whereNull('cabang_id')
                    ->orWhere('cabang_id', $draft->cabang_id);
            });
        }

        return $query->get()->all();
    }

    private function sendPushNotification(User $user, string $title, string $body): void
    {
        if (!$user->fcm_token) {
            return;
        }

        // TODO: Implement Firebase Cloud Messaging
        // This would use Firebase Admin SDK to send push notifications
    }
}
