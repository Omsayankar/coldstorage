package com.freshflow;

import io.javalin.http.Context;
import org.jdbi.v3.core.Jdbi;
import java.util.Map;

public class DashController {
    private final Jdbi jdbi;
    public DashController(Jdbi jdbi) { this.jdbi = jdbi; }

    public void getSystemStats(Context ctx) {
        try {
            Map<String, Object> stats = jdbi.withHandle(handle -> 
                handle.createQuery("SELECT " +
                    "CAST(COALESCE(SUM(qty * price), 0) AS DOUBLE) as totalValue, " +
                    "CAST(COALESCE(SUM(CASE WHEN expiry <= CURRENT_DATE + 7 THEN (qty * price) ELSE 0 END), 0) AS DOUBLE) as estimatedLoss, " +
                    "CAST(COALESCE(ROUND(100.0 * SUM(CASE WHEN category = 'FOOD' THEN 1 ELSE 0 END) / NULLIF(COUNT(*), 0)), 0) AS INTEGER) as foodRatio, " +
                    "CAST(COALESCE(ROUND(100.0 * SUM(CASE WHEN category = 'COSMETICS' THEN 1 ELSE 0 END) / NULLIF(COUNT(*), 0)), 0) AS INTEGER) as cosmeticsRatio, " +
                    "CAST(COALESCE(ROUND(100.0 * SUM(CASE WHEN category = 'ELECTRONICS' THEN 1 ELSE 0 END) / NULLIF(COUNT(*), 0)), 0) AS INTEGER) as electronicsRatio, " +
                    "CAST(COALESCE(ROUND(100.0 * SUM(CASE WHEN category = 'MEDICAL' THEN 1 ELSE 0 END) / NULLIF(COUNT(*), 0)), 0) AS INTEGER) as medicalRatio " +
                    "FROM inventory")
                    .mapToMap()
                    .one()
            );
            ctx.json(stats);
        } catch (Exception e) {
            ctx.status(500).result("SQL_ERROR: " + e.getMessage());
        }
    }
}