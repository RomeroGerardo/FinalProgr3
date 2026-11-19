export const CLASE_VIVO_KEY = 'edugestor_clase_en_vivo';
export const CLASE_VIVO_EVENT = 'edugestor:clase-en-vivo';

export interface ClaseEnVivoEstado {
  activa: boolean;
  cursoId: number;
  cursoNombre: string;
  profesorNombre: string;
  pantallaCompartida: boolean;
  startedAt: number;
}

export function leerClaseEnVivo(): ClaseEnVivoEstado | null {
  try {
    const raw = localStorage.getItem(CLASE_VIVO_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ClaseEnVivoEstado;
    if (!parsed?.activa) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function guardarClaseEnVivo(estado: ClaseEnVivoEstado) {
  try {
    localStorage.setItem(CLASE_VIVO_KEY, JSON.stringify(estado));
    window.dispatchEvent(new CustomEvent(CLASE_VIVO_EVENT, { detail: estado }));
  } catch {
    // Fallback silencioso
  }
}

export function finalizarClaseEnVivoStorage() {
  try {
    localStorage.removeItem(CLASE_VIVO_KEY);
    window.dispatchEvent(new CustomEvent(CLASE_VIVO_EVENT, { detail: null }));
  } catch {
    // Fallback silencioso
  }
}

export function escucharClaseEnVivo(onChange: (estado: ClaseEnVivoEstado | null) => void) {
  const actualizar = () => onChange(leerClaseEnVivo());

  const onStorage = (e: StorageEvent) => {
    if (e.key === CLASE_VIVO_KEY) actualizar();
  };

  const onCustom = (e: Event) => {
    const detail = (e as CustomEvent).detail as ClaseEnVivoEstado | null;
    onChange(detail?.activa ? detail : leerClaseEnVivo());
  };

  window.addEventListener('storage', onStorage);
  window.addEventListener(CLASE_VIVO_EVENT, onCustom);
  const intervalo = window.setInterval(actualizar, 1500);
  actualizar();

  return () => {
    window.removeEventListener('storage', onStorage);
    window.removeEventListener(CLASE_VIVO_EVENT, onCustom);
    window.clearInterval(intervalo);
  };
}
