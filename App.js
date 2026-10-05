import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  TextInput,
  ScrollView,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  NavigationContainer,
  useNavigation,
} from '@react-navigation/native';
import {
  createNativeStackNavigator,
} from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';

const Stack = createNativeStackNavigator();

const API =
  process.env.EXPO_PUBLIC_API_URL ||
  'http://10.0.2.2:5000/api';

const FALLBACK = require('./questions.json');

async function getQuestions() {
  try {
    const r = await fetch(`${API}/questions`);

    if (!r.ok) throw Error();

    return await r.json();
  } catch {
    return FALLBACK;
  }
}

/* =========================
   HOME
========================= */

function Home() {
  const nav = useNavigation();

  const [qs, setQs] = useState([]);
  const [search, setSearch] = useState('');
  const [book, setBook] = useState([]);

  const [subject, setSubject] = useState('All');
  const [topic, setTopic] = useState('All');
  const [year, setYear] = useState('All');
  const [difficulty, setDifficulty] = useState('All');

  useEffect(() => {
    getQuestions().then(setQs);

    AsyncStorage.getItem('bookmarks').then((x) => {
      if (x) {
        setBook(JSON.parse(x));
      }
    });
  }, []);

  /* =========================
     FILTER DATA
  ========================= */

  const subjects = useMemo(() => {
    return [
      'All',
      ...new Set(qs.map((q) => q.subject)),
    ];
  }, [qs]);

  const topics = useMemo(() => {
    let data = qs;

    if (subject !== 'All') {
      data = data.filter((q) => q.subject === subject);
    }

    return [
      'All',
      ...new Set(data.map((q) => q.topic)),
    ];
  }, [qs, subject]);

  const years = useMemo(() => {
    return [
      'All',
      ...new Set(
        qs
          .map((q) => String(q.year))
          .sort((a, b) => Number(b) - Number(a))
      ),
    ];
  }, [qs]);

  const difficulties = [
    'All',
    'Easy',
    'Medium',
    'Hard',
  ];

  /* =========================
     FILTER QUESTIONS
  ========================= */

  const filtered = useMemo(() => {
    return qs.filter((q) => {
      const searchText = (
        q.question +
        ' ' +
        q.subject +
        ' ' +
        q.topic +
        ' ' +
        q.concept +
        ' ' +
        (q.tags || []).join(' ')
      ).toLowerCase();

      const matchesSearch =
        searchText.includes(search.toLowerCase());

      const matchesSubject =
        subject === 'All' ||
        q.subject === subject;

      const matchesTopic =
        topic === 'All' ||
        q.topic === topic;

      const matchesYear =
        year === 'All' ||
        String(q.year) === year;

      const matchesDifficulty =
        difficulty === 'All' ||
        q.difficulty === difficulty;

      return (
        matchesSearch &&
        matchesSubject &&
        matchesTopic &&
        matchesYear &&
        matchesDifficulty
      );
    });
  }, [
    qs,
    search,
    subject,
    topic,
    year,
    difficulty,
  ]);

  /* =========================
     RESET FILTERS
  ========================= */

  const resetFilters = () => {
    setSubject('All');
    setTopic('All');
    setYear('All');
    setDifficulty('All');
    setSearch('');
  };

  return (
    <View style={s.container}>
      <StatusBar style="dark" />

      <Text style={s.logo}>
        GATE CSE <Text style={s.accent}>AI</Text>
      </Text>

      <Text style={s.sub}>
        PYQ • Concepts • Solutions • Tricks
      </Text>

      {/* STATS */}

      <View style={s.stats}>
        <Stat n={qs.length} t="Questions" />

        <Stat
          n={new Set(qs.map((q) => q.subject)).size}
          t="Subjects"
        />

        <Stat
          n={book.length}
          t="Bookmarks"
        />
      </View>

      {/* ACTIONS */}

      <View style={s.tabs}>
        <Pressable
          style={s.tab}
          onPress={() => nav.navigate('Mock')}
        >
          <Text style={s.tabText}>Mock Test</Text>
        </Pressable>

        <Pressable
          style={s.tab}
          onPress={() => nav.navigate('Analytics')}
        >
          <Text style={s.tabText}>Analytics</Text>
        </Pressable>
      </View>

      {/* SEARCH */}

      <TextInput
        value={search}
        onChangeText={setSearch}
        placeholder="Search question, subject, topic..."
        placeholderTextColor="#94a3b8"
        style={s.input}
      />

      {/* SUBJECT */}

      <Text style={s.filterTitle}>
        Subject
      </Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={s.filterScroll}
      >
        {subjects.map((item) => (
          <FilterChip
            key={item}
            title={item}
            active={subject === item}
            onPress={() => {
              setSubject(item);
              setTopic('All');
            }}
          />
        ))}
      </ScrollView>

      {/* TOPIC */}

      <Text style={s.filterTitle}>
        Topic
      </Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={s.filterScroll}
      >
        {topics.map((item) => (
          <FilterChip
            key={item}
            title={item}
            active={topic === item}
            onPress={() => setTopic(item)}
          />
        ))}
      </ScrollView>

      {/* YEAR + DIFFICULTY */}

      <View style={s.filterRow}>
        <View style={s.filterColumn}>
          <Text style={s.filterTitle}>
            Year
          </Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
          >
            {years.map((item) => (
              <FilterChip
                key={item}
                title={item}
                active={year === item}
                onPress={() => setYear(item)}
                small
              />
            ))}
          </ScrollView>
        </View>
      </View>

      <Text style={s.filterTitle}>
        Difficulty
      </Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={s.filterScroll}
      >
        {difficulties.map((item) => (
          <FilterChip
            key={item}
            title={item}
            active={difficulty === item}
            onPress={() => setDifficulty(item)}
          />
        ))}
      </ScrollView>

      {/* RESULT COUNT */}

      <View style={s.resultHeader}>
        <Text style={s.resultText}>
          {filtered.length} questions found
        </Text>

        <Pressable onPress={resetFilters}>
          <Text style={s.reset}>
            Reset
          </Text>
        </Pressable>
      </View>

      {/* QUESTIONS */}

      <FlatList
        data={filtered}
        keyExtractor={(x) => x.id}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={s.empty}>
            <Text style={s.emptyTitle}>
              No questions found
            </Text>

            <Text style={s.emptyText}>
              Try changing your filters or search.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <QuestionCard
            q={item}
            onPress={() =>
              nav.navigate('Question', {
                id: item.id,
              })
            }
          />
        )}
      />
    </View>
  );
}

