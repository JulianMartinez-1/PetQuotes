"use client";

import { useEffect, useState, FormEvent, type ReactNode, type ElementType } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Stethoscope, Building2, MapPin, Phone, Mail, Globe,
  Image, Save, Loader2, CheckCircle2, AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthState } from "@/store/auth-state";
import { requestJson } from "@/lib/api-client";
import { cn } from "@/lib/utils";

interface VetProfile {
  id: string;
  veterinaryType: "CLINIC" | "INDEPENDENT";
  status: "PENDING" | "APPROVED" | "REJECTED";
  serviceArea: string | null;
  homeVisits: boolean;
  coverageRadius: number | null;
  clinic: {
    id: string;
    name: string;
    description: string | null;
    phone: string | null;
    email: string | null;
    website: string | null;
    logo: string | null;
    branches: {
      id: string;
      name: string;
      city: string;
      address: string;
      phone: string | null;
      openingHours: string | null;
    }[];
    services: { id: string; name: string; category: string }[];
  } | null;
}

interface FormState {
  name: string;
  description: string;
  phone: string;
  email: string;
  website: string;
  logo: string;
  branchCity: string;
  branchAddress: string;
  branchPhone: string;
  openingHours: string;
  serviceArea: string;
  homeVisits: boolean;
  coverageRadius: string;
}

