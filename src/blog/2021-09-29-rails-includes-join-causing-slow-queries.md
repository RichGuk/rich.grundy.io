---
title: Rails includes/join causing slow queries?
description: "Is adding a .join(...) to an ActiveRecord query slowing the page down? You may be doing something unexpected."
heroColor: "var(--brand-color-ruby)"
heroIcon: "icon-ruby"
tags:
  - rails
---

At work, we came across a performance issue on one of our pages. When adding a
scope to an existing query, page load times would jump to 5+ seconds, but only
in production.

Here is an example app highlighting the problem. Can you spot the issue?

The models:

```ruby
class Store < ApplicationRecord
  has_many :books
  has_many :customers

  scope :with_books_in_stock, -> { distinct.joins(:books).merge(Book.in_stock) }
end

class Book < ApplicationRecord
  belongs_to :store
  scope :in_stock, -> { where(in_stock: true) }
end
```

The query causing the problem:

```ruby
query = Store.includes(:customers, :books)
query = query.with_books_in_stock if checking_in_stock_only?
query.to_a
```

### So, what's going on here?

A `join(...)` was added to a query for `:books` (in the scope) when it already
existed in the `includes(...)`. The query also had many other _includes_.

Usually, with _includes_, Rails will run additional DB queries to select the
extra association data.

```ruby
Store.where(id: 1).includes(:customers, :books).to_a
# Store Load (0.5ms)  SELECT "stores".* FROM "stores" WHERE "stores"."id" = ?  [["id", 1]]
# Customer Load (0.6ms)  SELECT "customers".* FROM "customers" WHERE "customers"."store_id" = ?  [["store_id", 1]]
# Book Load (35.7ms)  SELECT "books".* FROM "books" WHERE "books"."store_id" = ?  [["store_id", 1]]
```

However, adding a _join_ for an existing item in _includes_ will combine all the
includes into a single `LEFT JOIN` for the prefetch.

```ruby

# SQL (11032.6ms)  SELECT "stores"."id" AS t0_r0, ... "customers"."id" AS t1_r0, .... "books"."id" AS t2_r0
# FROM "stores" INNER JOIN "books" ON "books"."store_id" = "stores"."id"
# LEFT OUTER JOIN "customers" ON "customers"."store_id" = "stores"."id" WHERE "stores"."id" = ?  [["id", 1]]
```

Notice how long it took? 11032.6ms.

If you include lots of associations, you could produce a slow query, like in our
case. It may only become a problem in production when the DB tables are big
enough.

It’s tempting to remove `:books` from the include. However, that stops the data
from being preloaded, and we end up with n+1 queries.

```ruby
Store.select(:id).includes(:customers).with_books_in_stock.each { |store| store.books.to_a }

# Store Load (2.6ms)  SELECT DISTINCT "stores"."id" FROM "stores" INNER JOIN "books" ON "books"."store_id" = "stores"."id" WHERE "books"."in_stock" = ?  [["in_stock", 1]]
# Customer Load (0.5ms)  SELECT "customers".* FROM "customers" WHERE "customers"."store_id" IN (?, ?)  [["store_id", 1], ["store_id", 2]]
# Book Load (37.0ms)  SELECT "books".* FROM "books" WHERE "books"."store_id" = ?  [["store_id", 1]]
# Book Load (0.2ms)  SELECT "books".* FROM "books" WHERE "books"."store_id" = ?  [["store_id", 2]]
```

__The fix is simple__. Use `preload` for books:

```ruby
query = Store
  .where(id: 1)
  .includes(:customers)
  .preload(:books)

query = query.with_books_in_stock if checking_in_stock_only?

# checking_in_stock_only = true
# Store Load (2.9ms)  SELECT DISTINCT "stores"."id" FROM "stores" INNER JOIN "books" ON "books"."store_id" = "stores"."id" WHERE "books"."in_stock" = ?  [["in_stock", 1]]
# Book Load (33.2ms)  SELECT "books".* FROM "books" WHERE "books"."store_id" IN (?, ?)  [["store_id", 1], ["store_id", 2]]
# Customer Load (0.4ms)  SELECT "customers".* FROM "customers" WHERE "customers"."store_id" IN (?, ?)  [["store_id", 1], ["store_id", 2]]

# checking_in_stock_only = false
# Store Load (0.2ms)  SELECT "stores"."id" FROM "stores"
# Book Load (37.5ms)  SELECT "books".* FROM "books" WHERE "books"."store_id" IN (?, ?)  [["store_id", 1], ["store_id", 2]]
# Customer Load (0.6ms)  SELECT "customers".* FROM "customers" WHERE "customers"."store_id" IN (?, ?)  [["store_id", 1], ["store_id", 2]]
```

Ace! The `preload` allows you to handle conditionally adding the `join`. Data
prefetching for the association happens the same with or without.

The problem also happens if you add a `where(...)` clause to the query that
references a table in the includes.

```ruby
Store.where(id: 1).includes(:customers, :books).where(books: { id: 2 }).to_a

# SELECT "stores"."id" AS t0_r0 ..., "customers"."id"
# FROM "stores"
# LEFT OUTER JOIN "customers" ON "customers"."store_id" = "stores"."id"
# LEFT OUTER JOIN "books" ON "books"."store_id" = "stores"."id"
# WHERE "stores"."id" = ? AND "books"."id" = ?  [["id", 1], ["id", 2]]
```

Again, you can use `preload`.

Sometimes you may wish the opposite. To force the preload to happen in a single
query. For this, use `eager_load`.

```ruby
Store.where(id: 1).eager_load(:books).to_a

# SELECT "stores"."id" ..., "books"."id"
# FROM "stores"
# LEFT OUTER JOIN "books" ON "books"."store_id" = "stores"."id"
# WHERE "stores"."id" = ?  [["id", 1]]
```

It's usually enough, however, to let Rails' `includes` decide.

---

So there you have it. It pays to keep an eye on the queries in the server logs
from time to time. It might also help to run something like Skylight.io in
production or use slow query logs. Or, of course, wait for someone to moan like
us. 😂
