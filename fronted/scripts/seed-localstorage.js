/**
 * Script de carga inicial para `localStorage` del navegador.
 * Cubre tanto la vista de Profesores (Carlos, Laura, Martín) como la de Alumnos (Luis y compañeros)
 * para los 6 cursos definidos en `BackEnd/db/seed.js`:
 *   - Cursos 1, 2, 4 -> Carlos Romero (`carlos@prof.com`)
 *   - Cursos 3, 6    -> Laura Fernández (`laura@prof.com`)
 *   - Curso 5        -> Martín Gómez (`martin@prof.com`)
 *
 * Uso: abrir http://localhost:5173, abrir DevTools (F12 -> Console), copiar y pegar todo este archivo,
 * y presionar Enter.
 */
localStorage.removeItem("edugestor_clase_en_vivo");

localStorage.setItem(
  "edugestor_notas",
  JSON.stringify({
    // Curso 1: Ingeniería de Software III (Prof. Carlos Romero) — Alumnos: 1, 2, 3, 4, 6
    "1_Primer Parcial": {
      "1": { nota: "9", observacion: "Excelente desempeño y puntualidad" },
      "2": { nota: "8.5", observacion: "Muy buen dominio de patrones MVC y Repository" },
      "3": { nota: "6.5", observacion: "Buen análisis de requerimientos, mejorar casos de borde" },
      "4": { nota: "5.5", observacion: "Aprobado, reforzar diagramas de secuencia" },
      "6": { nota: "8", observacion: "Gran defensa práctica" }
    },
    "1_Segundo Parcial": {
      "1": { nota: "9.5", observacion: "Implementación limpia y bien testeada" },
      "2": { nota: "8", observacion: "Correcta separación en capas" },
      "3": { nota: "6", observacion: "Aprobado; repasar manejo de errores HTTP" },
      "4": { nota: "3.5", observacion: "No alcanzó los objetivos mínimos en pruebas unitarias" },
      "6": { nota: "7", observacion: "Buena resolución general" }
    },
    "1_Trabajo Práctico Integrador": {
      "1": { nota: "9.5", observacion: "Arquitectura impecable" },
      "2": { nota: "9", observacion: "Excelente integración frontend + backend" },
      "3": { nota: "7", observacion: "Buena cobertura de pruebas" },
      "6": { nota: "7.5", observacion: "Cumple con todos los requisitos del MVP" }
    },

    // Curso 2: Bases de Datos Relacionales (Prof. Carlos Romero) — Alumnos: 1, 2, 4, 5
    "2_Primer Parcial": {
      "1": { nota: "8", observacion: "Muy buen modelo relacional" },
      "2": { nota: "7.5", observacion: "Consultas SQL y normalización correctas" },
      "4": { nota: "6", observacion: "Aprobado, practicar subconsultas" },
      "5": { nota: "9", observacion: "Excelente diseño de índices y claves foráneas" }
    },
    "2_Trabajo Práctico Integrador": {
      "1": { nota: "8.5", observacion: "Migraciones bien documentadas" },
      "2": { nota: "8", observacion: "Correcto uso de constraints UNIQUE y ON DELETE CASCADE" },
      "5": { nota: "9", observacion: "Gran optimización de queries" }
    },

    // Curso 3: Programación Web Full-Stack (Prof. Laura Fernández) — Alumnos: 2, 3, 5
    "3_Primer Parcial": {
      "2": { nota: "6", observacion: "Aprobado; mejorar manejo de estado asíncrono" },
      "3": { nota: "8.5", observacion: "Muy buena maquetación en React + Tailwind" },
      "5": { nota: "7.5", observacion: "Buena integración con fetch y TypeScript" }
    },
    "3_Trabajo Práctico Integrador": {
      "2": { nota: "7.5", observacion: "Buen dashboard por roles" },
      "3": { nota: "9", observacion: "Excelente UX y validaciones" }
    },

    // Curso 4: Arquitectura y Patrones de Diseño (Prof. Carlos Romero) — Alumnos: 1, 5, 6
    "4_Primer Parcial": {
      "1": { nota: "9", observacion: "Excelente aplicación de Repository y Singleton" },
      "5": { nota: "8", observacion: "Buena abstracción de servicios" },
      "6": { nota: "5", observacion: "Regular; repasar inversión de dependencias" }
    },

    // Curso 5: Redes y Sistemas Distribuidos (Prof. Martín Gómez) — Alumnos: 3, 4
    "5_Primer Parcial": {
      "3": { nota: "8", observacion: "Buen manejo de protocolos HTTP/REST y TCP" },
      "4": { nota: "6.5", observacion: "Aprobado; reforzar balanceo de carga" }
    },

    // Curso 6: Testing y Calidad de Software (Prof. Laura Fernández) — Alumnos: 1, 4, 6
    "6_Primer Parcial": {
      "1": { nota: "9.5", observacion: "Excelente suite de tests unitarios con Jest" },
      "4": { nota: "7", observacion: "Buenos casos de prueba negativos" },
      "6": { nota: "8.5", observacion: "Muy buen uso de mocks de repositorios" }
    }
  })
);

