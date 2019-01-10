var inquirer = require("inquirer");
var mysql = require("mysql");
var chalk = require("chalk");
var figlet = require("figlet");

//  My SQL parameters
var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "koshatina8",
  database: "Bamazon"
});
// adding Figlet for terminal decor
let bamazonFig = "BAMAZON";
figlet(bamazonFig, function(err, data) {
  if (err) {
    console.log("The store is closed, try to come later");
    console.dir(err);
    return;
  }

  console.log(chalk.redBright(data));
  console.log(
    chalk.blueBright(
      "\n---------------------------------------------------------------------\n"
    )
  );
});

// A function that allows to enter only a number for the questions
function onlyNumber(value) {
  var integer = Number.isInteger(parseFloat(value));
  var sign = Math.sign(value);

  if (integer && sign === 1) {
    return true;
  } else {
    return "A  whole number should be entered. Thank you.";
  }
}

// user's input for the questions
function customersInput() {
  inquirer
    .prompt([
      {
        type: "input",
        name: "item_id",
        message: "What is the item ID you will need to buy?",
        validate: onlyNumber,
        filter: Number
      },
      {
        type: "input",
        name: "quantity",
        message: "How many items do you need?",
        validate: onlyNumber,
        filter: Number
      }
    ])
    .then(function(input) {
      var item = input.item_id;
      var quantity = input.quantity;

      // Query db to confirm that the given item ID exists in the desired quantity
      var queryString = "SELECT * FROM products WHERE ?";

      connection.query(queryString, { item_id: item }, function(err, data) {
        if (err) throw err;

        // in case if Item_ID is selected wrong
        if (data.length === 0) {
          console.log("ERROR: Invalid Item ID. Please select a valid Item ID.");
          renderInventory();
        } else {
          var productAmount = data[0];

          // Quantity requested is in stock
          if (quantity <= productAmount.stock_quantity) {
            console.log(
              "Thank you for placing your order. It is processed and will be shipped soon!"
            );

            // Construct the updating query string
            var updateQueryString =
              "UPDATE products SET stock_quantity = " +
              (productAmount.stock_quantity - quantity) +
              " WHERE item_id = " +
              item;
            // console.log('updateQueryStr = ' + updateQueryStr);

            // Update the inventory
            connection.query(updateQueryString, function(err, data) {
              if (err) throw err;

              console.log(
                "The order total is $" + productAmount.price * quantity
              );
              console.log(
                "Thank you for your business! We will be happy to serve you again!"
              );
              console.log(
                chalk.blueBright(
                  "\n---------------------------------------------------------------------\n"
                )
              );

              // End the database connection
              connection.end();
            });
          } else {
            console.log("Insufficient quantity!");
            console.log("Please modify your order.");
            console.log(
              chalk.blueBright(
                "\n---------------------------------------------------------------------\n"
              )
            );

            renderInventory();
          }
        }
      });
    });
}

// displayInventory will retrieve the current inventory from the database and output it to the console
function renderInventory() {
  // console.log('___ENTER displayInventory___');

  // Construct the db query string
  queryString = "SELECT * FROM products";

  // Make the db query
  connection.query(queryString, function(err, data) {
    if (err) throw err;

    console.log(chalk.redBright("------Available items: ---------"));
    console.log(
      chalk.blueBright(
        "\n---------------------------------------------------------------------\n"
      )
    );

    var inventory = "";
    for (var i = 0; i < data.length; i++) {
      inventory = "";
      inventory += "Item ID: " + data[i].item_id + "  ||  ";
      inventory += "Product Name: " + data[i].product_name + "  ||  ";
      inventory += "Department: " + data[i].department_name + "  ||  ";
      inventory += "Price: $" + data[i].price + "\n";

      console.log(inventory);
    }

    console.log(
      chalk.blueBright(
        "---------------------------------------------------------------------\n"
      )
    );

    //Prompt the user for item/quantity they would like to purchase
    customersInput();
  });
}

// runBamazon will execute the main application logic
function Bamazon() {
  // console.log('___ENTER runBamazon___');

  // Display the available inventory
  renderInventory();
}

// Run the application logic
Bamazon();
