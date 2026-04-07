package com.freshflow;

import com.mongodb.client.*;
import org.bson.Document;
import io.javalin.http.Context;
import java.util.*;

public class DashController {
    private final MongoCollection<Document> collection;

    public DashController(MongoClient mongoClient) {
        this.collection = mongoClient.getDatabase("freshflow_db").getCollection("inventory");
    }

    public void getSystemStats(Context ctx) {
        try {
            double totalValue = 0.0;
            double estimatedLoss = 0.0;
            double foodValue = 0.0, electronicsValue = 0.0, cosmeticsValue = 0.0, medicalValue = 0.0;

            FindIterable<Document> allItems = collection.find();

            for (Document item : allItems) {
                // Safe extraction with defaults
                Object qtyObj = item.get("qty");
                int qty = 0;
                if (qtyObj instanceof Number) {
                    qty = ((Number) qtyObj).intValue();
                } else if (qtyObj instanceof String) {
                    try {
                        qty = Integer.parseInt((String) qtyObj);
                    } catch (NumberFormatException e) {
                        qty = 0;
                    }
                }

                Object priceObj = item.get("price");
                double price = 0.0;
                if (priceObj instanceof Number) {
                    price = ((Number) priceObj).doubleValue();
                } else if (priceObj instanceof String) {
                    try {
                        price = Double.parseDouble((String) priceObj);
                    } catch (NumberFormatException e) {
                        price = 0.0;
                    }
                }

                String category = item.getString("category");
                if (category == null) category = "";
                category = category.toUpperCase();

                String expiryDate = item.getString("expiry");
                if (expiryDate == null) expiryDate = "";

                double itemValue = qty * price;
                totalValue += itemValue;

                long daysLeft = expiry.calculateDaysLeft(expiryDate);
                if (daysLeft >= 0 && daysLeft <= 7) {
                    estimatedLoss += itemValue;
                }

                // Calculate value by category (not just count)
                switch (category) {
                    case "FOOD" -> foodValue += itemValue;
                    case "ELECTRONICS" -> electronicsValue += itemValue;
                    case "COSMETICS" -> cosmeticsValue += itemValue;
                    case "PHARMACY", "MEDICAL" -> medicalValue += itemValue;
                }
            }

            Map<String, Object> stats = new HashMap<>();
            stats.put("totalValue", totalValue);
            stats.put("estimatedLoss", estimatedLoss);
            
            // Calculate category ratios by value (more meaningful for inventory)
            double total = totalValue > 0 ? totalValue : 1;
            stats.put("foodRatio", (int) Math.round(100.0 * foodValue / total));
            stats.put("electronicsRatio", (int) Math.round(100.0 * electronicsValue / total));
            stats.put("cosmeticsRatio", (int) Math.round(100.0 * cosmeticsValue / total));
            stats.put("medicalRatio", (int) Math.round(100.0 * medicalValue / total));

            ctx.json(stats);
        } catch (Exception e) { ctx.status(500).result(e.getMessage()); }
    }
}