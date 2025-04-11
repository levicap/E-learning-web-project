import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Save, ArrowLeft, ArrowRight } from "lucide-react";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@radix-ui/react-select';
import { useUser } from '@clerk/clerk-react';
import { cn } from '@/lib/utils';

export default function FlashcardsComponent({ flashcards, setFlashcards }) {
  const [currentCard, setCurrentCard] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [newCardMode, setNewCardMode] = useState(false);
  const [newCard, setNewCard] = useState({ question: '', answer: '', category: '' });
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { user } = useUser();
  const clerkUserId = user?.id;

  // Fetch flashcards from the backend API
  const fetchFlashcards = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/flashcard/flashcards', {
        headers: { 'x-clerk-user-id': clerkUserId },
      });
      setFlashcards(response.data.flashcards);
    } catch (error) {
      console.error('Error fetching flashcards:', error);
    }
  };

  useEffect(() => {
    fetchFlashcards();
  }, []);

  const addNewCard = async () => {
    if (!newCard.question.trim() || !newCard.answer.trim() || !newCard.category.trim()) return;
    try {
      const response = await axios.post(
        'http://localhost:5000/api/flashcard/flashcards',
        newCard,
        { headers: { 'x-clerk-user-id': clerkUserId } }
      );
      setFlashcards(prev => [...prev, response.data.flashcard]);
      setNewCard({ question: '', answer: '', category: '' });
      setNewCardMode(false);
    } catch (error) {
      console.error('Error adding flashcard:', error);
    }
  };

  const filteredFlashcards = selectedCategory === 'all'
    ? flashcards
    : flashcards.filter(card => card.category === selectedCategory);

  // Filter out falsy values for categories
  const categories = [
    'all',
    ...Array.from(new Set(flashcards.map(card => card.category))).filter(category => category)
  ];

  return (
    <Card className="p-8">
      <div className="max-w-4xl mx-auto">
        {/* Category Select */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex gap-4">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button className="bg-gradient-to-r from-purple-600 to-pink-600">
              Generate AI Cards
            </Button>
            <Dialog open={newCardMode} onOpenChange={setNewCardMode}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-indigo-600 to-purple-600">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Card
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Flashcard</DialogTitle>
                  <DialogDescription>Add a new flashcard to your study deck</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Question</Label>
                    <Input
                      placeholder="Enter your question"
                      value={newCard.question}
                      onChange={(e) => setNewCard({ ...newCard, question: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Answer</Label>
                    <Input
                      placeholder="Enter the answer"
                      value={newCard.answer}
                      onChange={(e) => setNewCard({ ...newCard, answer: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Input
                      placeholder="Enter a category"
                      value={newCard.category}
                      onChange={(e) => setNewCard({ ...newCard, category: e.target.value })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={addNewCard} className="bg-gradient-to-r from-green-500 to-emerald-500">
                    <Save className="w-4 h-4 mr-2" />
                    Save Card
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Flip Card Container */}
        <div
          className="relative w-full h-[400px] cursor-pointer"
          style={{ perspective: "1000px" }}
          onClick={() => setShowAnswer(!showAnswer)}
        >
          <div
            className="relative w-full h-full transition-transform duration-600"
            style={{ transformStyle: "preserve-3d", transform: showAnswer ? "rotateY(180deg)" : "rotateY(0deg)" }}
          >
            {/* Front Face */}
            <div
              className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-purple-50 p-8 rounded-xl shadow-lg flex flex-col justify-center items-center text-center"
              style={{ backfaceVisibility: "hidden" }}
            >
              <div className="text-sm text-indigo-600 mb-4 font-semibold">
                {filteredFlashcards[currentCard]?.category}
              </div>
              <div className="text-3xl font-semibold max-w-2xl">
                {filteredFlashcards[currentCard]?.question}
              </div>
              <div className="absolute bottom-4 text-sm text-gray-500">
                Click to flip
              </div>
            </div>
            {/* Back Face */}
            <div
              className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-purple-50 p-8 rounded-xl shadow-lg flex flex-col justify-center items-center text-center"
              style={{ 
                backfaceVisibility: "hidden", 
                transform: "rotateY(180deg)" 
              }}
            >
              <div className="text-sm text-indigo-600 mb-4 font-semibold">
                {filteredFlashcards[currentCard]?.category}
              </div>
              <div className="text-3xl font-semibold max-w-2xl">
                {filteredFlashcards[currentCard]?.answer}
              </div>
              <div className="absolute bottom-4 text-sm text-gray-500">
                Click to flip
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center mt-8">
          <Button
            variant="outline"
            onClick={() => {
              setCurrentCard(prev => prev === 0 ? filteredFlashcards.length - 1 : prev - 1);
              setShowAnswer(false);
            }}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Previous
          </Button>
          <div className="text-sm text-gray-500">
            {currentCard + 1} of {filteredFlashcards.length}
          </div>
          <Button
            onClick={() => {
              setCurrentCard(prev => prev === filteredFlashcards.length - 1 ? 0 : prev + 1);
              setShowAnswer(false);
            }}
            className="flex items-center gap-2"
          >
            Next
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
