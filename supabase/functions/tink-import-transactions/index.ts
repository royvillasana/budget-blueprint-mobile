import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    const { transactionIds, year, month } = await req.json()

    if (!transactionIds || !Array.isArray(transactionIds) || transactionIds.length === 0) {
      throw new Error('transactionIds array is required')
    }

    if (!year || !month) {
      throw new Error('year and month are required')
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    const supabaseClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } },
    })
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token)

    if (authError || !user) throw new Error('Unauthorized')

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get month suffix for table name
    const monthSuffixes = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']
    const monthSuffix = monthSuffixes[month - 1]

    let importedCount = 0
    let skippedCount = 0
    const errors: string[] = []

    // Fetch all transactions to import
    const { data: transactions, error: fetchError } = await supabase
      .from('bank_transactions')
      .select('*')
      .in('id', transactionIds)
      .eq('user_id', user.id)

    if (fetchError) throw fetchError

    if (!transactions || transactions.length === 0) {
      throw new Error('No transactions found')
    }

    for (const transaction of transactions) {
      try {
        // Skip if already imported
        if (transaction.is_imported) {
          skippedCount++
          continue
        }

        // Auto-categorize the transaction
        const { data: categoryData } = await supabase.rpc('auto_categorize_transaction', {
          merchant_name: transaction.merchant_name,
          description: transaction.description,
          amount: transaction.amount,
        })

        const categoryId = categoryData

        // Determine if this is income or expense based on amount
        const isIncome = transaction.amount > 0

        if (isIncome) {
          // Insert into monthly_income table
          const { error: insertError } = await supabase
            .from(`monthly_income_${monthSuffix}`)
            .insert({
              user_id: user.id,
              category_id: categoryId,
              amount: Math.abs(transaction.amount),
              description: transaction.description || transaction.merchant_name,
              date: transaction.booking_date,
              bank_transaction_id: transaction.id,
            })

          if (insertError) {
            // Check if it's a duplicate
            if (insertError.code === '23505') {
              skippedCount++
            } else {
              errors.push(`Transaction ${transaction.id}: ${insertError.message}`)
            }
          } else {
            importedCount++
          }
        } else {
          // Insert into monthly_transactions table
          const { error: insertError } = await supabase
            .from(`monthly_transactions_${monthSuffix}`)
            .insert({
              user_id: user.id,
              category_id: categoryId,
              amount: Math.abs(transaction.amount),
              description: transaction.description || transaction.merchant_name,
              date: transaction.booking_date,
              bank_transaction_id: transaction.id,
            })

          if (insertError) {
            // Check if it's a duplicate
            if (insertError.code === '23505') {
              skippedCount++
            } else {
              errors.push(`Transaction ${transaction.id}: ${insertError.message}`)
            }
          } else {
            importedCount++
          }
        }

        // Mark as imported if successful
        if (errors.length === 0 || !errors.some(e => e.includes(transaction.id))) {
          await supabase
            .from('bank_transactions')
            .update({ is_imported: true })
            .eq('id', transaction.id)
        }
      } catch (error: any) {
        errors.push(`Transaction ${transaction.id}: ${error.message}`)
      }
    }

    return new Response(JSON.stringify({
      success: true,
      imported: importedCount,
      skipped: skippedCount,
      errors: errors.length > 0 ? errors : null,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    console.error('Error importing transactions:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: error.message === 'Unauthorized' ? 401 : 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
