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

    const qustionCollection = client.db("qustionDB").collection("qustionData");

    const qustionAporoveCollection = client.db("qustionDB").collection("approvedQustionData");
    


    // jwt related api
    app.post('/jwt', (req,res) => {
      const user = req.body;
      console.log('user for token', user);
      const token = jwt.sign(user, process.env.JWT_SECRET, {expiresIn: '2h'});
      res.send({token}) 
    })

    // middlewares
    const verifyToken = (req,res, next) => {
      console.log('inside verify token', req.headers.authorization);

      if(!req.headers.authorization){
        return res.status(401).send({message: 'unauthorized access'});

      }
      const token = req.headers.authorization.split(' ')[1]
      jwt.verify(token, process.env.JWT_SECRET, (err,decoded) => {
        if(err){
          return res.status(401).send({message: 'unauthorized access'})
        }
        req.decoded = decoded;
        next()
      })
    }


    // use verify admin after verifyToken
    const verifyAdmin = async (req, res, next) => {
      const email = req.decoded.email;
      const query = {email: email};
      const user = await usersCollection.findOne(query);
      const isAdmin = user?.role === 'admin';
      if(!isAdmin){
        return res.status(403).send({message: 'forbidden access'})
      }
      next()
    }



    // users related api
    app.get('/users', verifyToken, verifyAdmin, async(req,res)=>{
      console.log(req.headers);

      const result = await usersCollection.find().toArray();
      res.send(result)
    })


    app.get('/users/admin/:email', verifyToken, async(req,res)=> {
      const email = req.params.email;
      console.log('email', req.decoded.email);
      if(email !== req.decoded.email){
        return res.status(403).send({message: 'forbidden access'})
      }
      const query = {email: email};
      const user = await usersCollection.findOne(query);
      let admin = false;
      if(user){
        admin = user?.role === 'admin';

      }
      res.send({admin})
    }
    )

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

    app.delete('/users/:id', verifyToken, verifyAdmin, async (req,res)=>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await usersCollection.deleteOne(query)
      res.send(result)
    }
    )

    app.patch('/users/admin/:id', verifyToken, verifyAdmin, async (req,res)=>{
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

    app.delete('/addBlog/:id', verifyToken, verifyAdmin, async (req,res)=>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await dataCollection.deleteOne(query)
      res.send(result)
    }
    )

// update
    app.put('/addBlog/:id', async (req,res)=> {
      const id = req.params.id;
      const filter = {_id: new ObjectId (id)}
      const options = {upsert: true}
      const updatedBlog = req.body;
      const blog = {
        $set:{
          title: updatedBlog.title,
          writer: updatedBlog.writer,
          blog: updatedBlog.blog,
          category: updatedBlog.category,
          photo: updatedBlog.photo,
          
        }
      }
      const result = await dataCollection.updateOne(filter,blog,options)
      res.send(result)
    })

    // dynamic form

    app.post('/dynamicFrom', async (req, res) => {
      const values = req.body.values;
      try {
        await dataCollection.insertOne({ values });
        res.status(200).send('Data saved successfully');
      } catch (error) {
        console.error('Error saving data', error);
        res.status(500).send('Error saving data');
      }
    })

    app.get('/addBlog/:id', async(req,res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await dataCollection.findOne(query);
      res.send(result)
    })



    // qustion related api
    app.post('/qustion', async(req,res)=>{
      const qustion = req.body;
      // const status = 'pending'
      const result = await qustionCollection.insertOne(qustion);
      res.send(result)
    })


    app.get('/pendingQustion', async(req,res) => {
      const query = {
        status: 'pending'
      }
      const qustions = req.body
      const qustion = qustionCollection.find(qustions);
      const result = await qustion.toArray();
      res.send(result)
    })

    app.patch('/qustions/:id', async(req,res)=>{
      const filter = {_id: req.params.id}
      const updateDoc  = {
        $set: {
          status: req.body.status
        }
      }

      const result = await qustionCollection.updateOne(filter,updateDoc)
      res.send(result)

    })

    // approve and reject
    app.post('/approve', async(req,res)=>{
      const approveQ = req.body
      const result = await qustionAporoveCollection.insertOne(approveQ)
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