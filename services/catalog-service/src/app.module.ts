import { Controller, Get, Module } from "@nestjs/common";

@Controller("catalog")
class CatalogController {
  @Get("services")
  services() {
    return [
      { id: "consulta", name: "Consulta veterinaria" },
      { id: "grooming", name: "Grooming" },
      { id: "vacunacion", name: "Vacunacion" },
      { id: "estetica", name: "Estetica" }
    ];
  }
}

@Module({
  controllers: [CatalogController]
})
export class AppModule {}