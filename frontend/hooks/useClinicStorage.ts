"use client";

import { useState, useEffect } from "react";
import { ClinicCatalogItem } from "@/lib/clinic-catalog";
import { getClinicsFromStorage, addClinic, updateClinic, deleteClinic } from "@/lib/clinic-storage";

export function useClinicStorage() {
  const [clinics, setClinics] = useState<ClinicCatalogItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = getClinicsFromStorage();
    setClinics(stored);
    setLoading(false);
  }, []);

  const add = (clinic: ClinicCatalogItem) => {
    addClinic(clinic);
    const updated = getClinicsFromStorage();
    setClinics(updated);
  };

  const update = (clinic: ClinicCatalogItem) => {
    updateClinic(clinic);
    const updated = getClinicsFromStorage();
    setClinics(updated);
  };

  const remove = (id: string) => {
    deleteClinic(id);
    const updated = getClinicsFromStorage();
    setClinics(updated);
  };

  return { clinics, loading, add, update, remove };
}
