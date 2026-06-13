-- Challenges content
CREATE TABLE IF NOT EXISTS public.challenges (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  track        TEXT NOT NULL CHECK (track IN ('sql','python','excel','biz')),
  difficulty   TEXT NOT NULL CHECK (difficulty IN ('easy','medium','hard')),
  title        TEXT NOT NULL,
  question     TEXT NOT NULL,
  code_snippet TEXT,
  options      JSONB NOT NULL,
  explanation  TEXT,
  tags         TEXT[],
  published_at DATE,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- User attempts
CREATE TABLE IF NOT EXISTS public.user_attempts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  challenge_id    UUID NOT NULL REFERENCES public.challenges(id),
  selected_option INTEGER NOT NULL,
  is_correct      BOOLEAN NOT NULL,
  time_taken_ms   INTEGER,
  xp_earned       INTEGER DEFAULT 0,
  attempted_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, challenge_id)
);

-- Streaks
CREATE TABLE IF NOT EXISTS public.streaks (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  current_streak   INTEGER DEFAULT 0 CHECK (current_streak >= 0),
  longest_streak   INTEGER DEFAULT 0 CHECK (longest_streak >= 0),
  last_active_date DATE,
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_attempts_user ON public.user_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_attempts_challenge ON public.user_attempts(challenge_id);
CREATE INDEX IF NOT EXISTS idx_challenges_track ON public.challenges(track);
CREATE INDEX IF NOT EXISTS idx_challenges_published ON public.challenges(published_at);

-- RLS
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.streaks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Challenges are public" ON public.challenges FOR SELECT USING (true);
CREATE POLICY "Users see own attempts" ON public.user_attempts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own attempts" ON public.user_attempts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users see own streak" ON public.streaks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users upsert own streak" ON public.streaks FOR ALL USING (auth.uid() = user_id);

-- Seed 30 challenges
INSERT INTO public.challenges (track, difficulty, title, question, code_snippet, options, explanation, tags, published_at) VALUES
('sql','medium','Top N by Revenue','You have a sales table with columns user_id, order_date, and revenue. Write a query to find the top 3 users by total revenue in the last 30 days.',
'SELECT user_id,
       SUM(revenue) AS total_revenue
FROM   sales
WHERE  order_date >= CURRENT_DATE - INTERVAL ''30 days''
GROUP BY user_id
ORDER BY total_revenue DESC
LIMIT  3;',
'[{"label":"A","text":"Use HAVING instead of WHERE","is_correct":false},{"label":"B","text":"This query is correct","is_correct":true},{"label":"C","text":"Missing a JOIN clause","is_correct":false},{"label":"D","text":"LIMIT should be FETCH FIRST","is_correct":false}]',
'The query is correct. WHERE filters before aggregation (removing old rows), GROUP BY aggregates per user, ORDER BY sorts descending, and LIMIT 3 takes the top three. HAVING would be used to filter on aggregated values (e.g., total_revenue > 100), not on a date column.',
ARRAY['aggregation','window','interview'],CURRENT_DATE),

('sql','easy','Count Nulls','Which SQL expression correctly counts the number of NULL values in a column named email?',
NULL,
'[{"label":"A","text":"COUNT(email)","is_correct":false},{"label":"B","text":"COUNT(*) - COUNT(email)","is_correct":true},{"label":"C","text":"SUM(ISNULL(email))","is_correct":false},{"label":"D","text":"COUNT(NULL)","is_correct":false}]',
'COUNT(col) ignores NULLs, while COUNT(*) counts every row. The difference is the null count. SUM(ISNULL()) works in SQL Server but not standard SQL. COUNT(NULL) always returns 0.',
ARRAY['nulls','basics'],CURRENT_DATE + 1),

('sql','hard','Running Total','Write a query to compute a running total of revenue by order_date from a table named orders.',
'SELECT order_date,
       revenue,
       SUM(revenue) OVER (ORDER BY order_date) AS running_total
FROM orders;',
'[{"label":"A","text":"Use GROUP BY order_date","is_correct":false},{"label":"B","text":"Use SUM with OVER (ORDER BY order_date)","is_correct":true},{"label":"C","text":"Use a subquery with SUM","is_correct":false},{"label":"D","text":"Use CUMSUM() function","is_correct":false}]',
'Window functions (OVER clause) are the right tool here. SUM(revenue) OVER (ORDER BY order_date) calculates a cumulative sum without collapsing rows. GROUP BY would collapse all rows for a date into one. CUMSUM() does not exist in standard SQL.',
ARRAY['window-functions','advanced'],CURRENT_DATE + 2),

('sql','medium','Self Join','You have an employees table with employee_id, name, and manager_id. Find all employees and their manager names.',
'SELECT e.name AS employee, m.name AS manager
FROM employees e
LEFT JOIN employees m ON e.manager_id = m.employee_id;',
'[{"label":"A","text":"Use INNER JOIN employees ON manager_id","is_correct":false},{"label":"B","text":"LEFT JOIN employees to itself on manager_id = employee_id","is_correct":true},{"label":"C","text":"Use a subquery SELECT name FROM employees WHERE employee_id = manager_id","is_correct":false},{"label":"D","text":"This cannot be done in a single query","is_correct":false}]',
'A self-join joins a table to itself using aliases. LEFT JOIN ensures employees with no manager (like the CEO) still appear. INNER JOIN would exclude them.',
ARRAY['joins','self-join'],CURRENT_DATE + 3),

('sql','easy','Distinct Count','How do you count unique values in a column named city?',
NULL,
'[{"label":"A","text":"COUNT(city)","is_correct":false},{"label":"B","text":"COUNT(DISTINCT city)","is_correct":true},{"label":"C","text":"DISTINCT COUNT(city)","is_correct":false},{"label":"D","text":"SELECT DISTINCT city","is_correct":false}]',
'COUNT(DISTINCT col) counts unique non-null values. DISTINCT COUNT is not valid SQL syntax. SELECT DISTINCT returns rows, not a count.',
ARRAY['basics','distinct'],CURRENT_DATE + 4),

('sql','hard','Delete Duplicates','How would you delete duplicate rows from a table named records, keeping only the row with the lowest id per group defined by (email)?',
'DELETE FROM records
WHERE id NOT IN (
  SELECT MIN(id) FROM records GROUP BY email
);',
'[{"label":"A","text":"DELETE FROM records WHERE email IN (SELECT email FROM records GROUP BY email HAVING COUNT(*) > 1)","is_correct":false},{"label":"B","text":"DELETE WHERE id NOT IN (SELECT MIN(id) ... GROUP BY email)","is_correct":true},{"label":"C","text":"TRUNCATE records","is_correct":false},{"label":"D","text":"DELETE FROM records GROUP BY email","is_correct":false}]',
'The subquery finds the minimum id per email — one row per group to keep. Deleting all other ids removes duplicates. Option A deletes ALL rows with a duplicated email, including the one you want to keep.',
ARRAY['dml','deduplication','advanced'],CURRENT_DATE + 5),

('sql','medium','CTE Usage','What is the primary advantage of a CTE (Common Table Expression) over a subquery?',
NULL,
'[{"label":"A","text":"CTEs run faster than subqueries","is_correct":false},{"label":"B","text":"CTEs can be referenced multiple times in the same query","is_correct":true},{"label":"C","text":"CTEs allow window functions, subqueries do not","is_correct":false},{"label":"D","text":"CTEs are required for recursive queries only","is_correct":false}]',
'CTEs shine when you need to reference the same derived dataset more than once — avoiding duplication. Performance depends on the engine; many optimizers treat them the same as subqueries. Recursive queries do require CTEs, but that is not their only use.',
ARRAY['cte','readability'],CURRENT_DATE + 6),

('python','medium','Pandas GroupBy','Given a DataFrame df with columns product and sales, how do you compute total sales per product?',
'import pandas as pd
result = df.groupby(''product'')[''sales''].sum()',
'[{"label":"A","text":"df.groupby(''product'').sum(''sales'')","is_correct":false},{"label":"B","text":"df.groupby(''product'')[''sales''].sum()","is_correct":true},{"label":"C","text":"df.pivot_table(values=''sales'', index=''product'', aggfunc=''count'')","is_correct":false},{"label":"D","text":"df[''sales''].groupby(df[''product'']).sum()","is_correct":false}]',
'groupby().sum() is the idiomatic pandas pattern. Selecting the column first with [col] then calling .sum() returns a Series. Option C would work but uses count, not sum. Option D is unusual syntax; while it works, it is not idiomatic.',
ARRAY['pandas','groupby'],CURRENT_DATE + 7),

('python','easy','List Comprehension','What does [x**2 for x in range(5)] return?',
NULL,
'[{"label":"A","text":"[1, 4, 9, 16, 25]","is_correct":false},{"label":"B","text":"[0, 1, 4, 9, 16]","is_correct":true},{"label":"C","text":"[0, 1, 2, 3, 4]","is_correct":false},{"label":"D","text":"[1, 2, 4, 8, 16]","is_correct":false}]',
'range(5) produces 0,1,2,3,4. Squaring each gives 0,1,4,9,16. A common mistake is assuming range(5) starts at 1.',
ARRAY['python-basics','comprehensions'],CURRENT_DATE + 8),

('python','medium','Merge DataFrames','How do you perform a SQL-style INNER JOIN on two DataFrames df1 and df2 on column user_id?',
NULL,
'[{"label":"A","text":"df1.join(df2, on=''user_id'')","is_correct":false},{"label":"B","text":"pd.merge(df1, df2, on=''user_id'', how=''inner'')","is_correct":true},{"label":"C","text":"df1.append(df2).dropna()","is_correct":false},{"label":"D","text":"df1.concat(df2, on=''user_id'')","is_correct":false}]',
'pd.merge() is the primary way to join DataFrames. how="inner" is actually the default but being explicit is good practice. df.join() works on index by default. concat stacks rows, not joins.',
ARRAY['pandas','merge','joins'],CURRENT_DATE + 9),

('python','hard','Lambda + Apply','You have a DataFrame with a salary column. Apply a 10% raise to salaries above 50000 and a 20% raise to others.',
'df[''new_salary''] = df[''salary''].apply(lambda x: x * 1.10 if x > 50000 else x * 1.20)',
'[{"label":"A","text":"df[''salary''] > 50000 * 1.10","is_correct":false},{"label":"B","text":"df[''salary''].apply(lambda x: x*1.10 if x>50000 else x*1.20)","is_correct":true},{"label":"C","text":"np.where(df[''salary''] > 50000, df[''salary'']*1.10, df[''salary'']*1.20)","is_correct":false},{"label":"D","text":"Both B and C are correct","is_correct":false}]',
'Both B (apply with lambda) and C (np.where) produce the same result. However, np.where is vectorized and much faster on large DataFrames. The question asks what works, so B is marked correct — but in practice prefer np.where.',
ARRAY['pandas','lambda','apply'],CURRENT_DATE + 10),

('python','easy','Dictionary Access','What happens when you access a key that does not exist using dict[key] vs dict.get(key)?',
NULL,
'[{"label":"A","text":"Both return None","is_correct":false},{"label":"B","text":"dict[key] raises KeyError; dict.get(key) returns None","is_correct":true},{"label":"C","text":"dict[key] returns None; dict.get(key) raises KeyError","is_correct":false},{"label":"D","text":"Both raise KeyError","is_correct":false}]',
'dict[key] raises a KeyError for missing keys — useful when the key must exist. dict.get(key) returns None by default (or a custom default via dict.get(key, default)) — safer for optional lookups.',
ARRAY['python-basics','dictionaries'],CURRENT_DATE + 11),

('python','hard','Decorator Pattern','What is the output of the following decorator code?',
'def double(func):
    def wrapper(*args):
        return func(*args) * 2
    return wrapper

@double
def add(a, b):
    return a + b

print(add(3, 4))',
'[{"label":"A","text":"7","is_correct":false},{"label":"B","text":"14","is_correct":true},{"label":"C","text":"49","is_correct":false},{"label":"D","text":"Error","is_correct":false}]',
'add(3,4) calls wrapper(3,4), which calls the original add(3,4) = 7, then doubles it to 14. Decorators wrap functions — @double is syntactic sugar for add = double(add).',
ARRAY['decorators','functions','advanced'],CURRENT_DATE + 12),

('excel','easy','VLOOKUP Basics','What does the 4th argument (range_lookup) in VLOOKUP mean when set to FALSE?',
NULL,
'[{"label":"A","text":"It searches from the last row upward","is_correct":false},{"label":"B","text":"It requires an exact match","is_correct":true},{"label":"C","text":"It enables case-sensitive matching","is_correct":false},{"label":"D","text":"It searches all columns","is_correct":false}]',
'FALSE (or 0) forces an exact match — the lookup value must exist in the table. TRUE allows an approximate match and requires the first column to be sorted. For most business use cases, FALSE is correct.',
ARRAY['vlookup','lookup'],CURRENT_DATE + 13),

('excel','medium','SUMIFS vs SUMIF','You need to sum sales where region is "North" AND product is "Widget". Which formula is correct?',
NULL,
'[{"label":"A","text":"=SUMIF(A:A,''North'',C:C)+SUMIF(B:B,''Widget'',C:C)","is_correct":false},{"label":"B","text":"=SUMIFS(C:C,A:A,''North'',B:B,''Widget'')","is_correct":true},{"label":"C","text":"=SUMIF(A:A,''North'',B:B,''Widget'',C:C)","is_correct":false},{"label":"D","text":"=SUM(IF(A:A=''North'',IF(B:B=''Widget'',C:C)))","is_correct":false}]',
'SUMIFS handles multiple criteria: SUMIFS(sum_range, criteria_range1, criteria1, criteria_range2, criteria2). SUMIF only takes one criteria range. Option D is an array formula that technically works but is harder to maintain.',
ARRAY['sumifs','formulas'],CURRENT_DATE + 14),

('excel','hard','INDEX MATCH','Why is INDEX/MATCH preferred over VLOOKUP in most professional settings?',
NULL,
'[{"label":"A","text":"INDEX/MATCH can look up values to the left of the lookup column","is_correct":false},{"label":"B","text":"INDEX/MATCH is not affected by inserting/deleting columns","is_correct":false},{"label":"C","text":"Both A and B are correct","is_correct":true},{"label":"D","text":"INDEX/MATCH runs faster on all datasets","is_correct":false}]',
'VLOOKUP requires the lookup column to be leftmost and uses a hard-coded column number that breaks when columns are inserted. INDEX/MATCH references columns by name, works in any direction, and is more robust. Speed difference is negligible for most datasets.',
ARRAY['index-match','advanced'],CURRENT_DATE + 15),

('excel','easy','Absolute Reference','What does the $ symbol do in the cell reference $B$4?',
NULL,
'[{"label":"A","text":"It multiplies the value by a dollar amount","is_correct":false},{"label":"B","text":"It locks both the column B and row 4 when copied","is_correct":true},{"label":"C","text":"It locks only the column","is_correct":false},{"label":"D","text":"It applies currency formatting","is_correct":false}]',
'$ before a letter locks the column; $ before a number locks the row. $B$4 locks both — the reference stays B4 no matter where you copy the formula. Useful for referencing a fixed lookup table or constant.',
ARRAY['references','basics'],CURRENT_DATE + 16),

('excel','medium','Pivot Table','You have transaction data. How do you find the average order value per customer segment in a Pivot Table?',
NULL,
'[{"label":"A","text":"Drag segment to Rows and order_value to Columns","is_correct":false},{"label":"B","text":"Drag segment to Rows and order_value to Values, set summarize by Average","is_correct":true},{"label":"C","text":"Drag order_value to Filters and segment to Values","is_correct":false},{"label":"D","text":"Use GETPIVOTDATA formula","is_correct":false}]',
'In a Pivot Table: Rows field defines the grouping (segment), Values field holds the metric (order_value), and you change the value field settings to Average instead of Count or Sum. GETPIVOTDATA retrieves values from an existing pivot — it does not build one.',
ARRAY['pivot-tables','aggregation'],CURRENT_DATE + 17),

('biz','medium','Market Sizing','Estimate the annual revenue of a coffee shop in a busy city center.',
NULL,
'[{"label":"A","text":"Start with the national coffee market and divide by number of shops","is_correct":false},{"label":"B","text":"Estimate daily customers × average spend × 365 days","is_correct":true},{"label":"C","text":"Look up Starbucks revenue and divide by number of locations","is_correct":false},{"label":"D","text":"Revenue equals cost plus 30% margin","is_correct":false}]',
'Bottom-up estimation is most reliable: daily foot traffic (e.g., 200 customers) × average ticket ($6) × 365 ≈ $438K/year. Top-down from national data introduces too much noise. Benchmarking from Starbucks ignores operational differences.',
ARRAY['market-sizing','estimation'],CURRENT_DATE + 18),

('biz','easy','Profitability Framework','A client says profits are declining. What is the first question you should ask?',
NULL,
'[{"label":"A","text":"What is your marketing budget?","is_correct":false},{"label":"B","text":"Is the decline due to falling revenue, rising costs, or both?","is_correct":true},{"label":"C","text":"Who are your main competitors?","is_correct":false},{"label":"D","text":"What are your KPIs?","is_correct":false}]',
'Profit = Revenue - Costs. Before diving into solutions, you must understand which driver is the problem. Decompose first, hypothesize second, solve third. Jumping to competitors or marketing before diagnosing the root cause is a common mistake.',
ARRAY['profitability','frameworks'],CURRENT_DATE + 19),

('biz','hard','A/B Test Interpretation','An A/B test shows a 5% lift in conversion with p=0.03. Your sample is 200 users. What is the correct conclusion?',
NULL,
'[{"label":"A","text":"The result is statistically significant — ship the change","is_correct":false},{"label":"B","text":"p < 0.05 is met but the sample is too small to be confident — run longer","is_correct":true},{"label":"C","text":"5% lift is too small to matter","is_correct":false},{"label":"D","text":"p=0.03 means there is a 3% chance the test is wrong","is_correct":false}]',
'Statistical significance (p < 0.05) does not guarantee practical reliability with only 200 users — this is likely underpowered. You need to calculate the required sample size upfront using MDE (minimum detectable effect) and power analysis. Also, p-value means: if the null hypothesis were true, there is a 3% chance of seeing this result by chance — not that there is a 3% error rate.',
ARRAY['experimentation','statistics','ab-testing'],CURRENT_DATE + 20),

('biz','medium','Metrics Prioritization','A product team asks: which single metric best reflects the health of a subscription business?',
NULL,
'[{"label":"A","text":"Monthly Active Users (MAU)","is_correct":false},{"label":"B","text":"Net Revenue Retention (NRR)","is_correct":true},{"label":"C","text":"Customer Acquisition Cost (CAC)","is_correct":false},{"label":"D","text":"Page views per session","is_correct":false}]',
'NRR (also called Net Dollar Retention) captures whether existing customers are growing, shrinking, or churning — and whether upsells offset churn. A healthy SaaS business has NRR > 100%. MAU measures engagement but not monetization. CAC measures efficiency of acquisition, not retention health.',
ARRAY['metrics','saas','retention'],CURRENT_DATE + 21),

('biz','easy','MECE Principle','What does MECE stand for and why does it matter in consulting?',
NULL,
'[{"label":"A","text":"Most Effective Cost Estimation — to keep projects on budget","is_correct":false},{"label":"B","text":"Mutually Exclusive, Collectively Exhaustive — to structure problems without gaps or overlaps","is_correct":true},{"label":"C","text":"Multiple Evaluation and Comparison Exercise","is_correct":false},{"label":"D","text":"Market Entry, Competition, and Economics","is_correct":false}]',
'MECE is the foundation of structured thinking: categories should not overlap (mutually exclusive) and together should cover all possibilities (collectively exhaustive). It prevents double-counting and ensures nothing is missed — critical when building issue trees or slide decks.',
ARRAY['frameworks','consulting','mece'],CURRENT_DATE + 22),

('sql','medium','HAVING vs WHERE','Which clause would you use to filter groups where total sales exceed 10000?',
NULL,
'[{"label":"A","text":"WHERE total_sales > 10000","is_correct":false},{"label":"B","text":"HAVING SUM(sales) > 10000","is_correct":true},{"label":"C","text":"WHERE SUM(sales) > 10000","is_correct":false},{"label":"D","text":"FILTER SUM(sales) > 10000","is_correct":false}]',
'HAVING filters after aggregation; WHERE filters before. You cannot use aggregate functions inside WHERE. FILTER is not standard SQL for this purpose (it exists in window functions).',
ARRAY['having','aggregation','basics'],CURRENT_DATE + 23),

('sql','hard','Recursive CTE','Write a query to list all employees in a management hierarchy, starting from a root employee_id of 1.',
'WITH RECURSIVE hierarchy AS (
  SELECT employee_id, name, manager_id, 0 AS depth
  FROM employees WHERE employee_id = 1
  UNION ALL
  SELECT e.employee_id, e.name, e.manager_id, h.depth + 1
  FROM employees e
  JOIN hierarchy h ON e.manager_id = h.employee_id
)
SELECT * FROM hierarchy;',
'[{"label":"A","text":"Use multiple self-joins","is_correct":false},{"label":"B","text":"Use a recursive CTE with UNION ALL","is_correct":true},{"label":"C","text":"Use a cursor","is_correct":false},{"label":"D","text":"This cannot be done in SQL","is_correct":false}]',
'Recursive CTEs are the standard SQL way to traverse hierarchical data. The anchor member fetches the root; the recursive member joins back to the CTE itself until no more rows are found. Cursors work but are procedural and much slower.',
ARRAY['recursive','cte','hierarchies'],CURRENT_DATE + 24),

