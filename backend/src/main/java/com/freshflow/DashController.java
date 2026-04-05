package com.freshflow;

import io.javalin.http.Context;
import org.jdbi.v3.core.Jdbi;
import java.util.*;

public class DashController {
    private final Jdbi jdbi;
    public DashController(Jdbi jdbi) { this.jdbi = jdbi; }

    public void getSystemStats(Context ctx) {
        try {
            jdbi.useHandle(handle -> {
                List<Map<String, Object>> allItems = handle.createQuery("SELECT qty, price, category, expiry FROM inventory").mapToMap().list();
                double totalValue = 0.0;
                double estimatedLoss = 0.0;
                int foodCount = 0;
                int electronicsCount = 0;
                int cosmeticsCount = 0;
                int medicalCount = 0;

                for (Map<String, Object> item : allItems) {
                    int qty = item.get("qty") != null ? ((Number) item.get("qty")).intValue() : 0;
                    double price = item.get("price") != null ? ((Number) item.get("price")).doubleValue() : 0.0;
                    String category = item.get("category") != null ? item.get("category").toString() : "";
                    String expiryDate = item.get("expiry") != null ? item.get("expiry").toString() : "";

                    double itemValue = qty * price;
                    totalValue += itemValue;

                    // UPDATED: Logic for Estimated Loss (7-day window)
                    long daysLeft = expiry.calculateDaysLeft(expiryDate);
                    if (daysLeft >= 0 && daysLeft <= 7) {
                        estimatedLoss += itemValue;
                    }

                    switch (category.toUpperCase()) {
                        case "FOOD" -> foodCount++;
                        case "ELECTRONICS" -> electronicsCount++;
                        case "COSMETICS" -> cosmeticsCount++;
                        case "PHARMACY", "MEDICAL" -> medicalCount++;
                    }
                }

                int itemCount = allItems.size();
                Map<String, Object> stats = new HashMap<>();
                stats.put("totalValue", totalValue);
                stats.put("estimatedLoss", estimatedLoss);
                stats.put("foodRatio", itemCount > 0 ? (int) Math.round(100.0 * foodCount / itemCount) : 0);
                stats.put("electronicsRatio", itemCount > 0 ? (int) Math.round(100.0 * electronicsCount / itemCount) : 0);
                stats.put("cosmeticsRatio", itemCount > 0 ? (int) Math.round(100.0 * cosmeticsCount / itemCount) : 0);
                stats.put("medicalRatio", itemCount > 0 ? (int) Math.round(100.0 * medicalCount / itemCount) : 0);

                ctx.json(stats);
            });
        } catch (Exception e) { ctx.status(500).result(e.getMessage()); }
    }
}