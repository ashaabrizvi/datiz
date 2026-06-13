-- Seed challenges (safe to re-run — skips duplicates by title)
INSERT INTO public.challenges (track, difficulty, title, question, code_snippet, options, explanation, tags, published_at)
SELECT * FROM (VALUES

('sql','medium','Top N by Revenue',
$$You have a sales table with columns user_id, order_date, and revenue. Write a query to find the top 3 users by total revenue in the last 30 days.$$,
$$SELECT user_id,
       SUM(revenue) AS total_revenue
FROM   sales
WHERE  order_date >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY user_id
ORDER BY total_revenue DESC
LIMIT  3;$$,
'[{"label":"A","text":"Use HAVING instead of WHERE","is_correct":false},{"label":"B","text":"This query is correct","is_correct":true},{"label":"C","text":"Missing a JOIN clause","is_correct":false},{"label":"D","text":"LIMIT should be FETCH FIRST","is_correct":false}]'::jsonb,
$$The query is correct. WHERE filters before aggregation (removing old rows), GROUP BY aggregates per user, ORDER BY sorts descending, and LIMIT 3 takes the top three. HAVING would be used to filter on aggregated values, not on a date column.$$,
ARRAY['aggregation','window','interview'], CURRENT_DATE),

('sql','easy','Count Nulls',
$$Which SQL expression correctly counts the number of NULL values in a column named email?$$,
NULL,
'[{"label":"A","text":"COUNT(email)","is_correct":false},{"label":"B","text":"COUNT(*) - COUNT(email)","is_correct":true},{"label":"C","text":"SUM(ISNULL(email))","is_correct":false},{"label":"D","text":"COUNT(NULL)","is_correct":false}]'::jsonb,
$$COUNT(col) ignores NULLs, while COUNT(*) counts every row. The difference is the null count. SUM(ISNULL()) works in SQL Server but not standard SQL. COUNT(NULL) always returns 0.$$,
ARRAY['nulls','basics'], CURRENT_DATE + 1),

('sql','hard','Running Total',
$$Write a query to compute a running total of revenue by order_date from a table named orders.$$,
$$SELECT order_date,
       revenue,
       SUM(revenue) OVER (ORDER BY order_date) AS running_total
FROM orders;$$,
'[{"label":"A","text":"Use GROUP BY order_date","is_correct":false},{"label":"B","text":"Use SUM with OVER (ORDER BY order_date)","is_correct":true},{"label":"C","text":"Use a subquery with SUM","is_correct":false},{"label":"D","text":"Use CUMSUM() function","is_correct":false}]'::jsonb,
$$Window functions (OVER clause) are the right tool here. SUM(revenue) OVER (ORDER BY order_date) calculates a cumulative sum without collapsing rows. CUMSUM() does not exist in standard SQL.$$,
ARRAY['window-functions','advanced'], CURRENT_DATE + 2),

('sql','medium','Self Join',
$$You have an employees table with employee_id, name, and manager_id. Find all employees and their manager names.$$,
$$SELECT e.name AS employee, m.name AS manager
FROM employees e
LEFT JOIN employees m ON e.manager_id = m.employee_id;$$,
'[{"label":"A","text":"Use INNER JOIN employees ON manager_id","is_correct":false},{"label":"B","text":"LEFT JOIN employees to itself on manager_id = employee_id","is_correct":true},{"label":"C","text":"Use a subquery SELECT name FROM employees WHERE employee_id = manager_id","is_correct":false},{"label":"D","text":"This cannot be done in a single query","is_correct":false}]'::jsonb,
$$A self-join joins a table to itself using aliases. LEFT JOIN ensures employees with no manager still appear. INNER JOIN would exclude them.$$,
ARRAY['joins','self-join'], CURRENT_DATE + 3),

('sql','easy','Distinct Count',
$$How do you count unique values in a column named city?$$,
NULL,
'[{"label":"A","text":"COUNT(city)","is_correct":false},{"label":"B","text":"COUNT(DISTINCT city)","is_correct":true},{"label":"C","text":"DISTINCT COUNT(city)","is_correct":false},{"label":"D","text":"SELECT DISTINCT city","is_correct":false}]'::jsonb,
$$COUNT(DISTINCT col) counts unique non-null values. DISTINCT COUNT is not valid SQL syntax. SELECT DISTINCT returns rows, not a count.$$,
ARRAY['basics','distinct'], CURRENT_DATE + 4),

('sql','hard','Delete Duplicates',
$$How would you delete duplicate rows from a table named records, keeping only the row with the lowest id per email?$$,
$$DELETE FROM records
WHERE id NOT IN (
  SELECT MIN(id) FROM records GROUP BY email
);$$,
'[{"label":"A","text":"DELETE FROM records WHERE email IN (SELECT email FROM records GROUP BY email HAVING COUNT(*) > 1)","is_correct":false},{"label":"B","text":"DELETE WHERE id NOT IN (SELECT MIN(id) ... GROUP BY email)","is_correct":true},{"label":"C","text":"TRUNCATE records","is_correct":false},{"label":"D","text":"DELETE FROM records GROUP BY email","is_correct":false}]'::jsonb,
$$The subquery finds the minimum id per email. Deleting all other ids removes duplicates. Option A deletes ALL rows with a duplicated email, including the one you want to keep.$$,
ARRAY['dml','deduplication','advanced'], CURRENT_DATE + 5),

('sql','medium','CTE Usage',
$$What is the primary advantage of a CTE over a subquery?$$,
NULL,
'[{"label":"A","text":"CTEs run faster than subqueries","is_correct":false},{"label":"B","text":"CTEs can be referenced multiple times in the same query","is_correct":true},{"label":"C","text":"CTEs allow window functions, subqueries do not","is_correct":false},{"label":"D","text":"CTEs are required for recursive queries only","is_correct":false}]'::jsonb,
$$CTEs shine when you need to reference the same derived dataset more than once. Performance depends on the engine. Recursive queries do require CTEs, but that is not their only use.$$,
ARRAY['cte','readability'], CURRENT_DATE + 6),

('sql','medium','HAVING vs WHERE',
$$Which clause would you use to filter groups where total sales exceed 10000?$$,
NULL,
'[{"label":"A","text":"WHERE total_sales > 10000","is_correct":false},{"label":"B","text":"HAVING SUM(sales) > 10000","is_correct":true},{"label":"C","text":"WHERE SUM(sales) > 10000","is_correct":false},{"label":"D","text":"FILTER SUM(sales) > 10000","is_correct":false}]'::jsonb,
$$HAVING filters after aggregation; WHERE filters before. You cannot use aggregate functions inside WHERE.$$,
ARRAY['having','aggregation','basics'], CURRENT_DATE + 7),

('sql','easy','ORDER BY Default',
$$What is the default sort order when using ORDER BY in SQL?$$,
NULL,
'[{"label":"A","text":"Descending (Z to A, 9 to 0)","is_correct":false},{"label":"B","text":"Ascending (A to Z, 0 to 9)","is_correct":true},{"label":"C","text":"Random","is_correct":false},{"label":"D","text":"Insertion order","is_correct":false}]'::jsonb,
$$ORDER BY sorts ascending (ASC) by default. To sort descending, you must explicitly add DESC. Without ORDER BY, SQL makes no guarantee about row order.$$,
ARRAY['basics','sorting'], CURRENT_DATE + 8),

('sql','hard','Recursive CTE',
$$How do you list all employees in a management hierarchy starting from root employee_id = 1?$$,
$$WITH RECURSIVE hierarchy AS (
  SELECT employee_id, name, manager_id, 0 AS depth
  FROM employees WHERE employee_id = 1
  UNION ALL
  SELECT e.employee_id, e.name, e.manager_id, h.depth + 1
  FROM employees e
  JOIN hierarchy h ON e.manager_id = h.employee_id
)
SELECT * FROM hierarchy;$$,
'[{"label":"A","text":"Use multiple self-joins","is_correct":false},{"label":"B","text":"Use a recursive CTE with UNION ALL","is_correct":true},{"label":"C","text":"Use a cursor","is_correct":false},{"label":"D","text":"This cannot be done in SQL","is_correct":false}]'::jsonb,
$$Recursive CTEs are the standard SQL way to traverse hierarchical data. The anchor member fetches the root; the recursive member joins back to the CTE itself until no more rows are found.$$,
ARRAY['recursive','cte','hierarchies'], CURRENT_DATE + 9),

('python','medium','Pandas GroupBy',
$$Given a DataFrame df with columns product and sales, how do you compute total sales per product?$$,
$$import pandas as pd
result = df.groupby("product")["sales"].sum()$$,
'[{"label":"A","text":"df.groupby(product).sum(sales)","is_correct":false},{"label":"B","text":"df.groupby(\"product\")[\"sales\"].sum()","is_correct":true},{"label":"C","text":"df.pivot_table(values=\"sales\", index=\"product\", aggfunc=\"count\")","is_correct":false},{"label":"D","text":"df[\"sales\"].groupby(df[\"product\"]).sum()","is_correct":false}]'::jsonb,
$$groupby().sum() is the idiomatic pandas pattern. Option C would work but uses count, not sum.$$,
ARRAY['pandas','groupby'], CURRENT_DATE + 10),

('python','easy','List Comprehension',
$$What does [x**2 for x in range(5)] return?$$,
NULL,
'[{"label":"A","text":"[1, 4, 9, 16, 25]","is_correct":false},{"label":"B","text":"[0, 1, 4, 9, 16]","is_correct":true},{"label":"C","text":"[0, 1, 2, 3, 4]","is_correct":false},{"label":"D","text":"[1, 2, 4, 8, 16]","is_correct":false}]'::jsonb,
$$range(5) produces 0,1,2,3,4. Squaring each gives 0,1,4,9,16. A common mistake is assuming range(5) starts at 1.$$,
ARRAY['python-basics','comprehensions'], CURRENT_DATE + 11),

('python','medium','Merge DataFrames',
$$How do you perform a SQL-style INNER JOIN on two DataFrames df1 and df2 on column user_id?$$,
NULL,
'[{"label":"A","text":"df1.join(df2, on=\"user_id\")","is_correct":false},{"label":"B","text":"pd.merge(df1, df2, on=\"user_id\", how=\"inner\")","is_correct":true},{"label":"C","text":"df1.append(df2).dropna()","is_correct":false},{"label":"D","text":"df1.concat(df2, on=\"user_id\")","is_correct":false}]'::jsonb,
$$pd.merge() is the primary way to join DataFrames. df.join() works on index by default. concat stacks rows, not joins.$$,
ARRAY['pandas','merge','joins'], CURRENT_DATE + 12),

('python','easy','Null Check',
$$What is the correct way to check if a variable x is None in Python?$$,
NULL,
'[{"label":"A","text":"if x == None","is_correct":false},{"label":"B","text":"if x is None","is_correct":true},{"label":"C","text":"if not x","is_correct":false},{"label":"D","text":"if x === None","is_correct":false}]'::jsonb,
$$Use "is None" for identity comparison. None is a singleton in Python. "not x" is True for None, 0, empty string, etc. which is too broad. === is JavaScript, not Python.$$,
ARRAY['python-basics','none','best-practices'], CURRENT_DATE + 13),

('python','easy','String Formatting',
$$Which is the most Pythonic way to embed variables in a string?$$,
$$name = "Alice"
score = 95
message = f"Hello {name}, your score is {score}."$$,
'[{"label":"A","text":"Concatenation with + operator","is_correct":false},{"label":"B","text":"f-strings: f\"Hello {name}\"","is_correct":true},{"label":"C","text":"% formatting: \"Hello %s\" % name","is_correct":false},{"label":"D","text":".format(): \"Hello {}\".format(name)","is_correct":false}]'::jsonb,
$$f-strings (Python 3.6+) are the modern, readable, and fastest way to format strings. % formatting is legacy C-style. .format() works but is more verbose.$$,
ARRAY['strings','python-basics','formatting'], CURRENT_DATE + 14),

('excel','easy','VLOOKUP Basics',
$$What does the 4th argument (range_lookup) in VLOOKUP mean when set to FALSE?$$,
NULL,
'[{"label":"A","text":"It searches from the last row upward","is_correct":false},{"label":"B","text":"It requires an exact match","is_correct":true},{"label":"C","text":"It enables case-sensitive matching","is_correct":false},{"label":"D","text":"It searches all columns","is_correct":false}]'::jsonb,
$$FALSE forces an exact match. TRUE allows an approximate match and requires the first column to be sorted. For most business use cases, FALSE is correct.$$,
ARRAY['vlookup','lookup'], CURRENT_DATE + 15),

('excel','medium','SUMIFS vs SUMIF',
$$You need to sum sales where region is North AND product is Widget. Which formula is correct?$$,
NULL,
'[{"label":"A","text":"=SUMIF(A:A,\"North\",C:C)+SUMIF(B:B,\"Widget\",C:C)","is_correct":false},{"label":"B","text":"=SUMIFS(C:C,A:A,\"North\",B:B,\"Widget\")","is_correct":true},{"label":"C","text":"=SUMIF(A:A,\"North\",B:B,\"Widget\",C:C)","is_correct":false},{"label":"D","text":"=SUM(IF(A:A=\"North\",IF(B:B=\"Widget\",C:C)))","is_correct":false}]'::jsonb,
$$SUMIFS handles multiple criteria: SUMIFS(sum_range, criteria_range1, criteria1, ...). SUMIF only takes one criteria range.$$,
ARRAY['sumifs','formulas'], CURRENT_DATE + 16),

('excel','hard','INDEX MATCH',
$$Why is INDEX/MATCH preferred over VLOOKUP in professional settings?$$,
NULL,
'[{"label":"A","text":"INDEX/MATCH can look up values to the left of the lookup column","is_correct":false},{"label":"B","text":"INDEX/MATCH is not affected by inserting or deleting columns","is_correct":false},{"label":"C","text":"Both A and B are correct","is_correct":true},{"label":"D","text":"INDEX/MATCH runs faster on all datasets","is_correct":false}]'::jsonb,
$$VLOOKUP requires the lookup column to be leftmost and uses a hard-coded column number that breaks when columns are inserted. INDEX/MATCH works in any direction and is more robust.$$,
ARRAY['index-match','advanced'], CURRENT_DATE + 17),

('excel','easy','Absolute Reference',
$$What does the $ symbol do in the cell reference $B$4?$$,
NULL,
'[{"label":"A","text":"It multiplies the value by a dollar amount","is_correct":false},{"label":"B","text":"It locks both the column B and row 4 when copied","is_correct":true},{"label":"C","text":"It locks only the column","is_correct":false},{"label":"D","text":"It applies currency formatting","is_correct":false}]'::jsonb,
$$$ before a letter locks the column; $ before a number locks the row. $B$4 locks both so the reference stays B4 no matter where you copy the formula.$$,
ARRAY['references','basics'], CURRENT_DATE + 18),

('excel','medium','Pivot Table',
$$How do you find the average order value per customer segment in a Pivot Table?$$,
NULL,
'[{"label":"A","text":"Drag segment to Rows and order_value to Columns","is_correct":false},{"label":"B","text":"Drag segment to Rows and order_value to Values, set summarize by Average","is_correct":true},{"label":"C","text":"Drag order_value to Filters and segment to Values","is_correct":false},{"label":"D","text":"Use GETPIVOTDATA formula","is_correct":false}]'::jsonb,
$$In a Pivot Table: Rows = grouping field, Values = metric field. Change the value field settings to Average. GETPIVOTDATA retrieves values from an existing pivot, it does not build one.$$,
ARRAY['pivot-tables','aggregation'], CURRENT_DATE + 19),

('biz','medium','Market Sizing',
$$Estimate the annual revenue of a coffee shop in a busy city center.$$,
NULL,
'[{"label":"A","text":"Start with national coffee market and divide by number of shops","is_correct":false},{"label":"B","text":"Estimate daily customers x average spend x 365 days","is_correct":true},{"label":"C","text":"Look up Starbucks revenue and divide by number of locations","is_correct":false},{"label":"D","text":"Revenue equals cost plus 30% margin","is_correct":false}]'::jsonb,
$$Bottom-up estimation is most reliable: daily foot traffic (200 customers) x average ticket ($6) x 365 = $438K/year. Top-down from national data introduces too much noise.$$,
ARRAY['market-sizing','estimation'], CURRENT_DATE + 20),

('biz','easy','Profitability Framework',
$$A client says profits are declining. What is the first question you should ask?$$,
NULL,
'[{"label":"A","text":"What is your marketing budget?","is_correct":false},{"label":"B","text":"Is the decline due to falling revenue, rising costs, or both?","is_correct":true},{"label":"C","text":"Who are your main competitors?","is_correct":false},{"label":"D","text":"What are your KPIs?","is_correct":false}]'::jsonb,
$$Profit = Revenue - Costs. Before diving into solutions, understand which driver is the problem. Decompose first, hypothesize second, solve third.$$,
ARRAY['profitability','frameworks'], CURRENT_DATE + 21),

('biz','hard','A/B Test Interpretation',
$$An A/B test shows 5% lift in conversion with p=0.03. Sample is 200 users. What is the correct conclusion?$$,
NULL,
'[{"label":"A","text":"The result is statistically significant — ship the change","is_correct":false},{"label":"B","text":"p < 0.05 is met but the sample is too small — run longer","is_correct":true},{"label":"C","text":"5% lift is too small to matter","is_correct":false},{"label":"D","text":"p=0.03 means there is a 3% chance the test is wrong","is_correct":false}]'::jsonb,
$$Statistical significance does not guarantee reliability with only 200 users. Calculate required sample size upfront using MDE and power analysis. p-value means: if null hypothesis were true, there is a 3% chance of seeing this result by chance.$$,
ARRAY['experimentation','statistics','ab-testing'], CURRENT_DATE + 22),

('biz','medium','Metrics Prioritization',
$$Which single metric best reflects the health of a subscription business?$$,
NULL,
'[{"label":"A","text":"Monthly Active Users (MAU)","is_correct":false},{"label":"B","text":"Net Revenue Retention (NRR)","is_correct":true},{"label":"C","text":"Customer Acquisition Cost (CAC)","is_correct":false},{"label":"D","text":"Page views per session","is_correct":false}]'::jsonb,
$$NRR captures whether existing customers are growing, shrinking, or churning. A healthy SaaS business has NRR above 100%. MAU measures engagement but not monetization.$$,
ARRAY['metrics','saas','retention'], CURRENT_DATE + 23),

('biz','easy','MECE Principle',
$$What does MECE stand for and why does it matter in consulting?$$,
NULL,
'[{"label":"A","text":"Most Effective Cost Estimation","is_correct":false},{"label":"B","text":"Mutually Exclusive, Collectively Exhaustive — structure problems without gaps or overlaps","is_correct":true},{"label":"C","text":"Multiple Evaluation and Comparison Exercise","is_correct":false},{"label":"D","text":"Market Entry, Competition, and Economics","is_correct":false}]'::jsonb,
$$MECE is the foundation of structured thinking: categories should not overlap and together should cover all possibilities. It prevents double-counting and ensures nothing is missed.$$,
ARRAY['frameworks','consulting','mece'], CURRENT_DATE + 24),

('biz','hard','Unit Economics',
$$A startup has: CAC = $200, Monthly Revenue per customer = $50, Churn = 5%/month. What is the LTV:CAC ratio?$$,
NULL,
'[{"label":"A","text":"2.5:1","is_correct":false},{"label":"B","text":"5:1 (LTV = $1000, CAC = $200)","is_correct":true},{"label":"C","text":"10:1","is_correct":false},{"label":"D","text":"Cannot be determined","is_correct":false}]'::jsonb,
$$LTV = Monthly Revenue / Churn Rate = $50 / 0.05 = $1,000. LTV:CAC = $1,000 / $200 = 5:1. A ratio above 3:1 is considered healthy for SaaS.$$,
ARRAY['unit-economics','ltv','cac','saas'], CURRENT_DATE + 25)

) AS v(track, difficulty, title, question, code_snippet, options, explanation, tags, published_at)
WHERE NOT EXISTS (
  SELECT 1 FROM public.challenges WHERE title = v.title
);
