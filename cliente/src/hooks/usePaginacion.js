// =====================================================
// HOOK PERSONALIZADO: usePaginacion
// =====================================================
// Este hook reutilizable implementa la lógica de paginación para
// dividir listas largas de datos en páginas más pequenas, similar
// a como Google divide los resultados de busqueda en páginas de 10.
//
// Que es un Hook personalizado en React?
//   Es una función que empieza con "use" y encapsula lógica
//   reutilizable que incluye otros hooks de React (useState,
//   useMemo, useCallback, etc.). Permite extraer lógica compleja
//   de los componentes y compartirla entre múltiples páginas
//   sin duplicar codigo. Es la alternativa moderna a los mixins
//   y HOCs (Higher-Order Components) de versiones anteriores de React.
//
// Sin este hook, cada página que muestra una tabla (Inventario,
// Clientes, Proveedores, HistorialVentas) tendría que repetir
// toda la lógica de calcular páginas, cortar arrays y navegar.
// Con el hook, cada página solo escribe una línea:
//   const { datosPaginados, ...controles } = usePaginacion(datos, 10);
//
// Parámetros que recibe:
//   - items: array completo de datos (ej: 100 libros)
//   - elementosPorPagina: cuántos mostrar por página (por defecto 10)
//
// Valores que retorna (objeto desestructurable):
//   - datosPaginados: subarray con solo los items de la página actual
//   - paginaActual: número de la página actual (1, 2, 3...)
//   - totalPaginas: cantidad total de páginas calculadas
//   - irAPagina: función para saltar a una página específica
//   - paginaAnterior: función para retroceder una página
//   - paginaSiguiente: función para avanzar una página
//   - resetear: función para volver a la página 1
// =====================================================

// Importamos solo los hooks que necesitamos de React:
//   - useState: para mantener el estado de la página actual
//   - useMemo: para memorizar calculos costosos (cortar el array)
//   - useCallback: para memorizar funciones de navegación
import { useState, useMemo, useCallback } from 'react';


// =====================================================
// FUNCIÓN PRINCIPAL DEL HOOK
// =====================================================
// Un hook personalizado es simplemente una función de JavaScript
// que usa hooks de React internamente. Al llamarla desde un
// componente, React "conecta" los hooks internos al ciclo de
// vida de ese componente. Por eso DEBE llamarse dentro de un
// componente funcional o de otro hook (nunca en funciones normales,
// condicionales o bucles).

