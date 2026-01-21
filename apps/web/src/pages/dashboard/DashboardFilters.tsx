import { useCabang, useUnit } from '@kas-kecil/api-client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Filter, X } from 'lucide-react';
import { useState } from 'react';

interface DashboardFiltersProps {
    onFilterChange: (filters: { cabang_id?: number; unit_id?: number }) => void;
}

export const DashboardFilters = ({ onFilterChange }: DashboardFiltersProps) => {
    const [selectedCabang, setSelectedCabang] = useState<string>('');
    const [selectedUnit, setSelectedUnit] = useState<string>('');

    const { data: cabangList } = useCabang();

    // Fetch units based on selected cabang or all if none selected (though usually we filter units by cabang)
    // If API supports filtering units by cabang via query param, we should pass it. 
    // Looking at common patterns, maybe fetch all and filter client side or just fetch all.
    // Let's assume useUnit fetches all for now or we filter client side if needed.
    const { data: unitList } = useUnit();

    // Filter units based on selected cabang
    const filteredUnits = selectedCabang
        ? unitList?.filter(u => u.cabang_id === Number(selectedCabang))
        : unitList;

    const handleCabangChange = (value: string) => {
        setSelectedCabang(value);
        setSelectedUnit(''); // Reset unit when cabang changes
        onFilterChange({ cabang_id: Number(value), unit_id: undefined });
    };

    const handleUnitChange = (value: string) => {
        setSelectedUnit(value);
        onFilterChange({
            cabang_id: selectedCabang ? Number(selectedCabang) : undefined,
            unit_id: Number(value)
        });
    };

    const clearFilters = () => {
        setSelectedCabang('');
        setSelectedUnit('');
        onFilterChange({ cabang_id: undefined, unit_id: undefined });
    };

    const hasFilters = selectedCabang || selectedUnit;

    return (
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
            <div className="flex items-center gap-2 text-gray-500 mr-2">
                {/* @ts-ignore */}
                <Filter size={18} />
                <span className="text-sm font-medium">Filter:</span>
            </div>

            <div className="w-full sm:w-48">
                <Select value={selectedCabang} onValueChange={handleCabangChange}>
                    <SelectTrigger>
                        <SelectValue placeholder="Semua Cabang" />
                    </SelectTrigger>
                    <SelectContent>
                        {cabangList?.map((cabang) => (
                            <SelectItem key={cabang.id} value={String(cabang.id)}>
                                {cabang.nama_cabang}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="w-full sm:w-48">
                <Select
                    value={selectedUnit}
                    onValueChange={handleUnitChange}
                    disabled={!selectedCabang && (!unitList || unitList.length > 50)} // Optional optimization
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Semua Unit" />
                    </SelectTrigger>
                    <SelectContent>
                        {filteredUnits?.map((unit) => (
                            <SelectItem key={unit.id} value={String(unit.id)}>
                                {unit.nama_unit}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {hasFilters && (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                    {/* @ts-ignore */}
                    <X size={16} className="mr-1" />
                    Reset
                </Button>
            )}
        </div>
    );
};
