# How to Add Production Cost Column to Your Database

The 400 error when editing a crop with production cost means the `production_cost` column doesn't exist in your Supabase `crops` table yet.

## Quick Fix (2 minutes)

### Step 1: Open Supabase SQL Editor
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project (FarmQ-Dashboard)
3. Click **SQL Editor** (left sidebar)
4. Click **New Query**

### Step 2: Run the Migration
Copy and paste this SQL into the editor:

```sql
ALTER TABLE public.crops 
ADD COLUMN IF NOT EXISTS production_cost DECIMAL(12,2) DEFAULT NULL;
```

Then click **Run** (or Ctrl+Enter).

You should see: `ALTER TABLE` in green ✓

### Step 3: Verify
In Supabase:
1. Go to **Table Editor** (left sidebar)
2. Click on the `crops` table
3. Scroll right and look for the `production_cost` column

---

## What This Does

- Adds a `production_cost` column to store production costs in NAD (Namibian Dollars)
- Type: DECIMAL(12,2) — supports up to 10 digits with 2 decimal places
- Nullable by default (crops can be created without a production cost)

## After Running the Migration

The following features will work:
- ✅ Adding production cost when creating a new crop
- ✅ Editing production cost in the crop edit dialog
- ✅ Displaying production cost on field detail page (N$ format)
- ✅ Viewing harvest dialog with production cost info

## If You Still See the 400 Error

1. **Hard refresh** your browser (Ctrl+Shift+R or Cmd+Shift+R)
2. **Clear browser cache** (or use incognito/private window)
3. Try editing a crop again

If it still fails:
- Check Supabase SQL Editor for any errors when running the migration
- Verify the column exists in Table Editor
- Contact support if the column was created but still gets 400 errors

---

## File References

- Migration script: `scripts/005_production_cost_simple.sql`
- Edit dialog: `components/edit-crop-dialog.tsx`
- Add crop form: `components/add-crop-form.tsx`
- Harvest dialog: `components/harvest-crop-dialog.tsx`
