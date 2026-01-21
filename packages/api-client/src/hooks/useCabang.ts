import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { cabangService } from '../services/cabangService';
import { QUERY_KEYS } from '@kas-kecil/shared';
import type { UpdateCabangDTO } from '@kas-kecil/shared';

export function useCabang() {
    const queryClient = useQueryClient();

    const list = useQuery({
        queryKey: QUERY_KEYS.CABANG.ALL,
        queryFn: cabangService.getAll,
    });

    const createMutation = useMutation({
        mutationFn: cabangService.create,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CABANG.ALL }),
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdateCabangDTO }) => cabangService.update(id, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CABANG.ALL }),
    });

    const deleteMutation = useMutation({
        mutationFn: cabangService.delete,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CABANG.ALL }),
    });

    return {
        data: list.data || [],
        isLoading: list.isLoading,
        create: createMutation.mutateAsync,
        update: updateMutation.mutateAsync,
        remove: deleteMutation.mutateAsync,
    };
}
