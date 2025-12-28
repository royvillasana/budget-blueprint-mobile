#!/usr/bin/env python3
"""
Test script to check if Tink sandbox accounts have transactions
"""
import requests
import json
import sys

# Your Tink credentials
CLIENT_ID = "b4689ae2e1314d05ba1a7a669a287bdd"
CLIENT_SECRET = "faa6982c88fa40e9b92b5428392e1f0a"

# Example authorization code from your logs (this will be expired, just for testing the flow)
# In production, this would come from the Tink Link callback
# UPDATE THIS with the fresh code from Tink Console after clicking "Open the link"
AUTH_CODE = "337bc1b2c5cf41948986f0e407531162"  # Replace with fresh code from console

def get_client_token():
    """Get client credentials token"""
    url = "https://api.tink.com/api/v1/oauth/token"
    data = {
        'client_id': CLIENT_ID,
        'client_secret': CLIENT_SECRET,
        'grant_type': 'client_credentials',
        'scope': 'authorization:grant,user:create'
    }

    response = requests.post(url, data=data)
    print(f"Client token response: {response.status_code}")

    if response.ok:
        token_data = response.json()
        print(f"Client token obtained: {token_data.get('access_token', 'N/A')[:20]}...")
        return token_data['access_token']
    else:
        print(f"Error: {response.text}")
        return None

def exchange_code(code):
    """Exchange authorization code for user token"""
    url = "https://api.tink.com/api/v1/oauth/token"
    data = {
        'code': code,
        'client_id': CLIENT_ID,
        'client_secret': CLIENT_SECRET,
        'grant_type': 'authorization_code'
    }

    response = requests.post(url, data=data)
    print(f"\nExchange code response: {response.status_code}")

    if response.ok:
        token_data = response.json()
        print(f"User token obtained")
        print(f"Scopes: {token_data.get('scope', 'N/A')}")
        return token_data['access_token']
    else:
        print(f"Error: {response.text}")
        return None

def get_accounts(token):
    """Get user's accounts"""
    url = "https://api.tink.com/api/v1/accounts/list"
    headers = {'Authorization': f'Bearer {token}'}

    response = requests.get(url, headers=headers)
    print(f"\nAccounts response: {response.status_code}")

    if response.ok:
        data = response.json()
        accounts = data.get('accounts', [])
        print(f"Found {len(accounts)} accounts")
        for acc in accounts:
            print(f"  - {acc.get('name')} ({acc.get('id')}): {acc.get('balance')} {acc.get('currencyCode')}")
        return accounts
    else:
        print(f"Error: {response.text}")
        return []

def get_transactions(token, account_ids=None):
    """Get transactions"""
    url = "https://api.tink.com/api/v1/transactions/list"
    if account_ids:
        params = [('accountIdIn', aid) for aid in account_ids]
        url += '?' + '&'.join([f"{k}={v}" for k, v in params])

    headers = {'Authorization': f'Bearer {token}'}

    print(f"\nRequesting transactions from: {url}")
    response = requests.get(url, headers=headers)
    print(f"Transactions response: {response.status_code}")

    if response.ok:
        data = response.json()
        transactions = data.get('transactions', [])
        print(f"Found {len(transactions)} transactions")
        for txn in transactions[:5]:  # Show first 5
            print(f"  - {txn.get('date')}: {txn.get('description')} - {txn.get('amount')} {txn.get('currencyCode')}")
        return transactions
    else:
        print(f"Error: {response.text}")
        error_data = {}
        try:
            error_data = response.json()
            print(f"Error details: {json.dumps(error_data, indent=2)}")
        except:
            pass
        return []

def main():
    print("=== Testing Tink API ===\n")

    # Note: The authorization code from the logs is likely expired
    # This is just to test the flow
    print("NOTE: Using authorization code from logs (likely expired)")
    print("To test properly, you need a fresh code from Tink Link\n")

    # Try to exchange the code
    user_token = exchange_code(AUTH_CODE)

    if user_token:
        # Get accounts
        accounts = get_accounts(user_token)

        if accounts:
            account_ids = [acc['id'] for acc in accounts]
            # Get transactions
            transactions = get_transactions(user_token, account_ids)

            if not transactions:
                print("\n⚠️  No transactions found in sandbox accounts")
                print("This is likely the issue - Tink sandbox Demo Bank accounts may not have test transactions")
        else:
            print("\n⚠️  No accounts found")
    else:
        print("\n⚠️  Could not get user token (code likely expired)")
        print("\nTo test with a fresh token:")
        print("1. Go to your app and click 'Conectar Banco'")
        print("2. Complete the Tink Link flow")
        print("3. From the callback URL, copy the 'code' parameter")
        print("4. Update AUTH_CODE in this script and run again")

if __name__ == "__main__":
    main()
