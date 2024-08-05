const mysql = require('mysql');
const express = require('express');
const session = require('express-session');
const path = require('path');

const connection = mysql.createConnection({
	host     : 'localhost',
	user     : 'root',
	password : '',
	database : 'project'
});

connection.connect((error) => {
	if (error) {
	  console.error('Error connecting to database:', error.stack);
	  return;
	}
  
	console.log('Connected to database.');
  });

const app = express();

app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'static')));

// http://localhost:3000/
app.get('/', function(request, response) {

	// Render login template
	response.sendFile(path.join(__dirname + '/index.html'));
});


app.get('/home', function(request, response) {
	// If the user is loggedin
		response.sendFile(path.join(__dirname + '/index.html'));
	response.end();
});


app.post('/subscribe', function(request, response) {
	// Capture the input fields
	let email_sub=request.body.email_sub;

	// Ensure the input fields exists and are not empty
	if (email_sub) {
		
				// Use a prepared statement for the insert query
				connection.query('INSERT INTO marketing (email_sub) VALUES (?)', [email_sub], function(error, results, fields) {
					if (error) {
						throw error;
					}
					response.send("Thanks for Subscribing");
					response.redirect('/')
					response.end();
				});
	} else {
		response.send('Enter Valid Email');
		response.end();
	}
});


// http://localhost:3000/auth
app.post('/auth', async function(request, response) {
    // Capture the input fields
    let email = request.body.emails;
    let password = request.body.pass;

    try {
        if (email && password) {
            const results = await queryAsync('SELECT * FROM accounts WHERE email = ? AND password = ?', [email, password]);

            if (results.length > 0) {
                // Authenticate the user
                request.session.loggedin = true;
                // Redirect to home page
                response.redirect('/');
            } else {
                response.send('Incorrect Email and/or Password!');
            }
        } else {
            response.send('Please enter Email and Password!');
        }
    } catch (error) {
        console.error('Error in /auth:', error);
        response.status(500).send('Internal Server Error');
    } finally {
        response.end();
    }
});

app.get('/login', function(request, response) {
	// Render login template
	response.sendFile(path.join(__dirname + '/Signin.html'));
});

app.get('/menu', function(request, response) {
	// Render login template
	response.sendFile(path.join(__dirname + '/menu.html'));
});

// http://localhost:3000/create_user
app.get('/create_user', function(request, response) {
	// Render login template
	response.sendFile(path.join(__dirname + '/reg.html'));
});

app.get('/payment', function(request, response) {
	// Render login template
	response.sendFile(path.join(__dirname + '/payment.html'));
});



app.post('/create', async function(request, response) {
    // Capture the input fields
    let user_name = request.body.name;
    let password = request.body.pass;
    let email = request.body.email;
    let email_comm = request.body.email_comm;

    try {
        if (user_name && password) {
            const existingUser = await queryAsync('SELECT * FROM accounts WHERE email = ?', [email]);

            if (existingUser.length > 0) {
                response.send('User Already Exists');
            } else {
                const hashedPassword = password;

                await queryAsync('INSERT INTO accounts (username, password, email) VALUES (?, ?, ?)', [user_name, hashedPassword, email]);
                await queryAsync('INSERT INTO `user` (`name`,`email_comm`, `pass`, `email`) VALUES (?,?,?,?)', [user_name, email_comm, hashedPassword, email]);

                // Redirect to home page
                response.redirect('/');
            }
        } else {
            response.send('Please enter Username and Password!');
        }
    } catch (error) {
        console.error('Error in /create:', error);
        response.status(500).send('Internal Server Error');
    } finally {
        response.end();
    }
});



function queryAsync(sql, values) {
    return new Promise((resolve, reject) => {
        connection.query(sql, values, (error, results, fields) => {
            if (error) {
                reject(error);
            } else {
                resolve(results);
            }
        });
    });
}


// http://localhost:3000/home
app.get('/contact', function(request, response) {
	
	response.sendFile(path.join(__dirname + '/contactus.html'));
});

app.listen(3000);