const express = require('express')
const app = express()
const port = 3000

const sleep = (ms) => {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

app.use(express.static('.'));

app.get("/slow_response", async (req, res) => {
    console.log("Slow response started.");
    await sleep(5000);
    res.setHeader('Content-Type', 'application/json');
    console.log("Returning data.")
    res.end(JSON.stringify(
        {
            "message": "A slow processing end-point"
        }
    ));
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`))