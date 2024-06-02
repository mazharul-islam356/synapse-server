const express = require('express');
const app = express();
const port = process.env.PORT || 5001;
const cors= require('cors')


// middleware
app.use(cors());
app.use(express.json());

// mazharulislamrifat46
// APscn58b0afoSr3X




const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://mazharulislamrifat46:APscn58b0afoSr3X@ulumulquran.vpbfnff.mongodb.net/?retryWrites=true&w=majority&appName=ulumulQuran";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const database = client.db("blogsDB");
    const dataCollection = database.collection("blogData");


    app.post('/users', async(req,res)=>{
      const user = req.body;
      console.log( 'blog data:', user);
      const result = await dataCollection.insertOne(user);
      res.send(result)
      
    })



    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/',(req,res) => {
    res.send('Ulumul quran server is running')
})








app.get('/data',(req,res)=>{
    res.send()
})

app.listen(port, ()=>{
    console.log(`server is running at ${port}`);
})