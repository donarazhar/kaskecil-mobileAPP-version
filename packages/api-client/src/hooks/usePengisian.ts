import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { pengisianService } from '../services/pengisianService';
import { QUERY_KEYS } from '@kas-kecil/shared';

export function usePengisian(filters?: { cabang_id?: number; unit_id?: number }) {
    const queryClient = useQueryClient();

    const pending = useQuery({
        queryKey: QUERY_KEYS.PENGISIAN.PENDING(filters),
        queryFn: () => pengisianService.getPending(filters),
    });

    const history = useQuery({
        queryKey: QUERY_KEYS.PENGISIAN.HISTORY(filters),
        queryFn: () => pengisianService.getHistory(filters),
    });

    const processMutation = useMutation({
        mutationFn: pengisianService.process,
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PENGISIAN.ALL });
            await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TRANSAKSI.ALL });
            await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DASHBOARD.SUMMARY });
        },
    });

    return {
        pending: pending.data,
        isPendingLoading: pending.isLoading,
        history: history.data,
        isHistoryLoading: history.isLoading,
        process: processMutation.mutateAsync,
        isProcessing: processMutation.isPending,
    };
}
