package com.freshflow;

import io.javalin.http.Context;
import org.jdbi.v3.core.Jdbi;
import java.util.*;

public class AddonController {
    private final Jdbi jdbi;
    public AddonController(Jdbi jdbi) { this.jdbi = jdbi; }

    public void getAllItems(Context ctx) {
        List<Map<String, Object>> items = jdbi.withHandle(handle -> 
            handle.createQuery("SELECT * FROM inventory ORDER BY id DESC").mapToMap().list()
        );

        // Use your 'expiry.java' class to calculate lifespan and days left
        for (Map<String, Object> item : items) {
            String storedDate = (String) item.get("stored");
            String expiryDate = (String) item.get("expiry");
            item.put("lifespan", expiry.calculateLifeSpan(storedDate, expiryDate));
            item.put("days_left", expiry.calculateDaysLeft(expiryDate));
        }
        ctx.json(items);
    }

    public void getExpiryZones(Context ctx) {
        List<Map<String, Object>> all = jdbi.withHandle(handle -> 
            handle.createQuery("SELECT name, expiry FROM inventory").mapToMap().list()
        );

        List<Map<String, Object>> critical = new ArrayList<>();
        for (Map<String, Object> item : all) {
            long days = expiry.calculateDaysLeft((String) item.get("expiry"));
            if (days >= 0 && days <= 7) {
                Map<String, Object> threat = new HashMap<>();
                threat.put("name", item.get("name"));
                threat.put("days_left", days);
                critical.add(threat);
            }
        }
        Map<String, Object> response = new HashMap<>();
        response.put("critical", critical);
        ctx.json(response);
    }

    public void addItem(Context ctx) {
        Map<String, Object> body = ctx.bodyAsClass(Map.class);
        jdbi.useHandle(handle -> 
            handle.execute("INSERT INTO inventory (name, category, qty, price, vendor, stored, expiry, grade, quality) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                body.get("name"), body.get("category"), body.get("qty"), body.get("price"), 
                body.get("vendor"), body.get("stored"), body.get("expiry"), body.get("grade"), body.get("quality"))
        );
        ctx.status(201);
    }

    public void updateItem(Context ctx) {
        String id = ctx.pathParam("id");
        @SuppressWarnings("unchecked")
        Map<String, Object> body = ctx.bodyAsClass(Map.class);
        jdbi.useHandle(handle -> 
            handle.execute("UPDATE inventory SET name=?, vendor=?, qty=?, price=?, stored=?, expiry=?, category=?, grade=?, quality=? WHERE id=?",
                body.get("name"), body.get("vendor"), body.get("qty"), body.get("price"), 
                body.get("stored"), body.get("expiry"), body.get("category"), body.get("grade"), body.get("quality"), id)
        );
        ctx.status(200);
    }

    public void deleteItem(Context ctx) {
        jdbi.useHandle(handle -> handle.execute("DELETE FROM inventory WHERE id = ?", ctx.pathParam("id")));
        ctx.status(204);
    }
}