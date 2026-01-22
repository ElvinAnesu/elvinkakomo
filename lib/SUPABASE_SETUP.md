# Supabase Setup Guide

This project uses Supabase with the new publishable and secret keys format.

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
SUPABASE_SECRET_KEY=your-secret-key
```

## Client Usage

### Client-Side (Browser)
Use `supabase` from `lib/supabase.ts` for client-side operations:

```typescript
import { supabase } from '@/lib/supabase';

// Example: Fetch data
const { data, error } = await supabase
  .from('your_table')
  .select('*');
```

### Server-Side (API Routes, Server Components, Server Actions)
Use `supabaseServer` from `lib/supabase-server.ts` for server-side operations:

```typescript
import { supabaseServer } from '@/lib/supabase-server';

// Example: Admin operations
const { data, error } = await supabaseServer
  .from('your_table')
  .select('*');
```

## Key Differences

- **Publishable Key** (`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`): Safe to expose in client-side code
- **Secret Key** (`SUPABASE_SECRET_KEY`): Only use in server-side code, never expose to the client

## Getting Your Keys

1. Go to your Supabase project dashboard
2. Navigate to Settings > API
3. Copy the new format keys:
   - **Publishable Key**: Format `sb_publishable_...`
   - **Secret Key**: Format `sb_...`

Note: The new keys are recommended over the legacy `anon` and `service_role` keys.
