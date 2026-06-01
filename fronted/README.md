# EduGestor — Frontend React + Vite

Sistema de gestión de cursos online para la entrega de Ingeniería de Software.

Esta aplicación es el frontend del proyecto. Se conecta al backend de Node.js + Express + MySQL desarrollado por tu compañero Gerardo.

## Estructura principal

- `src/App.tsx`: punto central de la aplicación. Controla sesión, carga de datos y renderiza los dashboards según el rol.
- `src/services/api.ts`: todas las peticiones HTTP van desde aquí. Está preparado para usar el backend real o datos simulados en `localStorage` si el backend no está disponible.
- `src/types.ts`: modelos de datos `Curso`, `Profesor`, `Alumno`, `Inscripcion` y `Usuario`.
- `src/pages/`: páginas por rol y login.
- `src/components/`: componentes reutilizables como `Sidebar`, `Navbar`, `CursoList`, `CursoForm` y `StatCard`.

## Cómo ejecutar el frontend

1. Instala dependencias:
   ```bash
   npm install
   ```
2. Asegúrate de tener el backend de Gerardo ejecutando en `http://localhost:3000`.
3. Ejecuta el frontend:
   ```bash
   npm run dev
   ```
4. Abre el navegador en:
   ```
   http://localhost:5173
   ```

## Login de prueba

Usa las siguientes cuentas simuladas para probar cada rol:

- Admin:
  - Email: `admin@edugestor.com`
  - Contraseña: `admin123`
- Profesor:
  - Email: `maria@prof.com`
  - Contraseña: `prof123`
- Alumno:
  - Email: `lucas@alumno.com`
  - Contraseña: `alu123`

## Backend y conexión

La URL del backend se configura en `.env` con la variable:

```env
VITE_API_URL=http://localhost:3000
```

Si el backend de Gerardo no está activo, la app usa datos de ejemplo guardados en `localStorage`.

## Qué hacer si el backend cambia

Si Gerardo modifica rutas o datos, actualiza solo `src/services/api.ts`. Ahí están todas las funciones para:

- `obtenerCursos()`
- `crearCurso()`
- `editarCurso()`
- `eliminarCurso()`
- `obtenerProfesores()`
- `obtenerAlumnos()`
- `obtenerInscripciones()`
- `inscribirAlumno()`
- `eliminarInscripcion()`

## Qué ya está listo

- Panel Admin con métricas, cursos, profesores, alumnos e inscripciones.
- Panel Profesor con cursos propios, creación/edición/eliminación y módulo preparado para subir materiales.
- Panel Alumno con cursos inscriptos, catálogo disponible y vista de detalles.
- Diseño responsive y moderno con fondo violeta oscuro.

## Recomendaciones finales

- No modifiques el backend.
- Si necesitas login real, reemplaza la lógica en `src/pages/Login.tsx` por un `fetch` al endpoint de auth.
- Si quieres que el backend entregue materiales, extiende `src/pages/ProfesorDashboard.tsx` y conecta la interfaz de subida.
