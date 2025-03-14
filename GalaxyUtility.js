const fs = require('fs');
const path = require('path');

class GalaxyUtility {
    constructor() {
        this.databaseDir = path.join(__dirname, 'database');
    }

    readTable(tableName) {
        try {
            const filePath = path.join(this.databaseDir, `${tableName}.csv`);
            if (!fs.existsSync(filePath)) {
                console.log(`Table '${tableName}' does not exist.`);
                return null;
            }
            const data = fs.readFileSync(filePath, 'utf-8').trim().split('\n');
            const headers = data.shift().split(',');
            const records = data.map(row => {
                const values = row.split(',');
                return Object.fromEntries(headers.map((field, i) => [field, values[i] || null]));
            });
            console.log(`Successfully read table '${tableName}'.`);
            return { headers, records };
        } catch (error) {
            console.log(`Error reading table '${tableName}': ${error.message}`);
            return null;
        }
    }

    innerJoin(table1, table2, key1, key2) {
        const t1 = this.readTable(table1);
        const t2 = this.readTable(table2);
        if (!t1 || !t2) return [];

        const result = t1.records
            .map(row1 => {
                const match = t2.records.find(row2 => row1[key1] === row2[key2]);
                return match ? { ...row1, ...match } : null;
            })
            .filter(result => result !== null);

        console.log(`Inner Join between '${table1}' and '${table2}' completed.`);
        return result;
    }

    leftJoin(table1, table2, key1, key2) {
        const t1 = this.readTable(table1);
        const t2 = this.readTable(table2);
        if (!t1 || !t2) return [];

        const result = t1.records.map(row1 => {
            const match = t2.records.find(row2 => row1[key1] === row2[key2]);
            return { ...row1, ...(match || Object.fromEntries(t2.headers.map(field => [field, null]))) };
        });

        console.log(`Left Join between '${table1}' and '${table2}' completed.`);
        return result;
    }

    rightJoin(table1, table2, key1, key2) {
        return this.leftJoin(table2, table1, key2, key1);
    }

    fullJoin(table1, table2, key1, key2) {
        const left = this.leftJoin(table1, table2, key1, key2);
        const right = this.rightJoin(table1, table2, key1, key2);
        const result = [...left, ...right.filter(row => !left.some(leftRow => leftRow[key1] === row[key1]))];

        console.log(`Full Join between '${table1}' and '${table2}' completed.`);
        return result;
    }

    naturalJoin(table1, table2) {
        const t1 = this.readTable(table1);
        const t2 = this.readTable(table2);
        if (!t1 || !t2) return [];

        const commonKeys = t1.headers.filter(key => t2.headers.includes(key));
        const result = t1.records
            .map(row1 => {
                const match = t2.records.find(row2 => commonKeys.every(k => row1[k] === row2[k]));
                return match ? { ...row1, ...match } : null;
            })
            .filter(result => result !== null);

        console.log(`Natural Join between '${table1}' and '${table2}' completed.`);
        return result;
    }

    rangeQuery(tableName, column, minValue, maxValue) {
        const table = this.readTable(tableName);
        if (!table) return [];

        const result = table.records.filter(row => row[column] >= minValue && row[column] <= maxValue);

        console.log(`Range Query on '${tableName}' completed.`);
        return result;
    }

    sortBy(tableName, column, order = 'asc') {
        const table = this.readTable(tableName);
        if (!table) return [];

        const result = table.records.sort((a, b) => (order === 'asc' ? a[column] - b[column] : b[column] - a[column]));

        console.log(`Sort operation on '${tableName}' by column '${column}' (${order}).`);
        return result;
    }

    groupBy(tableName, column) {
        const table = this.readTable(tableName);
        if (!table) return {};

        const result = table.records.reduce((groups, row) => {
            const key = row[column];
            if (!groups[key]) groups[key] = [];
            groups[key].push(row);
            return groups;
        }, {});

        console.log(`Group By '${column}' on '${tableName}' completed.`);
        return result;
    }

    count(tableName, column, value) {
        const table = this.readTable(tableName);
        if (!table) return 0;

        const result = table.records.filter(row => row[column] === value).length;

        console.log(`Count operation: ${result} records found in '${tableName}' with '${column}' = '${value}'.`);
        return result;
    }

    sum(tableName, column) {
        const table = this.readTable(tableName);
        if (!table) return 0;

        const result = table.records.reduce((sum, row) => sum + (parseFloat(row[column]) || 0), 0);

        console.log(`Sum operation on '${tableName}', column '${column}' completed.`);
        return result;
    }

    avg(tableName, column) {
        const table = this.readTable(tableName);
        if (!table) return 0;

        const sum = this.sum(tableName, column);
        const result = sum / table.records.length;

        console.log(`Average operation on '${tableName}', column '${column}' completed.`);
        return result;
    }

    max(tableName, column) {
        const table = this.readTable(tableName);
        if (!table) return null;

        const result = Math.max(...table.records.map(row => parseFloat(row[column]) || 0));

        console.log(`Max operation on '${tableName}', column '${column}' completed.`);
        return result;
    }

    min(tableName, column) {
        const table = this.readTable(tableName);
        if (!table) return null;

        const result = Math.min(...table.records.map(row => parseFloat(row[column]) || 0));

        console.log(`Min operation on '${tableName}', column '${column}' completed.`);
        return result;
    }

    firstNRecords(tableName, N) {
        const table = this.readTable(tableName);
        if (!table) return [];

        const result = table.records.slice(0, N);

        console.log(`First ${N} records fetched from '${tableName}'.`);
        return result;
    }

    countUnique(tableName, column) {
        const table = this.readTable(tableName);
        if (!table) return {};

        const uniqueCounts = {};
        table.records.forEach(row => {
            const key = row[column] || "NULL";
            if (!uniqueCounts[key]) {
                uniqueCounts[key] = { count: 0, data: [] };
            }
            uniqueCounts[key].count++;
            uniqueCounts[key].data.push(row);
        });

        console.log(`Count Unique operation completed on '${tableName}', column '${column}'.`);
        return uniqueCounts;
    }


    exists(tableName, conditionFn) {
        const table = this.readTable(tableName);
        if (!table) return { count: 0, data: [] };

        if (typeof conditionFn !== 'function') {
            console.log(`Error: Condition must be a function.`);
            return { count: 0, data: [] };
        }

        const matchingRecords = table.records.filter(conditionFn);
        console.log(`Found ${matchingRecords.length} matching record(s) in '${tableName}'.`);

        return { count: matchingRecords.length, data: matchingRecords };
    }

}

module.exports = { GalaxyUtility };
