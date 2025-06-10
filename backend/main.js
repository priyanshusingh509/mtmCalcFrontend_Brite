const express = require('express');
let cors = require('cors');
const app = express();
const port = 3000;
const fs = require('fs/promises')


app.use(cors());
app.use(express.json());




app.get('/fetchmock', async (req, res) => {
try{
    const filecontent = await fs.readFile('../dummydata/mock_trade_data.json');
    res.send(JSON.parse(filecontent));
    console.log(JSON.parse(filecontent));
}catch(error){
    console.log("there was an error while fetching the file data", error);
}
});

app.listen(port, () => {
  console.log(`🚀 Server is running on port: ${port}`);
});
