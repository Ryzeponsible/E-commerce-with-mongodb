import express from "express";
import { MongoClient, ObjectId } from "mongodb";
const app = express();
const url = "mongodb://localhost:27017";
const dbName = "eCommerce";

app.use(express.static("public"));
app.use(express.json());

// get all the items in db
app.get("/items", async (req, res) => {
  try {
    const client = await MongoClient.connect(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    const db = client.db(dbName);
    const collection = db.collection("items");
    const items = await collection.find({}).toArray();
    res.json(items);
    client.close();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// get item by id
app.get("/items/:id", async (req, res) => {
  const itemId = req.params.id;

  try {
    const client = await MongoClient.connect(url);

    const db = client.db(dbName);
    const collection = db.collection("items");
    const item = await collection.findOne({ _id: new ObjectId(itemId) });

    if (item) {
      res.json(item);
    } else {
      res.status(404).json({ error: "Item not found" });
    }
    client.close();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// decrease the stock
app.post("/api/decreaseStock", async (req, res) => {
  const items = req.body.items;

  try {
    const client = await MongoClient.connect(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    const db = client.db(dbName);
    const collection = db.collection("items");

    const bulkOps = items.map((item) => ({
      updateOne: {
        filter: { _id: new ObjectId(item.id) },
        update: { $inc: { stock: -item.quantity } },
      },
    }));

    await collection.bulkWrite(bulkOps);

    client.close();
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Handle checkout
app.post("/checkout", async (req, res) => {
  const { items, totalAmount } = req.body;

  try {
    const client = await MongoClient.connect(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    const db = client.db(dbName);
    const collection = db.collection("items");

    // Decrease stock for each item
    const bulkOps = items.map((item) => ({
      updateOne: {
        filter: { _id: new ObjectId(item.id) },
        update: { $inc: { stock: -item.quantity } },
      },
    }));

    await collection.bulkWrite(bulkOps);



    client.close();
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
