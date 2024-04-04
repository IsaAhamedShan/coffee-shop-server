const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
app.use(express.json());
const port = 5000;
app.use(cors());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.jeu0kz0.mongodb.net/?retryWrites=true&w=majority`;
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
    const database = client.db("coffeeShop");
    const coffeeCollection = database.collection("coffeeDetails");
    const userCollection = database.collection("userCollection");
    const userPurchaseCollection = database.collection(
      "userPurchaseCollection"
    );
    //USER related CRUD

    app.get("/users", async (req, res) => {
      const datafromDb = userCollection.find();
      const theData = await datafromDb.toArray();
      res.send(theData);
    });
    app.get("/user/:id", async (req, res) => {
      const email = req.params.id;
      console.log(email);

      const query = { email: email };
      const user = await userCollection.findOne(query);
      console.log("user", user);
      res.send(user);
    });

    app.post("/saveCart", async (req, res) => {
      const data = req.body;
      console.log(data);
      let result = await userPurchaseCollection.insertOne(data);
      res.send(result);
    });
    app.post("/user", async (req, res) => {
      const data = req.body;

      const result = await userCollection.insertOne(data);
      res.send(result);
    });
    app.delete("/user/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const d = userCollection.deleteOne(query);
      res.send(d);
    });

    app.patch("/users", async (req, res) => {
      // const email = req.params.email;
      const { email, lastSignInTime } = req.body;
      const dataCount = await userCollection.countDocuments();
      // console.log(dataCount)
      if (dataCount === 0) {
        req.body.admin = "true";
      }
      console.log(req.body);
      const query = { email: email };
      const options = { upsert: true };
      const updateDoc = req.body.admin
        ? {
            $set: {
              lastSignInTime: lastSignInTime,
              admin: "true",
            },
          }
        : {
            $set: {
              lastSignInTime: lastSignInTime,
            },
          };
      const result = await userCollection.updateOne(query, updateDoc, options);
      res.send(result);
    });
    // coffee related CRUD
    app.get("/coffee", async (req, res) => {
      const datafromdb = coffeeCollection.find();
      const dataa = await datafromdb.toArray();
      res.send(dataa);
    });

    app.post("/insert", async (req, res) => {
      const data = req.body;
      const result = await coffeeCollection.insertOne(data);
      res.send(result);
    });
    app.delete("/coffee/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await coffeeCollection.deleteOne(query);
      res.send(result);
    });
    app.put("/update/:id", async (req, res) => {
      const coffee = req.body;
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          name: coffee.name,
          supplier: coffee.supplier,
          chef: coffee.chef,
          category: coffee.category,
          taste: coffee.taste,
          details: coffee.details,
          photo: coffee.photo,
          price: coffee.price,
        },
      };
      const result = await coffeeCollection.updateOne(
        query,
        updateDoc,
        options
      );
      res.send(result);
    });

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
// app.options("*", cors());

run().catch(console.dir);

app.listen(port, () => {
  console.log(`listening port no: ${port}`);
});
