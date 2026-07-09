package com.kanjihub.api.service;

import com.kanjihub.api.model.Kanji;
import com.kanjihub.api.model.ReviewQueue;
import com.kanjihub.api.model.User;
import com.kanjihub.api.repository.ReviewQueueRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ReviewService {

    @Autowired
    private ReviewQueueRepository reviewQueueRepository;

    public List<ReviewQueue> getReviewsForToday(Long userId) {
        return reviewQueueRepository.findByUserIdAndNextReviewDateBefore(userId, LocalDateTime.now().plusDays(1));
    }

    @Transactional
    public void submitReview(Long reviewId, boolean isCorrect) {
        ReviewQueue review = reviewQueueRepository.findById(reviewId)
                .orElseThrow(() -> new IllegalArgumentException("Review not found"));

        if (isCorrect) {
            int currentInterval = review.getIntervalDays();
            if (currentInterval == 0) {
                review.setIntervalDays(1);
            } else if (currentInterval == 1) {
                review.setIntervalDays(3);
            } else {
                review.setIntervalDays((int) Math.round(currentInterval * review.getEaseFactor()));
            }
            review.setRepetitions(review.getRepetitions() + 1);
            review.setEaseFactor(review.getEaseFactor() + 0.1);
        } else {
            review.setRepetitions(0);
            review.setIntervalDays(0);
            review.setEaseFactor(Math.max(1.3, review.getEaseFactor() - 0.2));
        }

        review.setNextReviewDate(LocalDateTime.now().plusDays(review.getIntervalDays()));
        reviewQueueRepository.save(review);
    }
    
    @Transactional
    public ReviewQueue addNewKanjiToReview(User user, Kanji kanji) {
        ReviewQueue review = new ReviewQueue();
        review.setUser(user);
        review.setKanji(kanji);
        review.setNextReviewDate(LocalDateTime.now());
        review.setIntervalDays(0);
        review.setEaseFactor(2.5);
        review.setRepetitions(0);
        
        return reviewQueueRepository.save(review);
    }
}
