const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.dc6i71y.mongodb.net/?retryWrites=true&w=majority`;


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


    const brandCollection = client.db('carDB').collection('car');
    const dataCollection = client.db('carDB').collection('data');
    const userCollection = client.db('carDB').collection('user');

    //multiple data read for brands in home page

    app.get('/mainPageProduct', async (req, res) => {
      const cursor = dataCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })
  


    app.get('/products/:brandName', async (req, res) => {
      const brandName = req.params.brandName;
      const query = { BrandName: brandName }; 
    
      try {
        const result = await brandCollection.find(query).toArray();
        res.send(result);
      } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).send('Internal Server Error');
      }
    });


      //api based on ID
      app.get('/product/:productId', async (req, res) => {
        const productId = req.params.productId;
      
       // console.log('Received productId:', productId);
        
        try {
          const query = {_id: new ObjectId(productId) }; 
          //console.log(query);
          const result = await brandCollection.findOne(query);
          //console.log(result);
      
          if (!result) {
            res.status(404).json({ error: 'Product not found' }); 
            return;
          }
      
          res.json(result);
        } catch (error) {
          console.error('Error fetching product details:', error);
          res.status(500).json({ error: 'Internal Server Error' });
        }
      });
      
      


  app.post('/product', async (req, res) => {
    const newProduct = req.body;
    console.log(newProduct);
    const result = await brandCollection.insertOne(newProduct);
    res.send(result);
  })


  //add to cart
  app.post('/addToCart', async (req, res) => {
    try {
      const newUserProduct = req.body.product;
      const result = await userCollection.insertOne(newUserProduct);
      res.send(result);
    } catch (error) {
      console.error('Error adding to cart:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

// reading cart
  app.get('/addToCart', async (req, res) => {
    const cursor = userCollection.find();
    const result = await cursor.toArray();
    res.send(result);
  })

//deleting from cart

app.delete('/addToCart/:id', async(req,res) =>{
  const id = req.params.id;
  //console.log(req.params.id)
  const query = {_id: new ObjectId(id)}
 // console.log(query);
 
  const result = await userCollection.deleteOne(query);
 // console.log(result);
  res.send(result);
})


//update

app.get('/product/:id', async(req,res)=>{
  const id = req.params.id;
  const query = {_id: new ObjectId(id)}
  const result = await brandCollection.findOne(query);
  res.send(result);
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








app.get('/', (req, res) => {
  res.send('server is running')
})

app.listen(port, () => {
  console.log(`server is running on port: ${port} `)
})