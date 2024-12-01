const express = require('express')
const app = express()
const port = 3000

const sleep = (ms) => {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

app.use(express.static('.'));

app.get("/slow_response", (req, res) => {
    sleep(3000);
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(
        {
            "message": "A slow processing end-point"
        }
    ));
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`))