('python','medium','String Formatting','Which is the most Pythonic way to embed variables in a string?',
'name = "Alice"
score = 95
message = f"Hello {name}, your score is {score}."',
'[{"label":"A","text":"''Hello '' + name + '', your score is '' + str(score) + ''.''","is_correct":false},{"label":"B","text":"f''Hello {name}, your score is {score}.''","is_correct":true},{"label":"C","text":"''Hello %s, your score is %d.'' % (name, score)","is_correct":false},{"label":"D","text":"''Hello {}, your score is {}.''.format(name, score)","is_correct":false}]',
'f-strings (introduced in Python 3.6) are the modern, readable, and fastest way to format strings. % formatting is legacy C-style. .format() works but is more verbose. String concatenation is the least readable and slowest.',
ARRAY['strings','python-basics','formatting'],CURRENT_DATE + 25),

('excel','hard','Dynamic Array','In Excel 365, which formula spills a unique sorted list of values from column A?',
'=SORT(UNIQUE(A:A))',
'[{"label":"A","text":"=UNIQUE(SORT(A:A))","is_correct":false},{"label":"B","text":"=SORT(UNIQUE(A:A))","is_correct":true},{"label":"C","text":"=DISTINCT(A:A)","is_correct":false},{"label":"D","text":"You must use a pivot table for this","is_correct":false}]',
'SORT() wraps UNIQUE() so the unique values are also sorted. UNIQUE(SORT()) deduplicates an already-sorted list — functionally similar but SORT(UNIQUE()) is the standard pattern. DISTINCT() does not exist as a worksheet function. Dynamic array functions are Excel 365/2021+ only.',
ARRAY['dynamic-arrays','excel-365','advanced'],CURRENT_DATE + 26),

