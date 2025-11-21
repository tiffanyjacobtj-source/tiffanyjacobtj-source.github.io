import { useState, useEffect } from "react";
import { quizQuestions } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { CheckCircle2, XCircle, Trophy, RotateCcw, Share2, Clock, Play } from "lucide-react";
import { SiX, SiFacebook, SiLinkedin } from "react-icons/si";

export default function Quiz() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<boolean | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [answeredQuestions, setAnsweredQuestions] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [timedMode, setTimedMode] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(60); // 60 seconds per question
  const [quizStarted, setQuizStarted] = useState(false);
  const [totalTimeTaken, setTotalTimeTaken] = useState(0);

  const currentQuestion = quizQuestions[currentQuestionIndex];
  const progress = (answeredQuestions / quizQuestions.length) * 100;

  // Timer effect
  useEffect(() => {
    if (!timedMode || !quizStarted || isComplete || showFeedback) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          // Time's up - auto-submit wrong answer
          handleAnswer(!currentQuestion.answer); // Submit wrong answer
          return 60;
        }
        return prev - 1;
      });
      setTotalTimeTaken(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timedMode, quizStarted, isComplete, showFeedback, currentQuestionIndex]);

  const handleAnswer = (answer: boolean) => {
    if (selectedAnswer !== null || isTransitioning) return; // Already answered or transitioning

    setSelectedAnswer(answer);
    setShowFeedback(true);
    setIsTransitioning(true);

    // Update score if correct using functional form to avoid stale closure
    if (answer === currentQuestion.answer) {
      setScore(prev => prev + 10);
    }

    setAnsweredQuestions(prev => prev + 1);

    // Auto-advance to next question or show results
    setTimeout(() => {
      setCurrentQuestionIndex(prev => {
        if (prev < quizQuestions.length - 1) {
          // Move to next question
          setSelectedAnswer(null);
          setShowFeedback(false);
          setIsTransitioning(false);
          setTimeRemaining(60); // Reset timer for next question
          return prev + 1;
        } else {
          // Quiz complete
          setIsComplete(true);
          return prev;
        }
      });
    }, 1500);
  };

  const startQuiz = () => {
    setQuizStarted(true);
  };

  const resetQuiz = () => {
    setCurrentQuestionIndex(0);
    setScore(0);
    setSelectedAnswer(null);
    setShowFeedback(false);
    setIsComplete(false);
    setAnsweredQuestions(0);
    setIsTransitioning(false);
    setQuizStarted(false);
    setTimeRemaining(60);
    setTotalTimeTaken(0);
  };

  const getResultMessage = () => {
    if (score >= 90) return "Excellent! You're a critical thinker!";
    if (score >= 70) return "Great job! Keep questioning sources.";
    if (score >= 50) return "Good start. Stay curious!";
    return "Keep learning about misinformation!";
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const shareToTwitter = () => {
    const text = `I scored ${score}/100 on the Misinformation Quiz! Test your critical thinking skills.`;
    const url = window.location.href;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
  };

  const shareToFacebook = () => {
    const url = window.location.href;
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
  };

  const shareToLinkedIn = () => {
    const url = window.location.href;
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    // Could add a toast notification here if desired
  };

  // Start screen
  if (!quizStarted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-background">
        <Card className="w-full max-w-2xl p-8 space-y-8">
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                <Trophy className="w-10 h-10 text-primary" />
              </div>
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-foreground">Misinformation Quiz</h1>
              <p className="text-lg text-muted-foreground">
                Test your critical thinking skills with 10 questions about media literacy and source verification
              </p>
            </div>

            {/* Timer Toggle */}
            <div className="flex items-center justify-center gap-3 p-4 rounded-lg bg-muted/50 border border-border">
              <Clock className={`w-5 h-5 ${timedMode ? 'text-primary' : 'text-muted-foreground'}`} />
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-foreground">Timed Mode</span>
                <Switch
                  checked={timedMode}
                  onCheckedChange={setTimedMode}
                  data-testid="switch-timed-mode"
                />
              </div>
              <p className="text-xs text-muted-foreground ml-2">
                {timedMode ? '60 seconds per question' : 'Take your time'}
              </p>
            </div>

            <Button
              onClick={startQuiz}
              size="lg"
              className="px-8"
              data-testid="button-start-quiz"
            >
              <Play className="w-5 h-5 mr-2" />
              Start Quiz
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (isComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-background">
        <Card className="w-full max-w-2xl p-8 space-y-8">
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                <Trophy className="w-10 h-10 text-primary" data-testid="icon-trophy" />
              </div>
            </div>

            <div className="space-y-2">
              <h1 className="text-4xl font-bold text-foreground" data-testid="text-final-score">
                {score}/100
              </h1>
              <p className="text-xl text-muted-foreground" data-testid="text-result-message">
                {getResultMessage()}
              </p>
              {timedMode && (
                <p className="text-sm text-muted-foreground" data-testid="text-time-taken">
                  Time taken: {formatTime(totalTimeTaken)}
                </p>
              )}
            </div>

            <div className="flex items-center justify-center gap-8 text-sm">
              <div className="space-y-1">
                <p className="text-muted-foreground">Correct</p>
                <p className="text-2xl font-bold text-foreground" data-testid="text-correct-count">
                  {score / 10}
                </p>
              </div>
              <div className="w-px h-12 bg-border" />
              <div className="space-y-1">
                <p className="text-muted-foreground">Incorrect</p>
                <p className="text-2xl font-bold text-foreground" data-testid="text-incorrect-count">
                  {10 - score / 10}
                </p>
              </div>
            </div>

            {/* Share Section */}
            <div className="space-y-3 pt-2">
              <p className="text-sm font-medium text-muted-foreground flex items-center justify-center gap-2">
                <Share2 className="w-4 h-4" />
                Share your results
              </p>
              <div className="flex items-center justify-center gap-2 flex-wrap">
                <Button
                  onClick={shareToTwitter}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  data-testid="button-share-twitter"
                >
                  <SiX className="w-4 h-4" />
                  X (Twitter)
                </Button>
                <Button
                  onClick={shareToFacebook}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  data-testid="button-share-facebook"
                >
                  <SiFacebook className="w-4 h-4" />
                  Facebook
                </Button>
                <Button
                  onClick={shareToLinkedIn}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  data-testid="button-share-linkedin"
                >
                  <SiLinkedin className="w-4 h-4" />
                  LinkedIn
                </Button>
                <Button
                  onClick={copyLink}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  data-testid="button-copy-link"
                >
                  <Share2 className="w-4 h-4" />
                  Copy Link
                </Button>
              </div>
            </div>

            <Button
              onClick={resetQuiz}
              size="lg"
              className="px-8"
              data-testid="button-restart"
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              Restart Quiz
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="w-full max-w-2xl space-y-6">
        {/* Score and Progress Header */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-foreground" data-testid="text-score">
              Score: {score}/100
            </h2>
            <div className="flex items-center gap-4">
              {timedMode && (
                <div className={`flex items-center gap-2 px-3 py-1 rounded-lg ${
                  timeRemaining <= 10 ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'
                }`} data-testid="timer-display">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm font-bold">{timeRemaining}s</span>
                </div>
              )}
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide" data-testid="text-question-counter">
                Question {currentQuestionIndex + 1} of {quizQuestions.length}
              </p>
            </div>
          </div>
          <Progress value={progress} className="h-2" data-testid="progress-bar" />
        </div>

        {/* Quiz Card */}
        <Card className="p-8 space-y-6 shadow-lg">
          {/* Question Number Badge */}
          <div className="inline-block">
            <span className="text-sm font-medium uppercase tracking-wide text-muted-foreground" data-testid="text-question-label">
              Question {currentQuestionIndex + 1}
            </span>
          </div>

          {/* Question Text */}
          <div className="min-h-[100px] flex items-center">
            <h3 className="text-xl font-semibold leading-relaxed text-foreground" data-testid={`text-question-${currentQuestion.id}`}>
              {currentQuestion.question}
            </h3>
          </div>

          {/* Answer Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <Button
              onClick={() => handleAnswer(true)}
              disabled={selectedAnswer !== null}
              size="lg"
              variant={
                showFeedback
                  ? currentQuestion.answer === true
                    ? "default"
                    : selectedAnswer === true
                    ? "destructive"
                    : "outline"
                  : "outline"
              }
              className="py-6 text-lg font-semibold rounded-xl"
              data-testid={`button-answer-${currentQuestion.options[0].toLowerCase()}`}
            >
              {currentQuestion.options[0]}
            </Button>
            <Button
              onClick={() => handleAnswer(false)}
              disabled={selectedAnswer !== null}
              size="lg"
              variant={
                showFeedback
                  ? currentQuestion.answer === false
                    ? "default"
                    : selectedAnswer === false
                    ? "destructive"
                    : "outline"
                  : "outline"
              }
              className="py-6 text-lg font-semibold rounded-xl"
              data-testid={`button-answer-${currentQuestion.options[1].toLowerCase()}`}
            >
              {currentQuestion.options[1]}
            </Button>
          </div>

          {/* Feedback */}
          {showFeedback && (
            <div className="space-y-3">
              <div
                className={`p-4 rounded-lg flex items-start gap-3 animate-in fade-in duration-200 ${
                  selectedAnswer === currentQuestion.answer
                    ? "bg-primary/10 text-primary"
                    : "bg-destructive/10 text-destructive"
                }`}
                data-testid="feedback-message"
              >
                {selectedAnswer === currentQuestion.answer ? (
                  <>
                    <CheckCircle2 className="w-6 h-6 flex-shrink-0 mt-0.5" data-testid="icon-correct" />
                    <div className="space-y-1">
                      <p className="text-lg font-medium">Correct! Well done.</p>
                    </div>
                  </>
                ) : (
                  <>
                    <XCircle className="w-6 h-6 flex-shrink-0 mt-0.5" data-testid="icon-incorrect" />
                    <div className="space-y-1">
                      <p className="text-lg font-medium">
                        Incorrect. The answer is {currentQuestion.options[currentQuestion.answer ? 0 : 1]}.
                      </p>
                    </div>
                  </>
                )}
              </div>
              
              {/* Explanation */}
              <div className="p-4 rounded-lg bg-muted/50 border border-border animate-in fade-in duration-200" data-testid="explanation-message">
                <p className="text-sm font-medium text-muted-foreground mb-1">Why?</p>
                <p className="text-base text-foreground leading-relaxed">{currentQuestion.explanation}</p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
