import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { StorageService } from '@/services/storage/types';
import { SupabaseStorage } from '@/services/storage/SupabaseStorage';
import { LocalStorage } from '@/services/storage/LocalStorage';

type StorageType = 'supabase' | 'local';

interface StorageContextType {
    storageType: StorageType;
    setStorageType: (type: StorageType) => void;
    storage: StorageService;
    isLocal: boolean;
}

const StorageContext = createContext<StorageContextType | undefined>(undefined);

export const StorageProvider = ({ children }: { children: ReactNode }) => {
    const [storageType, setStorageTypeState] = useState<StorageType>(() => {
        const saved = localStorage.getItem('storage_preference');
        return (saved as StorageType) || 'supabase';
    });

    const [storage, setStorage] = useState<StorageService>(
        storageType === 'local' ? new LocalStorage() : new SupabaseStorage()
    );

    useEffect(() => {
        localStorage.setItem('storage_preference', storageType);
        setStorage(storageType === 'local' ? new LocalStorage() : new SupabaseStorage());
    }, [storageType]);

    const setStorageType = (type: StorageType) => {
        setStorageTypeState(type);
    };

    return (
        <StorageContext.Provider
            value={{
                storageType,
                setStorageType,
                storage,
                isLocal: storageType === 'local',
            }}
        >
            {children}
        </StorageContext.Provider>
    );
};

export const useStorage = () => {
    const context = useContext(StorageContext);
    if (!context) {
        throw new Error('useStorage must be used within a StorageProvider');
    }
    return context;
};
