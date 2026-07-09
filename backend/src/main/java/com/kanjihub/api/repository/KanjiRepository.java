package com.kanjihub.api.repository;

import com.kanjihub.api.model.Kanji;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface KanjiRepository extends JpaRepository<Kanji, Long> {
    List<Kanji> findByLessonId(Long lessonId);
}
