import { Cell, Player } from "../../../bingo/types";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Checks if a player has won by completing a row, column, or diagonal
 * @param grid The current game grid.
 * @param playerColor The color of the player to check for a win.
 * @returns True if the player has won, false otherwise.
 */
export function checkForWin(grid: Cell[], playerColor: string): boolean {
    // Grid is assumed to be 5x5
    const SIZE = 5;
    
    // Check rows
    for (let row = 0; row < SIZE; row++) {
        let rowComplete = true;
        for (let col = 0; col < SIZE; col++) {
            const index = row * SIZE + col;
            if (!grid[index].colors.includes(playerColor)) {
                rowComplete = false;
                break;
            }
        }
        if (rowComplete) return true;
    }
    
    // Check columns
    for (let col = 0; col < SIZE; col++) {
        let colComplete = true;
        for (let row = 0; row < SIZE; row++) {
            const index = row * SIZE + col;
            if (!grid[index].colors.includes(playerColor)) {
                colComplete = false;
                break;
            }
        }
        if (colComplete) return true;
    }
    
    // Check main diagonal (top-left to bottom-right)
    let diagComplete = true;
    for (let i = 0; i < SIZE; i++) {
        const index = i * SIZE + i;
        if (!grid[index].colors.includes(playerColor)) {
            diagComplete = false;
            break;
        }
    }
    if (diagComplete) return true;
    
    // Check other diagonal (top-right to bottom-left)
    diagComplete = true;
    for (let i = 0; i < SIZE; i++) {
        const index = i * SIZE + (SIZE - 1 - i);
        if (!grid[index].colors.includes(playerColor)) {
            diagComplete = false;
            break;
        }
    }
    
    return diagComplete;
}

/**
 * Finds the player(s) with the most marked cells in the grid.
 * @param grid The current game grid.
 * @param playersID The list of players ID in the game.
 * @returns The player(s) with the most marked cells.
 */
export async function findWinnersByMostCells(grid: Cell[], playersID: string[]) {
    // Get players from their IDs
    const playerResults = await Promise.all(playersID.map(id => 
        prisma.bingoPlayers.findUnique({ where: { id } })
    ));
    
    // Filter out null results and assert the array as Player[]
    const players = playerResults.filter(p => p !== null) as Player[];

    // Count cells per player
    const playerCounts = new Map<string, { count: number, player: Player }>();
    
    // Initialize counts for all players
    players.forEach(player => {
        playerCounts.set(player.color, { count: 0, player });
    });
    
    // Count cells for each player
    grid.forEach(cell => {
        cell.colors.forEach(color => {
            const playerData = playerCounts.get(color);
            if (playerData) {
                playerData.count += 1;
                playerCounts.set(color, playerData);
            }
        });
    });
    
    // Find the max count
    let maxCount = 0;
    Array.from(playerCounts.values()).forEach(data => {
        if (data.count > maxCount) {
            maxCount = data.count;
        }
    });
    
    // Return all players with the max count
    const winners = Array.from(playerCounts.values())
        .filter(data => data.count === maxCount && data.count > 0)
        .map(data => data.player);
    
    return winners;
}