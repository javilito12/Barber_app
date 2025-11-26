import { createClient } from '@supabase/supabase-js';

// ------------------------------------------------------------------
// CONFIGURACIÓN DE SUPABASE
// ------------------------------------------------------------------

// 1. ESTA ES TU URL (Ya la puse por ti porque la vi en tu mensaje):
const SUPABASE_URL = 'https://mkfogjncgtbwlgbnzcvb.supabase.co';

// 2. AQUI FALTA TU CLAVE "ANON":
// Ve a esa misma pantalla de Supabase, busca "Project API keys".
// Copia la que dice "anon" y "public". Es una cadena larga de letras y números.
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1rZm9nam5jZ3Rid2xnYm56Y3ZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxMTQ5OTksImV4cCI6MjA3OTY5MDk5OX0.PbCcOzkVCaT2KxxVTxr_ZTPh7qLoN7svkhEEu-mC8t8';

// ------------------------------------------------------------------

// Validación para avisarte si olvidaste pegar la clave
if (SUPABASE_ANON_KEY.includes('BORRA_ESTO')) {
  console.error("⛔ ¡ERROR! ⛔");
  console.error("Falta pegar la clave ANON en src/supabaseClient.ts");
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);