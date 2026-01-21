import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { userService } from '../services/userService';
import { QUERY_KEYS } from '@kas-kecil/shared';
import type { UpdateUserDTO } from '@kas-kecil/shared';

export function useUser(filters?: { page?: number; search?: string }) {
    const queryClient = useQueryClient();

    const list = useQuery({
        queryKey: QUERY_KEYS.USERS.LIST(filters),
        queryFn: () => userService.getAll(filters),
    });

    const roles = useQuery({
        queryKey: QUERY_KEYS.ROLES,
        queryFn: userService.getRoles,
    });

    const createMutation = useMutation({
        mutationFn: userService.create,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USERS.ALL }),
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdateUserDTO }) => userService.update(id, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USERS.ALL }),
    });

    const deleteMutation = useMutation({
        mutationFn: userService.delete,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USERS.ALL }),
    });

    const toggleMutation = useMutation({
        mutationFn: userService.toggleStatus,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USERS.ALL }),
    });

    return {
        data: list.data,
        isLoading: list.isLoading,
        roles: roles.data || [],
        create: createMutation.mutateAsync,
        update: updateMutation.mutateAsync,
        remove: deleteMutation.mutateAsync,
        toggle: toggleMutation.mutateAsync,
    };
}
