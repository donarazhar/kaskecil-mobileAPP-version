
import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '../services/dashboardService';
import { QUERY_KEYS } from '../shared';
import type { DashboardFilter } from '../shared';

export function useDashboard(filters?: DashboardFilter) {
    const summaryQuery = useQuery({
        queryKey: [...QUERY_KEYS.DASHBOARD.SUMMARY, filters],
        queryFn: () => dashboardService.getSummary(filters),
    });

    const chartQuery = useQuery({
        queryKey: [...QUERY_KEYS.DASHBOARD.CHART, filters],
        queryFn: () => dashboardService.getChart(filters),
    });

    const recentQuery = useQuery({
        queryKey: [...QUERY_KEYS.DASHBOARD.RECENT, filters],
        queryFn: () => dashboardService.getRecent({ ...filters, limit: 5 }),
    });

    const topAnggaranQuery = useQuery({
        queryKey: [...QUERY_KEYS.DASHBOARD.TOP_ANGGARAN, filters],
        queryFn: () => dashboardService.getTopAnggaran(filters),
    });

    return {
        summary: summaryQuery.data,
        isSummaryLoading: summaryQuery.isLoading,
        chart: chartQuery.data,
        isChartLoading: chartQuery.isLoading,
        recent: recentQuery.data,
        isRecentLoading: recentQuery.isLoading,
        topAnggaran: topAnggaranQuery.data,
        isTopAnggaranLoading: topAnggaranQuery.isLoading,
        refetch: () => {
            summaryQuery.refetch();
            chartQuery.refetch();
            recentQuery.refetch();
            topAnggaranQuery.refetch();
        },
        isLoading: summaryQuery.isLoading || chartQuery.isLoading || recentQuery.isLoading || topAnggaranQuery.isLoading
    };
}
