// Card Manager - Card loading and container management
import { AssetConfig } from '../config/AssetConfig.js';
import { PlayerConfig } from '../config/PlayerConfig.js';
import { PositionCalculator } from '../utils/PositionCalculator.js';
import { eventManager } from '../utils/EventManager.js';

export class CardManager {
    constructor(scene) {
        this.scene = scene;
        this.loadedCards = new Set();
        this.cardContainers = new Map();
        this.positionCalculator = new PositionCalculator();
        this.isDebug = window.isDebug || false;
    }

    // Load all playing cards
    loadAllCards() {
        let loadedCount = 0;
        const { suits, values } = AssetConfig.cards;

        suits.forEach(suit => {
            values.forEach(value => {
                const key = AssetConfig.cards.getCardKey(value, suit);
                const path = AssetConfig.cards.getCardPath(value, suit);
                
                try {
                    this.scene.load.image(key, path);
                    this.loadedCards.add(key);
                    loadedCount++;
                } catch (error) {
                    console.error(`CardManager: Failed to load card ${key}:`, error);
                }
            });
        });

        // Load back card
        const backCard = AssetConfig.cards.backCard;
        this.scene.load.image(backCard.key, backCard.path);
        this.loadedCards.add(backCard.key);
        loadedCount++;

        if (this.isDebug) {
            console.log(`CardManager: Loaded ${loadedCount} card assets`);
        }

        return loadedCount;
    }

    // Create a card container for a player
    createCardContainer(playerNumber, x, y) {
        const containerKey = `player${playerNumber}_cards`;
        
        // Create container
        const container = this.scene.add.container(x, y);
        container.setSize(
            PlayerConfig.cardContainer.size.width,
            PlayerConfig.cardContainer.size.height
        );

        // Store container reference
        this.cardContainers.set(containerKey, {
            container,
            playerNumber,
            cards: [],
            maxCards: PlayerConfig.cardContainer.maxCards,
        });

        if (this.isDebug) {
            console.log(`CardManager: Created card container for player ${playerNumber}`);
        }

        return container;
    }

    // Add a card to a player's container
    addCardToPlayer(playerNumber, cardValue, cardSuit, faceUp = false) {
        const containerKey = `player${playerNumber}_cards`;
        const containerData = this.cardContainers.get(containerKey);
        
        if (!containerData) {
            console.error(`CardManager: No container found for player ${playerNumber}`);
            return null;
        }

        if (containerData.cards.length >= containerData.maxCards) {
            console.warn(`CardManager: Player ${playerNumber} already has maximum cards`);
            return null;
        }

        // Determine card texture
        let cardKey;
        if (faceUp) {
            cardKey = AssetConfig.cards.getCardKey(cardValue, cardSuit);
        } else {
            cardKey = AssetConfig.cards.backCard.key;
        }

        // Check if card asset is loaded
        if (!this.loadedCards.has(cardKey)) {
            console.error(`CardManager: Card asset '${cardKey}' not loaded`);
            return null;
        }

        // Calculate card position within container
        const cardIndex = containerData.cards.length;
        const cardPositions = this.positionCalculator.getCardLayout(
            0, 0, // Container relative position
            containerData.maxCards,
            PlayerConfig.cardContainer.cardSpacing,
            80 // Card width
        );

        const cardPosition = cardPositions[cardIndex];
        
        // Create card sprite
        const card = this.scene.add.image(cardPosition.x, cardPosition.y, cardKey);
        card.setScale(PlayerConfig.cardContainer.cardScale);

        // Store card data
        const cardData = {
            sprite: card,
            value: cardValue,
            suit: cardSuit,
            faceUp: faceUp,
            index: cardIndex,
        };

        // Add to container
        containerData.container.add(card);
        containerData.cards.push(cardData);

        if (this.isDebug) {
            console.log(`CardManager: Added card ${cardValue} of ${cardSuit} to player ${playerNumber}`);
        }

        // Emit card added event
        eventManager.emit('card_added', playerNumber, cardData);

        return cardData;
    }

    // Flip a card (change from face down to face up or vice versa)
    flipCard(playerNumber, cardIndex) {
        const containerKey = `player${playerNumber}_cards`;
        const containerData = this.cardContainers.get(containerKey);
        
        if (!containerData || !containerData.cards[cardIndex]) {
            console.error(`CardManager: Card not found for player ${playerNumber}, index ${cardIndex}`);
            return false;
        }

        const cardData = containerData.cards[cardIndex];
        cardData.faceUp = !cardData.faceUp;

        // Update card texture
        let newCardKey;
        if (cardData.faceUp) {
            newCardKey = AssetConfig.cards.getCardKey(cardData.value, cardData.suit);
        } else {
            newCardKey = AssetConfig.cards.backCard.key;
        }

        cardData.sprite.setTexture(newCardKey);

        if (this.isDebug) {
            console.log(`CardManager: Flipped card for player ${playerNumber}, now ${cardData.faceUp ? 'face up' : 'face down'}`);
        }

        // Emit card flipped event
        eventManager.emit('card_flipped', playerNumber, cardIndex, cardData.faceUp);

        return true;
    }

