-- First, ensure we have a user to own the clinics
-- This will upsert a system user for demo clinics
DO $$
DECLARE
  demo_user_id TEXT;
BEGIN
  -- Try to find or create a demo clinic owner user
  SELECT id INTO demo_user_id FROM "users" WHERE email = 'demo-clinic-owner@petquotes.com' LIMIT 1;
  
  IF demo_user_id IS NULL THEN
    INSERT INTO "users" (
      id, email, "passwordHash", "fullName", role, "emailVerified", 
      "createdAt", "updatedAt"
    ) VALUES (
      gen_random_uuid()::text,
      'demo-clinic-owner@petquotes.com',
      'hashed_password_demo',
      'Demo Clinic Owner',
      'VETERINARY',
      true,
      NOW(),
      NOW()
    ) RETURNING id INTO demo_user_id;
  END IF;

  -- Insert clinics
  INSERT INTO "clinics" (id, "ownerUserId", name, description, phone, email, rating, "isVerified", "createdAt", "updatedAt")
  VALUES
    ('clinic-1', demo_user_id, 'Animal Hub', 'Equipo clinico con foco en medicina preventiva y bienestar continuo.', '+57 (1) 2345 6789', 'contact@animalhub.com', 4.8, true, NOW(), NOW()),
    ('clinic-2', demo_user_id, 'Clinica Veterinaria Central', 'Servicios completos de atención veterinaria con profesionales certificados.', '+57 (1) 3456 7890', 'contact@clinicacentral.com', 4.6, true, NOW(), NOW()),
    ('clinic-3', demo_user_id, 'Veterinaria Suba', 'Especialistas en medicina felina y canina.', '+57 (1) 4567 8901', 'contact@vetrsuba.com', 4.7, true, NOW(), NOW()),
    ('clinic-4', demo_user_id, 'VetCare Medellin', 'Centro de atención 24/7 con urgencias veterinarias.', '+57 (4) 5678 9012', 'contact@vetcaremde.com', 4.9, true, NOW(), NOW())
  ON CONFLICT (id) DO NOTHING;
END $$;

-- Insert branches for each clinic
INSERT INTO "branches" (id, "clinicId", name, city, address, "latitude", "longitude", "createdAt", "updatedAt")
VALUES
  ('branch-1', 'clinic-1', 'Sede Usaquen', 'Bogota', 'Carrera 7 #120-30', 4.7166, -74.0447, NOW(), NOW()),
  ('branch-2', 'clinic-2', 'Sede Chapinero', 'Bogota', 'Calle 53 #7-45', 4.6997, -74.0395, NOW(), NOW()),
  ('branch-3', 'clinic-3', 'Sede Suba', 'Bogota', 'Carrera 9 #140-50', 4.7731, -74.0525, NOW(), NOW()),
  ('branch-4', 'clinic-4', 'Sede Laureles', 'Medellin', 'Calle 33 #70-80', 6.2442, -75.5898, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert services for each clinic
INSERT INTO "veterinary_services" (id, "clinicId", name, description, price, duration, category, "createdAt", "updatedAt")
VALUES
  ('service-1', 'clinic-1', 'Consulta', 'Consulta general veterinaria', 50000, 30, 'consultation', NOW(), NOW()),
  ('service-2', 'clinic-1', 'Grooming', 'Servicio de aseo y arreglo', 80000, 60, 'grooming', NOW(), NOW()),
  ('service-3', 'clinic-1', 'Urgencias', 'Atención de emergencias', 120000, 30, 'emergency', NOW(), NOW()),
  ('service-4', 'clinic-2', 'Consulta', 'Consulta general veterinaria', 55000, 30, 'consultation', NOW(), NOW()),
  ('service-5', 'clinic-2', 'Vacunación', 'Aplicación de vacunas', 65000, 20, 'vaccination', NOW(), NOW()),
  ('service-6', 'clinic-3', 'Consulta', 'Consulta general veterinaria', 50000, 30, 'consultation', NOW(), NOW()),
  ('service-7', 'clinic-3', 'Odontología', 'Limpieza y cuidado dental', 150000, 45, 'dental', NOW(), NOW()),
  ('service-8', 'clinic-4', 'Consulta 24/7', 'Consulta veterinaria disponible 24 horas', 60000, 30, 'consultation', NOW(), NOW()),
  ('service-9', 'clinic-4', 'Cirugía', 'Procedimientos quirúrgicos', 500000, 120, 'surgery', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert professionals (veterinarians) for each branch
DO $$
DECLARE
  vet_user_id TEXT;
  branch_id TEXT;
BEGIN
  FOR i IN 1..4 LOOP
    SELECT id INTO vet_user_id FROM "users" WHERE email = 'vet-' || i || '@petquotes.com' LIMIT 1;
    
    IF vet_user_id IS NULL THEN
      INSERT INTO "users" (id, email, "passwordHash", "fullName", role, "emailVerified", "createdAt", "updatedAt")
      VALUES (gen_random_uuid()::text, 'vet-' || i || '@petquotes.com', 'hashed_password_vet', 'Dr. Veterinario Clinic ' || i, 'VETERINARY', true, NOW(), NOW())
      RETURNING id INTO vet_user_id;
    END IF;

    SELECT id INTO branch_id FROM "branches" WHERE id = 'branch-' || i;

    INSERT INTO "professionals" (id, "userId", "branchId", "licenseNumber", specialty, "createdAt", "updatedAt")
    VALUES ('prof-' || i, vet_user_id, branch_id, 'LICENSE-' || i, 'General Veterinary', NOW(), NOW())
    ON CONFLICT (id) DO NOTHING;
  END LOOP;
END $$;
