package com.freshflow;

import io.javalin.http.Context;
import org.jdbi.v3.core.Jdbi;
import java.util.List;
import java.util.Map;

public class AddonController {
    private final Jdbi jdbi;

    public AddonController(Jdbi jdbi) {
        this.jdbi = jdbi;
    }

    // GET /api/items - MODIFIED: Calculates Days Left directly in SQL
    public void getAllItems(Context ctx) {
        List<Map<String, Object>> items = jdbi.withHandle(handle -> 
            handle.createQuery("SELECT *, DATEDIFF('DAY', CURRENT_DATE, expiry) AS days_left FROM inventory ORDER BY expiry ASC")
                  .mapToMap()
                  .list()
        );
        ctx.json(items);
    }

    // POST /api/items - Preserved exactly as before
    @SuppressWarnings("unchecked")
    public void addItem(Context ctx) {
        Map<String, Object> body = ctx.bodyAsClass(Map.class);
        jdbi.useHandle(handle -> 
            handle.execute("INSERT INTO inventory (name, category, qty, price, vendor, stored, expiry, threshold) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                body.get("name"), 
                body.get("category"), 
                body.get("qty"), 
                body.get("price"), 
                body.get("vendor"), 
                body.get("stored"), 
                body.get("expiry"), 
                body.get("threshold"))
        );
        ctx.status(201).result("ITEM_ADDED");
    }

    // DELETE /api/items/{id} - Preserved exactly as before
    public void deleteItem(Context ctx) {
        String id = ctx.pathParam("id");
        int rowsDeleted = jdbi.withHandle(handle -> 
            handle.execute("DELETE FROM inventory WHERE id = ?", id)
        );
        
        if (rowsDeleted > 0) {
            ctx.status(204);
        } else {
            ctx.status(404).result("ITEM_NOT_FOUND");
        }
    }
}