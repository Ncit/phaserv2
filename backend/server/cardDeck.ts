import { Card, CardRank, CardSuit } from "@/common/Game";

export class CardDeck {
    private cards: Card[] = [];

    constructor() {
        this.createDeck();
        this.shuffle();
    }

    private createDeck() {
        this.cards = Object.values(CardSuit).flatMap(suit =>
            Object.values(CardRank).map(rank => new Card(suit, rank))
        );
    }

    public shuffle(): void {
        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
        }
    }

    public drawCards(count: number): Card[] {
        return this.cards.splice(0, count);
    }

    public getCardsRemaining(): number {
        return this.cards.length;
    }

}