# Scripts para eliminar datos de diciembre y crear datos ficticios

Estos scripts te ayudarán a eliminar los datos de diciembre del usuario y crear datos ficticios similares a los meses anteriores.

## 🚀 Opción MÁS RÁPIDA: Script Automático (RECOMENDADO)

Usa el script `00_all_in_one_auto.sql` que encuentra el usuario automáticamente:

1. Abre `00_all_in_one_auto.sql`
2. Verifica que el email en la línea 14 sea correcto (`royvillasana@gmail.com`)
3. Copia todo el script
4. Pégalo en Supabase SQL Editor
5. Ejecuta
6. ¡Listo! Verás mensajes de progreso en los "Messages"

Este script busca el user_id automáticamente por email, elimina los datos de diciembre e inserta datos ficticios basados en noviembre. **NO necesitas reemplazar nada manualmente**.

---

## 🔧 Opción alternativa: Script Manual

Si prefieres especificar el user_id manualmente, usa `00_all_in_one.sql`:

1. Abre Supabase SQL Editor
2. Ejecuta: `SELECT id FROM auth.users WHERE email = 'royvillasana@gmail.com';`
3. Copia el user ID
4. Abre `00_all_in_one.sql`
5. Reemplaza las **4 instancias** de `'USER_ID_HERE'` con el user ID real
6. Ejecuta el script completo
7. ¡Listo! Verás un resumen al final

---

## 📋 Opción paso a paso: Scripts individuales

Si prefieres más control y ver cada paso, usa estos scripts:

## Instrucciones de uso

### Paso 1: Encontrar el User ID y ver datos existentes

1. Abre el **Supabase SQL Editor**
2. Ejecuta el script `01_find_user_and_view_data.sql`
3. La primera query te dará el **user ID**. Cópialo.
4. Reemplaza `'USER_ID_HERE'` con el user ID real en las siguientes queries
5. Ejecuta las queries para ver los datos de noviembre (esto te dará una idea de qué datos existen)

### Paso 2: Eliminar datos de diciembre

1. Abre el script `02_delete_december_data.sql`
2. Reemplaza **TODAS** las instancias de `'USER_ID_HERE'` con el user ID real
3. Ejecuta el script completo en Supabase SQL Editor
4. Verifica que los registros fueron eliminados (la última query mostrará 0 en todas las tablas)

### Paso 3: Insertar datos ficticios en diciembre

1. Abre el script `03_insert_december_fictional_data.sql`
2. Reemplaza **TODAS** las instancias de `'USER_ID_HERE'` con el user ID real
3. Ejecuta el script completo en Supabase SQL Editor
4. La última query mostrará cuántos registros fueron insertados

## Qué hacen los scripts

### Script 01 - Ver datos
- Encuentra el user ID por email
- Muestra los datos de noviembre para usarlos como plantilla

### Script 02 - Eliminar
- Elimina todos los ingresos de diciembre
- Elimina todas las transacciones de diciembre
- Elimina todos los presupuestos de diciembre
- Elimina todas las deudas de diciembre
- Verifica que todo fue eliminado

### Script 03 - Insertar datos ficticios
- Copia los datos de noviembre a diciembre
- Ajusta las fechas al mes de diciembre
- Varía los montos de forma aleatoria (±5-10%) para que parezcan datos reales
- Las deudas se reducen ligeramente para simular pagos
- Usa el año actual

## Variaciones aplicadas

Los datos ficticios NO son copias exactas de noviembre:
- **Ingresos**: Varían ±5%
- **Transacciones**: Varían ±10%
- **Presupuesto**: Varían ±5-10%
- **Deudas**: Se reducen ~5% para simular progreso
- **Fechas**: Se mueven exactamente 1 mes adelante

## Notas importantes

⚠️ **IMPORTANTE**: Estos scripts modifican datos en producción. Asegúrate de:
1. Tener un backup de los datos
2. Ejecutar primero en un ambiente de prueba si es posible
3. Verificar el user ID antes de ejecutar DELETE o INSERT

## Limpieza

Una vez que hayas terminado, puedes eliminar la carpeta `temp_scripts/` completa.
