import { Article, InsertArticle, Poll, InsertPoll, User, InsertUser, Video, InsertVideo, articles, users, polls, videos } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

// Interface for all storage operations
export interface IStorage {
  // Session store
  sessionStore: session.Store;
  
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Article operations
  getAllArticles(language?: string, category?: string): Promise<Article[]>;
  getArticleById(id: number): Promise<Article | undefined>;
  createArticle(article: InsertArticle): Promise<Article>;
  updateArticle(id: number, article: Partial<InsertArticle>): Promise<Article | undefined>;
  deleteArticle(id: number): Promise<boolean>;
  incrementArticleViews(id: number): Promise<void>;
  getMostViewedArticles(language: string, limit: number): Promise<Article[]>;
  
  // Poll operations
  getAllPolls(language: string): Promise<Poll[]>;
  getPollById(id: number): Promise<Poll | undefined>;
  createPoll(poll: InsertPoll): Promise<Poll>;
  updatePoll(id: number, poll: Partial<InsertPoll>): Promise<Poll | undefined>;
  deletePoll(id: number): Promise<boolean>;
  votePoll(id: number, option: string): Promise<Poll | undefined>;
  
  // Video operations
  getAllVideos(language: string): Promise<Video[]>;
  getVideoById(id: number): Promise<Video | undefined>;
  createVideo(video: InsertVideo): Promise<Video>;
  updateVideo(id: number, video: Partial<InsertVideo>): Promise<Video | undefined>;
  deleteVideo(id: number): Promise<boolean>;
  
  // Stats operations
  getPopularCategories(language: string): Promise<Record<string, number>>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private articles: Map<number, Article>;
  private polls: Map<number, Poll>;
  private videos: Map<number, Video>;
  
  public sessionStore: session.Store;
  private currentUserId: number;
  private currentArticleId: number;
  private currentPollId: number;
  private currentVideoId: number;

