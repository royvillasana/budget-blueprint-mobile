# Configuración de Tink: Sandbox vs Producción

Este documento explica cómo cambiar entre el entorno de sandbox (pruebas) y producción para la integración con Tink Open Banking.

## Estado Actual

**Modo activo:** SANDBOX (test mode)

La aplicación está configurada para usar:
- Demo Bank (banco de prueba)
- Credenciales de sandbox
- Redirect URIs de localhost permitidos
- Test mode habilitado (`test=true`)

## Variables de Entorno

### TINK_TEST_MODE

Controla si la integración usa el modo sandbox o producción:

- **`true`** (por defecto): Modo SANDBOX
  - Usa Demo Bank
  - Permite localhost en redirect URIs
  - Ideal para desarrollo local

- **`false`**: Modo PRODUCCIÓN
  - Usa bancos reales
  - Requiere redirect URIs de producción (HTTPS)
  - Requiere credenciales de producción de Tink

### Configuración Actual

```bash
TINK_CLIENT_ID=b4689ae2e1314d05ba1a7a669a287bdd  # Sandbox
TINK_CLIENT_SECRET=faa6982c88fa40e9b92b5428392e1f0a  # Sandbox
TINK_TEST_MODE=true  # SANDBOX MODE
```

## Cómo Cambiar a Producción

### 1. Obtener Credenciales de Producción

1. Ve a [Tink Console](https://console.tink.com)
2. Crea una nueva aplicación de **Producción** (o actualiza la existente)
3. Obtén las nuevas credenciales:
   - `TINK_CLIENT_ID` (producción)
   - `TINK_CLIENT_SECRET` (producción)

### 2. Configurar Redirect URIs en Tink Console

Para producción, necesitas registrar redirect URIs con HTTPS:

```
https://tu-dominio.com/banking/callback
```

⚠️ **Importante:** Localhost NO está permitido en producción.

### 3. Actualizar Secrets en Supabase

Ejecuta los siguientes comandos:

```bash
# Actualizar credenciales a producción
supabase secrets set TINK_CLIENT_ID=<tu_client_id_de_produccion>
supabase secrets set TINK_CLIENT_SECRET=<tu_client_secret_de_produccion>

# Cambiar a modo producción
supabase secrets set TINK_TEST_MODE=false
```

### 4. Redesplegar Edge Functions

```bash
supabase functions deploy tink-create-connection
supabase functions deploy tink-exchange-code
```

### 5. Verificar el Cambio

Después de desplegar, verifica en los logs que aparezca:

```
Tink Link mode: PRODUCTION (test=false)
```

## Volver a Sandbox (Desarrollo)

Si necesitas volver al modo sandbox:

```bash
# Restaurar credenciales de sandbox
supabase secrets set TINK_CLIENT_ID=b4689ae2e1314d05ba1a7a669a287bdd
supabase secrets set TINK_CLIENT_SECRET=faa6982c88fa40e9b92b5428392e1f0a

# Volver a test mode
supabase secrets set TINK_TEST_MODE=true

# Redesplegar
supabase functions deploy tink-create-connection
supabase functions deploy tink-exchange-code
```

## Validar Transacciones antes de Producción

### Opción 1: Testing Local con Sandbox (Actual)
- ✅ Cuentas y saldos funcionan
- ✅ Conexión de bancos funciona
- ❌ Transacciones no disponibles (Demo Bank no tiene datos)

### Opción 2: Testing con Cuenta Real en Staging

Antes del despliegue final, puedes:

1. Desplegar a un entorno de **staging** (no localhost)
2. Configurar producción en staging
3. Conectar tu cuenta bancaria española real
4. Validar que las transacciones se importan correctamente
5. Desconectar el banco después de validar

### Opción 3: Confiar en el Código

Dado que:
- ✅ La autenticación funciona
- ✅ Las cuentas se sincronizan
- ✅ Los saldos se obtienen correctamente
- ✅ El código de transacciones tiene manejo de errores robusto

Es razonable confiar que las transacciones funcionarán en producción cuando haya datos disponibles.

## Diferencias entre Sandbox y Producción

| Característica | Sandbox | Producción |
|----------------|---------|------------|
| Bancos disponibles | Demo Bank únicamente | Bancos reales (BBVA, Santander, etc.) |
| Redirect URIs | Localhost permitido | Solo HTTPS |
| Datos de transacciones | ❌ No disponibles | ✅ Datos reales |
| Cuentas y saldos | ✅ Datos de prueba | ✅ Datos reales |
| Credenciales de prueba | u65682682 / vnu103 | Credenciales bancarias reales |
| `test` parameter | `true` | `false` |

## Monitoreo en Producción

Una vez en producción, monitorea:

```bash
# Ver logs de la función
supabase functions logs tink-create-connection --limit 50
supabase functions logs tink-exchange-code --limit 50
```

Busca:
- ✅ `Tink Link mode: PRODUCTION (test=false)`
- ✅ `Found X transactions`
- ❌ Errores 404 (indicarían problemas con la API)

## Soporte

Para problemas con Tink:
- [Documentación de Tink](https://docs.tink.com)
- [Tink Console](https://console.tink.com)
- [Tink Support](https://tink.com/support)

## Notas de Seguridad

⚠️ **Importante:**
- NUNCA compartas tus credenciales de producción
- Los `CLIENT_SECRET` deben mantenerse privados
- Usa variables de entorno para todas las credenciales
- Revisa los permisos de acceso regularmente