const usePaginacion = (items, elementosPorPagina = 10) => {

  // Estado: número de la página actual.
  // Empieza en 1 (no en 0) porque para el usuario las páginas
  // se numeran desde 1 naturalmente.
  const [paginaActual, setPaginaActual] = useState(1);


  // ---------------------------------------------------------
  // CALCULO DEL TOTAL DE PÁGINAS
  // ---------------------------------------------------------
  // Calculamos totalPaginas con useMemo para reutilizarlo en las
  // funciones de navegación sin recalcular cada vez.
  //
  // Math.ceil() redondea hacia ARRIBA. Esto es necesario porque
  // si hay 25 items y mostramos 10 por pagina:
  //   25 / 10 = 2.5 -> Math.ceil(2.5) = 3 páginas
  //   (página 1: 10 items, página 2: 10 items, página 3: 5 items)
  //
  // Math.max(1, ...) garantiza que siempre haya al menos 1 página,
  // incluso si el array está vacio. Sin esto, una lista vacía
  // mostraria 0 páginas, lo cual es confuso en la interfaz.
  const totalPaginas = useMemo(() =>
    Math.max(1, Math.ceil(items.length / elementosPorPagina)),
    [items.length, elementosPorPagina]
  );


  // ---------------------------------------------------------
  // CALCULO DE LOS DATOS DE LA PÁGINA ACTUAL
  // ---------------------------------------------------------
  // useMemo memoriza el resultado de un calculo y solo lo recalcula
  // cuando cambian las dependencias [items, paginaActual, elementosPorPagina].
  // Esto evita recortar el array en cada render del componente padre,
  // lo cual sería ineficiente con listas grandes.
  //
  // La lógica usa Array.slice(inicio, fin) que extrae una porcion
  // del array SIN modificar el original (es "inmutable").
  //
  // Ejemplo con 25 items y 10 por pagina:
  //   Página 1: inicio = (1-1)*10 = 0,  fin = 0+10 = 10  -> items[0..9]
  //   Página 2: inicio = (2-1)*10 = 10, fin = 10+10 = 20  -> items[10..19]
  //   Página 3: inicio = (3-1)*10 = 20, fin = 20+10 = 30  -> items[20..24]
  //
  // NOTA: .slice() no da error si 'fin' excede el largo del array;
  // simplemente retorna hasta donde haya datos. Por eso la página 3
  // retorna 5 items aunque le pedimos hasta el índice 30.
  const datosPaginados = useMemo(() => {
    const inicio = (paginaActual - 1) * elementosPorPagina;
    return items.slice(inicio, inicio + elementosPorPagina);
  }, [items, paginaActual, elementosPorPagina]);


  // ---------------------------------------------------------
  // FUNCIONES DE NAVEGACIÓN ENTRE PÁGINAS
  // ---------------------------------------------------------
  // useCallback memoriza cada función para que React no la recree
  // en cada render. Esto es importante porque estas funciones se
  // pasan como props a los botones de paginación en la UI, y si
  // cambian de referencia en cada render, esos botones se
  // re-renderizan innecesariamente.
  //
  // NOTA sobre el patron de actualización funcional:
  //   setPaginaActual(p => ...) en lugar de setPaginaActual(valor)
  //   La forma funcional recibe el valor ACTUAL del estado como
  //   argumento (p). Esto es más seguro cuando el nuevo valor
  //   depende del anterior, porque React agrupa (batches) las
  //   actualizaciones de estado y el valor "directo" podría
  //   estar desactualizado.

  // Saltar a una página específica (con validación de limites).
  // Si la página solicitada está fuera del rango [1, totalPaginas],
  // mantiene la página actual sin cambios.
  const irAPagina = useCallback((pagina) => {
    setPaginaActual(p => (pagina >= 1 && pagina <= totalPaginas) ? pagina : p);
  }, [totalPaginas]);

  // Retroceder una pagina. Math.max(1, ...) evita que baje de 1.
  const paginaAnterior = useCallback(() =>
    setPaginaActual(p => Math.max(1, p - 1)),
    []
  );

  // Avanzar una pagina. Math.min(totalPaginas, ...) evita que
  // supere la última pagina. Sin esta validación, el usuario
  // podría navegar a páginas inexistentes que mostrarian una
  // tabla vacía con un número de página invalido.
  const paginaSiguiente = useCallback(() =>
    setPaginaActual(p => Math.min(totalPaginas, p + 1)),
    [totalPaginas]
  );

  // Volver a la página 1. Se usa cuando el usuario aplica un
  // filtro de busqueda o cambia criterios de ordenamiento, ya que
  // los resultados filtrados podrian tener menos páginas y la
  // página actual podría quedar fuera de rango.
  const resetear = useCallback(() => setPaginaActual(1), []);


  // ---------------------------------------------------------
  // RETORNO DEL HOOK
  // ---------------------------------------------------------
  // Retornamos un objeto con todos los datos y funciones que el
  // componente necesita. Al ser un objeto, el componente puede
  // desestructurar solo lo que necesite:
  //   const { datosPaginados, totalPaginas } = usePaginacion(datos);
  //
  // Este patron se llama "return object" y es el estándar para
  // hooks que retornan múltiples valores. La alternativa sería
  // retornar un array (como useState), pero con tantos valores
  // un objeto con nombres es más legible y flexible.
  return {
    datosPaginados,
    paginaActual,
    totalPaginas,
    irAPagina,
    paginaAnterior,
    paginaSiguiente,
    resetear
  };
};

// export default para importar sin llaves:
//   import usePaginacion from '../hooks/usePaginacion';
export default usePaginacion;
