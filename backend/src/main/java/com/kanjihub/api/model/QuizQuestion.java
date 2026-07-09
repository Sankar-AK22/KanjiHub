package com.kanjihub.api.model;

import jakarta.persistence.*;

@Entity
@Table(name = "quiz_questions")
public class QuizQuestion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private int type; // 1-10 as defined in the requirements

    @Column(columnDefinition = "TEXT")
    private String questionData; // JSON or simple text depending on type

    private String correctAnswer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "kanji_id")
    private Kanji kanji;

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public int getType() { return type; }
    public void setType(int type) { this.type = type; }

    public String getQuestionData() { return questionData; }
    public void setQuestionData(String questionData) { this.questionData = questionData; }

    public String getCorrectAnswer() { return correctAnswer; }
    public void setCorrectAnswer(String correctAnswer) { this.correctAnswer = correctAnswer; }

    public Kanji getKanji() { return kanji; }
    public void setKanji(Kanji kanji) { this.kanji = kanji; }
}
