const { GalaxyDB } = require('./index');
const { GalaxyUtility } = require('./GalaxyUtility');

const utility = new GalaxyUtility();

class EmployeeRepository extends GalaxyDB {
    constructor() {
        super('Employee');
    }
}

class CustomerRepository extends GalaxyDB {
    constructor() {
        super('Customer');
    }
}

try {
    const empRepo = new EmployeeRepository();
    console.log("\n--- Employee Repository Operations ---");
    empRepo.create({ _id: '1', name: 'John Doe', dob: '1993-05-21', dept: 'IT' });
    empRepo.create({ _id: '2', name: 'Jane Doe', dob: '1995-08-15', dept: 'HR' });
    empRepo.update('1', { name: 'John Smith' });
    console.log("All Employees:", empRepo.readAll());
    empRepo.delete('1');
    console.log("After Deletion:", empRepo.readAll());
} catch (error) {
    console.error(error.message);
}

try {
    const custRepo = new CustomerRepository();
    console.log("\n--- Customer Repository Operations ---");
    custRepo.create({ _id: '101', name: 'Alice', email: 'alice@example.com' });
    custRepo.create({ _id: '102', name: 'Bob', email: 'bob@example.com' });
    custRepo.update('101', { email: 'alice_new@example.com' });
    console.log("All Customers:", custRepo.readAll());
    custRepo.delete('101');
    console.log("After Deletion:", custRepo.readAll());
} catch (error) {
    console.error(error.message);
}

// Testing Utility Methods
console.log("\n--- Utility Methods ---");
console.log("Reading Employee Table:", utility.readTable('Employee'));
console.log("Reading Customer Table:", utility.readTable('Customer'));
console.log("Sorting Employees by Name:", utility.sortBy('Employee', 'name'));
console.log("Group by Department:", utility.groupBy('Employee', 'dept'));
console.log("Count Employees in IT:", utility.count('Employee', 'dept', 'IT'));
console.log("Max DOB in Employee:", utility.max('Employee', 'dob'));
console.log("Min DOB in Employee:", utility.min('Employee', 'dob'));
console.log("First Employee Record:", utility.firstNRecords('Employee', 1));
console.log("Unique Count of Departments:", utility.countUnique('Employee', 'dept'));
console.log("Checking if Employee exists:", utility.exists('Employee', row => row.name === 'Jane Doe'));

// Testing Join Operations
console.log("\n--- Join Operations ---");
console.log("Inner Join Employees & Customers on _id:", utility.innerJoin('Employee', 'Customer', '_id', '_id'));
console.log("Left Join Employees & Customers on _id:", utility.leftJoin('Employee', 'Customer', '_id', '_id'));
console.log("Right Join Employees & Customers on _id:", utility.rightJoin('Employee', 'Customer', '_id', '_id'));
console.log("Full Join Employees & Customers on _id:", utility.fullJoin('Employee', 'Customer', '_id', '_id'));
console.log("Natural Join Employees & Customers:", utility.naturalJoin('Employee', 'Customer'));
