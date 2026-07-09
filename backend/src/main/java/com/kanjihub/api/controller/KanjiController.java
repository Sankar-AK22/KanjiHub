package com.kanjihub.api.controller;

import com.kanjihub.api.model.Kanji;
import com.kanjihub.api.model.Lesson;
import com.kanjihub.api.repository.KanjiRepository;
import com.kanjihub.api.repository.LessonRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class KanjiController {

    @Autowired
    private LessonRepository lessonRepository;

    @Autowired
    private KanjiRepository kanjiRepository;

    @GetMapping("/lessons")
    public ResponseEntity<List<Lesson>> getLessons(@RequestParam(defaultValue = "N5") String level) {
        return ResponseEntity.ok(lessonRepository.findByLevelOrderByOrderIndexAsc(level));
    }

    @GetMapping("/lessons/{lessonId}/kanji")
    public ResponseEntity<List<Kanji>> getKanjiForLesson(@PathVariable Long lessonId) {
        return ResponseEntity.ok(kanjiRepository.findByLessonId(lessonId));
    }
}
