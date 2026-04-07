package com.freshflow;

import com.mongodb.client.*;
import org.bson.Document;
import org.bson.types.ObjectId;
import io.javalin.http.Context;
import java.util.*;
import static com.mongodb.client.model.Filters.eq;

public class AddonController {
    private final MongoCollection<Document> collection;

    public AddonController(MongoClient mongoClient) {
        this.collection = mongoClient.getDatabase("freshflow_db").getCollection("inventory");
    }

    public void getAllItems(Context ctx) {
        List<Document> items = new ArrayList<>();
        for (Document doc : collection.find()) {
            doc.put("id", doc.getObjectId("_id").toString());
            
            // Calculate days left for the table display
            String expiryDate = doc.getString("expiry");
            long daysLeft = expiry.calculateDaysLeft(expiryDate);
            
            doc.put("days_left", daysLeft);
            items.add(doc);
        }
        ctx.json(items);
    }

    public void updateItem(Context ctx) {
        try {
            String id = ctx.pathParam("id");
            Document body = Document.parse(ctx.body());
            
            // Cleanup: Mongo doesn't need these calculated fields or the String ID
            body.remove("id");
            body.remove("_id");
            body.remove("days_left");
            body.remove("lifespan");
            body.remove("_computedDaysLeft");

            // Use $set to preserve other fields like category if they aren't in the edit
            collection.updateOne(eq("_id", new ObjectId(id)), new Document("$set", body));
            ctx.status(200);
        } catch (Exception e) {
            ctx.status(500).result("Sync Failed: " + e.getMessage());
        }
    }

    // Keep your existing addItem, getExpiryZones, and deleteItem methods same...
    public void addItem(Context ctx) { 
        try {
            Document doc = Document.parse(ctx.body());
            collection.insertOne(doc);
            ctx.status(201).json(Map.of("message", "Item created"));
        } catch (Exception e) {
            ctx.status(500).result("Add item failed: " + e.getMessage());
        }
    }

    public void getExpiryZones(Context ctx) {
        List<Map<String, Object>> critical = new ArrayList<>();
        for (Document doc : collection.find()) {
            long days = expiry.calculateDaysLeft(doc.getString("expiry"));
            if (days >= 0 && days <= 7) {
                Map<String, Object> threat = new HashMap<>();
                threat.put("name", doc.get("name"));
                threat.put("days_left", days);
                critical.add(threat);
            }
        }
        ctx.json(Collections.singletonMap("critical", critical));
    }

    public void deleteItem(Context ctx) {
        try {
            String id = ctx.pathParam("id");
            collection.deleteOne(eq("_id", new ObjectId(id)));
            ctx.status(204);
        } catch (Exception e) {
            ctx.status(500).result("Delete item failed: " + e.getMessage());
        }
    }
}