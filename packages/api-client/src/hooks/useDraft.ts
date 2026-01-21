import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { draftService } from '../services/draftService';
import { QUERY_KEYS } from '@kas-kecil/shared';
import type { DraftFilter, UpdateDraftDTO, ApprovalDTO } from '@kas-kecil/shared';

export function useDraft(filters?: DraftFilter) {
    const queryClient = useQueryClient();

    const list = useQuery({
        queryKey: QUERY_KEYS.DRAFT.LIST(filters),
        queryFn: () => draftService.getAll(filters),
    });

    const createMutation = useMutation({
        mutationFn: draftService.create,
        onSuccess: async () => await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DRAFT.ALL }),
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdateDraftDTO }) => draftService.update(id, data),
        onSuccess: async () => await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DRAFT.ALL }),
    });

    const deleteMutation = useMutation({
        mutationFn: draftService.delete,
        onSuccess: async () => await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DRAFT.ALL }),
    });

    const submitMutation = useMutation({
        mutationFn: draftService.submit,
        onSuccess: async () => await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DRAFT.ALL }),
    });

    const approveMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data?: ApprovalDTO }) => draftService.approve(id, data),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DRAFT.ALL });
            await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TRANSAKSI.ALL });
        },
    });

    const rejectMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data?: ApprovalDTO }) => draftService.reject(id, data),
        onSuccess: async () => await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DRAFT.ALL }),
    });

    return {
        data: list.data,
        isLoading: list.isLoading,
        refetch: list.refetch,
        create: createMutation.mutateAsync,
        update: updateMutation.mutateAsync,
        remove: deleteMutation.mutateAsync,
        submit: submitMutation.mutateAsync,
        approve: approveMutation.mutateAsync,
        reject: rejectMutation.mutateAsync,
        isCreating: createMutation.isPending,
        isUpdating: updateMutation.isPending,
        isDeleting: deleteMutation.isPending,
        isSubmitting: submitMutation.isPending,
        isApproving: approveMutation.isPending,
        isRejecting: rejectMutation.isPending,
    };
}

export function useDraftDetail(id: number) {
    return useQuery({
        queryKey: QUERY_KEYS.DRAFT.DETAIL(id),
        queryFn: () => draftService.getById(id),
        enabled: !!id,
    });
}

