# **GalaxyDB**

GalaxyDB is a **lightweight, file-based database system** using CSV files for storage. It provides **basic CRUD operations** along with advanced query features like **joins, aggregations, and sorting**, making it ideal for small-scale applications that require structured data management without a dedicated database server.

## **Features**

- 📂 **Stores data in CSV format** for simplicity and easy readability.
- ✅ **Supports schema-based data validation**.
- 🔄 **Implements various types of joins:** `inner`, `left`, `right`, `full`, and `natural` joins.
- 🔍 **Provides sorting, filtering, and aggregation functions**.
- ⚡ **Maintains a structured index** for efficient lookups.
- 📜 **Logs all operations** for debugging and tracking purposes.

## **Installation**

```bash
npm install galaxydb
```

## **Directory Structure**

```
project-root/
├── database/   # 📂 Stores all CSV data files
├── schema/     # 📜 Stores all schema definitions
├── logs/       # 📝 Stores logs of operations
└── index.js    #    Driver Code

```

## **Usage**

### Importing GalaxyDB

```javascript
const { GalaxyUtility } = require('galaxydb');
const { GalaxyDB } = require('galaxydb');
```

### GalaxyUtility Methods

**🔹 `readTable(tableName)`**

Reads the given table and returns its headers and records.

```javascript
const utility = new GalaxyUtility();
const data = utility.readTable('users');
console.log(data);
```

**🔹 `innerJoin(table1, table2, key1, key2)`**

Performs an inner join between two tables.

```javascript
const result = utility.innerJoin('users', 'orders', 'user_id', 'user_id');
```

**🔹 `leftJoin(table1, table2, key1, key2)`**

Performs a left join between two tables.

```javascript
const result = utility.leftJoin('users', 'orders', 'user_id', 'user_id');
```

**🔹 `rightJoin(table1, table2, key1, key2)`**

Performs a right join (alias for left join with reversed parameters).

```javascript
const result = utility.rightJoin('users', 'orders', 'user_id', 'user_id');
```

**🔹 `fullJoin(table1, table2, key1, key2)`**

Performs a full join between two tables.

```javascript
const result = utility.fullJoin('users', 'orders', 'user_id', 'user_id');
```

**🔹 `naturalJoin(table1, table2)`**

Performs a natural join between two tables based on common column names.

```javascript
const result = utility.naturalJoin('users', 'orders');
```

**🔹 `rangeQuery(tableName, column, minValue, maxValue)`**

Filters records where `column` falls within the specified range.

```javascript
const result = utility.rangeQuery('orders', 'amount', 100, 500);
```

**🔹 `sortBy(tableName, column, order)`**

Sorts records in ascending (`asc`) or descending (`desc`) order.

```javascript
const result = utility.sortBy('users', 'age', 'desc');
```

**🔹 `groupBy(tableName, column)`**

Groups records by a specified column.

```javascript
const result = utility.groupBy('orders', 'status');
```

**🔹 `count(tableName, column, value)`**

Counts the number of records where `column` matches `value`.

```javascript
const result = utility.count('users', 'role', 'admin');
```

**🔹 `sum(tableName, column)`**

Calculates the sum of a numeric column.

```javascript
const result = utility.sum('orders', 'amount');
```

**🔹 `avg(tableName, column)`**

Calculates the average value of a numeric column.

```javascript
const result = utility.avg('orders', 'amount');
```

**🔹 `max(tableName, column)`**

Finds the maximum value in a column.

```javascript
const result = utility.max('orders', 'amount');
```

**🔹 `min(tableName, column)`**

Finds the minimum value in a column.

```javascript
const result = utility.min('orders', 'amount');
```

**🔹 `firstNRecords(tableName, N)`**

Returns the first N records from a table.

```javascript
const result = utility.firstNRecords('users', 5);
```

**🔹 `countUnique(tableName, column)`**

Counts unique occurrences of values in a column.

```javascript
const result = utility.countUnique('users', 'city');
```

**🔹 `exists(tableName, conditionFn)`**

Checks if records satisfying a condition exist.

```javascript
const result = utility.exists('users', row => row.age > 30);
```

### GalaxyDB Methods

**🔹 `new GalaxyDB(entity)`**

Creates a new instance of GalaxyDB for a specific entity.

```javascript
const userDB = new GalaxyDB('users');
```

**🔹 `create(obj)`**

Inserts a new record.

```javascript
userDB.create({ _id: '1', name: 'ABC DE', age: 30 });
```

**🔹 `readAll()`**

Reads all records from the table.

```javascript
const users = userDB.readAll();
```

**🔹 `update(id, updatedData)`**

Updates a record by `_id`.

```javascript
userDB.update('1', { age: 31 });
```

**🔹 `delete(id)`**

Deletes a record by `_id`.

```javascript
userDB.delete('1');
```

**🔹 `queryWithForeignKey(primaryRepo, foreignRepo, foreignKey)`**

Performs a join between two repositories.

```javascript
const ordersDB = new GalaxyDB('orders');
const result = GalaxyDB.queryWithForeignKey(userDB, ordersDB, 'user_id');
```
