# Assets del Proyecto SGI Librería

Esta carpeta contiene todos los recursos estáticos del frontend organizados siguiendo las mejores prácticas de desarrollo.

## Estructura de Carpetas

```
assets/
├── images/          # Imágenes generales (fondos, banners, fotos)
├── icons/           # Íconos de la aplicación (SVG, PNG)
├── logos/           # Logos de la marca SGI Librería
└── react.svg        # (Archivo original de Vite - puede eliminarse)
```

## Guía de Uso

### `/images/` - Imágenes Generales
- **Uso:** Fondos, banners, fotografías de productos, ilustraciones
- **Formatos recomendados:** `.webp`, `.png`, `.jpg`
- **Convención de nombres:** `nombre-descriptivo.extension`
- **Ejemplos:** `fondo-login.webp`, `banner-promocion.png`

### `/icons/` - Íconos
- **Uso:** Íconos de navegación, acciones, estados
- **Formatos recomendados:** `.svg` (preferido), `.png`
- **Convención de nombres:** `icono-[nombre].svg`
- **Ejemplos:** `icono-libro.svg`, `icono-carrito.svg`, `icono-usuario.svg`

### `/logos/` - Logos de Marca
- **Uso:** Logo principal, favicon, variantes del logo
- **Formatos:** `.svg`, `.png` (múltiples tamaños)
- **Convención de nombres:** `logo-[variante]-[tamaño].extension`
- **Ejemplos:** `logo-principal.svg`, `logo-blanco.svg`, `logo-favicon-32.png`

## Cómo Importar Assets en Componentes

```jsx
// Importar imagen desde assets
import fondoLogin from '../assets/images/fondo-login.webp';

// Importar ícono SVG
import IconoLibro from '../assets/icons/icono-libro.svg';

// Importar logo
import LogoPrincipal from '../assets/logos/logo-principal.svg';

// Usar en JSX
function MiComponente() {
  return (
    <div>
      <img src={LogoPrincipal} alt="SGI Librería" />
      <img src={IconoLibro} alt="Libro" className="icono" />
    </div>
  );
}
```

## Carpeta `/public/images/`

Para imágenes que necesitan ser accedidas directamente por URL (sin importar):

```jsx
// Acceso directo desde public/images/
<img src="/images/og-image.png" alt="Preview" />
```

**Usar `/public/` para:**
- Imágenes de Open Graph (redes sociales)
- Favicon y manifest icons
- Imágenes referenciadas en CSS externo

## Buenas Prácticas

1. **Optimizar imágenes** antes de agregarlas (usar herramientas como TinyPNG, Squoosh)
2. **Preferir SVG** para íconos y logos (escalables, livianos)
3. **Usar WebP** para fotografías (mejor compresión que JPG/PNG)
4. **Nombres descriptivos** en minúsculas con guiones
5. **Organizar por función**, no por formato
6. **No duplicar** recursos - usar una sola fuente de verdad
