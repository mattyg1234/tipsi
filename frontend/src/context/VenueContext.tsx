import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Venue {
  id: string;
  name: string;
  logo?: string;
  primaryColor: string;
  secondaryColor: string;
  address?: string;
  description?: string;
}

export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  category: 'bottle' | 'drink' | 'shot';
  image?: string;
}

interface VenueContextType {
  venue: Venue | null;
  menuItems: MenuItem[];
  loading: boolean;
  error: string | null;
  setVenue: (venue: Venue) => void;
  setMenuItems: (items: MenuItem[]) => void;
  clearVenue: () => void;
}

const VenueContext = createContext<VenueContextType | undefined>(undefined);

export const useVenue = () => {
  const context = useContext(VenueContext);
  if (context === undefined) {
    throw new Error('useVenue must be used within a VenueProvider');
  }
  return context;
};

interface VenueProviderProps {
  children: ReactNode;
}

export const VenueProvider: React.FC<VenueProviderProps> = ({ children }) => {
  const [venue, setVenueState] = useState<Venue | null>(null);
  const [menuItems, setMenuItemsState] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setVenue = (newVenue: Venue) => {
    setVenueState(newVenue);
    setError(null);
  };

  const setMenuItems = (items: MenuItem[]) => {
    setMenuItemsState(items);
  };

  const clearVenue = () => {
    setVenueState(null);
    setMenuItemsState([]);
    setError(null);
  };

  const value: VenueContextType = {
    venue,
    menuItems,
    loading,
    error,
    setVenue,
    setMenuItems,
    clearVenue,
  };

  return (
    <VenueContext.Provider value={value}>
      {children}
    </VenueContext.Provider>
  );
};

