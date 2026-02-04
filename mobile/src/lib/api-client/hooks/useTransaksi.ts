import { useMutation, useQuery, useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { transaksiService } from '../services/transaksiService';
import { QUERY_KEYS } from '../shared';
import type { TransaksiFilter, UpdateTransaksiDTO } from '../shared';

export function useTransaksi(filters?: TransaksiFilter) {
    const queryClient = useQueryClient();

    const list = useInfiniteQuery({
        queryKey: QUERY_KEYS.TRANSAKSI.LIST(filters),
        queryFn: ({ pageParam = 1 }) => transaksiService.getAll({ ...filters, page: pageParam }),
        getNextPageParam: (lastPage) => {
            const currentPage = lastPage?.meta?.current_page || 1;
            const lastPageNum = lastPage?.meta?.last_page || 1;
            return currentPage < lastPageNum ? currentPage + 1 : undefined;
        },
        initialPageParam: 1,
    });

    const createMutation = useMutation({
        mutationFn: transaksiService.create,
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TRANSAKSI.ALL });
            await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DRAFT.ALL });
            await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DASHBOARD.SUMMARY });
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdateTransaksiDTO }) =>
            transaksiService.update(id, data),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TRANSAKSI.ALL });
            await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DRAFT.ALL });
            await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DASHBOARD.SUMMARY });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: transaksiService.delete,
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TRANSAKSI.ALL });
            await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DRAFT.ALL });
            await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DASHBOARD.SUMMARY });
        },
    });

    const cairkanMutation = useMutation({
        mutationFn: transaksiService.cairkan,
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TRANSAKSI.ALL });
            await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DRAFT.ALL });
            await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DASHBOARD.SUMMARY });
        },
    });

    return {
        data: list.data,
        isLoading: list.isLoading,
        isFetchingNextPage: list.isFetchingNextPage,
        hasNextPage: list.hasNextPage,
        fetchNextPage: list.fetchNextPage,
        create: createMutation.mutateAsync,
        update: updateMutation.mutateAsync,
        remove: deleteMutation.mutateAsync,
        isCreating: createMutation.isPending,
        isUpdating: updateMutation.isPending,
        isDeleting: deleteMutation.isPending,
        cairkan: cairkanMutation.mutateAsync,
        isCairkanProcessing: cairkanMutation.isPending,
        refetch: list.refetch,
    };
}

export function useTransaksiDetail(id: number) {
    return useQuery({
        queryKey: QUERY_KEYS.TRANSAKSI.DETAIL(id),
        queryFn: () => transaksiService.getById(id),
        enabled: !!id,
    });
}
