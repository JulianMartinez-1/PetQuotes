"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function DiagnosticsPage() {
  const [diagnostics, setDiagnostics] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testBackend = async () => {
    setLoading(true);
    setError(null);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';
      
      // Test 1: Health check
      console.log(`Testing: ${baseUrl}/health`);
      const healthRes = await fetch(`${baseUrl}/health`);
      const health = await healthRes.json();
      
      // Test 2: Diagnostics
      console.log(`Testing: ${baseUrl}/health/diagnostics`);
      const diagRes = await fetch(`${baseUrl}/health/diagnostics`);
      const diag = await diagRes.json();
      
      // Test 3: Clinics search
      console.log(`Testing: ${baseUrl}/api/clinics/search?city=Bogota`);
      const clinicsRes = await fetch(`${baseUrl}/api/clinics/search?city=Bogota`);
      const clinicsText = await clinicsRes.text();
      
      let clinics;
      try {
        clinics = JSON.parse(clinicsText);
      } catch {
        clinics = { error: 'Invalid JSON', raw: clinicsText };
      }

      setDiagnostics({
        health,
        diagnostics: diag,
        clinics,
        baseUrl,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    testBackend();
  }, []);

  return (
    <main className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">🔧 Diagnósticos Backend</h1>

      <Button onClick={testBackend} disabled={loading} className="mb-6">
        {loading ? "Probando..." : "Probar de Nuevo"}
      </Button>

      {error && (
        <Card className="p-4 bg-red-500/20 border-red-500 mb-6">
          <h2 className="font-bold text-red-300 mb-2">❌ Error:</h2>
          <pre className="text-sm text-red-200 overflow-auto">{error}</pre>
        </Card>
      )}

      {diagnostics && (
        <div className="space-y-6">
          {/* Health Check */}
          <Card className="p-4">
            <h2 className="font-bold mb-2">✅ Health Check</h2>
            <pre className="text-sm bg-surface p-2 rounded overflow-auto">
              {JSON.stringify(diagnostics.health, null, 2)}
            </pre>
          </Card>

          {/* Backend Diagnostics */}
          <Card className="p-4">
            <h2 className="font-bold mb-2">📋 Backend Diagnostics</h2>
            <pre className="text-sm bg-surface p-2 rounded overflow-auto">
              {JSON.stringify(diagnostics.diagnostics, null, 2)}
            </pre>
          </Card>

          {/* Clinics API */}
          <Card className="p-4">
            <h2 className="font-bold mb-2">🏥 Clinics API Response</h2>
            <pre className="text-sm bg-surface p-2 rounded overflow-auto max-h-96">
              {JSON.stringify(diagnostics.clinics, null, 2)}
            </pre>
          </Card>

          {/* Summary */}
          <Card className="p-4 bg-green-500/20 border-green-500">
            <h2 className="font-bold mb-2">📊 Resumen</h2>
            <ul className="text-sm space-y-1">
              <li>
                Backend URL: <code className="bg-surface px-2 py-1 rounded">{diagnostics.baseUrl}</code>
              </li>
              <li>
                Status: <span className="font-bold text-green-300">✅ Online</span>
              </li>
              {diagnostics.clinics?.clinics ? (
                <li>
                  Clínicas encontradas: <span className="font-bold">{diagnostics.clinics.clinics.length}</span>
                </li>
              ) : (
                <li className="text-yellow-300">
                  ⚠️ No hay clínicas en la respuesta (verifca API key)
                </li>
              )}
            </ul>
          </Card>
        </div>
      )}
    </main>
  );
}
