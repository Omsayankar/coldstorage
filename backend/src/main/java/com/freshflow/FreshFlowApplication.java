package com.freshflow;

import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import io.javalin.Javalin;

public class FreshFlowApplication {
    public static void main(String[] args) {
        
        // STABLE CONNECTION STRING
        // Replace <db_password> with your actual password (not your Google password, the Database User password)
String connectionString = "mongodb+srv://omsayankar:0FsnhsH3d60oVgpU@cluster0.8u9hcuz.mongodb.net/freshflow_db?retryWrites=true&w=majority";
        
        try {
            MongoClient mongoClient = MongoClients.create(connectionString);
            
            AddonController addon = new AddonController(mongoClient);
            DashController dash = new DashController(mongoClient);
            AlertController alert = new AlertController(mongoClient);

            var app = Javalin.create(config -> {
                config.bundledPlugins.enableCors(cors -> cors.addRule(it -> it.anyHost()));
            }).start(8080);

            // API Endpoints
            app.get("/api/items", addon::getAllItems);
            app.post("/api/items", addon::addItem);
            app.put("/api/items/{id}", addon::updateItem); 
            app.delete("/api/items/{id}", addon::deleteItem); 
            app.get("/api/stats", dash::getSystemStats);
            app.get("/api/expiry-zones", addon::getExpiryZones);
            
            // Alert endpoints
            app.get("/api/alerts", alert::getAllAlerts);
            app.post("/api/alerts", alert::addAlert);
            app.delete("/api/alerts/{id}", alert::deleteAlert);

            System.out.println("\n🚀 FRESHFLOW ATLAS: ONLINE & STABLE\n");
            
            // Keeps server alive in Maven
            Thread.currentThread().join();

        } catch (Exception e) {
            System.err.println("❌ MongoDB Connection Failed: " + e.getMessage());
        }
    }
}