    // Remove a card from a player's container
    removeCardFromPlayer(playerNumber, cardIndex) {
        const containerKey = `player${playerNumber}_cards`;
        const containerData = this.cardContainers.get(containerKey);
        
        if (!containerData || !containerData.cards[cardIndex]) {
            console.error(`CardManager: Card not found for player ${playerNumber}, index ${cardIndex}`);
            return false;
        }

        const cardData = containerData.cards[cardIndex];
        
        // Remove from container and destroy sprite
        containerData.container.remove(cardData.sprite);
        cardData.sprite.destroy();
        
        // Remove from cards array
        containerData.cards.splice(cardIndex, 1);

        // Reposition remaining cards
        this.repositionCards(playerNumber);

        if (this.isDebug) {
            console.log(`CardManager: Removed card from player ${playerNumber}`);
        }

        // Emit card removed event
        eventManager.emit('card_removed', playerNumber, cardIndex);

        return true;
    }

    // Remove all cards from a player's container
    clearPlayerCards(playerNumber) {
        const containerKey = `player${playerNumber}_cards`;
        const containerData = this.cardContainers.get(containerKey);
        
        if (!containerData) {
            console.error(`CardManager: No container found for player ${playerNumber}`);
            return false;
        }

        // Destroy all card sprites
        containerData.cards.forEach(cardData => {
            containerData.container.remove(cardData.sprite);
            cardData.sprite.destroy();
        });

        // Clear cards array
        containerData.cards = [];

        if (this.isDebug) {
            console.log(`CardManager: Cleared all cards for player ${playerNumber}`);
        }

        // Emit cards cleared event
        eventManager.emit('cards_cleared', playerNumber);

        return true;
    }

    // Reposition cards in a container (after removal)
    repositionCards(playerNumber) {
        const containerKey = `player${playerNumber}_cards`;
        const containerData = this.cardContainers.get(containerKey);
        
        if (!containerData) return;

        const cardPositions = this.positionCalculator.getCardLayout(
            0, 0,
            containerData.maxCards,
            PlayerConfig.cardContainer.cardSpacing,
            80
        );

        containerData.cards.forEach((cardData, index) => {
            const position = cardPositions[index];
            cardData.sprite.setPosition(position.x, position.y);
            cardData.index = index;
        });
    }

    // Get player's cards
    getPlayerCards(playerNumber) {
        const containerKey = `player${playerNumber}_cards`;
        const containerData = this.cardContainers.get(containerKey);
        
        return containerData ? [...containerData.cards] : [];
    }

    // Get card by player and index
    getCard(playerNumber, cardIndex) {
        const containerKey = `player${playerNumber}_cards`;
        const containerData = this.cardContainers.get(containerKey);
        
        return containerData?.cards[cardIndex] || null;
    }

    // Set card visibility for a player
    setPlayerCardsVisibility(playerNumber, visible) {
        const containerKey = `player${playerNumber}_cards`;
        const containerData = this.cardContainers.get(containerKey);
        
        if (containerData) {
            containerData.container.setVisible(visible);
        }
    }

    // Deal cards to multiple players
    dealCards(playerNumbers, cardsPerPlayer = 2, faceUp = false) {
        const dealSequence = [];
        
        // Create dealing sequence (round-robin)
        for (let cardNum = 0; cardNum < cardsPerPlayer; cardNum++) {
            playerNumbers.forEach(playerNumber => {
                dealSequence.push({ playerNumber, cardNumber: cardNum });
            });
        }

        // Deal cards with animation delay
        let dealIndex = 0;
        const dealNext = () => {
            if (dealIndex >= dealSequence.length) {
                eventManager.emit('dealing_complete');
                return;
            }

            const { playerNumber } = dealSequence[dealIndex];
            
            // For now, deal random cards (in real game, would come from server)
            const suits = AssetConfig.cards.suits;
            const values = AssetConfig.cards.values;
            const randomSuit = suits[Math.floor(Math.random() * suits.length)];
            const randomValue = values[Math.floor(Math.random() * values.length)];
            
            this.addCardToPlayer(playerNumber, randomValue, randomSuit, faceUp);
            
            dealIndex++;
            
            // Deal next card after delay
            this.scene.time.delayedCall(200, dealNext);
        };

        // Start dealing
        dealNext();

        if (this.isDebug) {
            console.log(`CardManager: Started dealing ${cardsPerPlayer} cards to ${playerNumbers.length} players`);
        }
    }

    // Remove card container for a player
    removeCardContainer(playerNumber) {
        const containerKey = `player${playerNumber}_cards`;
        const containerData = this.cardContainers.get(containerKey);
        
        if (containerData) {
            this.clearPlayerCards(playerNumber);
            containerData.container.destroy();
            this.cardContainers.delete(containerKey);
            
            if (this.isDebug) {
                console.log(`CardManager: Removed card container for player ${playerNumber}`);
            }
        }
    }

    // Get card loading statistics
    getStats() {
        return {
            loadedCards: this.loadedCards.size,
            cardContainers: this.cardContainers.size,
            totalCardsInPlay: Array.from(this.cardContainers.values())
                .reduce((total, container) => total + container.cards.length, 0),
        };
    }

    // Clean up resources
    cleanup() {
        this.cardContainers.forEach((containerData, key) => {
            this.removeCardContainer(containerData.playerNumber);
        });
        this.loadedCards.clear();
        
        if (this.isDebug) {
            console.log('CardManager: Cleaned up all resources');
        }
    }
} 