import { prisma } from '@/lib/prisma'
import { GeminiResponse } from './geminiAIService'

export interface SearchHistoryItem {
  id: string
  query: string
  language: string
  response: GeminiResponse | null
  createdAt: Date
}

export class SearchHistoryService {
  // Save a search query and response to user's history
  static async saveSearch(
    userId: string,
    query: string,
    language: string,
    response: GeminiResponse
  ): Promise<void> {
    try {
      await prisma.searchHistory.create({
        data: {
          userId,
          query,
          language,
          response: JSON.parse(JSON.stringify(response)), // Convert to JSON-serializable format
        }
      })
    } catch (error) {
      console.error('Error saving search history:', error)
      // Don't throw error to avoid breaking the search functionality
    }
  }

  // Get user's search history
  static async getUserSearchHistory(
    userId: string,
    limit: number = 20
  ): Promise<SearchHistoryItem[]> {
    try {
      const history = await prisma.searchHistory.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit,
      })

      return history.map((item: {
        id: string;
        query: string;
        language: string;
        response: unknown;
        createdAt: Date;
      }) => ({
        id: item.id,
        query: item.query,
        language: item.language,
        response: item.response as GeminiResponse | null,
        createdAt: item.createdAt,
      }))
    } catch (error) {
      console.error('Error fetching search history:', error)
      return []
    }
  }

  // Delete a search history item
  static async deleteSearchItem(userId: string, itemId: string): Promise<boolean> {
    try {
      await prisma.searchHistory.deleteMany({
        where: {
          id: itemId,
          userId, // Ensure user can only delete their own items
        }
      })
      return true
    } catch (error) {
      console.error('Error deleting search item:', error)
      return false
    }
  }

  // Clear all search history for a user
  static async clearUserHistory(userId: string): Promise<boolean> {
    try {
      await prisma.searchHistory.deleteMany({
        where: { userId }
      })
      return true
    } catch (error) {
      console.error('Error clearing search history:', error)
      return false
    }
  }
}
