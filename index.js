const express = require('express');
const app = express();
const port = process.env.PORT || 5001;
const cors= require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// middleware
app.use(cors());
app.use(express.json());



// mazharulislamrifat46
// APscn58b0afoSr3X



const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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

    const dataCollection = client.db("blogsDB").collection("blogData");
    const usersCollection = client.db("usersDB").collection("usersData");
    


    // jwt related api
    app.post('/jwt', (req,res) => {
      const user = req.body;
      console.log('user for token', user);
      console.log(process.env.JWT_SECRET);
      const token = jwt.sign(user, process.env.JWT_SECRET, {expiresIn: '1h'});
      res.send({token}) 
    })


    // users related api
    app.get('/users', async(req,res)=>{
      const result = await usersCollection.find().toArray();
      res.send(result)
    })

    app.post('/users', async (req,res)=>{
      const user = req.body;
      // insert email if user dose not exists
      const query = {email : user.email}
      const existingUser = await usersCollection.findOne(query)
      if(existingUser){
        return res.send({message: 'user already exists', insertedId: null})
      }
      const result = await usersCollection.insertOne(user)
      res.send(result)
    })

    app.delete('/users/:id', async (req,res)=>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await usersCollection.deleteOne(query)
      res.send(result)
    }
    )

    app.patch('/users/admin/:id',async (req,res)=>{
      const id = req.params.id;
      const filter = {_id: new ObjectId(id)};
      const updatedDoc = {
        $set: {
          role: 'admin'
        }
      }
      const result = await usersCollection.updateOne(filter,updatedDoc)
      res.send(result)
    }
    )


    // blog related api
    app.post('/addBlog', async(req,res)=>{
      const user = req.body;
      console.log( 'blog data:', user);
      const result = await dataCollection.insertOne(user);
      res.send(result)
      
    })

    app.get('/addBlog', async(req,res) => {
      
      const data = dataCollection.find();
      const result = await data.toArray();
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