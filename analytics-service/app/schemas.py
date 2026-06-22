from __future__ import annotations
from pydantic import BaseModel
from typing import Optional


class StatusCount(BaseModel):
    status: str
    count: int


class TrendPoint(BaseModel):
    date: str
    count: int


class RoleCount(BaseModel):
    role: str
    count: int


class SpeciesCount(BaseModel):
    species: str
    count: int


class SpecialtyCount(BaseModel):
    specialty: str
    count: int


class CityCount(BaseModel):
    city: str
    count: int


class ClinicCount(BaseModel):
    clinicId: str
    clinicName: Optional[str]
    count: int


class ProfessionalCount(BaseModel):
    professionalId: str
    professionalName: Optional[str]
    count: int


class PetAppointments(BaseModel):
    petId: str
    petName: Optional[str]
    appointmentCount: int


class ClientAppointments(BaseModel):
    clientId: str
    clientName: Optional[str]
    appointmentCount: int


class TopOwner(BaseModel):
    ownerId: str
    ownerName: Optional[str]
    petCount: int


class BranchCount(BaseModel):
    clinicId: str
    clinicName: Optional[str]
    branchCount: int


class ProfessionalBranch(BaseModel):
    branchId: str
    branchName: Optional[str]
    count: int


# ── Summary / Dashboard ───────────────────────────────────────────────────────

class SummaryResponse(BaseModel):
    totalUsers: int
    totalPets: int
    totalClinics: int
    totalAppointments: int
    completedAppointments: int
    conversionRate: float
    newUsersToday: int
    newAppointmentsToday: int
    appointmentsByStatus: list[StatusCount]
    appointmentsTrend: list[TrendPoint]


# ── Users ─────────────────────────────────────────────────────────────────────

class UserMetricsResponse(BaseModel):
    totalUsers: int
    usersByRole: list[RoleCount]
    verifiedUsers: int
    unverifiedUsers: int
    lockedUsers: int
    newUsersToday: int
    newUsersThisWeek: int
    newUsersThisMonth: int
    userRegistrationTrend: list[TrendPoint]


# ── Appointments ──────────────────────────────────────────────────────────────

class AppointmentMetricsResponse(BaseModel):
    totalAppointments: int
    completedAppointments: int
    cancelledAppointments: int
    completionRate: float
    cancellationRate: float
    appointmentsByStatus: list[StatusCount]
    appointmentsTrend: list[TrendPoint]
    appointmentsByClinic: list[ClinicCount]
    appointmentsByProfessional: list[ProfessionalCount]
    topPetsWithAppointments: list[PetAppointments]
    topClientsWithAppointments: list[ClientAppointments]


# ── Pets ──────────────────────────────────────────────────────────────────────

class PetMetricsResponse(BaseModel):
    totalPets: int
    petsBySpecies: list[SpeciesCount]
    petsWithUpdatedVaccines: int
    petsWithoutUpdatedVaccines: int
    topOwnersWithPets: list[TopOwner]


# ── Clinics ───────────────────────────────────────────────────────────────────

class ClinicMetricsResponse(BaseModel):
    totalClinics: int
    verifiedClinics: int
    unverifiedClinics: int
    totalBranches: int
    branchesByCity: list[CityCount]
    branchesByClinic: list[BranchCount]


# ── Professionals ─────────────────────────────────────────────────────────────

class ProfessionalMetricsResponse(BaseModel):
    totalProfessionals: int
    activeProfessionals: int
    inactiveProfessionals: int
    professionalsBySpecialty: list[SpecialtyCount]
    professionalsByBranch: list[ProfessionalBranch]
