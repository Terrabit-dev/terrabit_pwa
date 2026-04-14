# api/gtr

Proxies de servidor que actúan de intermediarios entre el navegador y la GTR API
de la Generalitat de Catalunya. Son necesarios para evitar errores CORS — el
navegador no puede llamar directamente a dominios externos, pero el servidor
de Next.js sí puede.

Equivalente al `NetworkModule.kt` + `Repositorio.kt` de la app Android.

## Por qué un proxy

Sin proxy:
Navegador → GTR API ❌ (CORS bloqueado)

Con proxy:
Navegador → /api/gtr/* → GTR API ✅

## Estructura

### `proxy/route.ts`
Proxy genérico para todos los endpoints de la GTR API.
- GET  → reenvía query params al endpoint indicado
- PUT  → reenvía el body JSON al endpoint indicado
  Uso: `/api/gtr/proxy?endpoint=WSBovi/AppJava/Bovi/WSEnregistramentNaixement/`

### `identificadors/route.ts`
Proxy específico para validar credenciales en el login.
Endpoint: `WSBovi/AppJava/Bovi/WSIdentificadorsDisponibles/`
Parámetros: `nif`, `passwordMobilitat`, `codiMO`

### `bovinos/listar/route.ts`
Proxy específico para listar animales de una explotación.
Endpoint: `WSEnregistramentIDT/AppJava/WSConsultaAnimals/`
Parámetros: `nif`, `password`, `explotacio`
Nota: este endpoint usa `password` en lugar de `passwordMobilitat`.

## Entorno

La URL base apunta a preproducción por defecto:
`https://preproduccio.aplicacions.agricultura.gencat.cat/gtr/`

Para producción cambiar a:
`https://aplicacions.agricultura.gencat.cat/gtr/`

Idealmente mover la URL base a variable de entorno `NEXT_PUBLIC_GTR_BASE_URL`.