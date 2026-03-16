import { Controller, Get, Module, Query } from "@nestjs/common";

const clinics = [
  { id: "vet-1", name: "Vet Prime", lat: 4.66, lng: -74.05, services: ["consulta", "vacunacion"] },
  { id: "vet-2", name: "Animal Hub", lat: 4.65, lng: -74.06, services: ["consulta", "grooming", "estetica"] }
];

@Controller("search")
class SearchController {
  @Get("veterinaries")
  search(@Query("service") service?: string) {
    if (!service) {
      return clinics;
    }

    return clinics.filter((clinic) => clinic.services.includes(service));
  }
}

@Module({
  controllers: [SearchController]
})
export class AppModule {}