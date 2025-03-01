"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FlashcardDeck, Flashcard } from "@/types/database";
import { getFlashcardDeck, getFlashcards, saveFlashcardDeckWithCards } from "@/app/flashcards";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CardEditor } from "./CardEditor";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { PlusCircle, Loader2, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function DeckFormModal() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const isCreateMode = searchParams.has("create");
    const editDeckId = searchParams.get("edit");
    const isOpen = isCreateMode || !!editDeckId;
    const { toast } = useToast();

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [cards, setCards] = useState<Array<{ id?: string; question: string; answer: string; position: number }>>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    // Load deck data when editing
    useEffect(() => {
        const loadDeckData = async () => {
            if (!editDeckId) return;

            setLoading(true);
            try {
                const deck = await getFlashcardDeck(editDeckId);
                const deckCards = await getFlashcards(editDeckId);

                setTitle(deck.title);
                setDescription(deck.description || "");
                setCards(deckCards.map(card => ({
                    id: card.id,
                    question: card.question,
                    answer: card.answer,
                    position: card.position
                })));
            } catch (error) {
                console.error("Error loading deck data:", error);
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "Failed to load deck data"
                });
                handleClose();
            } finally {
                setLoading(false);
            }
        };

        if (isOpen && editDeckId) {
            loadDeckData();
        } else if (isOpen) {
            // Reset form for create mode
            setTitle("");
            setDescription("");
            setCards([{ question: "", answer: "", position: 0 }]);
        }
    }, [isOpen, editDeckId]);

    const handleClose = () => {
        const params = new URLSearchParams(searchParams);
        params.delete("create");
        params.delete("edit");
        router.push(`/dashboard/decks?${params.toString()}`);
    };

    const handleAddCard = () => {
        setCards([
            ...cards,
            {
                question: "",
                answer: "",
                position: cards.length
            }
        ]);
    };

    const handleRemoveCard = (index: number) => {
        if (cards.length <= 1) return;

        const newCards = [...cards];
        newCards.splice(index, 1);

        // Update positions
        newCards.forEach((card, idx) => {
            card.position = idx;
        });

        setCards(newCards);
    };

    const handleCardChange = (index: number, field: "question" | "answer", value: string) => {
        const newCards = [...cards];
        newCards[index][field] = value;
        setCards(newCards);
    };

    const handleDragEnd = (result: DropResult) => {
        if (!result.destination) return;

        const items = Array.from(cards);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        // Update positions
        items.forEach((card, idx) => {
            card.position = idx;
        });

        setCards(items);
    };

    const handleSubmit = async () => {
        if (!title.trim()) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Please enter a title for the deck"
            });
            return;
        }

        if (cards.some(card => !card.question.trim() || !card.answer.trim())) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Please fill in all card questions and answers"
            });
            return;
        }

        setSaving(true);
        try {
            await saveFlashcardDeckWithCards(
                {
                    id: editDeckId || undefined,
                    title: title.trim(),
                    description: description.trim()
                },
                cards
            );

            toast({
                title: "Success",
                description: editDeckId ? "Deck updated successfully" : "Deck created successfully"
            });
            handleClose();
        } catch (error) {
            console.error("Error saving deck:", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to save deck"
            });
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {editDeckId ? "Edit Flashcard Deck" : "Create Flashcard Deck"}
                    </DialogTitle>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-4 top-4"
                        onClick={handleClose}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </DialogHeader>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : (
                    <div className="space-y-6 py-4">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">Deck Title</Label>
                                <Input
                                    id="title"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Enter deck title"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description (Optional)</Label>
                                <Textarea
                                    id="description"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Enter deck description"
                                    rows={3}
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-medium">Flashcards</h3>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleAddCard}
                                    className="flex items-center gap-1"
                                >
                                    <PlusCircle className="h-4 w-4" />
                                    <span>Add Card</span>
                                </Button>
                            </div>

                            <DragDropContext onDragEnd={handleDragEnd}>
                                <Droppable droppableId="flashcards">
                                    {(provided) => (
                                        <div
                                            {...provided.droppableProps}
                                            ref={provided.innerRef}
                                            className="space-y-4"
                                        >
                                            {cards.map((card, index) => (
                                                <Draggable
                                                    key={card.id || `new-${index}`}
                                                    draggableId={card.id || `new-${index}`}
                                                    index={index}
                                                >
                                                    {(provided) => (
                                                        <div
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            {...provided.dragHandleProps}
                                                        >
                                                            <CardEditor
                                                                card={card}
                                                                index={index}
                                                                onChange={handleCardChange}
                                                                onRemove={() => handleRemoveCard(index)}
                                                                canRemove={cards.length > 1}
                                                            />
                                                        </div>
                                                    )}
                                                </Draggable>
                                            ))}
                                            {provided.placeholder}
                                        </div>
                                    )}
                                </Droppable>
                            </DragDropContext>
                        </div>

                        <div className="flex justify-end gap-2 pt-4">
                            <Button variant="outline" onClick={handleClose}>
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSubmit}
                                disabled={saving || cards.some(card => !card.question.trim() || !card.answer.trim()) || !title.trim()}
                            >
                                {saving ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>{editDeckId ? "Save Deck" : "Create Deck"}</>
                                )}
                            </Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
} 