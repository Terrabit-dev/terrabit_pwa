# components

Componentes React reutilizables en toda la aplicación.
Equivalente a los componentes `@Composable` compartidos de Android.

## Estructura

### `layout/`
Componentes estructurales que definen el esqueleto de la app.
- `NavDrawer.tsx` — menú lateral deslizante. Equivalente a `NavigationDrawer.kt`
- `TopBar.tsx` — barra superior con título, botón menú y selector de idioma
- `ProtectedRoute.tsx` — guard de rutas autenticadas. Equivalente al chequeo de sesión en `MainActivity`

### `forms/`
Campos de formulario reutilizables con estilo consistente.
Se usan en todas las pantallas de registro (nacimiento, fallecimiento, guías, etc).
- `FormField.tsx` — contenedor con label
- `TextInput.tsx` — campo de texto
- `DateInput.tsx` — campo de fecha
- `SelectInput.tsx` — dropdown de selección