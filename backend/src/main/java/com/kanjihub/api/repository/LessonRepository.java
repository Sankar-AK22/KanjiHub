package com.kanjihub.api.repository;

import com.kanjihub.api.model.Lesson;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LessonRepository extends JpaRepository<Lesson, Long> {
    List<Lesson> findByLevelOrderByOrderIndexAsc(String level);
}
