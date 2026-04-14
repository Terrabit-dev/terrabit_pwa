# components/forms

Componentes de formulario reutilizables en toda la app.
Equivalente a los componentes `@Composable` compartidos de Android
como `CampoTexto`, `DropdownField` o `CustomOutlinedTextField`.

## Componentes

### `FormField.tsx`
Contenedor de campo con etiqueta superior.
Envuelve cualquier input añadiendo el label encima con el estilo estándar.
Uso: `<FormField label="Identificador *"><TextInput .../></FormField>`

### `TextInput.tsx`
Campo de texto estándar con borde redondeado y foco verde.
Props: `value`, `onChange`, `placeholder`, `disabled`

### `DateInput.tsx`
Campo de fecha con selector nativo del navegador/móvil.
En móvil abre el datepicker nativo del sistema operativo.
Props: `value`, `onChange`, `disabled`

### `SelectInput.tsx`
Dropdown de selección con opciones de tipo `OpcionSelect`.
Acepta la lista de opciones tipada desde `lib/bovinos/types.ts`.
Props: `value`, `onChange`, `options`, `placeholder`, `disabled`