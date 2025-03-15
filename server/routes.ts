import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { insertArticleSchema, insertPollSchema, insertVideoSchema, voteSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);
  
  // === PUBLIC ROUTES ===
  
  // Articles routes
  app.get("/api/articles", async (req, res) => {
    try {
      const language = req.query.language as string;
      const category = req.query.category as string;
      const articles = await storage.getAllArticles(language, category);
      res.json(articles);
    } catch (error) {
      res.status(500).json({ message: "Error fetching articles" });
    }
  });
  
  app.get("/api/articles/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID" });
      }
      
      const article = await storage.getArticleById(id);
      if (!article) {
        return res.status(404).json({ message: "Article not found" });
      }
      
      // Increment view count
      await storage.incrementArticleViews(id);
      
      res.json(article);
    } catch (error) {
      res.status(500).json({ message: "Error fetching article" });
    }
  });
  
  // Polls routes
  app.get("/api/polls", async (req, res) => {
    try {
      const language = req.query.language as string || undefined;
      const polls = await storage.getAllPolls(language || "ht");
      res.json(polls);
    } catch (error) {
      res.status(500).json({ message: "Error fetching polls" });
    }
  });
  
  app.get("/api/polls/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID" });
      }
      
      const poll = await storage.getPollById(id);
      if (!poll) {
        return res.status(404).json({ message: "Poll not found" });
      }
      
      res.json(poll);
    } catch (error) {
      res.status(500).json({ message: "Error fetching poll" });
    }
  });
  
  app.post("/api/polls/vote", async (req, res) => {
    try {
      const validationResult = voteSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ message: "Invalid vote data", errors: validationResult.error.errors });
      }
      
      const { pollId, option } = req.body;
      const updatedPoll = await storage.votePoll(pollId, option);
      
      if (!updatedPoll) {
        return res.status(404).json({ message: "Poll not found or invalid option" });
      }
      
      res.json(updatedPoll);
    } catch (error) {
      res.status(500).json({ message: "Error processing vote" });
    }
  });
  
  // Videos routes
  app.get("/api/videos", async (req, res) => {
    try {
      const language = req.query.language as string || undefined;
      const videos = await storage.getAllVideos(language || "ht");
      res.json(videos);
    } catch (error) {
      res.status(500).json({ message: "Error fetching videos" });
    }
  });
  
  // Stats routes
  app.get("/api/stats/popular-articles", async (req, res) => {
    try {
      const language = req.query.language as string || undefined;
      const limit = parseInt(req.query.limit as string) || 5;
      const articles = await storage.getMostViewedArticles(language || "ht", limit);
      res.json(articles);
    } catch (error) {
      res.status(500).json({ message: "Error fetching popular articles" });
    }
  });
  
  app.get("/api/stats/categories", async (req, res) => {
    try {
      const language = req.query.language as string || undefined;
      const categories = await storage.getPopularCategories(language || "ht");
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Error fetching category stats" });
    }
  });
  
  // === ADMIN ROUTES ===
  
  // For testing purposes, make these routes available without authentication
  // Articles management
  app.post("/api/admin/articles", async (req, res) => {
    try {
      const validationResult = insertArticleSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ message: "Invalid article data", errors: validationResult.error.errors });
      }
      
      const article = await storage.createArticle(req.body);
      res.status(201).json(article);
    } catch (error) {
      res.status(500).json({ message: "Error creating article" });
    }
  });
  
  app.put("/api/admin/articles/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID" });
      }
      
      const validationResult = insertArticleSchema.partial().safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ message: "Invalid article data", errors: validationResult.error.errors });
      }
      
      const updatedArticle = await storage.updateArticle(id, req.body);
      if (!updatedArticle) {
        return res.status(404).json({ message: "Article not found" });
      }
      
      res.json(updatedArticle);
    } catch (error) {
      res.status(500).json({ message: "Error updating article" });
    }
  });
  
  app.delete("/api/admin/articles/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID" });
      }
      
      const success = await storage.deleteArticle(id);
      if (!success) {
        return res.status(404).json({ message: "Article not found" });
      }
      
      res.sendStatus(204);
    } catch (error) {
      res.status(500).json({ message: "Error deleting article" });
    }
  });
  
  // Polls management
  app.post("/api/admin/polls", async (req, res) => {
    try {
      const validationResult = insertPollSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ message: "Invalid poll data", errors: validationResult.error.errors });
      }
      
      const poll = await storage.createPoll(req.body);
      res.status(201).json(poll);
    } catch (error) {
      res.status(500).json({ message: "Error creating poll" });
    }
  });
  
  app.put("/api/admin/polls/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID" });
      }
      
      const validationResult = insertPollSchema.partial().safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ message: "Invalid poll data", errors: validationResult.error.errors });
      }
      
      const updatedPoll = await storage.updatePoll(id, req.body);
      if (!updatedPoll) {
        return res.status(404).json({ message: "Poll not found" });
      }
      
      res.json(updatedPoll);
    } catch (error) {
      res.status(500).json({ message: "Error updating poll" });
    }
  });
  
  app.delete("/api/admin/polls/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID" });
      }
      
      const success = await storage.deletePoll(id);
      if (!success) {
        return res.status(404).json({ message: "Poll not found" });
      }
      
      res.sendStatus(204);
    } catch (error) {
      res.status(500).json({ message: "Error deleting poll" });
    }
  });
  
  // Videos management
  app.post("/api/admin/videos", async (req, res) => {
    try {
      const validationResult = insertVideoSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ message: "Invalid video data", errors: validationResult.error.errors });
      }
      
      const video = await storage.createVideo(req.body);
      res.status(201).json(video);
    } catch (error) {
      res.status(500).json({ message: "Error creating video" });
    }
  });
  
  app.put("/api/admin/videos/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID" });
      }
      
      const validationResult = insertVideoSchema.partial().safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ message: "Invalid video data", errors: validationResult.error.errors });
      }
      
      const updatedVideo = await storage.updateVideo(id, req.body);
      if (!updatedVideo) {
        return res.status(404).json({ message: "Video not found" });
      }
      
      res.json(updatedVideo);
    } catch (error) {
      res.status(500).json({ message: "Error updating video" });
    }
  });
  
  // Categories management
  app.get("/api/admin/categories", async (req, res) => {
    try {
      const language = req.query.language as string || "ht";
      const categories = await storage.getAllCategories(language);
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Error fetching categories" });
    }
  });

  app.post("/api/admin/categories", async (req, res) => {
    try {
      const validationResult = insertCategorySchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ message: "Invalid category data", errors: validationResult.error.errors });
      }
      
      const category = await storage.createCategory(req.body);
      res.status(201).json(category);
    } catch (error) {
      res.status(500).json({ message: "Error creating category" });
    }
  });

  app.post("/api/admin/subcategories", async (req, res) => {
    try {
      const validationResult = insertSubcategorySchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ message: "Invalid subcategory data", errors: validationResult.error.errors });
      }
      
      const subcategory = await storage.createSubcategory(req.body);
      res.status(201).json(subcategory);
    } catch (error) {
      res.status(500).json({ message: "Error creating subcategory" });
    }
  });

  app.delete("/api/admin/categories/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID" });
      }
      
      const success = await storage.deleteCategory(id);
      if (!success) {
        return res.status(404).json({ message: "Category not found" });
      }
      
      res.sendStatus(204);
    } catch (error) {
      res.status(500).json({ message: "Error deleting category" });
    }
  });

  app.delete("/api/admin/subcategories/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID" });
      }
      
      const success = await storage.deleteSubcategory(id);
      if (!success) {
        return res.status(404).json({ message: "Subcategory not found" });
      }
      
      res.sendStatus(204);
    } catch (error) {
      res.status(500).json({ message: "Error deleting subcategory" });
    }
  });

  app.delete("/api/admin/videos/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID" });
      }
      
      const success = await storage.deleteVideo(id);
      if (!success) {
        return res.status(404).json({ message: "Video not found" });
      }
      
      res.sendStatus(204);
    } catch (error) {
      res.status(500).json({ message: "Error deleting video" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
