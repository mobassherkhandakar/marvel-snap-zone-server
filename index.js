require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;

//!Medlware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ccknyay.mongodb.net/?retryWrites=true&w=majority`;

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
    // await client.connect();
    const toyCallection = client.db("carsToyDB").collection("carToys");
    // const indexKeys = {toyName: 1}
    // const indexOptions = { name: "toyNames" };
    // const result = await toyCallection.createIndex(indexKeys, indexOptions)

    app.get("/allToy", async (req, res) => {
      const alltoy = await toyCallection.find().toArray();
      res.send(alltoy);
    });

    app.get("/getToyByCategory/:category", async (req, res) => {
      const toys = await toyCallection
        .find({
          catagory: req.params.category,
        })
        .toArray();
      res.send(toys);
    });

    app.get("/update/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await toyCallection.findOne(query);
      res.send(result);
    });

    app.put("/update/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const toyUpdate = req.body;
      const newToy = {
        $set: {
          price: toyUpdate.price,
          quantity: toyUpdate.quantity,
          description: toyUpdate.description,
        },
      };
      const result = await toyCallection.updateOne(filter, newToy, options);
      res.send(result);
    });

    app.get("/getToy/:text", async (req, res) => {
      const text = req.params.text;
      const result = await toyCallection
        .find({
          $or: [{ toyName: { $regex: text, $options: "i" } }],
        })
        .toArray();
      res.send(result);
    });


    app.get("/mytoy/:email", async (req, res) => {
      const sortValue = req.query.sort;

      let sortOption = {};
      if (sortValue === "asc") {
        sortOption = { price: 1 };
      } else if (sortValue === "desc") {
        sortOption = { price: -1 };
      }

      const result = await toyCallection
        .find({ email: req.params.email })
        .sort(sortOption)
        .toArray();

      res.send(result);
    });

    app.delete("/mytoy/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const query = { _id: new ObjectId(id) };
      const result = await toyCallection.deleteOne(query);
      res.send(result);
    });

    app.post("/addedToy", async (req, res) => {
      const body = req.body;
      // console.log(body);
      const result = await toyCallection.insertOne(body);
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
  res.send("Toy Marketplace Server is Running......");
});
app.listen(port, () => {
  console.log(`Toy Marketplace server is running on port: ${port}`);
});
