# app/home

Pantallas principales de la aplicación tras el login.
Equivalente al `DrawerScreen` + `NavigationDrawer` de la app Android.

## Estructura

### `layout.tsx`
Layout protegido que envuelve todas las rutas de /home.
Verifica que el usuario está autenticado antes de renderizar.
Incluye el `NavDrawer` y el `DrawerProvider` de contexto.
Equivalente al guard de navegación en `Navigation.kt`.

### `page.tsx`
Redirige automáticamente a `/home/bovinos`.

### `bovinos/`
Módulo de gestión de bovinos.
- `page.tsx` — home con las 4 secciones principales
- `listar/` — listado de animales con búsqueda y detalle
- `gestion/` — formularios de registro (nacimiento, fallecimiento, etc.)
- `guias-movimientos/` — gestión de guías y movimientos
- `material-categoria/` — solicitud de material e identificadores

### `porcinos/`
Módulo de gestión de porcinos.
- `page.tsx` — home porcinos con secciones

### `historial/`
Historial de registros enviados correctamente a la GTR API.
Equivalente a `HistorialScreen.kt`.

### `borradores/`
Formularios guardados localmente a medias.
Equivalente a `BorradoresScreen.kt`.

### `configuracion/`
Ajustes de la cuenta: explotaciones (codiMO), idioma, sesión.
Equivalente a `ConfigurationScreen.kt`.