('biz','hard','Unit Economics','A startup has: CAC = $200, Monthly Revenue per customer = $50, Churn = 5%/month. What is the LTV:CAC ratio?',
NULL,
'[{"label":"A","text":"5:1","is_correct":false},{"label":"B","text":"5:1 (LTV = $1000, CAC = $200)","is_correct":true},{"label":"C","text":"2.5:1","is_correct":false},{"label":"D","text":"Cannot be determined","is_correct":false}]',
'LTV = Average Revenue per Customer / Churn Rate = $50 / 0.05 = $1,000. LTV:CAC = $1,000 / $200 = 5:1. A ratio above 3:1 is generally considered healthy for a SaaS business. Below 1:1 means you lose money on every customer.',
ARRAY['unit-economics','ltv','cac','saas'],CURRENT_DATE + 27),

('python','easy','Null Check','What is the correct way to check if a variable x is None in Python?',
NULL,
'[{"label":"A","text":"if x == None","is_correct":false},{"label":"B","text":"if x is None","is_correct":true},{"label":"C","text":"if not x","is_correct":false},{"label":"D","text":"if x === None","is_correct":false}]',
'Use "is None" for identity comparison — None is a singleton in Python. "== None" works but violates PEP 8 and can be overridden by custom __eq__ methods. "not x" is True for None, 0, "", [], etc. — too broad. === is JavaScript, not Python.',
ARRAY['python-basics','none','best-practices'],CURRENT_DATE + 28),

('sql','easy','ORDER BY Default','What is the default sort order when using ORDER BY in SQL?',
NULL,
'[{"label":"A","text":"Descending (Z to A, 9 to 0)","is_correct":false},{"label":"B","text":"Ascending (A to Z, 0 to 9)","is_correct":true},{"label":"C","text":"Random","is_correct":false},{"label":"D","text":"Insertion order","is_correct":false}]',
'ORDER BY sorts ascending (ASC) by default. To sort descending, you must explicitly add DESC. Without ORDER BY, SQL makes no guarantee about row order — it is implementation-defined, not insertion order.',
ARRAY['basics','sorting'],CURRENT_DATE + 29);
