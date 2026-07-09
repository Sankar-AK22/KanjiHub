package com.kanjihub.api.model;

import jakarta.persistence.*;

@Entity
@Table(name = "kanjis")
public class Kanji {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String character;

    @Column(nullable = false)
    private String meaning;

    private String onReading;

    private String kunReading;

    private String strokeOrderUrl;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lesson_id")
    private Lesson lesson;

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getCharacter() { return character; }
    public void setCharacter(String character) { this.character = character; }

    public String getMeaning() { return meaning; }
    public void setMeaning(String meaning) { this.meaning = meaning; }

    public String getOnReading() { return onReading; }
    public void setOnReading(String onReading) { this.onReading = onReading; }

    public String getKunReading() { return kunReading; }
    public void setKunReading(String kunReading) { this.kunReading = kunReading; }

    public String getStrokeOrderUrl() { return strokeOrderUrl; }
    public void setStrokeOrderUrl(String strokeOrderUrl) { this.strokeOrderUrl = strokeOrderUrl; }

    public Lesson getLesson() { return lesson; }
    public void setLesson(Lesson lesson) { this.lesson = lesson; }
}
