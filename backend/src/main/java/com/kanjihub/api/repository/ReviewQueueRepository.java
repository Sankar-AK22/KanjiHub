package com.kanjihub.api.repository;

import com.kanjihub.api.model.ReviewQueue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ReviewQueueRepository extends JpaRepository<ReviewQueue, Long> {
    List<ReviewQueue> findByUserIdAndNextReviewDateBefore(Long userId, LocalDateTime date);
}