/* =========================
   FILTER CHIP
========================= */

function FilterChip({
  title,
  active,
  onPress,
  small = false,
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        s.chip,
        small && s.smallChip,
        active && s.activeChip,
      ]}
    >
      <Text
        style={[
          s.chipText,
          active && s.activeChipText,
        ]}
      >
        {title}
      </Text>
    </Pressable>
  );
}

/* =========================
   STAT
========================= */

function Stat({ n, t }) {
  return (
    <View style={s.stat}>
      <Text style={s.statN}>
        {n}
      </Text>

      <Text style={s.muted}>
        {t}
      </Text>
    </View>
  );
}

/* =========================
   QUESTION CARD
========================= */

function QuestionCard({
  q,
  onPress,
}) {
  return (
    <Pressable
      onPress={onPress}
      style={s.card}
    >
      <View style={s.row}>
        <Text style={s.badge}>
          {q.subject}
        </Text>

        <Text style={s.diff}>
          {q.difficulty}
        </Text>
      </View>

      <Text style={s.q}>
        {q.question}
      </Text>

      <Text style={s.muted}>
        {q.topic} • {q.year} • {q.type}
      </Text>
    </Pressable>
  );
}

/* =========================
   QUESTION DETAILS
========================= */

function Question({ route }) {
  const [q, setQ] = useState(null);
  const [selected, setSelected] = useState(null);
  const [hint, setHint] = useState('');
  const [book, setBook] = useState(false);
  const [attemptSaved, setAttemptSaved] = useState(false);

  useEffect(() => {
    getQuestions().then((a) =>
      setQ(
        a.find(
          (x) => x.id === route.params.id
        )
      )
    );

    AsyncStorage.getItem('bookmarks').then(
      (x) =>
        setBook(
          (x
            ? JSON.parse(x)
            : []
          ).includes(route.params.id)
        )
    );
  }, []);

  if (!q) {
    return (
      <View style={s.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  /* =========================
     SAVE USER ATTEMPT
  ========================= */

  const saveAttempt = async (answer) => {
    try {
      const stored = JSON.parse(
        (await AsyncStorage.getItem('attempts')) || '[]'
      );

      const isCorrect = answer === q.answer;

      const attempt = {
        questionId: q.id,
        subject: q.subject,
        topic: q.topic,
        answer: answer,
        correctAnswer: q.answer,
        isCorrect,
        timestamp: Date.now(),
      };

      const updated = [
        ...stored,
        attempt,
      ];

      await AsyncStorage.setItem(
        'attempts',
        JSON.stringify(updated)
      );

      setAttemptSaved(true);
    } catch (error) {
      console.log(
        'Could not save attempt:',
        error
      );
    }
  };

  /* =========================
     SELECT ANSWER
  ========================= */

  const handleAnswer = async (answer) => {
    if (selected) return;

    setSelected(answer);

    await saveAttempt(answer);
  };

  /* =========================
     BOOKMARK
  ========================= */

  const toggle = async () => {
    const x = JSON.parse(
      (await AsyncStorage.getItem(
        'bookmarks'
      )) || '[]'
    );

    const y = x.includes(q.id)
      ? x.filter((i) => i !== q.id)
      : [...x, q.id];

    await AsyncStorage.setItem(
      'bookmarks',
      JSON.stringify(y)
    );

    setBook(!book);
  };

  /* =========================
     AI HINT
  ========================= */

  const getHint = async () => {
    try {
      const r = await fetch(
        `${API}/ai/hint`,
        {
          method: 'POST',
          headers: {
            'Content-Type':
              'application/json',
          },
          body: JSON.stringify({
            question: q.question,
            concept: q.concept,
          }),
        }
      );

      const j = await r.json();

      setHint(j.hint);
    } catch {
      setHint(
        'AI server unavailable. Review the concept first, then attempt again.'
      );
    }
  };

  return (
    <ScrollView
      style={s.container}
      contentContainerStyle={{
        paddingBottom: 40,
      }}
    >

      {/* QUESTION HEADER */}

      <Text style={s.badge}>
        {q.subject}
      </Text>

      <Text style={s.title}>
        {q.question}
      </Text>

      <Text style={s.muted}>
        {q.topic} • {q.year} • {q.difficulty}
      </Text>

      {/* OPTIONS */}

      {q.options.map((o, i) => (
        <Pressable
          key={o}
          onPress={() =>
            handleAnswer(o)
          }
          style={[
            s.option,

            selected === o && {
              borderWidth: 2,

              borderColor:
                o === q.answer
                  ? '#16a34a'
                  : '#dc2626',

              backgroundColor:
                o === q.answer
                  ? '#f0fdf4'
                  : '#fef2f2',
            },

            selected &&
              o === q.answer && {
                borderWidth: 2,
                borderColor: '#16a34a',
                backgroundColor: '#f0fdf4',
              },
          ]}
        >
          <Text>
            {String.fromCharCode(
              65 + i
            )}
            . {o}
          </Text>
        </Pressable>
      ))}

      {/* RESULT */}

      {selected && (
        <View style={s.resultBox}>
          <Text
            style={[
              s.result,
              {
                color:
                  selected === q.answer
                    ? '#16a34a'
                    : '#dc2626',
              },
            ]}
          >
            {selected === q.answer
              ? '✓ Correct!'
              : '✗ Incorrect'}
          </Text>

          <Text style={s.body}>
            Correct Answer: {q.answer}
          </Text>

          {attemptSaved && (
            <Text style={s.savedText}>
              ✓ Attempt saved to your progress
            </Text>
          )}
        </View>
      )}

      {/* SOLUTION */}

      <Section title="Detailed Solution">
        <Text style={s.body}>
          {q.solution.join('\n\n')}
        </Text>
      </Section>

      {/* CONCEPT */}

      <Section title="Concept">
        <Text style={s.body}>
          {q.concept}
        </Text>
      </Section>

      {/* SHORT TRICK */}

      <Section title="Short Trick">
        <Text style={s.body}>
          {q.trick}
        </Text>
      </Section>

      {/* TAGS */}

      <Section title="Tags">
        <Text style={s.body}>
          {q.tags.join(' • ')}
        </Text>
      </Section>

      {/* AI */}

      <Pressable
        style={s.primary}
        onPress={getHint}
      >
        <Text style={s.primaryText}>
          Get AI Hint
        </Text>
      </Pressable>

      {hint ? (
        <View style={s.hint}>
          <Text style={s.hintTitle}>
            AI Hint
          </Text>

          <Text style={s.body}>
            {hint}
          </Text>
        </View>
      ) : null}

      {/* BOOKMARK */}

      <Pressable
        style={s.secondary}
        onPress={toggle}
      >
        <Text>
          {book
            ? '★ Bookmarked'
            : '☆ Bookmark'}
        </Text>
      </Pressable>

    </ScrollView>
  );
}
/* =========================
   SECTION
========================= */

function Section({
  title,
  children,
}) {
  return (
    <View style={s.section}>
      <Text style={s.h2}>
        {title}
      </Text>

      {children}
    </View>
  );
}

/* =========================
   MOCK TEST
========================= */

function Mock() {
  const [qs, setQs] = useState([]);
  const [i, setI] = useState(0);
  const [score, setScore] = useState(0);
  const [started, setStarted] =
    useState(false);

  useEffect(() => {
    getQuestions().then((a) =>
      setQs(a.slice(0, 5))
    );
  }, []);

  if (!qs.length) {
    return (
      <View style={s.container}>
        <Text>
          Preparing mock...
        </Text>
      </View>
    );
  }

  if (!started) {
    return (
      <View style={s.container}>
        <Text style={s.title}>
          Quick GATE Mock
        </Text>

        <Text style={s.body}>
          5 questions • mixed subjects •
          instant score
        </Text>

        <Pressable
          style={s.primary}
          onPress={() =>
            setStarted(true)
          }
        >
          <Text style={s.primaryText}>
            Start Test
          </Text>
        </Pressable>
      </View>
    );
  }

  if (i >= qs.length) {
    return (
      <View style={s.container}>
        <Text style={s.title}>
          Test Complete
        </Text>

        <Text style={s.score}>
          {score}/{qs.length}
        </Text>

        <Text style={s.body}>
          Accuracy:{' '}
          {Math.round(
            (score / qs.length) * 100
          )}
          %
        </Text>

        <Pressable
          style={s.primary}
          onPress={() => {
            setI(0);
            setScore(0);
          }}
        >
          <Text style={s.primaryText}>
            Retry
          </Text>
        </Pressable>
      </View>
    );
  }

  const q = qs[i];

  return (
    <ScrollView style={s.container}>
      <Text style={s.muted}>
        Question {i + 1} / {qs.length}
      </Text>

      <Text style={s.title}>
        {q.question}
      </Text>

      {q.options.map((o) => (
        <Pressable
          style={s.option}
          key={o}
          onPress={() => {
            if (o === q.answer) {
              setScore(score + 1);
            }

            setI(i + 1);
          }}
        >
          <Text>{o}</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

/* =========================
   ANALYTICS
========================= */

function Analytics() {
  const [qs, setQs] = useState([]);
  const [attempts, setAttempts] = useState([]);

  useEffect(() => {
    getQuestions().then(setQs);

    AsyncStorage.getItem('attempts').then((data) => {
      if (data) {
        setAttempts(JSON.parse(data));
      }
    });
  }, []);

  const total = attempts.length;

  const correct = attempts.filter(
    (a) => a.isCorrect
  ).length;

  const incorrect = total - correct;

  const accuracy =
    total > 0
      ? Math.round((correct / total) * 100)
      : 0;

  /* =========================
     SUBJECT PERFORMANCE
  ========================= */

  const subjectStats = {};

  attempts.forEach((a) => {
    if (!subjectStats[a.subject]) {
      subjectStats[a.subject] = {
        total: 0,
        correct: 0,
      };
    }

    subjectStats[a.subject].total++;

    if (a.isCorrect) {
      subjectStats[a.subject].correct++;
    }
  });

  /* =========================
     TOPIC PERFORMANCE
  ========================= */

  const topicStats = {};

  attempts.forEach((a) => {
    if (!topicStats[a.topic]) {
      topicStats[a.topic] = {
        total: 0,
        correct: 0,
      };
    }

    topicStats[a.topic].total++;

    if (a.isCorrect) {
      topicStats[a.topic].correct++;
    }
  });

  const weakTopics = Object.entries(
    topicStats
  )
    .map(([topic, data]) => ({
      topic,
      accuracy: Math.round(
        (data.correct / data.total) * 100
      ),
      total: data.total,
    }))
    .filter((x) => x.accuracy < 70)
    .sort(
      (a, b) => a.accuracy - b.accuracy
    );

  return (
    <ScrollView style={s.container}>

      <Text style={s.title}>
        Your Analytics
      </Text>

      <Text style={s.body}>
        Track your GATE preparation
        performance and identify weak
        topics.
      </Text>

      {/* =====================
          OVERVIEW
      ===================== */}

      <View style={s.analyticsGrid}>

        <View style={s.analyticsCard}>
          <Text style={s.analyticsNumber}>
            {total}
          </Text>

          <Text style={s.muted}>
            Attempts
          </Text>
        </View>

        <View style={s.analyticsCard}>
          <Text
            style={[
              s.analyticsNumber,
              { color: '#16a34a' },
            ]}
          >
            {correct}
          </Text>

          <Text style={s.muted}>
            Correct
          </Text>
        </View>

        <View style={s.analyticsCard}>
          <Text
            style={[
              s.analyticsNumber,
              { color: '#dc2626' },
            ]}
          >
            {incorrect}
          </Text>

          <Text style={s.muted}>
            Incorrect
          </Text>
        </View>

        <View style={s.analyticsCard}>
          <Text
            style={[
              s.analyticsNumber,
              { color: '#2563eb' },
            ]}
          >
            {accuracy}%
          </Text>

          <Text style={s.muted}>
            Accuracy
          </Text>
        </View>

      </View>

      {/* =====================
          NO ATTEMPTS
      ===================== */}

      {total === 0 && (
        <View style={s.empty}>
          <Text style={s.emptyTitle}>
            No attempts yet
          </Text>

          <Text style={s.emptyText}>
            Solve some PYQs first. Your
            performance will appear here.
          </Text>
        </View>
      )}

      {/* =====================
          SUBJECT PERFORMANCE
      ===================== */}

      {total > 0 && (
        <Section title="Subject Performance">

          {Object.entries(
            subjectStats
          ).map(([subject, data]) => {

            const percent = Math.round(
              (data.correct / data.total) *
                100
            );

            return (
              <View
                key={subject}
                style={s.performanceCard}
              >

                <View
                  style={
                    s.performanceHeader
                  }
                >

                  <Text
                    style={s.performanceTitle}
                  >
                    {subject}
                  </Text>

                  <Text
                    style={
                      s.performancePercent
                    }
                  >
                    {percent}%
                  </Text>

                </View>

                <Text style={s.muted}>
                  {data.correct}/
                  {data.total} correct
                </Text>

                <View style={s.bar}>
                  <View
                    style={[
                      s.fill,
                      {
                        width: `${percent}%`,
                        backgroundColor:
                          percent >= 70
                            ? '#16a34a'
                            : percent >= 40
                            ? '#f59e0b'
                            : '#dc2626',
                      },
                    ]}
                  />
                </View>

              </View>
            );
          })}

        </Section>
      )}

      {/* =====================
          WEAK TOPICS
      ===================== */}

      <Section title="Weak Topics">

        {weakTopics.length === 0 ? (

          <Text style={s.body}>
            No weak topics detected yet.
            Keep solving questions to build
            enough performance data.
          </Text>

        ) : (

          weakTopics.map((item) => (

            <View
              key={item.topic}
              style={s.weakCard}
            >

              <View
                style={
                  s.performanceHeader
                }
              >

                <Text
                  style={s.performanceTitle}
                >
                  {item.topic}
                </Text>

                <Text
                  style={{
                    color: '#dc2626',
                    fontWeight: '800',
                  }}
                >
                  {item.accuracy}%
                </Text>

              </View>

              <Text style={s.muted}>
                {item.total} attempts
              </Text>

              <Text
                style={s.revisionText}
              >
                Revision recommended
              </Text>

            </View>

          ))

        )}

      </Section>

      {/* =====================
          STUDY RECOMMENDATION
      ===================== */}

      <Section title="AI Study Recommendation">

        {total === 0 ? (

          <Text style={s.body}>
            Start solving PYQs. After a few
            attempts, the app can identify
            your weak subjects and topics.
          </Text>

        ) : accuracy < 50 ? (

          <Text style={s.body}>
            Your current accuracy is {accuracy}%.
            Focus on concepts first, then
            retry previously incorrect PYQs.
          </Text>

        ) : accuracy < 75 ? (

          <Text style={s.body}>
            Your fundamentals are developing.
            Focus on weak topics and solve
            more mixed PYQs.
          </Text>

        ) : (

          <Text style={s.body}>
            Your accuracy is strong. Start
            increasing difficulty and attempt
            timed mock tests.
          </Text>

        )}

      </Section>

    </ScrollView>
  );
}

function Bookmarks({ navigation }) {
  const [questions, setQuestions] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);

  useEffect(() => {
    loadBookmarks();
  }, []);

  const loadBookmarks = async () => {
    const savedBookmarks = JSON.parse(
      (await AsyncStorage.getItem('bookmarks')) || '[]'
    );

    const allQuestions = await getQuestions();

    setBookmarks(savedBookmarks);
    setQuestions(
      allQuestions.filter((q) => savedBookmarks.includes(q.id))
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <Text style={styles.title}>Bookmarked Questions</Text>

      <Text style={styles.subtitle}>
        {questions.length} saved question{questions.length !== 1 ? 's' : ''}
      </Text>

      {questions.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No bookmarks yet</Text>
          <Text style={styles.emptyText}>
            Question screen par bookmark button dabakar questions yahan save karo.
          </Text>
        </View>
      ) : (
        <FlatList
          data={questions}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ paddingBottom: 30 }}
          renderItem={({ item }) => (
            <Pressable
              style={styles.card}
              onPress={() =>
                navigation.navigate('Question', { id: item.id })
              }
            >
              <Text style={styles.subject}>
                {item.subject} • {item.year}
              </Text>

              <Text style={styles.question}>
                {item.question}
              </Text>

              <Text style={styles.topic}>
                Topic: {item.topic}
              </Text>
            </Pressable>
          )}
        />
      )}
    </View>
  );
}
/* =========================
   APP
========================= */

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Home"
          component={Home}
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="Question"
          component={Question}
          options={{
            title: 'Question',
          }}
        />

        <Stack.Screen
          name="Mock"
          component={Mock}
          options={{
            title: 'Mock Test',
          }}
        />

        <Stack.Screen
          name="Analytics"
          component={Analytics}
          options={{
            title: 'Analytics',
          }}
        />
        <Stack.Screen name="Bookmarks" component={Bookmarks} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

/* =========================
   STYLES
========================= */

const s = StyleSheet.create({
  container: {
    flex: 1,
    padding: 18,
    backgroundColor: '#f8fafc',
  },
  analyticsGrid: {
  flexDirection: 'row',
  flexWrap: 'wrap',
  gap: 10,
  marginTop: 16,
},

analyticsCard: {
  width: '48%',
  backgroundColor: '#fff',
  padding: 16,
  borderRadius: 16,
},

analyticsNumber: {
  fontSize: 28,
  fontWeight: '900',
},

performanceCard: {
  backgroundColor: '#f8fafc',
  padding: 14,
  borderRadius: 14,
  marginBottom: 10,
},

performanceHeader: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
},

performanceTitle: {
  fontSize: 16,
  fontWeight: '800',
  color: '#1e293b',
},

performancePercent: {
  fontSize: 16,
  fontWeight: '900',
  color: '#2563eb',
},

weakCard: {
  backgroundColor: '#fff7ed',
  padding: 14,
  borderRadius: 14,
  marginBottom: 10,
},

revisionText: {
  color: '#dc2626',
  fontWeight: '700',
  marginTop: 8,
},

  logo: {
    fontSize: 30,
    fontWeight: '900',
    marginTop: 20,
  },

  accent: {
    color: '#2563eb',
  },

  sub: {
    color: '#64748b',
    marginBottom: 18,
  },

  stats: {
    flexDirection: 'row',
    gap: 10,
  },

  stat: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 16,
  },

  statN: {
    fontSize: 22,
    fontWeight: '800',
  },

  muted: {
    color: '#64748b',
    marginTop: 4,
  },

  tabs: {
    flexDirection: 'row',
    gap: 10,
    marginVertical: 14,
  },

  tab: {
    backgroundColor: '#e0e7ff',
    padding: 12,
    borderRadius: 12,
  },

  tabText: {
    fontWeight: '700',
    color: '#3730a3',
  },

  input: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    fontSize: 15,
  },

  filterTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#334155',
    marginTop: 8,
    marginBottom: 7,
  },

  filterScroll: {
    flexGrow: 0,
  },

  chip: {
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },

  smallChip: {
    paddingHorizontal: 11,
    paddingVertical: 7,
  },

  activeChip: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },

  chipText: {
    color: '#475569',
    fontWeight: '600',
  },
  resultBox: {
  backgroundColor: '#ffffff',
  padding: 16,
  borderRadius: 16,
  marginTop: 14,
},

savedText: {
  color: '#16a34a',
  fontWeight: '700',
  marginTop: 8,
},

hintTitle: {
  fontWeight: '800',
  fontSize: 16,
  marginBottom: 6,
},

  activeChipText: {
    color: '#fff',
  },

  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 12,
  },

  resultText: {
    fontWeight: '800',
    color: '#334155',
  },

  reset: {
    color: '#2563eb',
    fontWeight: '800',
  },

  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 18,
    marginBottom: 12,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#dbeafe',
    color: '#1d4ed8',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
    fontWeight: '700',
  },

  diff: {
    color: '#64748b',
  },

  q: {
    fontSize: 17,
    fontWeight: '700',
    marginVertical: 10,
    lineHeight: 24,
  },

  title: {
    fontSize: 25,
    fontWeight: '900',
    marginVertical: 12,
    lineHeight: 33,
  },

  h2: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 8,
  },

  body: {
    fontSize: 16,
    lineHeight: 25,
    color: '#334155',
  },

  section: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    marginTop: 14,
  },

  option: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 14,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },

  result: {
    fontWeight: '800',
    marginTop: 12,
  },

  primary: {
    backgroundColor: '#2563eb',
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 16,
  },

  primaryText: {
    color: '#fff',
    fontWeight: '800',
  },

  secondary: {
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },

  hint: {
    backgroundColor: '#fef3c7',
    padding: 14,
    borderRadius: 14,
    marginTop: 12,
  },

  score: {
    fontSize: 54,
    fontWeight: '900',
    marginVertical: 20,
  },

  bar: {
    height: 10,
    backgroundColor: '#e2e8f0',
    borderRadius: 8,
    overflow: 'hidden',
    marginTop: 10,
  },

  fill: {
    height: '100%',
    backgroundColor: '#2563eb',
  },

  empty: {
    backgroundColor: '#fff',
    padding: 30,
    borderRadius: 18,
    alignItems: 'center',
    marginTop: 10,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
  },

  emptyText: {
    color: '#64748b',
    marginTop: 8,
  },
});

export default App;