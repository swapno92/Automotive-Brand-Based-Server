const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

// brandShop
// uCrXXy8bZBVdeCYx

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.USER_PASSWORD}@cluster0.hktnvnf.mongodb.net/?retryWrites=true&w=majority`

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    const database = client.db("brandShopBD");
    const brandsCollection = database.collection("brands");
    const productsCollection = database.collection("products");
    const curtCollection = database.collection("curt");

    app.get("/brands", async (req, res) => {
      const brands = brandsCollection.find();
      const result = await brands.toArray();
      res.send(result);
    });

    app.get("/brands/:name", async (req, res) => {
      const name = req.params.name;
      const query = {
        brand_name: name,
      };
      const result = await brandsCollection.findOne(query);
      res.send(result);
    });

    app.get("/products/:name", async (req, res) => {
      const name = req.params.name.replace(" ", "-");
      const cursor = productsCollection.find({ brand: name });
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/products/details/:id", async (req, res) => {
      const id = req.params.id;
      const cursor = await productsCollection.findOne({
        _id: new ObjectId(id),
      });
      res.send(cursor);
    });

    app.post("/products", async (req, res) => {
      const user = req.body;
      const result = await productsCollection.insertOne(user);
      res.send(result);
    });

    app.put("/products/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateProduct = req.body;
      console.log(updateProduct);
      const product = {
        $set: {
          name: updateProduct.name,
          brand: updateProduct.brand,
          price: updateProduct.price,
          rating: updateProduct.rating,
          img: updateProduct.img,
        },
      };
      const result = await productsCollection.updateOne(
        filter,
        product,
        options
      );
      console.log(result);
      res.send(result);
    });

    app.post("/curt", async (req, res) => {
      const curt = req.body;
      const result = await curtCollection.insertOne(curt);
      res.send(result);
    });

    app.get("/curt/:email", async (req, res) => {
      const email = req.params.email;
      const result = await curtCollection.findOne({ email: email });
      res.send(result);
    });

    app.get("/curt", async (req, res) => {
      const cursor = curtCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.delete("/curt/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: id };
      const result = await curtCollection.deleteOne(query);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("is running");
});

app.listen(port, () => {
  console.log(`server is running on port: ${port}`);
});
