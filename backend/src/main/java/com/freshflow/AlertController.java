package com.freshflow;

import com.mongodb.client.*;
import org.bson.Document;
import org.bson.types.ObjectId;
import io.javalin.http.Context;
import java.util.*;

public class AlertController {
    private final MongoCollection<Document> collection;

    public AlertController(MongoClient mongoClient) {
        this.collection = mongoClient.getDatabase("freshflow_db").getCollection("alerts");
    }

    public void getAllAlerts(Context ctx) {
        try {
            List<Document> alerts = new ArrayList<>();
            for (Document doc : collection.find()) {
                doc.put("id", doc.getObjectId("_id").toString());
                alerts.add(doc);
            }
            ctx.json(alerts);
        } catch (Exception e) {
            ctx.status(500).result("Failed to fetch alerts: " + e.getMessage());
        }
    }

    public void addAlert(Context ctx) {
        try {
            Document doc = Document.parse(ctx.body());
            collection.insertOne(doc);
            ctx.status(201).json(Map.of("message", "Alert created"));
        } catch (Exception e) {
            ctx.status(500).result("Failed to add alert: " + e.getMessage());
        }
    }

    public void deleteAlert(Context ctx) {
        try {
            String id = ctx.pathParam("id");
            collection.deleteOne(new org.bson.Document("_id", new ObjectId(id)));
            ctx.status(204);
        } catch (Exception e) {
            ctx.status(500).result("Failed to delete alert: " + e.getMessage());
        }
    }
}