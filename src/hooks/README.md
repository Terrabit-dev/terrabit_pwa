# hooks

Custom hooks de React. Equivalente a los ViewModels de la app Android —
encapsulan lógica de negocio y estado, manteniéndolos separados de la UI.

## Hooks

### `useAuth.ts`
Gestión de sesión y autenticación.
Equivalente a `LoginViewModel.kt`.
- `login()` — valida credenciales contra la GTR API y guarda sesión
- `loginOffline()` — guarda credenciales sin validar (modo sin conexión)
- `logout()` — cierra sesión y redirige al login
- `savedForm` — credenciales guardadas si `rememberMe` estaba activo

### `useI18n.ts`
Internacionalización y cambio de idioma.
Equivalente al sistema de `strings.xml` con `values/` y `values-ca/` de Android.
- `t(key)` — devuelve el string traducido según el idioma activo
- `lang` — idioma actual ("es" o "ca")
- `changeLanguage()` — cambia el idioma y lo persiste en localStorage

### `useListarBovinos.ts`
Carga y filtrado de la lista de animales bovinos.
Equivalente a `ListarBovinosViewModel.kt`.
- `lista` — lista completa de animales cargada de la GTR API
- `cargando` — estado de carga
- `error` — mensaje de error si la petición falla
- `cargarBovinos()` — llama a la GTR API con las credenciales del usuario
- `filtrar()` — filtra la lista por identificador, raza o madre