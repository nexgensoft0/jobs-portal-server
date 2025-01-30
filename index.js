const express = require("express");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());
app.use(cookieParser());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER_NAME}:${process.env.DB_USER_PASSWORD}@cluster0.l8qzz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    const userCollection = client.db("jobUserDB").collection("users");
    const jobsCollection = client.db("jobsDB").collection("jobs");

    //-----------------jwt token related api----------------------------

    app.post("/jwt", (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.JWT_ACCESS_TOKEN, {
        expiresIn: "1h",
      });
      res
        .cookie("token", token, {
          httpOnly: true,
          secure: false,
        })
        .send({ success: true });
    });

    //-----------------JOb related api-----------------------------------

    app.get("/jobs", async (req, res) => {
      const email = req.query.email;
      let query = {};

      const jobs = await jobsCollection.find().toArray();
      res.send(jobs);
    });
    app.get("/jobs/:id", async (req, res) => {
      const id = req.params.id;
      const jobs = { _id: new ObjectId(id) };
      const result = await jobsCollection.findOne(jobs);
      res.send(result);
    });

    app.post("/jobs", async (req, res) => {
      const jobs = req.body;
      const result = await jobsCollection.insertOne(jobs);
      res.send(result);
    });
    //put
    app.put("/jobs/:id", async (req, res) => {
      const id = req.params.id;
      const jobs = req.body;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const jobsDoc = {
        $set: {
          name: jobs.name,
        },
      };
      const result = await jobsCollection.updateOne(filter, jobsDoc, options);
      res.send(result);
    });

    app.delete("/jobs/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await jobsCollection.deleteOne(query);
      res.send(result);
    });
    //------------------users related api---------------------------------
    app.get("/users", async (req, res) => {
      const allUser = await userCollection.find().toArray();
      res.send(allUser);
    });
    app.get("/users/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await userCollection.findOne(query);
      res.send(result);
    });

    app.post("/users", async (req, res) => {
      const user = req.body;
      const result = await userCollection.insertOne(user);
      res.send(result);
    });
    //put or patch
    app.put("/users/:id", async (req, res) => {
      const id = req.params.id;
      const user = req.body;
      const query = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const userInfo = {
        $set: {
          name: user.name,
        },
      };
      const result = await userCollection.updateOne(query, userInfo, options);
      res.send(result);
    });

    app.delete("/users/:id", async (req, res) => {
      const id = req.params.id;
      const user = req.body;
      const query = { _id: new ObjectId(id) };
      const result = await userCollection.deleteOne(user, query);
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
  res.send("hello dev");
});
app.listen(port, () => {
  console.log(`server is at ${port} server`);
});