  constructor() {
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    });
    
    this.users = new Map();
    this.articles = new Map();
    this.polls = new Map();
    this.videos = new Map();
    
    this.currentUserId = 1;
    this.currentArticleId = 1;
    this.currentPollId = 1;
    this.currentVideoId = 1;
    
    // Add default admin user
    this.createUser({
      username: "admin",
      password: "admin123", // Simple password for development
      isAdmin: true
    });
    
    // Add sample articles for testing
    this.createArticle({
      title: "Nouvèl sou Ekonomi Ayiti",
      content: "Ayiti ap fè anpil pwogrè nan domèn ekonomik la, malgre defi yo...",
      excerpt: "Ekonomi peyi a ap bouje dousman men li gen anpil potansyèl",
      category: "Economy",
      author: "Jean Baptiste",
      language: "ht",
      coverImage: "https://example.com/images/economy-haiti.jpg"
    });
    
    this.createArticle({
      title: "Kriz Politik la kontinye",
      content: "Kriz politik la nan peyi Ayiti kontinye avèk manifestasyon...",
      excerpt: "Manifestasyon yo kontinye nan tout peyi a",
      category: "Politics",
      author: "Marie Claire",
      language: "ht",
      coverImage: "https://example.com/images/haiti-politics.jpg"
    });
    
    this.createArticle({
      title: "Haiti's Economic Outlook",
      content: "The economic outlook for Haiti shows signs of improvement despite challenges...",
      excerpt: "Haiti's economy is slowly recovering",
      category: "Economy",
      author: "Robert Smith",
      language: "en",
      coverImage: "https://example.com/images/haiti-economy-en.jpg"
    });
    
    this.createArticle({
      title: "La situation politique en Haïti",
      content: "La situation politique en Haïti reste tendue après les récents événements...",
      excerpt: "Les tensions politiques continuent en Haïti",
      category: "Politics",
      author: "Philippe Dupont",
      language: "fr",
      coverImage: "https://example.com/images/haiti-politics-fr.jpg"
    });
    
    // Add sample poll
    this.createPoll({
      question: "Ki domèn ou panse ki bezwen plis envèstisman an Ayiti?",
      options: ["Edikasyon", "Sante", "Enfrastrikti", "Agrikilti", "Sekirite"],
      language: "ht",
      active: true
    });
    
    // Add sample video
    this.createVideo({
      title: "Ayiti: Pwogrè nan domèn agrikilti",
      description: "Video sou jan agrikilti a ap devlope an Ayiti",
      videoUrl: "https://example.com/videos/haiti-agriculture.mp4",
      thumbnailUrl: "https://example.com/images/agriculture-thumbnail.jpg",
      language: "ht",
      category: "Agriculture",
      author: "Pierre Louis"
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const now = new Date();
    const user: User = { ...insertUser, id, createdAt: now };
    this.users.set(id, user);
    return user;
  }

  // Article methods
  async getAllArticles(language?: string, category?: string): Promise<Article[]> {
    let articles = Array.from(this.articles.values())
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
    
    if (language) {
      articles = articles.filter(article => article.language === language);
    }
    
    if (category) {
      articles = articles.filter(article => article.category === category);
    }
    
    return articles;
  }

  async getArticleById(id: number): Promise<Article | undefined> {
    return this.articles.get(id);
  }

  async createArticle(insertArticle: InsertArticle): Promise<Article> {
    const id = this.currentArticleId++;
    const now = new Date();
    const article: Article = { 
      ...insertArticle, 
      id, 
      publishedAt: now,
      viewCount: 0,
      commentCount: 0
    };
    this.articles.set(id, article);
    return article;
  }

  async updateArticle(id: number, articleUpdate: Partial<InsertArticle>): Promise<Article | undefined> {
    const article = this.articles.get(id);
    if (!article) return undefined;
    
    const updatedArticle = { ...article, ...articleUpdate };
    this.articles.set(id, updatedArticle);
    return updatedArticle;
  }

  async deleteArticle(id: number): Promise<boolean> {
    return this.articles.delete(id);
  }

  async incrementArticleViews(id: number): Promise<void> {
    const article = this.articles.get(id);
    if (article) {
      article.viewCount += 1;
      this.articles.set(id, article);
    }
  }

  async getMostViewedArticles(language: string, limit: number): Promise<Article[]> {
    return Array.from(this.articles.values())
      .filter(article => article.language === language)
      .sort((a, b) => b.viewCount - a.viewCount)
      .slice(0, limit);
  }

  // Poll methods
  async getAllPolls(language: string): Promise<Poll[]> {
    return Array.from(this.polls.values())
      .filter(poll => poll.language === language)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getPollById(id: number): Promise<Poll | undefined> {
    return this.polls.get(id);
  }

  async createPoll(insertPoll: InsertPoll): Promise<Poll> {
    const id = this.currentPollId++;
    const now = new Date();
    const initialResults: Record<string, number> = {};
    
    // Initialize results with zero for each option
    insertPoll.options.forEach(option => {
      initialResults[option] = 0;
    });
    
    const poll: Poll = { 
      ...insertPoll, 
      id, 
      createdAt: now,
      results: initialResults
    };
    this.polls.set(id, poll);
    return poll;
  }

  async updatePoll(id: number, pollUpdate: Partial<InsertPoll>): Promise<Poll | undefined> {
    const poll = this.polls.get(id);
    if (!poll) return undefined;
    
    const updatedPoll = { ...poll, ...pollUpdate };
    this.polls.set(id, updatedPoll);
    return updatedPoll;
  }

  async deletePoll(id: number): Promise<boolean> {
    return this.polls.delete(id);
  }

  async votePoll(id: number, option: string): Promise<Poll | undefined> {
    const poll = this.polls.get(id);
    if (!poll || !poll.options.includes(option)) return undefined;
    
    const updatedResults = { ...poll.results };
    updatedResults[option] = (updatedResults[option] || 0) + 1;
    
    const updatedPoll = { ...poll, results: updatedResults };
    this.polls.set(id, updatedPoll);
    return updatedPoll;
  }

  // Video methods
  async getAllVideos(language: string): Promise<Video[]> {
    return Array.from(this.videos.values())
      .filter(video => video.language === language)
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  }

  async getVideoById(id: number): Promise<Video | undefined> {
    return this.videos.get(id);
  }

  async createVideo(insertVideo: InsertVideo): Promise<Video> {
    const id = this.currentVideoId++;
    const now = new Date();
    const video: Video = { 
      ...insertVideo, 
      id, 
      publishedAt: now
    };
    this.videos.set(id, video);
    return video;
  }

  async updateVideo(id: number, videoUpdate: Partial<InsertVideo>): Promise<Video | undefined> {
    const video = this.videos.get(id);
    if (!video) return undefined;
    
    const updatedVideo = { ...video, ...videoUpdate };
    this.videos.set(id, updatedVideo);
    return updatedVideo;
  }

  async deleteVideo(id: number): Promise<boolean> {
    return this.videos.delete(id);
  }

  // Stats methods
  async getPopularCategories(language: string): Promise<Record<string, number>> {
    const articles = Array.from(this.articles.values())
      .filter(article => article.language === language);
    
    const categoryCounts: Record<string, number> = {};
    
    articles.forEach(article => {
      categoryCounts[article.category] = (categoryCounts[article.category] || 0) + 1;
    });
    
    return categoryCounts;
  }
}

export const storage = new MemStorage();
