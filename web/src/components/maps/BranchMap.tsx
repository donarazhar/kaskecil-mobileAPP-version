import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet Default Icon in React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface Branch {
    id: number;
    nama_cabang: string;
    alamat?: string | null;
    latitude?: number | null;
    longitude?: number | null;
}

interface BranchMapProps {
    branches: Branch[];
}

// Component to handle bounds
function MapBounds({ branches }: { branches: Branch[] }) {
    const map = useMap();

    useEffect(() => {
        const validBranches = branches.filter(b => b.latitude && b.longitude);
        if (validBranches.length > 0) {
            const bounds = L.latLngBounds(validBranches.map(b => [b.latitude!, b.longitude!]));
            map.fitBounds(bounds, { padding: [50, 50] });
        } else {
            // Default center if no coordinates (Indonesia)
            map.setView([-2.5489, 118.0149], 5);
        }
    }, [branches, map]);

    return null;
}

export function BranchMap({ branches }: BranchMapProps) {
    const validBranches = branches.filter(b => b.latitude && b.longitude);

    return (
        <div className="h-[400px] w-full rounded-xl overflow-hidden border border-gray-200 z-0 relative">
            {/* @ts-ignore */}
            <MapContainer
                center={[-2.5489, 118.0149]}
                zoom={5}
                scrollWheelZoom={false}
                style={{ height: "100%", width: "100%", zIndex: 0 }}
            >
                {/* @ts-ignore */}
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {validBranches.map((branch) => (
                    // @ts-ignore
                    <Marker
                        key={branch.id}
                        position={[branch.latitude!, branch.longitude!]}
                    >
                        {/* @ts-ignore */}
                        <Popup>
                            <div className="p-2">
                                <h3 className="font-bold text-gray-900">{branch.nama_cabang}</h3>
                                <p className="text-sm text-gray-600 mt-1">{branch.alamat}</p>
                            </div>
                        </Popup>
                    </Marker>
                ))}

                <MapBounds branches={branches} />
            </MapContainer>
        </div>
    );
}
