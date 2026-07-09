package com.kanjihub.api;

import com.kanjihub.api.model.Kanji;
import com.kanjihub.api.model.Lesson;
import com.kanjihub.api.repository.KanjiRepository;
import com.kanjihub.api.repository.LessonRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private LessonRepository lessonRepository;

    @Autowired
    private KanjiRepository kanjiRepository;

    @Override
    public void run(String... args) throws Exception {
        if (lessonRepository.count() == 0) {
            System.out.println("Seeding database with N5 Lessons...");

            Lesson lesson1 = new Lesson();
            lesson1.setTitle("Numbers 1-5");
            lesson1.setLevel("N5");
            lesson1.setOrderIndex(1);
            lessonRepository.save(lesson1);

            createKanji(lesson1, "一", "One", "イチ, イツ", "ひと", "一月 (いちがつ) - January");
            createKanji(lesson1, "二", "Two", "ニ, ジ", "ふた", "二月 (にがつ) - February");
            createKanji(lesson1, "三", "Three", "サン", "み", "三月 (さんがつ) - March");
            createKanji(lesson1, "四", "Four", "シ", "よ, よん", "四月 (しがつ) - April");
            createKanji(lesson1, "五", "Five", "ゴ", "いつ", "五月 (ごがつ) - May");

            Lesson lesson2 = new Lesson();
            lesson2.setTitle("Numbers 6-10");
            lesson2.setLevel("N5");
            lesson2.setOrderIndex(2);
            lessonRepository.save(lesson2);

            createKanji(lesson2, "六", "Six", "ロク", "む", "六月 (ろくがつ) - June");
            createKanji(lesson2, "七", "Seven", "シチ", "なな", "七月 (しちがつ) - July");
            createKanji(lesson2, "八", "Eight", "ハチ", "や", "八月 (はちがつ) - August");
            createKanji(lesson2, "九", "Nine", "キュウ, ク", "ここの", "九月 (くがつ) - September");
            createKanji(lesson2, "十", "Ten", "ジュウ", "とお", "十月 (じゅうがつ) - October");
            
            Lesson lesson3 = new Lesson();
            lesson3.setTitle("Days & Time");
            lesson3.setLevel("N5");
            lesson3.setOrderIndex(3);
            lessonRepository.save(lesson3);
            
            createKanji(lesson3, "日", "Sun, Day", "ニチ, ジツ", "ひ, び, か", "日本 (にほん) - Japan");
            createKanji(lesson3, "月", "Moon, Month", "ゲツ, ガツ", "つき", "今月 (こんげつ) - This month");
            createKanji(lesson3, "火", "Fire", "カ", "ひ, ほ", "火曜日 (かようび) - Tuesday");
            createKanji(lesson3, "水", "Water", "スイ", "みず", "水曜日 (すいようび) - Wednesday");
            createKanji(lesson3, "木", "Tree, Wood", "モク, ボク", "き, こ", "木曜日 (もくようび) - Thursday");
            createKanji(lesson3, "金", "Gold, Money", "キン, コン", "かね, かな", "金曜日 (きんようび) - Friday");
            createKanji(lesson3, "土", "Earth, Soil", "ド, ト", "つち", "土曜日 (どようび) - Saturday");

            System.out.println("Seeding complete!");
        }
    }

    private void createKanji(Lesson lesson, String character, String meaning, String onReading, String kunReading, String ex) {
        Kanji kanji = new Kanji();
        kanji.setLesson(lesson);
        kanji.setCharacter(character);
        kanji.setMeaning(meaning);
        kanji.setOnReading(onReading);
        kanji.setKunReading(kunReading);
        // Note: For simplicity in the seeder we store example as string, though architecture has Sentence entity
        kanjiRepository.save(kanji);
    }
}
