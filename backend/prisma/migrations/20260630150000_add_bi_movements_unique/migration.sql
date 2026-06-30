-- Deduplicate bi_movements: keep only one row per (date, functional_id, kind)
-- Keeps the most recently created row (or the one with the highest UUID if tied)
DELETE t1
FROM bi_movements t1
INNER JOIN bi_movements t2
  ON t1.date = t2.date
  AND t1.functional_id = t2.functional_id
  AND t1.kind = t2.kind
  AND (t1.created_at < t2.created_at OR (t1.created_at = t2.created_at AND t1.id < t2.id));

-- Create unique index now that duplicates are removed
CREATE UNIQUE INDEX bi_movements_date_functional_id_kind_key
  ON bi_movements (date, functional_id, kind);
