# Tink Demo Bank Test Credentials

## Spain - Transactions Product

### ✅ User 1 (Successful - Use This)
- **Username**: `u65682682`
- **Password**: `vnu103`
- **Description**: User with multiple accounts
- **Scenario**: Successful connection
- **Use for**: Testing successful bank connection flow

### ❌ User 2 (Authentication Failure)
- **Username**: `u92721594`
- **Password**: `nbs589`
- **Description**: User failed to authenticate
- **Scenario**: Authentication error
- **Use for**: Testing error handling

### ⚠️ User 3 (Temporary Error)
- **Username**: `u91902655`
- **Password**: `jtx720`
- **Description**: Temporary error with Tink
- **Scenario**: Temporary error
- **Use for**: Testing retry logic

---

## How to Test

### 1. Get Authorization Link
Run the create-connection endpoint to get your authorization link:

```bash
curl -X POST https://gqqlqxmiqjzusyivpkzm.supabase.co/functions/v1/tink-create-connection \
  -H "Authorization: Bearer YOUR_USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"redirectUrl":"http://localhost:8080/banking/callback","market":"ES"}'
```

### 2. Open Tink Link
Click the `authorizationLink` from the response

### 3. Select Demo Bank
In Tink Link UI:
1. Search for "Demo Bank"
2. Click on it

### 4. Enter Credentials
Use **User 1** credentials:
- Username: `u65682682`
- Password: `vnu103`

### 5. Authorize
Complete the authorization flow

### 6. Get Redirected
You'll be redirected to: `http://localhost:8080/banking/callback`

---

## Expected Demo Data

When using User 1, you should get:
- ✅ Multiple bank accounts
- ✅ Account balances
- ✅ Transaction history
- ✅ All demo data for testing

---

## Tink Sandbox Limitations

⚠️ **Important**: Tink sandbox has API restrictions:
- Tink Link UI works perfectly ✅
- Backend API endpoints may return limited/empty data ⚠️
- This is normal for sandbox accounts
- Full API access requires production Tink account

## For Development

Use these credentials to:
1. ✅ Test the Tink Link UI integration
2. ✅ Build your frontend components
3. ✅ Design the user flow
4. ✅ Prepare for production deployment

When you upgrade to Tink production:
- All API endpoints will work fully
- Real bank data will be accessible
- No code changes needed!

---

**Your Tink User ID**: `c92e0652c1b54fc98723064bcbc9deee`

Use this ID for all API calls (sync transactions, import, etc.)