export default function MiVeterinariaPage() {
  const router = useRouter();
  const { user, isHydrated } = useAuthState();

  const [profile, setProfile] = useState<VetProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [form, setForm] = useState<FormState>({
    name: "", description: "", phone: "", email: "", website: "", logo: "",
    branchCity: "", branchAddress: "", branchPhone: "", openingHours: "",
    serviceArea: "", homeVisits: false, coverageRadius: "",
  });

  useEffect(() => {
    if (!isHydrated) return;
    if (!user) { router.push("/login"); return; }
    if (user.role !== "VETERINARY") { router.push("/"); return; }

    const load = async () => {
      try {
        const data = await requestJson<VetProfile>("/api/proxy/veterinary/my-profile");
        setProfile(data);
        const branch = data.clinic?.branches[0];
        setForm({
          name: data.clinic?.name ?? "",
          description: data.clinic?.description ?? "",
          phone: data.clinic?.phone ?? "",
          email: data.clinic?.email ?? "",
          website: data.clinic?.website ?? "",
          logo: data.clinic?.logo ?? "",
          branchCity: branch?.city ?? "",
          branchAddress: branch?.address ?? "",
          branchPhone: branch?.phone ?? "",
          openingHours: branch?.openingHours ?? "",
          serviceArea: data.serviceArea ?? "",
          homeVisits: data.homeVisits ?? false,
          coverageRadius: data.coverageRadius?.toString() ?? "",
        });
      } catch {
        router.push("/");
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [isHydrated, user, router]);

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      const payload = profile?.veterinaryType === "CLINIC"
        ? {
            name: form.name.trim() || undefined,
            description: form.description.trim() || undefined,
            phone: form.phone.trim() || undefined,
            email: form.email.trim() || undefined,
            website: form.website.trim() || undefined,
            logo: form.logo.trim() || undefined,
            branchCity: form.branchCity.trim() || undefined,
            branchAddress: form.branchAddress.trim() || undefined,
            branchPhone: form.branchPhone.trim() || undefined,
            openingHours: form.openingHours.trim() || undefined,
          }
        : {
            serviceArea: form.serviceArea.trim() || undefined,
            homeVisits: form.homeVisits,
            coverageRadius: form.coverageRadius ? Number(form.coverageRadius) : undefined,
          };

      const updated = await requestJson<VetProfile>("/api/proxy/veterinary/my-profile", {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
      setProfile(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setSaveError((err as Error).message || "No se pudo guardar los cambios");
    } finally {
      setSaving(false);
    }
  };

  if (!isHydrated || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 size={28} className="animate-spin text-primary-600" />
      </div>
    );
  }

  if (!profile) return null;

  const isClinic = profile.veterinaryType === "CLINIC";
  const branch = profile.clinic?.branches[0];

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Header */}
        <div className="mb-7">
          <div className="flex items-center gap-3 mb-1">
            {isClinic ? (
              <Building2 size={26} className="text-primary-600" />
            ) : (
              <Stethoscope size={26} className="text-primary-600" />
            )}
            <h1 className="text-2xl font-bold text-text-primary">Mi Veterinaria</h1>
          </div>
          <p className="text-sm text-text-muted ml-10">
            {isClinic
              ? "Actualiza la información pública de tu clínica"
              : "Actualiza tu perfil de veterinario independiente"}
          </p>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          {isClinic ? (
            <>
              {/* Logo */}
              <Section title="Imagen / Logo" icon={Image}>
                <Field label="URL de la foto o logo">
                  <Input
                    type="url"
                    placeholder="https://ejemplo.com/mi-logo.png"
                    value={form.logo}
                    onChange={(e) => setForm((p) => ({ ...p, logo: e.target.value }))}
                    variant="default"
                  />
                  {form.logo && (
                    <div className="mt-2 rounded-xl overflow-hidden border border-border w-24 h-24">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={form.logo} alt="logo preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </Field>
              </Section>

              {/* Info general */}
              <Section title="Información de la clínica" icon={Building2}>
                <Field label="Nombre de la clínica">
                  <Input
                    type="text"
                    placeholder="Nombre de tu clínica"
                    value={form.name}
                    onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                    variant="default"
                    required
                  />
                </Field>
                <Field label="Descripción">
                  <textarea
                    rows={3}
                    placeholder="Describe tu clínica, especialidades, etc."
                    value={form.description}
                    onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                    className={cn(
                      "w-full px-3 py-2.5 rounded-lg border border-border bg-surface text-sm text-text-primary",
                      "placeholder:text-text-muted resize-none",
                      "focus:outline-none focus:ring-2 focus:ring-primary-600/30 focus:border-primary-600",
                    )}
                  />
                </Field>
              </Section>

              {/* Contacto */}
              <Section title="Contacto" icon={Phone}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Teléfono">
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted size-4" />
                      <Input
                        type="tel"
                        placeholder="+57 300 000 0000"
                        value={form.phone}
                        onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                        className="pl-10"
                        variant="default"
                      />
                    </div>
                  </Field>
                  <Field label="Correo electrónico">
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted size-4" />
                      <Input
                        type="email"
                        placeholder="contacto@miveterinaria.com"
                        value={form.email}
                        onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                        className="pl-10"
                        variant="default"
                      />
                    </div>
                  </Field>
                  <Field label="Sitio web" className="sm:col-span-2">
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted size-4" />
                      <Input
                        type="url"
                        placeholder="https://miveterinaria.com"
                        value={form.website}
                        onChange={(e) => setForm((p) => ({ ...p, website: e.target.value }))}
                        className="pl-10"
                        variant="default"
                      />
                    </div>
                  </Field>
                </div>
              </Section>

              {/* Sucursal */}
              <Section title="Dirección principal" icon={MapPin}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Ciudad">
                    <Input
                      type="text"
                      placeholder="Ej: Bogotá"
                      value={form.branchCity}
                      onChange={(e) => setForm((p) => ({ ...p, branchCity: e.target.value }))}
                      variant="default"
                    />
                  </Field>
                  <Field label="Teléfono de sucursal">
                    <Input
                      type="tel"
                      placeholder="+57 300 000 0000"
                      value={form.branchPhone}
                      onChange={(e) => setForm((p) => ({ ...p, branchPhone: e.target.value }))}
                      variant="default"
                    />
                  </Field>
                  <Field label="Dirección" className="sm:col-span-2">
                    <Input
                      type="text"
                      placeholder="Calle, número, barrio"
                      value={form.branchAddress}
                      onChange={(e) => setForm((p) => ({ ...p, branchAddress: e.target.value }))}
                      variant="default"
                    />
                  </Field>
                  <Field label="Horario de atención" className="sm:col-span-2">
                    <Input
                      type="text"
                      placeholder='Ej: {"lunes":"8:00-18:00","martes":"8:00-18:00"}'
                      value={form.openingHours}
                      onChange={(e) => setForm((p) => ({ ...p, openingHours: e.target.value }))}
                      variant="default"
                    />
                    <p className="mt-1 text-xs text-text-muted">Formato JSON con días y rangos de hora.</p>
                  </Field>
                </div>
              </Section>
            </>
          ) : (
            /* INDEPENDENT */
            <Section title="Perfil profesional" icon={Stethoscope}>
              <Field label="Zona de atención">
                <Input
                  type="text"
                  placeholder="Ej: Norte de Bogotá, Chapinero, Usaquén"
                  value={form.serviceArea}
                  onChange={(e) => setForm((p) => ({ ...p, serviceArea: e.target.value }))}
                  variant="default"
                  required
                />
              </Field>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Radio de cobertura (km)">
                  <Input
                    type="number"
                    min={0}
                    placeholder="Ej: 10"
                    value={form.coverageRadius}
                    onChange={(e) => setForm((p) => ({ ...p, coverageRadius: e.target.value }))}
                    variant="default"
                  />
                </Field>
                <Field label="Visitas a domicilio">
                  <label className="flex items-center gap-2 cursor-pointer mt-1">
                    <input
                      type="checkbox"
                      checked={form.homeVisits}
                      onChange={(e) => setForm((p) => ({ ...p, homeVisits: e.target.checked }))}
                      className="rounded border-border text-primary-600 focus:ring-primary-600"
                    />
                    <span className="text-sm text-text-primary">Sí, ofrezco visitas a domicilio</span>
                  </label>
                </Field>
              </div>
            </Section>
          )}

          {/* Existing services (read-only) */}
          {isClinic && profile.clinic?.services && profile.clinic.services.length > 0 && (
            <Section title="Servicios registrados" icon={Stethoscope}>
              <div className="flex flex-wrap gap-1.5">
                {profile.clinic.services.map((s) => (
                  <span
                    key={s.id}
                    className="px-2.5 py-1 rounded-full bg-primary-50 text-primary-700 text-xs border border-primary-200 font-medium"
                  >
                    {s.name}
                  </span>
                ))}
              </div>
              <p className="text-xs text-text-muted mt-2">
                Para modificar los servicios, contacta a soporte.
              </p>
            </Section>
          )}

          {/* Feedback */}
          {saveError && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 p-3 rounded-lg bg-danger/8 border border-danger/20 text-danger text-sm"
            >
              <AlertCircle size={16} className="shrink-0" />
              {saveError}
            </motion.div>
          )}
          {saveSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 p-3 rounded-lg bg-success/8 border border-success/20 text-success text-sm"
            >
              <CheckCircle2 size={16} className="shrink-0" />
              ¡Cambios guardados correctamente!
            </motion.div>
          )}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={saving}
            className="w-full gap-2"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {saving ? "Guardando..." : "Guardar cambios"}
          </Button>
        </form>
      </motion.div>
    </div>
  );
}

function Section({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: ElementType;
  children: ReactNode;
}) {
  return (
    <div className="bg-surface rounded-xl border border-border p-5 space-y-4">
      <div className="flex items-center gap-2 pb-1 border-b border-border/60">
        <Icon size={16} className="text-primary-600" />
        <h2 className="text-sm font-semibold text-text-primary">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-text-secondary mb-1.5">{label}</label>
      {children}
    </div>
  );
}