// Fechas pasadas para poblar historial y cálculo de asistencia (hoy queda libre para tomar lista en vivo)
localStorage.setItem(
  "edugestor_asistencias",
  JSON.stringify({
    // Curso 1: Sofía 100% (Promocionado), Luis 100% (Promocionado), Valentina 100% (Regular), Mateo 25% (Libre), Lucas 75% (Promocionado)
    "1_2026-11-05": { "1": "presente", "2": "presente", "3": "presente", "4": "ausente", "6": "presente" },
    "1_2026-11-10": { "1": "presente", "2": "presente", "3": "tarde", "4": "presente", "6": "presente" },
    "1_2026-11-12": { "1": "presente", "2": "tarde", "3": "presente", "4": "ausente", "6": "ausente" },
    "1_2026-11-17": { "1": "presente", "2": "presente", "3": "presente", "4": "ausente", "6": "presente" },

    // Curso 2: Carlos Romero
    "2_2026-11-07": { "1": "presente", "2": "presente", "4": "presente", "5": "tarde" },
    "2_2026-11-14": { "1": "presente", "2": "presente", "4": "tarde", "5": "presente" },

    // Curso 3: Laura Fernández
    "3_2026-11-09": { "2": "presente", "3": "presente", "5": "presente" },
    "3_2026-11-16": { "2": "tarde", "3": "presente", "5": "presente" },

    // Curso 4: Carlos Romero
    "4_2026-11-11": { "1": "presente", "5": "presente", "6": "tarde" },
    "4_2026-11-15": { "1": "presente", "5": "presente", "6": "presente" },

    // Curso 5: Martín Gómez
    "5_2026-11-12": { "3": "presente", "4": "presente" },
    "5_2026-11-16": { "3": "presente", "4": "ausente" },

    // Curso 6: Laura Fernández
    "6_2026-11-13": { "1": "presente", "4": "presente", "6": "presente" },
    "6_2026-11-17": { "1": "presente", "4": "tarde", "6": "presente" }
  })
);

localStorage.setItem(
  "edugestor_materiales",
  JSON.stringify([
    // Curso 1: Ingeniería de Software III (Carlos Romero)
    {
      id: 101,
      cursoId: 1,
      titulo: "Clase 01 — Arquitectura MVC y Patrón Repository",
      tipo: "video",
      url: "https://youtube.com",
      fechaSubida: "2026-11-05"
    },
    {
      id: 102,
      cursoId: 1,
      titulo: "Guía de Patrones de Diseño y Singleton.pdf",
      tipo: "pdf",
      url: "https://edugestor.com/docs/patrones.pdf",
      fechaSubida: "2026-11-10"
    },
    {
      id: 103,
      cursoId: 1,
      titulo: "Documentación oficial Express 5 + MySQL2",
      tipo: "link",
      url: "https://expressjs.com",
      fechaSubida: "2026-11-14"
    },

    // Curso 2: Bases de Datos Relacionales (Carlos Romero)
    {
      id: 104,
      cursoId: 2,
      titulo: "Normalización 1FN, 2FN y 3FN en MariaDB",
      tipo: "video",
      url: "https://youtube.com",
      fechaSubida: "2026-11-07"
    },
    {
      id: 105,
      cursoId: 2,
      titulo: "Ejercicios de JOINs y Claves Foráneas.pdf",
      tipo: "pdf",
      url: "https://edugestor.com/docs/sql-joins.pdf",
      fechaSubida: "2026-11-12"
    },

    // Curso 3: Programación Web Full-Stack (Laura Fernández)
    {
      id: 106,
      cursoId: 3,
      titulo: "React 19 + TypeScript: Estado y Hooks.pdf",
      tipo: "pdf",
      url: "https://react.dev",
      fechaSubida: "2026-11-11"
    },
    {
      id: 107,
      cursoId: 3,
      titulo: "Clase 02 — Consumo de API REST con fetch y manejo de errores",
      tipo: "video",
      url: "https://youtube.com",
      fechaSubida: "2026-11-15"
    },

    // Curso 4: Arquitectura y Patrones de Diseño (Carlos Romero)
    {
      id: 108,
      cursoId: 4,
      titulo: "Principios SOLID aplicados en Node.js.pdf",
      tipo: "pdf",
      url: "https://edugestor.com/docs/solid-node.pdf",
      fechaSubida: "2026-11-13"
    },

    // Curso 5: Redes y Sistemas Distribuidos (Martín Gómez)
    {
      id: 109,
      cursoId: 5,
      titulo: "Modelo Cliente-Servidor y Códigos de Estado HTTP",
      tipo: "video",
      url: "https://youtube.com",
      fechaSubida: "2026-11-12"
    },

    // Curso 6: Testing y Calidad de Software (Laura Fernández)
    {
      id: 110,
      cursoId: 6,
      titulo: "Pruebas Unitarias y Mocks con Jest.pdf",
      tipo: "pdf",
      url: "https://jestjs.io",
      fechaSubida: "2026-11-14"
    }
  ])
);

location.reload();
