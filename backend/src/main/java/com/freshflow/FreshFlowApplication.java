package com.freshflow;

import io.javalin.Javalin;
import org.jdbi.v3.core.Jdbi;

public class FreshFlowApplication {
    public static void main(String[] args) {
        
        // Persistent File-Based Database
        String dbUrl = "jdbc:h2:file:./freshflow_db;AUTO_SERVER=TRUE;DB_CLOSE_DELAY=-1";
        Jdbi jdbi = Jdbi.create(dbUrl);

        jdbi.useHandle(handle -> {
            // Re-create table with VARCHAR dates to prevent SQL date errors
            handle.execute("CREATE TABLE IF NOT EXISTS inventory (" +
                "id INTEGER PRIMARY KEY AUTO_INCREMENT, " +
                "name VARCHAR(100), " +
                "category VARCHAR(50), " + 
                "qty INTEGER, " +
                "price DOUBLE, " +
                "vendor VARCHAR(100), " + 
                "stored VARCHAR(20), " +    
                "expiry VARCHAR(20), " +    
                "threshold INTEGER DEFAULT 5, " +
                "grade VARCHAR(5) DEFAULT 'A', " +
                "quality VARCHAR(20) DEFAULT 'High')"); 
            
            Integer count = handle.createQuery("SELECT COUNT(*) FROM inventory").mapTo(Integer.class).one();
            if (count == 0) {
                System.out.println("📦 Initializing Demo Inventory...");
                // Note: Sample data with various categories
                handle.execute("INSERT INTO inventory (name, category, qty, price, vendor, stored, expiry, grade, quality) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                    "Organic Milk", "FOOD", 20, 60.0, "Nagpur Dairy", "2026-03-31", "2026-04-10", "A", "High");
                handle.execute("INSERT INTO inventory (name, category, qty, price, vendor, stored, expiry, grade, quality) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                    "Smartphone X", "ELECTRONICS", 10, 25000.0, "TechHub", "2026-01-01", "2028-12-30", "A", "Excellent");
            }
        });

        AddonController addon = new AddonController(jdbi);
        DashController dash = new DashController(jdbi);

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

        System.out.println("\n🚀 FRESHFLOW CORE: ONLINE & STABLE\n");
    }
}