package com.freshflow;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.time.temporal.ChronoUnit;

public class expiry {
    private static final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    public static long calculateDaysLeft(String expiryDateStr) {
        if (expiryDateStr == null || expiryDateStr.isEmpty()) return 0;
        try {
            LocalDate expiryDate = parseDate(expiryDateStr);
            LocalDate today = LocalDate.now();
            return ChronoUnit.DAYS.between(today, expiryDate);
        } catch (DateTimeParseException e) {
            return 0;
        }
    }

    public static long calculateLifeSpan(String storedDateStr, String expiryDateStr) {
        if (storedDateStr == null || storedDateStr.isEmpty() || expiryDateStr == null || expiryDateStr.isEmpty()) {
            return 0;
        }
        try {
            LocalDate storedDate = parseDate(storedDateStr);
            LocalDate expiryDate = parseDate(expiryDateStr);
            return ChronoUnit.DAYS.between(storedDate, expiryDate);
        } catch (DateTimeParseException e) {
            return 0;
        }
    }

    private static LocalDate parseDate(String dateStr) {
        try {
            return LocalDate.parse(dateStr, formatter);
        } catch (DateTimeParseException e) {
            return LocalDate.parse(dateStr);
        }
    }
}

