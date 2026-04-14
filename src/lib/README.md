# lib

Capa de lógica de negocio, acceso a datos y utilidades.
Equivalente a los paquetes `data`, `utils` y `viewmodel` de la app Android.

## Estructura

### `storage/`
Persistencia local en el navegador. Equivalente a Room + DataStore de Android.
- `credentials.ts` — credenciales del usuario (NIF, password, codiMO)
- `historial.ts` — historial de registros enviados y autocompletado de campos
- `borradores.ts` — borradores de formularios guardados localmente

### `api/`
Llamadas a la GTR API de la Generalitat de Catalunya.
Equivalente al `Repositorio.kt` y `ApiInterface.kt` de Android.
- `auth.ts` — validación de credenciales
- `endpoints.ts` — todos los endpoints disponibles de la GTR API

### `bovinos/`
Lógica de negocio específica del módulo bovinos.
Equivalente a los ViewModels y data classes del paquete bovinos en Android.
- `types.ts` — interfaces y tipos
- `constants.ts` — datos estáticos (razas, sexos, aptitudes)
- `nacimiento.ts` — lógica del formulario de nacimiento

### `axios.ts`
Cliente HTTP base. Equivalente al `NetworkModule.kt` con Retrofit en Android.