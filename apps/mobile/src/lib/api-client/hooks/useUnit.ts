import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { unitService } from '../services/unitService';
import { QUERY_KEYS } from '../shared';
import type { UpdateUnitDTO } from '../shared';

export function useUnit(cabangId?: number) {
    const queryClient = useQueryClient();

    const list = useQuery({
        queryKey: QUERY_KEYS.UNIT.LIST({ cabang_id: cabangId }),
        queryFn: () => unitService.getAll(cabangId),
    });

    const createMutation = useMutation({
        mutationFn: unitService.create,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.UNIT.ALL }),
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdateUnitDTO }) => unitService.update(id, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.UNIT.ALL }),
    });

    const deleteMutation = useMutation({
        mutationFn: unitService.delete,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.UNIT.ALL }),
    });

    return {
        data: list.data || [],
        isLoading: list.isLoading,
        create: createMutation.mutateAsync,
        update: updateMutation.mutateAsync,
        remove: deleteMutation.mutateAsync,
    };
}
