package com.kanjihub.api.controller;

import com.kanjihub.api.model.ReviewQueue;
import com.kanjihub.api.service.ReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/review")
@CrossOrigin(origins = "*") // For development
public class ReviewController {

    @Autowired
    private ReviewService reviewService;

    // For simplicity, we hardcode userId for now until JWT is fully integrated
    @GetMapping("/queue")
    public ResponseEntity<List<ReviewQueue>> getReviewQueue(@RequestParam(defaultValue = "1") Long userId) {
        List<ReviewQueue> queue = reviewService.getReviewsForToday(userId);
        return ResponseEntity.ok(queue);
    }

    @PostMapping("/submit/{reviewId}")
    public ResponseEntity<Void> submitReview(@PathVariable Long reviewId, @RequestParam boolean isCorrect) {
        reviewService.submitReview(reviewId, isCorrect);
        return ResponseEntity.ok().build();
    }
}
