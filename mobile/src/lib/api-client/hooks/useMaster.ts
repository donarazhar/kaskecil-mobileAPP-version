import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { masterService } from '../services/masterService';
import { QUERY_KEYS } from '../shared';
import type { UpdateAkunAASDTO, UpdateMataAnggaranDTO } from '../shared';

export function useMaster(filters?: { unit_id?: number; tahun?: number }) {
    const queryClient = useQueryClient();

    // Akun AAS
    const akunAAS = useQuery({
        queryKey: [...QUERY_KEYS.MASTER.AKUN_AAS, filters?.unit_id],
        queryFn: () => masterService.getAkunAAS(filters ? { unit_id: filters.unit_id } : undefined),
    });

    const createAkunAAS = useMutation({
        mutationFn: masterService.createAkunAAS,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MASTER.AKUN_AAS }),
    });

    const updateAkunAAS = useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdateAkunAASDTO }) => masterService.updateAkunAAS(id, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MASTER.AKUN_AAS }),
    });

    // Mata Anggaran
    const mataAnggaran = useQuery({
        queryKey: QUERY_KEYS.MASTER.MATA_ANGGARAN(filters),
        queryFn: () => masterService.getMataAnggaran(filters),
    });

    const createMataAnggaran = useMutation({
        mutationFn: masterService.createMataAnggaran,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MASTER.MATA_ANGGARAN(filters) }),
    });

    const updateMataAnggaran = useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdateMataAnggaranDTO }) => masterService.updateMataAnggaran(id, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MASTER.MATA_ANGGARAN(filters) }),
    });

    // Instansi
    const instansi = useQuery({
        queryKey: QUERY_KEYS.MASTER.INSTANSI,
        queryFn: masterService.getInstansi,
    });

    const updateInstansi = useMutation({
        mutationFn: masterService.updateInstansi,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MASTER.INSTANSI }),
    });

    return {
        akunAAS: akunAAS.data || [],
        isAkunAASLoading: akunAAS.isLoading,
        createAkunAAS: createAkunAAS.mutateAsync,
        updateAkunAAS: updateAkunAAS.mutateAsync,
        mataAnggaran: mataAnggaran.data || [],
        isMataAnggaranLoading: mataAnggaran.isLoading,
        createMataAnggaran: createMataAnggaran.mutateAsync,
        updateMataAnggaran: updateMataAnggaran.mutateAsync,
        instansi: instansi.data,
        isInstansiLoading: instansi.isLoading,
        updateInstansi: updateInstansi.mutateAsync,
    };
}
