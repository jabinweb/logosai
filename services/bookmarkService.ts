import { prisma } from '@/lib/prisma'

export interface BookmarkItem {
  id: string
  title: string
  description?: string
  reference: string
  text: string
  version: string
  tags: string[]
  createdAt: Date
  updatedAt: Date
}

export interface CreateBookmarkData {
  title: string
  description?: string
  reference: string
  text: string
  version: string
  tags?: string[]
}

export class BookmarkService {
  // Create a new bookmark
  static async createBookmark(
    userId: string,
    data: CreateBookmarkData
  ): Promise<BookmarkItem | null> {
    try {
      const bookmark = await prisma.bookmark.create({
        data: {
          userId,
          title: data.title,
          description: data.description,
          reference: data.reference,
          text: data.text,
          version: data.version,
          tags: data.tags || [],
        }
      })

      return {
        id: bookmark.id,
        title: bookmark.title,
        description: bookmark.description || undefined,
        reference: bookmark.reference,
        text: bookmark.text,
        version: bookmark.version,
        tags: bookmark.tags,
        createdAt: bookmark.createdAt,
        updatedAt: bookmark.updatedAt,
      }
    } catch (error) {
      console.error('Error creating bookmark:', error)
      return null
    }
  }

  // Get user's bookmarks
  static async getUserBookmarks(
    userId: string,
    limit: number = 50
  ): Promise<BookmarkItem[]> {
    try {
      const bookmarks = await prisma.bookmark.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit,
      })

      return bookmarks.map((bookmark: {
        id: string;
        title: string;
        description: string | null;
        reference: string;
        text: string;
        version: string;
        tags: string[];
        createdAt: Date;
        updatedAt: Date;
      }) => ({
        id: bookmark.id,
        title: bookmark.title,
        description: bookmark.description || undefined,
        reference: bookmark.reference,
        text: bookmark.text,
        version: bookmark.version,
        tags: bookmark.tags,
        createdAt: bookmark.createdAt,
        updatedAt: bookmark.updatedAt,
      }))
    } catch (error) {
      console.error('Error fetching bookmarks:', error)
      return []
    }
  }

  // Delete a bookmark
  static async deleteBookmark(userId: string, bookmarkId: string): Promise<boolean> {
    try {
      await prisma.bookmark.deleteMany({
        where: {
          id: bookmarkId,
          userId, // Ensure user can only delete their own bookmarks
        }
      })
      return true
    } catch (error) {
      console.error('Error deleting bookmark:', error)
      return false
    }
  }

  // Update a bookmark
  static async updateBookmark(
    userId: string,
    bookmarkId: string,
    data: Partial<CreateBookmarkData>
  ): Promise<BookmarkItem | null> {
    try {
      const bookmark = await prisma.bookmark.updateMany({
        where: {
          id: bookmarkId,
          userId,
        },
        data: {
          ...data,
        }
      })

      if (bookmark.count === 0) {
        return null
      }

      // Fetch the updated bookmark
      const updatedBookmark = await prisma.bookmark.findUnique({
        where: { id: bookmarkId }
      })

      if (!updatedBookmark) {
        return null
      }

      return {
        id: updatedBookmark.id,
        title: updatedBookmark.title,
        description: updatedBookmark.description || undefined,
        reference: updatedBookmark.reference,
        text: updatedBookmark.text,
        version: updatedBookmark.version,
        tags: updatedBookmark.tags,
        createdAt: updatedBookmark.createdAt,
        updatedAt: updatedBookmark.updatedAt,
      }
    } catch (error) {
      console.error('Error updating bookmark:', error)
      return null
    }
  }

  // Search bookmarks by tags or content
  static async searchBookmarks(
    userId: string,
    searchTerm: string
  ): Promise<BookmarkItem[]> {
    try {
      const bookmarks = await prisma.bookmark.findMany({
        where: {
          userId,
          OR: [
            { title: { contains: searchTerm, mode: 'insensitive' } },
            { description: { contains: searchTerm, mode: 'insensitive' } },
            { text: { contains: searchTerm, mode: 'insensitive' } },
            { reference: { contains: searchTerm, mode: 'insensitive' } },
            { tags: { has: searchTerm } },
          ]
        },
        orderBy: { createdAt: 'desc' },
      })

      return bookmarks.map((bookmark: {
        id: string;
        title: string;
        description: string | null;
        reference: string;
        text: string;
        version: string;
        tags: string[];
        createdAt: Date;
        updatedAt: Date;
      }) => ({
        id: bookmark.id,
        title: bookmark.title,
        description: bookmark.description || undefined,
        reference: bookmark.reference,
        text: bookmark.text,
        version: bookmark.version,
        tags: bookmark.tags,
        createdAt: bookmark.createdAt,
        updatedAt: bookmark.updatedAt,
      }))
    } catch (error) {
      console.error('Error searching bookmarks:', error)
      return []
    }
  }

  // Check if a specific verse is bookmarked
  static async isVerseBookmarked(
    userId: string,
    reference: string,
    version: string
  ): Promise<string | null> {
    try {
      const bookmark = await prisma.bookmark.findFirst({
        where: {
          userId,
          reference,
          version,
        },
        select: { id: true }
      })

      return bookmark?.id || null
    } catch (error) {
      console.error('Error checking if verse is bookmarked:', error)
      return null
    }
  }

  // Delete bookmark by reference and version
  static async deleteBookmarkByReference(
    userId: string,
    reference: string,
    version: string
  ): Promise<boolean> {
    try {
      await prisma.bookmark.deleteMany({
        where: {
          userId,
          reference,
          version,
        }
      })
      return true
    } catch (error) {
      console.error('Error deleting bookmark by reference:', error)
      return false
    }
  }
}
