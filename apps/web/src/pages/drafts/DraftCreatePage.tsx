import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useDraft } from '@kas-kecil/api-client';
import { draftSchema } from '@kas-kecil/validators';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

type DraftForm = z.infer<typeof draftSchema>;

export default function DraftCreatePage() {
    const navigate = useNavigate();
    const { create, isCreating } = useDraft();
    const { user } = useAuth();
    const [fileStats, setFileStats] = useState<{ name: string; size: string } | null>(null);

    const form = useForm<DraftForm>({
        resolver: zodResolver(draftSchema),
        defaultValues: {
            tanggal: new Date().toISOString().split('T')[0],
            cabang_id: user?.cabang?.id || 0,
        },
    });

    const onSubmit = async (data: DraftForm) => {
        try {
            await create(data);
            navigate('/drafts');
        } catch (error) {
            console.error('Failed to create draft:', error);
            // Ideally show toast
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            form.setValue('lampiran', file);
            setFileStats({
                name: file.name,
                size: (file.size / 1024 / 1024).toFixed(2) + ' MB'
            });
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <Button variant="ghost" className="pl-0 hover:pl-2 transition-all" onClick={() => navigate('/drafts')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Kembali ke Daftar Pengajuan
            </Button>

            <div>
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Buat Pengajuan Baru</h1>
                <p className="text-gray-500 mt-1">Isi formulir berikut untuk membuat draft pengajuan.</p>
            </div>

            <Card className="border-none shadow-xl bg-white/50 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle>Data Pengajuan</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="tanggal">Tanggal</Label>
                                <Input
                                    id="tanggal"
                                    type="date"
                                    {...form.register('tanggal')}
                                    className={cn(form.formState.errors.tanggal && "border-red-500 focus-visible:ring-red-500")}
                                />
                                {form.formState.errors.tanggal && (
                                    <p className="text-sm text-red-500">{form.formState.errors.tanggal.message}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="no_bukti">No. Bukti (Opsional)</Label>
                                <Input
                                    id="no_bukti"
                                    placeholder="Contoh: BKK-001"
                                    {...form.register('no_bukti')}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="jumlah">Jumlah (Rp)</Label>
                            <Input
                                id="jumlah"
                                type="number"
                                placeholder="0"
                                {...form.register('jumlah', { valueAsNumber: true })}
                                className={cn(form.formState.errors.jumlah && "border-red-500 focus-visible:ring-red-500")}
                            />
                            {form.formState.errors.jumlah && (
                                <p className="text-sm text-red-500">{form.formState.errors.jumlah.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="keterangan">Keterangan</Label>
                            <Input
                                id="keterangan"
                                placeholder="Uraian pengajuan..."
                                {...form.register('keterangan')}
                                className={cn(form.formState.errors.keterangan && "border-red-500 focus-visible:ring-red-500")}
                            />
                            {form.formState.errors.keterangan && (
                                <p className="text-sm text-red-500">{form.formState.errors.keterangan.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="lampiran">Bukti Lampiran (Opsional)</Label>
                            <div className="flex items-center gap-4">
                                <Input
                                    id="lampiran"
                                    type="file"
                                    accept="image/*,.pdf"
                                    onChange={handleFileChange}
                                    className="cursor-pointer"
                                />
                            </div>
                            {fileStats && (
                                <p className="text-xs text-gray-500">
                                    File dipilih: {fileStats.name} ({fileStats.size})
                                </p>
                            )}
                        </div>

                        <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isCreating}>
                            {isCreating ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Menyimpan...
                                </>
                            ) : (
                                'Simpan Draft'
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
