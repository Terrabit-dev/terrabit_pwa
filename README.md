# Terrabit PWA

Progressive Web App complementaria a la app Android de Terrabit. Gestiona explotaciones ganaderas de **bovinos** y **porcinos** integrándose con la API GTR de la Generalitat de Catalunya.

Mantiene paridad funcional y arquitectónica con la app Android (`com.example.terrabit_app`): nacimientos, fallecimientos, corrección de sexo, identificación aplazada, guías de movimiento, solicitudes de material y duplicados.

---
## Equipo 

- Adriano Calderon
- Carlos Vargas
- Yujiang Xia

---

## Stack

- **Next.js 16** (App Router + Turbopack)
- **TypeScript**
- **Tailwind CSS**
- **React 19**

---
## Scripts

```bash
npm install        # instalar dependencias
npm run dev        # servidor de desarrollo en http://localhost:3000
npm run build      # compilar para producción (incluye type-check estricto)
npm run start      # servir la build de producción
npm run lint       # linter
```
---

## PWA

La app es instalable en dispositivos móviles y de escritorio. El manifiesto y el service worker se generan automáticamente por Next.js a partir de los archivos en `public/`.

---