package com.university.backend.util;

import org.springframework.stereotype.Component;
import java.util.regex.Pattern;

@Component
public class InputSanitizer {
    
    // Patterns for dangerous content
    private static final Pattern SCRIPT_PATTERN = Pattern.compile("<script[^>]*>.*?</script>", Pattern.CASE_INSENSITIVE | Pattern.DOTALL);
    private static final Pattern JAVASCRIPT_PATTERN = Pattern.compile("javascript:", Pattern.CASE_INSENSITIVE);
    private static final Pattern ON_EVENT_PATTERN = Pattern.compile("on\\w+\\s*=", Pattern.CASE_INSENSITIVE);
    private static final Pattern HTML_TAG_PATTERN = Pattern.compile("<[^>]+>", Pattern.CASE_INSENSITIVE);
    private static final Pattern NULL_BYTE_PATTERN = Pattern.compile("\\x00");
    private static final Pattern CONTROL_CHAR_PATTERN = Pattern.compile("[\\x00-\\x1F\\x7F]");
    
    /**
     * Sanitize input by removing dangerous content
     */
    public String sanitize(String input) {
        if (input == null) {
            return null;
        }
        
        try {
            String sanitized = input;
            
            // Remove script tags
            sanitized = SCRIPT_PATTERN.matcher(sanitized).replaceAll("");
            
            // Remove javascript: protocol
            sanitized = JAVASCRIPT_PATTERN.matcher(sanitized).replaceAll("");
            
            // Remove on* event handlers
            sanitized = ON_EVENT_PATTERN.matcher(sanitized).replaceAll("");
            
            // Remove HTML tags (optional - can be configured)
            // sanitized = HTML_TAG_PATTERN.matcher(sanitized).replaceAll("");
            
            // Remove null bytes
            sanitized = NULL_BYTE_PATTERN.matcher(sanitized).replaceAll("");
            
            // Remove control characters
            sanitized = CONTROL_CHAR_PATTERN.matcher(sanitized).replaceAll("");
            
            return sanitized.trim();
        } catch (Exception e) {
            // If there's any error processing the input, return empty string
            return "";
        }
    }
    
    /**
     * Check if input contains dangerous content
     */
    public boolean containsDangerousContent(String input) {
        if (input == null) {
            return false;
        }
        
        try {
            return SCRIPT_PATTERN.matcher(input).find() ||
                   JAVASCRIPT_PATTERN.matcher(input).find() ||
                   ON_EVENT_PATTERN.matcher(input).find() ||
                   NULL_BYTE_PATTERN.matcher(input).find() ||
                   CONTROL_CHAR_PATTERN.matcher(input).find();
        } catch (Exception e) {
            // If there's any error processing the input, consider it dangerous
            return true;
        }
    }
    
    /**
     * Check if input contains emojis (specific emoji ranges only)
     */
    public boolean containsEmojis(String input) {
        if (input == null) {
            return false;
        }
        
        try {
            // Check for specific emoji patterns only, excluding legitimate Unicode text
            return input.codePoints().anyMatch(codePoint -> 
                (codePoint >= 0x1F600 && codePoint <= 0x1F64F) || // Emoticons
                (codePoint >= 0x1F300 && codePoint <= 0x1F5FF) || // Misc Symbols
                (codePoint >= 0x1F680 && codePoint <= 0x1F6FF) || // Transport
                (codePoint >= 0x1F700 && codePoint <= 0x1F77F) || // Alchemical Symbols
                (codePoint >= 0x1F780 && codePoint <= 0x1F7FF) || // Geometric Shapes Extended
                (codePoint >= 0x1F800 && codePoint <= 0x1F8FF) || // Supplemental Arrows-C
                (codePoint >= 0x1F900 && codePoint <= 0x1F9FF) || // Supplemental Symbols and Pictographs
                (codePoint >= 0x1FA00 && codePoint <= 0x1FA6F) || // Chess Symbols
                (codePoint >= 0x1FA70 && codePoint <= 0x1FAFF) || // Symbols and Pictographs Extended-A
                (codePoint >= 0x2600 && codePoint <= 0x26FF) ||   // Misc symbols
                (codePoint >= 0x2700 && codePoint <= 0x27BF)      // Dingbats
            );
        } catch (Exception e) {
            // If there's any error processing the input, assume no emojis
            return false;
        }
    }
}