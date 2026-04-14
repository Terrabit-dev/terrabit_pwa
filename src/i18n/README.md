# i18n

Archivos de traducción de la aplicación.
Equivalente a los archivos `values/strings.xml` y `values-ca/strings.xml`
de la app Android.

## Archivos

### `es.json`
Strings en castellano. Idioma por defecto de la aplicación.
Equivalente a `res/values/strings.xml`.

### `ca.json`
Strings en catalán.
Equivalente a `res/values-ca/strings.xml`.

## Estructura de claves

Las claves siguen una jerarquía por módulo:

- `login.*` — pantalla de inicio de sesión
- `nav.*` — menú lateral de navegación
- `bovinos.*` — módulo de bovinos
- `porcinos.*` — módulo de porcinos
- `common.*` — textos reutilizables en toda la app

## Uso

Las traducciones se consumen a través del hook `useI18n`:

```typescript
const { t, lang, changeLanguage } = useI18n();
t("bovinos.title") // → "Bovinos" o "Bovins" según el idioma activo
```

## Normas

- Las claves nuevas se añaden siempre en ambos archivos simultáneamente.
- Los nombres propios como "Castellano" y "Català" se dejan hardcodeados
  en el componente, igual que en la app Android.
- Los textos de error de la GTR API se muestran directamente desde la
  respuesta de la API sin traducir, ya que la API ya devuelve el mensaje
  en el idioma del sistema.