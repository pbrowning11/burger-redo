var express = require("express");
var exphb = require("express-handlebars");
var mysql = require("mysql");

var app = express();
var connection;

var PORT = process.env.PORT || 8080;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.engine("handlebars", exphb({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

if (process.env.JAWSDB_URL) {
    connection = mysql.createConnection(process.env.JAWSDB_URL);
} else {
    connection = mysql.createConnection({
        host: "localhost",
        port: 3306,
        user: "root",
        password: "root",
        database: "burgers_db"
    });
}


connection.connect(function (err) {
    if (err) {
        console.error("error connecting: " + err.stack);
        return;
    }

    console.log("connected as id " + connection.threadId);
});

app.use(express.static('public'))

app.get("/", function (req, res) {
    connection.query("SELECT * FROM burgers", function (err, data) {
        var createdBurger = [];
        var devouredBurger = [];
        if (err) {
            return res.status(500).end();
        }
        for (var i = 0; i < data.length; i++) {
            if (data[i].devoured === 0) {
                createdBurger.push(data[i]);
            } else {
                devouredBurger.push(data[i]);
            }
        }

        res.render("index", { burgers: createdBurger, devBurgers: devouredBurger });
    });
});

app.post("/", function (req, res) {
    console.log(req.body.devoured)
    connection.query("INSERT INTO burgers (burger_name) VALUES (?)", [req.body.burger_name, req.body.devoured], function (err, result) {
        if (err) {
            return res.status(500).end();
        }
        res.json({ id: result.insertId });
        console.log({ id: result.insertId });
    });
});

// Update a burger
app.put("/:id", function (req, res) {
    connection.query("UPDATE burgers SET devoured = ? WHERE id = ?", [req.body, req.params.id], function (err, result) {
        if (err) {
            return res.status(500).end();
        }
        else if (result.changedRows === 0) {
            return res.status(404).end();
        }
        res.status(200).end();

    });
});

app.listen(PORT, function () {
    console.log("Server listening on: http://localhost:" + PORT);
});