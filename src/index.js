const app = require('./app');

const port = process.env.PORT;

app.listen(port, () => {
    console.log(`Server started at http://localhost:${3000}`);
})