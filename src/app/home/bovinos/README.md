# lib/bovinos

Capa de datos y lógica de negocio para el módulo de bovinos.
Equivalente a los `ViewModel`, `Repository` y `data class` de la app Android.

## Archivos

### `types.ts`
Define todas las interfaces y tipos TypeScript del módulo bovinos.
Equivalente a los `data class` de Kotlin.
- `Animal` — estructura de un animal bovino
- `OpcionSelect` — par código/nombre para dropdowns
- `NacimientoForm` — estado del formulario de nacimiento
- `GtrBaseResponse` / `GtrError` — respuestas de la GTR API

### `constants.ts`
Listas de opciones estáticas reutilizables en toda la app.
Equivalente a los `listOf()` hardcodeados en los ViewModels de Android.
- `RAZAS_BOVINAS` — razas bovinas con código y nombre
- `SEXOS` / `SEXOS_CA` — opciones de sexo en castellano y catalán
- `APTITUDES` / `APTITUDES_CA` — opciones de aptitud en castellano y catalán

### `nacimiento.ts`
Lógica de negocio específica del formulario de nacimiento.
Equivalente al `NacimientoViewModel.kt` de Android.
- `validarNacimiento()` — valida los campos obligatorios
- `enviarNacimiento()` — construye el body y llama a la GTR API