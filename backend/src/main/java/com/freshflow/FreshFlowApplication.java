package com.freshflow;

import io.javalin.Javalin;
import org.jdbi.v3.core.Jdbi;

public class FreshFlowApplication {
    public static void main(String[] args) {
        
        // 1. DATABASE INIT (H2 SQL - In-Memory preserved)
        String dbUrl = "jdbc:h2:mem:freshflow;DB_CLOSE_DELAY=-1";
        Jdbi jdbi = Jdbi.create(dbUrl);

        // Setup Table with new columns for professional features
        jdbi.useHandle(handle -> {
            handle.execute("DROP TABLE IF EXISTS inventory"); 
            handle.execute("CREATE TABLE inventory (" +
                "id INTEGER PRIMARY KEY AUTO_INCREMENT, " +
                "name VARCHAR(100), " +
                "category VARCHAR(50), " + 
                "qty INTEGER, " +
                "price DOUBLE, " +
                "vendor VARCHAR(100), " +
                "stored DATE, " +    
                "expiry DATE, " +    
                "threshold INTEGER DEFAULT 5)"); 
            
            // Initial Seed for Demo
            handle.execute("INSERT INTO inventory (name, category, qty, price, vendor, stored, expiry, threshold) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                "Organic Milk", "FOOD", 10, 60.0, "JIT Dairy", "2026-03-31", "2026-04-05", 5);
        });

        // 2. CONTROLLER INIT
        AddonController addon = new AddonController(jdbi);
        DashController dash = new DashController(jdbi);

        // 3. SERVER START
        var app = Javalin.create(config -> {
            config.bundledPlugins.enableCors(cors -> cors.addRule(it -> it.anyHost()));
        }).start(8080);

        // --- ROUTE MAPPING ---
        app.get("/api/items", addon::getAllItems);
        app.post("/api/items", addon::addItem);
        
        // Register Delete Route with Path Parameter {id}
        app.delete("/api/items/{id}", addon::deleteItem); 
        
        app.get("/api/stats", dash::getSystemStats);

        System.out.println("\n" + "=".repeat(40));
        System.out.println("🚀 FRESHFLOW MODULAR SQL ENGINE: ONLINE");
        System.out.println("LOGIC: CATEGORY TRACKING & LOSS ANALYTICS");
        System.out.println("ROUTES: GET/POST/DELETE ENABLED");
        System.out.println("=".repeat(40) + "\n");
    }
}