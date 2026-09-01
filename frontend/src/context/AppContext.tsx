import { createContext, useContext, useState, type ReactNode } from 'react';
import { initialPackages, initialTrucks, initialUsers } from '@/data/mockData';
import type { Package, Truck, User, Role } from '@/types';

type ContextValue = {
    role: Role;
    setRole: (role: Role) => void;
    trucks: Truck[];
    packages: Package[];
    users: User[];
    addConsignment: (pkg: Package, truckId?: string) => void;
    assignConsignment: (pkgId: string, truckId: string, carrier?: string) => void;
    addUser: (user: User) => void;
    addVehicle: (truck: Truck) => void;
    updateTruck: (id: string, patch: Partial<Truck>) => void;
};

const AppContext = createContext<ContextValue | null>(null);

export function useApp() {
    const value = useContext(AppContext);

    if (!value) {
        throw new Error('App context missing');
    }

    return value;
}

export function AppProvider({ children }: { children: ReactNode }) {
    const [role, setRole] = useState<Role>('Operator');
    const [trucks, setTrucks] = useState(initialTrucks);
    const [packages, setPackages] = useState(initialPackages);
    const [users, setUsers] = useState(initialUsers);

    const addConsignment = (pkg: Package, truckId?: string) => {
        setPackages((items) => [pkg, ...items]);

        if (!truckId) {
            return;
        }

        setTrucks((items) =>
            items.map((truck) =>
                truck.id === truckId
                    ? {
                        ...truck,
                        risk: Math.max(truck.risk, pkg.risk),
                        health: pkg.health,
                    }
                    : truck,
            ),
        );
    };

    const assignConsignment = (pkgId: string, truckId: string, carrier?: string) => {
        setPackages((items) =>
            items.map((item) =>
                item.id === pkgId
                    ? {
                        ...item,
                        truck: truckId,
                        carrier: carrier || item.carrier || 'Assigned operator',
                        health: item.health,
                        eta: '04:00:00',
                        updated: 'just now',
                    }
                    : item,
            ),
        );

        setTrucks((items) =>
            items.map((truck) =>
                truck.id === truckId
                    ? {
                        ...truck,
                        risk: Math.max(truck.risk, 8),
                        health: 'nominal',
                    }
                    : truck,
            ),
        );
    };

    const addUser = (user: User) => {
        setUsers((items) => [...items, user]);
    };

    const addVehicle = (truck: Truck) => {
        setTrucks((items) => [...items, truck]);
    };

    const updateTruck = (id: string, patch: Partial<Truck>) => {
        setTrucks((items) =>
            items.map((truck) => (truck.id === id ? { ...truck, ...patch } : truck)),
        );
    };

    return (
        <AppContext.Provider
            value={{
                role,
                setRole,
                trucks,
                packages,
                users,
                addConsignment,
                assignConsignment,
                addUser,
                addVehicle,
                updateTruck,
            }}
        >
            {children}
        </AppContext.Provider>
    );
}