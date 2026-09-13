export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
export const tenantId = process.env.NEXT_PUBLIC_TENANT_ID || '';

export function assertPublicSupabaseEnv() {
  if (!supabaseUrl || !tenantId) {
    throw new Error('Supabase environment variables are not configured.');
  }
}
