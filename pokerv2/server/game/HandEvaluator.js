class HandEvaluator {
    constructor() {
        this.cardValues = {
            '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9,
            '10': 10, 'jack': 11, 'queen': 12, 'king': 13, 'ace': 14
        };
        
        this.handRanks = {
            'highCard': 1,
            'pair': 2,
            'twoPair': 3,
            'threeOfAKind': 4,
            'straight': 5,
            'flush': 6,
            'fullHouse': 7,
            'fourOfAKind': 8,
            'straightFlush': 9,
            'royalFlush': 10
        };
    }

    evaluateHand(holeCards, communityCards) {
        const allCards = [...holeCards, ...communityCards];
        
        // Check for royal flush
        const royalFlush = this.checkRoyalFlush(allCards);
        if (royalFlush) {
            return {
                rank: this.handRanks.royalFlush,
                rankName: 'Royal Flush',
                cards: royalFlush,
                kickers: []
            };
        }
        
        // Check for straight flush
        const straightFlush = this.checkStraightFlush(allCards);
        if (straightFlush) {
            return {
                rank: this.handRanks.straightFlush,
                rankName: 'Straight Flush',
                cards: straightFlush,
                kickers: []
            };
        }
        
        // Check for four of a kind
        const fourOfAKind = this.checkFourOfAKind(allCards);
        if (fourOfAKind) {
            return {
                rank: this.handRanks.fourOfAKind,
                rankName: 'Four of a Kind',
                cards: fourOfAKind.cards,
                kickers: fourOfAKind.kickers
            };
        }
        
        // Check for full house
        const fullHouse = this.checkFullHouse(allCards);
        if (fullHouse) {
            return {
                rank: this.handRanks.fullHouse,
                rankName: 'Full House',
                cards: fullHouse.cards,
                kickers: fullHouse.kickers
            };
        }
        
        // Check for flush
        const flush = this.checkFlush(allCards);
        if (flush) {
            return {
                rank: this.handRanks.flush,
                rankName: 'Flush',
                cards: flush,
                kickers: []
            };
        }
        
        // Check for straight
        const straight = this.checkStraight(allCards);
        if (straight) {
            return {
                rank: this.handRanks.straight,
                rankName: 'Straight',
                cards: straight,
                kickers: []
            };
        }
        
        // Check for three of a kind
        const threeOfAKind = this.checkThreeOfAKind(allCards);
        if (threeOfAKind) {
            return {
                rank: this.handRanks.threeOfAKind,
                rankName: 'Three of a Kind',
                cards: threeOfAKind.cards,
                kickers: threeOfAKind.kickers
            };
        }
        
        // Check for two pair
        const twoPair = this.checkTwoPair(allCards);
        if (twoPair) {
            return {
                rank: this.handRanks.twoPair,
                rankName: 'Two Pair',
                cards: twoPair.cards,
                kickers: twoPair.kickers
            };
        }
        
        // Check for pair
        const pair = this.checkPair(allCards);
        if (pair) {
            return {
                rank: this.handRanks.pair,
                rankName: 'Pair',
                cards: pair.cards,
                kickers: pair.kickers
            };
        }
        
        // High card
        const highCard = this.getHighCard(allCards);
        return {
            rank: this.handRanks.highCard,
            rankName: 'High Card',
            cards: [highCard],
            kickers: this.getKickers(allCards, [highCard])
        };
    }

    checkRoyalFlush(cards) {
        const flush = this.checkFlush(cards);
        if (!flush) return null;
        
        const values = flush.map(card => this.cardValues[card.value]).sort((a, b) => b - a);
        if (values[0] === 14 && values[1] === 13 && values[2] === 12 && 
            values[3] === 11 && values[4] === 10) {
            return flush;
        }
        return null;
    }

    checkStraightFlush(cards) {
        const flush = this.checkFlush(cards);
        if (!flush) return null;
        
        const straight = this.checkStraight(flush);
        return straight;
    }

    checkFourOfAKind(cards) {
        const groups = this.groupByValue(cards);
        for (const [value, group] of groups) {
            if (group.length === 4) {
                const kickers = this.getKickers(cards, group);
                return {
                    cards: group,
                    kickers: kickers.slice(0, 1)
                };
            }
        }
        return null;
    }

    checkFullHouse(cards) {
        const groups = this.groupByValue(cards);
        let threeOfAKind = null;
        let pair = null;
        
        for (const [value, group] of groups) {
            if (group.length === 3 && !threeOfAKind) {
                threeOfAKind = group;
            } else if (group.length >= 2 && !pair) {
                pair = group.slice(0, 2);
            }
        }
        
        if (threeOfAKind && pair) {
            return {
                cards: [...threeOfAKind, ...pair],
                kickers: []
            };
        }
        return null;
    }

    checkFlush(cards) {
        const groups = this.groupBySuit(cards);
        for (const [suit, group] of groups) {
            if (group.length >= 5) {
                return group
                    .sort((a, b) => this.cardValues[b.value] - this.cardValues[a.value])
                    .slice(0, 5);
            }
        }
        return null;
    }

    checkStraight(cards) {
        const values = [...new Set(cards.map(card => this.cardValues[card.value]))]
            .sort((a, b) => b - a);
        
        // Check for regular straight
        for (let i = 0; i <= values.length - 5; i++) {
            if (values[i] - values[i + 4] === 4) {
                const straightValues = values.slice(i, i + 5);
                return cards.filter(card => 
                    straightValues.includes(this.cardValues[card.value])
                ).slice(0, 5);
            }
        }
        
        // Check for Ace-low straight (A, 2, 3, 4, 5)
        if (values.includes(14)) {
            const lowValues = [14, 2, 3, 4, 5];
            const hasLowStraight = lowValues.every(val => values.includes(val));
            if (hasLowStraight) {
                return cards.filter(card => 
                    lowValues.includes(this.cardValues[card.value])
                ).slice(0, 5);
            }
        }
        
        return null;
    }

    checkThreeOfAKind(cards) {
        const groups = this.groupByValue(cards);
        for (const [value, group] of groups) {
            if (group.length === 3) {
                const kickers = this.getKickers(cards, group);
                return {
                    cards: group,
                    kickers: kickers.slice(0, 2)
                };
            }
        }
        return null;
    }

    checkTwoPair(cards) {
        const groups = this.groupByValue(cards);
        const pairs = [];
        
        for (const [value, group] of groups) {
            if (group.length >= 2) {
                pairs.push(group.slice(0, 2));
            }
        }
        
        if (pairs.length >= 2) {
            pairs.sort((a, b) => 
                this.cardValues[b[0].value] - this.cardValues[a[0].value]
            );
            const kickers = this.getKickers(cards, [...pairs[0], ...pairs[1]]);
            return {
                cards: [...pairs[0], ...pairs[1]],
                kickers: kickers.slice(0, 1)
            };
        }
        return null;
    }

    checkPair(cards) {
        const groups = this.groupByValue(cards);
        for (const [value, group] of groups) {
            if (group.length >= 2) {
                const kickers = this.getKickers(cards, group.slice(0, 2));
                return {
                    cards: group.slice(0, 2),
                    kickers: kickers.slice(0, 3)
                };
            }
        }
        return null;
    }

    getHighCard(cards) {
        return cards.reduce((highest, card) => 
            this.cardValues[card.value] > this.cardValues[highest.value] ? card : highest
        );
    }

    getKickers(cards, excludeCards) {
        const excludeValues = excludeCards.map(card => 
            `${card.value}_${card.suit}`
        );
        
        return cards
            .filter(card => !excludeValues.includes(`${card.value}_${card.suit}`))
            .sort((a, b) => this.cardValues[b.value] - this.cardValues[a.value])
            .slice(0, 5);
    }

    groupByValue(cards) {
        const groups = new Map();
        for (const card of cards) {
            const value = this.cardValues[card.value];
            if (!groups.has(value)) {
                groups.set(value, []);
            }
            groups.get(value).push(card);
        }
        return groups;
    }

    groupBySuit(cards) {
        const groups = new Map();
        for (const card of cards) {
            if (!groups.has(card.suit)) {
                groups.set(card.suit, []);
            }
            groups.get(card.suit).push(card);
        }
        return groups;
    }

    compareHands(hand1, hand2) {
        // Compare ranks
        if (hand1.rank !== hand2.rank) {
            return hand1.rank - hand2.rank;
        }
        
        // Compare main cards
        for (let i = 0; i < Math.min(hand1.cards.length, hand2.cards.length); i++) {
            const value1 = this.cardValues[hand1.cards[i].value];
            const value2 = this.cardValues[hand2.cards[i].value];
            if (value1 !== value2) {
                return value1 - value2;
            }
        }
        
        // Compare kickers
        for (let i = 0; i < Math.min(hand1.kickers.length, hand2.kickers.length); i++) {
            const value1 = this.cardValues[hand1.kickers[i].value];
            const value2 = this.cardValues[hand2.kickers[i].value];
            if (value1 !== value2) {
                return value1 - value2;
            }
        }
        
        return 0; // Tie
    }

    getHandStrength(handEvaluation) {
        // Return a strength value between 0 and 1
        const maxRank = Math.max(...Object.values(this.handRanks));
        return handEvaluation.rank / maxRank;
    }
}

module.exports = HandEvaluator; 