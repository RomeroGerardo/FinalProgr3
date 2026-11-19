/**
 * Script de carga inicial para `localStorage` del navegador (notas, asistencias y materiales).
 * Uso: abrir http://localhost:5173, abrir DevTools (F12 -> Console), copiar y pegar este archivo, y presionar Enter.
 */
localStorage.setItem(
  "edugestor_notas",
  JSON.stringify({
    "1_Primer Parcial": {
      "1": { nota: "9", observacion: "Excelente desempeño y puntualidad" },
      "2": { nota: "8.5", observacion: "Muy buen dominio de patrones MVC y Repository" },
      "3": { nota: "7", observacion: "Buen análisis de requerimientos" },
      "4": { nota: "5.5", observacion: "Aprobado, reforzar diagramas de secuencia" },
      "6": { nota: "8", observacion: "Gran defensa práctica" }
    },
    "1_Trabajo Práctico Integrador": {
      "1": { nota: "9.5", observacion: "Arquitectura impecable" },
      "2": { nota: "9", observacion: "Excelente integración frontend + backend" },
      "3": { nota: "7.5", observacion: "Buena cobertura de pruebas" }
    },
    "2_Primer Parcial": {
      "2": { nota: "7.5", observacion: "Consultas SQL y normalización correctas" },
      "1": { nota: "8", observacion: "Muy buen modelo relacional" }
    },
    "3_Primer Parcial": {
      "2": { nota: "6", observacion: "Aprobado; mejorar manejo de estado asíncrono" }
    }
  })
);

localStorage.setItem(
  "edugestor_asistencias",
  JSON.stringify({
    "1_2026-11-05": { "1": "presente", "2": "presente", "3": "presente", "4": "ausente", "6": "presente" },
    "1_2026-11-10": { "1": "presente", "2": "presente", "3": "tarde", "4": "presente", "6": "presente" },
    "1_2026-11-12": { "1": "presente", "2": "tarde", "3": "presente", "4": "ausente", "6": "ausente" },
    "1_2026-11-17": { "1": "presente", "2": "presente", "3": "presente", "4": "ausente", "6": "presente" },
    "2_2026-11-07": { "1": "presente", "2": "presente", "4": "presente", "5": "tarde" },
    "2_2026-11-14": { "1": "presente", "2": "presente", "4": "tarde", "5": "presente" },
    "3_2026-11-09": { "2": "presente", "3": "presente", "5": "presente" }
  })
);

localStorage.setItem(
  "edugestor_materiales",
  JSON.stringify([
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
      titulo: "Repositorio de referencia Express + MySQL2",
      tipo: "link",
      url: "https://expressjs.com",
      fechaSubida: "2026-11-14"
    },
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
    {
      id: 106,
      cursoId: 3,
      titulo: "React 19 + TypeScript: Estado y Hooks.pdf",
      tipo: "pdf",
      url: "https://react.dev",
      fechaSubida: "2026-11-11"
    }
  ])
);

location.reload();
