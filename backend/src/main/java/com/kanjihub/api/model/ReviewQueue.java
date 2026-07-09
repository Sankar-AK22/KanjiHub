package com.kanjihub.api.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "review_queue")
public class ReviewQueue {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "kanji_id")
    private Kanji kanji;

    private LocalDateTime nextReviewDate;
    
    private int intervalDays = 0; // Days until next review
    
    private double easeFactor = 2.5; // SRS multiplier
    
    private int repetitions = 0; // Number of consecutive correct answers

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public Kanji getKanji() { return kanji; }
    public void setKanji(Kanji kanji) { this.kanji = kanji; }

    public LocalDateTime getNextReviewDate() { return nextReviewDate; }
    public void setNextReviewDate(LocalDateTime nextReviewDate) { this.nextReviewDate = nextReviewDate; }

    public int getIntervalDays() { return intervalDays; }
    public void setIntervalDays(int intervalDays) { this.intervalDays = intervalDays; }

    public double getEaseFactor() { return easeFactor; }
    public void setEaseFactor(double easeFactor) { this.easeFactor = easeFactor; }

    public int getRepetitions() { return repetitions; }
    public void setRepetitions(int repetitions) { this.repetitions = repetitions; }
}
